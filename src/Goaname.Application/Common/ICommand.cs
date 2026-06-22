using MediatR;

namespace Goaname.Application.Common;

[System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1040:Avoid empty interfaces", Justification = "Marker interface for CQRS pattern")]
public interface ICommand<out TResponse> : IRequest<TResponse>;

[System.Diagnostics.CodeAnalysis.SuppressMessage("Design", "CA1040:Avoid empty interfaces", Justification = "Marker interface for CQRS pattern")]
public interface ICommand : ICommand<Unit>;
