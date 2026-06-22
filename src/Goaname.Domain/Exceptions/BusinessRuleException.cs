namespace Goaname.Domain.Exceptions;

public sealed class BusinessRuleException : Exception
{
    public BusinessRuleException()
        : base("A business rule was violated.")
    {
    }

    public BusinessRuleException(string message)
        : base(message)
    {
    }

    public BusinessRuleException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
