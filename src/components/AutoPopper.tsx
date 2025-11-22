import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"

// Props for AutoPopper component
export interface AutoPopperProps {
  isOpen: boolean
  message: string
  duration?: number
}

// Events emitted by AutoPopper
export interface AutoPopperEvents extends BaseComponentEvents {
  close: () => void
}

// Component logic
export interface AutoPopperLogic {}

function render(props: BaseProps<AutoPopperProps>) {
  const { isOpen, message, duration = 1200, ...rest } = props

  return (
    <div
      class="auto-popper"
      data-open={isOpen}
      {...renderProps(rest)}
    >
      <div class="auto-popper-message">
        {message}
      </div>
    </div>
  )
}

function bind(el: HTMLElement, eventEmitter: any, props: AutoPopperProps): BindReturn<AutoPopperLogic> {
  const { duration = 1200 } = props
  let timeout: ReturnType<typeof setTimeout> | null = null

  const clearTimer = () => {
    if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    clearTimer()

    if (isOpen) {
      timeout = setTimeout(() => {
        el.setAttribute('data-open', 'false')
        eventEmitter.emit('close', [])
        timeout = null
      }, duration)
    }
  }

  // Watch for data-open attribute changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'data-open') {
        const isOpen = el.getAttribute('data-open') === 'true'
        handleOpenChange(isOpen)
      }
    })
  })

  observer.observe(el, { attributes: true })

  // Set up initial state
  handleOpenChange(props.isOpen)

  return {
    release: () => {
      clearTimer()
      observer.disconnect()
    }
  }
}

const AutoPopper = createBlueprint<AutoPopperProps, AutoPopperEvents, AutoPopperLogic>(
  { id: "fourdle/auto-popper" },
  render,
  { bind }
)

export default AutoPopper
