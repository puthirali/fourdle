import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import {colors} from "@mui/material"
import Box from "@mui/system/Box"
import {ScreenInferenceContext} from "../../context/system/screen"
import {Board as BoardModel, lastEntered} from "../../models/entry"
import {Entry} from "./entry"

export interface BoardProps {
  readonly board: BoardModel
  readonly index: number
}

export const Board: React.FC<BoardProps> = ({board}: BoardProps) => {
  const {screenHeight, numberOfRows} = React.useContext(
    ScreenInferenceContext,
  )
  const mg =
    screenHeight === "TINY"
      ? "2px"
      : screenHeight === "SHORT"
      ? "6px"
      : screenHeight === "MEDIUM"
      ? "12px"
      : "16x"
  return (
    <Box
      className="board"
      sx={{
        display: "flex",
        alignContent: "center",
        flexDirection: "column",
        margin: mg,
        flexGrow: 0,
      }}
    >
      {pipe(board, lastEntered(numberOfRows)).map(([e, index]) => (
        <Box
          key={`board-entry-${index}`}
          sx={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <Box
            sx={{
              color: colors.grey[800],
              width: "2em",
              textAlign: "right",
            }}
          >{`${index + 1}`}</Box>
          <Entry
            entry={e}
            isSolution={board.isSolved && board.currentIndex === index}
          />
        </Box>
      ))}
    </Box>
  )
}
