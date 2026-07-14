(function(){
  "use strict";

  // Sozlamalar brauzerning localStorage xotirasida saqlanadi —
  // foydalanuvchi ularni bir marta kiritadi, keyin doim tiklanadi.
  var SAQLASH_KALIT = 'doza-sozlama';
  var sozlama = { icr: 10, isf: 3, maqsad: 6.0 };
  var sozlamaSaqlandi = false;

  var GIPO_CHEGARA = 3.9;   // mmol/L — bundan past bo'lsa doza ko'rsatilmaydi
  var KATTA_DOZA = 25;      // birlik — bundan katta bo'lsa qo'shimcha ogohlantirish

  var el = function(id){ return document.getElementById(id); };

  var sahna = el('kosaSahna'),
      yorliq = el('dozaYorliq'),
      taqsimot = el('taqsimot'),
      xabar = el('xabar'),
      yorliqTimer = null;

  function yarimgaYaxlitla(x){ return Math.round(x * 2) / 2; }

  function raqamFormat(x){
    return (Math.round(x * 100) / 100).toLocaleString(LOKAL[til] || 'uz-UZ', {maximumFractionDigits:2});
  }

  function xabarQoy(matn, tur){
    if (!matn){ xabar.hidden = true; return; }
    xabar.textContent = matn;
    xabar.className = 'xabar ' + (tur || 'oddiy');
    xabar.hidden = false;
  }

  // Yorliqni ko'rsatish: ichki HTML, holat turi ('','xavf','ehtiyot'), kechikish (ms)
  function yorliqKorsat(ich, tur, kechikish){
    if (yorliqTimer){ clearTimeout(yorliqTimer); yorliqTimer = null; }
    yorliq.classList.remove('korin');
    yorliqTimer = setTimeout(function(){
      yorliq.innerHTML = ich;
      yorliq.className = 'doza-yorliq korin' + (tur ? ' ' + tur : '');
    }, kechikish || 60);
  }

  function yorliqYashir(){
    if (yorliqTimer){ clearTimeout(yorliqTimer); yorliqTimer = null; }
    yorliq.classList.remove('korin');
  }

  function kosaToldir(toliqmi){
    sahna.classList.toggle('toliq', !!toliqmi);
  }

  function scrollNatijaga(){
    var natija = document.querySelector('.natija-karta');
    if (natija) natija.scrollIntoView({behavior:'smooth', block:'center'});
  }

  function hisobla(){
    var uglevod = parseFloat(el('uglevod').value);
    var qand = parseFloat(el('hozirgiQand').value);

    var kdBtn = el('kundalikYozTugma');
    if (kdBtn){
      kdBtn.hidden = !(qand > 0);
      kdBtn.classList.remove('yozildi');
      kdBtn.textContent = M('kund_yoz_t');
    }

    // Tekshiruvlar
    if (isNaN(uglevod) || uglevod < 0 || isNaN(qand) || qand <= 0){
      kosaToldir(false);
      yorliqKorsat('<span class="belgi">🤔</span><span class="qisqa">' + M('toliq_emas') + '</span>', 'ehtiyot');
      taqsimot.hidden = true;
      xabarQoy(M('notogri'), 'ehtiyot');
      scrollNatijaga();
      return;
    }

    // XAVFSIZLIK: gipoglikemiya — kosa bo'sh qoladi, doza ko'rsatilmaydi
    if (qand < GIPO_CHEGARA){
      kosaToldir(false);
      yorliqKorsat('<span class="belgi">⚠️</span><span class="qisqa">' + M('past_q') + '</span>' +
        '<span class="raqam-birlik">' + raqamFormat(qand) + ' mmol/L</span>', 'xavf');
      taqsimot.hidden = true;
      xabarQoy(M('gipo_x'), 'xavf');
      scrollNatijaga();
      return;
    }

    // Asosiy hisob
    var ovqatDoza = uglevod / sozlama.icr;
    var korreksiya = (qand - sozlama.maqsad) / sozlama.isf;
    var aniqJami = ovqatDoza + korreksiya;
    var kamida0 = Math.max(0, aniqJami);
    var yaxlit = yarimgaYaxlitla(kamida0);

    if (yaxlit <= 0){
      kosaToldir(false);
      yorliqKorsat('<span class="raqam">0</span><span class="raqam-birlik">' + M('birlik') + '</span>');
      var nolXabar = M('nol_x');
      if (!sozlamaSaqlandi){ xabarQoy(M('standart') + ' ' + nolXabar, 'ehtiyot'); }
      else { xabarQoy(nolXabar, 'oddiy'); }
    } else {
      // KOSA TO'LADI — bo'sh kosadan oshli kosaga o'tish
      var avvalToliq = sahna.classList.contains('toliq');
      kosaToldir(true);

      var izohlar = [M('yaxlit_i')];
      if (korreksiya < 0) izohlar.push(M('past_i'));
      var tur = '';
      var xabarTur = 'oddiy';
      if (!sozlamaSaqlandi){ izohlar.unshift(M('standart')); xabarTur = 'ehtiyot'; }
      if (yaxlit >= KATTA_DOZA){
        izohlar.push(M('katta_i'));
        tur = 'ehtiyot';
        xabarTur = 'ehtiyot';
      }
      // Yorliq kosa to'lgach paydo bo'ladi
      yorliqKorsat('<span class="raqam">' + raqamFormat(yaxlit) + '</span><span class="raqam-birlik">' + M('birlik') + '</span>',
        tur, avvalToliq ? 60 : 550);
      xabarQoy(izohlar.join(' '), xabarTur);
    }

    // Taqsimot
    el('ovqatDoza').textContent = raqamFormat(ovqatDoza) + ' ' + M('birlik');
    el('korreksiyaDoza').textContent = (korreksiya >= 0 ? '+' : '−') + raqamFormat(Math.abs(korreksiya)) + ' ' + M('birlik');
    el('aniqJami').textContent = raqamFormat(kamida0) + ' ' + M('birlik');
    taqsimot.hidden = false;
    scrollNatijaga();
  }

  // Sozlamalar paneli
  var sozlamalarBlok = el('sozlamalar');
  var ochishTugma = el('sozlamaOchish');
  ochishTugma.addEventListener('click', function(ev){
    ev.stopPropagation();
    ochishTugma.classList.remove('diqqat');
    var ochiq = sozlamalarBlok.classList.toggle('ochiq');
    ochishTugma.setAttribute('aria-expanded', ochiq ? 'true' : 'false');
  });
  document.addEventListener('click', function(ev){
    if (sozlamalarBlok.classList.contains('ochiq') &&
        !sozlamalarBlok.contains(ev.target) && ev.target !== ochishTugma && !ochishTugma.contains(ev.target)){
      sozlamalarBlok.classList.remove('ochiq');
      ochishTugma.setAttribute('aria-expanded', 'false');
    }
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && sozlamalarBlok.classList.contains('ochiq')){
      sozlamalarBlok.classList.remove('ochiq');
      ochishTugma.setAttribute('aria-expanded', 'false');
    }
  });

  el('saqlaTugma').addEventListener('click', function(){
    var icr = parseFloat(el('icr').value);
    var isf = parseFloat(el('isf').value);
    var maqsad = parseFloat(el('maqsad').value);
    if (isNaN(icr) || icr <= 0 || isNaN(isf) || isf <= 0 || isNaN(maqsad) || maqsad < 4){
      alert(M('alert_soz'));
      return;
    }
    sozlama = { icr: icr, isf: isf, maqsad: maqsad };
    sozlamaSaqlandi = true;
    try { localStorage.setItem(SAQLASH_KALIT, JSON.stringify(sozlama)); } catch(e){}
    if (BULUT_REJIM && joriyFoydalanuvchi){
      fsDb.collection('users').doc(joriyFoydalanuvchi.uid).set({ settings: sozlama }, { merge: true }).catch(function(){});
    }
    var xabarEl = el('saqlandiXabar');
    xabarEl.classList.add('korin');
    setTimeout(function(){ xabarEl.classList.remove('korin'); }, 2000);
    // «Saqlandi» bir lahza ko'rinib, panel o'zi yopiladi
    setTimeout(function(){
      sozlamalarBlok.classList.remove('ochiq');
      ochishTugma.setAttribute('aria-expanded', 'false');
    }, 700);
  });

  // ---------- TAOMLAR BAZASI (modal) ----------
  // Qiymatlar o'rtacha retseptlar asosida taxminiy. Format: [porsiya nomi, uglevod (g)]
  // r — rasm kaliti (TAOM_RASM ichida bo'lsa rasm, bo'lmasa emoji ko'rsatiladi)
  var TAOMLAR = [
    {n:"Osh (palov)", e:"🍛", r:"palov", p:[["Kichik kosa",45],["O'rta kosa",65],["Katta kosa",85]]},
    {n:"Lag'mon", e:"🍜", r:"lagmon", p:[["Kichik",40],["O'rta",55],["Katta",70]]},
    {n:"Mastava", e:"🥣", r:"mastava", p:[["Kichik",25],["O'rta",35],["Katta",45]]},
    {n:"Sho'rva", e:"🍲", r:"shorva", p:[["Kichik",20],["O'rta",30],["Katta",40]]},
    {n:"Manti", e:"🥟", r:"manti", p:[["2 dona",26],["4 dona",52],["6 dona",78]]},
    {n:"Somsa", e:"🫓", r:"somsa", p:[["1 dona",28],["2 dona",56],["3 dona",84]]},
    {n:"Chuchvara", e:"🍚", r:"chuchvara", p:[["Kichik kosa",30],["O'rta kosa",40],["Katta kosa",55]]},
    {n:"Obi non", e:"🍞", r:"non", p:[["Bo'lak (1/8)",20],["Chorak (1/4)",40],["Yarim (1/2)",80]]},
    {n:"Patir", e:"🥨", r:"patir", p:[["Bo'lak",22],["Chorak",45],["Yarim",90]]},
    {n:"Moshkichiri", e:"🍚", r:"moshkichiri", p:[["Kichik",45],["O'rta",60],["Katta",80]]},
    {n:"Dimlama", e:"🥘", r:"dimlama", p:[["Kichik",25],["O'rta",35],["Katta",45]]},
    {n:"Shashlik", e:"🍢", r:"shashlik", p:[["1 six",2],["2 six",4],["3 six",6]]},
    {n:"Kartoshka", e:"🥔", r:"kartoshka", p:[["Kichik",25],["O'rta",35],["Katta",50]]},
    {n:"Makaron", e:"🍝", r:"makaron", p:[["Kichik",40],["O'rta",60],["Katta",85]]},
    {n:"Choy + qand", e:"🍵", r:"choy", p:[["1 dona qand",5],["2 dona qand",10],["3 dona qand",15]]},
    {n:"Kompot", e:"🧃", r:"kompot", p:[["Piyola",15],["Kosa",25],["Katta",35]]},
    {n:"Olma", e:"🍎", r:"olma", p:[["Kichik",10],["O'rta",18],["Katta",25]]},
    {n:"Banan", e:"🍌", r:"banan", p:[["Yarim",12],["1 dona",25],["Katta",30]]},
    {n:"Uzum", e:"🍇", r:"uzum", p:[["Hovuch (100 g)",15],["150 g",25],["200 g",35]]},
    {n:"Tarvuz", e:"🍉", r:"tarvuz", p:[["1 bo'lak",15],["2 bo'lak",25],["3 bo'lak",35]]},
    {n:"Qovun", e:"🍈", r:"qovun", p:[["1 bo'lak",20],["2 bo'lak",30],["3 bo'lak",40]]},
    {n:"Shaftoli", e:"🍑", r:"shaftoli", p:[["Kichik",8],["O'rta",12],["Katta",18]]},
    {n:"Halva", e:"🍬", r:"holva", p:[["Kichik bo'lak",15],["O'rta bo'lak",30],["Katta bo'lak",45]]}
  ];

  var TAOM_RASM = {banan:"assets/img/taomlar/banan.webp",choy:"assets/img/taomlar/choy.webp",chuchvara:"assets/img/taomlar/chuchvara.webp",dimlama:"assets/img/taomlar/dimlama.webp",holva:"assets/img/taomlar/holva.webp",kartoshka:"assets/img/taomlar/kartoshka.webp",kompot:"assets/img/taomlar/kompot.webp",lagmon:"assets/img/taomlar/lagmon.webp",makaron:"assets/img/taomlar/makaron.webp",manti:"assets/img/taomlar/manti.webp",mastava:"assets/img/taomlar/mastava.webp",moshkichiri:"assets/img/taomlar/moshkichiri.webp",non:"assets/img/taomlar/non.webp",olma:"assets/img/taomlar/olma.webp",palov:"assets/img/taomlar/palov.webp",patir:"assets/img/taomlar/patir.webp",qovun:"assets/img/taomlar/qovun.webp",shaftoli:"assets/img/taomlar/shaftoli.webp",shashlik:"assets/img/taomlar/shashlik.webp",shorva:"assets/img/taomlar/shorva.webp",somsa:"assets/img/taomlar/somsa.webp",tarvuz:"assets/img/taomlar/tarvuz.webp",uzum:"assets/img/taomlar/uzum.webp"};

  var savat = [];
  var modalFon = el('modalFon'),
      taomGrid = el('taomGrid'),
      panelSavat = el('panelSavat'),
      savatQisqacha = el('savatQisqacha'),
      panelHisobla = el('panelHisobla'),
      modalQand = el('modalQand'),
      modalPanel = el('modalPanel'),
      taomXulosa = el('taomXulosa');

  // ---------- 3 TILLI LUG'AT ----------
  var TIL_KALIT = 'doza-til';
  var til = 'uz';
  var LOKAL = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' };

  var LUG = {
  uz: {
    title: "Doza — insulin bolus kalkulyatori",
    soz_tugma: "Sozlamalar",
    hero_p: "Ovqatingizga qarab insulin dozasini oson va xavfsiz hisoblang",
    disc: "<strong>Muhim:</strong> bu vosita tibbiy maslahat o'rnini bosmaydi. ICR va ISF qiymatlaringizni faqat endokrinolog belgilaydi. Har qanday hisoblangan dozani shifokoringiz tavsiyasi bilan solishtiring.",
    soz_h: "Shaxsiy sozlamalar",
    soz_esl: "Bu qiymatlarni faqat shifokoringiz (endokrinolog) belgilashi kerak. Taxminiy qiymat kiritmang.",
    soz_sum: "📖 ICR va ISF qanday aniqlanadi?",
    soz_info: "<p>Ikkala ko'rsatkich ham odatda <strong>TDD</strong> — bir kunda olinadigan jami insulin miqdori (bazal + bolus yig'indisi) asosida hisoblanadi.</p><p><strong>ICR — «500 qoidasi»:</strong> ICR = 500 ÷ TDD. Masalan, TDD 50 birlik bo'lsa: 500 ÷ 50 = 10, ya'ni 1 birlik insulin taxminan 10 g uglevodni qoplaydi.</p><p><strong>ISF — «100 qoidasi» (mmol/L uchun):</strong> ISF = 100 ÷ TDD. O'sha misolda: 100 ÷ 50 = 2, ya'ni 1 birlik insulin qandni taxminan 2 mmol/L ga tushiradi.</p><p><strong>Muhim:</strong> bu formulalar faqat boshlang'ich taxmin beradi. Aniq qiymatlar shifokor nazoratida amaliy tekshiruv bilan topiladi — ovqatdan oldin va 2 soat keyin (ICR uchun) yoki korreksiyadan 3–4 soat keyin (ISF uchun) qand o'lchab solishtiriladi. Qiymatlar kun vaqti, jismoniy faollik va yoshga qarab o'zgarishi mumkin, shuning uchun ularni endokrinologingiz bilan birga aniqlang.</p>",
    icr_l: "ICR — insulin-uglevod nisbati", icr_b: "g / birlik", icr_i: "1 birlik insulin necha gramm uglevodni qoplaydi",
    isf_l: "ISF — sezuvchanlik faktori", isf_i: "1 birlik insulin qandni necha mmol/L ga tushiradi",
    maq_l: "Maqsadli qand darajasi", maq_i: "Shifokoringiz belgilagan maqsadli qiymat",
    saqla_t: "Sozlamalarni saqlash", saqlandi_t: "✓ Saqlandi",
    kir_h: "Ma'lumotlarni kiriting",
    ugl_l: "🍚 Ovqatdagi uglevodlar", ugl_b: "gramm", ugl_i: "Qo'lda kiriting yoki pastdagi 🍛 taomlar bazasidan tanlang",
    qand_l: "🩸 Hozirgi qand darajasi", qand_i: "Glyukometr ko'rsatgan hozirgi qiymat",
    his_t: "Dozani hisoblash",
    nat_h: "Tavsiya etilgan doza",
    ovq_l: "Ovqat uchun", kor_l: "Korreksiya", jami_l: "Jami (aniq qiymat)",
    bosh_xabar: "Uglevod miqdori va hozirgi qand darajangizni kiriting, so'ng «Dozani hisoblash» tugmasini bosing.",
    to_t: "🍛 Taomlar bazasini ochish", to_s: "Taomlarni tanlang — uglevod o'zi hisoblanadi",
    mod_h: "🍛 Taomlar bazasi",
    mod_esl: "Qiymatlar taxminiy (1 XE ≈ 11 g uglevod). Aniqroq nazorat uchun taomni tarozida o'lchang va ro'yxatni shifokoringiz bilan ko'rib chiqing.",
    mod_ph: "Qand darajasi", pan_his: "Hisoblash",
    foot: "Doza — o'quv loyihasi. Tibbiy qaror qabul qilishdan oldin doimo shifokoringizga murojaat qiling.",
    standart: "Diqqat: shaxsiy sozlamalaringiz hali saqlanmagan — hisob standart qiymatlar bilan bajarildi. Avval «Shaxsiy sozlamalar»ni to'ldiring.",
    notogri: "Iltimos, uglevod miqdori va hozirgi qand darajasini to'g'ri kiriting.",
    toliq_emas: "To'liq emas",
    past_q: "Qand juda past!",
    gipo_x: "Hozir insulin yubormang. Avval tez hazm bo'ladigan uglevod qabul qiling (masalan, shirin sharbat yoki glyukoza tabletkasi) va 15 daqiqadan so'ng qandni qayta o'lchang.",
    birlik: "birlik",
    nol_x: "Hisob bo'yicha hozir insulin kerak emas. Qand darajangizni kuzatib boring.",
    yaxlit_i: "Natija 0.5 birlikka yaxlitlandi.",
    past_i: "Qandingiz maqsaddan past — korreksiya ayirildi.",
    katta_i: "Diqqat: doza odatdagidan katta ko'rinadi. Kiritilgan qiymatlarni qayta tekshiring va shifokoringiz bilan maslahatlashing.",
    alert_soz: "Iltimos, barcha sozlamalarni to'g'ri kiriting (maqsadli qand kamida 4 mmol/L).",
    savat_bosh: "🧺 Savat bo'sh",
    savat_h: "Taomni bosib porsiya tanlang",
    savat_x: "🧺 {n} ta taom • {g} g ≈ {xe} XE",
    savat_toz: "Savatni tozalash",
    xulosa: "✓ {n} ta taom tanlangan — jami {g} g uglevod kalkulyatorga yozildi",
    qosh: "➕ Qo'shish",
    orta_h: "≈ {g} g (o'rta)",
    nav_bosh: "Bosh", nav_kundalik: "Kundalik", nav_taom: "Taomlar", nav_bilim: "Bilim",
    bp_kund_t: "Kundalik", bp_taom_t: "Taomlar",
    bp_oxirgi_eyebrow: "Oxirgi qand",
    bp_hali_yoq: "Hali birorta o'lchov qayd etilmagan",
    bp_birinchi_t: "Birinchi yozuvni qo'shish",
    vaqt_hozir: "hozirgina", vaqt_daq: "{n} daqiqa oldin", vaqt_soat: "{n} soat oldin", vaqt_kun: "{n} kun oldin",
    masq_streak: "{n} kunlik seriya! 🔥",
    masq_birinchi: "Bugungi birinchi yozuv! 🎉",
    masq_kutyapti: "Seriya davom etyapti — bugun hali yozuv yo'q",
    masq_uzildi: "Bir necha kundan beri yozuv yo'q",
    masq_salom: "Hali birorta yozuv yo'q — birinchisini qo'shing!",
    kd_ehba_eyebrow: "Taxminiy HbA1c",
    kd_ehba_chip: "so'nggi 30 kun",
    kd_ehba_kam: "Hisoblash uchun so'nggi 30 kun ichida kamida 5 ta yozuv kerak.",
    kd_grafik_h: "7 kunlik grafik",
    kd_grafik_yoq: "Hali yetarli ma'lumot yo'q — yozuvlar qo'shilgach, grafik shu yerda paydo bo'ladi.",
    kd_bugun: "Bugun", kd_kecha: "Kecha",
    kd_kunlik_yoq: "Bu kunda hali yozuv yo'q.",
    kd_yozuv_h: "Yangi yozuv qo'shish",
    kd_turi_l: "Vaqti",
    kd_qoshish_t: "Kundalikka qo'shish",
    kd_royxat_h: "So'nggi yozuvlar",
    kd_royxat_yoq: "Hali yozuvlar yo'q. Birinchisini yuqoridagi formadan qo'shing.",
    kd_ochir_aria: "olib tashlash",
    kd_alert: "Iltimos, to'g'ri qand darajasini kiriting.",
    turi_oldin: "Ovqatdan oldin", turi_keyin: "Ovqatdan keyin", turi_yotish: "Yotishdan oldin", turi_boshqa: "Boshqa",
    kund_yoz_t: "📊 Bu qiymatni kundalikka yozish",
    kund_yozildi: "Kundalikka yozildi",
    bl_h: "Bilim bo'limi tez orada",
    bl_p: "Bu yerda diabet haqida o'zbek tilida qisqa va foydali maqolalar joylashadi: gipoglikemiya, Ramazon, maktabda diabet va boshqa mavzular.",
    bl_c1: "🚨 Gipoglikemiya", bl_c2: "🌙 Ramazon", bl_c3: "🏫 Maktabda diabet", bl_c4: "🍽 Ovqatlanish",
    kun_qisqa: ["Yak","Du","Se","Cho","Pay","Ju","Sha"],
    auth_h: "Hisobingiz",
    auth_email_l: "Email",
    auth_parol_l: "Parol",
    auth_kirish_t: "Kirish",
    auth_unut_t: "Parolni unutdingizmi?",
    auth_royxat_savol: "Hisobingiz yo'qmi?",
    auth_royxat_link: "Ro'yxatdan o'tish",
    auth_ism_l: "Ismingiz",
    auth_parol_i: "Kamida 6 ta belgi",
    auth_rozilik_t: "Qon qandi ko'rsatkichlari va ovqatlanish yozuvlari kabi sog'ligimga oid ma'lumotlarni ushbu tizimda saqlash va qurilmalar o'rtasida sinxronlash uchun ishlov berilishiga rozilik bildiraman.",
    auth_royxat_t: "Ro'yxatdan o'tish",
    auth_kirish_savol: "Hisobingiz bormi?",
    auth_kirish_link: "Kirish",
    auth_chiqish_t: "Hisobdan chiqish",
    auth_nomsiz: "Foydalanuvchi",
    auth_toliq_emas: "Iltimos, barcha maydonlarni to'ldiring.",
    auth_email_kerak: "Avval email manzilingizni kiriting.",
    auth_parol_yuborildi: "Parolni tiklash havolasi emailingizga yuborildi.",
    auth_hali_yoq: "Hisob tizimi hali sozlanmagan. Tez orada ishga tushadi!",
    auth_xato_band: "Bu email allaqachon ro'yxatdan o'tgan.",
    auth_xato_email: "Email manzili noto'g'ri ko'rinadi.",
    auth_xato_zaif: "Parol juda oddiy — kamida 6 ta belgi kerak.",
    auth_xato_topilmadi: "Bunday hisob topilmadi.",
    auth_xato_parol: "Email yoki parol noto'g'ri.",
    auth_xato_kop: "Juda ko'p urinish. Birozdan keyin qayta urining.",
    auth_xato_umumiy: "Xatolik yuz berdi. Qayta urining.",
    auth_sync_yuklanmoqda: "Ma'lumotlar sinxronlanmoqda...",
    auth_sync_tayyor: "✓ Barcha qurilmalar bilan sinxronlangan",
    auth_google_t: "Google bilan davom etish",
    auth_yoki: "yoki",
    auth_google_salom: "Xush kelibsiz, {ism}! Davom etishdan oldin bitta narsani tasdiqlab bering:",
    auth_davom_t: "Davom etish",
    auth_bekor_t: "Bekor qilish va chiqish",
    auth_xato_popup: "Oynani ochib bo'lmadi. Brauzeringizda popup-oynalarga ruxsat berilganini tekshiring.",
    auth_xato_boshqa: "Bu email boshqa usul (parol) bilan allaqachon ro'yxatdan o'tgan.",
    nav_royxat_t: "Ro'yxatdan o'tish",
    nav_royxat_qisqa: "Kirish",
    nav_profil: "Profil",
    auth_telegram_t: "Telegram bilan kirish",
    auth_telegram_hali_yoq: "Telegram orqali kirish tez orada qo'shiladi!",
    auth_kirish_sarlavha: "Xush kelibsiz!",
    auth_kirish_kichik: "Davom etish uchun hisobingizga kiring",
    auth_royxat_sarlavha: "Boshlaylik!",
    auth_royxat_kichik: "Bir necha soniyada ro'yxatdan o'ting"
  },
  ru: {
    title: "Доза — калькулятор болюса инсулина",
    soz_tugma: "Настройки",
    hero_p: "Легко и безопасно рассчитывайте дозу инсулина по вашей еде",
    disc: "<strong>Важно:</strong> этот инструмент не заменяет медицинскую консультацию. Значения ICR и ISF определяет только эндокринолог. Любую рассчитанную дозу сверяйте с рекомендацией вашего врача.",
    soz_h: "Личные настройки",
    soz_esl: "Эти значения должен определять только ваш врач (эндокринолог). Не вводите приблизительные значения.",
    soz_sum: "📖 Как определяются ICR и ISF?",
    soz_info: "<p>Оба показателя обычно рассчитываются на основе <strong>TDD</strong> — общего количества инсулина за сутки (базальный + болюсный).</p><p><strong>ICR — «правило 500»:</strong> ICR = 500 ÷ TDD. Например, при TDD 50 ед.: 500 ÷ 50 = 10, то есть 1 единица инсулина покрывает примерно 10 г углеводов.</p><p><strong>ISF — «правило 100» (для ммоль/л):</strong> ISF = 100 ÷ TDD. В том же примере: 100 ÷ 50 = 2, то есть 1 единица инсулина снижает сахар примерно на 2 ммоль/л.</p><p><strong>Важно:</strong> эти формулы дают лишь начальную оценку. Точные значения подбираются под контролем врача практической проверкой — сахар измеряют до еды и через 2 часа после (для ICR) или через 3–4 часа после коррекции (для ISF). Значения могут меняться в зависимости от времени суток, физической активности и возраста, поэтому определяйте их вместе с эндокринологом.</p>",
    icr_l: "ICR — углеводный коэффициент", icr_b: "г / ед.", icr_i: "Сколько граммов углеводов покрывает 1 единица инсулина",
    isf_l: "ISF — фактор чувствительности", isf_i: "На сколько ммоль/л 1 единица инсулина снижает сахар",
    maq_l: "Целевой уровень сахара", maq_i: "Целевое значение, назначенное вашим врачом",
    saqla_t: "Сохранить настройки", saqlandi_t: "✓ Сохранено",
    kir_h: "Введите данные",
    ugl_l: "🍚 Углеводы в еде", ugl_b: "грамм", ugl_i: "Введите вручную или выберите из базы блюд 🍛 ниже",
    qand_l: "🩸 Текущий уровень сахара", qand_i: "Текущее значение по глюкометру",
    his_t: "Рассчитать дозу",
    nat_h: "Рекомендуемая доза",
    ovq_l: "На еду", kor_l: "Коррекция", jami_l: "Итого (точное значение)",
    bosh_xabar: "Введите количество углеводов и текущий сахар, затем нажмите «Рассчитать дозу».",
    to_t: "🍛 Открыть базу блюд", to_s: "Выберите блюда — углеводы посчитаются сами",
    mod_h: "🍛 База блюд",
    mod_esl: "Значения приблизительные (1 ХЕ ≈ 11 г углеводов). Для точного контроля взвешивайте еду и обсудите список с вашим врачом.",
    mod_ph: "Уровень сахара", pan_his: "Рассчитать",
    foot: "Доза — учебный проект. Перед любым медицинским решением всегда консультируйтесь с врачом.",
    standart: "Внимание: ваши личные настройки ещё не сохранены — расчёт выполнен со стандартными значениями. Сначала заполните «Личные настройки».",
    notogri: "Пожалуйста, корректно введите количество углеводов и текущий уровень сахара.",
    toliq_emas: "Не хватает данных",
    past_q: "Сахар слишком низкий!",
    gipo_x: "Сейчас не вводите инсулин. Сначала примите быстрые углеводы (например, сладкий сок или таблетку глюкозы) и через 15 минут перемерьте сахар.",
    birlik: "ед.",
    nol_x: "По расчёту инсулин сейчас не нужен. Продолжайте наблюдать за уровнем сахара.",
    yaxlit_i: "Результат округлён до 0,5 ед.",
    past_i: "Ваш сахар ниже цели — коррекция вычтена.",
    katta_i: "Внимание: доза выглядит больше обычной. Перепроверьте введённые значения и посоветуйтесь с врачом.",
    alert_soz: "Пожалуйста, корректно заполните все настройки (целевой сахар — не менее 4 ммоль/л).",
    savat_bosh: "🧺 Корзина пуста",
    savat_h: "Нажмите на блюдо и выберите порцию",
    savat_x: "🧺 Блюд: {n} • {g} г ≈ {xe} ХЕ",
    savat_toz: "Очистить корзину",
    xulosa: "✓ Выбрано блюд: {n} — всего {g} г углеводов записано в калькулятор",
    qosh: "➕ Добавить",
    orta_h: "≈ {g} г (средняя)",
    nav_bosh: "Главная", nav_kundalik: "Дневник", nav_taom: "Блюда", nav_bilim: "Знания",
    bp_kund_t: "Дневник", bp_taom_t: "Блюда",
    bp_oxirgi_eyebrow: "Последний сахар",
    bp_hali_yoq: "Замеров пока нет",
    bp_birinchi_t: "Добавить первую запись",
    vaqt_hozir: "только что", vaqt_daq: "{n} мин. назад", vaqt_soat: "{n} ч. назад", vaqt_kun: "{n} дн. назад",
    masq_streak: "Серия {n} дней! 🔥",
    masq_birinchi: "Первая запись за сегодня! 🎉",
    masq_kutyapti: "Серия продолжается — сегодня записи ещё нет",
    masq_uzildi: "Записей нет уже несколько дней",
    masq_salom: "Записей пока нет — добавьте первую!",
    kd_ehba_eyebrow: "Приблизительный HbA1c",
    kd_ehba_chip: "за 30 дней",
    kd_ehba_kam: "Для расчёта нужно минимум 5 записей за последние 30 дней.",
    kd_grafik_h: "График за 7 дней",
    kd_grafik_yoq: "Пока недостаточно данных — график появится здесь после добавления записей.",
    kd_bugun: "Сегодня", kd_kecha: "Вчера",
    kd_kunlik_yoq: "За этот день пока нет записей.",
    kd_yozuv_h: "Добавить новую запись",
    kd_turi_l: "Время",
    kd_qoshish_t: "Добавить в дневник",
    kd_royxat_h: "Последние записи",
    kd_royxat_yoq: "Записей пока нет. Добавьте первую через форму выше.",
    kd_ochir_aria: "удалить",
    kd_alert: "Пожалуйста, введите корректный уровень сахара.",
    turi_oldin: "До еды", turi_keyin: "После еды", turi_yotish: "Перед сном", turi_boshqa: "Другое",
    kund_yoz_t: "📊 Записать это значение в дневник",
    kund_yozildi: "Записано в дневник",
    bl_h: "Раздел «Знания» скоро",
    bl_p: "Здесь появятся короткие полезные статьи о диабете: гипогликемия, Рамадан, диабет в школе и другие темы.",
    bl_c1: "🚨 Гипогликемия", bl_c2: "🌙 Рамадан", bl_c3: "🏫 Диабет в школе", bl_c4: "🍽 Питание",
    kun_qisqa: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
    auth_h: "Ваш аккаунт",
    auth_email_l: "Email",
    auth_parol_l: "Пароль",
    auth_kirish_t: "Войти",
    auth_unut_t: "Забыли пароль?",
    auth_royxat_savol: "Нет аккаунта?",
    auth_royxat_link: "Зарегистрироваться",
    auth_ism_l: "Ваше имя",
    auth_parol_i: "Минимум 6 символов",
    auth_rozilik_t: "Я соглашаюсь на обработку данных о здоровье, таких как уровень сахара и записи питания, для хранения в этой системе и синхронизации между устройствами.",
    auth_royxat_t: "Зарегистрироваться",
    auth_kirish_savol: "Уже есть аккаунт?",
    auth_kirish_link: "Войти",
    auth_chiqish_t: "Выйти из аккаунта",
    auth_nomsiz: "Пользователь",
    auth_toliq_emas: "Пожалуйста, заполните все поля.",
    auth_email_kerak: "Сначала введите ваш email.",
    auth_parol_yuborildi: "Ссылка для сброса пароля отправлена на ваш email.",
    auth_hali_yoq: "Система аккаунтов ещё не настроена. Скоро заработает!",
    auth_xato_band: "Этот email уже зарегистрирован.",
    auth_xato_email: "Email выглядит некорректно.",
    auth_xato_zaif: "Пароль слишком простой — минимум 6 символов.",
    auth_xato_topilmadi: "Такой аккаунт не найден.",
    auth_xato_parol: "Неверный email или пароль.",
    auth_xato_kop: "Слишком много попыток. Попробуйте позже.",
    auth_xato_umumiy: "Произошла ошибка. Попробуйте ещё раз.",
    auth_sync_yuklanmoqda: "Синхронизация данных...",
    auth_sync_tayyor: "✓ Синхронизировано со всеми устройствами",
    auth_google_t: "Продолжить с Google",
    auth_yoki: "или",
    auth_google_salom: "Добро пожаловать, {ism}! Прежде чем продолжить, подтвердите одну вещь:",
    auth_davom_t: "Продолжить",
    auth_bekor_t: "Отменить и выйти",
    auth_xato_popup: "Не удалось открыть окно. Проверьте, разрешены ли всплывающие окна в браузере.",
    auth_xato_boshqa: "Этот email уже зарегистрирован другим способом (пароль).",
    nav_royxat_t: "Зарегистрироваться",
    nav_royxat_qisqa: "Войти",
    nav_profil: "Профиль",
    auth_telegram_t: "Войти через Telegram",
    auth_telegram_hali_yoq: "Вход через Telegram скоро будет добавлен!",
    auth_kirish_sarlavha: "Добро пожаловать!",
    auth_kirish_kichik: "Войдите в аккаунт, чтобы продолжить",
    auth_royxat_sarlavha: "Начнём!",
    auth_royxat_kichik: "Зарегистрируйтесь за несколько секунд"
  },
  en: {
    title: "Doza — insulin bolus calculator",
    soz_tugma: "Settings",
    hero_p: "Calculate your insulin dose easily and safely based on your meal",
    disc: "<strong>Important:</strong> this tool does not replace medical advice. Your ICR and ISF values must be set by an endocrinologist. Always compare any calculated dose with your doctor's recommendation.",
    soz_h: "Personal settings",
    soz_esl: "These values must be set only by your doctor (endocrinologist). Do not enter approximate values.",
    soz_sum: "📖 How are ICR and ISF determined?",
    soz_info: "<p>Both values are usually calculated from <strong>TDD</strong> — the total amount of insulin taken per day (basal + bolus).</p><p><strong>ICR — the “500 rule”:</strong> ICR = 500 ÷ TDD. For example, with a TDD of 50 units: 500 ÷ 50 = 10, meaning 1 unit of insulin covers about 10 g of carbs.</p><p><strong>ISF — the “100 rule” (for mmol/L):</strong> ISF = 100 ÷ TDD. In the same example: 100 ÷ 50 = 2, meaning 1 unit of insulin lowers glucose by about 2 mmol/L.</p><p><strong>Important:</strong> these formulas only give a starting estimate. Exact values are found under a doctor's supervision through practical testing — glucose is measured before a meal and 2 hours after (for ICR) or 3–4 hours after a correction (for ISF). Values can change with time of day, physical activity and age, so determine them together with your endocrinologist.</p>",
    icr_l: "ICR — insulin-to-carb ratio", icr_b: "g / unit", icr_i: "How many grams of carbs 1 unit of insulin covers",
    isf_l: "ISF — insulin sensitivity factor", isf_i: "How many mmol/L 1 unit of insulin lowers glucose by",
    maq_l: "Target glucose level", maq_i: "The target value set by your doctor",
    saqla_t: "Save settings", saqlandi_t: "✓ Saved",
    kir_h: "Enter your data",
    ugl_l: "🍚 Carbs in your meal", ugl_b: "grams", ugl_i: "Type it in or pick from the 🍛 food database below",
    qand_l: "🩸 Current glucose level", qand_i: "The current reading on your glucose meter",
    his_t: "Calculate dose",
    nat_h: "Recommended dose",
    ovq_l: "For the meal", kor_l: "Correction", jami_l: "Total (exact value)",
    bosh_xabar: "Enter the carb amount and your current glucose, then press “Calculate dose”.",
    to_t: "🍛 Open the food database", to_s: "Pick your foods — carbs are added up automatically",
    mod_h: "🍛 Food database",
    mod_esl: "Values are approximate (1 exchange ≈ 11 g of carbs). For tighter control, weigh your food and review this list with your doctor.",
    mod_ph: "Glucose level", pan_his: "Calculate",
    foot: "Doza is an educational project. Always consult your doctor before making any medical decision.",
    standart: "Note: your personal settings are not saved yet — the calculation used default values. Please fill in “Personal settings” first.",
    notogri: "Please enter a valid carb amount and current glucose level.",
    toliq_emas: "Incomplete",
    past_q: "Glucose too low!",
    gipo_x: "Do not take insulin right now. First take fast-acting carbs (for example sweet juice or a glucose tablet) and re-check your glucose in 15 minutes.",
    birlik: "units",
    nol_x: "The calculation shows no insulin is needed right now. Keep monitoring your glucose.",
    yaxlit_i: "The result is rounded to 0.5 units.",
    past_i: "Your glucose is below target — the correction was subtracted.",
    katta_i: "Warning: this dose looks larger than usual. Double-check your inputs and consult your doctor.",
    alert_soz: "Please fill in all settings correctly (target glucose at least 4 mmol/L).",
    savat_bosh: "🧺 Basket is empty",
    savat_h: "Tap a food and choose a portion",
    savat_x: "🧺 {n} items • {g} g ≈ {xe} exchanges",
    savat_toz: "Clear basket",
    xulosa: "✓ {n} foods selected — {g} g of carbs added to the calculator",
    qosh: "➕ Add",
    orta_h: "≈ {g} g (medium)",
    nav_bosh: "Home", nav_kundalik: "Diary", nav_taom: "Foods", nav_bilim: "Learn",
    bp_kund_t: "Diary", bp_taom_t: "Foods",
    bp_oxirgi_eyebrow: "Last reading",
    bp_hali_yoq: "No readings logged yet",
    bp_birinchi_t: "Add first entry",
    vaqt_hozir: "just now", vaqt_daq: "{n} min ago", vaqt_soat: "{n} h ago", vaqt_kun: "{n} d ago",
    masq_streak: "{n}-day streak! 🔥",
    masq_birinchi: "Today's first entry! 🎉",
    masq_kutyapti: "Streak continues — no entry today yet",
    masq_uzildi: "No entries for a few days",
    masq_salom: "No entries yet — add your first one!",
    kd_ehba_eyebrow: "Estimated HbA1c",
    kd_ehba_chip: "last 30 days",
    kd_ehba_kam: "At least 5 readings in the last 30 days are needed to estimate this.",
    kd_grafik_h: "7-day chart",
    kd_grafik_yoq: "Not enough data yet — the chart will appear here once you add entries.",
    kd_bugun: "Today", kd_kecha: "Yesterday",
    kd_kunlik_yoq: "No entries for this day yet.",
    kd_yozuv_h: "Add a new entry",
    kd_turi_l: "Timing",
    kd_qoshish_t: "Add to diary",
    kd_royxat_h: "Recent entries",
    kd_royxat_yoq: "No entries yet. Add your first one using the form above.",
    kd_ochir_aria: "remove",
    kd_alert: "Please enter a valid glucose level.",
    turi_oldin: "Before a meal", turi_keyin: "After a meal", turi_yotish: "Before bed", turi_boshqa: "Other",
    kund_yoz_t: "📊 Log this reading to your diary",
    kund_yozildi: "Logged to diary",
    bl_h: "The Learn section is coming soon",
    bl_p: "Short, practical articles about diabetes in Uzbek will live here: hypoglycemia, Ramadan, diabetes at school, and more.",
    bl_c1: "🚨 Hypoglycemia", bl_c2: "🌙 Ramadan", bl_c3: "🏫 School", bl_c4: "🍽 Nutrition",
    kun_qisqa: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    auth_h: "Your account",
    auth_email_l: "Email",
    auth_parol_l: "Password",
    auth_kirish_t: "Log in",
    auth_unut_t: "Forgot your password?",
    auth_royxat_savol: "Don't have an account?",
    auth_royxat_link: "Sign up",
    auth_ism_l: "Your name",
    auth_parol_i: "At least 6 characters",
    auth_rozilik_t: "I consent to health-related data — such as blood glucose readings and meal logs — being stored in this system and synced across my devices.",
    auth_royxat_t: "Sign up",
    auth_kirish_savol: "Already have an account?",
    auth_kirish_link: "Log in",
    auth_chiqish_t: "Log out",
    auth_nomsiz: "User",
    auth_toliq_emas: "Please fill in all fields.",
    auth_email_kerak: "Please enter your email first.",
    auth_parol_yuborildi: "A password reset link has been sent to your email.",
    auth_hali_yoq: "Accounts aren't set up yet. Coming soon!",
    auth_xato_band: "This email is already registered.",
    auth_xato_email: "That email address doesn't look valid.",
    auth_xato_zaif: "That password is too weak — at least 6 characters needed.",
    auth_xato_topilmadi: "No account found with that email.",
    auth_xato_parol: "Incorrect email or password.",
    auth_xato_kop: "Too many attempts. Please try again shortly.",
    auth_xato_umumiy: "Something went wrong. Please try again.",
    auth_sync_yuklanmoqda: "Syncing your data...",
    auth_sync_tayyor: "✓ Synced across all your devices",
    auth_google_t: "Continue with Google",
    auth_yoki: "or",
    auth_google_salom: "Welcome, {ism}! Before continuing, please confirm one thing:",
    auth_davom_t: "Continue",
    auth_bekor_t: "Cancel and sign out",
    auth_xato_popup: "Couldn't open the window. Please check that pop-ups are allowed in your browser.",
    auth_xato_boshqa: "This email is already registered using a different method (password).",
    nav_royxat_t: "Sign up",
    nav_royxat_qisqa: "Log in",
    nav_profil: "Profile",
    auth_telegram_t: "Continue with Telegram",
    auth_telegram_hali_yoq: "Telegram sign-in is coming soon!",
    auth_kirish_sarlavha: "Welcome back!",
    auth_kirish_kichik: "Log in to your account to continue",
    auth_royxat_sarlavha: "Let's get started!",
    auth_royxat_kichik: "Sign up in just a few seconds"
  }
  };

  var TAOM_TARJIMA = {
    ru: {"Osh (palov)":"Плов","Lag'mon":"Лагман","Mastava":"Мастава","Sho'rva":"Шурпа","Manti":"Манты","Somsa":"Самса","Chuchvara":"Чучвара","Obi non":"Лепёшка (оби нон)","Patir":"Патир","Moshkichiri":"Машкичири","Dimlama":"Димлама","Shashlik":"Шашлык","Kartoshka":"Картошка","Makaron":"Макароны","Choy + qand":"Чай с сахаром","Kompot":"Компот","Olma":"Яблоко","Banan":"Банан","Uzum":"Виноград","Tarvuz":"Арбуз","Qovun":"Дыня","Shaftoli":"Персик","Halva":"Халва"},
    en: {"Osh (palov)":"Pilaf (osh)","Lag'mon":"Lagman noodles","Mastava":"Mastava soup","Sho'rva":"Shurpa soup","Manti":"Manti dumplings","Somsa":"Samsa","Chuchvara":"Chuchvara dumplings","Obi non":"Flatbread (obi non)","Patir":"Patir bread","Moshkichiri":"Moshkichiri","Dimlama":"Dimlama stew","Shashlik":"Shashlik (kebab)","Kartoshka":"Potatoes","Makaron":"Pasta","Choy + qand":"Tea with sugar","Kompot":"Kompot","Olma":"Apple","Banan":"Banana","Uzum":"Grapes","Tarvuz":"Watermelon","Qovun":"Melon","Shaftoli":"Peach","Halva":"Halva"}
  };

  var PORS_TARJIMA = {
    ru: {"Kichik kosa":"Малая пиала","O'rta kosa":"Средняя пиала","Katta kosa":"Большая пиала","Kichik":"Малая","O'rta":"Средняя","Katta":"Большая","2 dona":"2 шт.","4 dona":"4 шт.","6 dona":"6 шт.","1 dona":"1 шт.","3 dona":"3 шт.","Bo'lak (1/8)":"Кусок (1/8)","Chorak (1/4)":"Четверть (1/4)","Yarim (1/2)":"Половина (1/2)","Bo'lak":"Кусок","Chorak":"Четверть","Yarim":"Половина","1 six":"1 шампур","2 six":"2 шампура","3 six":"3 шампура","1 dona qand":"1 кусочек сахара","2 dona qand":"2 кусочка сахара","3 dona qand":"3 кусочка сахара","Piyola":"Пиала","Kosa":"Большая пиала","Hovuch (100 g)":"Горсть (100 г)","150 g":"150 г","200 g":"200 г","1 bo'lak":"1 ломтик","2 bo'lak":"2 ломтика","3 bo'lak":"3 ломтика","Kichik bo'lak":"Малый кусок","O'rta bo'lak":"Средний кусок","Katta bo'lak":"Большой кусок"},
    en: {"Kichik kosa":"Small bowl","O'rta kosa":"Medium bowl","Katta kosa":"Large bowl","Kichik":"Small","O'rta":"Medium","Katta":"Large","2 dona":"2 pcs","4 dona":"4 pcs","6 dona":"6 pcs","1 dona":"1 pc","3 dona":"3 pcs","Bo'lak (1/8)":"Slice (1/8)","Chorak (1/4)":"Quarter (1/4)","Yarim (1/2)":"Half (1/2)","Bo'lak":"Piece","Chorak":"Quarter","Yarim":"Half","1 six":"1 skewer","2 six":"2 skewers","3 six":"3 skewers","1 dona qand":"1 sugar cube","2 dona qand":"2 sugar cubes","3 dona qand":"3 sugar cubes","Piyola":"Small cup","Kosa":"Bowl","Hovuch (100 g)":"Handful (100 g)","150 g":"150 g","200 g":"200 g","1 bo'lak":"1 slice","2 bo'lak":"2 slices","3 bo'lak":"3 slices","Kichik bo'lak":"Small piece","O'rta bo'lak":"Medium piece","Katta bo'lak":"Large piece"}
  };

  function M(k){
    var d = LUG[til] || LUG.uz;
    if (d[k] !== undefined) return d[k];
    return LUG.uz[k] !== undefined ? LUG.uz[k] : k;
  }
  function F(k, o){ var s = M(k); for (var p in o){ s = s.replace('{' + p + '}', o[p]); } return s; }
  function taomNomi(t){ var m = TAOM_TARJIMA[til]; return (m && m[t.n]) || t.n; }
  function porsiyaNomi(nom){ var m = PORS_TARJIMA[til]; return (m && m[nom]) || nom; }

  // Tilni almashtirish — barcha interfeys qayta chiziladi
  function tilQoy(t){
    if (!LUG[t]) t = 'uz';
    til = t;
    try { localStorage.setItem(TIL_KALIT, t); } catch(e){}
    document.documentElement.lang = t;
    document.title = M('title');
    var lar = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < lar.length; i++) lar[i].textContent = M(lar[i].getAttribute('data-i18n'));
    var lar2 = document.querySelectorAll('[data-i18n-html]');
    for (var j = 0; j < lar2.length; j++) lar2[j].innerHTML = M(lar2[j].getAttribute('data-i18n-html'));
    el('modalQand').setAttribute('placeholder', M('mod_ph'));
    el('tilKod').textContent = t.toUpperCase();
    el('tilBayroq').innerHTML = BAYROQ[t];
    var mb = tilMenyu.querySelectorAll('button[data-til]');
    for (var q2 = 0; q2 < mb.length; q2++) mb[q2].classList.toggle('faol', mb[q2].getAttribute('data-til') === t);
    gridChiz();
    yangila();
    if (taqsimot.hidden) xabarQoy(M('bosh_xabar'), 'oddiy');
    if (typeof boshPanelChiz === 'function') boshPanelChiz();
    if (typeof kundalikChiz === 'function') kundalikChiz();
  }

  // Taom kartalarini chizish
  function gridChiz(){
    taomGrid.innerHTML = TAOMLAR.map(function(t, i){
      var rasm = (t.r && TAOM_RASM[t.r])
        ? "<img src='" + TAOM_RASM[t.r] + "' alt='' loading='lazy'>"
        : "<span class='t-emoji'>" + t.e + "</span>";
      var porsiyalar = t.p.map(function(p, j){
        return "<button class='t-porsiya" + (j === 1 ? " tanlandi" : "") + "' data-i='" + i + "' data-j='" + j + "'>" + porsiyaNomi(p[0]) + "<span>≈ " + p[1] + " g</span></button>";
      }).join("");
      return "<div class='taom-karta' data-i='" + i + "' role='button' tabindex='0'>" + rasm +
        "<span class='t-nom'>" + taomNomi(t) + "</span>" +
        "<span class='t-hint'>" + F('orta_h', {g: t.p[1][1]}) + "</span>" +
        "<div class='t-porsiyalar'><span class='t-pill' aria-hidden='true'></span>" + porsiyalar +
        "<button class='t-qoshish' data-i='" + i + "'>" + M('qosh') + "</button></div></div>";
    }).join("");
  }
  gridChiz();

  // Tabletkani tanlangan porsiyaga joylash
  function pillJoyla(karta){
    var pill = karta.querySelector('.t-pill');
    var tanlangan = karta.querySelector('.t-porsiya.tanlandi');
    if (!pill || !tanlangan) return;
    pill.style.transform = 'translateY(' + tanlangan.offsetTop + 'px)';
    pill.style.height = tanlangan.offsetHeight + 'px';
    pill.style.opacity = '1';
  }

  taomGrid.addEventListener('click', function(ev){
    var q = ev.target.closest('.t-qoshish');
    if (q){
      var qi = parseInt(q.getAttribute('data-i'), 10);
      var qKarta = q.closest('.taom-karta');
      var sel = qKarta.querySelector('.t-porsiya.tanlandi');
      var qj = sel ? parseInt(sel.getAttribute('data-j'), 10) : 1;
      savat.push({ i: qi, j: qj });
      qKarta.classList.remove('ochiq');
      yangila();
      return;
    }
    var pt = ev.target.closest('.t-porsiya');
    if (pt){
      var pKarta = pt.closest('.taom-karta');
      var lar = pKarta.querySelectorAll('.t-porsiya');
      for (var pi = 0; pi < lar.length; pi++) lar[pi].classList.remove('tanlandi');
      pt.classList.add('tanlandi');
      pillJoyla(pKarta);   // tabletka tanlangan porsiyaga suzadi
      return;
    }
    var k = ev.target.closest('.taom-karta');
    if (!k) return;
    var ochiqEdi = k.classList.contains('ochiq');
    var ochiqlar = taomGrid.querySelectorAll('.taom-karta.ochiq');
    for (var x = 0; x < ochiqlar.length; x++) ochiqlar[x].classList.remove('ochiq');
    if (!ochiqEdi){
      k.classList.add('ochiq');
      requestAnimationFrame(function(){ pillJoyla(k); });
    }
  });

  function savatJamisi(){
    return savat.reduce(function(a, sv){ return a + TAOMLAR[sv.i].p[sv.j][1]; }, 0);
  }

  function yangila(){
    var jami = savatJamisi();
    if (!savat.length){
      savatQisqacha.textContent = M('savat_bosh');
      panelSavat.innerHTML = "<p style='font-size:.8rem;color:var(--siyoh-soya);padding:5px 0'>" + M('savat_h') + "</p>";
    } else {
      var xe = Math.round(jami / 11 * 2) / 2;
      savatQisqacha.textContent = F('savat_x', {n: savat.length, g: jami, xe: xe});
      panelSavat.innerHTML = savat.map(function(sv, k){
        var t = TAOMLAR[sv.i];
        return "<div class='savat-qator'><span>" + t.e + " " + taomNomi(t) + " <em>(" + porsiyaNomi(t.p[sv.j][0]) + ")</em></span>" +
          "<span class='s-uglevod'>" + t.p[sv.j][1] + " g <button class='s-och' data-k='" + k + "' aria-label='olib tashlash'>×</button></span></div>";
      }).join("") + "<button class='savat-tozalash'>" + M('savat_toz') + "</button>";
    }
    el('uglevod').value = savat.length ? jami : '';
    tugmaYangila();
    if (savat.length){
      taomXulosa.hidden = false;
      taomXulosa.textContent = F('xulosa', {n: savat.length, g: jami});
    } else {
      taomXulosa.hidden = true;
    }
  }

  function tugmaYangila(){
    var qand = parseFloat(modalQand.value);
    var tayyor = savat.length > 0 && !isNaN(qand) && qand > 0;
    panelHisobla.disabled = !tayyor;
    panelHisobla.classList.toggle('faol', tayyor);
  }

  panelSavat.addEventListener('click', function(ev){
    var b = ev.target.closest('.s-och');
    if (b){
      savat.splice(parseInt(b.getAttribute('data-k'), 10), 1);
      yangila();
      return;
    }
    if (ev.target.closest('.savat-tozalash')){
      savat = [];
      yangila();
    }
  });

  // Modalni ochish / yopish
  el('taomOchish').addEventListener('click', function(){
    if (el('hozirgiQand').value) modalQand.value = el('hozirgiQand').value;
    modalFon.classList.add('ochiq');
    document.body.style.overflow = 'hidden';
    yangila();
  });

  function modalYopish(hisoblab){
    modalFon.classList.remove('ochiq');
    document.body.style.overflow = '';
    if (modalQand.value) el('hozirgiQand').value = modalQand.value;
    if (hisoblab === true && savat.length && parseFloat(modalQand.value) > 0){
      if (el('viewBosh').hidden) viewOchish('bosh');
      hisobla();
    }
  }
  el('panelHisobla').addEventListener('click', function(){ modalYopish(true); });
  el('modalYop').addEventListener('click', function(){ modalYopish(false); });
  modalFon.addEventListener('click', function(ev){
    if (ev.target === modalFon) modalYopish();
  });
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'Escape' && modalFon.classList.contains('ochiq')) modalYopish();
  });
  modalQand.addEventListener('input', tugmaYangila);

  // Saqlangan sozlamalarni yuklash (bo'lsa)
  try {
    var saqlangan = localStorage.getItem(SAQLASH_KALIT);
    if (saqlangan){
      var q = JSON.parse(saqlangan);
      if (q && q.icr > 0 && q.isf > 0 && q.maqsad >= 4){
        sozlama = { icr: q.icr, isf: q.isf, maqsad: q.maqsad };
        sozlamaSaqlandi = true;
        el('icr').value = q.icr;
        el('isf').value = q.isf;
        el('maqsad').value = q.maqsad;
        // Foydalanuvchi allaqachon sozlab bo'lgan — diqqat animatsiyasi shart emas
        ochishTugma.classList.remove('diqqat');
      }
    }
  } catch(e){}

  // ---------- Tungi rejim ----------
  var TEMA_KALIT = 'doza-tema';
  var temaTugma = el('temaTugma');
  function temaQoy(t){
    document.body.classList.toggle('tungi', t === 'tungi');
    try { localStorage.setItem(TEMA_KALIT, t); } catch(e){}
  }
  temaTugma.addEventListener('click', function(){
    temaQoy(document.body.classList.contains('tungi') ? 'yorug' : 'tungi');
  });
  try {
    var saqTema = localStorage.getItem(TEMA_KALIT);
    if (saqTema){ temaQoy(saqTema); }
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){ temaQoy('tungi'); }
  } catch(e){}

  // ---------- Til menyusi ----------
  var BAYROQ = {
    uz: "<svg viewBox='0 0 21 15' xmlns='http://www.w3.org/2000/svg'><rect width='21' height='15' fill='#1EB53A'/><rect width='21' height='9.8' fill='#fff'/><rect width='21' height='4.6' fill='#0099B5'/><rect y='4.6' width='21' height='0.9' fill='#CE1126'/><rect y='9.5' width='21' height='0.9' fill='#CE1126'/><circle cx='3.9' cy='2.3' r='1.5' fill='#fff'/><circle cx='4.55' cy='2.3' r='1.25' fill='#0099B5'/></svg>",
    ru: "<svg viewBox='0 0 21 15' xmlns='http://www.w3.org/2000/svg'><rect width='21' height='15' fill='#D52B1E'/><rect width='21' height='10' fill='#0039A6'/><rect width='21' height='5' fill='#fff'/></svg>",
    en: "<svg viewBox='0 0 21 15' xmlns='http://www.w3.org/2000/svg'><rect width='21' height='15' fill='#012169'/><path d='M0,0 L21,15 M21,0 L0,15' stroke='#fff' stroke-width='3'/><path d='M0,0 L21,15 M21,0 L0,15' stroke='#C8102E' stroke-width='1.3'/><path d='M10.5,0 V15 M0,7.5 H21' stroke='#fff' stroke-width='5'/><path d='M10.5,0 V15 M0,7.5 H21' stroke='#C8102E' stroke-width='3'/></svg>"
  };
  var bayroqJoylar = document.querySelectorAll('[data-bayroq]');
  for (var bi = 0; bi < bayroqJoylar.length; bi++){
    bayroqJoylar[bi].innerHTML = BAYROQ[bayroqJoylar[bi].getAttribute('data-bayroq')];
  }
  var tilTugma = el('tilTugma'), tilMenyu = el('tilMenyu');
  tilTugma.addEventListener('click', function(ev){
    ev.stopPropagation();
    var o = tilMenyu.classList.toggle('ochiq');
    tilTugma.setAttribute('aria-expanded', o ? 'true' : 'false');
  });
  document.addEventListener('click', function(ev){
    if (!ev.target.closest('.til-orama')) tilMenyu.classList.remove('ochiq');
  });
  tilMenyu.addEventListener('click', function(ev){
    var b = ev.target.closest('button[data-til]');
    if (!b) return;
    tilQoy(b.getAttribute('data-til'));
    tilMenyu.classList.remove('ochiq');
    tilTugma.setAttribute('aria-expanded', 'false');
  });

  // Saqlangan tilni aniqlaymiz — haqiqiy chaqirish esa pastda,
  // kundalik/navigatsiya moduli tayyor bo'lgach amalga oshadi
  var BOSHLANGICH_TIL = 'uz';
  try {
    var saqTil = localStorage.getItem(TIL_KALIT);
    if (saqTil && LUG[saqTil]) BOSHLANGICH_TIL = saqTil;
  } catch(e){}

  el('hisoblaTugma').addEventListener('click', hisobla);

  ['uglevod','hozirgiQand'].forEach(function(id){
    el(id).addEventListener('keydown', function(e){
      if (e.key === 'Enter') hisobla();
    });
  });

  // ---------- QAND KUNDALIGI ----------
  var KUNDALIK_KALIT = 'doza-kundalik';
  var MASKOT_SRC = { x: "assets/img/maskot/sayt_xursand.webp", o: "assets/img/maskot/sayt_och.webp", a: "assets/img/maskot/sayt_xafa.webp" };
  var BULUT_REJIM = false;      // true = hisobga kirilgan, ma'lumot Firestore'dan
  var BULUT_KUNDALIK = [];

  function kundalikYuklash(){
    if (BULUT_REJIM) return BULUT_KUNDALIK;
    try {
      var raw = localStorage.getItem(KUNDALIK_KALIT);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch(e){ return []; }
  }
  function kundalikSaqlash(arr){
    if (BULUT_REJIM){ BULUT_KUNDALIK = arr; return; }
    try { localStorage.setItem(KUNDALIK_KALIT, JSON.stringify(arr)); } catch(e){}
  }
  function kunKaliti(ms){
    var d = new Date(ms);
    var y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    return y + '-' + (m < 10 ? '0' : '') + m + '-' + (day < 10 ? '0' : '') + day;
  }
  function bugunKaliti(){ return kunKaliti(Date.now()); }

  function yozuvQoshish(q, turi, t){
    var yangi = { t: t, q: q, turi: turi };
    var yozuvlar = kundalikYuklash();
    yozuvlar.push(yangi);
    kundalikSaqlash(yozuvlar);
    boshPanelChiz();
    kundalikChiz();
    if (BULUT_REJIM && joriyFoydalanuvchi){
      fsDb.collection('users').doc(joriyFoydalanuvchi.uid).collection('kundalik').add({ t: t, q: q, turi: turi })
        .then(function(ref){ yangi._id = ref.id; })
        .catch(function(err){ console.error('Bulutga yozilmadi:', err); });
    }
  }

  function vaqtOldin(t){
    var daq = Math.floor((Date.now() - t) / 60000);
    if (daq < 1) return M('vaqt_hozir');
    if (daq < 60) return F('vaqt_daq', { n: daq });
    var soat = Math.floor(daq / 60);
    if (soat < 24) return F('vaqt_soat', { n: soat });
    return F('vaqt_kun', { n: Math.floor(soat / 24) });
  }

  function turiNomi(k){
    var xarita = { oldin: 'turi_oldin', keyin: 'turi_keyin', yotish: 'turi_yotish', boshqa: 'turi_boshqa' };
    return M(xarita[k] || 'turi_boshqa');
  }

  function hisoblaStreak(yozuvlar){
    if (!yozuvlar.length) return 0;
    var kunlarSet = {};
    yozuvlar.forEach(function(y){ kunlarSet[kunKaliti(y.t)] = true; });
    var kunlar = Object.keys(kunlarSet).sort().reverse();
    var streak = 1;
    var cursor = new Date(kunlar[0] + 'T00:00:00');
    for (var i = 1; i < kunlar.length; i++){
      cursor.setDate(cursor.getDate() - 1);
      if (kunlar[i] === kunKaliti(cursor.getTime())) { streak++; } else { break; }
    }
    return streak;
  }

  function maskotHolat(yozuvlar){
    if (!yozuvlar.length) return 'salom';
    var oxirgiT = Math.max.apply(null, yozuvlar.map(function(y){ return y.t; }));
    var oxirgiKun = kunKaliti(oxirgiT);
    if (oxirgiKun === bugunKaliti()) return 'xursand';
    if (oxirgiKun === kunKaliti(Date.now() - 86400000)) return 'och';
    return 'xafa';
  }

  function haftaNuqtalari(yozuvlar){
    var kunlarSet = {};
    yozuvlar.forEach(function(y){ kunlarSet[kunKaliti(y.t)] = true; });
    var html = '';
    for (var i = 6; i >= 0; i--){
      var k = kunKaliti(Date.now() - i * 86400000);
      html += '<span class="bp-kun' + (kunlarSet[k] ? ' bor' : '') + '"></span>';
    }
    return html;
  }

  function focusKdForm(){
    setTimeout(function(){ var i = el('kdQand'); if (i) i.focus(); }, 350);
  }

  function boshPanelChiz(){
    var yozuvlar = kundalikYuklash();
    var bpOx = el('bpOxirgi');
    if (!bpOx) return;

    if (!yozuvlar.length){
      bpOx.innerHTML =
        '<div class="bp-bosh-cta"><div class="bp-eyebrow">' + M('bp_oxirgi_eyebrow') + '</div>' +
        '<p>' + M('bp_hali_yoq') + '</p>' +
        '<button class="bp-mini-tugma" id="bpBirinchiTugma">' + M('bp_birinchi_t') + '</button></div>';
      var bt = document.getElementById('bpBirinchiTugma');
      if (bt) bt.addEventListener('click', function(){ viewOchish('kundalik'); focusKdForm(); });
    } else {
      var saralangan = yozuvlar.slice().sort(function(a, b){ return b.t - a.t; });
      var oxirgi = saralangan[0], oldingi = saralangan[1];
      var belgi = '\u2192', klass = 'bp-trend-flat';
      if (oldingi){
        var farq = oxirgi.q - oldingi.q;
        if (farq > 0.3){ belgi = '\u2197'; klass = 'bp-trend-up'; }
        else if (farq < -0.3){ belgi = '\u2198'; klass = 'bp-trend-down'; }
      }
      bpOx.innerHTML =
        '<div class="bp-eyebrow">' + M('bp_oxirgi_eyebrow') + '</div>' +
        '<div class="bp-raqam"><b>' + raqamFormat(oxirgi.q) + '</b><span>mmol/L</span>' +
        '<span class="trend ' + klass + '">' + belgi + '</span></div>' +
        '<div class="bp-meta">' + vaqtOldin(oxirgi.t) + '</div>';
    }

    var holat = maskotHolat(yozuvlar);
    var streak = hisoblaStreak(yozuvlar);
    var rasm = holat === 'xursand' ? MASKOT_SRC.x : (holat === 'xafa' ? MASKOT_SRC.a : MASKOT_SRC.o);
    var matn;
    if (holat === 'salom') matn = M('masq_salom');
    else if (holat === 'xursand') matn = (streak <= 1) ? M('masq_birinchi') : F('masq_streak', { n: streak });
    else if (holat === 'och') matn = M('masq_kutyapti');
    else matn = M('masq_uzildi');

    var mk = el('bpMaskotKarta');
    if (mk){
      mk.innerHTML = '<img src="' + rasm + '" alt="">' +
        '<div class="bp-m-matn"><b>' + matn + '</b><div class="bp-hafta">' + haftaNuqtalari(yozuvlar) + '</div></div>';
    }
  }

  function ehbaHisobla(yozuvlar){
    var chegara = Date.now() - 30 * 86400000;
    var songi = yozuvlar.filter(function(y){ return y.t >= chegara; });
    if (songi.length < 5) return null;
    var ortacha = songi.reduce(function(a, y){ return a + y.q; }, 0) / songi.length;
    var mgdl = ortacha * 18.0182;
    return (mgdl + 46.7) / 28.7;
  }

  function kunOrtachalari(yozuvlar){
    var natija = [];
    for (var i = 6; i >= 0; i--){
      var d = new Date(Date.now() - i * 86400000);
      var k = kunKaliti(d.getTime());
      var shuKun = yozuvlar.filter(function(y){ return kunKaliti(y.t) === k; });
      var ort = shuKun.length ? shuKun.reduce(function(a, y){ return a + y.q; }, 0) / shuKun.length : null;
      natija.push({ sana: d, qiymat: ort });
    }
    return natija;
  }

  var KUNLIK_SANA = null; // JS yuklanganda bugungi sana bilan ishga tushiriladi

  function kunlikGrafikSvg(yozuvlar){
    if (!yozuvlar.length){
      return '<p class="kd-bosh-holat">' + M('kd_kunlik_yoq') + '</p>';
    }
    var W = 620, H = 150, pad = 8, tepaPad = 14, pastPad = 26;
    var qiymatlar = yozuvlar.map(function(y){ return y.q; });
    var minQ = Math.min(3, Math.floor(Math.min.apply(null, qiymatlar)) - 1);
    var maxQ = Math.max(11, Math.ceil(Math.max.apply(null, qiymatlar)) + 1);

    function xK(t){
      var d = new Date(t);
      var soat = d.getHours() + d.getMinutes() / 60;
      return pad + (soat / 24) * (W - pad * 2);
    }
    function yK(q){ return tepaPad + (1 - (q - minQ) / (maxQ - minQ)) * (H - tepaPad - pastPad); }

    var chiziq = [], nuqtalar = [];
    yozuvlar.forEach(function(y){
      var x = xK(y.t), yy = yK(y.q);
      chiziq.push(x + ',' + yy);
      var rang = (y.q < 3.9 || y.q > 10) ? 'var(--anor)' : (y.q > 8 ? 'var(--zar)' : 'var(--kok)');
      nuqtalar.push('<circle cx="' + x + '" cy="' + yy + '" r="4" fill="' + rang + '"/>');
    });

    var soatBelgilar = [0, 6, 12, 18, 24].map(function(s){
      var x = pad + (s / 24) * (W - pad * 2);
      var label = (s < 10 ? '0' : '') + s + ':00';
      return '<text x="' + x + '" y="' + (H - 6) + '" font-size="9" fill="var(--siyoh-soya)" font-weight="700" text-anchor="middle">' + label + '</text>';
    }).join('');

    var yTepa = yK(8), yPast = yK(4);
    return '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect x="' + pad + '" y="' + yTepa + '" width="' + (W - pad * 2) + '" height="' + (yPast - yTepa) + '" rx="6" fill="var(--yashil)" opacity="0.13"/>' +
      (chiziq.length > 1 ? '<polyline points="' + chiziq.join(' ') + '" fill="none" stroke="var(--kok)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' : '') +
      nuqtalar.join('') + soatBelgilar + '</svg>';
  }

  function kunlikGrafikChiz(){
    if (KUNLIK_SANA === null) KUNLIK_SANA = bugunKaliti();
    var hammaYozuvlar = kundalikYuklash();
    var shuKun = hammaYozuvlar.filter(function(y){ return kunKaliti(y.t) === KUNLIK_SANA; })
      .sort(function(a, b){ return a.t - b.t; });

    var bugun = bugunKaliti();
    var kecha = kunKaliti(Date.now() - 86400000);
    var sanaEl = el('kdKunSana');
    if (KUNLIK_SANA === bugun) sanaEl.textContent = M('kd_bugun');
    else if (KUNLIK_SANA === kecha) sanaEl.textContent = M('kd_kecha');
    else {
      var d = new Date(KUNLIK_SANA + 'T00:00:00');
      sanaEl.textContent = (d.getDate() < 10 ? '0' : '') + d.getDate() + '.' + (d.getMonth() + 1 < 10 ? '0' : '') + (d.getMonth() + 1) + '.' + d.getFullYear();
    }
    el('kdKunOldinga').disabled = (KUNLIK_SANA >= bugun);

    el('kdKunlikGrafikOrama').innerHTML = kunlikGrafikSvg(shuKun);
  }

  function kunSanaOzgartir(qadam){
    var d = new Date(KUNLIK_SANA + 'T00:00:00');
    d.setDate(d.getDate() + qadam);
    var yangiSana = kunKaliti(d.getTime());
    if (yangiSana > bugunKaliti()) return; // kelajakka o'tishga ruxsat yo'q
    KUNLIK_SANA = yangiSana;
    kunlikGrafikChiz();
  }
  el('kdKunOrqaga').addEventListener('click', function(){ kunSanaOzgartir(-1); });
  el('kdKunOldinga').addEventListener('click', function(){ kunSanaOzgartir(1); });

  function grafikSvg(yozuvlar){
    var kunlar = kunOrtachalari(yozuvlar);
    if (!kunlar.some(function(k){ return k.qiymat !== null; })){
      return '<p class="kd-bosh-holat">' + M('kd_grafik_yoq') + '</p>';
    }
    var W = 620, H = 150, pad = 8, tepaPad = 14, pastPad = 26;
    var qiymatlar = kunlar.filter(function(k){ return k.qiymat !== null; }).map(function(k){ return k.qiymat; });
    var minQ = Math.min(3, Math.floor(Math.min.apply(null, qiymatlar)) - 1);
    var maxQ = Math.max(11, Math.ceil(Math.max.apply(null, qiymatlar)) + 1);

    function xK(i){ return pad + i * ((W - pad * 2) / 6); }
    function yK(q){ return tepaPad + (1 - (q - minQ) / (maxQ - minQ)) * (H - tepaPad - pastPad); }

    var chiziq = [], nuqtalar = [];
    kunlar.forEach(function(k, i){
      if (k.qiymat === null) return;
      var x = xK(i), y = yK(k.qiymat);
      chiziq.push(x + ',' + y);
      var rang = (k.qiymat < 3.9 || k.qiymat > 10) ? 'var(--anor)' : (k.qiymat > 8 ? 'var(--zar)' : 'var(--kok)');
      nuqtalar.push('<circle cx="' + x + '" cy="' + y + '" r="4" fill="' + rang + '"/>');
    });

    var haftaNomlari = M('kun_qisqa');
    var labels = kunlar.map(function(k, i){
      var nom = Array.isArray(haftaNomlari) ? haftaNomlari[k.sana.getDay()] : '';
      return '<text x="' + xK(i) + '" y="' + (H - 6) + '" font-size="10" fill="var(--siyoh-soya)" font-weight="700" text-anchor="middle">' + nom + '</text>';
    }).join('');

    var yTepa = yK(8), yPast = yK(4);
    return '<svg width="100%" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">' +
      '<rect x="' + pad + '" y="' + yTepa + '" width="' + (W - pad * 2) + '" height="' + (yPast - yTepa) + '" rx="6" fill="var(--yashil)" opacity="0.13"/>' +
      (chiziq.length > 1 ? '<polyline points="' + chiziq.join(' ') + '" fill="none" stroke="var(--kok)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' : '') +
      nuqtalar.join('') + labels + '</svg>';
  }

  function kundalikChiz(){
    var yozuvlar = kundalikYuklash();
    var hba = ehbaHisobla(yozuvlar);
    var ehbaEl = el('kdEhba'), izohEl = el('kdEhbaIzoh'), chipEl = el('kdEhbaChip');
    if (!ehbaEl) return;
    if (hba === null){
      ehbaEl.textContent = '\u2014';
      izohEl.textContent = M('kd_ehba_kam');
      chipEl.style.visibility = 'hidden';
    } else {
      ehbaEl.textContent = '\u2248 ' + raqamFormat(hba) + '%';
      izohEl.textContent = '';
      chipEl.style.visibility = 'visible';
    }

    el('kdGrafikOrama').innerHTML = grafikSvg(yozuvlar);
    kunlikGrafikChiz();

    var royxatEl = el('kdRoyxat');
    if (!yozuvlar.length){
      royxatEl.innerHTML = '<p class="kd-bosh-holat">' + M('kd_royxat_yoq') + '</p>';
    } else {
      var saralangan = yozuvlar.map(function(y, i){ return { y: y, i: i }; })
        .sort(function(a, b){ return b.y.t - a.y.t; }).slice(0, 12);
      royxatEl.innerHTML = saralangan.map(function(o){
        var y = o.y;
        var nuqta = (y.q < 3.9 || y.q > 10) ? 'kd-n-anor' : (y.q > 8 ? 'kd-n-zar' : 'kd-n-yashil');
        return '<div class="kd-qator"><span class="kd-nuqta ' + nuqta + '"></span>' +
          '<b>' + raqamFormat(y.q) + '</b><span class="kd-turi">' + turiNomi(y.turi) + '</span>' +
          '<span class="kd-vaqt">' + vaqtOldin(y.t) + '</span>' +
          '<button class="kd-och" data-idx="' + o.i + '" aria-label="' + M('kd_ochir_aria') + '">\u00d7</button></div>';
      }).join('');
    }

    var turiSelect = el('kdTuri');
    var joriy = turiSelect.value;
    turiSelect.innerHTML = ['oldin', 'keyin', 'yotish', 'boshqa'].map(function(k){
      return '<option value="' + k + '">' + turiNomi(k) + '</option>';
    }).join('');
    if (joriy) turiSelect.value = joriy;
  }

  el('kdQoshish').addEventListener('click', function(){
    var q = parseFloat(el('kdQand').value);
    if (isNaN(q) || q <= 0){ alert(M('kd_alert')); return; }
    yozuvQoshish(q, el('kdTuri').value || 'boshqa', Date.now());
    el('kdQand').value = '';
  });
  el('kdQand').addEventListener('keydown', function(e){
    if (e.key === 'Enter') el('kdQoshish').click();
  });

  el('kdRoyxat').addEventListener('click', function(ev){
    var b = ev.target.closest('.kd-och');
    if (!b) return;
    var idx = parseInt(b.getAttribute('data-idx'), 10);
    var yozuvlar = kundalikYuklash();
    var ochirilgan = yozuvlar[idx];
    yozuvlar.splice(idx, 1);
    kundalikSaqlash(yozuvlar);
    boshPanelChiz();
    kundalikChiz();
    if (BULUT_REJIM && joriyFoydalanuvchi && ochirilgan && ochirilgan._id){
      fsDb.collection('users').doc(joriyFoydalanuvchi.uid).collection('kundalik').doc(ochirilgan._id).delete().catch(function(){});
    }
  });

  el('kundalikYozTugma').addEventListener('click', function(){
    var q = parseFloat(el('hozirgiQand').value);
    if (isNaN(q) || q <= 0) return;
    yozuvQoshish(q, 'boshqa', Date.now());
    var btn = el('kundalikYozTugma');
    btn.textContent = '\u2713 ' + M('kund_yozildi');
    btn.classList.add('yozildi');
    setTimeout(function(){
      btn.textContent = M('kund_yoz_t');
      btn.classList.remove('yozildi');
    }, 2200);
  });

  // ---------- PASTKI NAVIGATSIYA ----------
  var pastkiNav = el('pastkiNav'), pnPill = el('pnPill');

  function pnPillJoyla(){
    var faolBtn = pastkiNav.querySelector('.pn-t.faol');
    if (!faolBtn) return;
    pnPill.style.width = faolBtn.offsetWidth + 'px';
    pnPill.style.transform = 'translateX(' + faolBtn.offsetLeft + 'px)';
  }

  function viewOchish(nom){
    el('viewBosh').hidden = (nom !== 'bosh');
    el('viewKundalik').hidden = (nom !== 'kundalik');
    el('viewBilim').hidden = (nom !== 'bilim');
    el('viewProfil').hidden = (nom !== 'profil');
    var tugmalar = pastkiNav.querySelectorAll('.pn-t[data-view]');
    for (var i = 0; i < tugmalar.length; i++){
      tugmalar[i].classList.toggle('faol', tugmalar[i].getAttribute('data-view') === nom);
    }
    pnPillJoyla();
    window.scrollTo({ top: 0, behavior: 'auto' });
    if (nom === 'kundalik') kundalikChiz();
    if (nom === 'bosh') boshPanelChiz();

    // Yumshoq kirish animatsiyasi
    var VIEW_ELEMENT = { bosh: 'viewBosh', kundalik: 'viewKundalik', bilim: 'viewBilim', profil: 'viewProfil' };
    var yangiEl = el(VIEW_ELEMENT[nom] || 'viewBosh');
    yangiEl.classList.remove('view-fade');
    void yangiEl.offsetWidth;
    yangiEl.classList.add('view-fade');
  }

  pastkiNav.addEventListener('click', function(ev){
    var b = ev.target.closest('.pn-t[data-view]');
    if (b) viewOchish(b.getAttribute('data-view'));
  });
  el('pnTaom').addEventListener('click', function(){ el('taomOchish').click(); });
  el('bpKundalikTugma').addEventListener('click', function(){ viewOchish('kundalik'); });
  el('bpTaomTugma').addEventListener('click', function(){ el('taomOchish').click(); });
  window.addEventListener('resize', pnPillJoyla);

  // Boshlang'ich holat: tabletka sakramasdan o'z joyiga tushadi
  pnPill.style.transition = 'none';
  pnPillJoyla();
  requestAnimationFrame(function(){ requestAnimationFrame(function(){ pnPill.style.transition = ''; }); });

  // Barcha modullar tayyor bo'lgach — saqlangan tilni qo'llab, dashboardni chizamiz
  // ---------- HISOB TIZIMI (Firebase Authentication + Firestore) ----------
  // Bu qiymatlarni O'ZINGIZNING Firebase loyihangizdan oling:
  // Firebase Console -> Project settings -> General -> "Your apps" -> Web app
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyD-FWmNgmwJbtNxe3No_znFei1POCUf2Bg",
    authDomain: "doza-insulin.firebaseapp.com",
    projectId: "doza-insulin",
    storageBucket: "doza-insulin.firebasestorage.app",
    messagingSenderId: "119581187696",
    appId: "1:119581187696:web:4f9cd7136639872499eb5"
  };

  var FIREBASE_TAYYOR = FIREBASE_CONFIG.apiKey.indexOf('BU_YERGA') !== 0;
  var joriyFoydalanuvchi = null;
  var fsDb = null;

  if (FIREBASE_TAYYOR && typeof firebase !== 'undefined'){
    try {
      firebase.initializeApp(FIREBASE_CONFIG);
      fsDb = firebase.firestore();
    } catch(e){ console.error('Firebase ishga tushmadi:', e); FIREBASE_TAYYOR = false; }
  }

  var profilTugma = el('pnProfil');
  var yopRoyxatTugma = el('yopRoyxatTugma');
  var authKirishBlok = el('authKirish'), authRoyxatBlok = el('authRoyxat'), authProfilBlok = el('authProfil');

  yopRoyxatTugma.addEventListener('click', function(){
    authKorinishAlmashtir('royxat');
    viewOchish('profil');
  });

  el('authRoyxatgaOt').addEventListener('click', function(){
    authKorinishAlmashtir('royxat');
  });
  el('authKirishgaOt').addEventListener('click', function(){
    authKorinishAlmashtir('kirish');
  });

  el('royRozilik').addEventListener('change', function(){
    el('authRoyxatTugma').disabled = !this.checked;
  });

  function authXabarKorsat(elId, matn, xato){
    var x = el(elId);
    x.textContent = matn;
    x.hidden = false;
    x.className = 'auth-xabar ' + (xato ? 'xato' : 'ok');
  }

  var authGoogleRozilikBlok = el('authGoogleRozilik');
  var EMAIL_ROYXAT_YOZILMOQDA = false;

  function authXatoMatni(err){
    var kod = err && err.code;
    var xarita = {
      'auth/email-already-in-use': M('auth_xato_band'),
      'auth/invalid-email': M('auth_xato_email'),
      'auth/weak-password': M('auth_xato_zaif'),
      'auth/user-not-found': M('auth_xato_topilmadi'),
      'auth/wrong-password': M('auth_xato_parol'),
      'auth/invalid-credential': M('auth_xato_parol'),
      'auth/too-many-requests': M('auth_xato_kop'),
      'auth/popup-blocked': M('auth_xato_popup'),
      'auth/account-exists-with-different-credential': M('auth_xato_boshqa')
    };
    return xarita[kod] || M('auth_xato_umumiy');
  }

  // Modal ichidagi 4 holatdan bittasini ko'rsatish: kirish / ro'yxat / rozilik / profil
  function authKorinishAlmashtir(nom){
    authKirishBlok.hidden = (nom !== 'kirish');
    authRoyxatBlok.hidden = (nom !== 'royxat');
    authGoogleRozilikBlok.hidden = (nom !== 'rozilik');
    authProfilBlok.hidden = (nom !== 'profil');

    var headerBlok = el('authHeaderIco');
    if (nom === 'kirish'){
      headerBlok.hidden = false;
      el('authKattaSarlavha').textContent = M('auth_kirish_sarlavha');
      el('authKichikMatn').textContent = M('auth_kirish_kichik');
    } else if (nom === 'royxat'){
      headerBlok.hidden = false;
      el('authKattaSarlavha').textContent = M('auth_royxat_sarlavha');
      el('authKichikMatn').textContent = M('auth_royxat_kichik');
    } else {
      headerBlok.hidden = true;
    }
  }

  function profilKorsat(user){
    authKorinishAlmashtir('profil');
    var nom = user.displayName || M('auth_nomsiz');
    el('authIsmKorsat').textContent = nom;
    el('authEmailKorsat').textContent = user.email || '';
    el('authAvatar').textContent = nom.charAt(0).toUpperCase();
    profilTugma.classList.add('kirilgan');
    yopRoyxatTugma.hidden = true;
  }

  function googleRozilikKorsat(user){
    authKorinishAlmashtir('rozilik');
    var ism = (user.displayName || '').split(' ')[0] || M('auth_nomsiz');
    el('authGoogleSalom').textContent = F('auth_google_salom', { ism: ism });
    el('googleRozilikBelgisi').checked = false;
    el('googleRozilikTasdiq').disabled = true;
  }

  // Telegram orqali kirish — hozircha "tez orada" (xavfsiz tekshiruv uchun backend kerak)
  ['telegramKirishTugma1','telegramKirishTugma2'].forEach(function(id){
    el(id).addEventListener('click', function(){
      var xabarId = authRoyxatBlok.hidden ? 'authXabar' : 'authXabar2';
      authXabarKorsat(xabarId, M('auth_telegram_hali_yoq'), false);
    });
  });

  if (!FIREBASE_TAYYOR || typeof firebase === 'undefined' || !fsDb){
    // Hisob tizimi hali sozlanmagan (Firebase config to'ldirilmagan) —
    // tugmalar qulay tushuntirish bilan ishlaydi, sayt qolgan qismi bemalol ishlayveradi.
    yopRoyxatTugma.hidden = false;
    ['authKirishTugma','googleKirishTugma1','authParolUnut'].forEach(function(id){
      el(id).addEventListener('click', function(){ authXabarKorsat('authXabar', M('auth_hali_yoq'), true); });
    });
    ['authRoyxatTugma','googleKirishTugma2'].forEach(function(id){
      el(id).addEventListener('click', function(){ authXabarKorsat('authXabar2', M('auth_hali_yoq'), true); });
    });
  } else {

    el('authKirishTugma').addEventListener('click', function(){
      var email = el('authEmail').value.trim();
      var parol = el('authParol').value;
      if (!email || !parol){ authXabarKorsat('authXabar', M('auth_toliq_emas'), true); return; }
      var btn = this;
      btn.disabled = true;
      firebase.auth().signInWithEmailAndPassword(email, parol)
        .then(function(){ viewOchish('bosh'); })
        .catch(function(err){ authXabarKorsat('authXabar', authXatoMatni(err), true); })
        .finally(function(){ btn.disabled = false; });
    });

    el('authRoyxatTugma').addEventListener('click', function(){
      var ism = el('royIsm').value.trim();
      var email = el('royEmail').value.trim();
      var parol = el('royParol').value;
      if (!email || !parol || parol.length < 6){ authXabarKorsat('authXabar2', M('auth_toliq_emas'), true); return; }
      if (!el('royRozilik').checked) return;
      var btn = this;
      btn.disabled = true;
      EMAIL_ROYXAT_YOZILMOQDA = true;
      firebase.auth().createUserWithEmailAndPassword(email, parol).then(function(cred){
        return cred.user.updateProfile({ displayName: ism || '' }).then(function(){
          return fsDb.collection('users').doc(cred.user.uid).set({
            name: ism || '',
            email: email,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            // Sog'liqqa oid ma'lumotlarga ishlov berish uchun aniq, yozma (elektron) rozilik yozuvi —
            // "Shaxsga doir ma'lumotlar to'g'risida"gi qonun 25-moddasi talabiga muvofiq.
            consent: { health: true, at: firebase.firestore.FieldValue.serverTimestamp(), version: 'v1' },
            settings: sozlama
          });
        }).then(function(){
          return kundalikniBulutgaKochir(cred.user.uid);
        }).then(function(){
          profilKorsat(cred.user);
          bulutdanYukla(cred.user.uid);
          viewOchish('bosh');
        });
      }).catch(function(err){
        authXabarKorsat('authXabar2', authXatoMatni(err), true);
      }).finally(function(){
        EMAIL_ROYXAT_YOZILMOQDA = false;
        btn.disabled = false;
      });
    });

    function googleBilanKirish(){
      var provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider).catch(function(err){
        if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request'){
          authXabarKorsat('authXabar', authXatoMatni(err), true);
        }
      });
      // Muvaffaqiyatli bo'lsa, davomi onAuthStateChanged orqali ishlov beriladi
    }
    el('googleKirishTugma1').addEventListener('click', googleBilanKirish);
    el('googleKirishTugma2').addEventListener('click', googleBilanKirish);

    el('googleRozilikBelgisi').addEventListener('change', function(){
      el('googleRozilikTasdiq').disabled = !this.checked;
    });

    el('googleRozilikTasdiq').addEventListener('click', function(){
      var user = firebase.auth().currentUser;
      if (!user || !el('googleRozilikBelgisi').checked) return;
      var btn = this;
      btn.disabled = true;
      fsDb.collection('users').doc(user.uid).set({
        name: user.displayName || '',
        email: user.email || '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        consent: { health: true, at: firebase.firestore.FieldValue.serverTimestamp(), version: 'v1' },
        settings: sozlama
      }).then(function(){
        return kundalikniBulutgaKochir(user.uid);
      }).then(function(){
        profilKorsat(user);
        bulutdanYukla(user.uid);
        viewOchish('bosh');
      }).finally(function(){ btn.disabled = false; });
    });

    el('googleRozilikRad').addEventListener('click', function(){
      firebase.auth().signOut();
    });

    el('authChiqishTugma').addEventListener('click', function(){
      firebase.auth().signOut();
    });

    el('authParolUnut').addEventListener('click', function(){
      var email = el('authEmail').value.trim();
      if (!email){ authXabarKorsat('authXabar', M('auth_email_kerak'), true); return; }
      firebase.auth().sendPasswordResetEmail(email).then(function(){
        authXabarKorsat('authXabar', M('auth_parol_yuborildi'), false);
      }).catch(function(err){
        authXabarKorsat('authXabar', authXatoMatni(err), true);
      });
    });

    // Mehmon rejimida (localStorage) yig'ilgan kundalik yozuvlarni,
    // hisobga kirgach bir martalik shu hisobga ko'chirib beramiz.
    function kundalikniBulutgaKochir(uid){
      var mahalliy = [];
      try {
        var raw = localStorage.getItem(KUNDALIK_KALIT);
        if (raw) mahalliy = JSON.parse(raw) || [];
      } catch(e){}
      if (!mahalliy.length) return Promise.resolve();
      var batch = fsDb.batch();
      var kol = fsDb.collection('users').doc(uid).collection('kundalik');
      mahalliy.forEach(function(y){ batch.set(kol.doc(), { t: y.t, q: y.q, turi: y.turi }); });
      return batch.commit().then(function(){
        try { localStorage.removeItem(KUNDALIK_KALIT); } catch(e){}
      });
    }

    function bulutdanYukla(uid){
      el('authSyncHolat').textContent = M('auth_sync_yuklanmoqda');
      fsDb.collection('users').doc(uid).get().then(function(doc){
        if (doc.exists && doc.data().settings){
          var s = doc.data().settings;
          sozlama = { icr: s.icr || 10, isf: s.isf || 3, maqsad: s.maqsad || 6.0 };
          sozlamaSaqlandi = true;
          el('icr').value = sozlama.icr;
          el('isf').value = sozlama.isf;
          el('maqsad').value = sozlama.maqsad;
          ochishTugma.classList.remove('diqqat');
        }
      }).catch(function(){});

      fsDb.collection('users').doc(uid).collection('kundalik').orderBy('t', 'desc').limit(500).get().then(function(qs){
        var bulut = [];
        qs.forEach(function(d){
          var ma = d.data();
          bulut.push({ _id: d.id, t: ma.t, q: ma.q, turi: ma.turi });
        });
        BULUT_KUNDALIK = bulut;
        BULUT_REJIM = true;
        boshPanelChiz();
        kundalikChiz();
        el('authSyncHolat').textContent = M('auth_sync_tayyor');
      }).catch(function(){
        el('authSyncHolat').textContent = '';
      });
    }

    firebase.auth().onAuthStateChanged(function(user){
      joriyFoydalanuvchi = user;

      if (!user){
        authKorinishAlmashtir('kirish');
        BULUT_REJIM = false;
        BULUT_KUNDALIK = [];
        profilTugma.classList.remove('kirilgan');
        yopRoyxatTugma.hidden = false;
        boshPanelChiz();
        kundalikChiz();
        return;
      }

      // Ro'yxatdan o'tish oqimi (email) o'z hujjatini o'zi yaratadi va
      // ko'rinishni o'zi almashtiradi — bu yerda unga xalaqit bermaymiz.
      if (EMAIL_ROYXAT_YOZILMOQDA) return;

      // Qolgan barcha holatlar (Google orqali kirish, sahifani qayta yuklash,
      // email orqali oddiy kirish) uchun: Firestore'da hujjat bor-yo'qligini tekshiramiz.
      // Hujjat yo'q bo'lsa — bu birinchi marta kirgan Google foydalanuvchisi,
      // sog'liq ma'lumotlariga rozilik so'raymiz.
      fsDb.collection('users').doc(user.uid).get().then(function(doc){
        if (doc.exists){
          profilKorsat(user);
          bulutdanYukla(user.uid);
        } else {
          googleRozilikKorsat(user);
        }
      }).catch(function(){
        profilKorsat(user);
      });
    });
  }

  tilQoy(BOSHLANGICH_TIL);
  authKorinishAlmashtir('kirish');

  // ---------- Yuklanish ekranini yashirish ----------
  // Juda tez qurilmalarda "yalt etib" ko'rinmasligi uchun eng kamida 500ms ko'rsatamiz
  var YUKLANISH_BOSHI = window.__yuklanishBoshi || Date.now();
  (function(){
    var otgan = Date.now() - YUKLANISH_BOSHI;
    var kutish = Math.max(0, 500 - otgan);
    setTimeout(function(){
      var ekran = el('yuklanishEkrani');
      if (ekran) ekran.classList.add('yashirin');
      // Bosh sahifa bloklari birin-ketin, yumshoq tarzda paydo bo'ladi
      var bloklar = document.querySelectorAll('#viewBosh .stagger-blok');
      for (var i = 0; i < bloklar.length; i++){
        (function(blok, idx){
          blok.style.animationDelay = (idx * 85) + 'ms';
          blok.classList.add('kirdi');
        })(bloklar[i], i);
      }
    }, kutish);
  })();
})();