import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import autoAnimate from '@formkit/auto-animate'
import Entry from "./Entry"
import { type Board as BoardModel, lastEntered } from "@models/entry"
import { getStateService } from "@services/state-service"

// Props for Board component
export interface BoardProps {
  board: BoardModel
  boardIndex: number
  numberOfRows: number
  screenHeight: "TALL" | "MEDIUM" | "SHORT" | "TINY"
  screenWidth: "WIDE" | "MEDIUM" | "NARROW"
}

// Events emitted by Board
export interface BoardEvents extends BaseComponentEvents {}

// Component logic (no update methods needed - entries/slots update themselves)
export interface BoardLogic {}

function render(props: BaseProps<BoardProps>) {
  const { board, boardIndex, numberOfRows, screenHeight, screenWidth, ...rest } = props

  const entries = lastEntered(numberOfRows)(board)

  return (
    <div
      class="board"
      data-board-index={boardIndex}
      data-solved={String(board.isSolved)}
      {...renderProps(rest)}
    >
      {entries.map(([e, entryIndex], i) => (
        <div
          class="board-entry-row"
          data-entry-index={i}
          data-actual-entry-index={entryIndex}
        >
          <div class="board-entry-number">{`${entryIndex + 1}`}</div>
          <Entry
            boardIndex={boardIndex}
            entryIndex={i}
            actualEntryIndex={entryIndex}
            entry={e}
            isSolution={board.isSolved && board.currentIndex === entryIndex}
            screenHeight={screenHeight}
            screenWidth={screenWidth}
          />
        </div>
      ))}
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, props: BoardProps): BindReturn<BoardLogic> {
  const { board, boardIndex, numberOfRows, screenHeight, screenWidth } = props
  const stateService = getStateService()

  // Enable AutoAnimate for smooth transitions
  autoAnimate(el)

  // Track current window state - initialize based on what was actually rendered
  const initialEntries = lastEntered(numberOfRows)(board)
  let currentStartIndex = initialEntries.length > 0 ? initialEntries[0][1] : 0

  // Subscribe to board-specific event
  const boardEventName = `board:${boardIndex}` as any
  const handleBoardChange = (boardState: any) => {
    const board = boardState.board
    const isSolved = board.isSolved
    el.setAttribute('data-solved', String(isSolved))

    // Calculate new entry window
    const entries = lastEntered(numberOfRows)(board)
    const newStartIndex = entries.length > 0 ? entries[0][1] : 0

    // Check if window shifted (entries scrolled up)
    const shiftAmount = newStartIndex - currentStartIndex

    if (shiftAmount > 0) {
      // Remove top entries (AutoAnimate will animate them out)
      for (let i = 0; i < shiftAmount; i++) {
        const firstRow = el.querySelector('.board-entry-row')
        if (firstRow && firstRow.parentNode === el) {
          el.removeChild(firstRow)
        }
      }

      // Add new entries at bottom
      const newEntries = entries.slice(-shiftAmount)
      newEntries.forEach(([e, entryIndex]) => {
        const rowHTML = (
          <div class="board-entry-row" data-actual-entry-index={entryIndex}>
            <div class="board-entry-number">{`${entryIndex + 1}`}</div>
            {Entry({
              boardIndex,
              entryIndex: entryIndex - newStartIndex,
              actualEntryIndex: entryIndex,
              entry: e,
              isSolution: board.isSolved && board.currentIndex === entryIndex,
              screenHeight,
              screenWidth
            })}
          </div>
        ) as string

        el.insertAdjacentHTML('beforeend', rowHTML)
      })
    }

    // Update tracking
    currentStartIndex = newStartIndex
  }

  stateService.on(boardEventName, handleBoardChange)

  return {
    release: () => {
      stateService.off(boardEventName, handleBoardChange)
    }
  }
}

const Board = createBlueprint<BoardProps, BoardEvents, BoardLogic>(
  { id: "fourdle/board" },
  render,
  { bind }
)

export default Board
