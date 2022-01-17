import * as React from "react"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import {IconButton, useTheme} from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import {ColorModeContext} from "../../context/theme"

export default function AppHeader() {
  const theme = useTheme()
  const colorMode = React.useContext(ColorModeContext)
  return (
    <Box sx={{flexGrow: 1, width: "100%"}}>
      <AppBar position="static">
        <Toolbar>
          <Box sx={{flexGrow: 1}} />
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{display: "block", textAlign: "center"}}
          >
            4dle
          </Typography>
          <Box sx={{flexGrow: 1}} />
          <Box>
            <IconButton
              sx={{ml: 1}}
              onClick={colorMode.toggleColorMode}
              color="inherit"
            >
              {theme.palette.mode === "dark" ? (
                <Brightness7Icon />
              ) : (
                <Brightness4Icon />
              )}
            </IconButton>
          </Box>
          <Box />
        </Toolbar>
      </AppBar>
    </Box>
  )
}
