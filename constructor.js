(function () {
  'use strict';

  const STORE = 'kodlab-constructor-v1';
  const TRAINER_STORE = 'kodlab-easy-v1';
  const $ = id => document.getElementById(id);

  const TEXT_COLORS = ['black', 'red', 'blue', 'green', 'purple', 'orange', 'hotpink', 'teal'];
  const BUTTON_COLORS = ['white', 'gold', 'tomato', 'lightgreen', 'lightblue', 'pink', 'violet', 'orange'];
  const NAMES = { h1: 'Заголовок', p: 'Текст', img: 'Картинка', button: 'Кнопка', hr: 'Линия' };
  const DEFAULT_SIZE = { h1: 32, p: 20, button: 22 };
  const NEW_TEXT = 'Новый текст. Нажми и напиши своё.';

  // Подсказки робота: что можно сделать с блоком
  const TIPS = {
    h1: 'Заголовок. Пиши прямо на странице, а цвет, жирность и размер — на панельке над ним.',
    p: 'Текст. Нажми на него и пиши. Цвет, жирность и размер — на панельке сверху.',
    img: 'Картинка. На панельке выбери, кто на ней, и сделай её больше или меньше.',
    button: 'Кнопка. Поменяй надпись и выбери, что она делает при нажатии. Нажми на неё на странице — проверишь!',
    hr: 'Линия делит страницу на части. Её можно передвинуть стрелками ↑ ↓.'
  };

  // Задания конструктора: проверяются по самой странице
  const QUESTS = [
    { text: 'Напиши ещё один абзац о себе', check: p => p.blocks.filter(b => b.type === 'p' && b.text.trim() && b.text !== NEW_TEXT).length >= 2 },
    { text: 'Добавь вторую картинку', check: p => p.blocks.filter(b => b.type === 'img').length >= 2 },
    { text: 'Сделай любой текст цветным и жирным', check: p => p.blocks.some(b => (b.type === 'h1' || b.type === 'p') && b.bold && b.color && b.color !== 'black') },
    { text: 'Сделай новую кнопку, которая что-то делает', check: p => p.blocks.filter(b => b.type === 'button' && b.action && b.action !== 'none').length >= 2 },
    { text: 'Поменяй фон страницы', check: p => p.bg !== p.startBg }
  ];

  const ICON = {
    left: '<svg viewBox="0 0 16 16"><path d="M2 3h12M2 6.5h8M2 10h12M2 13.5h8"/></svg>',
    center: '<svg viewBox="0 0 16 16"><path d="M2 3h12M4 6.5h8M2 10h12M4 13.5h8"/></svg>',
    right: '<svg viewBox="0 0 16 16"><path d="M2 3h12M6 6.5h8M2 10h12M6 13.5h8"/></svg>'
  };

  let page = load();
  let selected = -1;
  let questsDone = QUESTS.map(q => q.check(page));

  // ===== Сохранение =====
  function load() {
    let p = null;
    try {
      const saved = JSON.parse(localStorage.getItem(STORE));
      if (saved && saved.blocks) p = saved;
    } catch (e) { /* нет сохранения */ }
    p = p || fromTrainer();
    if (!p.startBg) p.startBg = p.bg;
    return p;
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(page)); } catch (e) { /* хранилище недоступно */ }
  }

  // Первый раз начинаем с сайта, который ребёнок собрал в шагах
  function fromTrainer() {
    let v = {};
    try { v = (JSON.parse(localStorage.getItem(TRAINER_STORE)) || {}).values || {}; } catch (e) { /* пусто */ }
    const blocks = [
      { type: 'h1', text: v.title || 'Мой сайт', color: v.color || 'purple', align: 'center' },
      { type: 'p', text: v.text || 'Нажми на этот текст и напиши что-нибудь своё.', align: 'center' }
    ];
    if (v.pic) blocks.push({ type: 'img', pic: v.pic, width: +v.size || 200, align: 'center' });
    if (v.btn) {
      const btn = { type: 'button', text: v.btn, color: 'white', align: 'center', action: 'none' };
      if (v.swap && v.pic) { btn.action = 'img'; btn.to = v.swap; }
      else if (v.msg) { btn.action = 'alert'; btn.msg = v.msg; }
      blocks.push(btn);
    }
    return { bg: v.bg || 'white', font: v.font || 'sans-serif', blocks };
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function imgUri(name) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(IMAGES[name]);
  }
  function jsText(t) { return String(t).replace(/\\/g, '\\\\').replace(/'/g, "\\'"); }
  function say(text) {
    $('bubble').textContent = text;
    $('bubble').classList.remove('pop');
    void $('bubble').offsetWidth;
    $('bubble').classList.add('pop');
  }

  // ===== Блок → HTML-код =====
  // Стиль пишем прямо в тег (style="..."), как это делают визуальные редакторы.
  function styleOf(b) {
    const st = [];
    if (b.type === 'button') {
      if (b.color) st.push('background: ' + b.color);
      if (b.size && b.size !== DEFAULT_SIZE.button) st.push('font-size: ' + b.size + 'px');
    } else if (b.type === 'h1' || b.type === 'p') {
      if (b.color && b.color !== 'black') st.push('color: ' + b.color);
      if (b.size && b.size !== DEFAULT_SIZE[b.type]) st.push('font-size: ' + b.size + 'px');
      if (b.bold) st.push('font-weight: bold');
      if (b.italic) st.push('font-style: italic');
      if (b.align && b.align !== 'left') st.push('text-align: ' + b.align);
    }
    if (b.type === 'img' || b.type === 'button') {
      st.push('display: block');
      st.push('margin: ' + ({ left: '10px 0', center: '10px auto', right: '10px 0 10px auto' })[b.align || 'center']);
    }
    return st.length ? ' style="' + st.join('; ') + '"' : '';
  }

  function blockCode(b) {
    if (b.type === 'img') return '<img src="img/' + b.pic + '.svg" width="' + b.width + '"' + styleOf(b) + '>';
    if (b.type === 'hr') return '<hr>';
    return '<' + b.type + styleOf(b) + '>' + esc(b.text) + '</' + b.type + '>';
  }

  // Строчки <script> для кнопок с действием. i — номер блока-кнопки (для подсветки).
  function scriptLines() {
    const lines = [];
    let n = -1;
    page.blocks.forEach((b, i) => {
      if (b.type !== 'button') return;
      n++;
      if (!b.action || b.action === 'none') return;
      lines.push({ code: '  buttons[' + n + '].onclick = function() {', i, js: true });
      if (b.action === 'alert') lines.push({ code: "    alert('" + jsText(b.msg || '') + "');", i, js: true });
      if (b.action === 'img') lines.push({ code: "    document.querySelector('img').src = 'img/" + b.to + ".svg';", i, js: true });
      lines.push({ code: '  };', i, js: true });
    });
    if (!lines.length) return [];
    return [{ code: '<script>', i: -1 }, { code: "  let buttons = document.querySelectorAll('button');", i: -1, js: true }]
      .concat(lines, [{ code: '</script>', i: -1 }]);
  }

  function bodyOpen() {
    return '<body style="background: ' + page.bg + '; font-family: ' + page.font + '">';
  }

  // ===== Страница =====
  function renderPage() {
    const el = $('page');
    el.style.background = page.bg;
    el.style.fontFamily = page.font;
    el.innerHTML = page.blocks.map((b, i) => {
      let html = blockCode(b);
      if (b.type === 'img') html = html.replace(/src="img\/([a-z]+)\.svg"/, (all, name) => IMAGES[name] ? 'src="' + imgUri(name) + '"' : all);
      // заголовок и текст правятся прямо на странице
      const editable = b.type === 'h1' || b.type === 'p' ? ' contenteditable="true" spellcheck="false"' : '';
      return '<div class="blk' + (i === selected ? ' sel' : '') + '" data-i="' + i + '">' +
        '<span class="blk-tag">' + b.type + '</span>' +
        html.replace(/^<(h1|p)/, '<$1' + editable) + '</div>';
    }).join('') || '<div class="empty">Страница пустая. Добавь блоки из палитры.</div>';
    renderToolbar();
    renderCode();
    renderQuests();
  }

  // ===== Панелька над выбранным блоком =====
  function dots(list, current, attr) {
    return '<span class="tb-dots">' + list.map(c =>
      '<button class="dot-c' + (c === current ? ' on' : '') + '" data-' + attr + '="' + c + '" title="' + c + '" style="background:' + c + '"></button>').join('') + '</span>';
  }
  function thumbs(current, attr) {
    return '<span class="tb-thumbs">' + Object.keys(IMAGES).map(k =>
      '<button class="thumb' + (k === current ? ' on' : '') + '" data-' + attr + '="' + k + '" title="' + k + '"><img src="' + imgUri(k) + '" alt=""></button>').join('') + '</span>';
  }
  function btn(attrs, label, on, title) {
    return '<button class="tbb' + (on ? ' on' : '') + '" ' + attrs + (title ? ' title="' + title + '"' : '') + '>' + label + '</button>';
  }
  const SEP = '<span class="tb-sep"></span>';

  function toolbarHtml(b) {
    const rows = [];
    if (b.type === 'h1' || b.type === 'p') {
      rows.push(dots(TEXT_COLORS, b.color || 'black', 'color') + SEP +
        btn('data-toggle="bold"', '<b>Ж</b>', b.bold, 'Жирный') + btn('data-toggle="italic"', '<i>К</i>', b.italic, 'Наклонный') + SEP +
        btn('data-size="-4"', 'A−', false, 'Меньше') + btn('data-size="4"', 'A+', false, 'Больше'));
    }
    if (b.type === 'img') {
      rows.push(thumbs(b.pic, 'pic') + SEP +
        btn('data-width="-50"', '−', false, 'Меньше') + '<span class="tb-val">' + b.width + '</span>' + btn('data-width="50"', '+', false, 'Больше'));
    }
    if (b.type === 'button') {
      const act = b.action || 'none';
      rows.push('<input class="tb-input" data-field="text" value="' + esc(b.text) + '" title="Надпись на кнопке">' + SEP +
        dots(BUTTON_COLORS, b.color || 'white', 'color'));
      rows.push('<span class="tb-label">При нажатии:</span>' +
        [['none', 'ничего'], ['alert', 'сообщение'], ['img', 'сменить картинку']].map(a =>
          btn('data-action="' + a[0] + '"', a[1], act === a[0])).join(''));
      if (act === 'alert') rows.push('<span class="tb-label">Скажет:</span><input class="tb-input wide" data-field="msg" value="' + esc(b.msg || '') + '" placeholder="Что сказать?">');
      if (act === 'img') rows.push('<span class="tb-label">Сменит на:</span>' + thumbs(b.to, 'to'));
      if (act === 'img' && !page.blocks.some(x => x.type === 'img')) {
        rows.push('<span class="tb-warn">На странице нет картинки — добавь её из палитры.</span>');
      }
    }
    let last = '';
    if (b.type !== 'hr') {
      last += ['left', 'center', 'right'].map(a =>
        btn('data-align="' + a + '"', ICON[a], (b.align || 'left') === a, ({ left: 'Слева', center: 'По центру', right: 'Справа' })[a])).join('') + SEP;
    }
    last += btn('data-move="-1"', '↑', false, 'Выше') + btn('data-move="1"', '↓', false, 'Ниже') +
      '<span class="tb-grow"></span>' + btn('data-remove class="danger"', 'Удалить', false, 'Удалить блок');
    rows.push(last);
    return '<div class="tb-title">' + NAMES[b.type] + ' <code>&lt;' + b.type + '&gt;</code></div>' +
      rows.map(r => '<div class="tb-row">' + r + '</div>').join('');
  }

  function renderToolbar() {
    const old = $('page').querySelector('.toolbar');
    if (old) old.remove();
    const b = page.blocks[selected];
    if (!b) return;
    const bar = document.createElement('div');
    bar.className = 'toolbar';
    bar.innerHTML = toolbarHtml(b);
    $('page').appendChild(bar);
    placeToolbar();
  }

  // Панелька встаёт над блоком, а если сверху нет места — под ним
  function placeToolbar() {
    const bar = $('page').querySelector('.toolbar');
    const blk = $('page').querySelector('.blk[data-i="' + selected + '"]');
    if (!bar || !blk) return;
    let top = blk.offsetTop - bar.offsetHeight - 8;
    if (top < $('page').scrollTop + 4) top = blk.offsetTop + blk.offsetHeight + 8;
    bar.style.top = top + 'px';
  }

  // ===== Код справа =====
  function hlTag(code) {
    return esc(code)
      .replace(/(&lt;\/?)([a-z0-9]+)/g, '<span class="t-punct">$1</span><span class="t-tag">$2</span>')
      .replace(/([a-z-]+)=(&quot;[^&]*?&quot;)/g, '<span class="t-attr">$1</span>=<span class="t-string">$2</span>')
      .replace(/(\/?&gt;)/g, '<span class="t-punct">$1</span>');
  }
  function hlJs(code) {
    return esc(code)
      .replace(/('[^']*')/g, '<span class="t-string">$1</span>')
      .replace(/\b(let|function)\b/g, '<span class="t-keyword">$1</span>');
  }
  function renderCode() {
    const lines = [{ code: bodyOpen(), i: -1 }]
      .concat(page.blocks.map((b, i) => ({ code: '  ' + blockCode(b), i })))
      .concat(scriptLines().map(l => Object.assign({}, l, { code: '  ' + l.code })))
      .concat([{ code: '</body>', i: -1 }]);
    $('liveCode').innerHTML = lines.map((l, n) =>
      '<div class="ln' + (l.i === selected && l.i >= 0 ? ' hot' : '') + '"><span class="num">' + (n + 1) + '</span>' +
      (l.js ? hlJs(l.code) : hlTag(l.code)) + '</div>').join('');
    const hot = $('liveCode').querySelector('.hot');
    if (hot) {
      // прокручиваем только окно кода, а не всю страницу
      const box = $('liveCode');
      if (hot.offsetTop < box.scrollTop || hot.offsetTop > box.scrollTop + box.clientHeight - 30) box.scrollTop = hot.offsetTop - 40;
    }
    save();
  }

  // ===== Задания =====
  function renderQuests() {
    const now = QUESTS.map(q => q.check(page));
    const count = now.filter(Boolean).length;
    $('quests').innerHTML = '<div class="tool-title">Задания <span class="quest-count">' + count + ' из ' + QUESTS.length + '</span></div>' +
      '<ul>' + QUESTS.map((q, i) => '<li class="' + (now[i] ? 'done' : '') + '"><span class="check">' + (now[i] ? '✓' : '') + '</span>' + q.text + '</li>').join('') + '</ul>';
    const fresh = now.findIndex((d, i) => d && !questsDone[i]);
    questsDone = now;
    $('nextStage').classList.toggle('ready', count === QUESTS.length);
    if (fresh >= 0) {
      say(count === QUESTS.length
        ? 'Все задания выполнены! Получилась целая страница. Жми «Дальше: игра».'
        : 'Задание выполнено: «' + QUESTS[fresh].text + '». Осталось ' + (QUESTS.length - count) + '.');
    }
  }

  // ===== Выбор блока =====
  function select(i) {
    if (i === selected) return;
    selected = i;
    document.querySelectorAll('.blk').forEach(el => el.classList.toggle('sel', +el.dataset.i === i));
    renderToolbar();
    renderCode();
    if (page.blocks[i]) say(TIPS[page.blocks[i].type]);
  }
  function unselect() {
    selected = -1;
    document.querySelectorAll('.blk.sel').forEach(el => el.classList.remove('sel'));
    renderToolbar();
    renderCode();
  }

  // Показываем, что сделает кнопка, — как на настоящем сайте
  function tryButton(b) {
    if (b.action === 'img') {
      const img = $('page').querySelector('img');
      if (img && IMAGES[b.to]) img.src = imgUri(b.to);
    }
    if (b.action === 'alert') {
      const box = document.createElement('div');
      box.className = 'page-alert';
      box.innerHTML = '<div class="card"><div class="head">Сайт говорит:</div><div class="text"></div><button class="run small">ОК</button></div>';
      box.querySelector('.text').textContent = b.msg || '';
      box.querySelector('button').onclick = () => box.remove();
      document.querySelector('.cons-page .browser').appendChild(box);
    }
  }

  // ===== Палитра =====
  $('lookImg').innerHTML = '<img src="' + imgUri('cat') + '" alt="">';
  document.querySelector('.palette').addEventListener('click', e => {
    const tile = e.target.closest('[data-add]');
    if (!tile) return;
    const type = tile.dataset.add;
    page.blocks.push({
      h1: { type: 'h1', text: 'Новый заголовок', color: 'black', align: 'center' },
      p: { type: 'p', text: NEW_TEXT, align: 'center' },
      img: { type: 'img', pic: 'dog', width: 200, align: 'center' },
      button: { type: 'button', text: 'Нажми меня', color: 'gold', align: 'center', action: 'none' },
      hr: { type: 'hr' }
    }[type]);
    selected = page.blocks.length - 1;
    renderPage();
    const el = $('page').querySelector('.blk.sel');
    if (el) {
      $('page').scrollTop = el.offsetTop - 80;
      placeToolbar();
      el.classList.add('flash');
    }
    say('Добавлено: ' + NAMES[type].toLowerCase() + '. ' + TIPS[type]);
  });

  // ===== Страница: выбор, правка, кнопки =====
  $('page').addEventListener('click', e => {
    if (e.target.closest('.toolbar')) { toolbarClick(e); return; }
    const blk = e.target.closest('.blk');
    if (!blk) { unselect(); return; }
    const i = +blk.dataset.i;
    select(i);
    if (e.target.closest('button')) tryButton(page.blocks[i]);
  });

  function toolbarClick(e) {
    const b = page.blocks[selected];
    const t = e.target.closest('button');
    if (!b || !t) return;
    const d = t.dataset;
    if (d.color) b.color = d.color;
    if (d.toggle) b[d.toggle] = !b[d.toggle];
    if (d.size) b.size = Math.min(80, Math.max(12, (b.size || DEFAULT_SIZE[b.type]) + +d.size));
    if (d.pic) b.pic = d.pic;
    if (d.width) b.width = Math.min(600, Math.max(50, b.width + +d.width));
    if (d.align) b.align = d.align;
    if (d.action) {
      b.action = d.action;
      if (d.action === 'alert' && !b.msg) b.msg = 'Привет!';
      if (d.action === 'img' && !b.to) b.to = 'rocket';
      if (d.action !== 'none') say('Готово! Нажми на кнопку на странице — проверь, что она делает. А в коде справа появился JavaScript.');
    }
    if (d.to) b.to = d.to;
    if (d.move) {
      const j = selected + +d.move;
      if (j < 0 || j >= page.blocks.length) return;
      [page.blocks[selected], page.blocks[j]] = [page.blocks[j], page.blocks[selected]];
      selected = j;
    }
    if ('remove' in d) {
      page.blocks.splice(selected, 1);
      selected = -1;
      say('Блок удалён. Код справа тоже стал короче.');
    }
    renderPage();
  }

  // Поля на панельке (надпись кнопки, сообщение) и текст прямо на странице
  $('page').addEventListener('input', e => {
    const b = page.blocks[selected];
    const field = e.target.dataset && e.target.dataset.field;
    if (field && b) {
      b[field] = e.target.value;
      if (field === 'text') $('page').querySelector('.blk[data-i="' + selected + '"] button').textContent = b.text;
    } else {
      const blk = e.target.closest('.blk');
      if (!blk) return;
      page.blocks[+blk.dataset.i].text = e.target.innerText.replace(/\n+$/, '');
      placeToolbar();
    }
    renderCode();
    renderQuests();
  });
  // Enter в заголовке или тексте не делает новых строк — так код остаётся простым
  $('page').addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.isContentEditable) { e.preventDefault(); e.target.blur(); }
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && selected >= 0 && !e.target.isContentEditable) unselect();
  });
  window.addEventListener('resize', placeToolbar);

  // ===== Фон =====
  const BGS = ['white'].concat(LIGHT_COLORS.filter(c => c !== 'white'));
  function renderBg() {
    $('bgSwatches').innerHTML = BGS.map(c =>
      '<button class="sw' + (c === page.bg ? ' on' : '') + '" data-bg="' + c + '" title="' + c + '" style="background:' + c + '"></button>').join('');
  }
  $('bgSwatches').addEventListener('click', e => {
    const t = e.target.closest('[data-bg]');
    if (!t) return;
    page.bg = t.dataset.bg;
    renderBg();
    renderPage();
  });

  // ===== Скачать и дальше =====
  $('downloadBtn').addEventListener('click', () => {
    const body = page.blocks.map(b => '  ' + blockCode(b)).concat(scriptLines().map(l => '  ' + l.code)).join('\n')
      .replace(/img\/([a-z]+)\.svg/g, (all, name) => IMAGES[name] ? imgUri(name).replace(/'/g, '%27') : all);
    const doc = '<!DOCTYPE html>\n<html lang="ru">\n<head>\n<meta charset="UTF-8">\n<title>Мой сайт</title>\n</head>\n' +
      bodyOpen() + '\n' + body + '\n</body>\n</html>\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([doc], { type: 'text/html' }));
    a.download = 'my-page.html';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // «Дальше: игра» — конструктор пройден
  $('nextStage').addEventListener('click', () => {
    Nav.mark('cons');
    location.href = 'game.html';
  });

  renderBg();
  renderPage();
  say('Это конструктор — собери страницу побольше. Добавляй блоки из палитры и выполняй задания. Нажми на любой блок на странице, чтобы его изменить.');
})();
