import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
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
      data-solved={board.isSolved}
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
  const { boardIndex } = props
  const stateService = getStateService()

  // Subscribe to board-specific event
  const boardEventName = `board:${boardIndex}` as any
  const handleBoardChange = (boardState: any) => {
    const isSolved = boardState.board.isSolved
    el.setAttribute('data-solved', String(isSolved))
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
