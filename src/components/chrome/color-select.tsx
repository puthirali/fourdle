/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import {pipe} from "@effect-ts/core"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import ColorLensIcon from "@mui/icons-material/ColorLens"
import SettingsAccessibilityIcon from "@mui/icons-material/SettingsAccessibility"
import Button from "@mui/material/Button"
import ButtonGroup from "@mui/material/ButtonGroup"
import ClickAwayListener from "@mui/material/ClickAwayListener"
import Grow from "@mui/material/Grow"
import MenuItem from "@mui/material/MenuItem"
import MenuList from "@mui/material/MenuList"
import Paper from "@mui/material/Paper"
import Popper from "@mui/material/Popper"
import {
  ConfigContext,
  withAccessibility,
} from "../../context/settings/config"
import {useModal} from "../../context/window/modals"

type Accessibility = "NORMAL" | "ACCESSIBLE"

const accessibility: Accessibility[] = ["NORMAL", "ACCESSIBLE"]

export default function ColorSelect() {
  const {config, setConfig} = React.useContext(ConfigContext)
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSettingsModal] = useModal("SETTINGS")
  const handleClick = (acc: Accessibility) => {
    pipe(config, withAccessibility(acc === "ACCESSIBLE"), setConfig)
  }

  const handleMenuItemClick = (a: Accessibility) => {
    pipe(config, withAccessibility(a === "ACCESSIBLE"), setConfig)
    setOpen(false)
    setSettingsModal(false)
  }

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen)
  }

  const handleClose = (event: Readonly<Event>) => {
    if (
      anchorRef.current &&
      anchorRef.current.contains(event.target as HTMLElement)
    ) {
      return
    }

    setOpen(false)
  }

  return (
    <>
      <ButtonGroup
        size="small"
        variant="contained"
        ref={anchorRef}
        aria-label="color-mode"
      >
        <Button
          size="small"
          onClick={() =>
            handleClick(config.isAccessible ? "ACCESSIBLE" : "NORMAL")
          }
        >
          {config.isAccessible ? (
            <SettingsAccessibilityIcon />
          ) : (
            <ColorLensIcon />
          )}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "color-mode-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="color-mode"
          aria-haspopup="menu"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        style={{zIndex: 1900}}
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
      >
        {({TransitionProps, placement}) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList id="color-mode-menu">
                  {accessibility.map((md) => (
                    <MenuItem
                      key={md}
                      selected={
                        md ===
                        (config.isAccessible ? "ACCESSIBLE" : "NORMAL")
                      }
                      onClick={() => handleMenuItemClick(md)}
                    >
                      {md}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  )
}
