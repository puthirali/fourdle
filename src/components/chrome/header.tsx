import * as React from "react"
import HelpIcon from "@mui/icons-material/HelpOutlined"
import SettingsIcon from "@mui/icons-material/SettingsOutlined"
import SummaryIcon from "@mui/icons-material/SummarizeOutlined"
import {IconButton} from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import {ModalContext} from "../../context/window/modals"
import ZoomButton from "./zoom-button"

export default function AppHeader() {
  const {setModalIsOpen} = React.useContext(ModalContext)
  return (
    <Box sx={{width: "100%"}}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            &nbsp;4dle
          </Typography>
          <Box sx={{flexGrow: 1}} />
          <ZoomButton />
          <Box>
            <IconButton
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
