using SmartApiary.Domain.Enums;
using SmartApiary.Domain.Exceptions;
using SmartApiary.Domain.Models;

namespace SmartApiary.Domain.Tests;

public class DeviceTests
{
    [Fact]
    public void Pair_WhenDeviceIsAlreadyPaired_ThrowsAndKeepsOriginalPairing()
    {
        var device = new Device(Guid.NewGuid(), "SA-2026-12345");
        device.Pair("550e8400-e29b-41d4-a716-446655440000", "access-token");

        var originalDeviceIdentifier = device.DeviceIdentifier;
        var originalAccessToken = device.AccessToken;
        var originalPairedAt = device.PairedAt;

        Assert.Throws<DomainException>(() =>
            device.Pair("650e8400-e29b-41d4-a716-446655440000", "new-access-token"));

        Assert.Equal(DeviceStatus.Paired, device.Status);
        Assert.Equal(originalDeviceIdentifier, device.DeviceIdentifier);
        Assert.Equal(originalAccessToken, device.AccessToken);
        Assert.Equal(originalPairedAt, device.PairedAt);
    }
}
