using FluentValidation;

namespace SmartApiary.Application.Features.Crops.AddCrop;

public sealed class AddCropCommandValidator : AbstractValidator<AddCropCommand>
{
    public AddCropCommandValidator()
    {
        RuleFor(command => command.ParcelId)
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
