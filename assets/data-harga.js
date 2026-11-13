/*
 * DATA CONTOH harga pasar — bukan data resmi.
 * Ganti isi file ini (atau muat dari API/database, mis. Laravel) dengan data riil.
 *
 * pasar[].f      : faktor harga relatif terhadap rata-rata kota
 * komoditas[].h  : harga rata-rata 7 hari terakhir, urutan lama -> baru
 *                  (elemen terakhir = hari ini, sebelumnya = kemarin)
 */
window.HARGA_DATA = {
  diperbarui: "08.00 WIT",
  sumber: "Disperindag Provinsi Maluku",
  pasar: [
    { id: "all",        nama: "Rata-rata Kota Ambon", f: 1.00 },
    { id: "mardika",    nama: "Pasar Mardika",        f: 1.00 },
    { id: "batu-merah", nama: "Pasar Batu Merah",     f: 0.98 },
    { id: "passo",      nama: "Pasar Passo",          f: 1.03 },
    { id: "apui",       nama: "Pasar Apui",           f: 1.05 }
  ],
  kategori: [
    "Beras & Tepung",
    "Daging & Telur",
    "Ikan",
    "Sayur & Buah",
    "Bumbu & Rempah",
    "Minyak, Gula & Garam"
  ],
  komoditas: [
    // Beras & Tepung
    { n: "Beras Premium",            k: "Beras & Tepung", u: "kg",    h: [16000,16000,16100,16100,16100,16100,16200] },
    { n: "Beras Medium",             k: "Beras & Tepung", u: "kg",    h: [14400,14400,14400,14500,14500,14500,14500] },
    { n: "Tepung Terigu (curah)",    k: "Beras & Tepung", u: "kg",    h: [13000,13000,13000,13000,13000,13200,13200] },
    { n: "Sagu Tumbuk",              k: "Beras & Tepung", u: "kg",    h: [14000,14000,14500,14500,14500,14500,14000] },
    // Daging & Telur
    { n: "Daging Sapi Murni",        k: "Daging & Telur", u: "kg",    h: [138000,138000,138000,140000,140000,140000,142000] },
    { n: "Daging Ayam Ras",          k: "Daging & Telur", u: "kg",    h: [41000,41000,40000,40000,39000,39000,38500] },
    { n: "Telur Ayam Ras",           k: "Daging & Telur", u: "kg",    h: [34000,34000,34500,35000,35000,35500,36000] },
    // Ikan
    { n: "Ikan Cakalang",            k: "Ikan",           u: "kg",    h: [38000,40000,42000,41000,40000,40000,40000] },
    { n: "Ikan Tongkol",             k: "Ikan",           u: "kg",    h: [34000,35000,35000,36000,36000,35000,34000] },
    { n: "Ikan Kembung",             k: "Ikan",           u: "kg",    h: [42000,42000,43000,43000,44000,44000,45000] },
    { n: "Ikan Layang (Momar)",      k: "Ikan",           u: "kg",    h: [30000,30000,30000,32000,32000,31000,31000] },
    { n: "Ikan Teri Kering",         k: "Ikan",           u: "kg",    h: [90000,90000,90000,92000,92000,92000,92000] },
    // Sayur & Buah
    { n: "Cabai Merah Keriting",     k: "Sayur & Buah",   u: "kg",    h: [52000,54000,56000,58000,60000,61000,63000] },
    { n: "Cabai Rawit Merah",        k: "Sayur & Buah",   u: "kg",    h: [75000,74000,72000,72000,70000,69000,68000] },
    { n: "Bawang Merah",             k: "Sayur & Buah",   u: "kg",    h: [38000,38000,39000,39000,40000,40000,40000] },
    { n: "Bawang Putih",             k: "Sayur & Buah",   u: "kg",    h: [36000,36000,36000,37000,37000,37000,36500] },
    { n: "Tomat",                    k: "Sayur & Buah",   u: "kg",    h: [18000,19000,20000,20000,21000,22000,22000] },
    { n: "Kentang",                  k: "Sayur & Buah",   u: "kg",    h: [19000,19000,19000,19000,19500,19500,19500] },
    { n: "Kol / Kubis",              k: "Sayur & Buah",   u: "kg",    h: [14000,14000,15000,15000,16000,16000,15000] },
    { n: "Wortel",                   k: "Sayur & Buah",   u: "kg",    h: [22000,22000,22000,22500,22500,23000,23000] },
    { n: "Kangkung",                 k: "Sayur & Buah",   u: "ikat",  h: [3000,3000,3000,4000,4000,4000,4000] },
    { n: "Kelapa Butir",             k: "Sayur & Buah",   u: "butir", h: [8000,8000,8000,9000,9000,9000,9000] },
    // Bumbu & Rempah
    { n: "Cengkih Kering",           k: "Bumbu & Rempah", u: "kg",    h: [118000,120000,120000,122000,122000,125000,126000] },
    { n: "Pala Biji Kering",         k: "Bumbu & Rempah", u: "kg",    h: [128000,128000,130000,130000,130000,130000,128000] },
    { n: "Jahe",                     k: "Bumbu & Rempah", u: "kg",    h: [30000,30000,32000,32000,33000,33000,34000] },
    // Minyak, Gula & Garam
    { n: "Minyak Goreng Curah",      k: "Minyak, Gula & Garam", u: "liter", h: [17500,17500,17500,17500,17500,17500,17500] },
    { n: "Minyakita",                k: "Minyak, Gula & Garam", u: "liter", h: [16500,16500,16500,16600,16600,16700,16700] },
    { n: "Gula Pasir",               k: "Minyak, Gula & Garam", u: "kg",    h: [18800,18800,18800,18600,18600,18500,18500] },
    { n: "Garam Beryodium",          k: "Minyak, Gula & Garam", u: "kg",    h: [9000,9000,9000,9000,9000,9000,9500] }
  ]
};
