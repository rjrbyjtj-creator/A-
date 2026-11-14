document.getElementById('themeToggle').addEventListener('click', function () {
  document.body.classList.toggle('dark');
  document.getElementById('swDark').setAttribute('aria-checked', document.body.classList.contains('dark'));
  document.getElementById('swLight').setAttribute('aria-checked', !document.body.classList.contains('dark'));
});

(function () {
  var API = "https://madar-jmy5.onrender.com/api/themes";
  var KEY = "madar_token";
  var COLOR_KEYS = [
    { key: "navy", label: "اصلی / سرمه‌ای", css: "--navy" },
    { key: "gold", label: "طلایی / تاکید", css: "--gold" },
    { key: "bg", label: "پس‌زمینه", css: "--bg" },
    { key: "green", label: "سبز / موفقیت", css: "--green" },
    { key: "text", label: "متن", css: "--text" },
    { key: "muted", label: "متن کم‌رنگ", css: "--muted" },
    { key: "surface", label: "سطح کارت", css: "--surface" },
    { key: "line", label: "خط / حاشیه", css: "--line" }
  ];
  var DEF = {
    navy: "#1c2b4b", gold: "#d4b16a", bg: "#f5f7fb", green: "#22c55e",
    text: "#1e293b", muted: "#64748b", surface: "#ffffff", line: "#e3e8f0"
  };
  var state = { colors: Object.assign({}, DEF), font: "vazir", mode: "light", selectedId: null, themes: [] };

  function token() {
    try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch (e) { return null; }
  }
  function headers(json) {
    var h = {};
    if (json) h["Content-Type"] = "application/json";
    var t = token();
    if (t) h.Authorization = "Bearer " + t;
    return h;
  }
  async function api(path, opt) {
    var r = await fetch(API + path, opt || {});
    var d = {};
    try { d = await r.json(); } catch (e) {}
    if (!r.ok) throw new Error(d.message || "خطای سرور");
    return d;
  }
  function say(m) {
    var t = document.getElementById("lkToast");
    t.textContent = m;
    t.classList.add("show");
    clearTimeout(t._x);
    t._x = setTimeout(function () { t.classList.remove("show"); }, 2000);
  }
  function applyPreview() {
    var root = document.documentElement;
    COLOR_KEYS.forEach(function (c) {
      var v = state.colors[c.key];
      if (v) root.style.setProperty(c.css, v);
    });
    root.style.setProperty("--primary", state.colors.navy);
    root.style.setProperty("--blue", state.colors.navy);
    var fonts = { vazir: "'Vazirmatn',sans-serif", tahoma: "Tahoma,sans-serif", system: "system-ui,sans-serif" };
    document.getElementById("fs").style.fontFamily = fonts[state.font] || fonts.vazir;
    document.getElementById("fs").style.setProperty("--fz", document.getElementById("sSize").value + "px");
    document.getElementById("pv").dataset.mode = state.mode;
    document.body.classList.toggle("dark", state.mode === "dark");
    document.getElementById("swDark").setAttribute("aria-checked", state.mode === "dark");
    document.getElementById("swLight").setAttribute("aria-checked", state.mode !== "dark");
  }
  function renderColorVars() {
    var box = document.getElementById("colorVars");
    box.innerHTML = COLOR_KEYS.map(function (c) {
      var val = state.colors[c.key] || DEF[c.key] || "#000000";
      return '<div class="cv" data-k="' + c.key + '">' +
        '<input type="color" value="' + val + '" aria-label="' + c.label + '" />' +
        '<div class="meta"><strong>' + c.label + '</strong><code>' + c.css + ' · ' + c.key + '</code></div>' +
        '<span class="hex">' + val + '</span></div>';
    }).join("");
    box.querySelectorAll("input[type=color]").forEach(function (inp) {
      inp.addEventListener("input", function () {
        var k = inp.closest(".cv").dataset.k;
        state.colors[k] = inp.value;
        inp.closest(".cv").querySelector(".hex").textContent = inp.value;
        applyPreview();
      });
    });
  }
  function renderThemes() {
    var cards = document.getElementById("themeCards");
    var list = document.getElementById("palList");
    if (!state.themes.length) {
      cards.innerHTML = '<p style="color:var(--muted)">هنوز پالتی نیست. یکی بساز.</p>';
      list.innerHTML = "";
      return;
    }
    cards.innerHTML = state.themes.map(function (t) {
      var c = t.colors || {};
      return '<button type="button" class="tm' + (t.isActive || t.id === state.selectedId ? ' on' : '') + '" data-id="' + t.id + '">' +
        '<i><b style="background:' + (c.navy||'#333') + '"></b><b style="background:' + (c.gold||'#ccc') + '"></b><b style="background:' + (c.bg||'#eee') + '"></b><b style="background:' + (c.green||'#0a0') + '"></b></i>' +
        (t.isActive ? '<span class="badge">فعال</span>' : '') +
        '<span>' + t.name + '</span></button>';
    }).join("");
    list.innerHTML = state.themes.map(function (t) {
      var c = t.colors || {};
      return '<div class="pal-item' + (t.isActive ? ' active' : '') + '">' +
        '<div class="sw"><b style="background:' + (c.navy||'') + '"></b><b style="background:' + (c.gold||'') + '"></b><b style="background:' + (c.bg||'') + '"></b><b style="background:' + (c.green||'') + '"></b><b style="background:' + (c.text||'') + '"></b><b style="background:' + (c.surface||'') + '"></b></div>' +
        '<div class="name">' + t.name + (t.isActive ? ' · فعال' : '') + '</div>' +
        '<div class="acts">' +
        '<button type="button" class="act" data-act="' + t.id + '">فعال کن</button>' +
        (!t.isDefault ? '<button type="button" class="del" data-del="' + t.id + '">حذف</button>' : '') +
        '</div></div>';
    }).join("");
  }
  function selectTheme(t) {
    state.selectedId = t.id;
    state.colors = Object.assign({}, DEF, t.colors || {});
    state.font = t.font || "vazir";
    state.mode = t.mode || "light";
    document.getElementById("sFont").value = state.font;
    document.getElementById("palName").value = t.name;
    renderColorVars();
    renderThemes();
    applyPreview();
  }
  async function load() {
    try {
      var d = await api("", { headers: headers() });
      state.themes = d.themes || [];
      var active = state.themes.find(function (t) { return t.isActive; }) || state.themes[0];
      if (active) selectTheme(active);
      else { renderColorVars(); renderThemes(); applyPreview(); }
    } catch (e) {
      document.getElementById("themeCards").innerHTML = '<p style="color:#ef4444">' + (e.message || "خطا") + '</p>';
      renderColorVars();
      applyPreview();
    }
  }
  document.getElementById("themeCards").addEventListener("click", function (e) {
    var btn = e.target.closest(".tm");
    if (!btn) return;
    var t = state.themes.find(function (x) { return x.id === btn.dataset.id; });
    if (t) selectTheme(t);
  });
  document.getElementById("palList").addEventListener("click", async function (e) {
    var act = e.target.getAttribute("data-act");
    var del = e.target.getAttribute("data-del");
    try {
      if (act) {
        await api("/" + act + "/activate", { method: "POST", headers: headers() });
        say("تم روی کل سایت فعال شد");
        await load();
      }
      if (del && confirm("این پالت حذف شود؟")) {
        await api("/" + del, { method: "DELETE", headers: headers() });
        say("حذف شد");
        await load();
      }
    } catch (err) { say(err.message || "خطا"); }
  });
  document.getElementById("lkCreate").onclick = async function () {
    var name = document.getElementById("palName").value.trim();
    if (!name) { say("نام پالت را بنویس"); return; }
    try {
      var body = {
        name: name,
        colors: {
          navy: state.colors.navy, gold: state.colors.gold, bg: state.colors.bg, green: state.colors.green,
          text: state.colors.text, muted: state.colors.muted, surface: state.colors.surface, line: state.colors.line
        },
        font: document.getElementById("sFont").value,
        mode: state.mode
      };
      await api("", { method: "POST", headers: headers(true), body: JSON.stringify(body) });
      say("پالت ذخیره شد — برای اعمال، «فعال کن» را بزن");
      document.getElementById("palName").value = "";
      await load();
    } catch (e) { say(e.message || "ذخیره نشد"); }
  };
  document.getElementById("lkActivate").onclick = async function () {
    try {
      if (state.selectedId) {
        await api("/" + state.selectedId + "/activate", { method: "POST", headers: headers() });
        say("تم فعال شد");
        await load();
      } else {
        say("اول یک پالت انتخاب یا ذخیره کن");
      }
    } catch (e) { say(e.message || "خطا"); }
  };
  document.getElementById("lkReset").onclick = function () {
    state.colors = Object.assign({}, DEF);
    state.font = "vazir";
    state.mode = "light";
    document.getElementById("sFont").value = "vazir";
    document.getElementById("palName").value = "";
    renderColorVars();
    applyPreview();
    say("فرم بازنشانی شد");
  };
  document.getElementById("sFont").onchange = function () {
    state.font = this.value;
    applyPreview();
  };
  document.getElementById("sSize").onchange = applyPreview;
  document.getElementById("sRad").onchange = function () {
    document.getElementById("look").style.setProperty("--rad", this.value + "rem");
  };
  document.getElementById("sGap").onchange = function () {
    document.getElementById("look").style.setProperty("--gap", this.value + "rem");
  };
  document.getElementById("swDark").onclick = function () {
    state.mode = "dark";
    applyPreview();
  };
  document.getElementById("swLight").onclick = function () {
    state.mode = "light";
    applyPreview();
  };
  load();
})();
