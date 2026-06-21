// Ovde namestamo sve sto Web API koristi i na kraju ga pokrecemo.
// Vezbe 6 - Web API, JWT i SignalR.

using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using SmartApiary.Application.Behaviors;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Repositories;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Domain.Exceptions;
using SmartApiary.Infrastructure.Extensions;
using SmartApiary.Infrastructure.Services;
using SmartApiary.WebApi.BackgroundServices;
using SmartApiary.WebApi.Hubs;
using SmartApiary.WebApi.Routing;
using SmartApiary.WebApi.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json.Serialization;

// Odavde krecemo sa podesavanjem Web API-ja.
var builder = WebApplication.CreateBuilder(args);
var applicationAssembly = typeof(Result).Assembly;
var webApiConfig = builder.Configuration.GetSection("WebApi");
var corsPolicyName = webApiConfig.GetValue<string>("CorsPolicyName") ?? "AllowFrontend";
var reactOrigin = webApiConfig.GetValue<string>("ReactOrigin") ?? "http://localhost:5173";
var telemetryHubRoute = webApiConfig.GetValue<string>("TelemetryHubRoute") ?? "/hubs/telemetry";

// Enum saljemo kao tekst, npr. "Beekeeper", da JSON bude citljiviji.
builder.Services.AddControllers(options =>
{
    options.Conventions.Add(new RouteTokenTransformerConvention(new LowercaseParameterTransformer()));
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddEndpointsApiExplorer();

// Swagger koristimo za rucno probavanje ruta, ukljucujuci i JWT rute.
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = JwtBearerDefaults.AuthenticationScheme,
        BearerFormat = "JWT"
    });

    options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer", document),
            new List<string>()
        }
    });
});
// Pustamo React sa njegovog porta da zove backend.
builder.Services.AddCors(options =>
{
    options.AddPolicy(corsPolicyName, policy =>
    {
        policy
            .WithOrigins(reactOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});
// SignalR salje novu telemetriju bez refresh-a stranice.
builder.Services.AddSignalR();

// MediatR povezuje command/query sa odgovarajucim handlerom.
builder.Services.AddMediatR(configuration =>
{
    configuration.RegisterServicesFromAssembly(applicationAssembly);
});

builder.Services.AddValidatorsFromAssembly(applicationAssembly);
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(RoleAuthorizationBehavior<,>));

// Ovde ubacujemo SQL, Azure Storage i ostale servise.
builder.Services.AddInfrastructure(builder.Configuration);

// Vezbe 6: worker cita Queue i salje podatke preko SignalR-a.
builder.Services.AddHostedService<TelemetryWorker>();

// JWT podesavanja uzimamo iz konfiguracije/User Secrets.
var jwtOptions = builder.Configuration
    .GetSection(JwtOptions.SectionName)
    .Get<JwtOptions>() ?? new JwtOptions();

if (string.IsNullOrWhiteSpace(jwtOptions.Secret))
{
    throw new InvalidOperationException(
        "Jwt:Secret is not configured. Set it with User Secrets or an environment variable.");
}

// Osnovne provere JWT tokena.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.IncludeErrorDetails = builder.Environment.IsDevelopment();
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Secret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            // SignalR token iz browsera stize kroz query parametar.
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"].ToString();
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrWhiteSpace(accessToken)
                    && path.StartsWithSegments(telemetryHubRoute))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            },
            // Proveravamo i da korisnik jos postoji, da je aktivan i da mu uloga nije promenjena.
            OnTokenValidated = async context =>
            {
                var principal = context.Principal;
                var userIdClaim = principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? principal?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                    ?? principal?.FindFirstValue("UserId")
                    ?? principal?.FindFirstValue("userId");

                if (!Guid.TryParse(userIdClaim, out var userId) || userId == Guid.Empty)
                {
                    context.Fail("JWT token does not contain a valid user id.");
                    return;
                }

                var userRepository = context.HttpContext.RequestServices.GetRequiredService<IUserRepository>();
                var user = await userRepository.GetByIdAsync(userId, context.HttpContext.RequestAborted);
                if (user is null || !user.IsActive)
                {
                    context.Fail("User account is not active.");
                    return;
                }

                var tokenRole = principal?.FindFirstValue(ClaimTypes.Role)
                    ?? principal?.FindFirstValue("role")
                    ?? principal?.FindFirstValue("Role");

                if (!string.Equals(tokenRole, user.Role.ToString(), StringComparison.OrdinalIgnoreCase))
                {
                    context.Fail("JWT token role no longer matches the user account.");
                }
            }
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// Lokalno pravimo pocetnog admina.
await app.SeedDevelopmentAdminAsync();

// Zajednicka obrada gresaka.
app.UseExceptionHandler(exceptionApp =>
{
    exceptionApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        if (exception is null)
        {
            return;
        }

        var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
        var (statusCode, message) = MapException(exception);

        if (statusCode == StatusCodes.Status500InternalServerError)
        {
            logger.LogError(exception, "Unhandled exception occurred.");
        }
        else
        {
            logger.LogWarning(exception, "Handled exception occurred.");
        }

        context.Response.StatusCode = statusCode;
        await context.Response.WriteAsJsonAsync(new { message });
    });
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors(corsPolicyName);

app.UseAuthentication();
app.UseAuthorization();

// SignalR ruta i obicne API rute.
app.MapHub<TelemetryHub>(telemetryHubRoute);
app.MapControllers();

app.Run();

static (int StatusCode, string Message) MapException(Exception exception)
{
    // Poznate greske mapiramo na 4xx, ostalo ide na 500.
    return exception switch
    {
        DomainException domainException => (StatusCodes.Status400BadRequest, domainException.Message),
        InvalidDataException invalidDataException => (StatusCodes.Status400BadRequest, invalidDataException.Message),
        KeyNotFoundException notFoundException => (StatusCodes.Status404NotFound, notFoundException.Message),
        _ when IsNotFoundException(exception) => (StatusCodes.Status404NotFound, exception.Message),
        _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
    };
}

static bool IsNotFoundException(Exception exception)
{
    return exception.GetType().Name.Contains("NotFound", StringComparison.OrdinalIgnoreCase);
}
