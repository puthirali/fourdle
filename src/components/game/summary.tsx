import * as React from "react"
import ClockIcon from "@mui/icons-material/HourglassBottom"
import AttemptIcon from "@mui/icons-material/TryRounded"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  DialogContentText,
  Box,
} from "@mui/material"
import {TransitionProps} from "@mui/material/transitions"
import Zoom from "@mui/material/Zoom"
import {CopyToClipboard} from "react-copy-to-clipboard"
import {useModal} from "../../context/window/modals"
import {Result} from "../../models/state"

export interface SummaryProps {
  readonly result: Result
}

const Transition = React.forwardRef(function Transition(
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>
  },
  ref: React.Ref<unknown>,
) {
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Zoom ref={ref} {...props} />
})

export const GameSummary: React.FC<SummaryProps> = ({
  result,
}: SummaryProps) => {
  const [open, setOpen] = useModal("SUMMARY")
  const [share, setShare] = React.useState(result.display)
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    setShare(result.display)
  }, [result])
  const handleClose = () => {
    setOpen(false)
  }

  const handleShare = async () => {
    try {
      navigator.share({
        title: result.shareTitle,
        text: result.display,
      })
    } catch {
      setShare(result.display)
      setCopied(true)
    }
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 10000)
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      keepMounted
      open={open}
      onClose={handleClose}
    >
      <DialogTitle>{result.message}</DialogTitle>
      <DialogContent>
        <DialogContentText fontWeight="bold">{`Board #${result.mode}`}</DialogContentText>
        <List
          sx={{
            width: "100%",
            bgcolor: "background.paper",
          }}
        >
          <ListItem>
            <Box sx={{marginLeft: "-1rem"}}>
              <pre>{result.display}</pre>
            </Box>
          </ListItem>
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <AttemptIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Guesses"
              secondary={`Total: ${result.trialCount} Max: ${result.maxTrials} Min: ${result.minTrials}`}
            />
          </ListItem>
          <Divider variant="inset" component="li" />
          <ListItem>
            <ListItemAvatar>
              <Avatar>
                <ClockIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="Time" secondary={result.time} />
          </ListItem>
        </List>
        <DialogActions>
          {copied && <Typography variant="body2">Copied!</Typography>}
          <CopyToClipboard text={share} onCopy={handleCopy}>
            <Button autoFocus onClick={handleShare}>
              Share
            </Button>
          </CopyToClipboard>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
