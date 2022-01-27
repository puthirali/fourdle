import * as React from "react"
import CloseIcon from "@mui/icons-material/Close"
import {ListItemSecondaryAction, ListSubheader} from "@mui/material"
import AppBar from "@mui/material/AppBar"
import Dialog from "@mui/material/Dialog"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemText from "@mui/material/ListItemText"
import Slide from "@mui/material/Slide"
import Toolbar from "@mui/material/Toolbar"
import {TransitionProps} from "@mui/material/transitions"
import Typography from "@mui/material/Typography"
import {useModal} from "../../../context/window/modals"
import BoardSelect from "../../chrome/board-select"
import ColorSelect from "../../chrome/color-select"

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

export default function Settings() {
  const [isOpen, setIsOpen] = useModal("SETTINGS")
  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog
      fullScreen
      open={isOpen}
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
            Settings
          </Typography>
        </Toolbar>
      </AppBar>
      <List dense>
        <ListItem>
          <ListItemText
            primary="Letter Colors"
            secondary="Accessibility"
          />
          <ListItemSecondaryAction>
            <ColorSelect />
          </ListItemSecondaryAction>
        </ListItem>
        <Divider />
        <ListItem>
          <ListItemText
            primary="Game Mode"
            secondary="Number of words to solve at a time?"
            secondaryTypographyProps={{
              width: "60%",
              fontSize: "1.2rem",
            }}
          />
          <ListItemSecondaryAction>
            <BoardSelect />
          </ListItemSecondaryAction>
        </ListItem>
        <ListSubheader>Worldle</ListSubheader>
        <ListItem
          button
          component="a"
          href="https://www.powerlanguage.co.uk/wordle/"
        >
          <ListItemText>Play today&apos;s wordle</ListItemText>
        </ListItem>
        <Divider />
        <ListItem
          button
          component="a"
          href="https://qntm.org/files/wordle/index.html"
        >
          <ListItemText>[Adversarial] Play Absurdle</ListItemText>
        </ListItem>
        <Divider />
        <ListItem button component="a" href="https://nerdlegame.com/">
          <ListItemText>[Math] Play Nerdle!</ListItemText>
        </ListItem>
        <ListItem
          button
          component="a"
          href="https://mathszone.co.uk/resources/grid/ooodle/"
        >
          <ListItemText>[Math] Play Oodle!</ListItemText>
        </ListItem>
        <ListItem button component="a" href="https://hellowordl.net">
          <ListItemText>
            [Upto 11 letter words] Play Hello Wordl!
          </ListItemText>
        </ListItem>
      </List>
    </Dialog>
  )
}
