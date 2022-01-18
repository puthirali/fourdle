import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as T from "@effect-ts/core/Collections/Immutable/Tuple"
import {pipe} from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import {matchTag} from "@effect-ts/core/Utils"
import {Interval, Duration} from "luxon"
import {applyKey, board, Board, boardResult} from "./entry"
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

export type BoardNumber = "one" | "two" | "three" | "four"

export type DayState = {readonly [d in BoardNumber]: State}
export type DayWords = {readonly [d in BoardNumber]: readonly string[]}

export interface BoardResult {
  readonly isSolved: boolean
  readonly trials: number
  readonly display: string
}

const encouragement = [
  "Tough Luck!",
  "Try again?",
  "Once more?",
  "Tomorrow never dies, but today is still alive!",
  "Already?",
  "Horror... Horror...",
]

const props = [
  "You did it!",
  "That was... close!",
  "Phew!",
  "You like marathons, don't you?",
  "Somewhere, someone tried a bit more than you, for sure, maybe?",
  "I'm telling you, these words are funny!",
]

const kudos = [
  "You are the one. Blue pill or Red pill?",
  "Are you a secret genius?",
  "Wow!",
  "Lucky, Lucky!",
  "Over the top!",
  "Impossible!",
]

export interface Result {
  readonly startTime: O.Option<Date>
  readonly finishTime: O.Option<Date>
  readonly time: string
  readonly boardResults: readonly BoardResult[]
  readonly maxTrials: number
  readonly display: string
  readonly isSolved: boolean
  readonly message: string
}

function choose<T>(a: readonly T[]) {
  const min = 0
  const max = a.length
  const choice = Math.floor(Math.random() * (max - min + 1) + min)
  return a[choice]
}

export function duration(s: State): Duration {
  if (!O.isSome(s.startTime)) {
    return Duration.fromObject({minutes: 0})
  }
  const endTime = O.getOrElse_(s.finishTime, () => new Date())
  return Interval.fromDateTimes(s.startTime.value, endTime).toDuration()
}

export function result(s: State): Result {
  const boardResults: readonly BoardResult[] = pipe(
    s.boards,
    A.map((b) => b.board),
    A.map(boardResult),
  )

  const maxTrials = Math.max(
    ...pipe(
      boardResults,
      A.map((b) => b.trials),
    ),
  )
  const isSolved = pipe(
    boardResults,
    A.forAll((b) => b.isSolved),
  )
  const message = isSolved
    ? maxTrials > 12
      ? choose(props)
      : choose(kudos)
    : choose(encouragement)

  return {
    startTime: s.startTime,
    finishTime: s.finishTime,
    time: `${duration(s).toFormat("m")} minutes, ${duration(s).toFormat(
      "s",
    )} seconds`,
    maxTrials,
    boardResults,
    display: `4dle: ${pipe(
      boardResults,
      A.mapWithIndex((i, b) => `#${i + 1}\n${b.display}`),
    ).join("\n")}`,
    isSolved,
    message,
  }
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

export function fromWords(dayWords: DayWords): DayState {
  return pipe(
    dayWords,
    R.map((words) => newGame(words)),
  ) as DayState
}
