/*
 * AKSES DEMO — BUKAN KEAMANAN SUNGGUHAN.
 *
 * Seluruh pemeriksaan di file ini berjalan di browser. Siapa pun bisa membaca
 * daftar akun di bawah, mengubah sessionStorage, atau mematikan JavaScript.
 * File ini hanya untuk prototipe tampilan alur login -> dashboard.
 *
 * Pada implementasi sebenarnya (mis. Laravel), pembatasan akses HARUS dilakukan di server:
 *   - login lewat guard `auth` (session/Sanctum) dengan password ter-hash,
 *   - route dashboard dilindungi middleware `auth` + `can:lihat-pad` (Gate/Policy/role),
 *   - data PAD dikirim dari controller hanya setelah otorisasi lolos,
 *   - pencatatan setoran divalidasi ulang di server (FormRequest) dan diberi audit log,
 *   - rate limiting + (disarankan) 2FA untuk akun bendahara.
 */
(function () {
  "use strict";
  var KEY = "pad_demo_session";
  var MAX_AGE = 8 * 3600 * 1000; // 8 jam

  var USERS = [
    { email: "bendahara@disperindag.demo", password: "demo1234", nama: "Bendahara Penerima", peran: "Bendahara Penerima", bisaInput: true },
    { email: "pimpinan@disperindag.demo",  password: "demo1234", nama: "Pimpinan",           peran: "Pimpinan (hanya lihat)", bisaInput: false }
  ];

  function login(email, password) {
    email = String(email || "").trim().toLowerCase();
    for (var i = 0; i < USERS.length; i++) {
      var u = USERS[i];
      if (u.email === email && u.password === password) {
        var s = { email: u.email, nama: u.nama, peran: u.peran, bisaInput: u.bisaInput, t: Date.now() };
        try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { return { ok: false, err: "storage" }; }
        return { ok: true, user: s };
      }
    }
    return { ok: false, err: "cred" };
  }

  function current() {
    try {
      var s = JSON.parse(sessionStorage.getItem(KEY) || "null");
      if (s && Date.now() - s.t < MAX_AGE) return s;
    } catch (e) { /* abaikan */ }
    return null;
  }

  function logout() {
    try { sessionStorage.removeItem(KEY); } catch (e) { /* abaikan */ }
  }

  window.PadAuth = {
    login: login,
    current: current,
    logout: logout,
    demoUsers: USERS.map(function (u) { return { email: u.email, password: u.password, peran: u.peran }; })
  };
})();
