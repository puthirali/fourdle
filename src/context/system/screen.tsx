import * as React from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import json2mq from "json2mq"
import {ConfigContext} from "../settings/config"

export type ScreenHeight = "TINY" | "SHORT" | "MEDIUM" | "TALL"
export type GameLayout = "ROW" | "COL"

export type ScreenInference = {
  readonly screenHeight: ScreenHeight
  readonly gameLayout: GameLayout
  readonly numberOfRows: number
}

export const ScreenInferenceContext =
  React.createContext<ScreenInference>({
    screenHeight: "SHORT",
    numberOfRows: 2,
    gameLayout: "COL",
  })

export interface ScreenProps {
  readonly children: React.ReactNode
}

export const ProvideScreenInference: React.FC<ScreenProps> = ({
  children,
}) => {
  const {
    config: {mode, inZoomMode},
  } = React.useContext(ConfigContext)
  const isTinyH = useMediaQuery(json2mq({maxHeight: 700}))
  const isShortH = useMediaQuery(json2mq({maxHeight: 900}))
  const isMediumH = useMediaQuery(json2mq({maxHeight: 1200}))
  const isTinyW = useMediaQuery(json2mq({maxWidth: 400}))
  const isSmallW = useMediaQuery(json2mq({maxWidth: 600}))
  const isMediumW = useMediaQuery(json2mq({maxHeight: 800}))
  const isWideW = !isTinyW && !isSmallW && !isMediumW
  const value = React.useMemo((): ScreenInference => {
    const tinyScreenRows = mode === "two" ? 3 : 2
    return {
      screenHeight: isTinyH
        ? "TINY"
        : isShortH
        ? "SHORT"
        : isMediumH
        ? "MEDIUM"
        : "TALL",
      numberOfRows: inZoomMode
        ? 6
        : isTinyW || isSmallW
        ? tinyScreenRows
        : isTinyH && !isWideW
        ? tinyScreenRows
        : 6,
      gameLayout: isTinyW || isSmallW || inZoomMode ? "COL" : "ROW",
    }
  }, [
    mode,
    isTinyH,
    isShortH,
    isMediumH,
    isTinyW,
    isSmallW,
    isWideW,
    inZoomMode,
  ])

  return (
    <ScreenInferenceContext.Provider value={value}>
      {children}
    </ScreenInferenceContext.Provider>
  )
}
