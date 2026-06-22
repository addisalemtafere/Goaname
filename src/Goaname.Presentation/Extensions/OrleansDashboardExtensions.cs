using Goaname.Presentation.Configuration;
using Orleans.Dashboard;

namespace Goaname.Presentation.Extensions;

internal static class OrleansDashboardExtensions
{
    public static WebApplication MapGoanameOrleansDashboard(this WebApplication app)
    {
        ArgumentNullException.ThrowIfNull(app);

        var options = app.Configuration
            .GetSection(OrleansOptions.SectionName)
            .Get<OrleansOptions>() ?? new OrleansOptions();

        if (!options.Dashboard.Enabled)
        {
            return app;
        }

        var dashboard = app.MapOrleansDashboard(routePrefix: options.Dashboard.RoutePrefix);

        if (options.Dashboard.RequireAuthorization)
        {
            dashboard.RequireAuthorization(GoanamePolicies.OrleansDashboard);
        }

        return app;
    }
}
