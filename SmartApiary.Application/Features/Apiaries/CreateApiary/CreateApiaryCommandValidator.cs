// Provera podataka pre nego sto dodajemo pcelinjak.

using FluentValidation;
using SmartApiary.Application.Features.Apiaries;

namespace SmartApiary.Application.Features.Apiaries.CreateApiary;

public sealed class CreateApiaryCommandValidator : AbstractValidator<CreateApiaryCommand>
{
    public CreateApiaryCommandValidator()
    {
        RuleFor(command => command.Name)
            .NotEmpty();

        RuleFor(command => command.Latitude)
            .InclusiveBetween(-90, 90);

        RuleFor(command => command.Longitude)
            .InclusiveBetween(-180, 180);

        When(command => command.ImageStream is not null, () =>
        {
            RuleFor(command => command.ImageSizeInBytes)
                .InclusiveBetween(1, ApiaryImageConstraints.MaxFileSizeBytes)
                .WithMessage("Image must not be empty or larger than 5 MB.");

            RuleFor(command => command.ImageFileName)
                .Must(ApiaryImageConstraints.HasSupportedExtension)
                .WithMessage("Supported image formats are JPG, PNG and WEBP.");

            RuleFor(command => command.ImageContentType)
                .Must(ApiaryImageConstraints.HasSupportedContentType)
                .WithMessage("Supported image formats are JPG, PNG and WEBP.");
        });
    }
}
