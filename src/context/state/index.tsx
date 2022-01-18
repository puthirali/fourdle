import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import type {Key} from "../../models/key"
import {
  BoardNumber,
  DayState,
  DayWords,
  fromWords,
  handleKeyPress,
  newGame,
  State,
} from "../../models/state"
import {ModeContext} from "./mode"

export interface IStateContext {
  readonly mode: BoardNumber
  readonly setMode: (b: BoardNumber) => void
  readonly state: State
  readonly onKeyPress: (key: Key) => void
}

export const StateContext = React.createContext<IStateContext>({
  state: newGame([]),
  onKeyPress: () => {
    // template
  },
  mode: "four",
  setMode: () => {
    // template
  },
})

// - const getWords = (): string[] => ["words", "share", "hunch", "color"]
// + const getWords = (): string[] => ["worse", "great", "goofy", "yacht"]
// + const getWords = (): string[] => ["lucky", "giver", "delta", "crude"]
// - const getWords = (): string[] => ["clock", "flame", "proof", "hedge"]
// + const getWords = (): string[] => ["truce", "heist", "quirk", "angry"]
const getWords = (): DayWords => ({
  one: ["fluid"],
  two: ["throw", "weigh"],
  three: ["sweat", "youth", "drown"],
  four: ["jolly", "truth", "route", "hyper"],
})

export interface StateProps {
  readonly children: React.ReactNode
}

export const ProvideState: React.FC<StateProps> = ({children}) => {
  const [dayState, setDayState] = React.useState<DayState>(
    fromWords(getWords()),
  )
  const {mode, setMode} = React.useContext(ModeContext)
  const value = React.useMemo(
    () => ({
      mode,
      setMode,
      state: dayState[mode],
      onKeyPress: (key: Key) =>
        pipe(dayState[mode], handleKeyPress(key), (state) =>
          setDayState({...dayState, [mode]: state}),
        ),
    }),
    [mode, setMode, dayState],
  )
  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  )
}
