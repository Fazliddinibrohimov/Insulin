# CHANGELOG — Doza sayti yangilanishi

Sana: 2026-07-17

## Nima qo'shildi

### 1. Yangi mahsulot rasmlari (9 ta)
`assets/img/taomlar/` papkasiga qo'shildi — barchasi mavjud konventsiyaga mos
400px kenglikdagi WebP formatida optimallashtirilgan (4.3–26 KB):
`anor.webp`, `nok.webp`, `qulupnay.webp`, `orik.webp`, `qatiq.webp`,
`tvorog.webp`, `pishloq.webp`, `smetana.webp`, `muzqaymoq.webp`.

Rasmlarning **orqa foni shaffof qilingan** (mavjud mahsulot rasmlari kabi) —
tungi rejimda ham oq to'rtburchaksiz, toza ko'rinadi.

> Eslatma: "Sutli mahsulotlar" papkasidagi `Sut.png` ataylab o'tkazib yuborildi —
> topshiriqdagi 9 talik ro'yxatda "Sut" mahsuloti yo'q. Kerak bo'lsa, keyinroq
> xuddi shu usulda qo'shish mumkin.

### 2. Taomlar bazasiga 9 ta yangi mahsulot
`assets/app.js` dagi `TAOMLAR` massiviga qo'shildi:

| Mahsulot | Turkum | O'rta porsiya |
|---|---|---|
| Anor | Mevalar | ≈25 g |
| Nok | Mevalar | ≈20 g |
| Qulupnay | Mevalar | ≈10 g |
| O'rik | Mevalar | ≈15 g |
| Qatiq | Sut mahsulotlari | ≈8 g |
| Tvorog | Sut mahsulotlari | ≈3 g |
| Pishloq | Sut mahsulotlari | ≈1 g |
| Smetana | Sut mahsulotlari | ≈1 g |
| Muzqaymoq | Sut mahsulotlari | ≈21 g |

- Har biriga kichik/o'rta/katta porsiya qiymatlari berildi (o'rta porsiya topshiriq jadvaliga mos).
- RU/EN tarjimalari `TAOM_TARJIMA` va yangi porsiya nomlari `PORS_TARJIMA` ga qo'shildi.
- **Barcha yangi qiymatlar shifokor tahlilidan o'tgan** (dastlabki TODO belgilar olib tashlangan).

### 3. Taomlar bazasi turkumlarga bo'lindi
- Modal ichida, karta gridi ustida gorizontal **chip-filter qatori** paydo bo'ldi:
  Hammasi / Taomlar / Non mahsulotlari / Ichimliklar / Mevalar / Sut mahsulotlari / Shirinliklar.
- Mavjud karta dizayni (rasm + nom + gramm) va savat mantig'i o'zgarmagan —
  filter faqat ko'rsatiladigan kartalarni cheklaydi.
- Chip yorliqlari uch tilda tarjima qilingan, tungi rejimga moslangan.

### 4. Profil bo'limida Telegram kanal kartasi
- Auth kartasi ostida Telegram ikonkali, saytning karta uslubiga (border-radius,
  soya, ranglar) mos yangi karta; bosilganda kanal yangi tabda ochiladi.
- Matnlar uch tilda (`tg_t`, `tg_s` kalitlari).

### 5. Profil rasmi yuklash (Firebase Storage)
- Kirilgan holatda avatarga (kamera belgisi bilan) bosilsa fayl tanlash oynasi ochiladi.
- Validatsiya: faqat JPG/PNG/WebP, maksimal 5 MB — xato bo'lsa tushunarli xabar (3 tilda).
- Tanlangandan keyin avatar doirasida **oldindan ko'rish**, so'ng «Rasmni saqlash» /
  «Bekor qilish» tugmalari.
- Rasm `avatars/{uid}/profil` yo'liga yuklanadi, URL Firestore'dagi `users/{uid}`
  hujjatining `photoURL` maydonida saqlanadi — sahifa yangilanganda ham tiklanadi.
- Google orqali kirganlarda, o'z rasmi yuklanmagan bo'lsa, Google profil rasmi ko'rsatiladi.
- Yangi fayl: **`storage.rules`** — Storage xavfsizlik qoidalari (faqat egasi yozadi,
  5 MB va rasm formatlari cheklovi server tomonda ham).

### 6. Bilim bo'limi dizayni asosiy tizimga moslandi
Faqat CSS qatlami o'zgardi (kontent, maqolalar, modal mantig'i o'z holicha):
- Playfair Display (serif) → **Baloo 2** (saytning sarlavha shrifti);
- bej palitra (#F6F4EF, #3E6B64 teal) → asosiy tokenlar (`--karta`, `--chiziq`,
  `--kok`, `--kok-toq`, `--radius`, `--soya`);
- kartalarga saytning standart soyasi va 20px radius berildi;
- «muhim» bloklari saytning ogohlantirish uslubiga (`--zar-fon`/`--zar`) o'tkazildi;
- tungi rejim ranglari asosiy tizim bilan birlashtirildi.

## O'zgartirilgan / yangi fayllar

| Fayl | Holat |
|---|---|
| `index.html` | o'zgartirildi — turkum chiplar CSS+HTML, Telegram karta, avatar UI, Bilim CSS, `firebase-storage-compat.js` skripti |
| `assets/app.js` | o'zgartirildi — 9 mahsulot, turkumlar+filter, tarjimalar, avatar yuklash mantig'i |
| `assets/img/taomlar/*.webp` | +9 yangi rasm |
| `storage.rules` | **yangi** — Firebase Storage qoidalari |
| `CHANGELOG.md` | **yangi** — ushbu fayl |

## Tasdiqlangan

- ✅ Telegram havolasi (`https://t.me/dozainsulin_uz`) — egasi tomonidan tasdiqlangan.
- ✅ 9 ta yangi mahsulotning uglevod qiymatlari — shifokor tahlilidan o'tgan.

## ⚠️ Ishga tushirishdan OLDIN o'zingiz to'ldirishingiz kerak

1. **Firebase Storage'ni yoqing** — Firebase Console → Build → Storage → «Get started»
   (loyihada hali yoqilmagan bo'lsa). So'ng `storage.rules` faylini joylang:
   Console'dagi Storage → Rules bo'limiga nusxalash yoki `firebase deploy --only storage`.
2. RU/EN tarjimalarni bir ko'zdan kechiring — ayniqsa «Qatiq» (RU: «Катык»,
   EN: «Qatiq (drinking yogurt)») kabi milliy mahsulot nomlari.

---

# TEZLIK OPTIMIZATSIYASI

Sana: 2026-07-18

Cloudflare Web Analytics (RUM) ko'rsatgan sekin LCP (P99 ~16s) muammosini hal qilish
uchun `doza_performance_prompt.md` topshirig'i bo'yicha bajarilgan ishlar. «Oldin»
ustuni — optimizatsiyadan oldingi holat (baseline: `doza-sayt_8`).

## 1-bosqich — 🔴 Fon rasmini LCP yo'lidan chiqarish ✅

`fon.webp` avval CSS `background` orqali kech yuklanardi. Endi `<head>`da:
```html
<link rel="preload" as="image" href="assets/img/fon.webp" fetchpriority="high">
```
Brauzer rasmni HTML parse boshidayoq, yuqori ustuvorlik bilan yuklaydi. Vizual
natija bir xil (CSS `background` ham saqlanib qoldi — pozitsiyalash o'zgarmadi).

## 2-bosqich — 🔴 Rasmlarni siqish ✅

| Fayl | Oldin | Keyin | Kamayish |
|---|---|---|---|
| `maskot/sayt_yuklanish.webp` | 417 KB | 9.8 KB | **−97.6%** (animatsiya → statik) |
| `fon.webp` | 88 KB | 19.6 KB | −77.7% |
| `dasturxon.webp` | 152 KB | 61.6 KB | −59.5% |
| `kosa_osh.webp` | 124 KB | 59.6 KB | −51.8% |
| `maskot/sayt_xafa.webp` | 139 KB | 103 KB | −25.4% (animatsiya saqlangan) |
| `maskot/sayt_xursand.webp` | 94 KB | 70 KB | −25.5% (animatsiya saqlangan) |
| `maskot/sayt_och.webp` | 115 KB | 92 KB | −20.4% (animatsiya saqlangan) |
| `kosa_bosh.webp` | 48 KB | 36.4 KB | −25.0% |

`assets/img/` jami (yuklanadigan, ishlatilmagan zaxira nusxasiz):
**≈ 2.09 MB → ≈ 1.16 MB (−44%)**.

### 3 ta kayfiyat maskotini siqish (animatsiya saqlab) — libwebp bilan

`sayt_och/xafa/xursand.webp` — 22–23 kadrli **animatsiyali, shaffof WebP** fayllar.
Bu muhitda avval webp vositalari yo'q edi; Google'ning rasmiy **libwebp 1.5.0**
(`img2webp`/`cwebp`/`webpmux`/`anim_dump`) arxivi yuklab olinib ishlatildi (ish
tugagach o'chirildi).

**Quvur (pipeline):** `anim_dump` → har bir kadrni PNG'ga ajratish → `cwebp -q 45
-alpha_q 55 -m 6` bilan kadrma-kadr siqish → `webpmux` bilan asl davomiylik, loop
va dispose/blend'ni saqlab qayta yig'ish. Kadrlar soni (23/22/22), har bir kadr
davomiyligi (jumladan 12-kadrning maxsus 500 ms'i) va cheksiz loop **aynan
saqlandi**.

**Nega 20–30 KB maqsadiga yetib bo'lmadi (fizik cheklov):** har bir kadrning
**shaffoflik (alpha) kanali** libwebp'da yo'qotishsiz saqlanadi (~2 KB/kadr).
23 kadr × ~2 KB = ~46 KB — bu faqat alpha uchun eng past chegara. Tungi rejim
uchun shaffoflik shart, shuning uchun fonni «yopishtirib» (flatten) alphadan voz
kechib bo'lmaydi. Demak 20–30 KB faqat statik rasm bilan mumkin edi — lekin siz
animatsiyani saqlashni tanladingiz.

**Sifat nazorati (obyektiv):** har bir kadr asl vs yangi holda, real ko'rsatiladigan
o'lchamga (118px) kichraytirilib, oq (kunduzgi karta) va to'q (tungi karta) fon
ustida kompozit qilib solishtirildi. O'rtacha piksel xatosi (MAE) **255 dan atigi
~2.2–2.7** — ko'z ilg'aydigan chegaradan (≈3–5) past, ya'ni **sezilarli sifat
pasayishi yo'q**. (Diqqat: `webpmux`'da dastlab noto'g'ri blend/dispose bayrog'i
«arvoh izlar» bergan edi — dispose=background + `-b` bilan tuzatildi.)

## 3-bosqich — 🔴 Inline CSS'ni tashqi faylga chiqarish ✅

48 KB CSS `index.html` ichidagi `<style>` tegidan `assets/style.css` (manba) ga
ko'chirildi va `<link rel="stylesheet">` orqali ulandi. Endi CSS alohida cache
qilinadi. **`index.html`: 75.5 KB → 27.8 KB (−63%)**.

## 4-bosqich — 🟠 Firebase skriptlari ✅ (1-qadam) / ⏸️ (2-qadam asoslab qoldirildi)

- **1-qadam (bajarildi):** 4 ta `firebase-*-compat.js` skriptining har biriga `defer`
  qo'shildi. Endi ular render-blocking emas; `defer` tartibni saqlaganchun `app.js`
  Firebase'dan keyin ishga tushishi kafolatlanadi.
- **2-qadam — modular SDK'ga (v9+) o'tish: ataylab qoldirildi.** Sabab: `app.js`da
  Firebase juda chuqur va keng ishlatilgan — `firebase.auth()` (signIn/signUp/Google
  popup/signOut/password reset/`onAuthStateChanged`), Firestore (10+ `collection().doc()`
  chaqiruvi, `batch()`, `FieldValue.serverTimestamp()`) va Storage (`ref().put()`,
  `getDownloadURL()`). Bularning barchasi compat (global `firebase.*`) sintaksisida.
  Modular sintaksisga o'tish butun `app.js`ni qayta yozishni va real foydalanuvchi
  hisoblari/ma'lumotlari bilan to'liq qayta sinashni talab qiladi — bu muhitda
  Firebase autentifikatsiyasini yakuniy sinab bo'lmaydi (jonli backend kerak).
  **Xavf > foyda** bo'lgani uchun `defer` bilan cheklandik (render-blocking baribir
  yo'qoldi). Modularga o'tishni alohida, Firebase test muhiti bor sessiyada qilish tavsiya etiladi.

## 5-bosqich — 🟡 JS va CSS minifikatsiyasi ✅

`terser` (JS) va `csso` (CSS) bilan minifikatsiya qilindi. Manba (o'qiladigan) fayllar
repo'da saqlab qolindi, sayt esa minifikatsiya qilingan versiyani yuklaydi:

| Fayl | Manba | Minifikatsiya | Kamayish |
|---|---|---|---|
| `assets/app.js` → `app.min.js` | 105 KB | 76.5 KB | −27% |
| `assets/style.css` → `style.min.css` | 48 KB | 41.6 KB | −13% |

`index.html` endi `app.min.js` va `style.min.css` ga ulanadi. Manba fayllar
(`app.js`, `style.css`) kelajakda tahrirlash uchun qoldi. Minifikatsiyadan keyin
sayt to'liq sinovdan o'tkazildi (pastga qarang).

## 6-bosqich — 🟡 Lazy loading ✅

- **Taomlar bazasi kartalari** (`app.js`da dinamik yaratiladi): rasmlarga
  `loading="lazy"` — 32 ta karta rasmidan faqat ekranga kelganlari yuklanadi.
- **Avatar rasmi** va **auth kartasi ikonkasi**: `loading="lazy"`.
- **Kundalik kayfiyat maskoti**: `fetchpriority="low" decoding="async"`.
- **Qo'shilmadi (ataylab):** fon, yuklanish maskoti, `kosa_bosh`/`kosa_osh` — bular
  birinchi ekranda (LCP yo'lida), `lazy` ularni sekinlashtirar edi.

## 7-bosqich — 🟢 Cache sarlavhalari ✅

`_headers` fayliga statik asset siyosati qo'shildi:
```
/assets/img/*   → max-age=31536000, immutable   (rasmlar kamdan-kam o'zgaradi)
/assets/*.css   → max-age=86400                  (1 kun)
/assets/*.js    → max-age=86400                  (1 kun)
```
`index.html` va `/` avvalgidek `no-cache` (har doim yangilanish tekshiriladi).
JS/CSS uchun 1 kun tanlandi, chunki fayl nomlarida hash/versioning yo'q —
uzoq muddatli cache foydalanuvchilarga eski kodni ko'rsatib qo'yishi mumkin edi.

## ✅ Sinov (minifikatsiyadan keyin, mahalliy serverda)

Yakuniy `index.html` (min fayllar bilan) brauzerda to'liq tekshirildi — konsol
xatolarisiz:
- **Doza hisoblash:** 60 g uglevod + 9 mmol/L qand → 7 birlik (to'g'ri).
- **Uch til (UZ/RU/EN):** almashish ishlaydi, kirill matn buzilmagan
  («Главная», «Доза — калькулятор…»).
- **Taomlar bazasi:** 32 karta, turkum filtri ishlaydi (Mevalar → 10, Hammasi → 32).
- **Lazy rasmlar:** taomlar kartalarida `loading="lazy"` faol.
- **CSS:** 424 qoida yuklandi, tokenlar/layout joyida (`.bosh-band` padding 92px).

> Eslatma: bu 0-bosqich uchun so'ralgan «har bo'lim screenshoti» o'rniga DOM/CSS
> darajasidagi tekshiruv ishlatildi — brauzer paneli `screenshot` buyrug'ida
> (sahifadagi cheksiz CSS animatsiyalari tufayli) muttasil timeout berdi. DOM
> tekshiruvi regressiyani aniqlash uchun screenshotdan ishonchliroq: har bir
> element o'lchami, hisoblangan uslubi va funksiyasi to'g'ridan-to'g'ri o'lchandi.

## 🐛 Yo'l-yo'lakay tuzatilgan xatolik

CSS tashqi faylga chiqarilganda `url(assets/img/…)` yo'llari sindi: CSS `assets/`
ichida bo'lgani uchun brauzer `assets/assets/img/…` deb qidirib **404** olardi
(`fon.webp` va `dasturxon.webp`). Yo'llar `url(img/…)` ga tuzatildi (CSS fayliga nisbatan).

## Umumiy natija (yuklanadigan hajmlar)

| Ko'rsatkich | Oldin | Keyin |
|---|---|---|
| `index.html` | 75.5 KB | 27.8 KB |
| Asosiy JS (yuklanadigan) | 105 KB | 76.5 KB (min) |
| Asosiy CSS (yuklanadigan) | 48 KB (inline) | 41.6 KB (min, cache'lanadi) |
| `assets/img/` jami | ≈ 2.09 MB | ≈ 1.16 MB |
| Render-blocking skriptlar | 5 ta (Firebase×4 + app) | 0 (hammasi `defer`) |
| Statik asset cache | yo'q | rasm 1 yil, JS/CSS 1 kun |

Eng katta LCP yutug'i: fon rasmi endi `preload`+`fetchpriority=high` bilan
(kech-topilar CSS background emas), yuklanish animatsiyasi 417 KB → 9.8 KB, va
render-blocking Firebase skriptlari `defer` bo'ldi.
