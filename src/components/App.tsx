import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { createRef } from "@duct-ui/core/ref"
import { createStateService } from "@services/state-service"
import GameContainer from "./GameContainer"
import Keyboard from "./Keyboard"
import InvalidEntryAlert from "./InvalidEntryAlert"
import CongratsAlert from "./CongratsAlert"
import Header from "./Header"
import HelpModal, { type HelpModalLogic } from "./HelpModal"
import SummaryModal, { type SummaryModalLogic } from "./SummaryModal"

export interface AppEvents extends BaseComponentEvents {}

export interface AppLogic {}

export interface AppProps {
  'on:bind'?: (el: HTMLElement) => void
  'on:release'?: (el: HTMLElement) => void
}

const helpModalRef = createRef<HelpModalLogic>()
const summaryModalRef = createRef<SummaryModalLogic>()

function render(props: BaseProps<AppProps>) {
  const isAccessible = false // Can be made configurable later
  const accessibleClass = isAccessible ? "accessible" : ""

  return (
    <div class={`fourdle-app ${accessibleClass}`.trim()} {...renderProps(props)}>
      <div class="game-container">
        <Header
          on:help-click={() => {
            const modalLogic = helpModalRef.current
            if (modalLogic) {
              modalLogic.open()
            }
          }}
          on:summary-click={() => {
            const modalLogic = summaryModalRef.current
            if (modalLogic) {
              modalLogic.open()
            }
          }}
          on:zoom-click={() => {
            // Zoom is already toggled in Header via state service
          }}
        />
        <GameContainer screenHeight="MEDIUM" screenWidth="MEDIUM" numberOfRows={6} />
        <Keyboard screenHeight="MEDIUM" />
        <InvalidEntryAlert />
        <CongratsAlert />
      </div>
      <footer class="app-footer">
        <a href="https://duct-ui.org" target="_blank" rel="noopener noreferrer" class="footer-link">
          <span>Built with duct-ui</span>
          <img src="https://duct-ui.org/assets/duct-logo-DTh7D3qn.svg" alt="Duct" class="duct-logo" />
        </a>
      </footer>
      <HelpModal isOpen={false} ref={helpModalRef} />
      <SummaryModal isOpen={false} ref={summaryModalRef} />
    </div>
  )
}

function bind(_el: HTMLElement): BindReturn<AppLogic> {
  // Initialize state service (only works in browser where localStorage exists)
  const stateService = createStateService()
  let summaryTimeout: ReturnType<typeof setTimeout> | null = null

  // Open summary modal with 2 second delay after game completes
  const handleGameCompleted = () => {
    if (summaryTimeout) {
      clearTimeout(summaryTimeout)
    }
    summaryTimeout = setTimeout(() => {
      const modalLogic = summaryModalRef.current
      if (modalLogic) {
        modalLogic.open()
      }
    }, 2000)
  }

  stateService.on('gameCompleted', handleGameCompleted)

  return {
    release: () => {
      stateService.off('gameCompleted', handleGameCompleted)
      if (summaryTimeout) {
        clearTimeout(summaryTimeout)
      }
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
