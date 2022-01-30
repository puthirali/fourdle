import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import Box from "@mui/material/Box"
import {ConfigContext} from "../../context/settings/config"
import {StateContext, useStreak} from "../../context/state"
import {useAlert} from "../../context/window/alerts"
import {useModal} from "../../context/window/modals"
import {controlKey} from "../../models/key"
import {incStreak} from "../../models/streak"
import {Keyboard} from "../input/keyboard"
import {AutoHidePopper} from "./auto-popper"
import {PopMessage} from "./pop-message"

const Footer: React.FC = () => {
  const [isErrorAlertOpen, setIsErrorAlertOpen] = useAlert("BAD_ENTRY")
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useAlert("DONE")
  const keyboardRef = React.useRef<HTMLElement>()

  const {onKeyPress} = React.useContext(StateContext)
  const [, setSummaryOpen] = useModal("SUMMARY")

  const {config} = React.useContext(ConfigContext)
  const {results} = React.useContext(StateContext)
  const result = React.useMemo(
    () => results[config.mode],
    [config.mode, results],
  )

  const [, setShare] = React.useState(result.shareScore)
  const [streak, setStreak] = useStreak()

  const handleErrorClose = () => {
    onKeyPress(controlKey("BACKSPACE"))
    setIsErrorAlertOpen(false)
  }

  const handleSuccessClose = () => {
    setIsSuccessAlertOpen(false)
    setSummaryOpen(true)
  }

  React.useEffect(() => {
    if (result.hasInvalidEntries) {
      setIsErrorAlertOpen(true)
    }
  }, [result, setIsErrorAlertOpen])

  React.useEffect(() => {
    if (
      result.isSolved &&
      streak.record[result.mode].lastPuzzle !== result.puzzleNumber
    ) {
      pipe(streak, incStreak(result), setStreak)
      setShare(result.shareScore)
      setIsSuccessAlertOpen(true)
    }
  }, [result, setIsSuccessAlertOpen, setStreak, streak])

  return (
    <>
      <AutoHidePopper
        onClose={handleErrorClose}
        id="error-message"
        isOpen={isErrorAlertOpen}
        anchorEl={keyboardRef.current}
        duration={1200}
      >
        <PopMessage message="Not in word list!" />
      </AutoHidePopper>
      <AutoHidePopper
        onClose={handleSuccessClose}
        id="success-message"
        isOpen={isSuccessAlertOpen}
        anchorEl={keyboardRef.current}
        duration={2000}
      >
        <PopMessage message={result.message} />
      </AutoHidePopper>
      <Box ref={keyboardRef} sx={{width: "100%"}}>
        <Keyboard />
      </Box>
    </>
  )
}

export default Footer
