import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import {DateTime} from "luxon"
import useLocalStorageState from "use-local-storage-state"
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
  readonly dayState: DayState
  readonly state: State
  readonly onKeyPress: (key: Key) => void
}

export const StateContext = React.createContext<IStateContext>({
  dayState: {
    puzzleNumber: 1,
    states: {
      two: newGame(1, []),
      three: newGame(1, []),
      four: newGame(1, []),
    },
  },
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
  const [dayState, setDayState] = useLocalStorageState<DayState>(
    "day-state",
    fromWords(dayNumber, getWords(dayNumber)),
  )

  React.useEffect(() => {
    if (dayState.puzzleNumber !== dayNumber) {
      setDayState(fromWords(dayNumber, getWords(dayNumber)))
    }
  }, [dayNumber, dayState.puzzleNumber, setDayState])
  const {
    config: {mode},
  } = React.useContext(ConfigContext)
  const value = React.useMemo(
    () => ({
      dayState,
      state: dayState.states[mode],
      onKeyPress: (key: Key) =>
        pipe(dayState.states[mode], handleKeyPress(key), (state) =>
          setDayState({
            puzzleNumber: dayState.puzzleNumber,
            states: {...dayState.states, [mode]: state},
          }),
        ),
    }),
    [dayState, mode, setDayState],
  )
  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  )
}
