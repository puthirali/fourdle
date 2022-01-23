import * as React from "react"
import useMediaQuery from "@mui/material/useMediaQuery"
import useLocalStorageState from "use-local-storage-state"
import {BoardNumber} from "../../models/state"

export interface IConfig {
  readonly mode: BoardNumber
  readonly currentZoom: number
  readonly inZoomMode: boolean
  readonly isAccessible: boolean
  readonly inDarkMode: boolean
}

export function withMode(md: BoardNumber) {
  return (cfg: IConfig) => ({
    ...cfg,
    mode: md,
    currentZoom: md !== cfg.mode ? 0 : cfg.currentZoom,
  })
}

export function numBoards(mode: BoardNumber): number {
  return mode === "four" ? 4 : mode === "three" ? 3 : 2
}

export function withZoom(inZoomMode: boolean, current?: number) {
  return (cfg: IConfig) => ({
    ...cfg,
    inZoomMode,
    currentZoom: current && current < numBoards(cfg.mode) ? current : 0,
  })
}

export function withAccessibility(makeAccessible: boolean) {
  return (cfg: IConfig) => ({
    ...cfg,
    isAccessible: makeAccessible,
  })
}

export function withDarkMode(darkMode: boolean) {
  return (cfg: IConfig) => ({
    ...cfg,
    inDarkMode: darkMode,
  })
}

export interface IConfigContext {
  readonly config: IConfig
  readonly setConfig: (cfg: IConfig) => void
}

const emptyConfig = (prefersDarkMode: boolean): IConfig => {
  return {
    mode: "four",
    inZoomMode: false,
    inDarkMode: prefersDarkMode,
    currentZoom: 0,
    isAccessible: false,
  }
}

export const ConfigContext = React.createContext<IConfigContext>({
  config: emptyConfig(true),
  setConfig: () => {
    // template
  },
})

export interface ConfigProps {
  readonly children: React.ReactNode
}

export const ProvideConfig: React.FC<ConfigProps> = ({children}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [config, setConfig] = useLocalStorageState(
    "config",
    emptyConfig(prefersDarkMode),
  )
  const configContext: IConfigContext = React.useMemo(
    () => ({
      config,
      setConfig,
    }),
    [config, setConfig],
  )
  return (
    <ConfigContext.Provider value={configContext}>
      {children}
    </ConfigContext.Provider>
  )
}
