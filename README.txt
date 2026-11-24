BUNKER — online multiplayer game

Files:
- server.js — Socket.IO server and game logic (serves index.html)
- index.html — the whole client (HTML, CSS, JS)
- content-i18n/en.json, kk.json, uk.json — переводы карт, катастроф и частей бункера (ключ — русский оригинал из server.js); сервер раздаёт их по /content-i18n/<язык>.json
- avatars.json — все аватарки одним файлом ({id: base64-jpeg}); если его нет, сервер ищет картинки в public/avatars/
- package.json — dependencies and start command

Run locally:
1. Install Node.js 18 or newer.
2. Open terminal in this folder.
3. Run: npm install
4. Run: npm start
5. Open: http://localhost:3000

For Railway deployment, upload this folder to a GitHub repository and deploy that repository.
The app must listen on the PORT environment variable provided by the hosting platform.

Шрифт и языки:
- Шрифты встроены прямо в index.html (base64): заголовки — Ethnocentric, остальной текст — JetBrains Mono. Отдельные файлы шрифтов и папка fonts/ не нужны.
- Язык интерфейса по умолчанию подстраивается под язык устройства/браузера (русский, English, Қазақша, Українська; для остальных — русский). Вручную: «Настройки» → «Язык»; пункт «Авто» возвращает автоопределение.

Игровые тексты (карты, катастрофы, бункер) тоже переводятся на выбранный язык. Если добавляете новую карточку в server.js, добавьте её перевод во все три файла content-i18n/*.json, иначе у неё останется русский текст.
