import * as React from "react"
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  Typography,
} from "@mui/material"
import {TransitionProps} from "@mui/material/transitions"
import Zoom from "@mui/material/Zoom"
import {CopyToClipboard} from "react-copy-to-clipboard"
import {Result} from "../../models/state"

export interface SummaryProps {
  readonly result: Result
  readonly isOpen: boolean
  readonly onClose: () => void
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
  isOpen,
  onClose,
}: SummaryProps) => {
  const [open, setOpen] = React.useState(isOpen)
  const [share, setShare] = React.useState(result.display)
  const [copied, setCopied] = React.useState(false)
  React.useEffect(() => {
    setOpen(isOpen)
    setShare(result.display)
  }, [isOpen, result])
  const handleClose = () => {
    setOpen(false)
    onClose()
  }

  const handleShare = () => {
    setShare(result.display)
    setCopied(true)
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
        <Stack
          sx={{textAlign: "center", lineHeight: "2rem"}}
          direction="column"
          spacing="4"
        >
          <Typography variant="body1">{`Time: ${result.time}`}</Typography>
          <Typography variant="body1">{`Maximum Guess: ${result.maxTrials}`}</Typography>
        </Stack>
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
