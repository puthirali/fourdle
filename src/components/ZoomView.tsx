import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"
import Board from "./Board"
import { board } from "@models/entry"

export interface ZoomViewProps {
  screenHeight?: "TALL" | "MEDIUM" | "TINY"
  screenWidth?: "WIDE" | "MEDIUM" | "NARROW"
  numberOfRows?: number
}

export interface ZoomViewEvents extends BaseComponentEvents {}

export interface ZoomViewLogic {}

function render(props: BaseProps<ZoomViewProps>) {
  const { screenHeight = "MEDIUM", screenWidth = "MEDIUM", numberOfRows = 6, ...rest } = props

  // Render 4 tabs/boards (max) - bind will show/hide based on actual mode
  const emptyBoardModel = board("")

  return (
    <div class="zoom-view" style="display: flex; flex-direction: column; width: 100%; flex-grow: 1; align-items: center;" {...renderProps(rest)}>
      <div class="tabs tabs-bordered" role="tablist" style="margin-bottom: 1rem;">
        {[0, 1, 2, 3].map((idx) => (
          <button
            role="tab"
            class={`tab ${idx === 0 ? 'tab-active' : ''}`}
            data-zoom-tab={idx}
            aria-selected={idx === 0}
          >
            #{idx + 1}
          </button>
        ))}
      </div>
      <div class="zoom-tab-panels" style="display: flex; flex-direction: column; width: 100%; flex-grow: 1;">
        {[0, 1, 2, 3].map((idx) => (
          <div
            role="tabpanel"
            class={`zoom-board-content ${idx === 0 ? 'block' : 'hidden'}`}
            data-zoom-panel={idx}
            aria-hidden={idx !== 0}
          >
            {Board({
              board: emptyBoardModel,
              boardIndex: idx,
              numberOfRows,
              screenHeight,
              screenWidth
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: ZoomViewProps): BindReturn<ZoomViewLogic> {
  const stateService = getStateService()
  const tabButtons = el.querySelectorAll('[data-zoom-tab]')
  const tabPanels = el.querySelectorAll('[data-zoom-panel]')

  // Handle tab clicks
  const handleTabClick = (e: Event) => {
    const button = e.currentTarget as HTMLElement
    const tabIndex = parseInt(button.dataset.zoomTab || '0')
    stateService.setZoomBoard(tabIndex)

    // Update UI
    updateTabDisplay(tabIndex)
  }

  function updateTabDisplay(activeIndex: number) {
    // Update tab buttons
    tabButtons.forEach((btn, idx) => {
      if (idx === activeIndex) {
        btn.classList.add('tab-active')
        btn.setAttribute('aria-selected', 'true')
      } else {
        btn.classList.remove('tab-active')
        btn.setAttribute('aria-selected', 'false')
      }
    })

    // Update tab panels
    tabPanels.forEach((panel, idx) => {
      if (idx === activeIndex) {
        panel.classList.remove('hidden')
        panel.classList.add('block')
        panel.setAttribute('aria-hidden', 'false')
      } else {
        panel.classList.add('hidden')
        panel.classList.remove('block')
        panel.setAttribute('aria-hidden', 'true')
      }
    })
  }

  function updateBoards() {
    const state = stateService.getCurrentState()
    const boardCount = state.boards.length
    const zoomState = stateService.getZoomState()

    // Show/hide tabs based on current mode
    tabButtons.forEach((btn, idx) => {
      const buttonEl = btn as HTMLElement
      buttonEl.style.display = idx < boardCount ? '' : 'none'
    })

    // Update panels with current board data
    tabPanels.forEach((panel, idx) => {
      const panelEl = panel as HTMLElement
      if (idx < boardCount) {
        // Re-render board with current data
        const boardState = state.boards[idx]
        panelEl.innerHTML = Board({
          board: boardState.board,
          boardIndex: idx,
          numberOfRows: _props.numberOfRows || 6,
          screenHeight: _props.screenHeight || "MEDIUM",
          screenWidth: _props.screenWidth || "MEDIUM"
        }) as string
        panelEl.style.display = ''
      } else {
        panelEl.style.display = 'none'
      }
    })

    // Update active tab to current zoom board
    updateTabDisplay(zoomState.currentBoard)
  }

  // Initial update
  updateBoards()

  // Update when mode changes
  const handleModeChange = () => {
    updateBoards()
  }

  // Update when zoom changes
  const handleZoomChange = () => {
    const zoomState = stateService.getZoomState()
    updateTabDisplay(zoomState.currentBoard)
  }

  // Attach click handlers
  tabButtons.forEach(button => {
    button.addEventListener('click', handleTabClick)
  })

  stateService.on('modeChanged', handleModeChange)
  stateService.on('zoomChanged', handleZoomChange)

  return {
    release: () => {
      tabButtons.forEach(button => {
        button.removeEventListener('click', handleTabClick)
      })
      stateService.off('modeChanged', handleModeChange)
      stateService.off('zoomChanged', handleZoomChange)
    }
  }
}

const ZoomView = createBlueprint<ZoomViewProps, ZoomViewEvents, ZoomViewLogic>(
  { id: "fourdle/zoom-view" },
  render,
  { bind }
)

export default ZoomView
