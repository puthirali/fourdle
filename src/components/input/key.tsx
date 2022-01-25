import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import {matchTag} from "@effect-ts/core/Utils"
import BackspaceIcon from "@mui/icons-material/BackspaceOutlined"
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn"
import {Button} from "@mui/material"
import {ConfigContext} from "../../context/settings/config"
import {
  ScreenHeight,
  ScreenInferenceContext,
} from "../../context/system/screen"
import type {CharKey, ControlKey, Key} from "../../models/key"
import {keyStyle} from "../../models/key"

interface BaseKeyCapProps<K> {
  readonly keyCap: K
  readonly onKeyPress: (key: Key) => void
}

type KeyCapProps = BaseKeyCapProps<Key>
type ControlKeyCapProps = BaseKeyCapProps<ControlKey>
type CharKeyCapProps = BaseKeyCapProps<CharKey>

function keyProps(screenHeight: ScreenHeight): React.CSSProperties {
  const fs =
    screenHeight === "TALL"
      ? "2rem"
      : screenHeight === "TINY"
      ? "1rem"
      : "1.5rem"
  return {
    maxWidth: "64px",
    maxHeight: "64px",
    minWidth: "auto",
    minHeight: "auto",
    padding: "0.2em",
    margin: "0.2em",
    flexDirection: "column",
    flex: 1,
    fontSize: fs,
  }
}

export const ControlKeyCap: React.FC<ControlKeyCapProps> = ({
  keyCap,
  onKeyPress,
}: ControlKeyCapProps) => {
  const {screenHeight} = React.useContext(ScreenInferenceContext)
  const {
    config: {isAccessible: makeAccessible},
  } = React.useContext(ConfigContext)
  const className = `ctrl-key ${keyCap.ctrl}`
  const fs =
    screenHeight === "TALL"
      ? "2.5rem"
      : screenHeight === "TINY"
      ? "1.5rem"
      : "2rem"
  const sx = {padding: "0.1em", fontSize: fs}
  const sxk = keyStyle({
    keyCap,
    makeAccessible,
    props: keyProps(screenHeight),
  })
  return (
    <Button
      className={className}
      variant="contained"
      sx={{
        ...sxk,
        "&.MuiButtonBase-root:hover": {
          bgcolor: sxk.backgroundColor,
        },
      }}
      onClick={() => onKeyPress(keyCap)}
    >
      {keyCap.ctrl === "BACKSPACE" ? (
        <BackspaceIcon sx={sx} />
      ) : (
        <KeyboardReturnIcon sx={sx} />
      )}
    </Button>
  )
}

export const CharKeyCap: React.FC<CharKeyCapProps> = ({
  keyCap,
  onKeyPress,
}: CharKeyCapProps) => {
  const {screenHeight} = React.useContext(ScreenInferenceContext)
  const {
    config: {isAccessible: makeAccessible},
  } = React.useContext(ConfigContext)
  const className = `char-key ${keyCap.mode}`
  const sxk = keyStyle({
    keyCap,
    makeAccessible,
    props: keyProps(screenHeight),
  })
  return (
    <Button
      // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
      onFocus={(e) => e.target.blur()}
      className={className}
      variant="contained"
      sx={{
        ...sxk,
        "&.MuiButtonBase-root:hover": {
          bgcolor: sxk.backgroundColor,
        },
      }}
      onClick={() => onKeyPress(keyCap)}
    >
      {keyCap.char.trim() === "" ? "&nbsp;" : keyCap.char.toUpperCase()}
    </Button>
  )
}

export const KeyCap: React.FC<KeyCapProps> = ({
  keyCap: key,
  onKeyPress,
}: KeyCapProps) => {
  return pipe(
    key,
    matchTag({
      Char: (ck) => <CharKeyCap keyCap={ck} onKeyPress={onKeyPress} />,
      Control: (ck) => (
        <ControlKeyCap keyCap={ck} onKeyPress={onKeyPress} />
      ),
    }),
  )
}
