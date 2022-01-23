import * as React from "react"
import {pipe} from "@effect-ts/core"
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
  Chip,
  Stack,
} from "@mui/material"
import {TransitionProps} from "@mui/material/transitions"
import Zoom from "@mui/material/Zoom"
import {CopyToClipboard} from "react-copy-to-clipboard"
import useLocalStorageState from "use-local-storage-state"
import {useModal} from "../../context/window/modals"
import {Result} from "../../models/state"

export interface SummaryProps {
  readonly result: Result
}

export interface Streak {
  readonly totalDays: number
  readonly currentStreak: number
  readonly longestStreak: number
  readonly longestGap: number
  readonly lastPuzzle: number
}

function incStreak(result: Result) {
  return (streak: Streak): Streak => {
    if (result.puzzleNumber !== streak.lastPuzzle) {
      const gap =
        streak.lastPuzzle === 0
          ? 0
          : result.puzzleNumber - streak.lastPuzzle
      const streakContinues =
        streak.lastPuzzle === result.puzzleNumber - 1

      const currentStreak = streakContinues
        ? streak.currentStreak + 1
        : 1
      const longestStreak = Math.max(
        streak.longestStreak,
        currentStreak,
      )
      const longestGap = Math.max(streak.longestGap, gap)

      return {
        totalDays: streak.totalDays + 1,
        longestStreak,
        currentStreak,
        longestGap,
        lastPuzzle: result.puzzleNumber,
      }
    }
    return streak
  }
}

const emptyStreak = () => ({
  totalDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  longestGap: 0,
  lastPuzzle: 0,
})

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
  const [share, setShare] = React.useState(result.shareScore)
  const [copied, setCopied] = React.useState(false)
  const [streak, setStreak] = useLocalStorageState(
    `streak-${result.mode}`,
    emptyStreak(),
  )
  React.useEffect(() => {
    setShare(result.shareScore)
    if (result.isSolved && streak.lastPuzzle !== result.puzzleNumber) {
      pipe(streak, incStreak(result), setStreak)
    }
  }, [result, setStreak, streak])
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
            <ListItemAvatar>
              <Avatar>
                <AttemptIcon />
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary="Stats"
              secondary={
                <Stack component="span" direction="row">
                  <Chip
                    component="span"
                    label={`Total: ${streak.totalDays}`}
                  />
                  <Chip
                    component="span"
                    label={`Streak: ${streak.longestStreak}`}
                  />
                </Stack>
              }
            />
          </ListItem>
          <Divider variant="inset" component="li" />
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
