import {pipe} from "@effect-ts/core"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import type {NonEmptyArray} from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import {constant, identity, not} from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import {matchTag} from "@effect-ts/core/Utils"
import allWords from "../data/fives"
import {when} from "../utils"
import {
  allChars,
  Char,
  CharKey,
  Key,
  KeyMode,
  bullsEye,
  hit,
  miss,
  charKey,
  areKeysEqual,
  error,
} from "./key"

type KeyModeEmoji = "🔳" | "⬛" | "🟩" | "🟨" | "🟥"
type KeyModeDisplay = {readonly [m in KeyMode]: KeyModeEmoji}
const keyModeEmoji: KeyModeDisplay = {
  OPEN: "🔳",
  HIT: "🟨",
  MISS: "⬛",
  BULLSEYE: "🟩",
  ERROR: "🟥",
}

export interface Entry {
  readonly chars: readonly CharKey[]
  readonly isCommitted: boolean
  readonly isInvalid: boolean
}

export function areEntriesEqual(e1: Entry, e2: Entry) {
  return (
    e1.isCommitted === e2.isCommitted &&
    pipe(
      e1.chars,
      A.zipWith(e2.chars, (a, b) => areKeysEqual(a, b)),
      A.forAll(identity),
    )
  )
}

export const emptyEntry = (): Entry => ({
  chars: [],
  isCommitted: false,
  isInvalid: false,
})

export function isComplete(entry: Entry) {
  return entry.chars.length === 5 && !entry.isInvalid
}

export function isEmpty(entry: Entry) {
  return entry.chars.length === 0
}

export function fromSolution(solution: string): Entry {
  return pipe(
    solution.split(""),
    A.map((c) => charKey(c as Char, "BULLSEYE") as CharKey),
    (cs) => ({chars: cs, isCommitted: true, isInvalid: false}),
  )
}

export function apply(key: Key) {
  return (entr: Entry): Entry => {
    const entry = entr.isInvalid ? emptyEntry() : entr
    return pipe(
      key,
      matchTag({
        Char: (ck): Entry =>
          isComplete(entry)
            ? entry
            : {
                chars: [...entry.chars, ck],
                isCommitted: false,
                isInvalid: false,
              },
        Control: (ck): Entry =>
          ck.ctrl === "BACKSPACE"
            ? (pipe(
                NA.fromArray(entry.chars),
                O.map(NA.init),
                O.map((chars) => ({chars})),
                O.getOrElse(emptyEntry),
              ) as Entry)
            : entry,
      }),
    )
  }
}

export function fromWord(word: string): Entry {
  return pipe(
    word.split(""),
    A.reduce(emptyEntry(), (e, c) =>
      pipe(e, apply(charKey(c as Char, "OPEN"))),
    ),
  )
}

export function word(entry: Entry) {
  return entry.chars.map((c) => c.char).join("")
}

export function display(entry: Entry) {
  return entry.chars.map((c) => keyModeEmoji[c.mode]).join("")
}

export function isSolved(solution: string) {
  return (entry: Entry) => solution === word(entry)
}

interface Dist {
  readonly index: number
  readonly mode: KeyMode
}

interface _Dist_ extends Dist {
  readonly char: Char
}

type CharDist = {readonly [c in Char]: readonly Dist[]}

export function toEntry(isCommitted: boolean) {
  return (dist: CharDist): Entry =>
    pipe(
      dist,
      R.filter((d) => d.length > 0),
      R.reduceWithIndex(
        [] as readonly _Dist_[],
        (c, cs, ds): _Dist_[] => [
          ...cs,
          ...ds.map((d) => ({char: c as Char, ...d})),
        ],
      ),
      A.sort({compare: (a, b) => (a.index > b.index ? 1 : -1)}),
      A.map((x) => charKey(x.char, x.mode) as CharKey),
      (chars) => ({chars, isCommitted, isInvalid: false}),
    )
}

export function areDistributionsEqual(
  d1: CharDist,
  d2: CharDist,
): boolean {
  return areEntriesEqual(
    pipe(d1, toEntry(true)),
    pipe(d2, toEntry(true)),
  )
}

const emptyCharDist = allChars.reduce(
  (acc, c) => ({...acc, [c]: []}),
  {},
) as CharDist

function includeChar(c: CharKey, index: number) {
  return (dist: CharDist): CharDist =>
    pipe(
      dist,
      R.lookup(c.char),
      O.getOrElse(constant([])),
      A.append({index, mode: c.mode}),
      (d: readonly Dist[]) => ({...dist, [c.char]: d}),
    )
}

export function getDistribution(entry: Entry): CharDist {
  return pipe(
    entry.chars,
    A.reduceWithIndex({...emptyCharDist} as CharDist, (index, cd, c) =>
      pipe(cd, includeChar(c, index)),
    ),
  )
}

type EDist = readonly [readonly Dist[], readonly Dist[]]

export function normalizeDist(
  dist: readonly Dist[],
  solutionDist: readonly Dist[],
): readonly Dist[] {
  return dist.length === 1
    ? dist
    : pipe(
        dist,
        A.reduce([[], []] as EDist, ([left, right], d) =>
          d.mode !== "HIT"
            ? ([[...left, d], right] as EDist)
            : ([left, [...right, d]] as EDist),
        ),
        ([l, r]: EDist) =>
          pipe(
            r,
            A.reduce(l, (left, d) =>
              solutionDist.length - left.length > 0
                ? [...left, d]
                : ([
                    ...left,
                    {index: d.index, mode: "MISS" as KeyMode},
                  ] as Dist[]),
            ),
          ),
      )
}

export function hasChar(needle: Char, modes: readonly KeyMode[]) {
  return (entry: Entry) =>
    pipe(
      entry.chars,
      A.find((c) => c.char === needle && modes.includes(c.mode)),
      O.fold(
        () => false,
        () => true,
      ),
    )
}

export function normalizeCharDist(solution: string) {
  return (cd: CharDist) => {
    const solutionDist = pipe(fromSolution(solution), getDistribution)
    return pipe(
      cd,
      R.mapWithIndex((c, d) =>
        normalizeDist(d, solutionDist[c as Char]),
      ),
    ) as CharDist
  }
}

export function normalize(solution: string) {
  return (entry: Entry) =>
    pipe(
      entry,
      getDistribution,
      normalizeCharDist(solution),
      toEntry(entry.isCommitted),
    )
}

export function checkEntry(solution: string) {
  return (entry: Entry): Entry => {
    if (!isComplete(entry)) return entry
    const completed = word(entry)
    if (!allWords.words.includes(completed)) {
      return {
        ...entry,
        chars: entry.chars.map(error),
        isInvalid: true,
      }
    }
    return pipe(
      solution.split(""),
      A.zipWith(entry.chars, (c, k) =>
        pipe(
          k,
          miss,
          when((key) => solution.includes(key.char), hit),
          when((key) => key.char === c, bullsEye),
        ),
      ),
      (chars) => ({chars, isCommitted: true, isInvalid: false}),
      normalize(solution),
    )
  }
}

export interface Board {
  readonly solution: string
  readonly currentIndex: number
  readonly entries: readonly Entry[]
  readonly isSolved: boolean
}

export const board = (solution: string): Board => ({
  solution,
  currentIndex: 0,
  entries: pipe(
    5,
    A.makeBy(() => emptyEntry()),
    NA.prepend(emptyEntry()),
  ),
  isSolved: false,
})

export type LastEntered = readonly [Entry, number]

export function lastEntered(count: number) {
  return (b: Board): readonly LastEntered[] => {
    const start =
      b.currentIndex - count + 1 < 0 ? 0 : b.currentIndex - count + 1
    return b.entries
      .slice(start, start + count)
      .map((e, index) => [e, index + start])
  }
}

export function onCurrent(f: (e: Entry) => Entry) {
  return (b: Board): Board => {
    const init = b.entries.slice(0, b.currentIndex)
    const current = b.entries[b.currentIndex]
    const tail = b.entries.slice(b.currentIndex + 1)
    return {
      ...b,
      entries: pipe(init, NA.append(f(current)), NA.concat(tail)),
    }
  }
}

export function fixEntries(b: Board): Board {
  return b.isSolved
    ? {
        ...b,
        entries: b.entries.filter((e) =>
          isComplete(e),
        ) as unknown as NonEmptyArray<Entry>,
      }
    : pipe(
        b.entries,
        A.findIndex(not(isComplete)),
        O.fold(
          () => pipe(b.entries, NA.append(emptyEntry())),
          () => b.entries,
        ),
        (es) => ({...b, entries: es}),
      )
}

export function nextEntry(b: Board): Board {
  return pipe(b, fixEntries, (b) => ({
    ...b,
    currentIndex: pipe(
      b.entries,
      A.findIndex(not(isComplete)),
      O.getOrElse(() => b.entries.length - 1),
    ),
  }))
}

export function checkSolution(b: Board): Board {
  return pipe(
    b,
    onCurrent(checkEntry(b.solution)),
    (b): Board => ({
      ...b,
      isSolved: pipe(b.entries[b.currentIndex], isSolved(b.solution)),
    }),
    nextEntry,
  )
}

export const applyKey = (key: Key) => {
  return (b: Board): Board =>
    b.isSolved
      ? b
      : pipe(b, onCurrent(apply(key)), (b) =>
          key._tag === "Control" && key.ctrl === "ENTER"
            ? checkSolution(b)
            : b,
        )
}

export function displayBoard(b: Board) {
  return pipe(
    b.entries,
    A.map(display),
    A.mapWithIndex((i, s) => `${`${i + 1}`.padStart(2, " ")} ${s}`),
    A.join("\n"),
  )
}

export function boardResult(b: Board) {
  return {
    isSolved: b.isSolved,
    trials: b.entries.length,
    display: displayBoard(b),
  }
}

export function significantRows(b: Board) {
  const firstYellow = b.entries.findIndex((e) =>
    e.chars.some((c) => c.mode === "HIT"),
  )
  const firstGreen = b.entries.findIndex((e) =>
    e.chars.some((c) => c.mode === "BULLSEYE"),
  )
  const firstTwo = b.entries.findIndex(
    (e) =>
      e.chars.filter((c) => c.mode === "HIT" || c.mode === "BULLSEYE")
        .length >= 2,
  )
  const firstTwoGreens = b.entries.findIndex(
    (e) => e.chars.filter((c) => c.mode === "BULLSEYE").length >= 2,
  )
  return [firstYellow, firstGreen, firstTwo, firstTwoGreens]
}

const hashCode = (s: string) =>
  // eslint-disable-next-line no-bitwise
  s.split("").reduce((a, b) => ((a << 5) - a + b.charCodeAt(0)) | 0, 0)

export function uniq(b: Board) {
  return hashCode(b.solution)
}
