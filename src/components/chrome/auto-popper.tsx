/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
import * as React from "react"
import Box from "@mui/material/Box"
import Popper from "@mui/material/Popper"
import useEventCallback from "@mui/material/utils/useEventCallback"
import Zoom from "@mui/material/Zoom"

export interface AutoHidePopperProps {
  readonly onClose: () => void
  readonly duration: number
  readonly isOpen: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly children: React.ReactElement<any, any>
  readonly id: string
  readonly anchorEl: Readonly<HTMLElement> | undefined
}

type Timeout = ReturnType<typeof setTimeout>

export const AutoHidePopper: React.FC<AutoHidePopperProps> = ({
  onClose,
  duration,
  isOpen,
  children,
  id,
  anchorEl,
}: AutoHidePopperProps) => {
  const timerAutoHide = React.useRef<Timeout>()
  const handleClose = useEventCallback(() => onClose())
  const setAutoHideTimer = useEventCallback(
    (duration: number | null) => {
      if (!onClose || duration == null) {
        return
      }
      if (timerAutoHide.current) {
        clearTimeout(timerAutoHide.current)
      }

      timerAutoHide.current = setTimeout(() => {
        handleClose()
      }, duration)
    },
  )
  React.useEffect(() => {
    if (isOpen) {
      setAutoHideTimer(duration)
    }

    return () => {
      if (timerAutoHide.current) {
        clearTimeout(timerAutoHide.current)
      }
    }
  }, [isOpen, duration, setAutoHideTimer])

  return (
    <Popper
      id={isOpen ? id : undefined}
      open={isOpen}
      anchorEl={isOpen ? anchorEl : null}
      placement="top"
      transition
      style={{maxWidth: "300px"}}
      disablePortal={false}
      modifiers={[
        {
          name: "preventOverflow",
          enabled: true,
          options: {
            altAxis: true,
            altBoundary: true,
            tether: true,
            rootBoundary: "viewport",
            padding: 8,
          },
        },
      ]}
    >
      {({TransitionProps}) => (
        <Zoom {...TransitionProps} appear in={isOpen} timeout={600}>
          <Box maxWidth="300px">{children}</Box>
        </Zoom>
      )}
    </Popper>
  )
}
