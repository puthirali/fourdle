import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as T from "@effect-ts/core/Collections/Immutable/Tuple"
import {pipe} from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import {matchTag} from "@effect-ts/core/Utils"
import {applyKey, board, Board} from "./entry"
import {
  charKey,
  allChars,
  Char,
  KeyMode,
  maxMode,
  Key,
  CharP,
  key,
  open,
  forChar,
} from "./key"
import type {CharKey} from "./key"

export type LetterState = {readonly [k in Char]: KeyMode}

const emptyLetterState: LetterState = pipe(
  allChars,
  A.map((c) =>
    pipe(T.tuple(), T.append(c), T.append("OPEN" as KeyMode)),
  ),
  R.fromArray,
  (x) => x as LetterState,
)

function getCharKey(c: Char) {
  return (ls: LetterState): CharKey =>
    charKey(c, c in ls ? ls[c] : "OPEN") as CharKey
}

export function getKey(c: CharP) {
  return (ls: LetterState): Key =>
    pipe(
      c,
      key,
      matchTag({
        Char: (ck) => pipe(ls, getCharKey(ck.char)),
        Control: (ck) => ck,
      }),
    )
}

function maxKey(c: CharKey) {
  return (ls: LetterState): CharKey =>
    pipe(
      ls,
      getCharKey(c.char),
      (ck) => charKey(c.char, maxMode(c.mode, ck.mode)) as CharKey,
    )
}

function applyChar(c: CharKey) {
  return (ls: LetterState) =>
    pipe(ls, maxKey(c), (ck) => ({...ls, [ck.char]: ck.mode}))
}

function merge(ls1: LetterState) {
  return (ls2: LetterState) =>
    pipe(
      allChars,
      A.map((c) => getCharKey(c)(ls1)),
      A.reduce(ls2, (ls, c) => applyChar(c)(ls)),
    )
}

export interface BoardState {
  readonly letterState: LetterState
  readonly board: Board
}

export interface State {
  readonly letterState: LetterState
  readonly boards: readonly BoardState[]
  readonly isDone: boolean
  readonly startTime: O.Option<Date>
  readonly finishTime: O.Option<Date>
}

export interface BoardResult {
  readonly isSolved: boolean
  readonly trials: number
}

export interface Result {
  readonly startTime: O.Option<Date>
  readonly finishTime: O.Option<Date>
  readonly boardResults: readonly BoardResult[]
}

export function newGame(words: readonly string[]): State {
  return {
    letterState: {...emptyLetterState},
    boards: words.map((w) => ({
      letterState: {...emptyLetterState},
      board: board(w),
    })),
    isDone: false,
    startTime: O.some(new Date()),
    finishTime: O.none,
  }
}

export function evalLetterState(s: State): State {
  return pipe(
    s.boards,
    A.map((b) => (b.board.isSolved ? emptyLetterState : b.letterState)),
    A.reduce({...emptyLetterState} as LetterState, (ls1, ls2) =>
      merge(ls1)(ls2),
    ),
    (ls) => ({...s, letterState: ls}),
  )
}

export function evalLetterStateForBoard(b: Board): LetterState {
  return pipe(
    b.entries,
    A.map((e) => e.chars),
    A.flatten,
    A.reduce({...emptyLetterState} as LetterState, (ls, c) =>
      applyChar(c)(ls),
    ),
  )
}

export function evalBoard(b: BoardState): BoardState {
  return pipe(b, (b) => ({
    ...b,
    letterState: evalLetterStateForBoard(b.board),
  }))
}

export function evalState(s: State): State {
  return pipe(
    {
      ...s,
      boards: s.boards.map(evalBoard),
    },
    (s: State) => ({
      ...s,
      isDone: pipe(
        s.boards,
        A.forAll((b) => b.board.isSolved),
      ),
    }),
    evalLetterState,
    (s) => ({...s, finishTime: s.isDone ? O.some(new Date()) : O.none}),
  )
}

export function onBoards(f: (b: Board) => Board) {
  return (s: State): State => ({
    ...s,
    boards: pipe(
      s.boards,
      A.map((bs) => ({...bs, board: f(bs.board)})),
    ),
  })
}

export function handleKeyPress(key: Key) {
  return (s: State): State =>
    pipe(s, onBoards(pipe(key, forChar(open), applyKey)), (s) =>
      key._tag === "Control" && key.ctrl === "ENTER" ? evalState(s) : s,
    )
}
