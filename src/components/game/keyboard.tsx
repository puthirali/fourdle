import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import * as O from "@effect-ts/core/Option"
import {StateContext} from "../../context/state"
import {fromKeyCode} from "../../models/key"

const KeyboardEventHandler: React.FC = () => {
  const {onKeyPress} = React.useContext(StateContext)
  const handleEvent = React.useCallback(
    (event) =>
      pipe(event.key, fromKeyCode, O.map(onKeyPress), () =>
        event.stopPropagation(),
      ),
    [onKeyPress],
  )

  React.useEffect(() => {
    window.addEventListener("keydown", handleEvent)
    return () => {
      window.removeEventListener("keydown", handleEvent)
    }
  }, [handleEvent])
  return <div />
}

export default KeyboardEventHandler
