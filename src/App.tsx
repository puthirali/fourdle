import * as React from "react"
import Box from "@mui/material/Box"
import Paper from "@mui/material/Paper"
import AppHeader from "./components/chrome/header"
import Game from "./components/game/container"
import KeyboardEventHandler from "./components/game/keyboard"
import {Keyboard} from "./components/input/keyboard"
import {ProvideState} from "./context/state"
import {ProvideScreenInference} from "./context/system/screen"
import {ProvideTheme} from "./context/theme"

function App() {
  return (
    <ProvideState>
      <ProvideScreenInference>
        <ProvideTheme>
          <KeyboardEventHandler />
          <Paper
            sx={{
              height: "100vh",
              maxHeight: "-webkit-fill-available",
              display: "flex",
            }}
          >
            <Box
              className="4dle"
              sx={{
                display: "flex",
                flexDirection: "column",
                flexGrow: 1,
                alignItems: "center",
              }}
            >
              <AppHeader />
              <Game />
              <Keyboard />
            </Box>
          </Paper>
        </ProvideTheme>
      </ProvideScreenInference>
    </ProvideState>
  )
}

export default App
