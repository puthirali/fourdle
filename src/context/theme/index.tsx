import * as React from "react"
import type {PaletteMode} from "@mui/material"
import {CssBaseline, useMediaQuery} from "@mui/material"
import {createTheme, ThemeProvider} from "@mui/material/styles"

export const ColorModeContext = React.createContext({
  makeAccessible: false,
  toggleAccessibility: () => {
    // template
  },
  toggleColorMode: () => {
    // template
  },
})

export interface ThemeProps {
  readonly children: React.ReactNode
}

export const ProvideTheme: React.FC<ThemeProps> = ({children}) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)")
  const [mode, setMode] = React.useState<PaletteMode>(
    prefersDarkMode ? "light" : "dark",
  )
  const [makeAccessible, setMakeAccessible] = React.useState(false)
  const colorMode = React.useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
      },
      toggleAccessibility: () => {
        setMakeAccessible((prev) => !prev)
      },
      makeAccessible,
    }),
    [makeAccessible],
  )

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#ce93d8",
          },
          secondary: {
            main: "#81d4fa",
          },
          info: {
            main: "#b388ff",
          },
        },
        typography: {
          htmlFontSize: 10,
          fontFamily: '"Montserrat", "Helvetica", "Arial", sans-serif',
        },
      }),
    [mode],
  )

  return (
    <ColorModeContext.Provider value={colorMode}>
      <CssBaseline />
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  )
}
