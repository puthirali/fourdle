import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import Slot from "./Slot"
import type { Entry as EntryModel } from "@models/entry"
import { emptyChar } from "@models/key"
import { getStateService } from "@services/state-service"
import type { State } from "@models/state"

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

  const updateEntry = (state: State) => {
    const board = state.boards[boardIndex]
    if (!board) return

    const entry = board.board.entries[entryIndex]
    if (!entry) return

    // Update data-entry-complete attribute
    const isComplete = entry.isCommitted && entry.chars.length === 5
    el.setAttribute('data-entry-complete', String(isComplete))

    // Update solution class
    const isSolved = board.board.isSolved
    const isSolution = isSolved && board.board.currentIndex === actualEntryIndex

    // Update solution class
    el.classList.toggle('solution', isSolution)
  }

  // Subscribe to state changes
  const handleStateChange = (state: State) => {
    updateEntry(state)
  }

  stateService.on('stateChanged', handleStateChange)

  // Initialize on mount
  updateEntry(stateService.getCurrentState())

  return {
    release: () => {
      stateService.off('stateChanged', handleStateChange)
    }
  }
}

const Entry = createBlueprint<EntryProps, EntryEvents, EntryLogic>(
  { id: "fourdle/entry" },
  render,
  { bind }
)

export default Entry
