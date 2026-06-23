// Jedan mali deo simulatora: SimulatorModeParser.

namespace SmartApiary.Simulator.Models;

public static class SimulatorModeParser
{
    public static bool TryParse(string? value, out SimulatorMode mode)
    {
        mode = SimulatorMode.Normal;

        if (string.IsNullOrWhiteSpace(value))
        {
            return false;
        }

        var normalizedValue = value.Trim().Replace("_", "-", StringComparison.Ordinal);

        switch (normalizedValue.ToLowerInvariant())
        {
            case "1":
            case "normal":
            case "normal-mode":
                mode = SimulatorMode.Normal;
                return true;
            case "2":
            case "low-battery":
            case "low-battery-mode":
                mode = SimulatorMode.LowBattery;
                return true;
            case "3":
            case "weight-drop":
            case "weight-drop-mode":
                mode = SimulatorMode.WeightDrop;
                return true;
            default:
                return false;
        }
    }

    public static string ToDisplayName(this SimulatorMode mode)
    {
        return mode switch
        {
            SimulatorMode.LowBattery => "low battery mode",
            SimulatorMode.WeightDrop => "weight drop mode",
            SimulatorMode.Demo => "demo mode",
            _ => "normal mode"
        };
    }
}
