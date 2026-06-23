// Pravi mali skup istorijskih merenja za prezentaciju grafika.

using SmartApiary.Simulator.Models;

namespace SmartApiary.Simulator.Services;

public sealed class DemoTelemetryGenerator
{
    private static readonly double[] DailyWeightDeltasKg =
    [
        0.8,
        -0.4,
        1.1,
        0.5,
        -0.7,
        0.9
    ];

    public IReadOnlyList<TelemetryPayload> Generate(DateTime utcNow)
    {
        var currentTime = utcNow.ToUniversalTime();
        var firstDay = currentTime.Date.AddDays(-DailyWeightDeltasKg.Length);
        var readings = new List<TelemetryPayload>();
        var morningWeightKg = 42d;

        for (var dayIndex = 0; dayIndex < DailyWeightDeltasKg.Length; dayIndex++)
        {
            var day = firstDay.AddDays(dayIndex);
            var dailyDeltaKg = DailyWeightDeltasKg[dayIndex];
            var temperatureCelsius = 22d + dayIndex;
            var humidityPercent = 66d - dayIndex;
            var batteryPercent = 94d - dayIndex;

            readings.Add(CreatePayload(
                day,
                8,
                15,
                morningWeightKg,
                humidityPercent,
                temperatureCelsius,
                batteryPercent));

            readings.Add(CreatePayload(
                day,
                12,
                0,
                morningWeightKg + (dailyDeltaKg * 0.35),
                humidityPercent - 3,
                temperatureCelsius + 3,
                batteryPercent));

            readings.Add(CreatePayload(
                day,
                16,
                0,
                morningWeightKg + (dailyDeltaKg * 0.7),
                humidityPercent - 5,
                temperatureCelsius + 5,
                batteryPercent - 1));

            readings.Add(CreatePayload(
                day,
                19,
                45,
                morningWeightKg + dailyDeltaKg,
                humidityPercent - 1,
                temperatureCelsius + 1,
                batteryPercent - 1));

            morningWeightKg += dailyDeltaKg + 0.2;
        }

        // Poslednje merenje koristi trenutno vreme da kartice prikazu aktuelan status.
        readings.Add(new TelemetryPayload(
            Round(morningWeightKg, 1),
            60,
            25,
            87,
            currentTime));

        return readings;
    }

    private static TelemetryPayload CreatePayload(
        DateTime day,
        int hour,
        int minute,
        double weightKg,
        double humidityPercent,
        double temperatureCelsius,
        double batteryPercent)
    {
        var timestamp = DateTime.SpecifyKind(
            day.AddHours(hour).AddMinutes(minute),
            DateTimeKind.Utc);

        return new TelemetryPayload(
            Round(weightKg, 1),
            Round(humidityPercent, 0),
            Round(temperatureCelsius, 1),
            Round(batteryPercent, 0),
            timestamp);
    }

    private static double Round(double value, int digits)
    {
        return Math.Round(value, digits, MidpointRounding.AwayFromZero);
    }
}
