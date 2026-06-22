using Goaname.Application.Common;
using Goaname.Contracts.Activity;

namespace Goaname.Application.Features.Activity.ListActivity;

public sealed record ListActivityQuery(string TenantId, int Limit = 50)
    : IQuery<ActivityFeedDto>;
