import * as React from "react"
import Box from "@mui/material/Box"
import ReactCardFlip from "react-card-flip"
import {ConfigContext} from "../../context/settings/config"
import {ScreenInferenceContext} from "../../context/system/screen"
import type {CharKey} from "../../models/key"
import {keyStyle, open} from "../../models/key"

export interface SlotProps {
  readonly keyCap: CharKey
  readonly isSolution: boolean
  readonly isCommitted: boolean
  readonly isInvalid: boolean
}

export const Slot: React.FC<SlotProps> = ({
  keyCap,
  isSolution,
  isCommitted,
  isInvalid,
}: SlotProps) => {
  const {screenHeight, screenWidth} = React.useContext(
    ScreenInferenceContext,
  )
  const {
    config: {isAccessible},
  } = React.useContext(ConfigContext)
  const sz =
    screenHeight === "TINY" || !["MEDIUM", "WIDE"].includes(screenWidth)
      ? "32px"
      : screenHeight === "SHORT" ||
        !["MEDIUM", "WIDE"].includes(screenWidth)
      ? "36px"
      : screenWidth !== "WIDE"
      ? "40px"
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
      isFlipped={isCommitted || isInvalid}
      flipDirection={isInvalid ? "horizontal" : "vertical"}
      flipSpeedFrontToBack={0.8}
      flipSpeedBackToFront={0.8}
    >
      <Box
        className="slot-open"
        sx={keyStyle({
          keyCap: open(keyCap),
          makeAccessible: isAccessible,
          props: baseStyle,
        })}
      >
        {keyCap.char.trim() === ""
          ? "\u00A0"
          : keyCap.char.toUpperCase()}
      </Box>
      <Box
        className="slot-closed"
        sx={keyStyle({
          keyCap,
          makeAccessible: isAccessible,
          props: baseStyle,
        })}
      >
        {keyCap.char.trim() === ""
          ? "\u00A0"
          : keyCap.char.toUpperCase()}
      </Box>
    </ReactCardFlip>
  )
}
