import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import {colors} from "@mui/material"
import Box from "@mui/material/Box"
import Collapse from "@mui/material/Collapse"
import Stack from "@mui/material/Stack"
import {TransitionGroup} from "react-transition-group"
import {ScreenInferenceContext} from "../../context/system/screen"
import {
  Board as BoardModel,
  lastEntered,
  uniq,
} from "../../models/entry"
import {Entry} from "./entry"

export interface BoardProps {
  readonly board: BoardModel
  readonly index: number
}

export const Board: React.FC<BoardProps> = ({board}: BoardProps) => {
  const {numberOfRows} = React.useContext(ScreenInferenceContext)
  return (
    <Stack
      className="board"
      alignContent="space-evenly"
      justifyContent="space-evenly"
      direction="column"
      flexGrow="0"
    >
      <TransitionGroup>
        {pipe(board, lastEntered(numberOfRows)).map(([e, index]) => (
          <Collapse key={`board-${uniq(board)}-entry-${index}`}>
            <Stack direction="row">
              <Box
                sx={{
                  color: colors.grey[800],
                  width: "2em",
                  textAlign: "right",
                }}
              >{`${index + 1}`}</Box>
              <Entry
                entry={e}
                isSolution={
                  board.isSolved && board.currentIndex === index
                }
              />
            </Stack>
          </Collapse>
        ))}
      </TransitionGroup>
    </Stack>
  )
}
