import * as React from "react"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Footer from "./components/chrome/footer"
import AppHeader from "./components/chrome/header"
import Game from "./components/game/container"
import KeyboardEventHandler from "./components/game/keyboard"
import Help from "./components/info/help"
import Settings from "./components/info/settings"
import {ProvideConfig} from "./context/settings/config"
import {ProvideState} from "./context/state"
import {ProvideScreenInference} from "./context/system/screen"
import {ProvideTheme} from "./context/theme"
import {ProvideAlerts} from "./context/window/alerts"
import {ProvideModals} from "./context/window/modals"

function App() {
  return (
    <ProvideConfig>
      <ProvideState>
        <ProvideScreenInference>
          <ProvideTheme>
            <ProvideModals>
              <ProvideAlerts>
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
                    <AppHeader />
                    <Game />
                    <Footer />
                  </Stack>
                </Paper>
                <Settings />
                <Help />
              </ProvideAlerts>
            </ProvideModals>
          </ProvideTheme>
        </ProvideScreenInference>
      </ProvideState>
    </ProvideConfig>
  )
}

export default App
