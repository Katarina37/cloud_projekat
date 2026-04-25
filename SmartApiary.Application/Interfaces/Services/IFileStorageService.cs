namespace SmartApiary.Application.Interfaces.Services;

public interface IFileStorageService
{
    Task<string> UploadAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);

    Task DeleteAsync(string fileUrl, CancellationToken cancellationToken = default);
}
