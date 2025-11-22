import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"

// Props for Header component
export interface HeaderProps {}

// Events emitted by Header
export interface HeaderEvents extends BaseComponentEvents {
  'help-click': () => void
  'summary-click': () => void
  'settings-click': () => void
  'zoom-click': () => void
}

// Component logic
export interface HeaderLogic {}

function render(props: BaseProps<HeaderProps>) {
  return (
    <div class="header" {...renderProps(props)}>
      <div class="header-spacer"></div>
      <h1 data-header-title>Fourdle</h1>
      <div class="header-buttons">
        <button class="header-button zoom-button" data-zoom-button title="Toggle Zoom">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" data-zoom-icon d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
        <button class="header-button help-button" data-help-button title="Help">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
        </button>
        <button class="header-button summary-button" data-summary-button title="Summary">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
          </svg>
        </button>
        <button class="header-button settings-button" data-settings-button title="Settings">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function bind(el: HTMLElement, eventEmitter: any, _props: HeaderProps): BindReturn<HeaderLogic> {
  const stateService = getStateService()
  const titleEl = el.querySelector('[data-header-title]') as HTMLElement
  const helpButton = el.querySelector('[data-help-button]') as HTMLButtonElement
  const summaryButton = el.querySelector('[data-summary-button]') as HTMLButtonElement
  const settingsButton = el.querySelector('[data-settings-button]') as HTMLButtonElement
  const zoomButton = el.querySelector('[data-zoom-button]') as HTMLButtonElement
  const zoomIcon = el.querySelector('[data-zoom-icon]') as SVGPathElement

  if (!titleEl || !helpButton || !summaryButton || !settingsButton || !zoomButton) {
    return { release: () => {} }
  }

  // Update title with puzzle number
  const updateTitle = () => {
    const state = stateService.getDayState()
    titleEl.textContent = `Fourdle - #${state.puzzleNumber}`
  }

  // Update zoom icon based on state
  const updateZoomIcon = (isZoomed: boolean) => {
    if (zoomIcon) {
      if (isZoomed) {
        // Close fullscreen icon
        zoomIcon.setAttribute('d', 'M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z')
      } else {
        // Open fullscreen icon
        zoomIcon.setAttribute('d', 'M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z')
      }
    }
  }

  // Subscribe to zoom state changes
  const handleZoomChange = (isZoomed: boolean, _currentBoard: number) => {
    updateZoomIcon(isZoomed)
  }

  // Handle button clicks
  const handleHelpClick = () => {
    eventEmitter.emit('help-click', [])
  }

  const handleSummaryClick = () => {
    eventEmitter.emit('summary-click', [])
  }

  const handleSettingsClick = () => {
    eventEmitter.emit('settings-click', [])
  }

  const handleZoomClick = () => {
    stateService.toggleZoom()
    eventEmitter.emit('zoom-click', [])
  }

  helpButton.addEventListener('click', handleHelpClick)
  summaryButton.addEventListener('click', handleSummaryClick)
  settingsButton.addEventListener('click', handleSettingsClick)
  zoomButton.addEventListener('click', handleZoomClick)
  stateService.on('zoomChanged', handleZoomChange)

  updateTitle()
  updateZoomIcon(stateService.getZoomState().isZoomed)

  return {
    release: () => {
      helpButton.removeEventListener('click', handleHelpClick)
      summaryButton.removeEventListener('click', handleSummaryClick)
      settingsButton.removeEventListener('click', handleSettingsClick)
      zoomButton.removeEventListener('click', handleZoomClick)
      stateService.off('zoomChanged', handleZoomChange)
    }
  }
}

const Header = createBlueprint<HeaderProps, HeaderEvents, HeaderLogic>(
  { id: "fourdle/header" },
  render,
  { bind }
)

export default Header
