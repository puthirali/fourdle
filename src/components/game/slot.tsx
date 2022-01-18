import * as React from "react"
import Box from "@mui/material/Box"
import ReactCardFlip from "react-card-flip"
import {ScreenInferenceContext} from "../../context/system/screen"
import {ColorModeContext} from "../../context/theme"
import type {CharKey} from "../../models/key"
import {keyStyle, open} from "../../models/key"

export interface SlotProps {
  readonly keyCap: CharKey
  readonly isSolution: boolean
  readonly isCommitted: boolean
}

export const Slot: React.FC<SlotProps> = ({
  keyCap,
  isSolution,
  isCommitted,
}: SlotProps) => {
  const {screenHeight} = React.useContext(ScreenInferenceContext)
  const {makeAccessible} = React.useContext(ColorModeContext)
  const sz =
    screenHeight === "TINY"
      ? "32px"
      : screenHeight === "SHORT"
      ? "36px"
      : screenHeight === "MEDIUM"
      ? "48px"
      : "64px"
  const baseStyle = {
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    width: sz,
    height: sz,
    margin: "4px",
    borderWidth: isSolution ? "0px" : "1px",
  }
  return (
    <ReactCardFlip
      containerClassName="slot-flip"
      isFlipped={isCommitted}
      flipDirection="vertical"
      flipSpeedFrontToBack={0.8}
    >
      <Box
        className="slot-open"
        sx={keyStyle({
          keyCap: open(keyCap),
          makeAccessible,
          props: baseStyle,
        })}
      >
        {keyCap.char.trim() === ""
          ? "\u00A0"
          : keyCap.char.toUpperCase()}
      </Box>
      <Box
        className="slot-closed"
        sx={keyStyle({keyCap, makeAccessible, props: baseStyle})}
      >
        {keyCap.char.trim() === ""
          ? "\u00A0"
          : keyCap.char.toUpperCase()}
      </Box>
    </ReactCardFlip>
  )
}
