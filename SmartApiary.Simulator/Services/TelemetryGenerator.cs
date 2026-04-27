using SmartApiary.Simulator.Models;

namespace SmartApiary.Simulator.Services;

public sealed class TelemetryGenerator
{
    private readonly SimulatorMode _mode;
    private readonly Random _random = new();
    private bool _weightDropApplied;
    private int _readingNumber;
    private double _batteryPercent;
    private double _humidityPercent;
    private double _temperatureCelsius;
    private double _weightKg;

    public TelemetryGenerator(SimulatorMode mode)
    {
        _mode = mode;
        _weightKg = mode == SimulatorMode.WeightDrop
            ? NextDouble(45, 58)
            : NextDouble(35, 56);
        _humidityPercent = NextDouble(45, 70);
        _temperatureCelsius = NextDouble(22, 33);
        _batteryPercent = mode == SimulatorMode.LowBattery
            ? NextDouble(8, 14)
            : NextDouble(80, 96);
    }

    public TelemetryPayload Generate(string deviceAccessToken, DateTime timestamp)
    {
        _readingNumber++;

        MoveWeight();
        MoveHumidity();
        MoveTemperature();
        MoveBattery();

        return new TelemetryPayload(
            deviceAccessToken,
            Round(_weightKg, 1),
            Round(_humidityPercent, 0),
            Round(_temperatureCelsius, 1),
            Round(_batteryPercent, 0),
            timestamp);
    }

    private void MoveWeight()
    {
        if (_mode == SimulatorMode.WeightDrop && !_weightDropApplied && _readingNumber >= 3)
        {
            _weightKg = Math.Max(30, _weightKg - NextDouble(11, 15));
            _weightDropApplied = true;
            return;
        }

        _weightKg = Clamp(_weightKg + NextDouble(-0.25, 0.25), 30, 60);
    }

    private void MoveHumidity()
    {
        _humidityPercent = Clamp(_humidityPercent + NextDouble(-1.2, 1.2), 40, 80);
    }

    private void MoveTemperature()
    {
        _temperatureCelsius = Clamp(_temperatureCelsius + NextDouble(-0.4, 0.4), 20, 38);
    }

    private void MoveBattery()
    {
        var drain = _mode == SimulatorMode.LowBattery
            ? NextDouble(0.05, 0.2)
            : NextDouble(0.01, 0.08);

        _batteryPercent = Clamp(_batteryPercent - drain, 0, _mode == SimulatorMode.LowBattery ? 14 : 100);
    }

    private double NextDouble(double min, double max)
    {
        return min + (_random.NextDouble() * (max - min));
    }

    private static double Clamp(double value, double min, double max)
    {
        return Math.Min(Math.Max(value, min), max);
    }

    private static double Round(double value, int digits)
    {
        return Math.Round(value, digits, MidpointRounding.AwayFromZero);
    }
}
