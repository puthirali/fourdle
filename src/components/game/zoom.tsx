/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import {ConfigContext, withZoom} from "../../context/settings/config"
import {StateContext} from "../../context/state"
import {Board as BoardModel} from "../../models/entry"
import {Board} from "./board"

interface ZoomBoardProps {
  readonly board: BoardModel
  readonly index: number
  readonly current: number
}

function ZoomBoard(props: ZoomBoardProps) {
  const {board, current, index} = props

  return (
    <Box
      role="tabpanel"
      hidden={current !== index}
      id={`zoom-board-${index}`}
      aria-labelledby={`zoom-board-${index}`}
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      {current === index && <Board board={board} index={index} />}
    </Box>
  )
}

function a11yProps(index: number) {
  return {
    id: `zoom-board-${index}`,
    "aria-controls": `zoom-board-${index}`,
  }
}

export default function ZoomGame() {
  const {config, setConfig} = React.useContext(ConfigContext)
  const {state} = React.useContext(StateContext)

  const handleChange = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    pipe(config, withZoom(config.inZoomMode, newValue), setConfig)
  }

  return (
    <Box sx={{width: "100%"}}>
      <Box
        sx={{
          marginBottom: "2rem",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={config.currentZoom}
          onChange={handleChange}
          aria-label="zoom boards"
          centered
        >
          {state.boards.map((_, idx) => (
            <Tab label={`#${idx + 1}`} {...a11yProps(idx)} />
          ))}
        </Tabs>
      </Box>
      {state.boards.map((bs, idx) => (
        <ZoomBoard
          key={`zb-${idx}`}
          current={config.currentZoom}
          index={idx}
          board={bs.board}
        />
      ))}
    </Box>
  )
}
