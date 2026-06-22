using System.Text.RegularExpressions;
using Goaname.Domain.Constants;

namespace Goaname.Domain.Rules;

public static partial class PayoutAccountRules
{
    [GeneratedRegex(@"^\+?254\d{9}$")]
    private static partial Regex KenyaMobileMoneyPattern();

    public static string NormalizeProvider(string provider)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(provider);

        if (string.Equals(provider, PayoutProviders.MobileMoney, StringComparison.OrdinalIgnoreCase))
        {
            return PayoutProviders.MobileMoney;
        }

        if (string.Equals(provider, PayoutProviders.BankAccount, StringComparison.OrdinalIgnoreCase))
        {
            return PayoutProviders.BankAccount;
        }

        return provider.Trim();
    }

    public static void Validate(string provider, string accountId)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(provider);
        ArgumentException.ThrowIfNullOrWhiteSpace(accountId);

        if (string.Equals(provider, PayoutProviders.MobileMoney, StringComparison.OrdinalIgnoreCase) &&
            !KenyaMobileMoneyPattern().IsMatch(accountId.Trim()))
        {
            throw new ArgumentException(
                "Mobile money account must be a valid phone number (e.g. +254712345678).",
                nameof(accountId));
        }
    }
}
