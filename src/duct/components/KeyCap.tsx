import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps } from "@duct-ui/core/blueprint"
import { pipe } from "effect"
import * as Match from "effect/Match"
import type { CharKey, ControlKey, Key } from "@models/key"
import { isSameKey } from "@models/key"
import { getStateService } from "@services/state-service"
import { getKey } from "@models/state"

// Props for KeyCap component
export interface KeyCapProps {
  keyCap: Key
  screenHeight: "TALL" | "MEDIUM" | "TINY"
}

// Events emitted by KeyCap
export interface KeyCapEvents extends BaseComponentEvents {
  keypress: (key: Key) => void
}

// Component logic (stateless for this simple button)
export interface KeyCapLogic {}

function renderControlKey(
  keyCap: ControlKey,
  screenHeight: string,
  props: Record<string, any>
) {
  const screenClass = `screen-${screenHeight.toLowerCase()}`
  const className = `key-button ctrl-key ${screenClass} ${keyCap.ctrl}`

  const icon = keyCap.ctrl === "BACKSPACE"
    ? `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7.07L2.4 12l4.66-7H22v14zm-11.59-2L14 13.41 17.59 17 19 15.59 15.41 12 19 8.41 17.59 7 14 10.59 10.41 7 9 8.41 12.59 12 9 15.59z"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7h-2z"/></svg>`

  return (
    <button
      class={className}
      data-key={JSON.stringify(keyCap)}
      {...renderProps(props)}
    >
      {icon}
    </button>
  )
}

function renderCharKey(
  keyCap: CharKey,
  screenHeight: string,
  props: Record<string, any>
) {
  const screenClass = `screen-${screenHeight.toLowerCase()}`
  const className = `key-button ${screenClass} mode-${keyCap.mode}`

  const text = keyCap.char.trim() === "" ? "&nbsp;" : keyCap.char.toUpperCase()

  return (
    <button
      class={className}
      data-key={JSON.stringify(keyCap)}
      {...renderProps(props)}
    >
      {text}
    </button>
  )
}

function render(props: BaseProps<KeyCapProps>) {
  const { keyCap, screenHeight, ...rest } = props

  return Match.value(keyCap).pipe(
    Match.tag("Char", (ck) => renderCharKey(ck, screenHeight, rest)),
    Match.tag("Control", (ck) => renderControlKey(ck, screenHeight, rest)),
    Match.exhaustive,
  ) as JSX.Element
}

function bind(el: HTMLElement, _eventEmitter: any, props: KeyCapProps): { release: () => void } {
  const { keyCap } = props
  const stateService = getStateService()

  // In Duct, el is the root element returned by render (the button itself)
  const button = el as HTMLButtonElement

  // Animate button press
  const animatePress = () => {
    button.classList.add('key-pressed')
    setTimeout(() => {
      button.classList.remove('key-pressed')
    }, 800)
  }

  const handleClick = (e: Event) => {
    const target = e.currentTarget as HTMLElement
    const keyData = target.getAttribute('data-key')
    if (keyData) {
      const key = JSON.parse(keyData) as Key
      animatePress()
      el.dispatchEvent(new CustomEvent('keypress', { detail: key, bubbles: true }))
    }
  }

  // Update button mode based on state changes (only for CharKey)
  const updateFromState = () => {
    if (keyCap._tag === 'Char' && button) {
      const currentState = stateService.getCurrentState()
      const letterState = currentState.letterState
      const updatedKey = pipe(letterState, getKey(keyCap.char))

      if (updatedKey._tag === 'Char') {
        // Update the mode class
        button.classList.remove('mode-OPEN', 'mode-MISS', 'mode-HIT', 'mode-BULLSEYE', 'mode-ERROR')
        button.classList.add(`mode-${updatedKey.mode}`)

        // Update the stored key data with new mode
        button.setAttribute('data-key', JSON.stringify(updatedKey))
      }
    }
  }

  // Listen for keyPressed events from state service (for keyboard input animation)
  const handleKeyPressed = (pressedKey: Key) => {
    // Check if this is the key that was pressed (ignore mode)
    const isMatch = isSameKey(keyCap, pressedKey)

    if (isMatch) {
      animatePress()
    }
  }

  // Subscribe to state changes (only for CharKey)
  const handleStateChange = () => {
    updateFromState()
  }

  if (keyCap._tag === 'Char') {
    stateService.on('stateChanged', handleStateChange)
    // Initialize with current state on first render
    updateFromState()
  }

  // Subscribe to keyPressed events for animation
  stateService.on('keyPressed', handleKeyPressed)

  el.addEventListener('click', handleClick)

  return {
    release: () => {
      if (keyCap._tag === 'Char') {
        stateService.off('stateChanged', handleStateChange)
      }
      stateService.off('keyPressed', handleKeyPressed)
      el.removeEventListener('click', handleClick)
    }
  }
}

const KeyCap = createBlueprint<KeyCapProps, KeyCapEvents, KeyCapLogic>(
  { id: "fourdle/keycap" },
  render,
  { bind }
)

export default KeyCap
