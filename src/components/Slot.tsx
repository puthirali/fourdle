import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"
import type { CharKey } from "@models/key"
import { emptyChar } from "@models/key"

// Props for Slot component
export interface SlotProps {
  boardIndex: number
  entryIndex: number
  slotIndex: number
  keyCap: CharKey
  isSolution: boolean
  isCommitted: boolean
  isInvalid: boolean
  screenHeight: "TALL" | "MEDIUM" | "SHORT" | "TINY"
  screenWidth: "WIDE" | "MEDIUM" | "NARROW"
}

// Events emitted by Slot
export interface SlotEvents extends BaseComponentEvents {}

// Component logic (no update methods needed - component updates itself)
export interface SlotLogic {}

function getSlotSize(screenHeight: string, screenWidth: string): string {
  if (screenHeight === "TINY" || !["MEDIUM", "WIDE"].includes(screenWidth)) {
    return "32px"
  }
  if (screenHeight === "SHORT" || !["MEDIUM", "WIDE"].includes(screenWidth)) {
    return "36px"
  }
  if (screenWidth !== "WIDE") {
    return "40px"
  }
  if (screenHeight === "MEDIUM") {
    return "48px"
  }
  return "64px"
}

function render(props: BaseProps<SlotProps>) {
  const { keyCap, isSolution, isCommitted, isInvalid, screenHeight, screenWidth, ...rest } = props

  const sz = getSlotSize(screenHeight, screenWidth)
  const isFlipped = isCommitted || isInvalid
  const flipDirection = isInvalid ? "horizontal" : "vertical"

  const flippedClass = isFlipped ? "flipped" : ""
  const directionClass = `flip-${flipDirection}`
  const modeClass = `mode-${keyCap.mode}`

  const text = keyCap.char.trim() === "" ? "\u00A0" : keyCap.char.toUpperCase()

  return (
    <div
      class={`slot-container ${flippedClass} ${directionClass}`}
      style={`width: ${sz}; height: ${sz};`}
      {...renderProps(rest)}
    >
      <div class="slot-card" style={`width: ${sz}; height: ${sz};`}>
        <div class="slot-face slot-front mode-OPEN" style={`width: ${sz}; height: ${sz};`} data-slot-front>
          {text}
        </div>
        <div class={`slot-face slot-back ${modeClass}`} style={`width: ${sz}; height: ${sz};`} data-slot-back>
          {text}
        </div>
      </div>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, props: SlotProps): BindReturn<SlotLogic> {
  const frontFace = el.querySelector('[data-slot-front]') as HTMLElement
  const backFace = el.querySelector('[data-slot-back]') as HTMLElement

  const { boardIndex, entryIndex, slotIndex } = props
  const stateService = getStateService()

  // Subscribe to granular slot-specific event
  const eventName = `slot:${boardIndex}:${entryIndex}:${slotIndex}` as any
  const handleSlotChange = (slotData: any) => {
    const keyCap = slotData.char || emptyChar
    const isCommitted = slotData.isCommitted
    const isInvalid = slotData.isInvalid

    const text = keyCap.char.trim() === "" ? "\u00A0" : keyCap.char.toUpperCase()
    const isFlipped = isCommitted || isInvalid
    const flipDirection = isInvalid ? "horizontal" : "vertical"

    // Update text content
    if (frontFace) frontFace.textContent = text
    if (backFace) backFace.textContent = text

    // Update flip state on root element
    el.classList.toggle('flipped', isFlipped)
    el.classList.remove('flip-horizontal', 'flip-vertical')
    el.classList.add(`flip-${flipDirection}`)

    // Update back face classes
    if (backFace) {
      backFace.className = `slot-face slot-back mode-${keyCap.mode}`
    }
  }

  stateService.on(eventName, handleSlotChange)

  return {
    release: () => {
      stateService.off(eventName, handleSlotChange)
    }
  }
}

const Slot = createBlueprint<SlotProps, SlotEvents, SlotLogic>(
  { id: "fourdle/slot" },
  render,
  { bind }
)

export default Slot
