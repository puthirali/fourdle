import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { getStateService } from "@services/state-service"
import AutoPopper from "./AutoPopper"

// Props for InvalidEntryAlert component
export interface InvalidEntryAlertProps {}

// Events emitted by InvalidEntryAlert
export interface InvalidEntryAlertEvents extends BaseComponentEvents {}

// Component logic
export interface InvalidEntryAlertLogic {}

function render(props: BaseProps<InvalidEntryAlertProps>) {
  return (
    <div class="invalid-entry-alert" {...renderProps(props)}>
      <AutoPopper
        isOpen={false}
        message="Not in word list!"
        duration={1200}
        data-invalid-entry-popper
      />
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: InvalidEntryAlertProps): BindReturn<InvalidEntryAlertLogic> {
  const stateService = getStateService()
  const popper = el.querySelector('[data-invalid-entry-popper]') as HTMLElement

  if (!popper) {
    return { release: () => {} }
  }

  // Subscribe to invalid entry event
  const handleInvalidEntry = () => {
    popper.setAttribute('data-open', 'true')
  }

  stateService.on('invalidEntrySubmitted', handleInvalidEntry)

  return {
    release: () => {
      stateService.off('invalidEntrySubmitted', handleInvalidEntry)
    }
  }
}

const InvalidEntryAlert = createBlueprint<InvalidEntryAlertProps, InvalidEntryAlertEvents, InvalidEntryAlertLogic>(
  { id: "fourdle/invalid-entry-alert" },
  render,
  { bind }
)

export default InvalidEntryAlert
