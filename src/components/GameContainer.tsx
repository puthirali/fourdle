import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"
import ZoomView from "./ZoomView"
import StackedBoardsView from "./StackedBoardsView"

export interface GameContainerProps {
  screenHeight?: "TALL" | "MEDIUM" | "TINY"
  screenWidth?: "WIDE" | "MEDIUM" | "NARROW"
  numberOfRows?: number
}

export interface GameContainerEvents extends BaseComponentEvents {}

export interface GameContainerLogic {
  refresh: () => void
}

function render(props: BaseProps<GameContainerProps>) {
  const { screenHeight = "MEDIUM", screenWidth = "MEDIUM", numberOfRows = 6, ...rest } = props

  // Default to not zoomed during SSR/build - will be updated by bind
  return (
    <div class="game-boards-wrapper" {...renderProps(rest)} data-game-container>
      <div data-zoom-container>
        <ZoomView
          screenHeight={screenHeight}
          screenWidth={screenWidth}
          numberOfRows={numberOfRows}
        />
      </div>
      <div data-stacked-container>
        <StackedBoardsView
          screenHeight={screenHeight}
          screenWidth={screenWidth}
          numberOfRows={numberOfRows}
        />
      </div>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: GameContainerProps): BindReturn<GameContainerLogic> {
  const stateService = getStateService()
  const zoomContainer = el.querySelector('[data-zoom-container]') as HTMLElement
  const stackedContainer = el.querySelector('[data-stacked-container]') as HTMLElement

  function updateViewVisibility() {
    const zoomState = stateService.getZoomState()

    if (zoomState.isZoomed) {
      // Show zoom view, hide stacked view
      if (zoomContainer) {
        zoomContainer.style.display = ''
      }
      if (stackedContainer) {
        stackedContainer.style.display = 'none'
      }
    } else {
      // Show stacked view, hide zoom view
      if (zoomContainer) {
        zoomContainer.style.display = 'none'
      }
      if (stackedContainer) {
        stackedContainer.style.display = ''
      }
    }
  }

  // Initial update
  updateViewVisibility()

  // Subscribe to zoom changes
  const handleZoomChange = () => {
    updateViewVisibility()
  }

  stateService.on('zoomChanged', handleZoomChange)

  return {
    refresh: () => {
      updateViewVisibility()
    },
    release: () => {
      stateService.off('zoomChanged', handleZoomChange)
    }
  }
}

const GameContainer = createBlueprint<GameContainerProps, GameContainerEvents, GameContainerLogic>(
  { id: "fourdle/game-container" },
  render,
  { bind }
)

export default GameContainer
