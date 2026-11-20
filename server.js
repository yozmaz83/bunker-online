/*
 BUNKER — единый файл приложения.
 Запуск:
   npm install socket.io
   node --input-type=module bunker.js
 Или добавьте в package.json: { "type": "module" } и запускайте: node bunker.js

 Требуется Node.js 18+ и установленный пакет socket.io.
 Клиентская страница, сервер Socket.IO, данные и игровая логика собраны здесь.
*/
import http from 'node:http';
import { readFileSync } from 'node:fs';
import { randomInt, randomBytes } from 'node:crypto';
import { Server } from 'socket.io';

const HTML = readFileSync(new URL('./index.html', import.meta.url)); // клиент: index.html


// ===== ДАННЫЕ И КАРТЫ =====
const pick = a => a[randomInt(a.length)];

// Карты: основные (1–50) + смешные (51–70) + с матами (71–90).
const PROF = [
  'Врач-хирург',
  'Инженер-строитель',
  'Учитель биологии',
  'Военный офицер',
  'Повар',
  'Электрик',
  'Психолог',
  'Фермер',
  'Химик-лаборант',
  'Механик',
  'Спасатель МЧС',
  'Программист',
  'Медсестра',
  'Ветеринар',
  'Пилот вертолёта',
  'Охранник',
  'Биолог',
  'Геолог',
  'Радиоинженер',
  'Слесарь-сантехник',
  'Полицейский',
  'Пожарный',
  'Швея',
  'Агроном',
  'Водитель-дальнобойщик',
  'Сварщик',
  'Архитектор',
  'Фармацевт',
  'Сапёр',
  'Рыбак',
  'Пчеловод',
  'Кузнец',
  'Переводчик',
  'Историк',
  'Музыкант',
  'Актёр',
  'Художник',
  'Парикмахер',
  'Массажист',
  'Тренер по фитнесу',
  'Сексолог',
  'Стриптизёрша/стриптизёр',
  'Порноактёр',
  'Сутенёр',
  'Бармен',
  'Официант',
  'Кассир',
  'Уборщик',
  'Библиотекарь',
  'Безработный',
  'Профессиональный бездельник',
  'Тестировщик диванов',
  'Инфлюенсер по выживанию (снимает всё на телефон)',
  'Дегустатор доширака',
  'Повелитель пылесоса',
  'Специалист по поиску носков',
  'Тренер по сну',
  'Консультант по отношениям с кактусами',
  'Ведущий свадеб без невесты',
  'Менеджер по кризису в чатах',
  'Хранитель холодильника',
  'Эксперт по фразе «я знаю, где это лежит»',
  'Сборщик мебели без инструкции',
  'Аниматор в бункере',
  'Переговорщик с тараканами',
  'Сексолог-практик без диплома',
  'Испытатель эротического белья',
  'Консультант по «свиданиям в бункере»',
  'Специалист по романтике при свечах (свечи закончились)',
  'Министр по делам пакетов с пакетами',
  'Профессиональный долбоёб',
  'Мастер спорта по хуйне',
  'Главный по пиздецу',
  'Заведующий отделом «нахуй надо»',
  'Специалист по разгребанию чужого говна',
  'Инженер-конструктор хуйни на коленке',
  'Эксперт по фразе «да похуй, прокатит»',
  'Тренер по забиванию хуя',
  'Менеджер по поиску виноватого (нихуя не находит)',
  'Консультант по нахуй-посыланию клиентов',
  'Мастер по закручиванию гаек через жопу',
  'Хранитель последней банки пива (нихуя не отдаёт)',
  'Переговорщик с долбоёбами',
  'Сварщик, который варит через пизду',
  'Прораб с фразой «и так заебись»',
  'Сантехник, который «хуй знает, но починил»',
  'Сексолог-долбоёб без образования',
  'Мастер по ебле мозгов',
  'Дрочила-профессионал',
  'Трахатель дивана'
];
// ===== КАТЕГОРИИ ПРОФЕССИЙ (классификация вручную, номера — позиции в PROF, начиная с 1) =====
// PROF-START
const ADULT_IDX = new Set([41, 42, 43, 44, 66, 67, ...Array.from({ length: 20 }, (_, i) => 71 + i)]); // 18+ (приоритет над «смешными»)
const FUNNY_IDX = new Set(Array.from({ length: 20 }, (_, i) => 51 + i).filter(n => !ADULT_IDX.has(n)));
const ADULT_PROFESSIONS = PROF.filter((_, i) => ADULT_IDX.has(i + 1));
const FUNNY_PROFESSIONS = PROF.filter((_, i) => FUNNY_IDX.has(i + 1));
const NORMAL_PROFESSIONS = PROF.filter((_, i) => !ADULT_IDX.has(i + 1) && !FUNNY_IDX.has(i + 1));
// Бросок 0..99: 0–74 обычные (75%), 75–89 смешные (15%), 90–99 18+ (10%). randomInt — CSPRNG Node.js.
function weightedProfessionPick(roll = randomInt(100)) {
  const list = roll < 75 ? NORMAL_PROFESSIONS : roll < 90 ? FUNNY_PROFESSIONS : ADULT_PROFESSIONS;
  return list[randomInt(list.length)];
}
// PROF-END

const HEALTH = [
  'Абсолютно здоров',
  'Аллергия на пыль',
  'Хроническая бессонница',
  'Астма',
  'Диабет 1 типа',
  'Диабет 2 типа',
  'Гипертония',
  'Гипотония',
  'Плохое зрение (−8)',
  'Дальтонизм',
  'Глухота на одно ухо',
  'Отсутствие двух пальцев на руке',
  'Хромота',
  'Артрит',
  'Мигрени',
  'Эпилепсия',
  'Панические атаки',
  'Депрессия',
  'Ожирение 2 степени',
  'Дистрофия',
  'Анемия',
  'Гастрит',
  'Язва желудка',
  'Камни в почках',
  'Хронический бронхит',
  'Туберкулёз (в ремиссии)',
  'ВИЧ (терапия)',
  'Гепатит C',
  'Сифилис',
  'Гонорея',
  'Хламидиоз',
  'Импотенция',
  'Фригидность',
  'Нимфомания / гиперсексуальность',
  'Половое бессилие',
  'Вагинизм',
  'Простатит',
  'Климакс (тяжёлое течение)',
  'Отсутствие матки (гистерэктомия)',
  'Бесплодие',
  'Алкоголизм в ремиссии',
  'Наркозависимость в ремиссии',
  'Игромания',
  'Лунатизм',
  'Заикание',
  'Тик',
  'Сколиоз',
  'Плоскостопие',
  'Отсутствие зуба (переднего)',
  'Облысение',
  'Аллергия на слово «работа»',
  'Хроническое «я сейчас»',
  'Профессиональная лень в ремиссии',
  'Синдром «открыл холодильник и забыл зачем»',
  'Обострение при виде будильника',
  'Непереносимость понедельников',
  'Заикание при слове «дедлайн»',
  'Тик: проверяет телефон каждые 3 секунды',
  'Сколиоз от лежания с телефоном',
  'Плоскостопие от бега за автобусом',
  'Облысение от мыслей о будущем',
  'Лунатизм с ночной готовкой',
  'Игромания на настолки',
  'Зависимость от мемов',
  'Панические атаки при виде пустого холодильника',
  'Гиперсексуальность от скуки',
  'Фригидность к плохим шуткам',
  'Аллергия на презервативы с ароматом клубники',
  'Хроническая вера, что «ещё 5 минут»',
  'Синдром «я не толстый, я утеплённый»',
  'Хуёвое зрение (−10)',
  'Пиздец какая аллергия на пыль',
  'Синдром «хуй забудешь, что хотел»',
  'Хроническая заебистость',
  'Обострение при виде начальника',
  'Заикание при слове «ебать»',
  'Тик: матерится во сне',
  'Постоянная хуйня в боку',
  'Насморк, который заебал всех',
  'Геморрой от сидячей жизни (и от работы тоже)',
  'Больная спина от фразы «да похуй, подниму»',
  'Хронический пиздец с нервами',
  'Депрессия с матом (лечится хуже)',
  'Алкоголизм в стадии «а чё такого»',
  'Наркозависимость в стадии «я не зависим, ты не понимаешь»',
  'Импотенция с отговоркой «я просто устал»',
  'Фригидность с фразой «не сегодня, блядь»',
  'Нимфомания, ебущая мозг всем',
  'Вагинизм, нихуя не помогает',
  'Простатит, о котором он молчит как партизан'
];
const HOBBY = [
  'Рыбалка',
  'Охота',
  'Вязание',
  'Шахматы',
  'Чтение книг',
  'Садоводство',
  'Кулинария',
  'Резьба по дереву',
  'Гончарное дело',
  'Фотография',
  'Рисование',
  'Игра на гитаре',
  'Пение',
  'Танцы',
  'Бег по утрам',
  'Йога',
  'Кроссфит',
  'Скалолазание',
  'Плавание',
  'Велоспорт',
  'Туризм',
  'Оригами',
  'Коллекционирование марок',
  'Нумизматика',
  'Моделирование',
  'Радиолюбительство',
  'Астрономия',
  'Генеалогия',
  'Настольные игры',
  'Видеоигры',
  'Косплей',
  'Фехтование',
  'Стрельба из лука',
  'Пейнтбол',
  'Паркур',
  'Брейк-данс',
  'Граффити',
  'Блоггинг',
  'Просмотр сериалов',
  'Аниме',
  'БДСМ-практики',
  'Просмотр порно',
  'Секс в общественных местах',
  'Свингерство',
  'Эротические ролевые игры',
  'Коллекционирование эротических журналов',
  'Стриптиз дома',
  'Виртуальный секс',
  'Мастурбация (чрезмерная)',
  'Фетиш на ноги',
  'Коллекционирование чужих носков',
  'Разговоры с кактусами',
  'Сортировка мемов по папкам',
  'Объяснение коту, что он не начальник',
  'Просмотр сериалов на скорости 2x',
  'Сон с открытыми глазами',
  'Готовка по рецептам из TikTok',
  'Спортивная ходьба до холодильника',
  'Йога «лежу и думаю»',
  'Фотографирование еды, которую уже съели',
  'Составление списков дел, которые не делаются',
  'Пение в душе с полной самоотдачей',
  'Танцы, пока никто не видит',
  'Переговоры с пылесосом',
  'Настольные игры с читерством',
  'Ролевые игры «мы незнакомцы»',
  'Секс по расписанию',
  'Флирт с доставщиком еды',
  'Составление идеального плана побега из бункера, который не нужен',
  'Обучение попугая плохим словам',
  'Сраться в комментариях',
  'Ругаться с телевизором',
  'Коллекционирование фраз «да пошёл ты»',
  'Спор с навигатором на матах',
  'Переговоры с котом через «иди нахуй»',
  'Сортировка хуйни по полочкам',
  'Рисование хуйни на полях тетрадей',
  'Объяснение Вселенной после третьей бутылки',
  'Пьяные танцы с матами',
  'Игра на нервах соседей',
  'Пение матом в душе',
  'Мемы про то, как всё заебало',
  'Сон до обеда с фразой «отъебитесь»',
  'Прокрастинация с чувством вины и матом',
  'Секс с матами (громко)',
  'Ролевые игры «начальник и подчинённая»',
  'Дрочка на всё подряд',
  'Секс в общественном туалете «по-быстрому»',
  'БДСМ с криками «ещё, блядь!»',
  'Флирт с матами (работает, но не на всех)'
];
const BAG = [
  'Аптечка',
  'Нож',
  'Топор',
  'Верёвка 20 м',
  'Спички (10 коробков)',
  'Зажигалка',
  'Фонарик',
  'Батарейки (10 шт.)',
  'Рация',
  'Компас',
  'Карта местности',
  'Палатка',
  'Спальный мешок',
  'Котелок',
  'Сухпаёк на 3 дня',
  'Фильтр для воды',
  'Мультитул',
  'Набор отвёрток',
  'Молоток',
  'Пила',
  'Гвозди (1 кг)',
  'Изолента',
  'Проволока',
  'Леска',
  'Крючки для рыбалки',
  'Семена овощей',
  'Учебник по медицине',
  'Учебник по выживанию',
  'Шахматы',
  'Колода карт',
  'Гитара',
  'Блокнот и ручка',
  'Фотоаппарат',
  'Радиоприёмник',
  'Свечи (10 шт.)',
  'Тёплый свитер',
  'Дождевик',
  'Берцы',
  'Солнечная батарея (малая)',
  'Пауэрбанк',
  'Презервативы (упаковка)',
  'Вибратор',
  'Наручники (игровые)',
  'Смазка',
  'Эротическое бельё',
  'Порножурнал',
  'Фаллоимитатор',
  'Кляп',
  'Плеть',
  'Коллекция интимных игрушек',
  'Пакет с пакетами',
  'Третий носок без пары',
  'Просроченный йогурт «на всякий случай»',
  'Инструкция к мультиварке без мультиварки',
  'Зарядка от телефона, которого нет',
  'Коллекция мемов на флешке',
  'Подушка «против тревоги»',
  'Плед с дыркой для рук',
  'Список дел на 2019 год',
  'Пакет доширака (12 шт.)',
  'Пластырь с котиками',
  'Шапка-ушанка с фонариком',
  'Самодельный самогонный аппарат',
  'Набор для настолок',
  'Маленькая барабанная установка',
  'Набор наручников с мягкой обивкой',
  'Смазка со вкусом кокоса',
  'Костюм горничной',
  'Открытка «любимому человеку в бункере»',
  'Мешок с мешками для мешков',
  'Мешок с чужой хуйнёй',
  'Банка «на всякий пожарный, блядь»',
  'Инструкция «как не проебать всё»',
  'Пакет с пакетами (ебучий, но нужный)',
  'Носок, который «ща найдётся, вот хуй там»',
  'Йогурт, который уже заебал своим сроком',
  'Дневник с матами',
  'Самогон «от бати, нахуй»',
  'Топор «на всякий, вдруг кто-то долбоёб»',
  'Список людей, которых надо послать нахуй',
  'Флешка с порнухой из 2007',
  'Вибратор с разряженными батарейками',
  'Наручники без ключа (ну и хуй с ним)',
  'Плеть «для настроения»',
  'Смазка «на все случаи ебли»',
  'Костюм «начальницы» с чулками',
  'Порножурнал, склеенный скотчем',
  'Кляп, чтоб не материться (не помогает)',
  'Коллекция интимных игрушек «на всякий пожарный»',
  'Открытка «пошёл ты нахуй, но я тебя люблю»'
];
const FACT = [
  'Служил в армии',
  'Имеет двоих детей',
  'Был судим за кражу',
  'Умеет оказывать первую помощь',
  'Знает три языка',
  'Вырос в деревне',
  'Жил в другой стране',
  'Работал волонтёром',
  'Участвовал в спасательных операциях',
  'Имеет водительские права',
  'Умеет управлять лодкой',
  'Разбирается в электрике',
  'Знает, как очищать воду',
  'Имеет аллергию на антибиотики',
  'Боится темноты',
  'Страдает клаустрофобией',
  'Не умеет плавать',
  'Имеет панические атаки в толпе',
  'Был свидетелем убийства',
  'Скрывает психическое расстройство',
  'Имеет судимость за насилие',
  'Был зависим от наркотиков',
  'Имеет долги',
  'Врал в резюме',
  'Умеет шить',
  'Умеет готовить на костре',
  'Знает съедобные грибы',
  'Разбирается в травах',
  'Имеет военную подготовку',
  'Был донором крови',
  'Переболел тяжёлой болезнью',
  'Имеет редкую группу крови',
  'Знает, как делать самогон',
  'Умеет стрелять из лука',
  'Владеет навыками рукопашного боя',
  'Имеет фобию крови',
  'Не переносит замкнутые пространства',
  'Был участником секты',
  'Имеет внебрачного ребёнка',
  'Изменял(а) партнёру',
  'Участвовал(а) в оргии',
  'Снимался(ась) в порно',
  'Имеет ЗППП',
  'Занимался(ась) проституцией',
  'Был(а) замечен(а) в публичном сексе',
  'Имеет фетиш, о котором стыдно говорить',
  'Хранит интимные фото бывшего партнёра',
  'Состоит в тайном эротическом клубе',
  'Практикует полиаморию',
  'Имеет ребёнка от случайной связи',
  'Умеет спать стоя',
  'Однажды съел(а) просроченный йогурт и выжил(а)',
  'Знает 5 способов открыть банку без открывашки',
  'Может имитировать голос холодильника',
  'Коллекционирует чужие фразы',
  'Имеет диплом «магистр лени»',
  'Верит, что носки исчезают в параллельную вселенную',
  'Спорит с навигатором',
  'Однажды выиграл(а) спор с кактусом',
  'Умеет готовить яичницу 12 способами',
  'Боится клоунов, но работает аниматором',
  'Хранит билеты из кино 10-летней давности',
  'Считает, что пицца — это салат, если сверху лист',
  'Может заснуть на 10 минут и проснуться через 3 часа',
  'Имеет тайную копилку на «чёрный день доставки»',
  'Однажды отправил(а) интимное фото не тому человеку',
  'Практикует «секс по расписанию» и считает это спортом',
  'Влюбляется в голос из навигатора',
  'Однажды пытался(ась) выжить в лесу 2 часа и вызвал(а) такси',
  'Умеет убедительно объяснить, почему он(а) не виноват(а)',
  'Однажды послал(а) начальника нахуй — и выжил(а)',
  'Умеет материться на 7 языках',
  'Спорит с Богом и с холодильником',
  'Верит, что «хуйня рассосётся»',
  'Однажды проебал(а) все деньги за вечер',
  'Хранит обиды в отдельном списке',
  'Умеет готовить из хуйни конфетку',
  'Считает, что «заебало» — это диагноз',
  'Однажды уснул(а) на работе и сказал(а) «я думал(а)»',
  'Может за 5 минут довести любого до «да пошёл ты»',
  'Умеет объяснить любую хуйню научно',
  'Однажды соврал(а) так, что сам(а) поверил(а)',
  'Практикует «секс по пьяни» и называет это спортом',
  'Изменял(а) партнёру с фразой «а чё такого, блядь»',
  'Участвовал(а) в оргии и не помнит(а) подробностей',
  'Снимался(ась) в порно под псевдонимом «Хуй Знает Кто»',
  'Хранит интимные фото бывшего и иногда пересматривает',
  'Состоит в эротическом клубе «Ебём всё, что движется»',
  'Однажды занимался(ась) сексом в бункере (а бункера не было)',
  'Умеет послать так, что человек уходит счастливым'
];

const CATASTROPHES = [
  { title: 'Ядерная зима', text: 'Пепел закрыл небо. Температура на поверхности — минус 40. Урожаи невозможны минимум 10 лет.' },
  { title: 'Неизвестная инфекция', text: 'Вирус с летальностью 70% распространяется по воздуху. Снаружи небезопасно без защиты.' },
  { title: 'Падение астероида', text: 'Удар поднял пыль и цунами. Побережья уничтожены, связь потеряна.' },
  { title: 'Солнечная вспышка', text: 'Электроника и энергосети мира выгорели. Современные технологии недоступны.' },
  { title: 'Глобальное наводнение', text: 'Уровень океана вырос на 60 м. Суша осталась лишь на горных плато.' },
  { title: 'Экологический коллапс', text: 'Почва и вода отравлены. Чистой воды и пищи снаружи почти нет.' }
];

const genDossier = () => ({
  profession: weightedProfessionPick(),
  bio: `${pick(['Мужчина', 'Женщина'])}, ${randomInt(18, 71)} лет`,
  health: pick(HEALTH), hobby: pick(HOBBY), baggage: pick(BAG), fact: pick(FACT)
});

const genBunker = seats => ({
  'Вместимость': `${seats} мест`,
  'Еда': `на ${randomInt(3, 25)} мес.`,
  'Вода': pick(['скважина + фильтры', 'запас на 6 мес.', 'конденсат, малый дебит']),
  'Электричество': pick(['дизель-генератор', 'геотермальная станция', 'аккумуляторы, 4 мес.']),
  'Медицина': pick(['полный медблок', 'аптечки и фельдшерский пункт', 'отсутствует']),
  'Вентиляция': pick(['исправна', 'фильтры изношены', 'работает на 60%']),
  'Автономность': `${randomInt(6, 37)} мес.`,
  'Помещения': pick(['оранжерея', 'мастерская', 'библиотека', 'спортзал', 'лаборатория'])
});


// ===== ИГРОВОЙ ДВИЖОК =====
const rooms = new Map();
const KEYS = ['profession', 'bio', 'health', 'hobby', 'baggage', 'fact'];
const fail = m => { throw Object.assign(new Error(m), { user: true }); };
const clamp = (v, a, b, d) => (Number.isFinite(+v) ? Math.min(b, Math.max(a, Math.round(+v))) : d);
const list = room => [...room.players.values()];
const alive = room => list(room).filter(p => p.alive);

function cleanSettings(s = {}) {
  return {
    max: clamp(s.max, 4, 12, 8),
    pct: [30, 40, 50, 60].includes(+s.pct) ? +s.pct : 50,
    discuss: clamp(s.discuss, 30, 300, 120),
    vote: clamp(s.vote, 15, 120, 45),
    isPublic: !!s.isPublic
  };
}

const newPlayer = name => ({
  id: randomBytes(4).toString('hex'), sid: null,
  name: String(name || '').trim().slice(0, 20) || 'Игрок',
  connected: true, ready: false, alive: true, exiled: false, left: false,
  cards: null, revealed: new Set(), revealedRound: 0, vote: null, lastChat: 0
});

function newCode() { let c; do c = 'BK-' + randomInt(10000, 100000); while (rooms.has(c)); return c; }
function sys(room, text) { room.chat.push({ sys: true, text, t: Date.now() }); room.chat = room.chat.slice(-100); }
function need(room, pid) { return room.players.get(pid) || fail('Игрок не найден'); }
function host(room, pid) { if (pid !== room.hostId) fail('Только ведущий'); }

function createRoom(settings, hostPlayer, notify) {
  const room = {
    code: newCode(), hostId: hostPlayer.id, settings: cleanSettings(settings),
    players: new Map([[hostPlayer.id, hostPlayer]]), phase: 'LOBBY', round: 0, seats: 0,
    chat: [], endsAt: null, timer: null, tieSet: null, revote: false, lastResult: null,
    catastrophe: null, bunker: null, touched: Date.now(),
    notify: () => { room.touched = Date.now(); notify(room); }
  };
  hostPlayer.ready = true;
  rooms.set(room.code, room);
  return room;
}

function addPlayer(room, p) {
  if (room.phase !== 'LOBBY') fail('Матч уже идёт');
  if (room.players.size >= room.settings.max) fail('Комната заполнена');
  room.players.set(p.id, p);
  sys(room, `${p.name} подключился`);
  room.notify();
}

function setSettings(room, pid, s) {
  host(room, pid); if (room.phase !== 'LOBBY') fail('Настройки закрыты');
  const n = cleanSettings(s);
  if (n.max < room.players.size) n.max = room.players.size;
  room.settings = n; room.notify();
}

function setReady(room, pid, v) {
  const p = need(room, pid); if (room.phase !== 'LOBBY') return;
  p.ready = pid === room.hostId ? true : !!v; room.notify();
}

function kick(room, pid, target) {
  host(room, pid); if (room.phase !== 'LOBBY') fail('Только в лобби');
  if (target === pid) fail('Нельзя исключить себя');
  const t = need(room, target); room.players.delete(target);
  sys(room, `${t.name} исключён ведущим`); room.notify(); return t;
}

function transferHost(room, to) {
  const c = list(room).filter(p => !p.left);
  const n = (to && room.players.get(to)) || c.find(p => p.connected && p.id !== room.hostId) || c.find(p => p.id !== room.hostId);
  if (!n) return;
  room.hostId = n.id; n.ready = true; sys(room, `${n.name} теперь ведущий`);
}
function giveHost(room, pid, to) { host(room, pid); need(room, to); transferHost(room, to); room.notify(); }

function destroy(room) { clearTimeout(room.timer); rooms.delete(room.code); }

function removePlayer(room, pid) {
  const p = room.players.get(pid); if (!p) return;
  sys(room, `${p.name} покинул комнату`);
  if (room.phase === 'LOBBY' || room.phase === 'FINISHED') room.players.delete(pid);
  else Object.assign(p, { left: true, alive: false, exiled: true, connected: false });
  if (!list(room).some(x => !x.left)) return destroy(room);
  if (room.hostId === pid) transferHost(room);
  if (!['LOBBY', 'FINISHED', 'STARTING'].includes(room.phase) && alive(room).length <= room.seats) return finish(room);
  progress(room);
}

function setConnected(room, pid, v) {
  const p = room.players.get(pid); if (!p) return;
  p.connected = v;
  if (!v) progress(room); else room.notify();
}

function start(room, pid) {
  host(room, pid); if (room.phase !== 'LOBBY') fail('Матч уже начат');
  const ps = list(room);
  if (ps.length < 4) fail('Нужно минимум 4 игрока');
  if (ps.some(p => !p.ready)) fail('Не все игроки готовы');
  room.seats = Math.max(1, Math.min(ps.length - 1, Math.round(ps.length * room.settings.pct / 100)));
  room.catastrophe = pick(CATASTROPHES); room.bunker = genBunker(room.seats);
  for (const p of ps) Object.assign(p, { alive: true, exiled: false, left: false, cards: genDossier(), revealed: new Set(), revealedRound: 0, vote: null });
  room.round = 0; room.lastResult = null; room.tieSet = null; room.revote = false;
  setPhase(room, 'STARTING', 6);
}

function setPhase(room, phase, secs) {
  clearTimeout(room.timer);
  room.phase = phase;
  room.endsAt = secs ? Date.now() + secs * 1000 : null;
  if (secs) room.timer = setTimeout(() => tick(room), secs * 1000);
  room.notify();
}

// Срабатывает по таймеру (экспортирован для тестов).
function tick(room) {
  switch (room.phase) {
    case 'STARTING': return nextRound(room);
    case 'REVEAL':
      for (const p of alive(room)) if (p.revealedRound !== room.round) {
        const free = KEYS.filter(k => !p.revealed.has(k));
        if (free.length) doReveal(room, p, room.round === 1 ? 'profession' : pick(free));
      }
      return startDiscuss(room);
    case 'DISCUSS': return startVote(room);
    case 'VOTE': return resolveVote(room);
    case 'RESULT': return room.lastResult?.tie ? startDiscuss(room) : nextRound(room);
  }
}

function nextRound(room) {
  room.round++; room.tieSet = null; room.revote = false;
  for (const p of list(room)) p.vote = null;
  setPhase(room, 'REVEAL', 60);
}
const startDiscuss = room => setPhase(room, 'DISCUSS', room.revote ? 30 : room.settings.discuss);
function startVote(room) { for (const p of list(room)) p.vote = null; setPhase(room, 'VOTE', room.settings.vote); }
const candidates = room => room.tieSet || alive(room).map(p => p.id);

function doReveal(room, p, key) { p.revealed.add(key); p.revealedRound = room.round; }

function reveal(room, pid, key) {
  const p = need(room, pid);
  if (room.phase !== 'REVEAL') fail('Сейчас нельзя раскрывать карты');
  if (!p.alive) fail('Вы выбыли');
  if (p.revealedRound === room.round) fail('В этом раунде карта уже раскрыта');
  if (!KEYS.includes(key) || p.revealed.has(key)) fail('Недопустимая карта');
  if (room.round === 1 && key !== 'profession') fail('В первом раунде раскрывается профессия');
  doReveal(room, p, key); progress(room);
}

function vote(room, pid, target) {
  const p = need(room, pid);
  if (room.phase !== 'VOTE') fail('Сейчас не голосование');
  if (!p.alive) fail('Выбывшие не голосуют');
  if (p.vote) fail('Голос уже отдан');
  if (target === pid) fail('Нельзя голосовать за себя');
  if (!candidates(room).includes(target)) fail('Недопустимый кандидат');
  p.vote = target; progress(room);
}

function progress(room) {
  const a = alive(room);
  if (room.phase === 'REVEAL' && a.every(p => p.revealedRound === room.round || p.revealed.size >= KEYS.length)) return startDiscuss(room);
  if (room.phase === 'VOTE' && a.filter(p => p.connected).every(p => p.vote)) return resolveVote(room);
  room.notify();
}

function resolveVote(room) {
  const tally = {};
  for (const p of alive(room)) if (p.vote) tally[p.vote] = (tally[p.vote] || 0) + 1;
  const max = Math.max(0, ...Object.values(tally));
  let leaders = Object.keys(tally).filter(k => tally[k] === max);
  if (!leaders.length) leaders = candidates(room);
  const rows = candidates(room).map(id => ({ name: room.players.get(id).name, votes: tally[id] || 0 })).sort((a, b) => b.votes - a.votes);
  if (leaders.length > 1 && !room.revote) {
    room.revote = true; room.tieSet = leaders;
    room.lastResult = { round: room.round, tally: rows, tie: true };
    return setPhase(room, 'RESULT', 6);
  }
  const out = room.players.get(leaders.length === 1 ? leaders[0] : pick(leaders));
  Object.assign(out, { alive: false, exiled: true });
  room.lastResult = { round: room.round, tally: rows, tie: false, exiledName: out.name, random: leaders.length > 1 };
  sys(room, `${out.name} изгнан из бункера`);
  if (alive(room).length <= room.seats) return finish(room);
  setPhase(room, 'RESULT', 8);
}

function finish(room) { clearTimeout(room.timer); room.endsAt = null; room.phase = 'FINISHED'; room.notify(); }

function rematch(room, pid) {
  host(room, pid); if (room.phase !== 'FINISHED') fail('Матч ещё не завершён');
  for (const [id, p] of room.players) if (p.left) room.players.delete(id);
  for (const p of list(room)) Object.assign(p, { ready: p.id === room.hostId, alive: true, exiled: false, cards: null, revealed: new Set(), revealedRound: 0, vote: null });
  Object.assign(room, { phase: 'LOBBY', round: 0, lastResult: null, tieSet: null, revote: false, catastrophe: null, bunker: null });
  room.notify();
}

function chat(room, pid, text) {
  const p = need(room, pid), now = Date.now();
  if (now - p.lastChat < 800) fail('Слишком часто');
  text = String(text || '').trim().slice(0, 300); if (!text) return;
  p.lastChat = now;
  room.chat.push({ id: pid, name: p.name, text, t: now, out: !p.alive && room.phase !== 'LOBBY' });
  room.chat = room.chat.slice(-100); room.notify();
}

function sweep() { for (const r of rooms.values()) if (Date.now() - r.touched > 30 * 60e3) destroy(r); }

// Состояние, видимое конкретному игроку: чужие скрытые карты и чужие голоса не передаются.
function viewFor(room, pid) {
  const me = room.players.get(pid), done = room.phase === 'FINISHED';
  const open = p => (p.cards ? Object.fromEntries(Object.entries(p.cards).filter(([k]) => done || p.exiled || p.revealed.has(k))) : {});
  return {
    now: Date.now(), code: room.code, phase: room.phase, round: room.round, seats: room.seats,
    endsAt: room.endsAt, settings: room.settings, hostId: room.hostId,
    catastrophe: room.catastrophe, bunker: room.bunker, lastResult: room.lastResult,
    candidates: room.phase === 'VOTE' ? candidates(room) : [],
    me: {
      id: me.id, alive: me.alive, cards: me.cards, revealed: [...me.revealed], voted: !!me.vote,
      canReveal: room.phase === 'REVEAL' && me.alive && me.revealedRound !== room.round && me.revealed.size < KEYS.length
    },
    players: list(room).map(p => ({
      id: p.id, name: p.name, connected: p.connected, ready: p.ready, alive: p.alive, left: p.left,
      voted: room.phase === 'VOTE' && !!p.vote, revealed: open(p)
    })),
    chat: room.chat.slice(-60)
  };
}


// ===== HTTP + SOCKET.IO СЕРВЕР =====
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('ok');
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(HTML);
});
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || false } });
const sessions = new Map(); // token -> { code, pid }

const notify = room => { for (const p of room.players.values()) if (p.sid) io.to(p.sid).emit('state', viewFor(room, p.id)); };
const stats = () => ({ online: io.engine.clientsCount, rooms: rooms.size });

io.on('connection', socket => {
  const token = String(socket.handshake.auth?.token || '').slice(0, 64);
  if (token.length < 16) return socket.disconnect(true);
  const cur = () => {
    const s = sessions.get(token), room = s && rooms.get(s.code), p = room?.players.get(s.pid);
    return p ? { room, p } : null;
  };
  const need = () => cur() || fail('Вы не в комнате');
  const bind = (room, p) => { p.sid = socket.id; sessions.set(token, { code: room.code, pid: p.id }); };

  socket.emit('stats', stats());
  const c0 = cur();
  if (c0) { c0.p.sid = socket.id; setConnected(c0.room, c0.p.id, true); } // восстановление после обрыва/обновления
  else socket.emit('noroom');

  const on = (ev, fn) => socket.on(ev, async (data, cb) => {
    cb = typeof cb === 'function' ? cb : () => {};
    try { cb({ ok: true, ...(await fn(data || {})) }); }
    catch (e) { cb({ ok: false, error: e.user ? e.message : 'Ошибка сервера' }); if (!e.user) console.error(e); }
  });

  on('room:create', ({ name, settings }) => {
    if (cur()) fail('Вы уже в комнате');
    const p = newPlayer(name); p.sid = socket.id;
    const room = createRoom(settings, p, notify); bind(room, p); room.notify();
  });
  on('room:join', ({ name, code }) => {
    if (cur()) fail('Вы уже в комнате');
    const room = rooms.get(String(code || '').trim().toUpperCase()) || fail('Комната не найдена');
    const p = newPlayer(name); bind(room, p); addPlayer(room, p);
  });
  on('rooms:list', () => ({
    list: [...rooms.values()].filter(r => r.settings.isPublic && r.phase === 'LOBBY')
      .map(r => ({ code: r.code, host: r.players.get(r.hostId)?.name, count: r.players.size, max: r.settings.max }))
  }));
  on('room:ready', ({ value }) => { const { room, p } = need(); setReady(room, p.id, value); });
  on('room:settings', s => { const { room, p } = need(); setSettings(room, p.id, s); });
  on('room:start', () => { const { room, p } = need(); start(room, p.id); });
  on('room:rematch', () => { const { room, p } = need(); rematch(room, p.id); });
  on('room:transfer', ({ target }) => { const { room, p } = need(); giveHost(room, p.id, target); });
  on('room:kick', ({ target }) => {
    const { room, p } = need(); const t = kick(room, p.id, target);
    for (const [tk, s] of sessions) if (s.pid === t.id && s.code === room.code) sessions.delete(tk);
    if (t.sid) io.to(t.sid).emit('noroom');
  });
  on('room:leave', () => { const { room, p } = need(); sessions.delete(token); removePlayer(room, p.id); socket.emit('noroom'); });
  on('card:reveal', ({ key }) => { const { room, p } = need(); reveal(room, p.id, key); });
  on('vote:cast', ({ target }) => { const { room, p } = need(); vote(room, p.id, target); });
  on('chat:send', ({ text }) => { const { room, p } = need(); chat(room, p.id, text); });

  socket.on('disconnect', () => {
    const c = cur(); if (!c || c.p.sid !== socket.id) return;
    setConnected(c.room, c.p.id, false);
    if (c.room.hostId === c.p.id) setTimeout(() => { // автопередача ведущего
      if (rooms.has(c.room.code) && !c.p.connected && c.room.hostId === c.p.id) { transferHost(c.room); c.room.notify(); }
    }, 20000);
  });
});

setInterval(() => io.emit('stats', stats()), 5000);
setInterval(() => sweep(), 60000);
server.listen(PORT, () => console.log(`BUNKER server on :${PORT}`));
