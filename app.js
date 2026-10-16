(function () {
  'use strict';

  const STORE = 'kodlab-easy-v1';
  const LANG = { 'index.html': 'html', 'style.css': 'css', 'script.js': 'js' };
  const $ = id => document.getElementById(id);

  let state = load();
  let step = Math.min(state.done, STEPS.length - 1);

  function fresh() { return { name: '', values: {}, done: 0 }; }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s && s.values) {
        // пройденные шаги считаем по заполненным клеткам — так прогресс не сбивается, если шаги добавились
        const st = Object.assign(fresh(), s);
        const next = STEPS.findIndex(step => !st.values[step.key]);
        st.done = next === -1 ? STEPS.length : next;
        return st;
      }
    } catch (e) { /* нет сохранения */ }
    return fresh();
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) { /* хранилище недоступно */ }
  }

  // ===== Подсветка кода =====
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function span(cls, text) { return '<span class="t-' + cls + '">' + esc(text) + '</span>'; }
  function tokenize(src, re, paint) {
    let out = '', last = 0, m;
    re.lastIndex = 0;
    while ((m = re.exec(src))) {
      if (m[0] === '') { re.lastIndex++; continue; }
      out += esc(src.slice(last, m.index)) + paint(m);
      last = re.lastIndex;
    }
    return out + esc(src.slice(last));
  }
  const HL = {
    html: s => tokenize(s, /(<\/?)([a-zA-Z][a-zA-Z0-9]*)|("[^"\n]*"?)|([a-zA-Z-]+)(?==)|(\/?>)/g,
      m => m[2] ? span('punct', m[1]) + span('tag', m[2]) : m[3] ? span('string', m[3]) : m[4] ? span('attr', m[4]) : span('punct', m[5])),
    css: s => tokenize(s, /([^{}\/;\n]+)(?=\s*\{)|([a-zA-Z-]+)(?=\s*:)|(-?\d+(?:px|%)?)|([{}:;])/g,
      m => m[1] ? span('selector', m[1]) : m[2] ? span('attr', m[2]) : m[3] ? span('number', m[3]) : span('punct', m[4])),
    js: s => tokenize(s, /('[^'\n]*'?)|\b(let|function)\b|([a-zA-Z_$][\w$]*)(?=\s*\()/g,
      m => m[1] ? span('string', m[1]) : m[2] ? span('keyword', m[2]) : span('func', m[3]))
  };

  // ===== Сайт ребёнка: собираем из заполненных клеточек =====
  function siteCode(n) {
    const v = key => {
      const i = STEPS.findIndex(s => s.key === key);
      return i < n ? state.values[key] : '';
    };
    let html = '';
    if (v('title')) html += '<h1>' + esc(v('title')) + '</h1>\n';
    if (v('text')) html += '<p>' + esc(v('text')) + '</p>\n';
    if (v('pic')) html += '<img src="img/' + v('pic') + '.svg" width="' + (v('size') || 200) + '">\n';
    if (v('btn')) html += '<button>' + esc(v('btn')) + '</button>\n';

    let css = 'body {\n  font-family: ' + (v('font') || 'sans-serif') + ';\n  text-align: center;\n';
    if (v('bg')) css += '  background: ' + v('bg') + ';\n';
    css += '}\n';
    if (v('color')) css += 'h1 {\n  color: ' + v('color') + ';\n}\n';
    css += 'p {\n  font-size: 22px;\n}\nimg {\n  display: block;\n  margin: 20px auto;\n  border-radius: 20px;\n}\n' +
      'button {\n  font-size: 24px;\n  padding: 10px 28px;\n  background: white;\n  border: 2px solid #22252b;\n' +
      '  border-radius: 12px;\n  box-shadow: 3px 3px 0 #22252b;\n  cursor: pointer;\n}\n' +
      'button:active {\n  transform: translate(3px, 3px);\n  box-shadow: none;\n}\n';

    let js = '';
    if (v('msg')) {
      js = "let button = document.querySelector('button');\n\nbutton.onclick = function() {\n" +
        "  alert('" + jsText(v('msg')) + "');\n" +
        (v('swap') ? "  let img = document.querySelector('img');\n  img.src = 'img/" + v('swap') + ".svg';\n" : '') + '};\n';
    }
    return { html, css, js };
  }
  function jsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }

  function imgUri(name) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(IMAGES[name]);
  }
  // В окне просмотра alert показывается аккуратной карточкой внутри сайта,
  // а не серым окном браузера поверх всей страницы. В скачанный сайт это не попадает.
  const PREVIEW_ALERT =
    '<style>' +
    '#kl-alert{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
    'background:rgba(34,37,43,.35);font-family:"Segoe UI",Tahoma,sans-serif;text-align:center}' +
    '#kl-alert .card{min-width:240px;max-width:80%;padding:18px 24px 20px;background:#fff;color:#22252b;' +
    'border:2px solid #22252b;border-radius:12px;box-shadow:4px 4px 0 #22252b}' +
    '#kl-alert .head{margin-bottom:6px;font-size:14px;color:#5d6270}' +
    '#kl-alert .text{margin-bottom:16px;font-size:26px;font-weight:700;word-break:break-word}' +
    '#kl-alert button{padding:8px 28px;font:700 18px "Segoe UI",Tahoma,sans-serif;color:#fff;background:#3a9d5d;' +
    'border:2px solid #22252b;border-radius:10px;box-shadow:3px 3px 0 #22252b;cursor:pointer}' +
    '#kl-alert button:active{transform:translate(3px,3px);box-shadow:none}' +
    '</style>\n<script>\nwindow.alert = function (msg) {\n' +
    '  var old = document.getElementById("kl-alert"); if (old) old.remove();\n' +
    '  var box = document.createElement("div"); box.id = "kl-alert";\n' +
    '  box.innerHTML = \'<div class="card"><div class="head">Сайт говорит:</div><div class="text"></div><button>ОК</button></div>\';\n' +
    '  box.querySelector(".text").textContent = msg;\n' +
    '  box.querySelector("button").onclick = function () { box.remove(); };\n' +
    '  document.body.appendChild(box);\n' +
    '  box.querySelector("button").focus();\n' +
    '};\n<\/script>\n';

  function siteDoc(n, preview) {
    const c = siteCode(n);
    // img/cat.svg → встроенная картинка (и в HTML, и в коде кнопки), чтобы сайт работал без папки img
    const inline = code => code.replace(/img\/([a-z]+)\.svg/g, (all, name) => IMAGES[name] ? imgUri(name).replace(/'/g, '%27') : all);
    return '<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<title>Мой сайт</title>\n' +
      (preview ? PREVIEW_ALERT : '') +
      '<style>\n' + c.css + '</style>\n</head>\n<body>\n' + inline(c.html) + '<script>\n' + inline(c.js) + '<\/script>\n</body>\n</html>\n';
  }
  function showSite() {
    $('preview').srcdoc = siteDoc(state.done, true);
  }

  // ===== Экран шага =====
  function say(text) {
    $('bubble').textContent = text;
    $('bubble').classList.remove('pop');
    void $('bubble').offsetWidth;
    $('bubble').classList.add('pop');
  }

  function render() {
    const s = STEPS[step];
    const lang = LANG[s.file];

    $('fileName').textContent = s.file;
    $('fileName').className = 'file ' + lang;

    $('code').innerHTML = s.code.map(part => {
      if (typeof part === 'string') return HL[lang](part);
      if (part.show) return span('string', state.values[part.show] || '');
      const val = state.values[part.field] || '';
      return '<input class="slot" id="slot" spellcheck="false" autocomplete="off" placeholder="' + esc(part.ph) +
        '" value="' + esc(val) + '">';
    }).join('');

    let chips = '';
    if (s.colors) {
      chips = s.colors.map(c =>
        '<button class="chip" data-val="' + c + '"><i style="background:' + c + '"></i>' + c + '</button>').join('');
    } else if (s.fonts) {
      chips = s.fonts.map(f =>
        '<button class="chip font" data-val="' + f + '"><b style="font-family:' + f + '">Абв</b>' + f + '</button>').join('');
    } else if (s.sizes) {
      chips = s.sizes.map(n =>
        '<button class="chip size" data-val="' + n + '"><i style="width:' + n / 6 + 'px;height:' + n / 6 + 'px"></i>' + n + '</button>').join('');
    } else if (s.pics) {
      chips = Object.keys(IMAGES).map(k =>
        '<button class="chip pic" data-val="' + k + '"><img src="' + imgUri(k) + '" alt="">' + k + '</button>').join('');
    }
    $('chips').innerHTML = chips;

    showNext(step < state.done);
    say(s.say);
    renderDots();
    fitSlot();
  }

  function renderDots() {
    $('dots').innerHTML = STEPS.map((s, i) => {
      const cls = [i < state.done ? 'done' : '', i === step ? 'current' : '', i > state.done ? 'locked' : ''].join(' ');
      return '<button class="dot ' + cls + '" data-step="' + i + '" title="Шаг ' + (i + 1) + '">' +
        (i + 1) + '</button>';
    }).join('');
    if (window.Nav) Nav.render();
  }

  function fitSlot() {
    const slot = $('slot');
    if (!slot) return;
    slot.style.width = 'calc(' + Math.max(slot.value.length, slot.placeholder.length, 3) + 'ch + 24px)';
  }

  // ===== Запуск =====
  function check(s, val) {
    if (!val) return 'Клетка пока пустая. Впиши что-нибудь в жёлтую клетку.';
    if (s.colors && !CSS.supports('color', val)) return 'Компьютер не знает цвет «' + val + '». Нажми на цветной кружок внизу.';
    if (s.pics && !IMAGES[val]) return 'Такой картинки у нас нет. Выбери картинку внизу.';
    if (s.sizes && !/^\d+$/.test(val)) return 'Ширина — это число. Например, 200.';
    if (s.sizes && (val < 30 || val > 600)) return 'Возьми число от 30 до 600, иначе картинка не поместится.';
    return true;
  }

  function run() {
    const s = STEPS[step];
    const slot = $('slot');
    const val = slot.value.trim();
    const res = check(s, val);
    if (res !== true) {
      say(res);
      slot.classList.remove('shake');
      void slot.offsetWidth;
      slot.classList.add('shake');
      slot.focus();
      return;
    }
    state.values[s.key] = val;
    const first = step === state.done;
    if (first) state.done++;
    save();
    showSite();
    say(s.win);
    renderDots();
    showNext(true);
  }

  // «Дальше»: к следующему шагу, а после 10-го — в конструктор
  function showNext(show) {
    const last = step === STEPS.length - 1;
    $('nextBtn').textContent = last ? 'Дальше: конструктор →' : 'Дальше →';
    $('nextBtn').classList.toggle('hidden', !show);
  }

  function goStep(i) {
    if (i < 0 || i >= STEPS.length || i > state.done) return;
    step = i;
    render();
  }

  // ===== События =====
  $('runBtn').addEventListener('click', run);
  $('nextBtn').addEventListener('click', () => {
    if (step === STEPS.length - 1) location.href = 'constructor.html';
    else goStep(step + 1);
  });
  $('code').addEventListener('input', fitSlot);
  $('code').addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
  $('chips').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    $('slot').value = chip.dataset.val;
    fitSlot();
    run();
  });
  $('dots').addEventListener('click', e => {
    const d = e.target.closest('.dot');
    if (d) goStep(+d.dataset.step);
  });

  // ===== Весь код =====
  let modalCode = null;

  function showFile(lang) {
    const code = modalCode[lang];
    $('fullCode').innerHTML = code ? HL[lang](code) : '<span class="t-comment">Этот файл пока пустой.</span>';
    document.querySelectorAll('.file-tab').forEach(t => t.classList.toggle('active', t.dataset.file === lang));
  }

  $('allCodeBtn').addEventListener('click', () => {
    modalCode = siteCode(state.done);
    const lines = ['html', 'css', 'js'].reduce((n, k) => n + (modalCode[k] ? modalCode[k].trim().split('\n').length : 0), 0);
    openModal('<div class="box code-box">' +
      '<button class="close" data-close aria-label="Закрыть">×</button>' +
      '<h2>Весь код твоего сайта</h2>' +
      '<p>Сайт состоит из трёх файлов. Нажми на файл, чтобы его открыть.</p>' +
      '<div class="file-tabs">' +
      '<button class="file-tab html" data-file="html">index.html</button>' +
      '<button class="file-tab css" data-file="css">style.css</button>' +
      '<button class="file-tab js" data-file="js">script.js</button>' +
      '</div>' +
      '<pre class="full-code" id="fullCode"></pre>' +
      '<div class="code-count">Строк кода: <b>' + lines + '</b></div>' +
      '</div>');
    showFile('html');
  });

  function openModal(html) {
    $('modal').innerHTML = html;
    $('modal').classList.remove('hidden');
  }
  function closeModal() {
    if ($('modal').classList.contains('hidden')) return;
    $('modal').classList.add('hidden');
  }
  $('modal').addEventListener('click', e => {
    const tab = e.target.closest('[data-file]');
    if (tab) { showFile(tab.dataset.file); return; }
    if (e.target.closest('[data-close]') || e.target.id === 'modal') closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });



  // ===== Приветствие =====
  function start() {
    state.name = $('nameInput').value.trim() || 'Программист';
    save();
    $('welcome').classList.add('hidden');
    renderDots();
    $('slot').focus();
  }
  $('startBtn').addEventListener('click', start);
  $('nameInput').addEventListener('keydown', e => { if (e.key === 'Enter') start(); });

  render();
  showSite();
  if (state.done === STEPS.length && step === STEPS.length - 1) {
    say('Все 10 шагов пройдены! Можешь поменять любой шаг или жми «Дальше: конструктор».');
  }
  if (state.name) $('welcome').classList.add('hidden');
  else $('nameInput').focus();
})();
