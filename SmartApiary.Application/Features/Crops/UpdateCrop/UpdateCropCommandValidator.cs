using FluentValidation;

namespace SmartApiary.Application.Features.Crops.UpdateCrop;

public sealed class UpdateCropCommandValidator : AbstractValidator<UpdateCropCommand>
{
    public UpdateCropCommandValidator()
    {
        RuleFor(command => command.CropId)
            .NotEmpty();

        RuleFor(command => command.Name)
            .NotEmpty();

        RuleFor(command => command.ExpectedBloomingEnd)
            .GreaterThanOrEqualTo(command => command.ExpectedBloomingStart);

        RuleFor(command => command.Area)
            .GreaterThanOrEqualTo(0d)
            .When(command => command.Area.HasValue);
    }
}
