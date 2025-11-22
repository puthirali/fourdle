import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { createRef } from "@duct-ui/core/ref"
import Modal, { type ModalLogic } from "@duct-ui/components/layout/modal"
import Select, { type SelectItem, type SelectLogic } from "@duct-ui/components/dropdown/select"
import { getStateService } from "@services/state-service"
import type { BoardNumber } from "@models/state"
import { titles } from "@models/state"

export interface SettingsModalProps {
  isOpen?: boolean
}

export interface SettingsModalEvents extends BaseComponentEvents {}

export interface SettingsModalLogic {
  open: () => void
  close: () => void
}

const innerModalRef = createRef<ModalLogic>()
const colorSelectRef = createRef<SelectLogic>()
const boardSelectRef = createRef<SelectLogic>()

// Handler functions
function handleColorChange(_el: HTMLElement, item: SelectItem, _index: number) {
  const isAccessible = item.label === "Accessible"
  const appEl = document.querySelector('.fourdle-app')
  if (appEl) {
    if (isAccessible) {
      appEl.classList.add('accessible')
    } else {
      appEl.classList.remove('accessible')
    }
  }

  // Save to localStorage
  localStorage.setItem('isAccessible', JSON.stringify(isAccessible))
}

function handleBoardChange(_el: HTMLElement, item: SelectItem, _index: number) {
  const stateService = getStateService()

  // Map label back to BoardNumber
  let newMode: BoardNumber = "four"
  if (item.label === titles.two) {
    newMode = "two"
  } else if (item.label === titles.three) {
    newMode = "three"
  } else if (item.label === titles.four) {
    newMode = "four"
  }

  // Update the mode in state service
  // This will emit 'modeChanged' event and GameContainer will refresh
  stateService.setMode(newMode)

  // Close modal
  const modalLogic = innerModalRef.current
  if (modalLogic?.hide) {
    modalLogic.hide()
  }
}

function render(props: BaseProps<SettingsModalProps>) {
  const { isOpen = false, ...rest } = props

  // Render with default values - actual state will be set in bind
  const colorItems: SelectItem[] = [
    { label: "Normal", description: "Standard colors", isSelected: true },
    { label: "Accessible", description: "High contrast colors", isSelected: false }
  ]

  const boardItems: SelectItem[] = [
    { label: titles.two, description: "Two boards at once", isSelected: false },
    { label: titles.three, description: "Three boards at once", isSelected: false },
    { label: titles.four, description: "Four boards at once", isSelected: true }
  ]

  return (
    <div class="settings-modal-wrapper" {...renderProps(rest)}>
      <Modal
        isOpen={isOpen}
        contentClass="settings-modal-content"
        ref={innerModalRef}
      >
        <div class="settings-modal-inner">
          <div class="settings-header">
            <button class="settings-close-button" data-settings-close>
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
            <h1>Settings</h1>
          </div>
          <div class="settings-body">
            <div class="settings-list">
              <div class="settings-item">
                <div class="settings-item-text">
                  <div class="settings-item-primary">Letter Colors</div>
                  <div class="settings-item-secondary">Accessibility</div>
                </div>
                <div class="settings-item-action">
                  <Select
                    items={colorItems}
                    class="settings-select"
                    buttonClass="btn btn-sm btn-outline"
                    menuClass="menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow"
                    labelClass="font-medium"
                    descriptionClass="text-sm text-base-content/70"
                    selectedIconClass="w-4 h-4 mr-2"
                    placement="bottom-end"
                    on:selectionChange={handleColorChange}
                    ref={colorSelectRef}
                  />
                </div>
              </div>
              <div class="settings-divider"></div>
              <div class="settings-item">
                <div class="settings-item-text">
                  <div class="settings-item-primary">Game Mode</div>
                  <div class="settings-item-secondary">Number of words to solve at a time?</div>
                </div>
                <div class="settings-item-action">
                  <Select
                    items={boardItems}
                    class="settings-select"
                    buttonClass="btn btn-sm btn-outline"
                    menuClass="menu bg-base-200 rounded-box z-[1] w-52 p-2 shadow"
                    labelClass="font-medium"
                    descriptionClass="text-sm text-base-content/70"
                    selectedIconClass="w-4 h-4 mr-2"
                    placement="bottom-end"
                    on:selectionChange={handleBoardChange}
                    ref={boardSelectRef}
                  />
                </div>
              </div>
              <div class="settings-divider"></div>
              <div class="settings-section-header">Wordle Links</div>
              <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" class="settings-link-item">
                <div class="settings-link-text">Play today's wordle</div>
              </a>
              <div class="settings-divider"></div>
              <a href="https://qntm.org/files/wordle/index.html" target="_blank" class="settings-link-item">
                <div class="settings-link-text">[Adversarial] Play Absurdle</div>
              </a>
              <div class="settings-divider"></div>
              <a href="https://nerdlegame.com/" target="_blank" class="settings-link-item">
                <div class="settings-link-text">[Math] Play Nerdle!</div>
              </a>
              <div class="settings-divider"></div>
              <a href="https://mathszone.co.uk/resources/grid/ooodle/" target="_blank" class="settings-link-item">
                <div class="settings-link-text">[Math] Play Oodle!</div>
              </a>
              <div class="settings-divider"></div>
              <a href="https://hellowordl.net" target="_blank" class="settings-link-item">
                <div class="settings-link-text">[Upto 11 letter words] Play Hello Wordl!</div>
              </a>
              <div class="settings-divider"></div>
              <a href="https://eldrow.io/" target="_blank" class="settings-link-item">
                <div class="settings-link-text">[Puzzle] Play Reverse Wordle (Eldrow)!</div>
              </a>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: SettingsModalProps): BindReturn<SettingsModalLogic> {
  const stateService = getStateService()
  const closeButton = el.querySelector('[data-settings-close]') as HTMLButtonElement

  if (!closeButton) {
    return {
      open: () => {},
      close: () => {},
      release: () => {}
    }
  }

  // Get current values from localStorage and state service
  const storedAccessible = localStorage.getItem('isAccessible')
  const isAccessible = storedAccessible ? JSON.parse(storedAccessible) : false

  const currentState = stateService.getCurrentState()
  const boardCount = currentState.boards.length
  const currentMode: BoardNumber = boardCount === 4 ? "four" : boardCount === 3 ? "three" : "two"

  // Apply accessibility class to app element
  const appEl = document.querySelector('.fourdle-app')
  if (appEl) {
    if (isAccessible) {
      appEl.classList.add('accessible')
    } else {
      appEl.classList.remove('accessible')
    }
  }

  // Update Select components to reflect current state
  setTimeout(() => {
    const colorSelect = colorSelectRef.current
    const boardSelect = boardSelectRef.current

    if (colorSelect) {
      // Select index 0 for Normal, 1 for Accessible
      const colorIndex = isAccessible ? 1 : 0
      colorSelect.selectItem(colorIndex)
    }

    if (boardSelect) {
      // Select index based on current mode: 0=two, 1=three, 2=four
      const boardIndex = currentMode === "two" ? 0 : currentMode === "three" ? 1 : 2
      boardSelect.selectItem(boardIndex)
    }
  }, 0)

  const handleClose = () => {
    const modalLogic = innerModalRef.current
    if (modalLogic?.hide) {
      modalLogic.hide()
    }
  }

  // Attach close button event listener
  closeButton.addEventListener('click', handleClose)

  return {
    open: () => {
      const modalLogic = innerModalRef.current
      if (modalLogic?.show) {
        modalLogic.show()
      }
    },
    close: () => {
      const modalLogic = innerModalRef.current
      if (modalLogic?.hide) {
        modalLogic.hide()
      }
    },
    release: () => {
      closeButton.removeEventListener('click', handleClose)
    }
  }
}

const SettingsModal = createBlueprint<SettingsModalProps, SettingsModalEvents, SettingsModalLogic>(
  { id: "fourdle/settings-modal" },
  render,
  { bind }
)

export default SettingsModal
