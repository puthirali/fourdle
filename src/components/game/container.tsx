import * as React from "react"
import Stack from "@mui/material/Stack"
import {ConfigContext} from "../../context/settings/config"
import {StateContext} from "../../context/state"
import {useModal} from "../../context/window/modals"
import {BoardNumber, result} from "../../models/state"
import StackBoard from "./stack"
import {GameSummary} from "./summary"
import ZoomGame from "./zoom"

type SummaryPop = {readonly [k in BoardNumber]: boolean}
const emptySummaryPop = {two: false, three: false, four: false}

const Game: React.FC = () => {
  const {
    config: {inZoomMode, mode},
  } = React.useContext(ConfigContext)
  const {state} = React.useContext(StateContext)
  const [summaryPopped, setSummaryPopped] =
    React.useState<SummaryPop>(emptySummaryPop)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSummaryOpen] = useModal("SUMMARY")
  React.useEffect(() => {
    if (state.isDone && !summaryPopped[mode]) {
      setSummaryPopped({...summaryPopped, [mode]: true})
      setSummaryOpen(true)
    }
  }, [mode, setSummaryOpen, state.isDone, summaryPopped])
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
