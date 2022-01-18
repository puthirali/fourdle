import * as React from "react"
import Stack from "@mui/material/Stack"
import {StateContext} from "../../context/state"
import {ScreenInferenceContext} from "../../context/system/screen"
import {Board} from "./board"

const Game: React.FC = () => {
  const {gameLayout} = React.useContext(ScreenInferenceContext)
  const {state} = React.useContext(StateContext)
  const dir = React.useMemo(
    () => (gameLayout === "COL" ? "column" : "row"),
    [gameLayout],
  )
  return (
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
  )
}

export default Game
