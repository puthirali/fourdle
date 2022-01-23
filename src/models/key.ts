import type React from "react"
import {pipe} from "@effect-ts/core"
import * as A from "@effect-ts/core/Collections/Immutable/Array"
import * as O from "@effect-ts/core/Option"
import {matchTag} from "@effect-ts/core/Utils"
import {colors} from "@mui/material"

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
  return pipe(
    k1,
    matchTag({
      Char: (k) =>
        k2._tag === "Char" && k2.char === k.char && k2.mode === k.mode,
      Control: (k) => k2._tag === "Control" && k2.ctrl === k.ctrl,
    }),
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
  return pipe(
    keyCap,
    matchTag({
      Char: (ck) => ck.char,
      Control: (ck) => (ck.ctrl === "BACKSPACE" ? "-" : "+"),
    }),
  )
}

export function isCharP(unk: string): unk is CharP {
  return allChars.includes(unk.toLowerCase() as Char)
}

export function fromKeyCode(keyCode: string): O.Option<Key> {
  const keyCodeLower = keyCode.toLowerCase()
  let result: O.Option<Key> = O.none
  if (keyCodeLower === "enter") {
    result = O.some(key("+"))
  } else if (keyCodeLower === "backspace") {
    result = O.some(key("-"))
  } else if (isCharP(keyCodeLower)) {
    result = O.some(key(keyCodeLower))
  }
  return result
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
    pipe(
      key,
      matchTag({
        Char: (ck) => f(ck) as Key,
        Control: (ck) => ck,
      }),
    )
}

export interface KeyColorRequest {
  readonly keyCap: Key
  readonly makeAccessible: boolean
  readonly props: Readonly<React.CSSProperties>
}

export function keyColor(mode: KeyMode, makeAccessible: boolean) {
  switch (mode) {
    case "OPEN":
      return colors.grey.A700
    case "MISS":
      return colors.grey[900]
    case "BULLSEYE":
      return makeAccessible ? "#009E73" : colors.green[900]
    case "HIT":
      return makeAccessible ? "#D55E00" : colors.yellow[900]
    case "ERROR":
      return makeAccessible ? "#CC79A7" : colors.red[900]
  }
}

export function keyStyle({
  keyCap,
  makeAccessible,
  props,
}: KeyColorRequest): React.CSSProperties {
  const base: React.CSSProperties = {
    backgroundColor: colors.grey.A700,
    borderColor: colors.grey.A700,
    borderWidth: "1px",
    borderStyle: "solid",
    color: colors.grey.A100,
    textAlign: "center",
    fontWeight: "bold",
    ...props,
  }
  return pipe(
    keyCap,
    matchTag({
      Char: (ck) => ({
        ...base,
        backgroundColor: keyColor(ck.mode, makeAccessible),
      }),
      Control: () => ({...base, flex: 1.25, maxWidth: "96px"}),
    }),
  )
}
