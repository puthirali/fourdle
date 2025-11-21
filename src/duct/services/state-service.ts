import { ObservableV2 as Observable } from 'lib0/observable'
import { pipe } from "effect"
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
  handleKeyPress,
  newGame,
  type State,
  type BoardNumber,
} from "../../models/state"
import { emptyStreak, type Streak } from "../../models/streak"

// Events emitted by the state service
export interface StateEvents {
  stateChanged: (state: State, mode: BoardNumber) => void
  dayStateChanged: (dayState: DayState) => void
  resultsChanged: (results: DayResults) => void
  modeChanged: (mode: BoardNumber) => void
  keyPressed: (key: Key) => void
}

// Singleton state service using Observable pattern
class StateService {
  private observable: Observable<StateEvents>
  private dayState: DayState
  private mode: BoardNumber = 'four'
  private results: DayResults

  constructor() {
    this.observable = new Observable()

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

  private emitChanges() {
    this.observable.emit('dayStateChanged', [this.dayState])
    this.observable.emit('stateChanged', [this.getCurrentState(), this.mode])
    this.observable.emit('resultsChanged', [this.results])
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

  // Streak management
  getStreak(): Streak {
    const stored = localStorage.getItem('streak')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch {
        return emptyStreak()
      }
    }
    return emptyStreak()
  }

  saveStreak(streak: Streak) {
    localStorage.setItem('streak', JSON.stringify(streak))
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
    throw new Error('State service not initialized. Call createStateService() first.')
  }
  return stateServiceInstance
}
