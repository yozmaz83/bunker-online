// Запуск: npm test  (не требует socket.io)
// Проверяет библиотеку ролей и раздачу: количества, пустые строки, дубли, уникальность, seed.
import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import assert from 'node:assert/strict';
const src = readFileSync(new URL('./server.js', import.meta.url), 'utf8');
const lib = src.slice(src.indexOf('const PROF = ['), src.indexOf('const genBunker'));
const api = new Function('randomInt', 'process',
  "const KEYS = ['profession','bio','health','hobby','baggage','fact'];" + lib +
  'return {PROF,BIO,HEALTH,HOBBY,BAG,FACT,CATASTROPHES,drawCatastrophe,shuffle,makeRng,makeDeck,dealDossiers,KEYS};')(randomInt, { env: {} });
const { PROF, BIO, HEALTH, HOBBY, BAG, FACT, CATASTROPHES: CAT, drawCatastrophe, shuffle, makeDeck, dealDossiers, KEYS } = api;

// 1. Количества, пустые строки, дубликаты
const expected = { profession: [PROF, 70], bio: [BIO, 90], health: [HEALTH, 70], hobby: [HOBBY, 70], baggage: [BAG, 100], fact: [FACT, 70] };
let total = 0;
for (const [k, [a, n]] of Object.entries(expected)) {
  assert.equal(a.length, n, `${k}: ${a.length} != ${n}`);
  assert.ok(a.every(x => typeof x === 'string' && x.trim() === x && x.length > 0), `${k}: пустая/нетримленная строка`);
  assert.equal(new Set(a).size, a.length, `${k}: есть дубликаты`);
  total += a.length;
}
assert.equal(total, 470);

// 2. Фишер–Йетс: перестановка, исходник не тронут, seed воспроизводим, без seed — разный порядок
const src0 = PROF.slice();
const s1 = shuffle(PROF);
assert.deepEqual(PROF, src0);
assert.deepEqual([...s1].sort(), [...PROF].sort());
assert.notDeepEqual(s1, shuffle(PROF));
assert.deepEqual(shuffle(PROF, api.makeRng('abc')), shuffle(PROF, api.makeRng('abc')));
assert.notDeepEqual(shuffle(PROF, api.makeRng('abc')), shuffle(PROF, api.makeRng('abd')));

// 3. Раздача: до размера категории все карты у игроков уникальны (12 игроков, много игр подряд)
for (let g = 0; g < 2000; g++) {
  const d = dealDossiers(12);
  for (const k of KEYS) assert.equal(new Set(d.map(x => x[k])).size, 12, `повтор в ${k}`);
}
assert.deepEqual(dealDossiers(8, 'seed1'), dealDossiers(8, 'seed1'));
assert.notDeepEqual(dealDossiers(8), dealDossiers(8));

// 4. Игроков больше карт — повтор разрешён, но с предупреждением
let warns = 0; const w = console.warn; console.warn = () => warns++;
const deck = makeDeck(); for (let i = 0; i < 71; i++) deck.draw('profession');
console.warn = w; assert.equal(warns, 1);

// 5. Равные шансы: каждая карта профессии встречается с частотой ≈ 1/70
const cnt = new Map(); const N = 70000;
for (let i = 0; i < N; i++) { const c = dealDossiers(1)[0].profession; cnt.set(c, (cnt.get(c) || 0) + 1); }
const p = 1 / 70, tol = 5 * Math.sqrt(p * (1 - p) / N);
for (const a of PROF) assert.ok(Math.abs((cnt.get(a) || 0) / N - p) < tol, `перекос: ${a}`);

// 6. Катастрофы: ровно 30, без пустых и дублей, равные шансы, seed
assert.equal(CAT.length, 30);
assert.ok(CAT.every(c => c.title.trim() && c.text.trim()));
assert.equal(new Set(CAT.map(c => c.title)).size, 30);
assert.equal(new Set(CAT.map(c => c.text)).size, 30);
assert.deepEqual(drawCatastrophe('s1'), drawCatastrophe('s1'));
const cc = new Map(); const M = 60000;
for (let i = 0; i < M; i++) { const t = drawCatastrophe().title; cc.set(t, (cc.get(t) || 0) + 1); }
const pc = 1 / 30, tc = 5 * Math.sqrt(pc * (1 - pc) / M);
for (const c of CAT) assert.ok(Math.abs((cc.get(c.title) || 0) / M - pc) < tc, `перекос: ${c.title}`);
console.log('catastrophes', CAT.length);

console.log('OK', Object.fromEntries(Object.entries(expected).map(([k, [a]]) => [k, a.length])), 'total', total);
