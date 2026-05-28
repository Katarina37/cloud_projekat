# SmartApiary

SmartApiary je .NET/React projekat organizovan po Clean Architecture principima.

## Projekti

- `SmartApiary.Domain` - domenski modeli, value object-i, enum-i i domenska pravila. Ne referencira nijedan drugi projekat.
- `SmartApiary.Application` - use case logika, DTO modeli, interfejsi, MediatR feature-i i validacioni behavior-i. Referencira `SmartApiary.Domain`.
- `SmartApiary.Infrastructure` - EF Core persistence, repozitorijumi i tehnicki servisi. Referencira `SmartApiary.Application` i `SmartApiary.Domain`.
- `SmartApiary.WebApi` - ASP.NET Core Web API ulazna tacka. Referencira `SmartApiary.Application` i `SmartApiary.Infrastructure`.
- `SmartApiary.Functions` - Azure Functions host. Referencira `SmartApiary.Application` i `SmartApiary.Domain`.
- `SmartApiary.Simulator` - Console App za slanje simulirane telemetrije pametne vage.
- `SmartApiary.UI` - React/Vite frontend.
- `SmartApiary.Domain.Tests` - domen testovi za osnovna pravila entiteta.

## Auth

API koristi JWT Bearer autentifikaciju. Nakon prijave frontend cuva token i salje ga kroz:

```text
Authorization: Bearer <jwt-token>
```

Za rucno testiranje Swagger/API poziva prvo se prijaviti preko `/api/auth/login`, zatim uneti JWT u Swagger Authorize dijalog kao Bearer token.

U development okruzenju WebApi automatski obezbijedi aktivan admin nalog ako u bazi nema aktivnog admina:

- email: `admin@smartapiary.local`
- lozinka: `Admin123!`

Korisnici se dalje kreiraju iz admin ekrana. Novi korisnik prvo otvara aktivacioni link, postavlja lozinku, pa se tek onda prijavljuje. Email servis šalje aktivacione i reset linkove preko SendGrid-a kada je podešen `SendGrid:ApiKey` u konfiguraciji; bez SendGrid podešavanja u development okruženju linkovi se ispisuju u WebApi konzoli/logu.

## Pravilo zavisnosti

Zavisnosti idu ka unutra:

- `Application -> Domain`
- `Infrastructure -> Application + Domain`
- `WebApi -> Application + Infrastructure`
- `Functions -> Application + Domain`

`Domain` ostaje cist i nezavisan od tehnickih detalja.
