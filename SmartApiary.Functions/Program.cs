using FluentValidation;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartApiary.Application.Behaviors;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Infrastructure.Extensions;

var applicationAssembly = typeof(Result).Assembly;

var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        services.AddInfrastructure(context.Configuration);
        services.AddScoped<ICurrentUserService, NullCurrentUserService>();
        services.AddMediatR(configuration =>
        {
            configuration.RegisterServicesFromAssembly(applicationAssembly);
        });
        services.AddValidatorsFromAssembly(applicationAssembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(RoleAuthorizationBehavior<,>));
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    })
    .Build();

host.Run();

public sealed class NullCurrentUserService : ICurrentUserService
{
    public Guid? UserId => null;
    public string? Email => null;
    public string? Role => null;
    public bool IsAuthenticated => false;
}
