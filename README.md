# SmartApiary

SmartApiary je studentski projekat za upravljanje pčelinjacima, košnicama, parcelama, uređajima i telemetrijom.

## 1. Naš tim

- **Tim 13**
- **Tema projekta:** SA
- **Asistent:** Sandra

| Ime i prezime | Broj indeksa | Grupa | Kontakt |
|---|---:|---:|---|
| Slaviša Simić | PR55/2022 | 4 | slavisasimic3@gmail.com |
| Andrijana Stojković | PR42/2022 | 3 | andrijanastojkovic10@gmail.com |
| Jovana Mišić | PR36/2022 | 3 | jovanam0015@gmail.com |
| Nikolina Vasić | PR77/2022 | 1 | vasic.nikolina14@gmail.com |
| Milica Ćurčić | PR11/2022 | 1 | milica.curcic12@gmail.com |
| Katarina Luzić | PR62/2022 | 4 | katarinaluzic37@gmail.com |

## 2. Kako pokrenuti projekat

Projekat se sastoji iz tri dela:

- `SmartApiary.WebApi` je glavni backend.
- `SmartApiary.Functions` sadrži Azure Functions.
- `SmartApiary.UI` je frontend.

WebApi i Functions pokrećemo iz Visual Studio-a, a frontend iz posebnog terminala.

### 2.1. Šta treba instalirati

Pre prvog pokretanja potrebno je instalirati:

1. **Visual Studio 2022**, sa uključenim stavkama:
   - ASP.NET and web development
   - Azure development
   - .NET 9 SDK
2. **SQL Server Express** sa instancom `SQLEXPRESS`.
3. **Node.js 22.12 ili noviji**.

Kada se projekat preuzme sa GitHub-a, otvoriti fajl `SmartApiary.sln` u Visual Studio-u.

### 2.2. Podešavanja koja se ne preuzimaju sa GitHub-a

Ova podešavanja se čuvaju lokalno i zato ih svako mora dodati na svom računaru.

U Visual Studio-u otvoriti:

`View -> Terminal`

Proveriti da je terminal otvoren u glavnom folderu projekta, odnosno u folderu u kojem se nalazi `SmartApiary.sln`, pa redom pokrenuti:

```powershell
dotnet user-secrets set "Jwt:Secret" "SmartApiary-Development-Secret-Change-Me-2026" --project .\SmartApiary.WebApi\SmartApiary.WebApi.csproj
dotnet user-secrets set "DevelopmentAdmin:Password" "Admin123!" --project .\SmartApiary.WebApi\SmartApiary.WebApi.csproj
dotnet user-secrets set "OpenWeather:ApiKey" "0958890521e6db7bab0f3e436bcf8746" --project .\SmartApiary.WebApi\SmartApiary.WebApi.csproj
dotnet user-secrets set "SendGrid:ApiKey" "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" --project .\SmartApiary.WebApi\SmartApiary.WebApi.csproj
dotnet user-secrets set "Email:FromAddress" "slavisasimic3@gmail.com" --project .\SmartApiary.WebApi\SmartApiary.WebApi.csproj
dotnet user-secrets set "Email:FromName" "SmartApiary" --project .\SmartApiary.WebApi\SmartApiary.WebApi.csproj
```

`Jwt:Secret` i administratorska lozinka su potrebni za normalno pokretanje i prijavu.

Eksterni API servisi:

- **OpenWeatherMap API** koristi se na stranici za tretiranje useva. Proverava prognozu za lokaciju parcele, upozorava na kišu ili vetar jači od 5 m/s i čuva vremenske uslove u digitalnom kartonu tretiranja.
- **SendGrid API** koristi se za slanje mejlova sa linkovima za aktivaciju naloga i promenu zaboravljene lozinke.

Zatim u folderu `SmartApiary.Functions`, pored fajla `host.json`, napraviti novi fajl pod imenom `local.settings.json` i u njega staviti:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "ConnectionStrings:DefaultConnection": "Server=.\\SQLEXPRESS;Database=SmartApiaryDb;Trusted_Connection=True;TrustServerCertificate=True",
    "AzureStorage:ConnectionString": "UseDevelopmentStorage=true"
  }
}
```

Ovaj fajl se takođe ne šalje na GitHub, pa ga svako pravi samo jednom na svom računaru.

### 2.3. Instalacija i pokretanje Azurite-a

Azurite nam lokalno menja Azure Storage. Potreban je za slike, redove poruka i telemetriju.

Instalira se samo prvi put. U terminalu pokrenuti:

```powershell
npm install -g azurite
```

Posle instalacije, iz glavnog foldera projekta pokrenuti:

```powershell
azurite --location azurite-data --debug azurite-debug.log
```

Terminal u kojem je Azurite pokrenut treba ostaviti otvoren sve vreme dok koristimo aplikaciju. Kada u terminalu piše da Blob, Queue i Table servisi slušaju zahteve, Azurite je spreman.

### 2.4. Kreiranje baze

Ovaj korak se radi samo prvi put, ili kada neko doda novu migraciju.

U Visual Studio-u otvoriti:

`Tools -> NuGet Package Manager -> Package Manager Console`

Zatim pokrenuti:

```powershell
Update-Database -Project SmartApiary.Infrastructure -StartupProject SmartApiary.WebApi
```

Time se u lokalnom SQL Server Express-u kreira baza `SmartApiaryDb`.

### 2.5. Podešavanje Startup projekata u Visual Studio-u

1. U `Solution Explorer` prozoru kliknuti desnim klikom na solution `SmartApiary`.
2. Izabrati `Configure Startup Projects`.
3. Izabrati `Multiple startup projects`.
4. Podesiti:

| Projekat | Action |
|---|---|
| `SmartApiary.WebApi` | Start |
| `SmartApiary.Functions` | Start |
| svi ostali projekti | None |

Kliknuti `Apply`, zatim `OK`.

Pre pokretanja proveriti da je Azurite i dalje uključen, pa pritisnuti `F5` ili zeleno dugme `Start`.

Kada se projekti pokrenu:

- WebApi radi na `https://localhost:7035`
- Swagger je na `https://localhost:7035/swagger`
- Azure Functions rade na `http://localhost:7271`

Ako Visual Studio pita da li verujemo lokalnom HTTPS sertifikatu, izabrati `Yes`.

`SmartApiary.Simulator` se ne stavlja među startup projekte. On se pokreće posebno samo kada želimo da šaljemo lažne podatke sa uređaja.

### 2.6. Pokretanje frontenda

Frontend se pokreće u novom terminalu. Backend, Functions i Azurite treba ostaviti uključene.

Iz glavnog foldera projekta pokrenuti:

```powershell
cd .\SmartApiary.UI
npm install
npm run dev
```

`npm install` je obavezan samo prvi put ili kada se promene frontend paketi. Posle toga je uglavnom dovoljno pokrenuti samo:

```powershell
npm run dev
```

Frontend će biti dostupan na:

`http://localhost:5173`

Za lokalno pokretanje nije potrebno praviti `.env` fajl, jer su adrese backend-a i Functions već podešene u projektu.

### Redosled svakog sledećeg pokretanja

Kada je sve jednom instalirano i podešeno, sledeći put je dovoljno:

1. Pokrenuti Azurite i ostaviti njegov terminal otvoren.
2. Otvoriti `SmartApiary.sln` i pritisnuti `F5`.
3. U drugom terminalu ući u `SmartApiary.UI` i pokrenuti `npm run dev`.
4. Otvoriti `http://localhost:5173`.

## 3. Kako izgleda tok prijave u aplikaciju

Kod nas korisnik ne pravi sam nalog preko klasične registracije.

1. Prvo se administrator prijavljuje sa:

   - email: `admin@smartapiary.local`
   - lozinka: `Admin123!`

2. Administrator na stranici za korisnike kreira novi nalog i bira njegovu ulogu.
3. Sistem napravi aktivacioni token koji važi 24 sata i pošalje korisniku link na mejl.
4. Korisnik otvara link iz mejla. Link ga vodi na stranicu `/activate`, a token je već popunjen.
5. Korisnik postavlja svoju lozinku i time aktivira nalog.
6. Posle aktivacije korisnik ide na login stranicu i prijavljuje se svojim mejlom i novom lozinkom.
7. Nakon uspešne prijave backend vraća JWT token. Frontend ga čuva i šalje uz naredne zahteve, tako da sistem zna ko je prijavljen i koju ulogu ima.

Znači, token koji stigne na mejl služi za **prvu aktivaciju naloga**, a posle toga se korisnik normalno prijavljuje mejlom i lozinkom.

Uloge u aplikaciji su:

- `Admin` upravlja korisnicima.
- `Beekeeper` upravlja pčelinjacima, košnicama, uređajima i telemetrijom.
- `Farmer` upravlja parcelama, kulturama i tretiranjima.

Ako korisnik zaboravi lozinku, na login stranici bira opciju za zaboravljenu lozinku. Na mejl dobija novi link sa tokenom za promenu lozinke. Taj token važi jedan sat.

## Ako nešto ne radi

- Ako se WebApi ne pokrene, proveriti da li su dodati `Jwt:Secret` i `DevelopmentAdmin:Password`.
- Ako Functions prijavljuje grešku za storage, proveriti da li Azurite radi i da li postoji `SmartApiary.Functions/local.settings.json`.
- Ako baza ne postoji, ponovo pokrenuti `Update-Database`.
- Ako frontend ne može da pozove backend zbog HTTPS sertifikata, u terminalu pokrenuti `dotnet dev-certs https --trust`, pa ponovo pokrenuti backend i browser.
- Ako mejl ne stigne, proveriti WebApi terminal. Aktivacioni token i link se ispisuju i u logu, pa se nalog može aktivirati i bez primljenog mejla.
- Ako komanda `azurite` nije prepoznata posle instalacije, zatvoriti terminal, otvoriti novi i pokušati ponovo.
