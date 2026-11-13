(function () {
  "use strict";
  var user = window.PadAuth && PadAuth.current();
  if (!user) return; // penjaga di <head> sudah mengalihkan ke login

  var P = window.PadData;
  var NS = "http://www.w3.org/2000/svg";
  var $ = function (id) { return document.getElementById(id); };
  var DAY = P.DAY;
  var today = P.todayISO(), todayMs = P.toUTC(today);

  /* ---------- util ---------- */
  var nf = new Intl.NumberFormat("id-ID");
  var rp = function (v) { return "Rp " + nf.format(Math.round(v)); };
  var t1 = function (x) { return (Math.round(x * 10) / 10).toLocaleString("id-ID"); };
  function compact(v) {
    if (v === 0) return "0";
    if (v >= 1e9) return t1(v / 1e9) + " M";
    if (v >= 1e6) return t1(v / 1e6) + " jt";
    return nf.format(v);
  }
  var F = function (o) { o.timeZone = "UTC"; return new Intl.DateTimeFormat("id-ID", o); };
  var fShort = F({ day: "numeric", month: "short" });
  var fDate  = F({ day: "numeric", month: "short", year: "numeric" });
  var fLong  = F({ weekday: "long", day: "numeric", month: "long", year: "numeric" });
  var fMonth = F({ month: "short" });
  var fMonthL = F({ month: "long", year: "numeric" });
  var fMonthName = F({ month: "long" });

  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "class") e.className = attrs[k]; else e.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { e.appendChild(typeof c === "string" ? document.createTextNode(c) : c); });
    return e;
  }
  function ico(name) {
    var s = document.createElementNS(NS, "svg"); s.setAttribute("class", "i"); s.setAttribute("aria-hidden", "true");
    var u = document.createElementNS(NS, "use"); u.setAttribute("href", "#i-" + name); s.appendChild(u); return s;
  }
  function snode(tag, attrs, text) {
    var e = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- data ---------- */
  var EXKEY = "pad_demo_extra";
  function loadExtra() {
    try {
      var a = JSON.parse(localStorage.getItem(EXKEY) || "[]");
      return Array.isArray(a) ? a.filter(function (r) {
        return r && /^\d{4}-\d{2}-\d{2}$/.test(r.tgl) && typeof r.jumlah === "number" && r.jumlah > 0 && r.sumber && r.bukti;
      }) : [];
    } catch (e) { return []; }
  }
  function saveExtra() { try { localStorage.setItem(EXKEY, JSON.stringify(extras)); } catch (e) { /* abaikan */ } }

  var extras = loadExtra();
  var base = P.generate(today);
  var recs = [], dayTot = {}, dayCnt = {};
  var srcName = {}; P.SUMBER.forEach(function (s) { srcName[s.id] = s.nama; });

  function reindex() {
    recs = base.concat(extras); dayTot = {}; dayCnt = {};
    recs.forEach(function (r) { dayTot[r.tgl] = (dayTot[r.tgl] || 0) + r.jumlah; dayCnt[r.tgl] = (dayCnt[r.tgl] || 0) + 1; });
  }
  function sumRange(a, b) {
    var s = 0, n = 0;
    for (var t = a; t <= b; t += DAY) { var k = P.fromUTC(t); s += dayTot[k] || 0; n += dayCnt[k] || 0; }
    return { sum: s, n: n };
  }

  /* ---------- tanggal ---------- */
  var weekStart = function (ms) { return ms - ((new Date(ms).getUTCDay() + 6) % 7) * DAY; };
  var monthStart = function (ms) { var d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1); };
  var addMonths = function (ms, n) { var d = new Date(ms); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1); };
  var daysIn = function (ms) { var d = new Date(ms); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate(); };

  var NAMA = { hari: "Hari ini", minggu: "Minggu ini", bulan: "Bulan ini" };

  function range(p) {
    if (p === "hari") return { a: todayMs, b: todayMs, pa: todayMs - DAY, pb: todayMs - DAY, cmp: "kemarin" };
    if (p === "minggu") {
      var a = weekStart(todayMs);
      return { a: a, b: todayMs, pa: a - 7 * DAY, pb: todayMs - 7 * DAY, cmp: "rentang sama minggu lalu" };
    }
    var ma = monthStart(todayMs), pa = addMonths(ma, -1);
    var dd = new Date(todayMs).getUTCDate();
    return { a: ma, b: todayMs, pa: pa, pb: pa + (Math.min(dd, daysIn(pa)) - 1) * DAY, cmp: "rentang sama bulan lalu" };
  }
  function rangeLabel(p) {
    var r = range(p);
    if (p === "hari") return fLong.format(r.a);
    if (p === "minggu") return fShort.format(r.a) + " – " + fDate.format(r.b);
    return "1 – " + new Date(r.b).getUTCDate() + " " + fMonthL.format(r.b);
  }

  /* ---------- state ---------- */
  var state = { periode: "hari", view: "grafik", limit: 10 };

  /* ---------- tile periode ---------- */
  function renderTiles() {
    var host = $("tiles"); host.textContent = "";
    ["hari", "minggu", "bulan"].forEach(function (p) {
      var r = range(p), cur = sumRange(r.a, r.b), prev = sumRange(r.pa, r.pb);
      var pct = prev.sum ? (cur.sum - prev.sum) / prev.sum * 100 : 0;
      var st = pct > 0.05 ? "up" : pct < -0.05 ? "down" : "flat";
      var dtxt = st === "flat" ? "Stabil" : (pct > 0 ? "+" : "−") + t1(Math.abs(pct)) + "%";

      var kids = [
        el("div", { class: "tile__top" }, [
          el("span", { class: "tile__lbl" }, ["Setoran " + NAMA[p].toLowerCase()]),
          el("span", { class: "tile__sel" }, ["Ditampilkan"])
        ]),
        el("div", { class: "tile__val" }, [rp(cur.sum)]),
        el("div", { class: "tile__meta" }, [rangeLabel(p) + " · " + cur.n + " setoran"]),
        el("div", { class: "tile__foot" }, [
          el("span", { class: "delta " + st }, [ico(st === "up" ? "up" : st === "down" ? "down" : "minus"), dtxt]),
          el("span", {}, ["dibanding " + r.cmp])
        ])
      ];
      if (p === "bulan") {
        var share = Math.min(100, cur.sum / P.TARGET.bulan * 100);
        var bar = el("div", { class: "meter__bar", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(Math.round(share)), "aria-label": "Capaian target bulan ini" }, [el("i")]);
        bar.firstChild.style.width = share + "%";
        kids.push(el("div", { class: "meter" }, [
          bar,
          el("div", { class: "meter__txt" }, [el("span", {}, ["Target bulan ini"]), el("span", {}, [t1(cur.sum / P.TARGET.bulan * 100) + "% dari Rp " + compact(P.TARGET.bulan)])])
        ]));
      }
      var b = el("button", { class: "tile", type: "button", "data-p": p, "aria-pressed": String(state.periode === p) }, kids);
      b.addEventListener("click", function () {
        state.periode = p; state.limit = 10; renderAll();
        var again = $("tiles").querySelector('[data-p="' + p + '"]'); if (again) again.focus(); // jaga fokus keyboard
      });
      host.appendChild(b);
    });
  }

  function renderYear() {
    var y = new Date(todayMs).getUTCFullYear();
    var cur = sumRange(Date.UTC(y, 0, 1), todayMs);
    var pct = cur.sum / P.TARGET.tahun * 100;
    $("y-lbl").textContent = "Realisasi tahun " + y;
    $("y-val").textContent = rp(cur.sum);
    $("y-fill").style.width = Math.min(100, pct) + "%";
    $("y-bar").setAttribute("aria-valuenow", String(Math.round(Math.min(100, pct))));
    $("y-pct").textContent = t1(pct) + "% dari target";
    $("y-tgt").textContent = "Target tahun " + y + ": Rp " + compact(P.TARGET.tahun);
  }

  /* ---------- deret waktu ---------- */
  function series(p) {
    var out = [], i, a, b, r;
    if (p === "hari") {
      for (i = 29; i >= 0; i--) {
        a = todayMs - i * DAY; r = sumRange(a, a);
        out.push({ lbl: fShort.format(a), full: fLong.format(a) + (i === 0 ? " (hari ini)" : ""), val: r.sum, n: r.n, cur: i === 0 });
      }
    } else if (p === "minggu") {
      var ws = weekStart(todayMs);
      for (i = 11; i >= 0; i--) {
        a = ws - i * 7 * DAY; b = Math.min(a + 6 * DAY, todayMs); r = sumRange(a, b);
        out.push({ lbl: fShort.format(a), full: "Minggu " + fShort.format(a) + " – " + fDate.format(a + 6 * DAY) + (i === 0 ? " (berjalan)" : ""), val: r.sum, n: r.n, cur: i === 0 });
      }
    } else {
      var m0 = monthStart(todayMs);
      for (i = 11; i >= 0; i--) {
        a = addMonths(m0, -i); b = i === 0 ? todayMs : a + (daysIn(a) - 1) * DAY; r = sumRange(a, b);
        out.push({ lbl: fMonth.format(a), full: fMonthL.format(a) + (i === 0 ? " (berjalan)" : ""), val: r.sum, n: r.n, cur: i === 0 });
      }
    }
    return out;
  }

  function niceTicks(max) {
    var raw = max / 4, mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), f = raw / mag;
    var step = (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * mag;
    var top = Math.ceil(max / step) * step, t = [];
    for (var v = 0; v <= top + step / 1000; v += step) t.push(Math.round(v));
    return { ticks: t, top: top };
  }

  /* ---------- grafik ---------- */
  var chartW = 0;
  function drawChart() {
    var host = $("chart"), tip = $("tip");
    Array.prototype.slice.call(host.querySelectorAll("svg")).forEach(function (n) { n.remove(); });
    var s = series(state.periode);

    var W = Math.max(280, Math.floor(host.clientWidth)); chartW = W;
    var H = 280, m = { l: 50, r: 6, t: 8, b: 30 }, iw = W - m.l - m.r, ih = H - m.t - m.b;
    var max = Math.max.apply(null, s.map(function (d) { return d.val; })) || 1;
    var tk = niceTicks(max);
    var y = function (v) { return m.t + ih - v / tk.top * ih; };
    var band = iw / s.length, bw = Math.min(24, Math.max(4, band * 0.62));

    var svg = snode("svg", { viewBox: "0 0 " + W + " " + H, width: W, height: H, role: "group", "aria-label": "Grafik batang setoran PAD. Data lengkap tersedia pada tampilan tabel." });

    tk.ticks.forEach(function (v) {
      svg.appendChild(snode("line", { x1: m.l, x2: W - m.r, y1: y(v), y2: y(v), "class": v === 0 ? "ax" : "gl" }));
      svg.appendChild(snode("text", { x: m.l - 8, y: y(v) + 4, "text-anchor": "end" }, compact(v)));
    });

    var labW = state.periode === "hari" ? 54 : state.periode === "minggu" ? 48 : 32;
    var step = Math.max(1, Math.ceil(labW / band));
    var bars = [];
    s.forEach(function (d, i) {
      var cx = m.l + i * band + band / 2, x = cx - bw / 2, top = y(d.val), base0 = y(0), h = base0 - top;
      if (h > 0) {
        var r = Math.min(4, h);
        var path = "M" + x + "," + base0 + "V" + (top + r) + "Q" + x + "," + top + " " + (x + r) + "," + top +
          "H" + (x + bw - r) + "Q" + (x + bw) + "," + top + " " + (x + bw) + "," + (top + r) + "V" + base0 + "Z";
        var bar = snode("path", { d: path, "class": "bar" + (d.cur ? " cur" : "") });
        svg.appendChild(bar); bars[i] = bar;
      }
      if ((s.length - 1 - i) % step === 0) svg.appendChild(snode("text", { x: cx, y: H - 10, "text-anchor": "middle" }, d.lbl));
    });

    function show(i) {
      var d = s[i];
      bars.forEach(function (b) { if (b) b.classList.remove("hv"); });
      if (bars[i]) bars[i].classList.add("hv");
      tip.textContent = "";
      tip.appendChild(el("b", {}, [rp(d.val)]));
      tip.appendChild(el("span", {}, [d.full]));
      tip.appendChild(el("span", { class: "t" }, [d.n + " setoran"]));
      tip.classList.add("show");
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var cx = m.l + i * band + band / 2;
      var left = Math.min(Math.max(0, cx - tw / 2), W - tw);
      var topPx = y(d.val) - th - 10;
      tip.style.left = left + "px";
      tip.style.top = (topPx < 0 ? y(d.val) + 12 : topPx) + "px";
    }
    function hide() { tip.classList.remove("show"); bars.forEach(function (b) { if (b) b.classList.remove("hv"); }); }

    s.forEach(function (d, i) {
      var hit = snode("rect", {
        x: m.l + i * band, y: m.t, width: band, height: ih + 4, "class": "hit", tabindex: "0", role: "img",
        "aria-label": d.full + ": " + rp(d.val) + ", " + d.n + " setoran"
      });
      hit.addEventListener("pointerenter", function () { show(i); });
      hit.addEventListener("pointermove", function () { show(i); });
      hit.addEventListener("pointerleave", hide);
      hit.addEventListener("focus", function () { show(i); });
      hit.addEventListener("blur", hide);
      svg.appendChild(hit);
    });
    host.insertBefore(svg, tip);

    // judul + ringkasan
    var tot = s.reduce(function (a, d) { return a + d.val; }, 0);
    var unit = state.periode === "hari" ? "hari" : state.periode === "minggu" ? "minggu" : "bulan";
    var span = state.periode === "hari" ? "30 hari terakhir" : state.periode === "minggu" ? "12 minggu terakhir" : "12 bulan terakhir";
    $("chart-title").textContent = "Tren setoran " + (state.periode === "hari" ? "harian" : state.periode === "minggu" ? "mingguan" : "bulanan");
    $("chart-sub").textContent = span + " · total " + rp(tot) + " · rata-rata " + rp(tot / s.length) + " per " + unit;
  }

  function renderChartTable() {
    var s = series(state.periode).reverse(), tb = $("chart-tbody"); tb.textContent = "";
    s.forEach(function (d) {
      var tr = el("tr", {}, [
        el("td", {}, [d.full]),
        el("td", { class: "r amt" }, [rp(d.val)]),
        el("td", { class: "r muted" }, [String(d.n)])
      ]);
      tb.appendChild(tr);
    });
  }

  function renderChart() {
    var isChart = state.view === "grafik";
    $("chart").hidden = !isChart; $("chart-key").hidden = !isChart; $("chart-table").hidden = isChart;
    Array.prototype.forEach.call(document.querySelectorAll("#view button"), function (b) {
      b.setAttribute("aria-pressed", String(b.dataset.v === state.view));
    });
    if (isChart) drawChart(); else { renderChartTable(); drawTitleOnly(); }
  }
  function drawTitleOnly() {
    var s = series(state.periode);
    var tot = s.reduce(function (a, d) { return a + d.val; }, 0);
    var unit = state.periode === "hari" ? "hari" : state.periode === "minggu" ? "minggu" : "bulan";
    var span = state.periode === "hari" ? "30 hari terakhir" : state.periode === "minggu" ? "12 minggu terakhir" : "12 bulan terakhir";
    $("chart-title").textContent = "Tren setoran " + (state.periode === "hari" ? "harian" : state.periode === "minggu" ? "mingguan" : "bulanan");
    $("chart-sub").textContent = span + " · total " + rp(tot) + " · rata-rata " + rp(tot / s.length) + " per " + unit;
  }

  /* ---------- rincian per sumber ---------- */
  function inPeriod(p) {
    var r = range(p), A = P.fromUTC(r.a), B = P.fromUTC(r.b);
    return recs.filter(function (x) { return x.tgl >= A && x.tgl <= B; });
  }
  function renderSources() {
    var rows = inPeriod(state.periode), sums = {};
    P.SUMBER.forEach(function (s) { sums[s.id] = 0; });
    rows.forEach(function (r) { sums[r.sumber] = (sums[r.sumber] || 0) + r.jumlah; });
    var list = P.SUMBER.map(function (s) { return { id: s.id, nama: s.nama, v: sums[s.id] }; })
      .sort(function (a, b) { return b.v - a.v; });
    var total = list.reduce(function (a, d) { return a + d.v; }, 0), max = list[0] ? list[0].v : 0;

    $("src-title").textContent = "Per sumber PAD";
    $("src-sub").textContent = NAMA[state.periode] + " · " + rangeLabel(state.periode);
    var ul = $("src-list"); ul.textContent = "";
    list.forEach(function (d) {
      var i = el("i"); i.style.setProperty("--p", max ? d.v / max : 0);
      ul.appendChild(el("li", {}, [
        el("div", { class: "hb__top" }, [el("b", {}, [d.nama]), el("span", {}, [total ? t1(d.v / total * 100) + "%" : "0%"])]),
        el("div", { class: "hb__row" }, [i, el("em", {}, [rp(d.v)])])
      ]));
    });
    $("src-total").textContent = rp(total);
  }

  /* ---------- tabel setoran ---------- */
  function periodRows() {
    return inPeriod(state.periode).map(function (r, i) { return { r: r, i: i }; })
      .sort(function (a, b) { return a.r.tgl < b.r.tgl ? 1 : a.r.tgl > b.r.tgl ? -1 : b.i - a.i; })
      .map(function (x) { return x.r; });
  }
  function renderTable() {
    var rows = periodRows(), shown = rows.slice(0, state.limit);
    $("tb-title").textContent = "Setoran " + NAMA[state.periode].toLowerCase();
    $("tb-sub").textContent = rangeLabel(state.periode);
    var tb = $("tbody"); tb.textContent = "";
    shown.forEach(function (r) {
      var ok = r.status === "Terverifikasi";
      var chip = el("span", { class: "status " + (ok ? "ok" : "wait") }, [ico(ok ? "check" : "clock"), r.status]);
      tb.appendChild(el("tr", {}, [
        el("td", {}, [fDate.format(P.toUTC(r.tgl))]),
        el("td", {}, [srcName[r.sumber] || r.sumber, el("span", { class: "sub" }, [r.lokasi])]),
        el("td", { class: "muted" }, [r.bukti]),
        el("td", { class: "r amt" }, [rp(r.jumlah)]),
        el("td", {}, [chip])
      ]));
    });
    $("empty").hidden = rows.length > 0;
    $("tb-count").textContent = rows.length ? "Menampilkan " + shown.length + " dari " + rows.length + " setoran" : "";
    $("more").hidden = rows.length <= shown.length;
  }

  /* ---------- render semua ---------- */
  function renderAll() {
    renderTiles(); renderYear(); renderChart(); renderSources(); renderTable();
  }

  /* ---------- header & akses ---------- */
  function initUser() {
    $("u-nama").textContent = user.nama;
    $("u-peran").textContent = user.peran;
    $("u-av").textContent = user.nama.split(" ").slice(0, 2).map(function (w) { return w.charAt(0); }).join("").toUpperCase();
    $("tgl").textContent = fLong.format(todayMs);
    $("btn-add").hidden = !user.bisaInput;
    $("ro").hidden = !!user.bisaInput;
    $("logout").addEventListener("click", function () { PadAuth.logout(); location.href = "login-pad.html?out=1"; });
  }

  /* ---------- CSV ---------- */
  function exportCsv() {
    var rows = periodRows();
    var head = ["Tanggal", "Sumber PAD", "Lokasi/Penyetor", "No. Bukti", "Jumlah (Rp)", "Status"];
    var lines = [head].concat(rows.map(function (r) { return [r.tgl, srcName[r.sumber] || r.sumber, r.lokasi, r.bukti, r.jumlah, r.status]; }))
      .map(function (l) { return l.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(";"); });
    var blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "setoran-pad-" + state.periode + "-" + today + ".csv";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }

  /* ---------- form catat setoran ---------- */
  var toastT;
  function toast(msg) {
    $("toast-txt").textContent = msg; $("toast").classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(function () { $("toast").classList.remove("show"); }, 3800);
  }
  function setErr(f, msg) {
    $("c-" + f).classList.toggle("invalid", !!msg);
    var e = $("e-" + f); e.hidden = !msg; e.textContent = msg || "";
  }
  function fillLokasi() {
    var s = $("f-sumber").value, dl = $("lokasi-list"); dl.textContent = "";
    (P.LOKASI[s] || []).forEach(function (l) { var o = document.createElement("option"); o.value = l; dl.appendChild(o); });
  }
  function openForm() {
    if (!user.bisaInput) return;
    $("fm").reset();
    $("f-tgl").value = today; $("f-tgl").max = today;
    $("f-tgl").min = P.fromUTC(todayMs - 60 * DAY);
    ["tgl", "sumber", "lokasi", "jumlah", "bukti"].forEach(function (f) { setErr(f, ""); });
    fillLokasi();
    $("dlg").showModal();
    $("f-jumlah").focus();
  }
  function initForm() {
    var sel = $("f-sumber");
    P.SUMBER.forEach(function (s) { var o = document.createElement("option"); o.value = s.id; o.textContent = s.nama; sel.appendChild(o); });
    sel.addEventListener("change", fillLokasi);

    $("btn-add").addEventListener("click", openForm);
    $("dlg-x").addEventListener("click", function () { $("dlg").close(); });
    $("dlg-cancel").addEventListener("click", function () { $("dlg").close(); });
    $("dlg").addEventListener("click", function (e) { if (e.target === $("dlg")) $("dlg").close(); });

    $("f-jumlah").addEventListener("input", function () {
      var d = this.value.replace(/\D/g, "").slice(0, 11);
      this.value = d ? nf.format(parseInt(d, 10)) : "";
    });

    $("fm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!user.bisaInput) return; // catatan: pembatasan sebenarnya harus di server
      var tgl = $("f-tgl").value, sumber = $("f-sumber").value, lokasi = $("f-lokasi").value.trim();
      var n = parseInt($("f-jumlah").value.replace(/\D/g, ""), 10) || 0;
      var bukti = $("f-bukti").value.trim();
      var minISO = P.fromUTC(todayMs - 60 * DAY);
      var errs = {};

      if (!tgl) errs.tgl = "Tanggal wajib diisi.";
      else if (tgl > today) errs.tgl = "Tanggal tidak boleh di masa depan.";
      else if (tgl < minISO) errs.tgl = "Maksimal 60 hari ke belakang.";
      if (!sumber) errs.sumber = "Pilih sumber PAD.";
      if (lokasi.length < 3) errs.lokasi = "Isi lokasi/penyetor (minimal 3 karakter).";
      if (!n) errs.jumlah = "Jumlah wajib diisi.";
      else if (n < 1000) errs.jumlah = "Jumlah minimal Rp 1.000.";
      if (bukti) {
        if (!/^[A-Za-z0-9\/.\-]{4,30}$/.test(bukti)) errs.bukti = "Gunakan huruf, angka, / . - (4–30 karakter).";
        else if (recs.some(function (r) { return r.bukti.toLowerCase() === bukti.toLowerCase(); })) errs.bukti = "Nomor bukti sudah terpakai.";
      }
      var first = null;
      ["tgl", "sumber", "lokasi", "jumlah", "bukti"].forEach(function (f) {
        setErr(f, errs[f]); if (errs[f] && !first) first = f;
      });
      if (first) { $({ tgl: "f-tgl", sumber: "f-sumber", lokasi: "f-lokasi", jumlah: "f-jumlah", bukti: "f-bukti" }[first]).focus(); return; }

      if (!bukti) bukti = "STS-" + tgl.slice(0, 4) + "-" + (90000 + extras.length + 1);
      extras.push({ id: "m" + Date.now(), tgl: tgl, sumber: sumber, lokasi: lokasi, jumlah: n, bukti: bukti, status: "Menunggu" });
      saveExtra(); reindex();
      $("dlg").close();
      renderAll();
      toast("Setoran " + rp(n) + " dicatat dan menunggu verifikasi.");
    });
  }

  /* ---------- init ---------- */
  reindex();
  initUser();
  initForm();

  Array.prototype.forEach.call(document.querySelectorAll("#view button"), function (b) {
    b.addEventListener("click", function () { state.view = b.dataset.v; renderChart(); });
  });
  $("more").addEventListener("click", function () { state.limit += 10; renderTable(); });
  $("csv").addEventListener("click", exportCsv);

  renderAll();

  // gambar ulang grafik saat lebar berubah
  var rz;
  if (window.ResizeObserver) {
    new ResizeObserver(function () {
      var w = Math.floor($("chart").clientWidth);
      if (!w || Math.abs(w - chartW) < 2 || state.view !== "grafik") return;
      cancelAnimationFrame(rz); rz = requestAnimationFrame(drawChart);
    }).observe($("chart"));
  }
})();
