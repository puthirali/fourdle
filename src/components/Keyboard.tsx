import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { pipe } from "effect"
import * as O from "effect/Option"
import { keyboard, type Key, allChars, type KeyMode, fromKeyCode } from "@models/key"
import { getKey, type LetterState } from "@models/state"
import { getStateService } from "@services/state-service"
import KeyRow from "./KeyRow"

// Props for Keyboard component
export interface KeyboardProps {
  screenHeight?: "TALL" | "MEDIUM" | "TINY"
}

// Events emitted by Keyboard
export interface KeyboardEvents extends BaseComponentEvents {}

// Component logic
export interface KeyboardLogic {}

// Create default letter state with all keys in OPEN mode
function createDefaultLetterState(): LetterState {
  return allChars.reduce((acc, char) => ({
    ...acc,
    [char]: "OPEN" as KeyMode
  }), {} as LetterState)
}

function render(props: BaseProps<KeyboardProps>) {
  const { screenHeight = "MEDIUM", ...rest } = props

  // Render with default OPEN state keys
  const defaultLetterState = createDefaultLetterState()
  const row1 = keyboard[0].map((c) => pipe(defaultLetterState, getKey(c)))
  const row2 = keyboard[1].map((c) => pipe(defaultLetterState, getKey(c)))
  const row3 = keyboard[2].map((c) => pipe(defaultLetterState, getKey(c)))

  return (
    <div class="keyboard" style="width: 100%; background-color: #1e1e1e; padding: 1em 0;" data-screen-height={screenHeight} {...renderProps(rest)}>
      <KeyRow keys={row1} screenHeight={screenHeight} data-row="0" />
      <KeyRow keys={row2} screenHeight={screenHeight} data-row="1" />
      <KeyRow keys={row3} screenHeight={screenHeight} data-row="2" />
    </div>
  )
}

function bind(el: HTMLElement): BindReturn<KeyboardLogic> {
  const stateService = getStateService()

  // Listen to key press events from KeyRow components (button clicks)
  const handleKeyPress = (e: Event) => {
    const customEvent = e as CustomEvent
    const key = customEvent.detail as Key
    stateService.onKeyPress(key)
  }

  // Listen to actual keyboard events from the browser
  const handleKeyDown = (e: KeyboardEvent) => {
    const keyOption = fromKeyCode(e.key)

    if (O.isSome(keyOption)) {
      // State service will emit 'keyPressed' event for animations
      stateService.onKeyPress(keyOption.value)
      e.preventDefault()
    }
  }

  el.addEventListener('keypress', handleKeyPress)
  window.addEventListener('keydown', handleKeyDown)

  return {
    release: () => {
      el.removeEventListener('keypress', handleKeyPress)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }
}

const Keyboard = createBlueprint<KeyboardProps, KeyboardEvents, KeyboardLogic>(
  { id: "fourdle/keyboard" },
  render,
  { bind }
)

export default Keyboard
