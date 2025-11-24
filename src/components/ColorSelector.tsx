import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"

export interface ColorSelectorProps {}

export interface ColorSelectorEvents extends BaseComponentEvents {}

export interface ColorSelectorLogic {}

function render(props: BaseProps<ColorSelectorProps>) {
  return (
    <div class="color-selector" {...renderProps(props)}>
      <button class="color-selector-button" data-color-button title="Color Mode">
        <span class="color-icon" data-color-icon></span>
      </button>
      <div class="color-dropdown-menu" data-color-menu>
        <button class="color-menu-item" data-color-option="normal">
          <span class="color-menu-icon normal-icon"></span>
          <div class="color-menu-content">
            <span class="color-menu-text">Normal</span>
            <span class="color-menu-desc">Standard colors</span>
          </div>
        </button>
        <button class="color-menu-item" data-color-option="accessible">
          <span class="color-menu-icon accessible-icon"></span>
          <div class="color-menu-content">
            <span class="color-menu-text">Accessible</span>
            <span class="color-menu-desc">High contrast colors</span>
          </div>
        </button>
      </div>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: ColorSelectorProps): BindReturn<ColorSelectorLogic> {
  const button = el.querySelector('[data-color-button]') as HTMLButtonElement
  const menu = el.querySelector('[data-color-menu]') as HTMLElement
  const icon = el.querySelector('[data-color-icon]') as HTMLElement
  const normalOption = el.querySelector('[data-color-option="normal"]') as HTMLButtonElement
  const accessibleOption = el.querySelector('[data-color-option="accessible"]') as HTMLButtonElement

  if (!button || !menu || !icon || !normalOption || !accessibleOption) {
    return { release: () => {} }
  }

  let isOpen = false

  // Get initial state from localStorage
  const storedAccessible = localStorage.getItem('isAccessible')
  let isAccessible = storedAccessible ? JSON.parse(storedAccessible) : false

  // Apply accessibility class to app element
  const updateAppClass = (accessible: boolean) => {
    const appEl = document.querySelector('.fourdle-app')
    if (appEl) {
      if (accessible) {
        appEl.classList.add('accessible')
      } else {
        appEl.classList.remove('accessible')
      }
    }
  }

  // Update icon color
  const updateIcon = (accessible: boolean) => {
    if (accessible) {
      icon.classList.add('accessible-color')
      icon.classList.remove('normal-color')
    } else {
      icon.classList.add('normal-color')
      icon.classList.remove('accessible-color')
    }
  }

  // Update active state in menu
  const updateMenuActive = (accessible: boolean) => {
    if (accessible) {
      accessibleOption.classList.add('active')
      normalOption.classList.remove('active')
    } else {
      normalOption.classList.add('active')
      accessibleOption.classList.remove('active')
    }
  }

  // Toggle dropdown
  const toggleDropdown = () => {
    isOpen = !isOpen
    if (isOpen) {
      menu.classList.add('open')
    } else {
      menu.classList.remove('open')
    }
  }

  const closeDropdown = () => {
    isOpen = false
    menu.classList.remove('open')
  }

  // Handle selection
  const selectMode = (accessible: boolean) => {
    isAccessible = accessible
    updateAppClass(isAccessible)
    updateIcon(isAccessible)
    updateMenuActive(isAccessible)
    localStorage.setItem('isAccessible', JSON.stringify(isAccessible))
    closeDropdown()
  }

  // Event handlers
  const handleButtonClick = (e: Event) => {
    e.stopPropagation()
    toggleDropdown()
  }

  const handleNormalClick = () => {
    selectMode(false)
  }

  const handleAccessibleClick = () => {
    selectMode(true)
  }

  const handleClickOutside = (e: Event) => {
    if (isOpen && !el.contains(e.target as Node)) {
      closeDropdown()
    }
  }

  button.addEventListener('click', handleButtonClick)
  normalOption.addEventListener('click', handleNormalClick)
  accessibleOption.addEventListener('click', handleAccessibleClick)
  document.addEventListener('click', handleClickOutside)

  // Initialize
  updateAppClass(isAccessible)
  updateIcon(isAccessible)
  updateMenuActive(isAccessible)

  return {
    release: () => {
      button.removeEventListener('click', handleButtonClick)
      normalOption.removeEventListener('click', handleNormalClick)
      accessibleOption.removeEventListener('click', handleAccessibleClick)
      document.removeEventListener('click', handleClickOutside)
    }
  }
}

const ColorSelector = createBlueprint<ColorSelectorProps, ColorSelectorEvents, ColorSelectorLogic>(
  { id: "fourdle/color-selector" },
  render,
  { bind }
)

export default ColorSelector
