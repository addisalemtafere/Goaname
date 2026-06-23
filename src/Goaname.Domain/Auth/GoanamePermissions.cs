namespace Goaname.Domain.Auth;

/// <summary>
/// Application permission names (ABP-style dotted hierarchy).
/// </summary>
[System.Diagnostics.CodeAnalysis.SuppressMessage(
    "Design",
    "CA1034:DoNotNestGenericTypesInGenericTypes",
    Justification = "ABP-style nested permission groups.")]
public static class GoanamePermissions
{
    public static class Platform
    {
        public const string GroupName = "Platform";

        public const string Default = "Goaname.Platform";
        public const string Tenants = Default + ".Tenants";
        public const string Roles = Default + ".Roles";
        public const string Clients = Default + ".Clients";
        public const string Settings = Default + ".Settings";
        public const string Dashboard = Default + ".Dashboard";
    }

    public static class TenantAdmin
    {
        public const string GroupName = "Tenant administration";

        public const string Default = "Goaname.TenantAdmin";
        public const string Overview = Default + ".Overview";
        public const string Markets = Default + ".Markets";
        public const string Categories = Default + ".Categories";
        public const string Users = Default + ".Users";
        public const string UsersAdjustWallet = Users + ".AdjustWallet";
        public const string UsersSetKyc = Users + ".SetKyc";
        public const string UsersGrantAdmin = Users + ".GrantAdmin";
        public const string Settings = Default + ".Settings";
    }

    public static class User
    {
        public const string GroupName = "Player";

        public const string Default = "Goaname.User";
        public const string Bets = Default + ".Bets";
        public const string Profile = Default + ".Profile";
        public const string Wallet = Default + ".Wallet";
    }
}
