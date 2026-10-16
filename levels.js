// ===== Готовые картинки для сайта (img/cat.svg и т.д.) =====
const IMAGES = {
  cat: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#ffe8cc"/><polygon points="45,80 60,25 95,60" fill="#f59f00"/><polygon points="155,80 140,25 105,60" fill="#f59f00"/><polygon points="55,70 63,40 85,60" fill="#ffc9c9"/><polygon points="145,70 137,40 115,60" fill="#ffc9c9"/><circle cx="100" cy="110" r="65" fill="#f59f00"/><ellipse cx="75" cy="100" rx="10" ry="14" fill="#212529"/><ellipse cx="125" cy="100" rx="10" ry="14" fill="#212529"/><circle cx="78" cy="95" r="4" fill="#fff"/><circle cx="128" cy="95" r="4" fill="#fff"/><polygon points="92,125 108,125 100,135" fill="#e64980"/><path d="M100 135 q-10 12 -20 4 M100 135 q10 12 20 4" stroke="#212529" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M40 120 h35 M40 132 l35 -4 M160 120 h-35 M160 132 l-35 -4" stroke="#212529" stroke-width="2.5" stroke-linecap="round"/></svg>',
  dog: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#d0ebff"/><ellipse cx="45" cy="95" rx="22" ry="45" fill="#7f4f24" transform="rotate(15 45 95)"/><ellipse cx="155" cy="95" rx="22" ry="45" fill="#7f4f24" transform="rotate(-15 155 95)"/><circle cx="100" cy="105" r="60" fill="#c08552"/><ellipse cx="100" cy="135" rx="32" ry="24" fill="#f3d5b5"/><circle cx="78" cy="95" r="9" fill="#212529"/><circle cx="122" cy="95" r="9" fill="#212529"/><circle cx="81" cy="92" r="3" fill="#fff"/><circle cx="125" cy="92" r="3" fill="#fff"/><ellipse cx="100" cy="122" rx="12" ry="9" fill="#212529"/><path d="M100 131 v8 M88 142 q12 10 24 0" stroke="#212529" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M95 146 q5 18 10 0" fill="#ff6b6b"/></svg>',
  rocket: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#1c1f4a"/><circle cx="30" cy="40" r="2" fill="#fff"/><circle cx="160" cy="30" r="3" fill="#fff"/><circle cx="170" cy="150" r="2" fill="#fff"/><circle cx="40" cy="160" r="3" fill="#fff"/><path d="M100 20 C130 50 135 100 125 140 H75 C65 100 70 50 100 20Z" fill="#f1f3f5"/><path d="M100 20 C112 32 120 45 124 60 H76 C80 45 88 32 100 20Z" fill="#fa5252"/><circle cx="100" cy="90" r="16" fill="#4dabf7" stroke="#495057" stroke-width="5"/><path d="M75 115 L50 150 L78 140Z M125 115 L150 150 L122 140Z" fill="#fa5252"/><path d="M82 142 Q100 195 118 142Z" fill="#ffa94d"/><path d="M90 142 Q100 175 110 142Z" fill="#ffe066"/></svg>',
  robot: '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#e6fcf5"/><line x1="100" y1="40" x2="100" y2="20" stroke="#495057" stroke-width="5"/><circle cx="100" cy="18" r="8" fill="#fa5252"/><rect x="45" y="40" width="110" height="90" rx="18" fill="#adb5bd"/><rect x="30" y="70" width="15" height="30" rx="5" fill="#868e96"/><rect x="155" y="70" width="15" height="30" rx="5" fill="#868e96"/><circle cx="78" cy="80" r="15" fill="#fff"/><circle cx="122" cy="80" r="15" fill="#fff"/><circle cx="78" cy="80" r="7" fill="#12b886"/><circle cx="122" cy="80" r="7" fill="#12b886"/><rect x="70" y="105" width="60" height="12" rx="6" fill="#495057"/><rect x="60" y="135" width="80" height="50" rx="10" fill="#868e96"/><circle cx="100" cy="160" r="10" fill="#ffd43b"/></svg>'
};

const COLORS = ['red', 'blue', 'green', 'purple', 'orange', 'hotpink', 'gold', 'teal'];
const LIGHT_COLORS = ['lightyellow', 'lightblue', 'pink', 'lavender', 'lightgreen', 'peachpuff', 'aquamarine', 'white'];

// ===== Шаги =====
// code — строчка настоящего кода; { field } — пустая клетка, которую заполняет ребёнок,
// { show } — то, что уже заполнено раньше.
const STEPS = [
  {
    key: 'title', name: 'Заголовок', file: 'index.html',
    say: 'Начнём с заголовка. Напиши в жёлтой клетке, как называется твой сайт.',
    code: ['<h1>', { field: 'title', ph: 'Сайт Ани' }, '</h1>'],
    win: 'Есть заголовок. Посмотри на сайт справа.'
  },
  {
    key: 'text', name: 'Текст', file: 'index.html',
    say: 'Теперь напиши пару слов о себе. Тег p — это абзац текста.',
    code: ['<p>', { field: 'text', ph: 'Я люблю котиков' }, '</p>'],
    win: 'Текст появился под заголовком.'
  },
  {
    key: 'color', name: 'Цвет', file: 'style.css',
    say: 'Раскрасим заголовок. Нажми на кружок нужного цвета — слово само впишется в код.',
    code: ['h1 {\n  color: ', { field: 'color', ph: 'red' }, ';\n}'],
    colors: COLORS,
    win: 'Заголовок поменял цвет. Можешь попробовать другой кружок.'
  },
  {
    key: 'font', name: 'Шрифт', file: 'style.css',
    say: 'Шрифт — это то, как нарисованы буквы. Нажми на образец, который нравится.',
    code: ['body {\n  font-family: ', { field: 'font', ph: 'cursive' }, ';\n}'],
    fonts: ['sans-serif', 'serif', 'cursive', 'monospace', 'fantasy'],
    win: 'Буквы на сайте стали другими.'
  },
  {
    key: 'bg', name: 'Фон', file: 'style.css',
    say: 'Выбери цвет фона. body — это вся страница целиком.',
    code: ['body {\n  background: ', { field: 'bg', ph: 'lightblue' }, ';\n}'],
    colors: LIGHT_COLORS,
    win: 'Фон поменялся.'
  },
  {
    key: 'pic', name: 'Картинка', file: 'index.html',
    say: 'Добавим картинку. Выбери, какая нравится.',
    code: ['<img src="img/', { field: 'pic', ph: 'cat' }, '.svg">'],
    pics: true,
    win: 'Картинка на месте.'
  },
  {
    key: 'size', name: 'Размер', file: 'index.html',
    say: 'Картинку можно сделать больше или меньше. width — это ширина. Выбери число или впиши своё.',
    code: ['<img src="img/', { show: 'pic' }, '.svg" width="', { field: 'size', ph: '200' }, '">'],
    sizes: ['100', '150', '200', '300'],
    win: 'Картинка поменяла размер.'
  },
  {
    key: 'btn', name: 'Кнопка', file: 'index.html',
    say: 'Сделаем кнопку. Что на ней будет написано?',
    code: ['<button>', { field: 'btn', ph: 'Нажми меня' }, '</button>'],
    win: 'Кнопка есть, но пока ничего не делает. Это исправим в следующем шаге.'
  },
  {
    key: 'msg', name: 'Программа', file: 'script.js',
    say: 'Это язык JavaScript — он учит сайт что-то делать. Напиши, что кнопка скажет, когда её нажмут.',
    code: ["let button = document.querySelector('button');\n\nbutton.onclick = function() {\n  alert('", { field: 'msg', ph: 'Привет!' }, "');\n};"],
    win: 'Это твоя первая программа. Нажми кнопку на сайте справа.'
  },
  {
    key: 'swap', name: 'Фокус', file: 'script.js',
    say: 'Последний шаг: пусть кнопка ещё и меняет картинку. Выбери, на какую.',
    code: ["button.onclick = function() {\n  alert('", { show: 'msg' }, "');\n  let img = document.querySelector('img');\n  img.src = 'img/", { field: 'swap', ph: 'rocket' }, ".svg';\n};"],
    pics: true,
    win: 'Получилось! Нажми кнопку на сайте — картинка поменяется. Первая часть готова: жми «Дальше: конструктор».'
  }
];
