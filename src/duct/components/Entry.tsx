import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import Slot from "./Slot"
import type { Entry as EntryModel } from "@models/entry"
import { emptyChar } from "@models/key"
import { getStateService } from "@services/state-service"

// Props for Entry component
export interface EntryProps {
  boardIndex: number
  entryIndex: number
  actualEntryIndex: number
  entry: EntryModel
  isSolution: boolean
  screenHeight: "TALL" | "MEDIUM" | "SHORT" | "TINY"
  screenWidth: "WIDE" | "MEDIUM" | "NARROW"
}

// Events emitted by Entry
export interface EntryEvents extends BaseComponentEvents {}

// Component logic (no update methods needed - slots update themselves)
export interface EntryLogic {}

function render(props: BaseProps<EntryProps>) {
  const { boardIndex, entryIndex, actualEntryIndex, entry, isSolution, screenHeight, screenWidth, ...rest } = props

  const solutionClass = isSolution ? "solution" : ""
  const isComplete = entry.isCommitted && entry.chars.length === 5

  return (
    <div
      class={`entry ${solutionClass}`.trim()}
      data-entry-complete={isComplete}
      {...renderProps(rest)}
    >
      {[0, 1, 2, 3, 4].map((slotIndex) => {
        const keyCap = entry.chars.length <= slotIndex ? emptyChar : entry.chars[slotIndex]
        return (
          <Slot
            boardIndex={boardIndex}
            entryIndex={entryIndex}
            slotIndex={slotIndex}
            keyCap={keyCap}
            isSolution={isSolution}
            isCommitted={entry.isCommitted}
            isInvalid={entry.isInvalid}
            screenHeight={screenHeight}
            screenWidth={screenWidth}
          />
        )
      })}
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, props: EntryProps): BindReturn<EntryLogic> {
  const { boardIndex, entryIndex, actualEntryIndex } = props
  const stateService = getStateService()

  // Subscribe to entry-specific event
  const entryEventName = `entry:${boardIndex}:${entryIndex}` as any
  const handleEntryChange = (entry: any) => {
    // Update data-entry-complete attribute
    const isComplete = entry.isCommitted && entry.chars.length === 5
    el.setAttribute('data-entry-complete', String(isComplete))
  }

  // Subscribe to board-specific event for solution state
  const boardEventName = `board:${boardIndex}` as any
  const handleBoardChange = (boardState: any) => {
    const isSolved = boardState.board.isSolved
    const isSolution = isSolved && boardState.board.currentIndex === actualEntryIndex
    el.classList.toggle('solution', isSolution)
  }

  stateService.on(entryEventName, handleEntryChange)
  stateService.on(boardEventName, handleBoardChange)

  return {
    release: () => {
      stateService.off(entryEventName, handleEntryChange)
      stateService.off(boardEventName, handleBoardChange)
    }
  }
}

const Entry = createBlueprint<EntryProps, EntryEvents, EntryLogic>(
  { id: "fourdle/entry" },
  render,
  { bind }
)

export default Entry
