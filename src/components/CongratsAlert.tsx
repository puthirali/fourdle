import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"
import AutoPopper from "./AutoPopper"

// Props for CongratsAlert component
export interface CongratsAlertProps {}

// Events emitted by CongratsAlert
export interface CongratsAlertEvents extends BaseComponentEvents {}

// Component logic
export interface CongratsAlertLogic {}

function render(props: BaseProps<CongratsAlertProps>) {
  return (
    <div class="congrats-alert" {...renderProps(props)}>
      <AutoPopper
        isOpen={false}
        message=""
        duration={2000}
        data-congrats-popper
      />
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: CongratsAlertProps): BindReturn<CongratsAlertLogic> {
  const stateService = getStateService()
  const popper = el.querySelector('[data-congrats-popper]') as HTMLElement

  if (!popper) {
    return { release: () => {} }
  }

  // Subscribe to game completed event
  const handleGameCompleted = () => {
    const results = stateService.getResults()
    const state = stateService.getCurrentState()
    const boardCount = state.boards.length
    const mode = boardCount === 4 ? "four" : boardCount === 3 ? "three" : "two"
    const result = results[mode]

    // Update the message
    const messageEl = popper.querySelector('.auto-popper-message')
    if (messageEl) {
      messageEl.textContent = result.message
    }

    // Show the popper
    popper.setAttribute('data-open', 'true')
  }

  stateService.on('gameCompleted', handleGameCompleted)

  return {
    release: () => {
      stateService.off('gameCompleted', handleGameCompleted)
    }
  }
}

const CongratsAlert = createBlueprint<CongratsAlertProps, CongratsAlertEvents, CongratsAlertLogic>(
  { id: "fourdle/congrats-alert" },
  render,
  { bind }
)

export default CongratsAlert
