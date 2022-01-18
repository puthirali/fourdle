import * as React from "react"
import Stack from "@mui/material/Stack"
// import TransitionGroup from "react-transition-group/TransitionGroup"
import {StateContext} from "../../context/state"
import {ScreenInferenceContext} from "../../context/system/screen"
import {result} from "../../models/state"
import {Board} from "./board"
import {GameSummary} from "./summary"

interface GameProps {
  readonly showSummary: boolean
  readonly onCloseSummary: () => void
}

const Game: React.FC<GameProps> = ({
  showSummary,
  onCloseSummary,
}: GameProps) => {
  const [userClosedSummary, setUserClosedSummary] =
    React.useState(false)
  const {gameLayout} = React.useContext(ScreenInferenceContext)
  const {state} = React.useContext(StateContext)
  const dir = React.useMemo(
    () => (gameLayout === "COL" ? "column" : "row"),
    [gameLayout],
  )
  const onSummaryClosed = React.useMemo(
    () => () => {
      setUserClosedSummary(true)
      onCloseSummary()
    },
    [onCloseSummary],
  )
  React.useEffect(
    () => setUserClosedSummary(showSummary ? false : userClosedSummary),
    [showSummary, userClosedSummary],
  )
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
        <Stack
          className="boards"
          direction={dir}
          alignContent="space-evenly"
          justifyContent="space-evenly"
          flexWrap="wrap"
          flexGrow="1"
        >
          {state.boards.map((bs, idx) => (
            <Board key={`board-${idx}`} board={bs.board} index={idx} />
          ))}
        </Stack>
      </Stack>
      <GameSummary
        onClose={onSummaryClosed}
        result={result(state)}
        isOpen={state.isDone && !userClosedSummary}
      />
    </>
  )
}

export default Game
