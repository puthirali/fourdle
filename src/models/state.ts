import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import * as T from "@effect-ts/core/Collections/Immutable/Tuple"
import {pipe} from "@effect-ts/core/Function"
import {matchTag} from "@effect-ts/core/Utils"
import {Duration, DateTime} from "luxon"
import {
  applyKey,
  board,
  Board,
  display,
  displayBoard,
  Entry,
  significantRows,
} from "./entry"
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

export type BoardNumber = "two" | "three" | "four"
export const boardNumbers: BoardNumber[] = ["two", "three", "four"]
export type LetterState = {readonly [k in Char]: KeyMode}

export const titles: {readonly [k in BoardNumber]: string} = {
  two: "2dle",
  three: "3dle",
  four: "4dle",
}

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
  readonly puzzleNumber: number
  readonly letterState: LetterState
  readonly boards: readonly BoardState[]
  readonly isDone: boolean
  readonly startTime?: string
  readonly finishTime?: string
}

export type BoardStateMap = {readonly [d in BoardNumber]: State}
export type DayWords = {readonly [d in BoardNumber]: readonly string[]}
export interface DayState {
  readonly puzzleNumber: number
  readonly states: BoardStateMap
}

export interface BoardResult {
  readonly hasInvalidEntry: boolean
  readonly isSolved: boolean
  readonly trials: number
  readonly display: string
}

export function boardResult(b: Board): BoardResult {
  return {
    isSolved: b.isSolved,
    trials: b.entries.length,
    display: displayBoard(b),
    hasInvalidEntry: b.entries.some((e) => e.isInvalid),
  }
}

const encouragement = [
  "You can do it",
  "Continue?",
  "There is still time",
  "Tomorrow never dies, but today is still alive!",
  "Finish?",
  "Get it done?",
]

const props = [
  "You did it!",
  "A marathon!",
  "Phew!",
  "You live!",
  "Finally!",
  "What a ride!",
]

const kudos = [
  "You are the one!",
  "Are you a secret genius?",
  "Wow!",
  "Lucky, Lucky!",
  "Over the top!",
  "No way!",
]

export interface Result {
  readonly puzzleNumber: number
  readonly mode: BoardNumber
  readonly startTime?: string
  readonly finishTime?: string
  readonly time: string
  readonly boardResults: readonly BoardResult[]
  readonly trials: readonly number[]
  readonly maxTrials: number
  readonly minTrials: number
  readonly trialCount: number
  readonly display: string
  readonly shareScore: string
  readonly isSolved: boolean
  readonly message: string
  readonly shareTitle: string
  readonly hasInvalidEntries: boolean
}

export interface DayResults {
  readonly four: Result
  readonly three: Result
  readonly two: Result
}

function choose<T>(a: readonly T[]) {
  const min = 0
  const max = a.length - 1
  const choice = Math.floor(Math.random() * (max - min + 1) + min)
  return a[choice]
}

export function duration(s: State): Duration {
  const startTime = s.startTime
    ? DateTime.fromISO(s.startTime)
    : DateTime.utc()
  const endTime = s.finishTime
    ? DateTime.fromISO(s.finishTime)
    : DateTime.utc()

  const dur = startTime.diff(endTime)

  if (!dur.isValid) return Duration.fromObject({minutes: 0})
  return dur
}

const emptyEntry = "🖤🖤🖤🖤🖤"

export function gameDisplayV(s: State, numRows: number): string {
  if (!s.isDone) return ""
  return pipe(
    s.boards,
    A.map((b) => pipe(b.board, displayBoard)),
    A.map((bd) =>
      pipe(bd.split("\n"), A.takeRight(numRows), A.join("\n")),
    ),
    A.mapWithIndex((i, s) => `#${i}\n${s}`),
    A.join("\n"),
  )
}

export function gameDisplayH(s: State, numRows: number): string {
  if (!s.isDone) return ""
  return pipe(
    s.boards,
    A.map((b) => pipe(b.board, displayBoard)),
    A.map((bd) => pipe(bd.split("\n"), A.takeRight(numRows))),
    A.map(
      (brs) =>
        [
          ...brs,
          ...pipe(
            A.replicate_(numRows - brs.length, ""),
            A.mapWithIndex(
              (i: number) =>
                `${`${brs.length + i + 1}`.padStart(
                  2,
                  " ",
                )} ${emptyEntry}`,
            ),
          ),
        ] as readonly string[],
    ),
    A.reduce(A.replicate_(numRows, ""), (lines, bds) =>
      pipe(
        bds,
        A.reduceWithIndex(lines, (idx, ls, dr) => [
          ...(idx > 0 ? pipe(ls, A.take(idx)) : []),
          `${ls[idx]}${dr} `,
          ...pipe(ls, A.takeRight(numRows - idx - 1)),
        ]),
      ),
    ),
    A.join("\n"),
  )
}

export interface SignificantEntry {
  readonly boardNumber: number
  readonly entry: Entry
  readonly index: number
}

type DS = {readonly [a: number]: number}

export function includeIndex(ds: DS, ind: number): DS {
  const dsu = ind in ds ? ds : {...ds, [ind]: 0}
  return {...dsu, [ind]: dsu[ind] + 1}
}

function significantEntry(bn: number, b: Board, idx: number) {
  const index =
    idx < 0 || idx >= b.entries.length - 1
      ? Math.floor(b.entries.length / 2)
      : idx
  return {
    boardNumber: bn,
    entry: b.entries[index],
    index,
  }
}

export function predictSignificantRows(
  bs: readonly Board[],
): readonly [string, readonly SignificantEntry[]] {
  const sig: readonly number[][] = pipe(bs, A.map(significantRows))
  const messages = ["🎭", "🎯", "🤞", "🏁"]
  const choice = choose([0, 1, 2, 3])
  return [
    messages[choice],
    pipe(
      sig,
      A.map((ss: readonly number[]) => ss[choice]),
      A.mapWithIndex((i, n) => significantEntry(i, bs[i], n)),
    ),
  ]
}

export function significantDisplay(s: State) {
  if (!s.isDone) return ""
  const [message, entries] = pipe(
    s.boards,
    A.map((b) => b.board),
    predictSignificantRows,
  )
  const header = `${s.boards.length}dle - (#${s.puzzleNumber}) ${message} -`
  const stats = `${pipe(
    s.boards,
    A.map((b) => b.board.entries.length),
    A.map((l) => `${l}`),
    A.join(" | "),
  )}`
  const body = pipe(
    entries,
    A.map(
      (e) =>
        `Word ${e.boardNumber} → ${`${e.index}`.padStart(
          2,
          " ",
        )} → ${display(e.entry)}`,
    ),
    A.join("\n"),
  )
  return `${header} ${stats}\n${body}`
}

type IndexedCount = readonly [number, number]
type IndexedCountList = readonly IndexedCount[]

export function minimumDisplay(s: State) {
  if (!s.isDone) return ""
  const sortedIC = pipe(
    s.boards,
    A.reduceWithIndex([] as IndexedCountList, (i, trs, bs) => [
      ...trs,
      [i, bs.board.entries.length] as IndexedCount,
    ]),
    A.sort({compare: (x, y) => (x[1] > y[1] ? 1 : -1)}),
  )
  const idx = sortedIC[0][0]
  const body = pipe(
    s.boards[idx].board,
    displayBoard,
    (s) => s.split("\n"),
    A.takeRight(6),
    A.join("\n"),
  )
  const header = `${s.boards.length}dle - (#${s.puzzleNumber})`
  const stats = `${pipe(
    s.boards,
    A.map((b) => b.board.entries.length),
    A.map((l) => `${l}`),
    A.join(" | "),
  )}`
  return `${header} ${stats}\nWord ${idx + 1}\n${body}`
}

export function result(s: State, mode: BoardNumber): Result {
  const boardResults: readonly BoardResult[] = pipe(
    s.boards,
    A.map((b) => b.board),
    A.map(boardResult),
  )
  const trials = pipe(
    boardResults,
    A.map((b) => b.trials),
  )

  const maxTrials = Math.max(...trials)
  const minTrials = Math.min(...trials)
  const trialCount = pipe(
    trials,
    A.reduce(0, (c, t) => c + t),
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
    puzzleNumber: s.puzzleNumber,
    mode,
    startTime: s.startTime,
    finishTime: s.finishTime,
    time: duration(s).shiftTo("minutes", "seconds").toHuman({
      listStyle: "long",
      maximumFractionDigits: 0,
      unitDisplay: "long",
    }),
    maxTrials,
    minTrials,
    trials,
    trialCount,
    boardResults,
    display: `${s.boards.length}dle(${s.puzzleNumber}):\n${gameDisplayH(
      s,
      6,
    )}`,
    shareScore: minimumDisplay(s),
    isSolved,
    message,
    shareTitle: titles[mode],
    hasInvalidEntries: boardResults.some((br) => br.hasInvalidEntry),
  }
}

export function dayResults(ds: DayState): DayResults {
  return {
    four: result(ds.states.four, "four"),
    three: result(ds.states.three, "three"),
    two: result(ds.states.two, "two"),
  }
}

export function newGame(
  puzzleNumber: number,
  words: readonly string[],
): State {
  return {
    puzzleNumber,
    letterState: {...emptyLetterState},
    boards: words.map((w) => ({
      letterState: {...emptyLetterState},
      board: board(w),
    })),
    isDone: false,
    startTime: DateTime.utc().toISO(),
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
    (s) => ({
      ...s,
      finishTime: s.isDone ? DateTime.utc().toISO() : undefined,
    }),
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

export function fromWords(
  dayNumber: number,
  dayWords: DayWords,
): DayState {
  return {
    puzzleNumber: dayNumber,
    states: pipe(
      dayWords,
      R.map((words) => newGame(dayNumber, words)),
    ),
  } as DayState
}
