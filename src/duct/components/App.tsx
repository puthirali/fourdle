import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { createStateService } from "@services/state-service"
import Board from "./Board"
import Keyboard from "./Keyboard"
import InvalidEntryAlert from "./InvalidEntryAlert"

export interface AppEvents extends BaseComponentEvents {}

export interface AppLogic {}

export interface AppProps {
  'on:bind'?: (el: HTMLElement) => void
  'on:release'?: (el: HTMLElement) => void
}

function render(props: BaseProps<AppProps>) {
  const isAccessible = false // Can be made configurable later
  const accessibleClass = isAccessible ? "accessible" : ""

  return (
    <div class={`fourdle-app ${accessibleClass}`.trim()} {...renderProps(props)}>
      <div class="game-container">
        <div class="header">
          <h1>Fourdle</h1>
        </div>
        <div class="boards-container" data-boards-container>
          {/* Boards will be rendered in bind() */}
        </div>
        <Keyboard screenHeight="MEDIUM" />
        <InvalidEntryAlert />
      </div>
    </div>
  )
}

function bind(el: HTMLElement): BindReturn<AppLogic> {
  // Initialize state service (only works in browser where localStorage exists)
  const stateService = createStateService()
  const boardsContainer = el.querySelector('[data-boards-container]')

  if (!boardsContainer) {
    console.error('Boards container not found')
    return { release: () => {} }
  }

  // Render boards (they will subscribe to state changes themselves)
  const state = stateService.getCurrentState()
  const screenHeight = "MEDIUM"
  const screenWidth = "MEDIUM"
  const numberOfRows = 6

  state.boards.forEach((bs, boardIndex) => {
    const boardHtml = Board({
      board: bs.board,
      boardIndex,
      numberOfRows,
      screenHeight,
      screenWidth
    }) as string
    boardsContainer.insertAdjacentHTML('beforeend', boardHtml)
  })

  console.log('Fourdle Duct App initialized!')
  console.log('Current state:', stateService.getCurrentState())

  return {
    release: () => {
      console.log('Fourdle Duct App destroyed')
    }
  }
}

const id = { id: "fourdle/app" }

const App = createBlueprint<AppProps, AppEvents, AppLogic>(
  id,
  render,
  { bind }
)

export default App
