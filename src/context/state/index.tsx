import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import {DateTime} from "luxon"
import allWords from "../../data/fives"
import w2 from "../../data/w2"
import w3 from "../../data/w3"
import w4 from "../../data/w4"
import type {Key} from "../../models/key"
import {
  DayState,
  DayWords,
  fromWords,
  handleKeyPress,
  newGame,
  State,
} from "../../models/state"
import {ConfigContext} from "../settings/config"

export interface IStateContext {
  readonly state: State
  readonly onKeyPress: (key: Key) => void
}

export const StateContext = React.createContext<IStateContext>({
  state: newGame(1, []),
  onKeyPress: () => {
    // template
  },
})

const getWords = (dayNumber: number): DayWords => {
  const idx: number = dayNumber % 400
  const w4W = w4.words[idx]
  const w3W = w3.words[idx]
  const w2W = w2.words[idx]
  return {
    two: w2W.map((i) => allWords.words[i]),
    three: w3W.map((i) => allWords.words[i]),
    four: w4W.map((i) => allWords.words[i]),
  }
}

export interface StateProps {
  readonly children: React.ReactNode
}

export const ProvideState: React.FC<StateProps> = ({children}) => {
  const dayNumber = pipe(
    DateTime.utc(),
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (nw) => nw.diff(nw.set({day: 1, month: 1})),
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    (d) => d.shiftTo("days").days + 1,
  )
  const [dayState, setDayState] = React.useState<DayState>(
    fromWords(dayNumber, getWords(dayNumber)),
  )
  const {
    config: {mode},
  } = React.useContext(ConfigContext)
  const value = React.useMemo(
    () => ({
      state: dayState[mode],
      onKeyPress: (key: Key) =>
        pipe(dayState[mode], handleKeyPress(key), (state) =>
          setDayState({...dayState, [mode]: state}),
        ),
    }),
    [mode, dayState],
  )
  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  )
}
