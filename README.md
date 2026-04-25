# SmartApiary

Pocetna struktura .NET solution-a za SmartApiary, organizovana po Clean Architecture principima.

## Projekti

- `SmartApiary.Domain` - unutrasnji sloj za domenske modele, value object-e, dogadjaje, enum-e i zajednicke domenske koncepte. Ne referencira nijedan drugi projekat.
- `SmartApiary.Application` - aplikacioni sloj za use case logiku, DTO modele, interfejse, feature-e i behavior-e. Referencira samo `SmartApiary.Domain`.
- `SmartApiary.Infrastructure` - spoljasnji sloj za tehnicke implementacije kao sto su persistence, repozitorijumi, servisi, storage, identity i ekstenzije. Referencira `SmartApiary.Application` i `SmartApiary.Domain`.
- `SmartApiary.WebApi` - ASP.NET Core Web API ulazna tacka. Referencira `SmartApiary.Application` i `SmartApiary.Domain`; trenutno ne referencira `SmartApiary.Infrastructure`.
- `SmartApiary.Functions` - Azure Functions ulazna tacka za procese kao sto su registracija uredjaja, aktivacija uredjaja i ingestija telemetrije. Referencira `SmartApiary.Application` i `SmartApiary.Domain`.
- `SmartApiary.Simulator` - Console App namenjen simulaciji IoT pametne vage.

## Pravilo zavisnosti

Zavisnosti idu ka unutra:

- `Application -> Domain`
- `Infrastructure -> Application + Domain`
- `WebApi -> Application + Domain`
- `Functions -> Application + Domain`
- `Simulator` trenutno nema projektne reference.

`Domain` ostaje cist i nezavisan od tehnickih detalja.
