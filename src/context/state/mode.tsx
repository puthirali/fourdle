import * as React from "react"
import {BoardNumber} from "../../models/state"

export interface IModeContext {
  readonly mode: BoardNumber
  readonly setMode: (mode: BoardNumber) => void
}

export const ModeContext = React.createContext<IModeContext>({
  mode: "four",
  setMode: () => {
    // template
  },
})

export interface ModeProps {
  readonly children: React.ReactNode
}

export const ProvideMode: React.FC<ModeProps> = ({children}) => {
  const [mode, setMode] = React.useState<BoardNumber>("four")
  const modeContext = React.useMemo(
    () => ({mode, setMode}),
    [mode, setMode],
  )
  return (
    <ModeContext.Provider value={modeContext}>
      {children}
    </ModeContext.Provider>
  )
}
