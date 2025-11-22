import { ObservableV2 as Observable } from 'lib0/observable'
import { pipe } from "effect"
import * as Match from "effect/Match"
import { DateTime } from "luxon"
import allWords from "@data/fives"
import w2 from "@data/w2"
import w3 from "@data/w3"
import w4 from "@data/w4"
import type { Key } from "../../models/key"
import {
  dayResults,
  type DayResults,
  type DayState,
  type DayWords,
  fromWords,
  handleClearInvalid,
  handleKeyPress,
  newGame,
  type State,
  type BoardNumber,
} from "../../models/state"
import { emptyStreak, incStreak, type Streak } from "../../models/streak"

// Granular change types
type SlotChange = {
  type: 'slot'
  boardIndex: number
  entryIndex: number
  slotIndex: number
  data: {
    char: any
    isCommitted: boolean
    isInvalid: boolean
  }
}

type EntryChange = {
  type: 'entry'
  boardIndex: number
  entryIndex: number
  data: any
}

type BoardChange = {
  type: 'board'
  boardIndex: number
  data: any
}

type KeycapChange = {
  type: 'keycap'
  char: string
  data: any
}

type GranularChange = SlotChange | EntryChange | BoardChange | KeycapChange

// Pure function: compute changes between old and new state
function computeChanges(oldState: State, newState: State): GranularChange[] {
  const changes: GranularChange[] = []

  // Compare each board
  oldState.boards.forEach((oldBoard, boardIndex) => {
    const newBoard = newState.boards[boardIndex]
    if (!newBoard) return

    // Check if board-level properties changed
    if (oldBoard.board.isSolved !== newBoard.board.isSolved ||
        oldBoard.board.currentIndex !== newBoard.board.currentIndex) {
      changes.push({
        type: 'board',
        boardIndex,
        data: newBoard
      })
    }

    // Compare each entry
    oldBoard.board.entries.forEach((oldEntry, entryIndex) => {
      const newEntry = newBoard.board.entries[entryIndex]
      if (!newEntry) return

      // Check if entry-level properties changed
      if (oldEntry.isCommitted !== newEntry.isCommitted ||
          oldEntry.isInvalid !== newEntry.isInvalid ||
          oldEntry.chars.length !== newEntry.chars.length) {
        changes.push({
          type: 'entry',
          boardIndex,
          entryIndex,
          data: newEntry
        })
      }

      // Compare each slot in the entry
      const maxSlots = Math.max(oldEntry.chars.length, newEntry.chars.length, 5)
      for (let slotIndex = 0; slotIndex < maxSlots; slotIndex++) {
        const oldChar = oldEntry.chars[slotIndex]
        const newChar = newEntry.chars[slotIndex]

        // Check if slot changed
        if (oldChar?.char !== newChar?.char || oldChar?.mode !== newChar?.mode) {
          changes.push({
            type: 'slot',
            boardIndex,
            entryIndex,
            slotIndex,
            data: {
              char: newChar,
              isCommitted: newEntry.isCommitted,
              isInvalid: newEntry.isInvalid
            }
          })
        }
      }
    })
  })

  // Compare keyboard keys
  Object.keys(newState.letterState).forEach((char) => {
    const oldMode = (oldState.letterState as any)[char]
    const newMode = (newState.letterState as any)[char]
    if (oldMode !== newMode) {
      changes.push({
        type: 'keycap',
        char,
        data: newMode
      })
    }
  })

  return changes
}

// Pure function: compute all changes for initial state
function computeAllChanges(state: State): GranularChange[] {
  const changes: GranularChange[] = []

  // Emit all board/entry/slot states
  state.boards.forEach((boardState, boardIndex) => {
    changes.push({
      type: 'board',
      boardIndex,
      data: boardState
    })

    boardState.board.entries.forEach((entry, entryIndex) => {
      changes.push({
        type: 'entry',
        boardIndex,
        entryIndex,
        data: entry
      })

      for (let slotIndex = 0; slotIndex < 5; slotIndex++) {
        const char = entry.chars[slotIndex]
        changes.push({
          type: 'slot',
          boardIndex,
          entryIndex,
          slotIndex,
          data: {
            char: char,
            isCommitted: entry.isCommitted,
            isInvalid: entry.isInvalid
          }
        })
      }
    })
  })

  // Emit all keycap states
  Object.keys(state.letterState).forEach((char) => {
    const mode = (state.letterState as any)[char]
    changes.push({
      type: 'keycap',
      char,
      data: mode
    })
  })

  return changes
}

// Events emitted by the state service
export interface StateEvents {
  stateChanged: (state: State, mode: BoardNumber) => void
  dayStateChanged: (dayState: DayState) => void
  resultsChanged: (results: DayResults) => void
  modeChanged: (mode: BoardNumber) => void
  keyPressed: (key: Key) => void
  invalidEntrySubmitted: () => void
  zoomChanged: (isZoomed: boolean, currentBoard: number) => void
  gameCompleted: () => void
  // Granular change events using address pattern: board#entry@slot
  [key: `slot:${number}:${number}:${number}`]: (slotData: any) => void
  [key: `entry:${number}:${number}`]: (entryData: any) => void
  [key: `board:${number}`]: (boardData: any) => void
  [key: `keycap:${string}`]: (keyData: any) => void
}

// Singleton state service using Observable pattern
class StateService {
  private observable: Observable<StateEvents>
  private dayState: DayState
  private mode: BoardNumber = 'four'
  private results: DayResults
  private streak: Streak
  private previousState: State | null = null
  private invalidEntryTimeout: ReturnType<typeof setTimeout> | null = null
  private readonly INVALID_ENTRY_TIMEOUT_MS = 1200
  private isZoomed: boolean = false
  private currentZoomBoard: number = 0

  constructor() {
    this.observable = new Observable()

    // Load streak from localStorage
    const storedStreak = localStorage.getItem('streak')
    if (storedStreak) {
      try {
        this.streak = JSON.parse(storedStreak)
      } catch {
        this.streak = emptyStreak()
      }
    } else {
      this.streak = emptyStreak()
    }

    // Calculate day number
    const dayNumber = pipe(
      DateTime.utc(),
      (nw) => nw.diff(nw.set({ day: 1, month: 1 })),
      (d) => d.shiftTo("days").days + 1,
    )

    // Load or initialize day state from localStorage
    const stored = localStorage.getItem('day-state')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed.puzzleNumber === dayNumber) {
          this.dayState = parsed
        } else {
          // New day - reset state
          this.dayState = fromWords(dayNumber, this.getWords(dayNumber))
          this.saveDayState()
        }
      } catch {
        this.dayState = fromWords(dayNumber, this.getWords(dayNumber))
        this.saveDayState()
      }
    } else {
      this.dayState = fromWords(dayNumber, this.getWords(dayNumber))
      this.saveDayState()
    }

    // Initialize results
    this.results = dayResults(this.dayState)

    // Load mode from localStorage
    const storedMode = localStorage.getItem('game-mode')
    if (storedMode && ['two', 'three', 'four'].includes(storedMode)) {
      this.mode = storedMode as BoardNumber
    }

    // Emit initial state after components have bound (next tick)
    setTimeout(() => {
      this.emitChanges()
    }, 0)
  }

  private getWords(dayNumber: number): DayWords {
    const idx: number = dayNumber % 400
    const w4W = w4.words[idx]
    const w3W = w3.words[idx]
    const w2W = w2.words[idx]
    return {
      two: w2W.map((i) => allWords.words[i]),
      three: w3W.map((i) => allWords.words[i]),
      four: w4W.map((i) => allWords.words[i]),
    }
  }

  private saveDayState() {
    localStorage.setItem('day-state', JSON.stringify(this.dayState))
  }

  private checkForInvalidEntries(state: State): boolean {
    return state.boards.some(boardState =>
      boardState.board.entries.some(entry => entry.isInvalid)
    )
  }

  private scheduleInvalidEntryClear() {
    // Clear any existing timeout
    if (this.invalidEntryTimeout) {
      clearTimeout(this.invalidEntryTimeout)
    }

    // Schedule clearing of invalid entries
    this.invalidEntryTimeout = setTimeout(() => {
      this.clearInvalidEntries()
      this.invalidEntryTimeout = null
    }, this.INVALID_ENTRY_TIMEOUT_MS)
  }

  private emitChanges() {
    const currentState = this.getCurrentState()

    // Phase 1: Compute changes (pure data transformation)
    const changes = this.previousState
      ? computeChanges(this.previousState, currentState)
      : computeAllChanges(currentState)

    // Check if game just completed (only if we have a previous state to compare)
    const wasCompleted = this.previousState?.isDone || false
    const isCompleted = currentState.isDone
    const hadPreviousState = this.previousState !== null

    // Store current as previous for next comparison
    this.previousState = JSON.parse(JSON.stringify(currentState))

    // Phase 2: Emit events (side effects)
    changes.forEach(change => this.emitGranularChange(change))

    // Emit broad events
    this.observable.emit('dayStateChanged', [this.dayState])
    this.observable.emit('stateChanged', [currentState, this.mode])
    this.observable.emit('resultsChanged', [this.results])

    // Emit game completed event only if just completed (not on initial load)
    if (hadPreviousState && isCompleted && !wasCompleted) {
      const result = this.results[this.mode]
      const currentStreak = this.getStreak()

      // Only update streak if solved and not already recorded for this puzzle
      if (result.isSolved && currentStreak.record[result.mode].lastPuzzle !== result.puzzleNumber) {
        const updatedStreak = pipe(currentStreak, incStreak(result))
        this.saveStreak(updatedStreak)
      }

      this.observable.emit('gameCompleted', [])
    }

    // Phase 3: Check for invalid entries and schedule clearing
    const hasInvalid = this.checkForInvalidEntries(currentState)
    if (hasInvalid) {
      this.observable.emit('invalidEntrySubmitted', [])
      this.scheduleInvalidEntryClear()
    }
  }

  private emitGranularChange(change: GranularChange) {
    pipe(
      change,
      Match.value,
      Match.when({ type: 'slot' }, (c: SlotChange) => {
        this.observable.emit(`slot:${c.boardIndex}:${c.entryIndex}:${c.slotIndex}` as any, [c.data])
      }),
      Match.when({ type: 'entry' }, (c: EntryChange) => {
        this.observable.emit(`entry:${c.boardIndex}:${c.entryIndex}` as any, [c.data])
      }),
      Match.when({ type: 'board' }, (c: BoardChange) => {
        this.observable.emit(`board:${c.boardIndex}` as any, [c.data])
      }),
      Match.when({ type: 'keycap' }, (c: KeycapChange) => {
        this.observable.emit(`keycap:${c.char}` as any, [c.data])
      }),
      Match.exhaustive
    )
  }

  // Public API
  getCurrentState(): State {
    return this.dayState.states[this.mode]
  }

  getDayState(): DayState {
    return this.dayState
  }

  getResults(): DayResults {
    return this.results
  }

  getMode(): BoardNumber {
    return this.mode
  }

  setMode(mode: BoardNumber) {
    this.mode = mode
    localStorage.setItem('game-mode', mode)
    this.observable.emit('modeChanged', [mode])
    this.observable.emit('stateChanged', [this.getCurrentState(), mode])
  }

  onKeyPress(key: Key) {
    // Emit keyPressed event first for animations
    this.observable.emit('keyPressed', [key])

    const currentState = this.getCurrentState()
    const newState = pipe(currentState, handleKeyPress(key))

    this.dayState = {
      puzzleNumber: this.dayState.puzzleNumber,
      states: {
        ...this.dayState.states,
        [this.mode]: newState,
      },
    }

    this.results = dayResults(this.dayState)
    this.saveDayState()
    this.emitChanges()
  }

  clearInvalidEntries() {
    const currentState = this.getCurrentState()
    const newState = handleClearInvalid(currentState)

    this.dayState = {
      puzzleNumber: this.dayState.puzzleNumber,
      states: {
        ...this.dayState.states,
        [this.mode]: newState,
      },
    }

    this.results = dayResults(this.dayState)
    this.saveDayState()
    this.emitChanges()
  }

  // Streak management
  getStreak(): Streak {
    return this.streak
  }

  saveStreak(streak: Streak) {
    this.streak = streak
    localStorage.setItem('streak', JSON.stringify(streak))
  }

  // Zoom management
  toggleZoom() {
    this.isZoomed = !this.isZoomed
    this.observable.emit('zoomChanged', [this.isZoomed, this.currentZoomBoard])
  }

  setZoomBoard(boardIndex: number) {
    if (boardIndex >= 0 && boardIndex < this.getCurrentState().boards.length) {
      this.currentZoomBoard = boardIndex
      this.observable.emit('zoomChanged', [this.isZoomed, this.currentZoomBoard])
    }
  }

  getZoomState(): { isZoomed: boolean; currentBoard: number } {
    return {
      isZoomed: this.isZoomed,
      currentBoard: this.currentZoomBoard
    }
  }

  // Observable pattern - subscribe to events
  on<K extends keyof StateEvents>(event: K, handler: StateEvents[K]) {
    this.observable.on(event, handler as any)
  }

  off<K extends keyof StateEvents>(event: K, handler: StateEvents[K]) {
    this.observable.off(event, handler as any)
  }

  // Destroy
  destroy() {
    this.observable.destroy()
  }
}

// Singleton instance
let stateServiceInstance: StateService | null = null

export function createStateService(): StateService {
  if (!stateServiceInstance) {
    stateServiceInstance = new StateService()
  }
  return stateServiceInstance
}

export function getStateService(): StateService {
  if (!stateServiceInstance) {
    stateServiceInstance = new StateService()
  }
  return stateServiceInstance
}
