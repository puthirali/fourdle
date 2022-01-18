import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import type {Key} from "../../models/key"
import {handleKeyPress, newGame, State} from "../../models/state"

export interface IStateContext {
  readonly state: State
  readonly onKeyPress: (key: Key) => void
}

export const StateContext = React.createContext<IStateContext>({
  state: newGame([]),
  onKeyPress: () => {
    // template
  },
})

// - const getWords = (): string[] => ["words", "share", "hunch", "color"]
// + const getWords = (): string[] => ["worse", "great", "goofy", "yacht"]
// + const getWords = (): string[] => ["lucky", "giver", "delta", "crude"]
// - const getWords = (): string[] => ["clock", "flame", "proof", "hedge"]
// + const getWords = (): string[] => ["truce", "heist", "quirk", "angry"]
const getWords = (): string[] => ["sweat", "youth", "drown"]

export interface StateProps {
  readonly children: React.ReactNode
}

export const ProvideState: React.FC<StateProps> = ({children}) => {
  const [state, setState] = React.useState(pipe(getWords(), newGame))
  const value = React.useMemo(
    () => ({
      state,
      onKeyPress: (key: Key) =>
        pipe(state, handleKeyPress(key), setState),
    }),
    [state, setState],
  )
  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  )
}
