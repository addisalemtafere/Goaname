namespace Goaname.Application.Auth;

public interface IPermissionChecker
{
    public IReadOnlyList<string> GetPermissions(string tenantId, string email);

    public bool IsGranted(string tenantId, string email, string permission);
}
