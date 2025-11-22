import { createBlueprint, type BaseComponentEvents, type BaseProps, renderProps, type BindReturn } from "@duct-ui/core/blueprint"
import { createRef } from "@duct-ui/core/ref"
import Modal, { type ModalLogic } from "@duct-ui/components/layout/modal"
import { getStateService } from "@services/state-service"
import type { BoardNumber, DayResults, Result } from "../../models/state"
import type { GameStats, Streak } from "../../models/streak"
import { modesRemaining, overallStats, trialCount } from "../../models/streak"
import { titles } from "../../models/state"

export interface SummaryModalProps {
  isOpen?: boolean
}

export interface SummaryModalEvents extends BaseComponentEvents {}

export interface SummaryModalLogic {
  open: () => void
  close: () => void
}

const innerModalRef = createRef<ModalLogic>()

type StatTabs = "all" | "2dle" | "3dle" | "4dle"
const tabTags: StatTabs[] = ["all", "2dle", "3dle", "4dle"]

function stats(t: StatTabs, streak: Streak): GameStats {
  return t === "all"
    ? overallStats(streak)
    : streak.record[t === "2dle" ? "two" : t === "3dle" ? "three" : "four"]
}

function fromTabTag(t: StatTabs): BoardNumber | null {
  return t === "2dle"
    ? "two"
    : t === "3dle"
    ? "three"
    : t === "4dle"
    ? "four"
    : null
}

function resultFromTabTag(t: StatTabs, results: DayResults, mode: BoardNumber): Result {
  const m = fromTabTag(t)
  return m === null ? results[mode] : results[m]
}

// JSX helper functions for dynamic content
function TabsList(props: { currentTab: StatTabs }) {
  const { currentTab } = props
  return (
    <div class="tabs-list">
      {tabTags.map(t => (
        <button
          class={`tab-button ${t === currentTab ? 'tab-active' : ''}`}
          data-tab={t}
        >
          {t.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

function StatsContent(props: { stat: GameStats; result: Result }) {
  const { stat, result } = props
  return (
    <div class="stats-list">
      <div class="stat-section">
        <div class="stat-section-label">Plays</div>
        <div class="stat-chips">
          <span class={`stat-chip ${result.isSolved ? 'chip-success' : ''}`}>
            Total: {stat.totalDays}
          </span>
          <span class={`stat-chip ${result.isSolved && stat.currentStreak === stat.longestStreak ? 'chip-success' : ''}`}>
            Streak: {stat.longestStreak}
          </span>
          <span class={`stat-chip ${stat.longestGap === result.puzzleNumber - stat.lastPuzzle ? 'chip-success' : ''}`}>
            Gap: {stat.longestGap}
          </span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-section">
        <div class="stat-section-label">Guesses</div>
        <div class="stat-chips">
          <span class={`stat-chip ${result.minTrials === stat.minimum ? 'chip-success' : ''}`}>
            Min: {stat.minimum}
          </span>
          <span class={`stat-chip ${result.maxTrials === stat.maximum ? 'chip-success' : ''}`}>
            Max: {stat.maximum}
          </span>
          <span class={`stat-chip ${result.trialCount === trialCount(stat) ? 'chip-success' : ''}`}>
            Total: {trialCount(stat)}
          </span>
        </div>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-section">
        <div class="stat-section-label">Trials</div>
        <div class="stat-chips-vertical">
          <span class={`stat-chip ${result.trialCount === trialCount(stat) ? 'chip-success' : ''}`}>
            Best: {stat.trials.join(" | ")}
          </span>
          {result.isSolved && (
            <span class={`stat-chip ${result.trialCount === trialCount(stat) ? 'chip-success' : ''}`}>
              Now: {result.trials.join(" | ")}
            </span>
          )}
        </div>
      </div>
      <div class="stat-divider"></div>
    </div>
  )
}

function PlayButtons(props: { allModes: BoardNumber[]; currentMode: BoardNumber; currentResults: DayResults }) {
  const { allModes, currentMode, currentResults } = props

  return (
    <>
      {allModes.map(n => {
        const modeResult = currentResults[n]
        const isSolved = modeResult.isSolved
        const hasEntries = modeResult.trialCount > 0 || modeResult.boardResults.some(br => br.trials > 0)

        let indicator = ''
        if (isSolved) {
          indicator = ' ✓'
        } else if (hasEntries) {
          indicator = ' ●'
        }

        return (
          <button
            class={`play-button ${n === currentMode ? 'play-button-active' : ''}`}
            data-play-mode={n}
          >
            {titles[n]}{indicator && <span class={isSolved ? 'play-status-complete' : 'play-status-progress'}>{indicator}</span>}
          </button>
        )
      })}
    </>
  )
}

function render(props: BaseProps<SummaryModalProps>) {
  const { isOpen = false, ...rest } = props

  return (
    <div class="summary-modal-wrapper" {...renderProps(rest)}>
      <Modal
        isOpen={isOpen}
        contentPosition="mid-center"
        contentClass="summary-modal-content"
        ref={innerModalRef}
      >
        <div class="summary-modal-inner">
          <div class="modal-header">
            <h2>Game Summary</h2>
            <button class="modal-close-button" data-modal-close>
              <svg viewBox="0 0 24 24" width="24" height="24" data-modal-close>
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <div class="stats-tabs" data-stats-tabs>
              {/* Tabs will be rendered here */}
            </div>
            <div class="stats-content" data-stats-content>
              {/* Stats content will be rendered here */}
            </div>
            <div class="play-section">
              <div class="play-list">
                <div class="play-label">Play</div>
                <div class="play-buttons" data-play-buttons>
                  {/* Play buttons will be rendered here */}
                </div>
              </div>
              <div class="stat-divider"></div>
            </div>
            <div class="modal-actions">
              <span class="copied-message" data-copied-message></span>
              <button class="modal-action-button" data-share-button>
                Share
              </button>
              <button class="modal-action-button" data-close-button>
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function bind(el: HTMLElement, _eventEmitter: any, _props: SummaryModalProps): BindReturn<SummaryModalLogic> {
  const stateService = getStateService()
  const tabsContainer = el.querySelector('[data-stats-tabs]') as HTMLElement
  const contentContainer = el.querySelector('[data-stats-content]') as HTMLElement
  const playButtons = el.querySelector('[data-play-buttons]') as HTMLElement
  const shareButton = el.querySelector('[data-share-button]') as HTMLButtonElement
  const closeButton = el.querySelector('[data-close-button]') as HTMLButtonElement
  const copiedMessage = el.querySelector('[data-copied-message]') as HTMLElement

  if (!tabsContainer || !contentContainer || !playButtons || !shareButton || !closeButton || !copiedMessage) {
    return {
      open: () => {},
      close: () => {},
      release: () => {}
    }
  }

  let currentTab: StatTabs = "4dle"
  let currentMode: BoardNumber = "four"
  let currentResults: DayResults
  let currentStreak: Streak
  let copiedTimeout: ReturnType<typeof setTimeout> | null = null

  function renderTabs() {
    tabsContainer.innerHTML = TabsList({ currentTab }) as string

    // Re-attach event listeners after innerHTML update
    tabTags.forEach(t => {
      const btn = tabsContainer.querySelector(`[data-tab="${t}"]`) as HTMLButtonElement
      if (btn) {
        btn.addEventListener('click', () => {
          currentTab = t
          renderTabs()
          renderStatsContent()
        })
      }
    })
  }

  function renderStatsContent() {
    const stat = stats(currentTab, currentStreak)
    const result = resultFromTabTag(currentTab, currentResults, currentMode)
    contentContainer.innerHTML = StatsContent({ stat, result }) as string
  }

  function renderPlaySection() {
    const allModes: BoardNumber[] = ["two", "three", "four"]
    playButtons.innerHTML = PlayButtons({ allModes, currentMode, currentResults }) as string

    allModes.forEach(n => {
      const btn = playButtons.querySelector(`[data-play-mode="${n}"]`) as HTMLButtonElement
      if (btn) {
        btn.addEventListener('click', () => {
          stateService.setMode(n)
          const modalLogic = innerModalRef.current
          if (modalLogic?.hide) {
            modalLogic.hide()
          }
        })
      }
    })
  }

  function updateContent() {
    currentResults = stateService.getResults()
    currentStreak = stateService.getStreak()

    // Set current mode based on board count
    const boardCount = stateService.getCurrentState().boards.length
    currentMode = boardCount === 4 ? "four" : boardCount === 3 ? "three" : "two"
    currentTab = currentMode === "four" ? "4dle" : currentMode === "three" ? "3dle" : "2dle"

    renderTabs()
    renderStatsContent()
    renderPlaySection()
  }

  const handleShare = async () => {
    const result = resultFromTabTag(currentTab, currentResults, currentMode)

    try {
      await navigator.share({
        title: result.shareTitle,
        text: result.shareScore
      })
    } catch (err) {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(result.shareScore)
        copiedMessage.textContent = 'Copied!'
        if (copiedTimeout) {
          clearTimeout(copiedTimeout)
        }
        copiedTimeout = setTimeout(() => {
          copiedMessage.textContent = ''
        }, 10000)
      } catch (clipErr) {
        console.error('Failed to copy to clipboard:', clipErr)
      }
    }
  }

  const handleClose = () => {
    const modalLogic = innerModalRef.current
    if (modalLogic?.hide) {
      modalLogic.hide()
    }
  }

  shareButton.addEventListener('click', handleShare)
  closeButton.addEventListener('click', handleClose)

  return {
    open: () => {
      const modalLogic = innerModalRef.current
      if (modalLogic?.show) {
        updateContent()
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
      shareButton.removeEventListener('click', handleShare)
      closeButton.removeEventListener('click', handleClose)
      if (copiedTimeout) {
        clearTimeout(copiedTimeout)
      }
    }
  }
}

const SummaryModal = createBlueprint<SummaryModalProps, SummaryModalEvents, SummaryModalLogic>(
  { id: "fourdle/summary-modal" },
  render,
  { bind }
)

export default SummaryModal
