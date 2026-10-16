// Общая шапка для всех трёх частей: этапы, имя, сброс и диплом.
// Подключается после levels.js на каждой странице.
(function () {
  'use strict';

  const TRAINER = 'kodlab-easy-v1';
  const PROGRESS = 'kodlab-progress-v1';
  const $ = id => document.getElementById(id);

  const ROBOT = '<svg width="0" height="0" style="position:absolute"><symbol id="robot" viewBox="0 0 80 90">' +
    '<line x1="40" y1="14" x2="40" y2="4" stroke="#22252b" stroke-width="3"/>' +
    '<circle cx="40" cy="5" r="4" fill="#f25f4c" stroke="#22252b" stroke-width="2.5"/>' +
    '<rect x="10" y="14" width="60" height="44" rx="8" fill="#7fc8d3" stroke="#22252b" stroke-width="3"/>' +
    '<rect x="4" y="28" width="6" height="14" rx="2" fill="#f2c14e" stroke="#22252b" stroke-width="2.5"/>' +
    '<rect x="70" y="28" width="6" height="14" rx="2" fill="#f2c14e" stroke="#22252b" stroke-width="2.5"/>' +
    '<circle cx="28" cy="34" r="7" fill="#fff" stroke="#22252b" stroke-width="2.5"/>' +
    '<circle cx="52" cy="34" r="7" fill="#fff" stroke="#22252b" stroke-width="2.5"/>' +
    '<circle cx="29" cy="35" r="3" fill="#22252b"/><circle cx="53" cy="35" r="3" fill="#22252b"/>' +
    '<path d="M30 47 q10 7 20 0" fill="none" stroke="#22252b" stroke-width="3" stroke-linecap="round"/>' +
    '<rect x="20" y="62" width="40" height="24" rx="5" fill="#f2c14e" stroke="#22252b" stroke-width="3"/>' +
    '<rect x="33" y="69" width="14" height="10" rx="2" fill="#fff" stroke="#22252b" stroke-width="2"/>' +
    '</symbol></svg>';

  const GAMES = [
    ['Перейди дорогу', 'https://codepen.io/HunorMarton/full/JwWLJo'],
    ['Башня', 'https://codepen.io/ste-vg/full/ppLQNW'],
    ['Герой с палкой', 'https://codepen.io/HunorMarton/full/xxOMQKg'],
    ['Воздушный хоккей', 'https://codepen.io/tommyho/full/ZEdpJZq'],
    ['Кубик Рубика', 'https://codepen.io/bsehovac/full/EMyWVv'],
    ['Лабиринт', 'https://codepen.io/HunorMarton/full/VwKwgxX']
  ];

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)) || {}; } catch (e) { return {}; }
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function status() {
    const t = read(TRAINER), p = read(PROGRESS);
    const steps = (t.done || 0) >= STEPS.length;
    return { name: t.name || '', steps, cons: steps && !!p.cons, game: steps && !!p.cons && !!p.game };
  }

  function mark(part) {
    const p = read(PROGRESS);
    p[part] = true;
    try { localStorage.setItem(PROGRESS, JSON.stringify(p)); } catch (e) { /* хранилище недоступно */ }
    render();
  }

  // ===== Этапы в шапке =====
  function render() {
    const s = status();
    const page = (location.pathname.split('/').pop() || 'index.html').replace(/^$/, 'index.html');
    const parts = [
      { n: 1, title: 'Сайт по шагам', href: 'index.html', done: s.steps, open: true },
      { n: 2, title: 'Конструктор', href: 'constructor.html', done: s.cons, open: s.steps, lock: 'Сначала пройди все 10 шагов' },
      { n: 3, title: 'Игра', href: 'game.html', done: s.game, open: s.cons, lock: 'Сначала загляни в конструктор' },
      { n: '★', title: 'Диплом', diploma: true, done: false, open: s.game, lock: 'Диплом — после игры' }
    ];
    $('stages').innerHTML = parts.map((p, i) => {
      const cls = 'stage' + (p.done ? ' done' : '') + (p.href === page ? ' current' : '') + (p.open ? '' : ' locked');
      const inner = '<span class="stage-num">' + (p.done ? '✓' : p.n) + '</span>' + p.title;
      const arrow = i ? '<span class="stage-arrow">→</span>' : '';
      if (!p.open) return arrow + '<span class="' + cls + '" title="' + p.lock + '">' + inner + '</span>';
      if (p.diploma) return arrow + '<button class="' + cls + '" data-diploma>' + inner + '</button>';
      return arrow + '<a class="' + cls + '" href="' + p.href + '">' + inner + '</a>';
    }).join('');
    $('playerName').textContent = s.name;
  }

  // ===== Диплом =====
  function showDiploma() {
    let modal = $('navModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'navModal';
      modal.className = 'modal hidden';
      document.body.appendChild(modal);
      modal.addEventListener('click', e => {
        if (e.target.closest('[data-print]')) { window.print(); return; }
        if (e.target.closest('[data-close]') || e.target === modal) modal.classList.add('hidden');
      });
    }
    const date = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
    modal.innerHTML = '<div class="diploma-wrap">' +
      '<div class="diploma">' +
      '<svg class="diploma-robot"><use href="#robot"/></svg>' +
      '<div class="diploma-title">Диплом</div>' +
      '<div class="diploma-sub">юного программиста</div>' +
      '<div class="diploma-name">' + esc(status().name || 'Программист') + '</div>' +
      '<p>за собственный сайт, страницу в конструкторе<br>и настроенную игру на языках</p>' +
      '<div class="skills"><span class="html">HTML</span><span class="css">CSS</span><span class="js">JavaScript</span></div>' +
      '<div class="diploma-foot">' +
      '<div><span>' + date + '</span><small>дата</small></div>' +
      '<div><span class="sign">Байт</span><small>робот-учитель</small></div>' +
      '</div></div>' +
      '<div class="modal-actions">' +
      '<button class="next" data-print>Распечатать</button>' +
      '<button class="run" data-close>Закрыть</button>' +
      '</div>' +
      '<div class="more-games"><b>Что ещё умеют программисты.</b> Эти игры тоже сделаны на HTML, CSS и JavaScript:' +
      '<div class="games">' + GAMES.map(g => '<a href="' + g[1] + '" target="_blank" rel="noopener">' + g[0] + '</a>').join('') + '</div></div>' +
      '</div>';
    modal.classList.remove('hidden');
  }

  // ===== Сброс для следующего ученика (рекорды игры остаются) =====
  function reset() {
    if (!confirm('Начать заново для нового ученика? Сайт, страница и настройки игры сотрутся. Рекорды останутся.')) return;
    try {
      ['kodlab-easy-v1', 'kodlab-constructor-v1', 'kodlab-game-v1', PROGRESS].forEach(k => localStorage.removeItem(k));
    } catch (e) { /* хранилище недоступно */ }
    location.href = 'index.html';
  }

  document.body.insertAdjacentHTML('afterbegin', $('robot') ? '' : ROBOT);
  $('stages').addEventListener('click', e => { if (e.target.closest('[data-diploma]')) showDiploma(); });
  $('resetBtn').addEventListener('click', reset);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && $('navModal')) $('navModal').classList.add('hidden');
  });
  render();

  window.Nav = { status, mark, render, showDiploma };
})();
