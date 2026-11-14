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

  var SUGGESTED = [
    {
      id: "sug-madar",
      name: "مدار (پیش‌فرض)",
      desc: "سرمه‌ای و طلایی رسمی سایت",
      isDefault: true,
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#1c2b4b", gold: "#d4b16a", bg: "#f5f7fb", green: "#22c55e",
        text: "#1e293b", muted: "#64748b", surface: "#ffffff", line: "#e3e8f0"
      }
    },
    {
      id: "sug-mono",
      name: "سیاه و سفید",
      desc: "مینیمال کلاسیک، کنتراست بالا",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#111111", gold: "#737373", bg: "#fafafa", green: "#16a34a",
        text: "#0a0a0a", muted: "#737373", surface: "#ffffff", line: "#e5e5e5"
      }
    },
    {
      id: "sug-gray",
      name: "خاکستری شیک",
      desc: "طوسی خنثی و مدرن",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#374151", gold: "#9ca3af", bg: "#f3f4f6", green: "#059669",
        text: "#111827", muted: "#6b7280", surface: "#ffffff", line: "#e5e7eb"
      }
    },
    {
      id: "sug-nord",
      name: "نورد / اسکاندیناوی",
      desc: "آبی یخی و سرد",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#2e3440", gold: "#88c0d0", bg: "#eceff4", green: "#a3be8c",
        text: "#2e3440", muted: "#4c566a", surface: "#ffffff", line: "#d8dee9"
      }
    },
    {
      id: "sug-midnight",
      name: "نیمه‌شب",
      desc: "تاریک لوکس با طلا",
      font: "vazir",
      mode: "dark",
      colors: {
        navy: "#e2e8f0", gold: "#d4b16a", bg: "#0b1220", green: "#34d399",
        text: "#f1f5f9", muted: "#94a3b8", surface: "#151d2e", line: "#243044"
      }
    },
    {
      id: "sug-ocean",
      name: "اقیانوس",
      desc: "آبی عمیق و فیروزه‌ای",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#0f4c81", gold: "#38bdf8", bg: "#f0f9ff", green: "#10b981",
        text: "#0c4a6e", muted: "#64748b", surface: "#ffffff", line: "#e0f2fe"
      }
    },
    {
      id: "sug-forest",
      name: "جنگل",
      desc: "سبز طبیعی و گرم",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#14532d", gold: "#84cc16", bg: "#f7fee7", green: "#f59e0b",
        text: "#14532d", muted: "#4d7c0f", surface: "#ffffff", line: "#ecfccb"
      }
    },
    {
      id: "sug-rose",
      name: "رزگلد",
      desc: "صورتی ملایم و طلایی",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#9f1239", gold: "#e8b4b8", bg: "#fff1f2", green: "#be123c",
        text: "#4c0519", muted: "#9f1239", surface: "#ffffff", line: "#fecdd3"
      }
    },
    {
      id: "sug-royal",
      name: "بنفش سلطنتی",
      desc: "بنفش عمیق و لوکس",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#4c1d95", gold: "#c4b5fd", bg: "#f5f3ff", green: "#ec4899",
        text: "#4c1d95", muted: "#6b7280", surface: "#ffffff", line: "#ede9fe"
      }
    },
    {
      id: "sug-sand",
      name: "شن و آفتاب",
      desc: "کرم گرم و قهوه‌ای",
      font: "vazir",
      mode: "light",
      colors: {
        navy: "#78350f", gold: "#f59e0b", bg: "#fffbeb", green: "#65a30d",
        text: "#451a03", muted: "#92400e", surface: "#ffffff", line: "#fde68a"
      }
    }
  ];

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
  function swatches(c) {
    c = c || {};
    var keys = ["navy", "gold", "bg", "green", "text", "surface", "muted", "line"];
    return keys.map(function (k) {
      return '<b style="background:' + (c[k] || "#ccc") + '" title="' + k + '"></b>';
    }).join("");
  }
  function renderThemes() {
    var cards = document.getElementById("themeCards");
    var list = document.getElementById("palList");
    var sugHtml = SUGGESTED.map(function (t) {
      var on = state.selectedId === t.id || (!state.selectedId && t.isDefault && !state.themes.some(function (x) { return x.isActive; }));
      return '<button type="button" class="tm' + (on ? ' on' : '') + '" data-sug="' + t.id + '">' +
        '<i>' + swatches(t.colors) + '</i>' +
        '<span class="tm-name">' + (t.isDefault ? '<span class="badge badge-def">پیش‌فرض</span>' : '') + t.name + '</span>' +
        '<span class="tm-desc">' + t.desc + '</span></button>';
    }).join("");
    cards.innerHTML = '<div class="showcase-title">پالت‌های پیشنهادی</div><div class="themes">' + sugHtml + '</div>';

    if (!state.themes.length) {
      list.innerHTML = '<p style="color:var(--muted);margin-top:1rem">هنوز پالت سفارشی ذخیره‌شده‌ای نداری. یکی از پیشنهادی‌ها را انتخاب کن یا رنگ بساز و ذخیره کن.</p>';
    } else {
      list.innerHTML = '<div class="showcase-title">پالت‌های ذخیره‌شده شما</div><div class="themes saved-row">' +
        state.themes.map(function (t) {
          var c = t.colors || {};
          return '<button type="button" class="tm' + (t.isActive || t.id === state.selectedId ? ' on' : '') + '" data-id="' + t.id + '">' +
            '<i>' + swatches(c) + '</i>' +
            '<span class="tm-name">' + (t.isActive ? '<span class="badge">فعال</span>' : '') + t.name + '</span></button>';
        }).join("") + '</div>' +
        state.themes.map(function (t) {
          var c = t.colors || {};
          return '<div class="pal-item' + (t.isActive ? ' active' : '') + '">' +
            '<div class="sw">' + swatches(c) + '</div>' +
            '<div class="name">' + t.name + (t.isActive ? ' · فعال' : '') + '</div>' +
            '<div class="acts">' +
            '<button type="button" class="act" data-act="' + t.id + '">فعال کن</button>' +
            (!t.isDefault ? '<button type="button" class="del" data-del="' + t.id + '">حذف</button>' : '') +
            '</div></div>';
        }).join("");
    }
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
      renderColorVars();
      renderThemes();
      applyPreview();
      say(e.message || "اتصال به سرور برقرار نشد — پالت‌های پیشنهادی در دسترس‌اند");
    }
  }
  document.getElementById("themeCards").addEventListener("click", function (e) {
    var btn = e.target.closest(".tm");
    if (!btn) return;
    if (btn.dataset.sug) {
      var s = SUGGESTED.find(function (x) { return x.id === btn.dataset.sug; });
      if (!s) return;
      state.selectedId = s.id;
      state.colors = Object.assign({}, DEF, s.colors);
      state.font = s.font || "vazir";
      state.mode = s.mode || "light";
      document.getElementById("sFont").value = state.font;
      document.getElementById("palName").value = s.name.replace(/\s*\(پیش‌فرض\)\s*/, "");
      renderColorVars();
      renderThemes();
      applyPreview();
      return;
    }
    var t = state.themes.find(function (x) { return x.id === btn.dataset.id; });
    if (t) selectTheme(t);
  });
  document.getElementById("palList").addEventListener("click", async function (e) {
    var pick = e.target.closest(".tm");
    if (pick && pick.dataset.id) {
      var t = state.themes.find(function (x) { return x.id === pick.dataset.id; });
      if (t) selectTheme(t);
      return;
    }
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
      if (state.selectedId && String(state.selectedId).indexOf("sug-") === 0) {
        say("اول «ذخیره به‌عنوان پالت جدید» را بزن، بعد فعال کن");
        return;
      }
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
