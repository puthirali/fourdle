import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"
import Board from "./Board"
import { board } from "@models/entry"

export interface StackedBoardsViewProps {
  screenHeight?: "TALL" | "MEDIUM" | "TINY"
  screenWidth?: "WIDE" | "MEDIUM" | "NARROW"
  numberOfRows?: number
}

export interface StackedBoardsViewEvents extends BaseComponentEvents {}

export interface StackedBoardsViewLogic {}

function render(props: BaseProps<StackedBoardsViewProps>) {
  const { screenHeight = "MEDIUM", screenWidth = "MEDIUM", numberOfRows = 6, ...rest } = props

  // Render 4 boards (max) - bind will show/hide based on actual mode
  const emptyBoardModel = board("")

  return (
    <div class="boards-container" {...renderProps(rest)}>
      {[0, 1, 2, 3].map((boardIndex) =>
        <div data-stacked-board={boardIndex}>
          {Board({
            board: emptyBoardModel,
            boardIndex,
            numberOfRows,
            screenHeight,
            screenWidth
          })}
        </div>
      )}
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, props: StackedBoardsViewProps): BindReturn<StackedBoardsViewLogic> {
  const stateService = getStateService()
  const { screenHeight = "MEDIUM", screenWidth = "MEDIUM", numberOfRows = 6 } = props

  function updateBoards() {
    const state = stateService.getCurrentState()
    const boardCount = state.boards.length

    // Update each board with current state data
    for (let i = 0; i < 4; i++) {
      const boardWrapper = el.querySelector(`[data-stacked-board="${i}"]`) as HTMLElement
      if (boardWrapper) {
        if (i < boardCount) {
          // Re-render board with current data
          const boardState = state.boards[i]
          boardWrapper.innerHTML = Board({
            board: boardState.board,
            boardIndex: i,
            numberOfRows,
            screenHeight,
            screenWidth
          }) as string
          boardWrapper.style.display = ''
        } else {
          boardWrapper.style.display = 'none'
        }
      }
    }
  }

  // Initial update
  updateBoards()

  // Update when mode changes
  const handleModeChange = () => {
    updateBoards()
  }

  stateService.on('modeChanged', handleModeChange)

  return {
    release: () => {
      stateService.off('modeChanged', handleModeChange)
    }
  }
}

const StackedBoardsView = createBlueprint<StackedBoardsViewProps, StackedBoardsViewEvents, StackedBoardsViewLogic>(
  { id: "fourdle/stacked-boards-view" },
  render,
  { bind }
)

export default StackedBoardsView
