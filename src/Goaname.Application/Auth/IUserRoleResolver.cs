namespace Goaname.Application.Auth;

public interface IUserRoleResolver
{
    public IReadOnlyList<string> Resolve(string tenantId, string email);
}
