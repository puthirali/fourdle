/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as React from "react"
import HelpIcon from "@mui/icons-material/HelpOutlined"
import SettingsIcon from "@mui/icons-material/SettingsOutlined"
import SummaryIcon from "@mui/icons-material/SummarizeOutlined"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import IconButton from "@mui/material/IconButton"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import {StateContext} from "../../context/state"
import {ModalContext} from "../../context/window/modals"
import ZoomButton from "./zoom-button"

export default function AppHeader() {
  const {setModalIsOpen} = React.useContext(ModalContext)
  const {state} = React.useContext(StateContext)
  return (
    <Box sx={{width: "100%"}}>
      <AppBar position="static">
        <Toolbar variant="dense">
          <Typography variant="h6" noWrap component="div">
            &nbsp;4dle - #{state.puzzleNumber}
          </Typography>
          <Box sx={{flexGrow: 1}} />
          <ZoomButton />
          <Box>
            <IconButton
              onFocus={(e) => e.target.blur()}
              size="small"
              sx={{ml: 1}}
              onClick={() => setModalIsOpen("HELP", true)}
              color="inherit"
            >
              <HelpIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <IconButton
              onFocus={(e) => e.target.blur()}
              size="small"
              sx={{ml: 1}}
              onClick={() => setModalIsOpen("SUMMARY", true)}
              color="inherit"
            >
              <SummaryIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box>
            <IconButton
              onFocus={(e) => e.target.blur()}
              size="small"
              sx={{ml: 1}}
              onClick={() => setModalIsOpen("SETTINGS", true)}
              color="inherit"
            >
              <SettingsIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box />
        </Toolbar>
      </AppBar>
    </Box>
  )
}
