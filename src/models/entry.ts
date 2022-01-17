import {pipe} from "@effect-ts/core"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as R from "@effect-ts/core/Collections/Immutable/Dictionary"
import type {NonEmptyArray} from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import * as NA from "@effect-ts/core/Collections/Immutable/NonEmptyArray"
import {constant, identity, not} from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import {matchTag} from "@effect-ts/core/Utils"
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
} from "./key"

export interface Entry {
  readonly chars: readonly CharKey[]
}

export const emptyEntry = (): Entry => ({chars: []})

export function isComplete(entry: Entry) {
  return entry.chars.length === 5
}

export function isEmpty(entry: Entry) {
  return entry.chars.length === 0
}

export function fromSolution(solution: string): Entry {
  return pipe(
    solution.split(""),
    A.map((c) => charKey(c as Char, "BULLSEYE") as CharKey),
    (cs) => ({chars: cs}),
  )
}

export function apply(key: Key) {
  return (entry: Entry): Entry =>
    pipe(
      key,
      matchTag({
        Char: (ck): Entry =>
          isComplete(entry) ? entry : {chars: [...entry.chars, ck]},
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

export function word(entry: Entry) {
  return entry.chars.map((c) => c.char).join("")
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

export function toEntry(dist: CharDist): Entry {
  return pipe(
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
    (chars) => ({chars}),
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

export function normalizeDist(
  dist: readonly Dist[],
  solutionDist: readonly Dist[],
): readonly Dist[] {
  return pipe(
    dist,
    A.map((d) =>
      pipe(
        d,
        // 1. If its not a hit, take it
        // 2. If it is a hit, if its not a dupe, take it
        // 3. If the solution dist has a dupe, take it
        // 4. Take it as a miss
        when((d) => d.mode !== "HIT", identity),
        when((d) => d.mode === "HIT" && dist.length === 1, identity),
        when(
          (d) =>
            d.mode === "HIT" &&
            dist.length === 2 &&
            solutionDist.length === 2,
          identity,
        ),
        when(
          (d) =>
            d.mode === "HIT" &&
            dist.length === 2 &&
            solutionDist.length !== 2,
          (d) => ({index: d.index, mode: "MISS" as KeyMode}),
        ),
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
    pipe(entry, getDistribution, normalizeCharDist(solution), toEntry)
}

export function checkEntry(solution: string) {
  return (entry: Entry): Entry => {
    if (!isComplete(entry)) return entry
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
      (chars) => ({chars}),
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

export function checkSolution(b: Board): Board {
  return pipe(
    b,
    onCurrent(checkEntry(b.solution)),
    (b) => ({
      ...b,
      isSolved: pipe(b.entries[b.currentIndex], isSolved(b.solution)),
    }),
    fixEntries,
    (b) => ({
      ...b,
      currentIndex: pipe(
        b.entries,
        A.findIndex(not(isComplete)),
        O.getOrElse(() => b.entries.length - 1),
      ),
    }),
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
