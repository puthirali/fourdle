import * as React from "react"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import SummaryIcon from "@mui/icons-material/SummarizeOutlined"
import {IconButton, useTheme} from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Box from "@mui/material/Box"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import MenuItem from "@mui/material/MenuItem"
import Select, {SelectChangeEvent} from "@mui/material/Select"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import {StateContext} from "../../context/state"
import {ColorModeContext} from "../../context/theme"
import {BoardNumber} from "../../models/state"

interface AppHeaderProps {
  readonly showSummary: () => void
}

export default function AppHeader({showSummary}: AppHeaderProps) {
  const theme = useTheme()
  const colorMode = React.useContext(ColorModeContext)
  const {mode, setMode} = React.useContext(StateContext)
  const handleChange = (event: SelectChangeEvent) => {
    setMode(event.target.value as BoardNumber)
  }

  return (
    <Box sx={{flexGrow: 1, width: "100%"}}>
      <AppBar position="static">
        <Toolbar>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{display: "block", textAlign: "center"}}
          >
            4dle
          </Typography>
          <Box sx={{flexGrow: 1}} />
          <FormControl sx={{m: 1, minWidth: 120}}>
            <InputLabel id="board-mode-select-l">Words</InputLabel>
            <Select
              labelId="board-mode-select-l"
              id="board-mode-select"
              value={mode}
              label="Words"
              onChange={handleChange}
            >
              <MenuItem value="one">One</MenuItem>
              <MenuItem value="two">Two</MenuItem>
              <MenuItem value="three">Three</MenuItem>
              <MenuItem value="four">Four</MenuItem>
            </Select>
          </FormControl>
          <Box>
            <IconButton
              sx={{ml: 1}}
              onClick={() => showSummary()}
              color="inherit"
            >
              <SummaryIcon />
            </IconButton>
          </Box>
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
