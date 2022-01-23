import * as React from "react"
import CloseIcon from "@mui/icons-material/Close"
import AppBar from "@mui/material/AppBar"
import Dialog from "@mui/material/Dialog"
import IconButton from "@mui/material/IconButton"
import Slide from "@mui/material/Slide"
import Toolbar from "@mui/material/Toolbar"
import {TransitionProps} from "@mui/material/transitions"
import Typography from "@mui/material/Typography"
import {useModal} from "../../../context/window/modals"
import HelpText from "./text"

const Transition = React.forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  props: TransitionProps & {
    children: React.ReactElement
  },
  ref: React.Ref<unknown>,
) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Slide direction="up" ref={ref} {...props} />
})

export default function Help() {
  const [open, setOpen] = useModal("HELP")
  const handleClose = () => {
    setOpen(false)
  }

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{position: "relative"}}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography
            sx={{ml: 2, flex: 1}}
            variant="h6"
            component="div"
          >
            About / Help
          </Typography>
        </Toolbar>
      </AppBar>
      <HelpText />
    </Dialog>
  )
}
