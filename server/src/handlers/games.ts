import type { Handler } from "./types";
import * as engine from "../games/engine";
import { ok } from "../lib/respond";
import { badRequest } from "../lib/errors";

function str(params: Record<string, unknown>, key: string): string | undefined {
  const v = params[key];
  return v === undefined || v === "" ? undefined : String(v);
}
function num(params: Record<string, unknown>, key: string): number | undefined {
  const v = params[key];
  return v === undefined || v === "" ? undefined : Number(v);
}

export const gameHandlers: Record<string, Handler> = {
  tictactoe: ({ params, res }) => {
    ok(res, engine.tictactoe({ session: str(params, "session"), cell: num(params, "cell"), difficulty: str(params, "difficulty") as "easy" | "hard" | undefined }));
  },

  trivia: ({ params, res }) => {
    ok(res, { questions: engine.triviaQuestions(Number(params.amount ?? 1), { difficulty: str(params, "difficulty") }) });
  },

  ptt: ({ params, res }) => {
    const move = str(params, "move");
    if (!move) throw badRequest("El parámetro «move» es obligatorio (piedra, papel o tijera)");
    ok(res, engine.ptt({ session: str(params, "session"), move }));
  },

  guessnumber: ({ params, res }) => {
    ok(res, engine.guessNumber({ session: str(params, "session"), guess: num(params, "guess"), min: num(params, "min"), max: num(params, "max") }));
  },

  hangman: ({ params, res }) => {
    ok(res, engine.hangman({ session: str(params, "session"), letter: str(params, "letter") }));
  },

  wordle: ({ params, res }) => {
    ok(res, engine.wordle({ session: str(params, "session"), word: str(params, "word") }));
  },

  mathquiz: ({ params, res }) => {
    ok(res, engine.mathQuiz({ session: str(params, "session"), answer: num(params, "answer"), timeLimit: num(params, "timeLimit") }));
  },

  slot: ({ params, res }) => ok(res, engine.slot(Number(params.bet ?? 10))),

  dice: ({ params, res }) => ok(res, engine.dice(Number(params.count ?? 2), Number(params.sides ?? 6))),

  coinflip: ({ params, res }) => ok(res, engine.coinflip(Number(params.count ?? 1))),

  quiz: ({ params, res }) => {
    ok(res, { questions: engine.triviaQuestions(Number(params.amount ?? 3), { category: str(params, "category") }) });
  },

  riddle: ({ params, res }) => {
    ok(res, { riddles: engine.riddles(Number(params.amount ?? 1), params.reveal === true) });
  },

  memory: ({ params, res }) => {
    ok(res, engine.memoryGame({ session: str(params, "session"), card: num(params, "card") }));
  },

  snake: ({ params, res }) => {
    ok(res, engine.snake({ session: str(params, "session"), direction: str(params, "direction") as "up" | "down" | "left" | "right" | undefined }));
  },

  g2048: ({ params, res }) => {
    ok(res, engine.game2048({ session: str(params, "session"), move: str(params, "move") as "up" | "down" | "left" | "right" | undefined }));
  }
};
