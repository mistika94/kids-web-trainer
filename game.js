(function () {
  'use strict';

  const STORE = 'kodlab-game-v1';
  const RECORDS = 'kodlab-game-records';
  const TIME = 30; // секунд на одну игру — это правило не меняется
  const $ = id => document.getElementById(id);

  // Настройки, которые ребёнок меняет в коде
  const FIELDS = {
    picture: { label: 'Кого ловим', quote: true, choices: Object.keys(IMAGES), comment: 'кого ловим' },
    speed: { label: 'Как часто прыгает', choices: ['1200', '900', '600', '400'], comment: 'как часто прыгает (мс)' },
    size: { label: 'Размер', choices: ['120', '90', '70', '50'], comment: 'размер в пикселях' },
    background: { label: 'Фон поля', quote: true, choices: ['lightgreen', 'lightblue', 'lavender', 'peachpuff', 'white'], comment: 'цвет поля' }
  };

  let settings = load();
  let playing = false;
  let score = 0;
  let jumpTimer = null;
  let clockTimer = null;

  function load() {
    const def = { picture: 'cat', speed: '900', size: '90', background: 'lightgreen' };
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (s) return Object.assign(def, s);
    } catch (e) { /* нет сохранения */ }
    return def;
  }
  function save() {
    try { localStorage.setItem(STORE, JSON.stringify(settings)); } catch (e) { /* хранилище недоступно */ }
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function imgUri(name) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(IMAGES[name]);
  }
  function say(text) {
    $('bubble').textContent = text;
    $('bubble').classList.remove('pop');
    void $('bubble').offsetWidth;
    $('bubble').classList.add('pop');
  }

  // Чем меньше и быстрее цель — тем больше очков за поимку
  function pointsFor(s) {
    return Math.round(1000 / s.speed * 1000 / s.size);
  }

  // ===== Код с клетками =====
  function renderCode() {
    const c = s => '<span class="t-comment">' + esc(s) + '</span>';
    const kw = s => '<span class="t-keyword">' + s + '</span>';
    let html = c('// Настройки игры — меняй их!') + '\n';
    Object.keys(FIELDS).forEach(key => {
      const f = FIELDS[key];
      const q = f.quote ? '<span class="t-string">\'</span>' : '';
      html += kw('let') + ' ' + key + ' = ' + q +
        '<input class="slot" data-key="' + key + '" spellcheck="false" autocomplete="off" value="' + esc(settings[key]) + '">' +
        q + ';  ' + c('// ' + f.comment) + '\n';
    });
    html += '\n' + c('// Чем меньше и быстрее цель — тем больше очков') + '\n' +
      kw('let') + ' points = Math.<span class="t-func">round</span>(1000 / speed * 1000 / size);';
    $('code').innerHTML = html;
    $('code').querySelectorAll('.slot').forEach(fit);
  }
  function fit(slot) {
    slot.style.width = 'calc(' + Math.max(slot.value.length, 3) + 'ch + 24px)';
  }

  function renderChoices() {
    $('choices').innerHTML = Object.keys(FIELDS).map(key => {
      const f = FIELDS[key];
      const chips = f.choices.map(v => {
        let inner = v;
        if (key === 'picture') inner = '<img src="' + imgUri(v) + '" alt="">' + v;
        if (key === 'background') inner = '<i style="background:' + v + '"></i>' + v;
        return '<button class="chip' + (key === 'picture' ? ' pic small-pic' : ' mini') + (settings[key] === v ? ' on' : '') +
          '" data-key="' + key + '" data-val="' + v + '">' + inner + '</button>';
      }).join('');
      return '<div class="choice-group"><div class="choice-label">' + f.label + '</div><div class="chips">' + chips + '</div></div>';
    }).join('');
  }

  // ===== Проверка настроек =====
  function readSettings() {
    const s = Object.assign({}, settings);
    let error = null;
    $('code').querySelectorAll('.slot').forEach(slot => {
      const key = slot.dataset.key, val = slot.value.trim();
      s[key] = val;
      if (error) return;
      if (key === 'picture' && !IMAGES[val]) error = [slot, 'Такой картинки нет. Можно: ' + Object.keys(IMAGES).join(', ') + '.'];
      if (key === 'speed' && !(/^\d+$/.test(val) && val >= 200 && val <= 3000)) error = [slot, 'speed — это число от 200 до 3000. Меньше число — кот прыгает чаще.'];
      if (key === 'size' && !(/^\d+$/.test(val) && val >= 30 && val <= 200)) error = [slot, 'size — это число от 30 до 200.'];
      if (key === 'background' && !CSS.supports('color', val)) error = [slot, 'Компьютер не знает цвет «' + val + '». Выбери цвет внизу.'];
    });
    return { s, error };
  }

  function showPoints() {
    const { s, error } = readSettings();
    $('perCatch').textContent = error ? '?' : pointsFor(s);
  }

  // ===== Игра =====
  function jump() {
    const arena = $('arena'), t = $('target');
    const size = +settings.size;
    t.style.left = Math.random() * Math.max(0, arena.clientWidth - size) + 'px';
    t.style.top = Math.random() * Math.max(0, arena.clientHeight - size) + 'px';
    clearTimeout(jumpTimer);
    jumpTimer = setTimeout(jump, +settings.speed);
  }

  function start() {
    if (playing) return;
    const { s, error } = readSettings();
    if (error) {
      say(error[1]);
      error[0].classList.remove('shake');
      void error[0].offsetWidth;
      error[0].classList.add('shake');
      error[0].focus();
      return;
    }
    Object.assign(settings, s);
    save();
    renderChoices();

    const t = $('target');
    t.src = imgUri(settings.picture);
    t.style.width = t.style.height = settings.size + 'px';
    t.classList.remove('hidden');
    $('arena').style.background = settings.background;
    $('arenaMsg').classList.add('hidden');

    playing = true;
    score = 0;
    let left = TIME;
    $('score').textContent = 0;
    $('timeLeft').textContent = left;
    $('playBtn').disabled = true;
    say('Лови! У тебя ' + TIME + ' секунд.');
    // на телефоне поле может быть выше экрана — показываем его
    const r = $('arena').getBoundingClientRect();
    if (r.top < 0 || r.bottom > innerHeight) window.scrollBy({ top: r.top - 60, behavior: 'smooth' });
    jump();
    clockTimer = setInterval(() => {
      left--;
      $('timeLeft').textContent = left;
      if (left <= 0) finish();
    }, 1000);
  }

  function finish() {
    playing = false;
    clearInterval(clockTimer);
    clearTimeout(jumpTimer);
    $('target').classList.add('hidden');
    $('playBtn').disabled = false;
    const name = Nav.status().name || 'Игрок';
    const best = addRecord(name, score);
    // первая сыгранная игра закрывает третью часть — дальше диплом
    const firstFinish = !Nav.status().game;
    Nav.mark('game');
    $('arenaMsg').innerHTML = '<span>Игра окончена!<br>Очки: <b>' + score + '</b>' + (best ? '<br>Это новый рекорд!' : '') +
      (Nav.status().game ? '<br><button class="run" data-diploma>Получить диплом</button>' : '') + '</span>';
    if (firstFinish && Nav.status().game) setTimeout(Nav.showDiploma, 1200);
    $('arenaMsg').classList.remove('hidden');
    say(score
      ? 'Неплохо! Попробуй поменять speed и size в коде: быстрый маленький кот даёт больше очков, но его сложнее поймать.'
      : 'Ни одного кота… Сделай size побольше, а speed — число побольше, чтобы кот прыгал реже.');
  }

  // pointerdown — срабатывает сразу и от мыши, и от пальца на телефоне
  $('target').addEventListener('pointerdown', e => {
    if (!playing) return;
    e.preventDefault();
    score += pointsFor(settings);
    $('score').textContent = score;
    const t = $('target');
    t.classList.remove('caught');
    void t.offsetWidth;
    t.classList.add('caught');
    jump();
  });

  // ===== Рекорды =====
  function records() {
    try { return JSON.parse(localStorage.getItem(RECORDS)) || []; } catch (e) { return []; }
  }
  function addRecord(name, points) {
    const list = records();
    const isBest = !list.length || points > list[0].points;
    list.push({ name, points });
    list.sort((a, b) => b.points - a.points);
    try { localStorage.setItem(RECORDS, JSON.stringify(list.slice(0, 10))); } catch (e) { /* хранилище недоступно */ }
    renderRecords();
    return isBest && points > 0;
  }
  function renderRecords() {
    const list = records();
    $('records').innerHTML = list.length
      ? list.map(r => '<li><span>' + esc(r.name) + '</span><b>' + r.points + '</b></li>').join('')
      : '<li class="no-records">Пока никто не играл. Будь первым!</li>';
  }

  // ===== События =====
  $('code').addEventListener('input', e => {
    if (e.target.classList.contains('slot')) { fit(e.target); showPoints(); }
  });
  $('code').addEventListener('keydown', e => { if (e.key === 'Enter') start(); });
  $('choices').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip || playing) return;
    const slot = $('code').querySelector('.slot[data-key="' + chip.dataset.key + '"]');
    slot.value = chip.dataset.val;
    fit(slot);
    settings[chip.dataset.key] = chip.dataset.val;
    save();
    renderChoices();
    showPoints();
    if (chip.dataset.key === 'background') $('arena').style.background = chip.dataset.val;
  });
  $('playBtn').addEventListener('click', start);
  $('arenaMsg').addEventListener('click', e => { if (e.target.closest('[data-diploma]')) Nav.showDiploma(); });

  renderCode();
  renderChoices();
  renderRecords();
  showPoints();
  $('arena').style.background = settings.background;
  say('Это код настоящей игры. Поменяй настройки в жёлтых клетках или нажми на варианты внизу — и запускай!');
})();
