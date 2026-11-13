/*
 * DATA CONTOH setoran PAD — dibangkitkan otomatis, bukan data resmi.
 * Nilai tiap hari dibuat deterministik (seed dari tanggal), jadi angka hari yang sama selalu sama.
 * Ganti dengan data dari database/API: cukup hasilkan array record dengan bentuk yang sama.
 *
 * record = { id, tgl:"YYYY-MM-DD", sumber:<id sumber>, lokasi, jumlah (Rp), bukti, status:"Terverifikasi"|"Menunggu" }
 */
(function () {
  "use strict";
  var TZ = "Asia/Jayapura";
  var DAY = 864e5;

  var SUMBER = [
    { id: "pasar", nama: "Retribusi Pasar" },
    { id: "izin",  nama: "Retribusi Perizinan Usaha" },
    { id: "tera",  nama: "Retribusi Tera & Tera Ulang" },
    { id: "aset",  nama: "Sewa Aset Daerah" },
    { id: "lain",  nama: "Penerimaan Lain-lain" }
  ];
  var LOKASI = {
    pasar: ["Pasar Mardika", "Pasar Batu Merah", "Pasar Passo", "Pasar Apui"],
    izin:  ["Loket Perizinan Usaha"],
    tera:  ["UPT Metrologi Legal"],
    aset:  ["Gudang & Aset Daerah"],
    lain:  ["Kas Dinas"]
  };
  var TARGET = { bulan: 350000000, tahun: 4200000000 };

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function hash(s) {
    var h = 2166136261;
    for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  var p2 = function (n) { return (n < 10 ? "0" : "") + n; };
  var fmtISO = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });
  function todayISO() { return fmtISO.format(new Date()); }
  function toUTC(iso) { var p = iso.split("-"); return Date.UTC(+p[0], +p[1] - 1, +p[2]); }
  function fromUTC(ms) { var d = new Date(ms); return d.getUTCFullYear() + "-" + p2(d.getUTCMonth() + 1) + "-" + p2(d.getUTCDate()); }
  var r5 = function (v) { return Math.round(v / 5000) * 5000; };

  function generate(today) {
    var end = toUTC(today), start = end - 420 * DAY, out = [], seq = 0;
    for (var t = start; t <= end; t += DAY) {
      var iso = fromUTC(t), r = mulberry32(hash(iso));
      var dow = new Date(t).getUTCDay();             // 0 = Minggu
      var weekday = dow >= 1 && dow <= 5, sun = dow === 0;
      var age = (end - t) / DAY;
      var growth = 1 + (420 - age) / 420 * 0.12;     // tren naik pelan
      var add = function (sumber, amt) {
        var lok = LOKASI[sumber];
        seq++;
        out.push({
          id: "g" + seq, tgl: iso, sumber: sumber, lokasi: lok[Math.floor(r() * lok.length)],
          jumlah: r5(amt * growth), bukti: "STS-" + iso.slice(0, 4) + "-" + String(10000 + seq),
          status: age > 2 ? "Terverifikasi" : (r() < 0.6 ? "Terverifikasi" : "Menunggu")
        });
      };
      var i, n;
      n = sun ? 1 : 2 + Math.floor(r() * 2);
      for (i = 0; i < n; i++) add("pasar", (1.2e6 + r() * 3.3e6) * (sun ? 0.6 : 1));
      if (weekday) { n = Math.floor(r() * 4); for (i = 0; i < n; i++) add("izin", 0.5e6 + r() * 3.0e6); }
      if (weekday) { n = Math.floor(r() * 3); for (i = 0; i < n; i++) add("tera", 0.3e6 + r() * 2.2e6); }
      if (r() < 0.12) add("aset", 3e6 + r() * 9e6);
      if (r() < 0.35) add("lain", 0.2e6 + r() * 1.3e6);
    }
    return out;
  }

  window.PadData = {
    TZ: TZ, DAY: DAY, SUMBER: SUMBER, LOKASI: LOKASI, TARGET: TARGET,
    todayISO: todayISO, toUTC: toUTC, fromUTC: fromUTC, generate: generate
  };
})();
