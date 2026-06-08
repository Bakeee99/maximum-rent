# Maximum Rent a Car — setup i deploy

Bilingvalni (HR/EN) Next.js 14 sajt za najam vozila: App Router + TypeScript + Tailwind + Framer Motion + Prisma/PostgreSQL (Supabase) + next-intl + next-themes + Resend (email upiti).

Sajt radi na bazi **upita** — nema online plaćanja. Svaki „Izaberi" otvara modal s dvije opcije: (A) email upit kroz `/api/inquiries`, (B) unaprijed popunjen WhatsApp.

---

## 0. Preduslovi

- **Node.js 18.18+ ili 20+** i npm
- **Supabase** projekt (besplatan tier je dovoljan)
- **Resend** nalog — opcionalno; bez API ključa upiti se i dalje spremaju u bazu, samo se ne šalje email
- **GitHub** repo + **Vercel** nalog
- Domena `maximum-rent.com` (kod tebe preko Spaceshipa)

---

## 1. Instalacija

```bash
npm install
```

`postinstall` automatski pokrene `prisma generate`. Ako pukne (npr. offline), ručno: `npx prisma generate`.

---

## 2. Environment varijable

Kopiraj `.env.example` u `.env` i popuni:

```bash
cp .env.example .env
```

| Varijabla | Odakle |
|---|---|
| `DATABASE_URL` | Supabase → Project Settings → Database → **Connection pooling** (port `6543`, sadrži `?pgbouncer=true`). Koristi je aplikacija. |
| `DIRECT_URL` | Supabase → ista stranica, **Direct connection** (port `5432`). Koristi je Prisma za migracije. |
| `RESEND_API_KEY` | resend.com → API Keys. Opcionalno. |
| `INQUIRY_TO_EMAIL` | Gdje stižu upiti (npr. `info@maximum-rent.com`). |
| `INQUIRY_FROM_EMAIL` | Pošiljalac. Mora biti na **verifikovanoj** domeni u Resendu, inače koristi `onboarding@resend.dev` za test. |
| `NEXT_PUBLIC_SITE_URL` | `https://maximum-rent.com` (za metadata/OG). |

> Lozinku za DB stringove uzmeš iz Supabase → Database → **Database password** (ili resetuješ). Pazi na `<ref>` i `<region>` u hostu — Supabase ti da gotov string, samo zamijeni `[YOUR-PASSWORD]`.

---

## 3. Baza

Prvi put kreiraj šemu i ubaci podatke:

```bash
npx prisma migrate dev --name init   # kreira tabele + prisma/migrations/
npx prisma generate                  # (migrate dev to već uradi)
npm run db:seed                       # 6 stvarnih lokacija + demo vozni park
```

`prisma/seed.ts` ubacuje svih 6 poslovnica (Čitluk, Međugorje, Mostar zračna luka, Mostar Vukovarska, Čapljina, Ljubuški) i nekoliko demo auta. Demo aute slobodno obriši/zamijeni stvarnima.

---

## 4. Stvarni podaci (vozni park, slike, logo)

**Vozila** — kroz Prisma Studio:

```bash
npm run db:studio
```

Otvori tabelu `Car`, dodaj/uredi. Bitna polja: `slug` (jedinstven), `brand`, `model`, `title`, `year`, `carClass`, `transmission`, `passengers`, `fuelType`, `emissionClass`. `pricePerDay`/`deposit` su opcionalni (ostavi prazno ako ne želiš prikazivati cijenu). `isFeatured = true` stavlja auto na početnu. `isAvailable = false` ga skriva.

**Slike auta** — polje `images` je niz URL-ova. Dvije opcije:
1. **Supabase Storage** (preporuka): napravi javni bucket `cars`, uploaduj slike, kopiraj javne URL-ove u `images`. Host `*.supabase.co` je već dozvoljen u `next.config.mjs`.
2. Lokalno: stavi u `public/cars/<slug>.jpg` i u `images` upiši `/cars/<slug>.jpg`.

Ako je `images` prazan, kartica prikaže čist fallback — sajt ne puca.

**Logo i favicon** — `public/logo.png` je već postavljen. Dodaj `public/favicon.ico` (layout ga već referencira).

---

## 5. Lokalno pokretanje

```bash
npm run dev
```

→ `http://localhost:3000` (redirect na `/hr`). Provjeri: hero video, pretraga → `/vozila`, „Izaberi" modal (email + WhatsApp), prebacivanje HR/EN i dark/light.

---

## 6. Git

```bash
git init
git add .
git commit -m "Maximum Rent a Car — initial"
git branch -M main
git remote add origin https://github.com/<tvoj-nalog>/maximum-rent.git
git push -u origin main
```

`.gitignore` već isključuje `.env`, `node_modules`, `.next`.

---

## 7. Vercel deploy

1. **vercel.com → Add New → Project → Import** GitHub repo.
2. Framework: **Next.js** (auto-detektovan). Build command ostavi default — `package.json` već radi `prisma generate && next build`.
3. **Environment Variables** — dodaj sve iz `.env` (Production + Preview):
   `DATABASE_URL`, `DIRECT_URL`, `RESEND_API_KEY`, `INQUIRY_TO_EMAIL`, `INQUIRY_FROM_EMAIL`, `NEXT_PUBLIC_SITE_URL`.
4. **Deploy.**

### Migracije na produkciji

- **Ako koristiš isti Supabase projekt** za dev i prod (najjednostavnije za sada): migracije su **već primijenjene** kad si lokalno pokrenuo `migrate dev`. Ništa dodatno.
- **Ako odvojiš prod bazu**: u Vercelu promijeni Build Command u:
  ```
  prisma generate && prisma migrate deploy && next build
  ```
  Tako se migracije automatski primijene na svaki deploy. (Zato je bitno da je `prisma/migrations/` commitovan u git.)

---

## 8. Domena (Spaceship → Vercel)

1. Vercel → Project → **Settings → Domains** → dodaj `maximum-rent.com` i `www.maximum-rent.com`.
2. Vercel ti da DNS zapise. U **Spaceship → Advanced DNS**:
   - apex `maximum-rent.com` → **A** zapis na Vercelov IP (`76.76.21.21`), ili ako Spaceship podržava ALIAS/ANAME na `cname.vercel-dns.com`.
   - `www` → **CNAME** na `cname.vercel-dns.com`.
3. Sačekaj propagaciju; Vercel automatski izda SSL.
4. Postavi primarni domen (preporuka: redirect `www` → apex ili obrnuto, svejedno).

Nakon što domena radi, provjeri da `NEXT_PUBLIC_SITE_URL` u Vercelu odgovara finalnom domenu i redeployaj.

---

## 9. Provjera nakon deploya

- [ ] `/` redirecta na `/hr`, hero video se vrti
- [ ] Pretraga vodi na `/vozila` s tačnim datumima u sažetku
- [ ] „Izaberi" → email upit prolazi (stigne mail na `INQUIRY_TO_EMAIL`) i zapis se vidi u Prisma Studio (`Inquiry`)
- [ ] WhatsApp dugme otvara `wa.me` s popunjenom porukom
- [ ] HR/EN i dark/light rade na svim stranicama
- [ ] č/ć/đ/š/ž se ispravno renderuju (Inter + `latin-ext`)
- [ ] Kontakt stranica prikazuje sve telefone i 6 lokacija

---

## Struktura

```
app/[locale]/            home, vozila, o-nama, poslovna-ponuda, uvjeti-najma, kontakt, 404
app/api/inquiries/       POST → snima upit + šalje email (Resend)
components/              layout (Navbar/Footer/toggleri), home (Hero), reservation, fleet
lib/                     prisma, site-config, car-labels, validations, whatsapp, email, types
messages/                hr.json, en.json
prisma/                  schema.prisma, seed.ts
i18n/                    routing, request, navigation (next-intl)
```

## Česti problemi

- **Slova č/š/ž izgledaju pogrešno** → font mora učitati `latin-ext` (već je tako u `app/[locale]/layout.tsx`).
- **Prisma „Can't reach database"** → provjeri da app koristi **pooled** `DATABASE_URL` (port 6543), a migracije **direct** `DIRECT_URL` (5432).
- **Email se ne šalje** → bez `RESEND_API_KEY` upit se svejedno snimi u bazu; za stvarno slanje verifikuj domenu u Resendu i postavi `INQUIRY_FROM_EMAIL` na tu domenu.
- **Build na Vercelu pukne na Prismi** → osiguraj da je build command `prisma generate && next build` i da su DB env varijable postavljene.
