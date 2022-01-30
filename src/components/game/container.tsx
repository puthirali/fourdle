import * as React from "react"
import Stack from "@mui/material/Stack"
import {ConfigContext} from "../../context/settings/config"
import {StateContext} from "../../context/state"
import StackBoard from "./stack"
import {GameSummary} from "./summary"
import ZoomGame from "./zoom"

const Game: React.FC = () => {
  const {
    config: {inZoomMode},
  } = React.useContext(ConfigContext)
  const {results} = React.useContext(StateContext)
  return (
    <>
      <Stack
        className="game"
        direction="column"
        alignContent="center"
        flexGrow="1"
        sx={{
          maxWidth: "1800px",
          width: "100%",
        }}
      >
        {inZoomMode ? <ZoomGame /> : <StackBoard />}
      </Stack>
      <GameSummary results={results} />
    </>
  )
}

export default Game
