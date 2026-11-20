// Запуск: npm test  (не требует socket.io)
import { readFileSync } from 'node:fs';
import { randomInt } from 'node:crypto';
import assert from 'node:assert/strict';
const src = readFileSync(new URL('./server.js', import.meta.url), 'utf8');
const prof = src.match(/const PROF = \[[\s\S]*?\n\];/)[0];
const blk = src.match(/\/\/ PROF-START([\s\S]*?)\/\/ PROF-END/)[1];
const api = new Function('randomInt', prof + blk + 'return {PROF,ADULT_PROFESSIONS,FUNNY_PROFESSIONS,NORMAL_PROFESSIONS,weightedProfessionPick};')(randomInt);
const { PROF, ADULT_PROFESSIONS: A, FUNNY_PROFESSIONS: F, NORMAL_PROFESSIONS: N, weightedProfessionPick: pick } = api;
// 1. Категории не пересекаются и покрывают весь PROF (ничего не удалено)
assert.equal(A.length + F.length + N.length, PROF.length);
assert.equal(new Set([...A, ...F, ...N]).size, PROF.length);
for (const a of A) assert.ok(!F.includes(a) && !N.includes(a));
// 2. Точная логика: из 100 возможных бросков ровно 75/15/10
const cat = x => (A.includes(x) ? 'A' : F.includes(x) ? 'F' : 'N');
const exact = { N: 0, F: 0, A: 0 };
for (let r = 0; r < 100; r++) exact[cat(pick(r))]++;
assert.deepEqual(exact, { N: 75, F: 15, A: 10 });
// 3. Статистика на 100 000 независимых генераций (допуск 4 сигма)
const n = 100000, got = { N: 0, F: 0, A: 0 };
for (let i = 0; i < n; i++) got[cat(pick())]++;
for (const [k, p] of [['N', .75], ['F', .15], ['A', .10]]) {
  const tol = 4 * Math.sqrt(p * (1 - p) / n);
  assert.ok(Math.abs(got[k] / n - p) < tol, `${k}: ${got[k] / n} vs ${p}`);
}
console.log('OK', { sizes: { normal: N.length, funny: F.length, adult: A.length }, exact, sample: Object.fromEntries(Object.entries(got).map(([k, v]) => [k, (v / n * 100).toFixed(2) + '%'])) });
