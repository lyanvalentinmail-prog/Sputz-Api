/**
 * Motor de juegos: sesiones en memoria con TTL y lógica real de cada juego.
 */
import { randomBytes, randomInt } from "node:crypto";
import { badRequest, notFound } from "../lib/errors";
import { HANGMAN_WORDS, MEMORY_SYMBOLS, RIDDLES, TRIVIA, WORDLE_ALLOWED, WORDLE_SOLUTIONS } from "./data";

interface Session {
  game: string;
  expires: number;
  state: Record<string, unknown>;
}

const sessions = new Map<string, Session>();
const TTL = 30 * 60 * 1000; // 30 minutos

setInterval(() => {
  const now = Date.now();
  for (const [id, s] of sessions) if (s.expires < now) sessions.delete(id);
}, 5 * 60 * 1000).unref();

function newId(game: string): string {
  return `${game}_${randomBytes(4).toString("hex")}`;
}

function getSession(game: string, id?: string): Session {
  if (id) {
    const s = sessions.get(id);
    if (!s || s.game !== game) throw notFound(`La partida «${id}» no existe o ha caducado. Crea una nueva omitiendo el parámetro session.`);
    s.expires = Date.now() + TTL;
    return s;
  }
  const s: Session = { game, expires: Date.now() + TTL, state: {} };
  const nid = newId(game);
  sessions.set(nid, s);
  (s as Session & { id?: string }).id = nid;
  return s;
}

function sessionIdOf(game: string, s: Session): string {
  for (const [id, ses] of sessions) if (ses === s) return id;
  return newId(game);
}

function pick<T>(arr: readonly T[]): T {
  return arr[randomInt(arr.length)];
}

// ─── Tres en raya ─────────────────────────────────────────────────
type Cell = "X" | "O" | null;
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

function winnerOf(board: Cell[]): Cell {
  for (const [a, b, c] of LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
}

function minimax(board: Cell[], player: "X" | "O", ai: "O"): { score: number; move: number } {
  const w = winnerOf(board);
  if (w === ai) return { score: 1, move: -1 };
  if (w) return { score: -1, move: -1 };
  const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
  if (!empty.length) return { score: 0, move: -1 };
  let best: { score: number; move: number } = player === ai ? { score: -2, move: empty[0] } : { score: 2, move: empty[0] };
  for (const m of empty) {
    board[m] = player;
    const r = minimax(board, player === "X" ? "O" : "X", ai);
    board[m] = null;
    if (player === ai ? r.score > best.score : r.score < best.score) best = { score: r.score, move: m };
  }
  return best;
}

export function tictactoe(params: { session?: string; cell?: number; difficulty?: "easy" | "hard" }) {
  const s = getSession("ttt", params.session) as Session & { state: { board?: Cell[]; difficulty?: string } };
  if (!s.state.board) {
    s.state.board = Array(9).fill(null) as Cell[];
    s.state.difficulty = params.difficulty || "hard";
    return { session: sessionIdOf("ttt", s), board: s.state.board, turn: "X", winner: null, finished: false, message: "Partida nueva. Tú eres X: envía «cell» (0-8) para jugar." };
  }
  const board = s.state.board as Cell[];
  const difficulty = (s.state.difficulty as "easy" | "hard") || params.difficulty || "hard";
  if (winnerOf(board) || board.every((c) => c !== null)) {
    return finishTtt(board, s);
  }
  if (params.cell === undefined) throw badRequest("Indica la casilla a jugar en «cell» (0-8), o crea una partida nueva omitiendo «session».");
  const cell = params.cell;
  if (!Number.isInteger(cell) || cell < 0 || cell > 8) throw badRequest("«cell» debe ser un número entero entre 0 y 8");
  if (board[cell] !== null) throw badRequest(`La casilla ${cell} ya está ocupada`);
  board[cell] = "X";
  let winner = winnerOf(board);
  if (!winner && !board.every((c) => c !== null)) {
    // Turno de la IA (O)
    const empty = board.map((c, i) => (c === null ? i : -1)).filter((i) => i >= 0);
    let aiMove: number;
    if (difficulty === "easy" && Math.random() < 0.7) {
      aiMove = pick(empty);
    } else {
      aiMove = minimax([...board], "O", "O").move;
      if (aiMove < 0) aiMove = pick(empty);
    }
    board[aiMove] = "O";
    winner = winnerOf(board);
  }
  const finished = Boolean(winner) || board.every((c) => c !== null);
  return finishTtt(board, s, finished);
}

function finishTtt(board: Cell[], s: Session, finished = true) {
  const winner = winnerOf(board);
  const full = board.every((c) => c !== null);
  return {
    session: sessionIdOf("ttt", s),
    board,
    turn: winner || full ? null : "X",
    winner: winner === "X" ? "jugador" : winner === "O" ? "ia" : full ? "empate" : null,
    finished: finished && (Boolean(winner) || full),
    message: winner === "X" ? "¡Has ganado!" : winner === "O" ? "Gana la IA" : full ? "Empate" : "Tu turno: envía «cell»."
  };
}

// ─── Piedra, papel o tijera ───────────────────────────────────────
const PTT_MOVES = ["piedra", "papel", "tijera"] as const;
export function ptt(params: { session?: string; move: string }) {
  const s = getSession("ptt", params.session) as Session & { state: { you?: number; ai?: number; draws?: number; rounds?: number } };
  if (!PTT_MOVES.includes(params.move as (typeof PTT_MOVES)[number])) throw badRequest("«move» debe ser piedra, papel o tijera");
  s.state.you ??= 0; s.state.ai ??= 0; s.state.draws ??= 0; s.state.rounds ??= 0;
  const aiMove = pick(PTT_MOVES);
  const you = params.move as (typeof PTT_MOVES)[number];
  let round: "ganaste" | "perdiste" | "empate";
  if (you === aiMove) { round = "empate"; s.state.draws++; }
  else if ((you === "piedra" && aiMove === "tijera") || (you === "papel" && aiMove === "piedra") || (you === "tijera" && aiMove === "papel")) { round = "ganaste"; s.state.you++; }
  else { round = "perdiste"; s.state.ai++; }
  s.state.rounds++;
  return { session: sessionIdOf("ptt", s), you, ai: aiMove, round, score: { you: s.state.you, ai: s.state.ai, draws: s.state.draws, rounds: s.state.rounds } };
}

// ─── Adivina el número ────────────────────────────────────────────
export function guessNumber(params: { session?: string; guess?: number; min?: number; max?: number }) {
  const s = getSession("gn", params.session) as Session & { state: { secret?: number; attempts?: number; min?: number; max?: number; finished?: boolean } };
  if (!s.state.secret) {
    const min = params.min ?? 1;
    const max = params.max ?? 100;
    if (min >= max) throw badRequest("«min» debe ser menor que «max»");
    s.state.min = min; s.state.max = max;
    s.state.secret = randomInt(min, max + 1);
    s.state.attempts = 0;
    return { session: sessionIdOf("gn", s), result: "nueva", range: { min, max }, attempts: 0, finished: false, message: `He pensado un número entre ${min} y ${max}. Envía «guess» para adivinarlo.` };
  }
  if (s.state.finished) return { session: sessionIdOf("gn", s), result: "acertado", attempts: s.state.attempts, range: { min: s.state.min, max: s.state.max }, finished: true, message: `Ya acertaste en ${s.state.attempts} intentos. Crea una partida nueva.` };
  if (params.guess === undefined) throw badRequest("Envía «guess» con el número que intentas adivinar");
  s.state.attempts = (s.state.attempts ?? 0) + 1;
  let result: "menor" | "mayor" | "acertado";
  if (params.guess === s.state.secret) { result = "acertado"; s.state.finished = true; }
  else if (params.guess > s.state.secret!) result = "menor";
  else result = "mayor";
  return {
    session: sessionIdOf("gn", s), result, attempts: s.state.attempts,
    range: { min: s.state.min, max: s.state.max }, finished: Boolean(s.state.finished),
    message: result === "acertado" ? `¡Correcto! Era ${s.state.secret}. Lo lograste en ${s.state.attempts} intentos.` : result === "menor" ? "El número secreto es menor." : "El número secreto es mayor."
  };
}

// ─── Ahorcado ─────────────────────────────────────────────────────
export function hangman(params: { session?: string; letter?: string }) {
  const s = getSession("hm", params.session) as Session & { state: { word?: string; guessed?: string[]; wrong?: string[]; attemptsLeft?: number } };
  if (!s.state.word) {
    s.state.word = pick(HANGMAN_WORDS).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    s.state.guessed = [];
    s.state.wrong = [];
    s.state.attemptsLeft = 6;
    return {
      session: sessionIdOf("hm", s), word: maskWord(s.state.word, []), attemptsLeft: 6, wrongLetters: [], hit: null, finished: false,
      message: "Partida nueva. Envía «letter» con una letra (a-z)."
    };
  }
  const word = s.state.word;
  const guessed = s.state.guessed!;
  const wrong = s.state.wrong!;
  if (!params.letter) throw badRequest("Envía «letter» con una letra de la a a la z");
  const letter = params.letter.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (!/^[a-z]$/.test(letter)) throw badRequest("«letter» debe ser una única letra de la a a la z");
  if (guessed.includes(letter) || wrong.includes(letter)) throw badRequest(`La letra «${letter}» ya se intentó`);
  let hit = false;
  if (word.includes(letter)) { guessed.push(letter); hit = true; }
  else { wrong.push(letter); s.state.attemptsLeft = (s.state.attemptsLeft ?? 6) - 1; }
  const won = [...word].every((ch) => ch === " " || guessed.includes(ch));
  const lost = (s.state.attemptsLeft ?? 0) <= 0;
  return {
    session: sessionIdOf("hm", s),
    word: won ? word : maskWord(word, guessed),
    attemptsLeft: s.state.attemptsLeft,
    wrongLetters: wrong,
    hit,
    finished: won || lost,
    message: won ? `¡Ganaste! La palabra era «${word}».` : lost ? `Perdiste. La palabra era «${word}».` : hit ? `¡Bien! La letra «${letter}» está en la palabra.` : `La letra «${letter}» no está. Te quedan ${s.state.attemptsLeft} intentos.`
  };
}

function maskWord(word: string, guessed: string[]): string {
  return [...word].map((ch) => (ch === " " ? " " : guessed.includes(ch) ? ch.toUpperCase() : "_")).join(" ");
}

// ─── Wordle ───────────────────────────────────────────────────────
export function wordle(params: { session?: string; word?: string }) {
  const s = getSession("wd", params.session) as Session & { state: { secret?: string; attempts?: number; history?: unknown[]; finished?: boolean } };
  if (!s.state.secret) {
    s.state.secret = pick(WORDLE_SOLUTIONS);
    s.state.attempts = 0;
    s.state.history = [];
    return { session: sessionIdOf("wd", s), attempt: 0, attemptsLeft: 6, finished: false, message: "Partida nueva: adivina una palabra de 5 letras en 6 intentos. Envía «word»." };
  }
  if (s.state.finished) throw badRequest("La partida ya terminó. Crea una nueva omitiendo «session».");
  if (!params.word) throw badRequest("Envía «word» con una palabra de 5 letras");
  const guess = params.word.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (guess.length !== 5) throw badRequest("La palabra debe tener exactamente 5 letras");
  if (!WORDLE_ALLOWED.has(guess)) throw badRequest(`«${guess}» no está en el diccionario admitido`);
  const secret = s.state.secret;
  const feedback = evaluateGuess(guess, secret);
  s.state.attempts = (s.state.attempts ?? 0) + 1;
  s.state.history!.push({ word: guess, feedback });
  const won = guess === secret;
  const lost = !won && s.state.attempts >= 6;
  if (won || lost) s.state.finished = true;
  return {
    session: sessionIdOf("wd", s),
    attempt: s.state.attempts,
    attemptsLeft: 6 - s.state.attempts,
    finished: won || lost,
    feedback,
    solution: won || lost ? secret : null,
    message: won ? `¡Correcto! «${secret}» en ${s.state.attempts} intentos.` : lost ? `Perdiste. La palabra era «${secret}».` : "Sigue intentando."
  };
}

function evaluateGuess(guess: string, secret: string) {
  const result: Array<{ letter: string; state: "correct" | "misplaced" | "absent" }> = guess.split("").map((l) => ({ letter: l, state: "absent" }));
  const counts: Record<string, number> = {};
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) { result[i].state = "correct"; continue; }
    counts[secret[i]] = (counts[secret[i]] ?? 0) + 1;
  }
  for (let i = 0; i < guess.length; i++) {
    if (result[i].state === "correct") continue;
    if ((counts[guess[i]] ?? 0) > 0) { result[i].state = "misplaced"; counts[guess[i]]--; }
  }
  return result;
}

// ─── Math quiz ────────────────────────────────────────────────────
export function mathQuiz(params: { session?: string; answer?: number; timeLimit?: number }) {
  const s = getSession("mq", params.session) as Session & { state: { expression?: string; solution?: number; expiresAt?: number; score?: number; streak?: number; timeLimit?: number } };
  const timeLimit = params.timeLimit ?? (s.state.timeLimit as number) ?? 30;
  if (!s.state.expression) {
    const q = generateMathQuestion();
    s.state.expression = q.expression; s.state.solution = q.solution;
    s.state.expiresAt = Date.now() + timeLimit * 1000;
    s.state.score = 0; s.state.streak = 0; s.state.timeLimit = timeLimit;
    return { session: sessionIdOf("mq", s), current: { expression: q.expression, expiresAt: new Date(s.state.expiresAt).toISOString() }, score: 0, streak: 0, correct: null, message: `Resuelve «${q.expression}» en ${timeLimit}s enviando «answer».` };
  }
  if (params.answer === undefined) throw badRequest("Envía «answer» con el resultado de la operación actual");
  const expired = Date.now() > (s.state.expiresAt ?? 0);
  const correct = !expired && params.answer === s.state.solution;
  if (correct) { s.state.score = (s.state.score ?? 0) + 1; s.state.streak = (s.state.streak ?? 0) + 1; }
  else s.state.streak = 0;
  const q = generateMathQuestion();
  s.state.expression = q.expression; s.state.solution = q.solution;
  s.state.expiresAt = Date.now() + timeLimit * 1000;
  return {
    session: sessionIdOf("mq", s),
    previous: { expression: expired ? "(tiempo agotado)" : undefined, correct },
    current: { expression: q.expression, expiresAt: new Date(s.state.expiresAt).toISOString() },
    score: s.state.score, streak: s.state.streak, correct,
    message: expired ? "Se acabó el tiempo. Aquí tienes otra operación." : correct ? "¡Correcto! Siguiente operación." : `Incorrecto. Siguiente operación.`
  };
}

function generateMathQuestion(): { expression: string; solution: number } {
  const kind = randomInt(0, 4);
  if (kind === 0) { const a = randomInt(10, 99), b = randomInt(10, 99); return { expression: `${a} + ${b}`, solution: a + b }; }
  if (kind === 1) { const a = randomInt(20, 99), b = randomInt(1, 19); return { expression: `${a} - ${b}`, solution: a - b }; }
  if (kind === 2) { const a = randomInt(2, 12), b = randomInt(2, 12); return { expression: `${a} * ${b}`, solution: a * b }; }
  const b = randomInt(2, 12), r = randomInt(2, 12); const a = b * r;
  return { expression: `${a} / ${b}`, solution: r };
}

// ─── Memoria ──────────────────────────────────────────────────────
export function memoryGame(params: { session?: string; card?: number }) {
  const s = getSession("mm", params.session) as Session & { state: { deck?: string[]; matched?: number[]; first?: number | null; moves?: number } };
  if (!s.state.deck) {
    const pairs = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS];
    for (let i = pairs.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
    }
    s.state.deck = pairs;
    s.state.matched = [];
    s.state.first = null;
    s.state.moves = 0;
    return { session: sessionIdOf("mm", s), board: Array(16).fill("❓"), matched: 0, moves: 0, finished: false, message: "Tablero 4×4 con 8 parejas. Envía «card» (0-15) para voltear cartas." };
  }
  const deck = s.state.deck!;
  const matched = s.state.matched!;
  if (matched.length === 16) return finishMemory(s);
  if (params.card === undefined) throw badRequest("Envía «card» con el índice de la carta a voltear (0-15)");
  const card = params.card;
  if (!Number.isInteger(card) || card < 0 || card > 15) throw badRequest("«card» debe ser un número entero entre 0 y 15");
  if (matched.includes(card)) throw badRequest(`La carta ${card} ya está emparejada`);
  if (s.state.first === null || s.state.first === undefined) {
    s.state.first = card;
    const board = renderMemory(deck, matched, [card]);
    return { session: sessionIdOf("mm", s), board, revealed: card, matched: matched.length, moves: s.state.moves, finished: false, message: `Has volteado ${deck[card]}. Voltea otra carta.` };
  }
  const first = s.state.first;
  s.state.first = null;
  s.state.moves = (s.state.moves ?? 0) + 1;
  let pairFound = false;
  if (deck[first] === deck[card] && first !== card) {
    matched.push(first, card);
    pairFound = true;
  }
  const finished = matched.length === 16;
  if (finished) return finishMemory(s);
  const board = renderMemory(deck, matched, pairFound ? [] : [first, card]);
  return {
    session: sessionIdOf("mm", s), board, revealed: [first, card], matched: matched.length, moves: s.state.moves, finished: false,
    message: pairFound ? `¡Pareja de ${deck[card]}! Quedan ${(16 - matched.length) / 2} parejas.` : `No coinciden (${deck[first]} y ${deck[card]}). Sigue intentando.`
  };
}

function renderMemory(deck: string[], matched: number[], revealed: number[]): string[] {
  return deck.map((sym, i) => (matched.includes(i) || revealed.includes(i) ? sym : "❓"));
}

function finishMemory(s: Session) {
  const state = s.state as { deck: string[]; matched: number[]; moves: number };
  return { session: sessionIdOf("mm", s), board: state.deck, matched: 16, moves: state.moves, finished: true, message: `¡Completado en ${state.moves} movimientos!` };
}

// ─── Snake ────────────────────────────────────────────────────────
const GRID = 12;
export function snake(params: { session?: string; direction?: "up" | "down" | "left" | "right" }) {
  const s = getSession("sn", params.session) as Session & { state: { snake?: Array<{ x: number; y: number }>; dir?: string; food?: { x: number; y: number }; score?: number; alive?: boolean } };
  if (!s.state.snake) {
    s.state.snake = [{ x: 5, y: 6 }, { x: 4, y: 6 }, { x: 3, y: 6 }];
    s.state.dir = "right";
    s.state.food = randomFood(s.state.snake);
    s.state.score = 0;
    s.state.alive = true;
    return { session: sessionIdOf("sn", s), grid: GRID, snake: s.state.snake, food: s.state.food, score: 0, alive: true, message: "Cada solicitud avanza un paso. Envía «direction» para girar." };
  }
  if (!s.state.alive) return { session: sessionIdOf("sn", s), grid: GRID, snake: s.state.snake, food: s.state.food, score: s.state.score, alive: false, message: "La serpiente ha muerto. Crea una partida nueva omitiendo «session»." };
  const opposites: Record<string, string> = { up: "down", down: "up", left: "right", right: "left" };
  if (params.direction) {
    if (!(params.direction in opposites)) throw badRequest("«direction» debe ser up, down, left o right");
    if (opposites[params.direction] !== s.state.dir) s.state.dir = params.direction;
  }
  const head = s.state.snake[0];
  const delta: Record<string, { x: number; y: number }> = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };
  const d = delta[s.state.dir!];
  const next = { x: head.x + d.x, y: head.y + d.y };
  const hitsWall = next.x < 0 || next.y < 0 || next.x >= GRID || next.y >= GRID;
  const hitsSelf = s.state.snake.slice(0, -1).some((p) => p.x === next.x && p.y === next.y);
  if (hitsWall || hitsSelf) {
    s.state.alive = false;
    return { session: sessionIdOf("sn", s), grid: GRID, snake: s.state.snake, food: s.state.food, score: s.state.score, alive: false, message: hitsWall ? "¡Chocaste contra la pared!" : "¡Te has mordido a ti misma!" };
  }
  s.state.snake.unshift(next);
  if (next.x === s.state.food!.x && next.y === s.state.food!.y) {
    s.state.score = (s.state.score ?? 0) + 1;
    s.state.food = randomFood(s.state.snake);
  } else {
    s.state.snake.pop();
  }
  return { session: sessionIdOf("sn", s), grid: GRID, snake: s.state.snake, food: s.state.food, score: s.state.score, alive: true, message: s.state.score ? `¡Comida! Puntos: ${s.state.score}` : undefined };
}

function randomFood(snakeArr: Array<{ x: number; y: number }>) {
  let p: { x: number; y: number };
  do {
    p = { x: randomInt(GRID), y: randomInt(GRID) };
  } while (snakeArr.some((seg) => seg.x === p.x && seg.y === p.y));
  return p;
}

// ─── 2048 ─────────────────────────────────────────────────────────
type Board = number[][];

function emptyBoard(): Board {
  return Array.from({ length: 4 }, () => [0, 0, 0, 0]);
}

function addRandomTile(board: Board) {
  const empty: Array<[number, number]> = [];
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (board[r][c] === 0) empty.push([r, c]);
  if (!empty.length) return;
  const [r, c] = pick(empty);
  board[r][c] = Math.random() < 0.9 ? 2 : 4;
}

function slideRow(row: number[]): { row: number[]; gained: number } {
  const nums = row.filter((n) => n !== 0);
  const out: number[] = [];
  let gained = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i + 1 < nums.length && nums[i] === nums[i + 1]) {
      out.push(nums[i] * 2);
      gained += nums[i] * 2;
      i++;
    } else out.push(nums[i]);
  }
  while (out.length < 4) out.push(0);
  return { row: out, gained };
}

function transpose(board: Board): Board {
  return board[0].map((_, c) => board.map((row) => row[c]));
}

function reverseRows(board: Board): Board {
  return board.map((row) => [...row].reverse());
}

function move(board: Board, dir: "left" | "right" | "up" | "down"): { board: Board; gained: number; moved: boolean } {
  let work = board.map((r) => [...r]);
  if (dir === "up" || dir === "down") work = transpose(work);
  if (dir === "right" || dir === "down") work = reverseRows(work);
  let gained = 0;
  work = work.map((row) => { const r = slideRow(row); gained += r.gained; return r.row; });
  if (dir === "right" || dir === "down") work = reverseRows(work);
  if (dir === "up" || dir === "down") work = transpose(work);
  const moved = JSON.stringify(work) !== JSON.stringify(board);
  return { board: work, gained, moved };
}

function canMove(board: Board): boolean {
  for (const dir of ["left", "right", "up", "down"] as const) {
    if (move(board, dir).moved) return true;
  }
  return false;
}

export function game2048(params: { session?: string; move?: "up" | "down" | "left" | "right" }) {
  const s = getSession("g2048", params.session) as Session & { state: { board?: Board; score?: number; finished?: boolean; won?: boolean } };
  if (!s.state.board) {
    const board = emptyBoard();
    addRandomTile(board);
    addRandomTile(board);
    s.state.board = board;
    s.state.score = 0;
    s.state.finished = false;
    s.state.won = false;
    return { session: sessionIdOf("g2048", s), board, score: 0, finished: false, won: false, message: "Partida nueva. Envía «move» (up/down/left/right)." };
  }
  if (s.state.finished) return { session: sessionIdOf("g2048", s), board: s.state.board, score: s.state.score, finished: true, won: s.state.won, message: "Partida terminada. Crea una nueva omitiendo «session»." };
  if (!params.move) throw badRequest("Envía «move» con up, down, left o right");
  if (!["up", "down", "left", "right"].includes(params.move)) throw badRequest("«move» debe ser up, down, left o right");
  const result = move(s.state.board!, params.move);
  if (!result.moved) throw badRequest(`El movimiento «${params.move}» no cambia el tablero. Prueba otra dirección.`);
  addRandomTile(result.board);
  s.state.board = result.board;
  s.state.score = (s.state.score ?? 0) + result.gained;
  if (!s.state.won && result.board.some((row) => row.some((n) => n >= 2048))) s.state.won = true;
  s.state.finished = !canMove(result.board);
  return {
    session: sessionIdOf("g2048", s), board: s.state.board, score: s.state.score, finished: s.state.finished, won: s.state.won,
    message: s.state.finished ? "Sin movimientos posibles: fin de la partida." : s.state.won ? "¡Has llegado a 2048! Puedes seguir jugando." : undefined
  };
}

// ─── Sin estado: dados, moneda, tragamonedas, trivia, acertijos ───
export function dice(count: number, sides: number) {
  const rolls = Array.from({ length: count }, () => randomInt(1, sides + 1));
  return { rolls, total: rolls.reduce((a, b) => a + b, 0), dice: count, sides };
}

export function coinflip(count: number) {
  const flips = Array.from({ length: count }, () => (Math.random() < 0.5 ? "cara" : "cruz"));
  return { flips, caras: flips.filter((f) => f === "cara").length, cruces: flips.filter((f) => f === "cruz").length };
}

const SLOT_SYMBOLS = ["🍒", "🍋", "🔔", "⭐", "7️⃣", "🍀"];
export function slot(bet: number) {
  const reels = Array.from({ length: 3 }, () => pick(SLOT_SYMBOLS));
  const [a, b2, c] = reels;
  let result: "jackpot" | "pareja" | "nada";
  let multiplier = 0;
  if (a === b2 && b2 === c) { result = "jackpot"; multiplier = a === "7️⃣" ? 50 : 10; }
  else if (a === b2 || b2 === c || a === c) { result = "pareja"; multiplier = 2; }
  else result = "nada";
  const won = bet * multiplier;
  return { reels, result, bet, won, credits: won - bet, message: result === "jackpot" ? "¡Jackpot!" : result === "pareja" ? "¡Pareja encontrada!" : "Sin premio esta vez." };
}

export function triviaQuestions(amount: number, opts: { category?: string; difficulty?: string } = {}) {
  let pool = TRIVIA;
  if (opts.category) pool = pool.filter((q) => q.category === opts.category);
  if (opts.difficulty) pool = pool.filter((q) => q.difficulty === opts.difficulty);
  if (!pool.length) throw badRequest("No hay preguntas para esa combinación de categoría y dificultad");
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(amount, shuffled.length)).map((q) => ({
    category: q.category, difficulty: q.difficulty, question: q.question, options: q.options, answer: q.answer
  }));
}

export function riddles(amount: number, reveal: boolean) {
  const shuffled = [...RIDDLES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(amount, shuffled.length)).map((r) => ({ riddle: r.riddle, answer: reveal ? r.answer : null }));
}
