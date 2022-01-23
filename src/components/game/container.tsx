import * as React from "react"
import Stack from "@mui/material/Stack"
import {ConfigContext} from "../../context/settings/config"
import {StateContext} from "../../context/state"
import {useModal} from "../../context/window/modals"
import {result} from "../../models/state"
import StackBoard from "./stack"
import {GameSummary} from "./summary"
import ZoomGame from "./zoom"

const Game: React.FC = () => {
  const {
    config: {inZoomMode, mode},
  } = React.useContext(ConfigContext)
  const {state} = React.useContext(StateContext)
  const [summaryPopped, setSummaryPopped] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSummaryOpen] = useModal("SUMMARY")
  React.useEffect(() => {
    if (state.isDone && !summaryPopped) {
      setSummaryPopped(true)
      setSummaryOpen(true)
    }
  }, [setSummaryOpen, state.isDone, summaryPopped])
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
      <GameSummary result={result(state, mode)} />
    </>
  )
}

export default Game
