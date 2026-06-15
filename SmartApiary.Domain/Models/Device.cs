// Podaci i osnovna pravila za Device.

using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Exceptions;

namespace SmartApiary.Domain.Models;

public class Device
{
    public Device(Guid hiveId, string serialNumber)
    {
        if (hiveId == Guid.Empty)
        {
            throw new ArgumentException("Hive id cannot be empty.", nameof(hiveId));
        }

        Id = Guid.NewGuid();
        HiveId = hiveId;
        SerialNumber = RequireNotEmpty(serialNumber, nameof(serialNumber));
        Status = DeviceStatus.Unpaired;
        CreatedAt = DateTime.UtcNow;
    }

    public Guid Id { get; private set; }

    public Guid HiveId { get; private set; }

    public string SerialNumber { get; private set; }

    public string? DeviceIdentifier { get; private set; }

    public string? AccessToken { get; private set; }

    public DeviceStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }

    public DateTime? PairedAt { get; private set; }

    public bool BatteryAlertSent { get; private set; }

    public void Pair(string deviceIdentifier, string accessToken)
    {
        if (Status == DeviceStatus.Paired)
        {
            throw new DomainException("Device is already paired.");
        }

        DeviceIdentifier = RequireNotEmpty(deviceIdentifier, nameof(deviceIdentifier));
        AccessToken = RequireNotEmpty(accessToken, nameof(accessToken));
        Status = DeviceStatus.Paired;
        PairedAt = DateTime.UtcNow;
    }

    private static string RequireNotEmpty(string value, string parameterName)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new ArgumentException("Value cannot be empty.", parameterName);
        }

        return value;
    }

    public void MarkBatteryAlertSent()
    {
        BatteryAlertSent = true;
    }

    public void ResetBatteryAlert()
    {
        BatteryAlertSent = false;
    }
}
