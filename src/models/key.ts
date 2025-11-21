import * as A from "effect/Array"
import * as O from "effect/Option"
import * as Match from "effect/Match"

// Color constants to replace MUI colors
const colors = {
  grey: {
    A700: "#616161",
    A100: "#f5f5f5",
    900: "#212121",
  },
  red: {
    900: "#b71c1c",
  },
}

export type EmptyChar = " "
export type KeyMode = "MISS" | "HIT" | "BULLSEYE" | "OPEN" | "ERROR"
export type Char =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"
  | EmptyChar
export type Control = "ENTER" | "BACKSPACE"
export type CharP = Char | "+" | "-" | EmptyChar

export const keyboard: readonly CharP[][] = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["+", "z", "x", "c", "v", "b", "n", "m", "-"],
]

const modePrecedence: KeyMode[] = [
  "ERROR",
  "OPEN",
  "MISS",
  "HIT",
  "BULLSEYE",
]

export function maxMode(m1: KeyMode, m2: KeyMode): KeyMode {
  const maxIndex = Math.max(
    modePrecedence.indexOf(m1),
    modePrecedence.indexOf(m2),
  )
  return modePrecedence[maxIndex >= 0 ? maxIndex : 0]
}

export const allChars: Char[] = A.flatten(keyboard)
  .filter((c) => c !== "+" && c !== "-")
  .sort() as Char[]

export class CharKey {
  readonly _tag = "Char"

  constructor(readonly mode: KeyMode, readonly char: Char) {}
}

export class ControlKey {
  readonly _tag = "Control"

  constructor(readonly ctrl: Control) {}
}

export type Key = CharKey | ControlKey

export function controlKey(ctrl: Control): Key {
  return new ControlKey(ctrl)
}

export function areKeysEqual(k1: Key, k2: Key): boolean {
  return Match.value(k1).pipe(
    Match.tag("Char", (k) =>
      k2._tag === "Char" && k2.char === k.char && k2.mode === k.mode,
    ),
    Match.tag("Control", (k) => k2._tag === "Control" && k2.ctrl === k.ctrl),
    Match.exhaustive,
  )
}

export function isSameKey(k1: Key, k2: Key): boolean {
  return Match.value(k1).pipe(
    Match.tag("Char", (k) =>
      k2._tag === "Char" && k2.char === k.char,
    ),
    Match.tag("Control", (k) => k2._tag === "Control" && k2.ctrl === k.ctrl),
    Match.exhaustive,
  )
}

export function charKey(char: Char, mode: KeyMode = "OPEN"): Key {
  return new CharKey(mode, char)
}

export function key(key: CharP): Key {
  switch (key) {
    case "+":
      return controlKey("ENTER")
    case "-":
      return controlKey("BACKSPACE")
    default:
      return charKey(key)
  }
}

export function charP(keyCap: Key): CharP {
  return Match.value(keyCap).pipe(
    Match.tag("Char", (ck) => ck.char),
    Match.tag("Control", (ck) => (ck.ctrl === "BACKSPACE" ? "-" : "+")),
    Match.exhaustive,
  )
}

export function isCharP(unk: string): unk is CharP {
  return allChars.includes(unk.toLowerCase() as Char)
}

export function fromKeyCode(keyCode: string): O.Option<Key> {
  const keyCodeLower = keyCode.toLowerCase()
  return Match.value(keyCodeLower).pipe(
    Match.when("enter", () => O.some(key("+"))),
    Match.when("backspace", () => O.some(key("-"))),
    Match.when(isCharP, (kc) => O.some(key(kc as CharP))),
    Match.orElse(() => O.none())
  )
}

export const emptyChar: CharKey = charKey(" ") as CharKey

export function withMode(mode: KeyMode) {
  return (key: CharKey) => new CharKey(mode, key.char)
}

export const miss = withMode("MISS")

export const bullsEye = withMode("BULLSEYE")

export const open = withMode("OPEN")

export const hit = withMode("HIT")

export const error = withMode("ERROR")

export function forChar(f: (c: CharKey) => CharKey) {
  return (key: Key): Key =>
    Match.value(key).pipe(
      Match.tag("Char", (ck) => f(ck) as Key),
      Match.tag("Control", (ck) => ck as Key),
      Match.exhaustive,
    )
}

export interface KeyColorRequest {
  readonly keyCap: Key
  readonly makeAccessible: boolean
  readonly props: Readonly<Record<string, string | number>>
}

export function keyColor(mode: KeyMode, makeAccessible: boolean) {
  switch (mode) {
    case "OPEN":
      return colors.grey.A700
    case "MISS":
      return colors.grey[900]
    case "BULLSEYE":
      return makeAccessible ? "#009E73" : "#1C8C38"
    case "HIT":
      return makeAccessible ? "#D55E00" : "#E0AF1B"
    case "ERROR":
      return makeAccessible ? "#CC79A7" : colors.red[900]
  }
}

export function keyStyle({
  keyCap,
  makeAccessible,
  props,
}: KeyColorRequest): Record<string, string | number> {
  const base: Record<string, string | number> = {
    backgroundColor: colors.grey.A700,
    borderColor: colors.grey.A700,
    borderWidth: "1px",
    borderStyle: "solid",
    color: colors.grey.A100,
    textAlign: "center",
    fontWeight: "bold",
    ...props,
  }
  return Match.value(keyCap).pipe(
    Match.tag("Char", (ck) => ({
      ...base,
      backgroundColor: keyColor(ck.mode, makeAccessible),
    })),
    Match.tag("Control", () => ({...base, flex: 1.25, maxWidth: "96px"})),
    Match.exhaustive,
  )
}
