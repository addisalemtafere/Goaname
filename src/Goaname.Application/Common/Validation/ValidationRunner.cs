using FluentValidation;
using FluentValidation.Results;

namespace Goaname.Application.Common.Validation;

public static class ValidationRunner
{
    public static async Task ValidateAndThrowAsync<T>(
        IValidator<T> validator,
        T instance,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(validator);
        ArgumentNullException.ThrowIfNull(instance);

        var result = await validator.ValidateAsync(instance, cancellationToken).ConfigureAwait(false);
        ThrowIfInvalid(result);
    }

    public static async Task ValidateAndThrowAsync<T>(
        IEnumerable<IValidator<T>> validators,
        T instance,
        CancellationToken cancellationToken = default)
    {
        ArgumentNullException.ThrowIfNull(validators);
        ArgumentNullException.ThrowIfNull(instance);

        var validatorList = validators as IReadOnlyList<IValidator<T>> ?? validators.ToList();
        if (validatorList.Count == 0)
        {
            return;
        }

        var results = await Task.WhenAll(
            validatorList.Select(v => v.ValidateAsync(instance, cancellationToken))).ConfigureAwait(false);

        var failures = results.SelectMany(r => r.Errors).Where(f => f is not null).ToList();
        if (failures.Count == 0)
        {
            return;
        }

        ThrowIfInvalid(failures);
    }

    private static void ThrowIfInvalid(ValidationResult result)
    {
        if (result.IsValid)
        {
            return;
        }

        ThrowIfInvalid(result.Errors);
    }

    private static void ThrowIfInvalid(IEnumerable<ValidationFailure> failures)
    {
        var errors = failures
            .GroupBy(f => f.PropertyName, f => f.ErrorMessage)
            .ToDictionary(g => g.Key, g => g.ToArray());

        throw new Goaname.Domain.Exceptions.ValidationException(errors);
    }
}
