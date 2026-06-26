@AGENTS.md

# csreq

CouchSurfing couch request mektubu yazan Next.js uygulaması.

```
npm run dev -- --port 3001
```

## Mektup Kuralları

**Karakter limiti:** Üretilen mektup (request) **asla 980 karakteri geçmemeli.** API'de sunucu tarafı zorunlu kısaltma var (doğal cümle sonu bulur). Prompt'ta da `CRITICAL: STRICTLY under 980 characters` şeklinde belirtilmiş.

**Humanizer (`productivity/humanizer` skill uygulanır):** Mektuplar AI yazı kalıplarından arındırılmış olmalı. Kurallar `lib/prompts.ts`'teki `LETTER_RULES` dizisinde tanımlı. Özetle:
- AI vocabulary yasak: "vibrant", "pivotal", "showcasing", "fostering", "tapestry", "testament", "crucial", "seamless", "groundbreaking" vb.
- Em dash (—) yasak
- Üçlü liste (rule of three) yasak
- "Not only... but..." parallelism yasak
- Şişirilmiş, tanıtım dili yasak — somut, spesifik ifadeler kullanılmalı
- Genel olumlu kapanış yasak — gerçek, spesifik bir soruyla bitmeli
- Cümle uzunluğu ve yapısı doğal şekilde çeşitlendirilmeli

## Kritik Notlar (koddan anlaşılmayan)

**Gmail SMTP:** App Password Google hesap şifresi değiştiğinde iptal olur → `myaccount.google.com/apppasswords` yenile → sunucu restart.

**Turbopack CSS cache:** Yeni `@keyframes` eklenince `rm -rf .next` + restart gerekir.

**Modal/overlay → createPortal zorunlu:** `body > * { z-index: 2 }` stacking context oluşturduğundan `position: fixed` beklendiği gibi çalışmaz. Tüm modal ve overlay bileşenleri `createPortal(el, document.body)` ile render edilmeli.

**`backdrop-filter` + dropdown:** `.card`'ın `backdrop-filter`'ı stacking context kurar; içinde dropdown olan bileşenler (ör. StayDates takvimi) de createPortal + `getBoundingClientRect` kullanmalı.

**Safari OAuth:** ITP cookie bloklar → `pending_sessions` tablosu + `POST /api/auth/exchange` same-site pattern. `useRef` ile pending token `router.replace`'dan önce capture edilmeli.

**SQLite migration:** `ALTER TABLE ADD COLUMN ... UNIQUE` desteklenmiyor → önce column, sonra ayrı `CREATE UNIQUE INDEX`.

**`better-sqlite3`:** `next.config.ts`'te `serverExternalPackages: ["better-sqlite3"]` olmadan çalışmaz.

**Login zorunlu değil:** Misafirler mektup üretebilir. Profil `localStorage("csreq_guest_profile")`'da tutulur. Giriş yapılmış + email doğrulanmamış kullanıcılar için `VerifyWall` erken return yapıyor (sayfa içeriği render edilmez).

**`UserProfileSetup` `onClose`:** Her zaman geçirilmeli — profil olmasa da modal kapatılabilmeli.

**SpotlightCard + dropdown:** SpotlightCard içinde dropdown varsa z-index sorunu çıkar, kullanma.
