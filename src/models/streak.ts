import {pipe} from "@effect-ts/core/Function"
import {BoardNumber, Result} from "./state"

export interface Stats {
  readonly totalDays: number
  readonly currentStreak: number
  readonly longestStreak: number
  readonly longestGap: number
  readonly lastPuzzle: number
}

export interface GameStats extends Stats {
  readonly minimum: number
  readonly maximum: number
  readonly trials: readonly number[]
}

export function trialCount(stat: GameStats) {
  return stat.trials.reduce((b, a) => a + b, 0)
}

export type GameRecord = {readonly [num in BoardNumber]: GameStats}

export interface Streak extends Stats {
  readonly record: GameRecord
}

function updateStats(result: Result) {
  return <T extends Stats>(stats: T): T => {
    if (result.puzzleNumber === stats.lastPuzzle) {
      return stats
    }
    const gap =
      stats.lastPuzzle === 0
        ? 0
        : result.puzzleNumber - stats.lastPuzzle - 1
    const streakContinues = stats.lastPuzzle === result.puzzleNumber - 1

    const currentStreak = streakContinues ? stats.currentStreak + 1 : 1
    const longestStreak = Math.max(stats.longestStreak, currentStreak)
    const longestGap = Math.max(stats.longestGap, gap)

    return {
      ...stats,
      totalDays: stats.totalDays + 1,
      longestStreak,
      currentStreak,
      longestGap,
      lastPuzzle: result.puzzleNumber,
    } as T
  }
}

function updateRecord(result: Result) {
  return (record: GameStats): GameStats => {
    if (result.puzzleNumber === record.lastPuzzle) return record
    const total = trialCount(record)
    const min =
      record.minimum > 0
        ? Math.min(record.minimum, result.minTrials)
        : result.minTrials
    const max =
      record.maximum > 0
        ? Math.max(record.maximum, result.maxTrials)
        : result.maxTrials
    const trials =
      total <= 0 || total > result.trialCount
        ? result.trials
        : record.trials
    return pipe(record, updateStats(result), (r: GameStats) => ({
      ...r,
      minimum: min,
      maximum: max,
      trials,
    }))
  }
}

export function incStreak(result: Result) {
  return (streak: Streak): Streak =>
    pipe(streak, updateStats(result), (s: Streak) => ({
      ...s,
      record: {
        ...s.record,
        [result.mode]: updateRecord(result)(s.record[result.mode]),
      },
    }))
}

export const emptyStats = (): Stats => ({
  totalDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  longestGap: 0,
  lastPuzzle: 0,
})

export const emptyGameStats = (mode: BoardNumber): GameStats => ({
  ...emptyStats(),
  maximum: 0,
  minimum: 0,
  trials: Array(mode === "four" ? 4 : mode === "three" ? 3 : 2).fill(0),
})

export const modesRemaining = (
  streak: Streak,
  dayNumber: number,
): readonly BoardNumber[] => {
  return pipe(
    [] as readonly BoardNumber[],
    (r) =>
      streak.record.four.lastPuzzle !== dayNumber
        ? [...r, "four" as BoardNumber]
        : r,
    (r) =>
      streak.record.three.lastPuzzle !== dayNumber
        ? [...r, "three" as BoardNumber]
        : r,
    (r) =>
      streak.record.two.lastPuzzle !== dayNumber ? [...r, "two"] : r,
  )
}

export const emptyStreak = (): Streak => ({
  ...emptyStats(),
  record: {
    two: emptyGameStats("two"),
    three: emptyGameStats("three"),
    four: emptyGameStats("four"),
  },
})

function overlayStat(stat1: GameStats) {
  return (stat2: GameStats): GameStats => {
    const total1 = trialCount(stat1)
    const total2 = trialCount(stat2)
    const min =
      stat1.minimum > 0 && stat2.minimum > 0
        ? Math.min(stat1.minimum, stat2.minimum)
        : stat1.minimum > 0
        ? stat1.minimum
        : stat2.minimum
    const max =
      stat1.maximum > 0 && stat2.maximum > 0
        ? Math.max(stat1.maximum, stat2.maximum)
        : stat1.maximum > 0
        ? stat1.maximum
        : stat2.maximum
    const trials =
      total1 <= 0 || (total1 > total2 && total2 > 0)
        ? stat2.trials
        : stat1.trials
    return {
      ...stat1,
      minimum: min,
      maximum: max,
      trials,
    }
  }
}

export function overallStats(streak: Streak): GameStats {
  return pipe(
    streak.record.four,
    overlayStat(streak.record.three),
    overlayStat(streak.record.two),
  )
}
