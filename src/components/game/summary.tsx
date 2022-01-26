import * as React from "react"
import {pipe} from "@effect-ts/core"
import Button from "@mui/material/Button"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import {TransitionProps} from "@mui/material/transitions"
import Typography from "@mui/material/Typography"
import Zoom from "@mui/material/Zoom"
import {CopyToClipboard} from "react-copy-to-clipboard"
import useLocalStorageState from "use-local-storage-state"
import {ConfigContext, withMode} from "../../context/settings/config"
import {useModal} from "../../context/window/modals"
import {BoardNumber, DayResults, titles} from "../../models/state"
import {
  emptyStreak,
  incStreak,
  modesRemaining,
  Streak,
} from "../../models/streak"
import {ComplexListItem} from "./complex-list-item"
import {Stats} from "./stats"

export interface SummaryProps {
  readonly results: DayResults
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
  results,
}: SummaryProps) => {
  const {config, setConfig} = React.useContext(ConfigContext)
  const result = React.useMemo(
    () => results[config.mode],
    [config.mode, results],
  )

  const [open, setOpen] = useModal("SUMMARY")
  const [share, setShare] = React.useState(result.shareScore)
  const [copied, setCopied] = React.useState(false)
  const [streak, setStreak] = useLocalStorageState<Streak>(
    "streak",
    emptyStreak(),
  )
  React.useEffect(() => {
    if (
      result.isSolved &&
      streak.record[result.mode].lastPuzzle !== result.puzzleNumber
    ) {
      pipe(streak, incStreak(result), setStreak)
      setShare(result.shareScore)
      setOpen(true)
    }
  }, [result, setOpen, setStreak, streak])
  const handleClose = () => {
    setOpen(false)
  }

  const handleShare = async () => {
    try {
      navigator.share({
        title: result.shareTitle,
        text: result.shareScore,
      })
    } catch {
      setShare(result.shareScore)
      setCopied(true)
    }
  }

  const handleCopy = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 10000)
  }

  const playsRemaining = modesRemaining(streak, result.puzzleNumber)

  const handlePlay = (md: BoardNumber) => {
    pipe(config, withMode(md), setConfig)
    setOpen(false)
  }

  return (
    <Dialog
      TransitionComponent={Transition}
      keepMounted
      open={open}
      onClose={handleClose}
      sx={{minWidth: "375px"}}
    >
      <DialogContent
        dividers
        sx={{padding: {xs: "0", md: "1rem", lg: "1.5rem"}}}
      >
        <Stats results={results} streak={streak} />
        {playsRemaining.length > 0 && (
          <List>
            <ComplexListItem label="Play">
              <Stack
                direction="row"
                spacing={2}
                justifyContent="end"
                sx={{marginBottom: "1rem"}}
              >
                {playsRemaining.map((n) => (
                  <Button
                    key={`play-button-${n}`}
                    size="small"
                    variant="contained"
                    onClick={() => handlePlay(n)}
                  >
                    {titles[n]}
                  </Button>
                ))}
              </Stack>
            </ComplexListItem>
            <Divider component="li" />
          </List>
        )}
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
