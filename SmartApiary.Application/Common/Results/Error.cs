// Zajednicki format za uspeh ili gresku (Error).

namespace SmartApiary.Application.Common.Results;

public record Error(string Message, ErrorType Type);
