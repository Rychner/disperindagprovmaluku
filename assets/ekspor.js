(function () {
  "use strict";
  var D = window.EKSPOR_DATA;
  var TZ = "Asia/Jayapura";

  /* ---------- util ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var icon = function (n) { return '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  var id = function (n, d) { return n.toLocaleString("id-ID", { minimumFractionDigits: d, maximumFractionDigits: d }); };
  var pct = function (n) { return id(Math.abs(n), 1) + "%"; };
  var decOf = function (u) { return u === "ton" ? 0 : 2; };
  var usd = function (v, u) { return "US$ " + id(v, decOf(u)); };
  var idr = function (v) { var s = v >= 1e6 ? 1000 : 100; return "Rp " + (Math.round(v / s) * s).toLocaleString("id-ID"); };
  var rd = function (v, u) { return u === "ton" ? Math.round(v) : Math.round(v * 100) / 100; };

  var now = new Date();
  var yest = new Date(now.getTime() - 864e5);
  var fmtLong  = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  var fmtShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: TZ });

  var state = { tujuan: "all", kat: "Semua", q: "", key: "n", dir: 1, cur: "USD" };
  var current = [];

  var money = function (v, u) { return state.cur === "USD" ? usd(v, u) : idr(v * D.kurs); };

  /* ---------- data turunan ---------- */
  function build() {
    var m = D.tujuan.filter(function (p) { return p.id === state.tujuan; })[0];
    return D.komoditas.map(function (c) {
      var h = c.h.map(function (v) { return rd(v * m.f, c.u); });
      var today = h[h.length - 1], prev = h[h.length - 2], diff = rd(today - prev, c.u);
      return {
        n: c.n, k: c.k, u: c.u, t: c.t, h: h, today: today, prev: prev, diff: diff,
        p: prev ? (today - prev) / prev * 100 : 0,
        st: today > prev ? "up" : today < prev ? "down" : "flat"
      };
    });
  }

  /* ---------- sparkline ---------- */
  function spark(h, st) {
    var W = 96, H = 30, P = 4;
    var mn = Math.min.apply(null, h), mx = Math.max.apply(null, h), rg = mx - mn || 1;
    var pts = h.map(function (v, i) {
      return [P + i * (W - 2 * P) / (h.length - 1), mx === mn ? H / 2 : H - P - (v - mn) / rg * (H - 2 * P)];
    });
    var col = st === "up" ? "#c4320a" : st === "down" ? "#067647" : "#667085";
    var last = pts[pts.length - 1];
    return '<svg class="spark" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + " " + H +
      '" role="img" aria-label="Tren 7 hari terakhir"><polyline fill="none" stroke="' + col +
      '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" points="' +
      pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") +
      '"/><circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="2.8" fill="' + col + '"/></svg>';
  }

  function chg(r, onlyPct) {
    var lbl = r.st === "up" ? "Naik" : r.st === "down" ? "Turun" : "Stabil";
    var ic = r.st === "up" ? "up" : r.st === "down" ? "down" : "minus";
    var txt = r.st === "flat" ? "Stabil" : (onlyPct ? pct(r.p) : money(Math.abs(r.diff), r.u) + " (" + pct(r.p) + ")");
    return '<span class="chg ' + r.st + '" title="' + lbl + '">' + icon(ic) + txt + "</span>";
  }

  /* ---------- render ---------- */
  function render() {
    var all = build();

    var cnt = { up: 0, down: 0, flat: 0 };
    all.forEach(function (r) { cnt[r.st]++; });
    $("s-total").textContent = all.length;
    $("s-up").textContent = cnt.up;
    $("s-down").textContent = cnt.down;
    $("s-flat").textContent = cnt.flat;

    function movers(list, el, empty) {
      el.innerHTML = list.length ? list.map(function (r) {
        return '<li><div><span class="nm">' + r.n + "</span><small>" + money(r.today, r.u) + " / " + r.u + "</small></div>" + chg(r, true) + "</li>";
      }).join("") : '<li class="empty">' + empty + "</li>";
    }
    movers(all.filter(function (r) { return r.st === "up"; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 3),
      $("m-up"), "Tidak ada komoditas yang naik hari ini.");
    movers(all.filter(function (r) { return r.st === "down"; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 3),
      $("m-down"), "Tidak ada komoditas yang turun hari ini.");

    var q = state.q.trim().toLowerCase();
    var rows = all.filter(function (r) {
      return (state.kat === "Semua" || r.k === state.kat) && (!q || r.n.toLowerCase().indexOf(q) > -1);
    });
    rows.sort(function (a, b) {
      var x = a[state.key], y = b[state.key];
      if (typeof x === "string") return x.localeCompare(y, "id") * state.dir;
      return (x - y) * state.dir || a.n.localeCompare(b.n, "id");
    });
    current = rows;

    $("tbody").innerHTML = rows.map(function (r) {
      return "<tr>" +
        '<td><div class="nm">' + r.n + '</div><span class="cat">' + r.k + '<span class="u-m"> &middot; per ' + r.u + "</span></span>" +
        '<span class="dest">Tujuan utama: ' + r.t + "</span></td>" +
        '<td class="unit">' + r.u + "</td>" +
        '<td class="r prev">' + money(r.prev, r.u) + "</td>" +
        '<td class="r now">' + money(r.today, r.u) + "</td>" +
        '<td class="r">' + chg(r) + "</td>" +
        "<td>" + spark(r.h, r.st) + "</td></tr>";
    }).join("");

    $("count").textContent = rows.length + " dari " + all.length + " komoditas";
    $("nores").classList.toggle("show", rows.length === 0);
    $("tscroll").style.display = rows.length ? "" : "none";
    document.querySelectorAll("th[data-key]").forEach(function (th) {
      th.setAttribute("aria-sort", th.dataset.key === state.key ? (state.dir > 0 ? "ascending" : "descending") : "none");
    });
  }

  function updTitle() {
    var p = D.tujuan.filter(function (x) { return x.id === state.tujuan; })[0];
    $("tujuan-title").textContent = p.id === "all" ? "Semua Negara Tujuan" : p.nama;
    $("kurs").textContent = state.cur === "IDR"
      ? "Kurs referensi: Rp " + D.kurs.toLocaleString("id-ID") + " / US$"
      : "Harga FOB dalam US$";
  }

  /* ---------- init ---------- */
  function init() {
    var tgl = fmtLong.format(now);
    $("tgl").textContent = tgl;
    $("tgl-title").textContent = tgl;
    $("upd").textContent = D.diperbarui;
    $("th-prev").textContent = "Kemarin (" + fmtShort.format(yest) + ")";
    $("th-now").textContent = "Hari Ini (" + fmtShort.format(now) + ")";
    $("src").textContent = D.sumber;
    $("kurs-note").textContent = "Rp " + D.kurs.toLocaleString("id-ID");

    $("tujuan").innerHTML = D.tujuan.map(function (p) { return '<option value="' + p.id + '">' + p.nama + "</option>"; }).join("");
    $("tujuan").addEventListener("change", function (e) { state.tujuan = e.target.value; updTitle(); render(); });

    var cats = ["Semua"].concat(D.kategori);
    $("chips").innerHTML = cats.map(function (c) {
      return '<button type="button" class="chip" aria-pressed="' + (c === "Semua") + '" data-k="' + c + '">' + c + "</button>";
    }).join("");
    $("chips").addEventListener("click", function (e) {
      var b = e.target.closest(".chip"); if (!b) return;
      state.kat = b.dataset.k;
      document.querySelectorAll(".chip").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      render();
    });

    $("seg").addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      state.cur = b.dataset.c;
      document.querySelectorAll("#seg button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      updTitle(); render();
    });

    $("cari").addEventListener("input", function (e) { state.q = e.target.value; render(); });

    document.querySelectorAll("th[data-key]").forEach(function (th) {
      th.querySelector(".th").addEventListener("click", function () {
        var k = th.dataset.key;
        if (state.key === k) state.dir *= -1; else { state.key = k; state.dir = 1; }
        render();
      });
    });

    $("csv").addEventListener("click", function () {
      var tuj = D.tujuan.filter(function (p) { return p.id === state.tujuan; })[0].nama;
      var tgl = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
      var dec = function (v, u) { return String(v).replace(".", ","); };
      var head = ["Komoditas", "Kategori", "Satuan", "Tujuan Utama", "Harga Kemarin (USD)", "Harga Hari Ini (USD)",
        "Perubahan (USD)", "Perubahan (%)", "Harga Hari Ini (IDR)", "Kurs (IDR/USD)", "Filter Negara Tujuan", "Tanggal"];
      var lines = [head].concat(current.map(function (r) {
        return [r.n, r.k, r.u, r.t, dec(r.prev), dec(r.today), dec(r.diff), r.p.toFixed(2).replace(".", ","),
          Math.round(r.today * D.kurs), D.kurs, tuj, tgl];
      })).map(function (l) {
        return l.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(";");
      });
      var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "harga-ekspor-" + tgl + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    $("print").addEventListener("click", function () { window.print(); });

    updTitle();
    render();
  }

  init();
})();
