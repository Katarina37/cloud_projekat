using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.Extensions.Configuration;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Processing;
using SmartApiary.Application.Features.Apiaries;
using SmartApiary.Application.Interfaces.Services;

namespace SmartApiary.Infrastructure.Services;

public sealed class BlobStorageService : IFileStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private const string ContainerName = "apiary-images";
    private const int ThumbnailMaxWidth = 320;
    private const int ThumbnailMaxHeight = 240;

    public BlobStorageService(IConfiguration configuration)
    {
        var connectionString = configuration["AzureStorage:ConnectionString"]
            ?? throw new InvalidOperationException("AzureStorage:ConnectionString is not configured.");

        _blobServiceClient = new BlobServiceClient(connectionString);
    }

    public async Task<string> UploadAsync(
        Stream fileStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(ContainerName);
        await containerClient.CreateIfNotExistsAsync(PublicAccessType.Blob, cancellationToken: cancellationToken);

        var blobName = $"{Guid.NewGuid()}_{fileName}";
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.UploadAsync(
            fileStream,
            new BlobHttpHeaders { ContentType = contentType },
            cancellationToken: cancellationToken);

        return blobClient.Uri.ToString();
    }

    public async Task<(string ImageUrl, string ThumbnailUrl)> UploadImageWithThumbnailAsync(
        Stream imageStream,
        string fileName,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        await using var originalStream = new MemoryStream();
        await imageStream.CopyToAsync(originalStream, cancellationToken);
        originalStream.Position = 0;

        Image image;

        try
        {
            image = await Image.LoadAsync(originalStream, cancellationToken);
        }
        catch (ImageFormatException exception)
        {
            throw new InvalidDataException("Uploaded file is not a valid supported image.", exception);
        }

        using (image)
        {
            if (!ApiaryImageConstraints.IsSupportedFormat(image.Metadata.DecodedImageFormat?.Name))
            {
                throw new InvalidDataException("Supported image formats are JPG, PNG and WEBP.");
            }

            image.Mutate(context => context.AutoOrient());

            if (image.Width > ThumbnailMaxWidth || image.Height > ThumbnailMaxHeight)
            {
                image.Mutate(context => context.Resize(new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(ThumbnailMaxWidth, ThumbnailMaxHeight)
                }));
            }

            await using var thumbnailStream = new MemoryStream();
            await image.SaveAsync(thumbnailStream, new PngEncoder(), cancellationToken);

            var safeFileName = Path.GetFileName(fileName);
            originalStream.Position = 0;
            var imageUrl = await UploadAsync(
                originalStream,
                safeFileName,
                contentType,
                cancellationToken);

            try
            {
                thumbnailStream.Position = 0;
                var thumbnailFileName = $"thumb_{Path.GetFileNameWithoutExtension(safeFileName)}.png";
                var thumbnailUrl = await UploadAsync(
                    thumbnailStream,
                    thumbnailFileName,
                    "image/png",
                    cancellationToken);

                return (imageUrl, thumbnailUrl);
            }
            catch
            {
                await DeleteAsync(imageUrl, cancellationToken);
                throw;
            }
        }
    }

    public async Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default)
    {
        var uri = new Uri(fileUrl);
        var blobName = Uri.UnescapeDataString(uri.Segments.Last());

        var containerClient = _blobServiceClient.GetBlobContainerClient(ContainerName);
        var blobClient = containerClient.GetBlobClient(blobName);

        await blobClient.DeleteIfExistsAsync(cancellationToken: cancellationToken);
    }
}
