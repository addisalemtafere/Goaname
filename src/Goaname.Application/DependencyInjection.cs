using FluentValidation;
using Goaname.Application.Common.Behaviors;
using Goaname.Application.Features.Admin.RoleRegistry;
using Goaname.Application.Features.Markets;
using Goaname.Application.Features.Markets.Settlement;
using Goaname.Application.Features.Tenants.InitializeTenant;
using Goaname.Application.Features.Users;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Goaname.Application;

public static class ApplicationServiceRegistration
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        ArgumentNullException.ThrowIfNull(services);

        services.AddValidatorsFromAssembly(typeof(ApplicationServiceRegistration).Assembly);

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssemblyContaining<InitializeTenantCommandHandler>();
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        services.AddScoped<Transactions.IBetPlacementTransactionRunner, Transactions.BetPlacementTransactionRunner>();
        services.AddScoped<Transactions.ISettlementTransactionRunner, Transactions.SettlementTransactionRunner>();
        services.AddScoped<IMarketSettlementService, MarketSettlementService>();
        services.AddScoped<IMarketGrainAccessor, MarketGrainAccessor>();
        services.AddScoped<IUserDisplayNameResolver, UserDisplayNameResolver>();
        services.AddScoped<RoleRegistryService>();

        return services;
    }
}
