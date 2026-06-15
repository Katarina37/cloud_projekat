// Ovde namestamo servise koje koriste Azure Functions.
// Vezbe 2 - Azure Functions i dependency injection.

using FluentValidation;
using MediatR;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using SmartApiary.Application.Behaviors;
using SmartApiary.Application.Common.Results;
using SmartApiary.Application.Interfaces.Services;
using SmartApiary.Functions.Services;
using SmartApiary.Infrastructure.Extensions;

var applicationAssembly = typeof(Result).Assembly;

// Functions ima svoj proces, pa ovde posebno dodajemo zavisnosti.
var host = new HostBuilder()
    .ConfigureFunctionsWorkerDefaults()
    .ConfigureServices((context, services) =>
    {
        // SQL, Storage i ostali servisi koje funkcije koriste.
        services.AddInfrastructure(context.Configuration);
        services.AddSingleton<ICurrentUserService, FunctionCurrentUserService>();
        services.AddMediatR(configuration =>
        {
            configuration.RegisterServicesFromAssembly(applicationAssembly);
        });
        services.AddValidatorsFromAssembly(applicationAssembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
    })
    .Build();

host.Run();
