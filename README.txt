BUNKER — online multiplayer game

Files:
- server.js — Socket.IO server and game logic (serves index.html)
- index.html — the whole client (HTML, CSS, JS)
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
- Шрифт интерфейса — Ethnocentric: файл ethnocentric.otf лежит в корне проекта рядом с server.js и отдаётся по адресу /ethnocentric.otf.
- Языки интерфейса (русский, English, Қазақша, Українська) переключаются в «Настройки» → «Язык».
