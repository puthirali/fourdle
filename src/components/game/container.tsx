import * as React from "react"
import Box from "@mui/material/Box"
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
    <Box
      className="game"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        flexGrow: 1,
        maxWidth: "1800px",
        width: "100%",
      }}
    >
      <Box
        className="boards"
        sx={{
          display: "flex",
          flexDirection: dir,
          alignContent: "space-evenly",
          justifyContent: "space-evenly",
          flexWrap: "wrap",
          flexGrow: 1,
        }}
      >
        {state.boards.map((bs, idx) => (
          <Board key={`board-${idx}`} board={bs.board} index={idx} />
        ))}
      </Box>
    </Box>
  )
}

export default Game
