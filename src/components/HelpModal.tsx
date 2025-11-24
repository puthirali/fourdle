import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { createRef } from "@duct-ui/core/ref"
import Modal, { type ModalLogic } from "@duct-ui/components/layout/modal"

export interface HelpModalProps {
  isOpen?: boolean
}

export interface HelpModalEvents extends BaseComponentEvents {}

export interface HelpModalLogic {
  open: () => void
  close: () => void
}

const innerModalRef = createRef<ModalLogic>()

type HelpTab = "help" | "variants"
const helpTabs: HelpTab[] = ["help", "variants"]

// JSX helper for tabs
function TabsList(props: { currentTab: HelpTab }) {
  const { currentTab } = props
  return (
    <div class="tabs-list">
      <button
        class={`tab-button ${currentTab === 'help' ? 'tab-active' : ''}`}
        data-tab="help"
      >
        HOW TO PLAY
      </button>
      <button
        class={`tab-button ${currentTab === 'variants' ? 'tab-active' : ''}`}
        data-tab="variants"
      >
        VARIANTS
      </button>
    </div>
  )
}

// JSX helper for help content
function HelpContent() {
  return (
    <div class="help-content">
      <h3>How to play?</h3>
      <p>
        The game play is identical to wordle. Except, when you guess, your
        guess applies to multiple words at the same time. The challenge is
        to make the guesses minimizing the total guesses across the words.
      </p>

      <h3>Some unexplained things</h3>
      <p>
        On smaller screens, it will be harder to play the game with just 2
        words showing up. The zoom mode on the toolbar allows you to focus
        on just one board at a time. The words you enter will go to all of
        them though, so be careful :)
      </p>
      <p>
        You can play 4, 3 or 2 boards at a time. To change the mode, use
        the dropdown in the header to switch between 4dle, 3dle, and 2dle.
      </p>

      <h3>Why Fourdle?</h3>
      <p>
        The internet is a place of joyous creation and sharing. It has
        been that way since I first *dialed-in* worried how much it would
        cost in telephone bills.
      </p>
      <p>
        Wordle has been a nostalgic throwback to those times. A free game
        that has managed to connect individuals across boundaries, brought
        joy to many. A personal toy becoming the worlds playground.
      </p>
      <p>
        Heeding to requests from the early fans and exploding as a
        cultural phenomenon. Fourdle is a tribute to wordle, attempting to
        satisfy a smaller niche of players that want something slightly
        more complex or just want more than 1 word puzzle :)
      </p>
    </div>
  )
}

// JSX helper for variants content
function VariantsContent() {
  return (
    <div class="variants-content">
      <h3>Other Wordle Variants</h3>
      <div class="variants-list">
        <a href="https://www.nytimes.com/games/wordle/index.html" target="_blank" class="variant-link-item">
          <div class="variant-link-text">Play today's wordle</div>
        </a>
        <div class="variant-divider"></div>
        <a href="https://qntm.org/files/wordle/index.html" target="_blank" class="variant-link-item">
          <div class="variant-link-text">[Adversarial] Play Absurdle</div>
        </a>
        <div class="variant-divider"></div>
        <a href="https://nerdlegame.com/" target="_blank" class="variant-link-item">
          <div class="variant-link-text">[Math] Play Nerdle!</div>
        </a>
        <div class="variant-divider"></div>
        <a href="https://mathszone.co.uk/resources/grid/ooodle/" target="_blank" class="variant-link-item">
          <div class="variant-link-text">[Math] Play Oodle!</div>
        </a>
        <div class="variant-divider"></div>
        <a href="https://hellowordl.net" target="_blank" class="variant-link-item">
          <div class="variant-link-text">[Upto 11 letter words] Play Hello Wordl!</div>
        </a>
        <div class="variant-divider"></div>
        <a href="https://eldrow.io/" target="_blank" class="variant-link-item">
          <div class="variant-link-text">[Puzzle] Play Reverse Wordle (Eldrow)!</div>
        </a>
      </div>
    </div>
  )
}

function render(props: BaseProps<HelpModalProps>) {
  const { isOpen = false, ...rest } = props

  return (
    <div class="help-modal-wrapper" {...renderProps(rest)}>
      <Modal
        isOpen={isOpen}
        contentPosition="mid-center"
        contentClass="help-modal-content"
        ref={innerModalRef}
      >
        <div class="help-modal-inner">
          <div class="modal-header">
            <h2>About / Help</h2>
            <button class="modal-close-button" data-modal-close>
              <svg viewBox="0 0 24 24" width="24" height="24" data-modal-close>
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="help-tabs" data-help-tabs>
              {/* Tabs will be rendered here */}
            </div>
            <div class="help-tab-content" data-help-content>
              {/* Content will be rendered here */}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: HelpModalProps): BindReturn<HelpModalLogic> {
  const tabsContainer = el.querySelector('[data-help-tabs]') as HTMLElement
  const contentContainer = el.querySelector('[data-help-content]') as HTMLElement

  if (!tabsContainer || !contentContainer) {
    return {
      open: () => {},
      close: () => {},
      release: () => {}
    }
  }

  let currentTab: HelpTab = "help"

  function renderTabs() {
    tabsContainer.innerHTML = TabsList({ currentTab }) as string

    // Re-attach event listeners after innerHTML update
    helpTabs.forEach(tab => {
      const btn = tabsContainer.querySelector(`[data-tab="${tab}"]`) as HTMLButtonElement
      if (btn) {
        btn.addEventListener('click', () => {
          currentTab = tab
          renderTabs()
          renderContent()
        })
      }
    })
  }

  function renderContent() {
    if (currentTab === 'help') {
      contentContainer.innerHTML = HelpContent() as string
    } else {
      contentContainer.innerHTML = VariantsContent() as string
    }
  }

  // Initial render
  renderTabs()
  renderContent()

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
    release: () => {}
  }
}

const HelpModal = createBlueprint<HelpModalProps, HelpModalEvents, HelpModalLogic>(
  { id: "fourdle/help-modal" },
  render,
  { bind }
)

export default HelpModal
