namespace SmartApiary.Application.Features.Apiaries;

public static class ApiaryImageConstraints
{
    public const long MaxFileSizeBytes = 5 * 1024 * 1024;

    private static readonly HashSet<string> SupportedExtensions =
        new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

    private static readonly HashSet<string> SupportedContentTypes =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

    private static readonly HashSet<string> SupportedFormatNames =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "JPEG",
            "PNG",
            "WEBP"
        };

    public static bool HasSupportedExtension(string? fileName)
    {
        return !string.IsNullOrWhiteSpace(fileName)
            && SupportedExtensions.Contains(Path.GetExtension(fileName));
    }

    public static bool HasSupportedContentType(string? contentType)
    {
        return !string.IsNullOrWhiteSpace(contentType)
            && SupportedContentTypes.Contains(contentType);
    }

    public static bool IsSupportedFormat(string? formatName)
    {
        return !string.IsNullOrWhiteSpace(formatName)
            && SupportedFormatNames.Contains(formatName);
    }
}
