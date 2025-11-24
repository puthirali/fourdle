import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { createRef } from "@duct-ui/core/ref"
import Select, { type SelectItem, type SelectLogic } from "@duct-ui/components/dropdown/select"
import ColorSelector from "./ColorSelector"
import { getStateService } from "@services/state-service"
import type { BoardNumber } from "@models/state"
import { titles } from "@models/state"

// Props for Header component
export interface HeaderProps {}

// Events emitted by Header
export interface HeaderEvents extends BaseComponentEvents {
  'help-click': () => void
  'summary-click': () => void
  'zoom-click': () => void
}

// Component logic
export interface HeaderLogic {}

const modeSelectRef = createRef<SelectLogic>()

function render(props: BaseProps<HeaderProps>) {
  // Handler for mode change
  const handleModeChange = (_el: HTMLElement, item: SelectItem, _index: number) => {
    const stateService = getStateService()

    // Map label back to BoardNumber
    let newMode: BoardNumber = "four"
    if (item.label === titles.two) {
      newMode = "two"
    } else if (item.label === titles.three) {
      newMode = "three"
    } else if (item.label === titles.four) {
      newMode = "four"
    }

    stateService.setMode(newMode)
  }

  const modeItems: SelectItem[] = [
    { label: titles.four, description: "", isSelected: true },
    { label: titles.three, description: "", isSelected: false },
    { label: titles.two, description: "", isSelected: false }
  ]

  return (
    <div class="header" {...renderProps(props)}>
      <div class="header-spacer"></div>
      <div class="header-title" data-header-title>
        <Select
          items={modeItems}
          buttonClass="btn btn-ghost text-2xl font-bold"
          menuClass="menu bg-base-200 rounded-box z-[1] w-32 p-2 shadow"
          labelClass="font-bold text-xl"
          selectedIconClass="w-4 h-4 mr-2"
          placement="bottom"
          on:selectionChange={handleModeChange}
          ref={modeSelectRef}
        />
        <span class="puzzle-number" data-puzzle-number></span>
      </div>
      <div class="header-buttons">
        <ColorSelector />
        <button class="header-button zoom-button" data-zoom-button title="Toggle Zoom">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" data-zoom-icon d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
          </svg>
        </button>
        <button class="header-button summary-button" data-summary-button title="Summary">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z"/>
          </svg>
        </button>
        <button class="header-button help-button" data-help-button title="Help">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

function bind(el: HTMLElement, eventEmitter: any, _props: HeaderProps): BindReturn<HeaderLogic> {
  const stateService = getStateService()
  const puzzleNumberEl = el.querySelector('[data-puzzle-number]') as HTMLElement
  const helpButton = el.querySelector('[data-help-button]') as HTMLButtonElement
  const summaryButton = el.querySelector('[data-summary-button]') as HTMLButtonElement
  const zoomButton = el.querySelector('[data-zoom-button]') as HTMLButtonElement
  const zoomIcon = el.querySelector('[data-zoom-icon]') as SVGPathElement

  if (!puzzleNumberEl || !helpButton || !summaryButton || !zoomButton) {
    return { release: () => {} }
  }

  // Update puzzle number
  const updatePuzzleNumber = () => {
    const state = stateService.getDayState()
    puzzleNumberEl.textContent = ` #${state.puzzleNumber}`
  }

  // Update select to show current mode
  const updateModeSelect = () => {
    const currentMode = stateService.getMode()
    const modeSelect = modeSelectRef.current
    if (modeSelect) {
      const modeIndex = currentMode === "four" ? 0 : currentMode === "three" ? 1 : 2
      modeSelect.selectItem(modeIndex)
    }
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

  // Subscribe to mode changes
  const handleModeChanged = () => {
    updateModeSelect()
  }

  // Handle button clicks
  const handleHelpClick = () => {
    eventEmitter.emit('help-click', [])
  }

  const handleSummaryClick = () => {
    eventEmitter.emit('summary-click', [])
  }

  const handleZoomClick = () => {
    stateService.toggleZoom()
    eventEmitter.emit('zoom-click', [])
  }

  helpButton.addEventListener('click', handleHelpClick)
  summaryButton.addEventListener('click', handleSummaryClick)
  zoomButton.addEventListener('click', handleZoomClick)
  stateService.on('zoomChanged', handleZoomChange)
  stateService.on('modeChanged', handleModeChanged)

  updatePuzzleNumber()
  updateZoomIcon(stateService.getZoomState().isZoomed)

  // Initialize the mode select after a tick
  setTimeout(() => {
    updateModeSelect()
  }, 0)

  return {
    release: () => {
      helpButton.removeEventListener('click', handleHelpClick)
      summaryButton.removeEventListener('click', handleSummaryClick)
      zoomButton.removeEventListener('click', handleZoomClick)
      stateService.off('zoomChanged', handleZoomChange)
      stateService.off('modeChanged', handleModeChanged)
    }
  }
}

const Header = createBlueprint<HeaderProps, HeaderEvents, HeaderLogic>(
  { id: "fourdle/header" },
  render,
  { bind }
)

export default Header
