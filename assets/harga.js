(function () {
  "use strict";
  var D = window.HARGA_DATA;
  var TZ = "Asia/Jayapura";

  /* ---------- util ---------- */
  var rp = function (n) { return "Rp " + Math.round(n).toLocaleString("id-ID"); };
  var pct = function (n) { return Math.abs(n).toLocaleString("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%"; };
  var $ = function (id) { return document.getElementById(id); };
  var icon = function (n) { return '<svg class="i" aria-hidden="true"><use href="#i-' + n + '"/></svg>'; };
  var round = function (v) { var s = v >= 100000 ? 1000 : 100; return Math.round(v / s) * s; };

  var now = new Date();
  var yest = new Date(now.getTime() - 864e5);
  var fmtLong  = new Intl.DateTimeFormat("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TZ });
  var fmtShort = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: TZ });

  /* ---------- state ---------- */
  var state = { pasar: "all", kat: "Semua", q: "", key: "n", dir: 1 };

  /* ---------- data turunan ---------- */
  function build() {
    var m = D.pasar.filter(function (p) { return p.id === state.pasar; })[0];
    return D.komoditas.map(function (c) {
      var h = c.h.map(function (v) { return round(v * m.f); });
      var today = h[h.length - 1], prev = h[h.length - 2], diff = today - prev;
      return {
        n: c.n, k: c.k, u: c.u, h: h, today: today, prev: prev, diff: diff,
        p: prev ? diff / prev * 100 : 0,
        st: diff > 0 ? "up" : diff < 0 ? "down" : "flat"
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

  function chg(r, withPct) {
    var lbl = r.st === "up" ? "Naik" : r.st === "down" ? "Turun" : "Stabil";
    var ic = r.st === "up" ? "up" : r.st === "down" ? "down" : "minus";
    var txt = r.st === "flat" ? "Stabil" : (withPct === false ? pct(r.p) : rp(Math.abs(r.diff)) + " (" + pct(r.p) + ")");
    return '<span class="chg ' + r.st + '" title="' + lbl + '">' + icon(ic) + txt + "</span>";
  }

  /* ---------- render ---------- */
  function render() {
    var all = build();

    // ringkasan (seluruh komoditas pada pasar terpilih)
    var cnt = { up: 0, down: 0, flat: 0 };
    all.forEach(function (r) { cnt[r.st]++; });
    $("s-total").textContent = all.length;
    $("s-up").textContent = cnt.up;
    $("s-down").textContent = cnt.down;
    $("s-flat").textContent = cnt.flat;

    // pergerakan terbesar
    function movers(list, el, dirEmpty) {
      el.innerHTML = list.length ? list.map(function (r) {
        return '<li><div><span class="nm">' + r.n + "</span><small>" + rp(r.today) + " / " + r.u + "</small></div>" + chg(r, false) + "</li>";
      }).join("") : '<li class="empty">' + dirEmpty + "</li>";
    }
    var ups = all.filter(function (r) { return r.st === "up"; }).sort(function (a, b) { return b.p - a.p; }).slice(0, 3);
    var downs = all.filter(function (r) { return r.st === "down"; }).sort(function (a, b) { return a.p - b.p; }).slice(0, 3);
    movers(ups, $("m-up"), "Tidak ada komoditas yang naik hari ini.");
    movers(downs, $("m-down"), "Tidak ada komoditas yang turun hari ini.");

    // filter tabel
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
        '<td><div class="nm">' + r.n + '</div><span class="cat">' + r.k + '<span class="u-m"> &middot; per ' + r.u + "</span></span></td>" +
        '<td class="unit">' + r.u + "</td>" +
        '<td class="r prev">' + rp(r.prev) + "</td>" +
        '<td class="r now">' + rp(r.today) + "</td>" +
        '<td class="r">' + chg(r) + "</td>" +
        "<td>" + spark(r.h, r.st) + "</td></tr>";
    }).join("");

    $("count").textContent = rows.length + " dari " + all.length + " komoditas";
    $("nores").classList.toggle("show", rows.length === 0);
    $("tscroll").style.display = rows.length ? "" : "none";

    // aria-sort
    document.querySelectorAll("th[data-key]").forEach(function (th) {
      th.setAttribute("aria-sort", th.dataset.key === state.key ? (state.dir > 0 ? "ascending" : "descending") : "none");
    });
  }
  var current = [];

  /* ---------- init ---------- */
  function init() {
    var tgl = fmtLong.format(now);
    $("tgl").textContent = tgl;
    $("tgl-title").textContent = tgl;
    $("upd").textContent = D.diperbarui;
    $("th-prev").textContent = "Kemarin (" + fmtShort.format(yest) + ")";
    $("th-now").textContent = "Hari Ini (" + fmtShort.format(now) + ")";
    $("src").textContent = D.sumber;

    // pasar
    $("pasar").innerHTML = D.pasar.map(function (p) { return '<option value="' + p.id + '">' + p.nama + "</option>"; }).join("");
    $("pasar").addEventListener("change", function (e) { state.pasar = e.target.value; updTitle(); render(); });

    // kategori
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

    // cari
    $("cari").addEventListener("input", function (e) { state.q = e.target.value; render(); });

    // urut
    document.querySelectorAll("th[data-key]").forEach(function (th) {
      th.querySelector(".th").addEventListener("click", function () {
        var k = th.dataset.key;
        if (state.key === k) state.dir *= -1; else { state.key = k; state.dir = 1; }
        render();
      });
    });

    // unduh CSV
    $("csv").addEventListener("click", function () {
      var pasar = D.pasar.filter(function (p) { return p.id === state.pasar; })[0].nama;
      var head = ["Komoditas", "Kategori", "Satuan", "Harga Kemarin", "Harga Hari Ini", "Perubahan (Rp)", "Perubahan (%)", "Pasar", "Tanggal"];
      var tgl = new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(now);
      var lines = [head].concat(current.map(function (r) {
        return [r.n, r.k, r.u, r.prev, r.today, r.diff, r.p.toFixed(2).replace(".", ","), pasar, tgl];
      })).map(function (l) {
        return l.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(";");
      });
      var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "harga-pasar-" + tgl + ".csv";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
    $("print").addEventListener("click", function () { window.print(); });

    updTitle();
    render();
  }

  function updTitle() {
    var p = D.pasar.filter(function (x) { return x.id === state.pasar; })[0];
    $("pasar-title").textContent = p.nama;
  }

  init();
})();
