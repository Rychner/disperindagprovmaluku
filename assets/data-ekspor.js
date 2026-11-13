/*
 * DATA CONTOH harga ekspor — bukan data resmi.
 * Ganti isi file ini (atau muat dari API/database, mis. Laravel) dengan data riil.
 *
 * kurs           : kurs referensi USD -> IDR (dipakai untuk tampilan Rupiah)
 * tujuan[].f     : faktor harga relatif terhadap rata-rata FOB semua negara tujuan
 * komoditas[].h  : harga FOB 7 hari terakhir dalam USD per satuan,
 *                  urutan lama -> baru (terakhir = hari ini, sebelumnya = kemarin)
 * komoditas[].t  : tujuan ekspor utama
 */
window.EKSPOR_DATA = {
  diperbarui: "09.00 WIT",
  sumber: "Disperindag Provinsi Maluku",
  kurs: 16350,
  tujuan: [
    { id: "all",   nama: "Semua negara tujuan", f: 1.00 },
    { id: "cn",    nama: "Tiongkok",       f: 0.97 },
    { id: "jp",    nama: "Jepang",         f: 1.08 },
    { id: "us",    nama: "Amerika Serikat", f: 1.06 },
    { id: "eu",    nama: "Uni Eropa",      f: 1.10 },
    { id: "in",    nama: "India",          f: 0.95 },
    { id: "vn",    nama: "Vietnam",        f: 0.96 },
    { id: "th",    nama: "Thailand",       f: 0.94 }
  ],
  kategori: [
    "Perikanan Tangkap",
    "Budidaya & Hasil Laut",
    "Rempah & Atsiri",
    "Kelapa & Perkebunan"
  ],
  komoditas: [
    // Perikanan Tangkap
    { n: "Tuna Sirip Kuning Beku (Loin)", k: "Perikanan Tangkap", u: "kg", t: "Jepang, Amerika Serikat, Uni Eropa", h: [9.80,9.80,9.90,10.00,10.00,10.10,10.20] },
    { n: "Tuna Segar Grade A",            k: "Perikanan Tangkap", u: "kg", t: "Jepang, Tiongkok",                   h: [7.40,7.50,7.50,7.60,7.60,7.50,7.40] },
    { n: "Cakalang Beku",                 k: "Perikanan Tangkap", u: "kg", t: "Thailand, Vietnam",                  h: [1.55,1.55,1.60,1.60,1.60,1.62,1.65] },
    { n: "Layang Beku",                   k: "Perikanan Tangkap", u: "kg", t: "Tiongkok, Vietnam",                  h: [1.05,1.05,1.05,1.05,1.05,1.05,1.05] },
    // Budidaya & Hasil Laut
    { n: "Rumput Laut Kering (Cottonii)", k: "Budidaya & Hasil Laut", u: "kg", t: "Tiongkok, Vietnam",              h: [1.35,1.35,1.34,1.34,1.32,1.32,1.30] },
    { n: "Lobster Hidup",                 k: "Budidaya & Hasil Laut", u: "kg", t: "Tiongkok, Vietnam",              h: [38.00,38.00,38.50,38.50,39.00,39.00,39.00] },
    { n: "Teripang Kering",               k: "Budidaya & Hasil Laut", u: "kg", t: "Tiongkok",                       h: [62.00,62.00,62.00,63.00,63.00,64.00,64.00] },
    { n: "Udang Vaname Beku",             k: "Budidaya & Hasil Laut", u: "kg", t: "Jepang, Amerika Serikat",        h: [6.90,6.90,6.80,6.80,6.85,6.85,6.90] },
    // Rempah & Atsiri
    { n: "Pala Biji Kering",              k: "Rempah & Atsiri", u: "kg", t: "India, Uni Eropa, Vietnam",            h: [8.20,8.30,8.30,8.40,8.50,8.50,8.60] },
    { n: "Fuli Pala",                     k: "Rempah & Atsiri", u: "kg", t: "Uni Eropa, Amerika Serikat",           h: [19.50,19.50,19.40,19.40,19.40,19.20,19.20] },
    { n: "Cengkih Kering",                k: "Rempah & Atsiri", u: "kg", t: "India, Vietnam",                       h: [7.90,7.90,8.00,8.00,8.10,8.10,8.05] },
    { n: "Minyak Pala",                   k: "Rempah & Atsiri", u: "kg", t: "Uni Eropa, Amerika Serikat",           h: [58.00,58.00,58.50,58.50,59.00,59.00,59.50] },
    { n: "Minyak Cengkih",                k: "Rempah & Atsiri", u: "kg", t: "India, Uni Eropa",                     h: [11.20,11.20,11.20,11.40,11.40,11.40,11.40] },
    // Kelapa & Perkebunan
    { n: "Kopra",                         k: "Kelapa & Perkebunan", u: "ton", t: "India, Tiongkok",                  h: [1180,1180,1190,1190,1200,1210,1220] },
    { n: "Minyak Kelapa Kasar (CNO)",     k: "Kelapa & Perkebunan", u: "ton", t: "Uni Eropa, Amerika Serikat",       h: [2650,2650,2640,2640,2620,2610,2600] },
    { n: "Kakao Biji Fermentasi",         k: "Kelapa & Perkebunan", u: "ton", t: "Uni Eropa, Amerika Serikat",       h: [6300,6250,6250,6200,6200,6150,6100] },
    { n: "Pati Sagu",                     k: "Kelapa & Perkebunan", u: "ton", t: "Tiongkok, Thailand",               h: [480,480,480,490,490,490,490] }
  ]
};
