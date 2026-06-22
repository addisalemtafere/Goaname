using FluentValidation;
using Goaname.Application.Common.Validation;
using MediatR;

namespace Goaname.Application.Common.Behaviors;

public sealed class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    private readonly IEnumerable<IValidator<TRequest>> _validators = validators ?? throw new ArgumentNullException(nameof(validators));

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNull(next);

        await ValidationRunner.ValidateAndThrowAsync(_validators, request, cancellationToken).ConfigureAwait(false);

        return await next(cancellationToken).ConfigureAwait(false);
    }
}
