/* eslint-disable @typescript-eslint/prefer-readonly-parameter-types */
/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import {pipe} from "@effect-ts/core"
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown"
import Button from "@mui/material/Button"
import ButtonGroup from "@mui/material/ButtonGroup"
import ClickAwayListener from "@mui/material/ClickAwayListener"
import Grow from "@mui/material/Grow"
import MenuItem from "@mui/material/MenuItem"
import MenuList from "@mui/material/MenuList"
import Paper from "@mui/material/Paper"
import Popper from "@mui/material/Popper"
import {ConfigContext, withMode} from "../../context/settings/config"
import {useModal} from "../../context/window/modals"
import {BoardNumber, boardNumbers, titles} from "../../models/state"

export default function BoardSelect() {
  const [open, setOpen] = React.useState(false)
  const anchorRef = React.useRef<HTMLDivElement>(null)
  const {config, setConfig} = React.useContext(ConfigContext)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSettingsModal] = useModal("SETTINGS")

  const handleClick = (mode: BoardNumber) => {
    pipe(config, withMode(mode), setConfig)
  }

  const handleMenuItemClick = (md: BoardNumber) => {
    pipe(config, withMode(md), setConfig)
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
        variant="contained"
        ref={anchorRef}
        aria-label="board select"
        size="small"
      >
        <Button size="small" onClick={() => handleClick(config.mode)}>
          {config.mode === "two" ? 2 : config.mode === "three" ? 3 : 4}
        </Button>
        <Button
          size="small"
          aria-controls={open ? "board-select-menu" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-label="Board Selection"
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
                <MenuList id="board-select-menu">
                  {boardNumbers.map((md) => (
                    <MenuItem
                      key={md}
                      selected={md === config.mode}
                      onClick={() => handleMenuItemClick(md)}
                    >
                      {titles[md]}
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
