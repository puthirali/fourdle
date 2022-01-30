import * as React from "react"
import CssBaseline from "@mui/material/CssBaseline"
import {createTheme, ThemeProvider} from "@mui/material/styles"
import {ConfigContext} from "../settings/config"

export interface ThemeProps {
  readonly children: React.ReactNode
}

export const ProvideTheme: React.FC<ThemeProps> = ({children}) => {
  const {config} = React.useContext(ConfigContext)
  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: config.inDarkMode ? "light" : "dark",
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
    [config],
  )

  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </>
  )
}
