/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import {pipe} from "@effect-ts/core"
import CloseZoomButton from "@mui/icons-material/CloseFullscreenOutlined"
import OpenZoomButton from "@mui/icons-material/FullscreenOutlined"
import {IconButton} from "@mui/material"
import {ConfigContext, withZoom} from "../../context/settings/config"

export default function ZoomButton() {
  const {config, setConfig} = React.useContext(ConfigContext)
  const toggleZoomMode = React.useMemo(
    () => () => {
      pipe(
        config,
        withZoom(!config.inZoomMode, config.currentZoom),
        setConfig,
      )
    },
    [config, setConfig],
  )
  return (
    <IconButton
      size="small"
      edge="start"
      color="inherit"
      onClick={toggleZoomMode}
      aria-label="close"
    >
      {config.inZoomMode ? (
        <CloseZoomButton fontSize="small" />
      ) : (
        <OpenZoomButton fontSize="small" />
      )}
    </IconButton>
  )
}
