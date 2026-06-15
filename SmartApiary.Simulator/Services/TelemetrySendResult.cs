// Jedan mali deo simulatora: TelemetrySendResult.

using System.Net;

namespace SmartApiary.Simulator.Services;

public sealed record TelemetrySendResult(
    HttpStatusCode StatusCode,
    string? ReasonPhrase,
    string Body);
