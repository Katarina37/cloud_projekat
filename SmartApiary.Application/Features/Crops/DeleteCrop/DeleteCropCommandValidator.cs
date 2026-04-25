using FluentValidation;

namespace SmartApiary.Application.Features.Crops.DeleteCrop;

public sealed class DeleteCropCommandValidator : AbstractValidator<DeleteCropCommand>
{
    public DeleteCropCommandValidator()
    {
        RuleFor(command => command.CropId)
            .NotEmpty();
    }
}
