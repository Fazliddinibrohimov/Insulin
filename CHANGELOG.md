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
