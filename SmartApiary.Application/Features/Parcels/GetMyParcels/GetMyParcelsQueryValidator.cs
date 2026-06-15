// Provera podataka pre nego sto ucitavamo parcele prijavljenog farmera.

using FluentValidation;

namespace SmartApiary.Application.Features.Parcels.GetMyParcels;

public sealed class GetMyParcelsQueryValidator : AbstractValidator<GetMyParcelsQuery>
{
}
