using System.Globalization;
using SmartApiary.Simulator.Configuration;
using SmartApiary.Simulator.Models;
using SmartApiary.Simulator.Services;

var options = SimulatorOptionsLoader.Load();

if (!options.HasDeviceAccessToken)
{
    Console.WriteLine("DeviceAccessToken nije podesen.");
    Console.WriteLine("Prvo registrujte i aktivirajte uredjaj, zatim upisite token u appsettings.json ili SMARTAPIARY_DEVICE_ACCESS_TOKEN.");
    return;
}

if (!options.TryGetTelemetryEndpoint(out var telemetryEndpoint))
{
    Console.WriteLine($"ApiBaseUrl nije validan: {options.ApiBaseUrl}");
    return;
}

var mode = SelectMode(args);

using var httpClient = new HttpClient();
var generator = new TelemetryGenerator(mode);
var sender = new TelemetrySender(httpClient, telemetryEndpoint);
using var cancellationTokenSource = new CancellationTokenSource();

Console.CancelKeyPress += (_, eventArgs) =>
{
    eventArgs.Cancel = true;
    cancellationTokenSource.Cancel();
    Console.WriteLine("Zaustavljanje simulatora...");
};

Console.WriteLine("SmartApiary simulator je pokrenut.");
Console.WriteLine($"Endpoint: {telemetryEndpoint}");
Console.WriteLine($"Mode: {mode.ToDisplayName()}");
Console.WriteLine($"Interval: {options.NormalizedIntervalSeconds}s");
Console.WriteLine("Prekid: Ctrl+C");
Console.WriteLine();

while (!cancellationTokenSource.Token.IsCancellationRequested)
{
    var payload = generator.Generate(options.DeviceAccessToken, DateTime.UtcNow);

    Console.WriteLine($"Saljem: {FormatPayload(payload)}");

    try
    {
        var result = await sender.SendAsync(payload, cancellationTokenSource.Token);
        Console.WriteLine($"API odgovor: {(int)result.StatusCode} {result.ReasonPhrase}");

        if (!string.IsNullOrWhiteSpace(result.Body))
        {
            Console.WriteLine(result.Body);
        }
    }
    catch (OperationCanceledException) when (cancellationTokenSource.Token.IsCancellationRequested)
    {
        break;
    }
    catch (HttpRequestException exception)
    {
        Console.WriteLine($"Greska pri slanju: {exception.Message}");
    }

    Console.WriteLine();

    try
    {
        await Task.Delay(options.Interval, cancellationTokenSource.Token);
    }
    catch (OperationCanceledException) when (cancellationTokenSource.Token.IsCancellationRequested)
    {
        break;
    }
}

static SimulatorMode SelectMode(string[] args)
{
    var modeArgument = GetModeArgument(args);

    if (!string.IsNullOrWhiteSpace(modeArgument) &&
        SimulatorModeParser.TryParse(modeArgument, out var modeFromArgument))
    {
        return modeFromArgument;
    }

    if (!string.IsNullOrWhiteSpace(modeArgument))
    {
        Console.WriteLine($"Nepoznat mode '{modeArgument}', izaberite jedan od ponudjenih.");
    }

    Console.WriteLine("Izaberite test scenario:");
    Console.WriteLine("1. normal mode");
    Console.WriteLine("2. low battery mode");
    Console.WriteLine("3. weight drop mode");
    Console.Write("Izbor [1]: ");

    var choice = Console.ReadLine();

    return choice?.Trim() switch
    {
        "2" => SimulatorMode.LowBattery,
        "3" => SimulatorMode.WeightDrop,
        _ => SimulatorMode.Normal
    };
}

static string? GetModeArgument(string[] args)
{
    for (var index = 0; index < args.Length; index++)
    {
        var argument = args[index];

        if (argument.Equals("--mode", StringComparison.OrdinalIgnoreCase) ||
            argument.Equals("-m", StringComparison.OrdinalIgnoreCase))
        {
            return index + 1 < args.Length ? args[index + 1] : null;
        }

        if (argument.StartsWith("--mode=", StringComparison.OrdinalIgnoreCase))
        {
            return argument["--mode=".Length..];
        }

        if (SimulatorModeParser.TryParse(argument, out _))
        {
            return argument;
        }
    }

    return null;
}

static string FormatPayload(TelemetryPayload payload)
{
    return string.Join(
        ", ",
        $"timestamp={payload.Timestamp:O}",
        $"weightKg={payload.WeightKg.ToString("F1", CultureInfo.InvariantCulture)}",
        $"humidityPercent={payload.HumidityPercent.ToString("F0", CultureInfo.InvariantCulture)}",
        $"temperatureCelsius={payload.TemperatureCelsius.ToString("F1", CultureInfo.InvariantCulture)}",
        $"batteryPercent={payload.BatteryPercent.ToString("F0", CultureInfo.InvariantCulture)}");
}
