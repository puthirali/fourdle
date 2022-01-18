import * as React from "react"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import AppHeader from "./components/chrome/header"
import Game from "./components/game/container"
import KeyboardEventHandler from "./components/game/keyboard"
import {Keyboard} from "./components/input/keyboard"
import {ProvideState} from "./context/state"
import {ProvideMode} from "./context/state/mode"
import {ProvideScreenInference} from "./context/system/screen"
import {ProvideTheme} from "./context/theme"

function App() {
  const [showSummary, setShowSummary] = React.useState(false)
  const onCloseSummary = () => setShowSummary(false)
  return (
    <ProvideMode>
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
              <Stack
                direction="column"
                className="4dle"
                flexGrow={1}
                alignItems="center"
              >
                <AppHeader showSummary={() => setShowSummary(true)} />
                <Game
                  showSummary={showSummary}
                  onCloseSummary={onCloseSummary}
                />
                <Keyboard />
              </Stack>
            </Paper>
          </ProvideTheme>
        </ProvideScreenInference>
      </ProvideState>
    </ProvideMode>
  )
}

export default App
