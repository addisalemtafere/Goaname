namespace Goaname.Application.Common.Mappings;

internal static class UserLabelFormatting
{
    public static string FormatTraderLabel(Guid userId)
    {
        var hex = userId.ToString("N");
        return $"0x{hex[..2]}…{hex[^2..]}";
    }

    public static string ResolveDisplayName(string? displayName, Guid userId) =>
        string.IsNullOrWhiteSpace(displayName) ? FormatTraderLabel(userId) : displayName;
}
