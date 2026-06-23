namespace Goaname.Domain.Exceptions;

public sealed class NotFoundException : Exception
{
    public NotFoundException()
        : base("The requested resource was not found.")
    {
    }

    public NotFoundException(string message)
        : base(message)
    {
    }

    public NotFoundException(string message, Exception innerException)
        : base(message, innerException)
    {
    }

    public NotFoundException(string resourceName, object key)
        : base($"{resourceName} '{key}' was not found.")
    {
        ResourceName = resourceName;
        Key = key;
    }

    public string? ResourceName { get; }

    public object? Key { get; }
}
