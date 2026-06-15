// Konzolni simulator koji pravi lazna merenja i salje ih Function-u.
// Specifikacija - simulacija IoT uredjaja.
// Vezbe 2 - konzolni simulator i HTTP slanje.

using System.Globalization;
using SmartApiary.Simulator.Configuration;
using SmartApiary.Simulator.Models;
using SmartApiary.Simulator.Services;

// Prvo ucitamo podesavanja iz appsettings.json.
var options = SimulatorOptionsLoader.Load();

if (!options.TryGetTelemetryEndpoint(out var telemetryEndpoint))
{
    Console.WriteLine($"FunctionsBaseUrl nije validan za telemetriju: {options.FunctionsBaseUrl}");
    return;
}

if (!options.TryGetActivationEndpoint(out var activationEndpoint))
{
    Console.WriteLine($"FunctionsBaseUrl nije validan za aktivaciju: {options.FunctionsBaseUrl}");
    return;
}

// Biramo normalan rad, slabu bateriju ili pad tezine.
var mode = SelectMode(args);

using var httpClient = new HttpClient();
using var cancellationTokenSource = new CancellationTokenSource();
var activationClient = new DeviceActivationClient(httpClient, activationEndpoint);
var deviceAccessToken = options.DeviceAccessToken;

// Bez tokena prvo aktiviramo uredjaj.
if (string.IsNullOrWhiteSpace(deviceAccessToken))
{
    if (!options.HasActivationDetails)
    {
        Console.WriteLine("DeviceAccessToken nije podesen.");
        Console.WriteLine("Unesite DeviceSerialNumber i DeviceIdentifier u appsettings.json ili environment variables za aktivaciju.");
        return;
    }

    try
    {
        var activationResponse = await activationClient.ActivateAsync(
            options.DeviceSerialNumber,
            options.DeviceIdentifier,
            cancellationTokenSource.Token);
        deviceAccessToken = activationResponse?.DeviceAccessToken ?? string.Empty;

        if (string.IsNullOrWhiteSpace(deviceAccessToken))
        {
            Console.WriteLine("Aktivacija nije uspela ili nije vratila DeviceAccessToken.");
            return;
        }

        if (!string.IsNullOrWhiteSpace(activationResponse?.Warning))
        {
            Console.WriteLine($"Upozorenje: {activationResponse.Warning}");
        }

        Console.WriteLine("Uredjaj je aktiviran.");
    }
    catch (OperationCanceledException) when (cancellationTokenSource.Token.IsCancellationRequested)
    {
        return;
    }
    catch (HttpRequestException exception)
    {
        Console.WriteLine($"Greska pri aktivaciji: {exception.Message}");
        return;
    }
}
// Generator pravi merenje, sender ga salje.
var generator = new TelemetryGenerator(mode);
var sender = new TelemetrySender(httpClient, telemetryEndpoint);

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

// Vezbe 2: saljemo novo merenje u krug sve do Ctrl+C.
while (!cancellationTokenSource.Token.IsCancellationRequested)
{
    var payload = generator.Generate(DateTime.UtcNow);

    Console.WriteLine($"Saljem: {FormatPayload(payload)}");

    try
    {
        var result = await sender.SendAsync(
            payload,
            deviceAccessToken,
            cancellationTokenSource.Token);
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
