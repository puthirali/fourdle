import * as React from "react"
import Box from "@mui/system/Box"
import {ScreenInferenceContext} from "../../context/system/screen"
import type {CharKey} from "../../models/key"
import {keyStyle} from "../../models/key"

export interface SlotProps {
  readonly keyCap: CharKey
  readonly isSolution: boolean
}

export const Slot: React.FC<SlotProps> = ({
  keyCap,
  isSolution,
}: SlotProps) => {
  const {screenHeight} = React.useContext(ScreenInferenceContext)
  const sz =
    screenHeight === "TINY"
      ? "32px"
      : screenHeight === "SHORT"
      ? "36px"
      : screenHeight === "MEDIUM"
      ? "48px"
      : "64px"
  return (
    <Box
      className="slot"
      sx={{
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        ...keyStyle({
          keyCap,
          makeAccessible: false,
          props: {
            width: sz,
            height: sz,
            margin: "4px",
            borderWidth: isSolution ? "0px" : "1px",
          },
        }),
      }}
    >
      {keyCap.char.toUpperCase()}
    </Box>
  )
}
