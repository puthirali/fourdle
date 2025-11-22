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
                You can play 4, 3 or 2 boards at a time. To change the mode, you
                have to go the settings modal (The gear icon). Will make this
                easier, in the coming days.
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
          </div>
        </div>
      </Modal>
    </div>
  )
}

function bind(_el: HTMLElement, _eventEmitter: any, _props: HelpModalProps): BindReturn<HelpModalLogic> {
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
