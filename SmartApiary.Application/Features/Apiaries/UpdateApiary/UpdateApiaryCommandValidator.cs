// Provera podataka pre nego sto menjamo pcelinjak.

using FluentValidation;
using SmartApiary.Application.Features.Apiaries;

namespace SmartApiary.Application.Features.Apiaries.UpdateApiary;

public sealed class UpdateApiaryCommandValidator : AbstractValidator<UpdateApiaryCommand>
{
    public UpdateApiaryCommandValidator()
    {
        RuleFor(command => command.ApiaryId)
            .NotEmpty();

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
