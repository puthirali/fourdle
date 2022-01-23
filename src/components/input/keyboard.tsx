import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import {useTheme} from "@mui/material"
import Box from "@mui/material/Box"
import {ConfigContext} from "../../context/settings/config"
import {StateContext} from "../../context/state"
import type {Key} from "../../models/key"
import {charP, keyboard} from "../../models/key"
import {getKey} from "../../models/state"
import {KeyCap} from "./key"

interface KeyRowProps {
  readonly keys: readonly Key[]
}

export const KeyRow: React.FC<KeyRowProps> = ({keys}: KeyRowProps) => {
  const {onKeyPress} = React.useContext(StateContext)
  return (
    <Box
      className="key-row"
      sx={{
        flexDirection: "row",
        textAlign: "center",
        flexWrap: "nowrap",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {keys.map((k) => (
        <KeyCap
          key={`keyboard-button-${pipe(k, charP)}`}
          keyCap={k}
          onKeyPress={onKeyPress}
        />
      ))}
    </Box>
  )
}

interface KeyboardProps {
  readonly row1: readonly Key[]
  readonly row2: readonly Key[]
  readonly row3: readonly Key[]
}

export const KeyboardBase: React.FC<KeyboardProps> = ({
  row1,
  row2,
  row3,
}: KeyboardProps) => {
  const theme = useTheme()
  return (
    <Box
      className="keyboard"
      sx={{
        width: "100%",
        backgroundColor: theme.palette.background.paper,
        padding: {md: "2em 0", sm: "1em 0", xs: "0.5em 0"},
      }}
    >
      <KeyRow keys={row1} />
      <KeyRow keys={row2} />
      <KeyRow keys={row3} />
    </Box>
  )
}

export const Keyboard: React.FC = () => {
  const {state} = React.useContext(StateContext)
  const {
    config: {inZoomMode, currentZoom},
  } = React.useContext(ConfigContext)
  const letterState = React.useMemo(
    () =>
      inZoomMode
        ? state.boards[currentZoom].letterState
        : state.letterState,
    [currentZoom, inZoomMode, state.boards, state.letterState],
  )
  const row1 = keyboard[0].map((c) => pipe(letterState, getKey(c)))
  const row2 = keyboard[1].map((c) => pipe(letterState, getKey(c)))
  const row3 = keyboard[2].map((c) => pipe(letterState, getKey(c)))
  return <KeyboardBase row1={row1} row2={row2} row3={row3} />
}
