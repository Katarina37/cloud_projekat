// Greska koja nastane kada neko poslovno pravilo nije ispunjeno.

namespace SmartApiary.Domain.Exceptions;

public sealed class DomainException : InvalidOperationException
{
    public DomainException(string message)
        : base(message)
    {
    }
}
