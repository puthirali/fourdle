import {DateTime} from "luxon"
import {Result} from "../../models/state"
import {incStreak, overallStats, Streak} from "../../models/streak"

const boardResults = [
  {
    isSolved: true,
    trials: 4,
    display: "",
    hasInvalidEntry: false,
  },
  {
    isSolved: true,
    trials: 7,
    display: "",
    hasInvalidEntry: false,
  },
  {
    isSolved: true,
    trials: 9,
    display: "",
    hasInvalidEntry: false,
  },
  {
    isSolved: true,
    trials: 5,
    display: "",
    hasInvalidEntry: false,
  },
]

const result: Result = {
  hasInvalidEntries: false,
  puzzleNumber: 100,
  mode: "four",
  startTime: DateTime.utc().toISO(),
  finishTime: DateTime.utc().toISO(),
  time: "",
  boardResults,
  trials: [4, 7, 9, 5],
  minTrials: 4,
  maxTrials: 9,
  trialCount: 25,
  display: "",
  shareScore: "",
  isSolved: true,
  message: "",
  shareTitle: "",
}

const streaking: Streak = {
  totalDays: 4,
  currentStreak: 3,
  longestStreak: 3,
  longestGap: 10,
  lastPuzzle: 99,
  record: {
    four: {
      totalDays: 2,
      currentStreak: 2,
      longestStreak: 2,
      longestGap: 0,
      lastPuzzle: 99,
      minimum: 3,
      maximum: 16,
      trials: [8, 3, 7, 4],
    },
    three: {
      totalDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      longestGap: 10,
      lastPuzzle: 0,
      minimum: 0,
      maximum: 0,
      trials: [],
    },
    two: {
      totalDays: 4,
      currentStreak: 3,
      longestStreak: 3,
      longestGap: 1,
      lastPuzzle: 99,
      minimum: 4,
      maximum: 8,
      trials: [8, 4],
    },
  },
}

describe("Streak", () => {
  describe("Update", () => {
    it("Continues streak", () => {
      const updated = incStreak(result)(streaking)
      expect(updated.totalDays).toBe(5)
      expect(updated.currentStreak).toBe(4)
      expect(updated.longestStreak).toBe(4)
      expect(updated.longestGap).toBe(10)
      expect(updated.lastPuzzle).toBe(100)
    })
    it("Breaks streak", () => {
      const updated = incStreak({...result, puzzleNumber: 120})(
        streaking,
      )
      expect(updated.totalDays).toBe(5)
      expect(updated.currentStreak).toBe(1)
      expect(updated.longestStreak).toBe(3)
      expect(updated.longestGap).toBe(20)
      expect(updated.lastPuzzle).toBe(120)
    })
    it("Updates the overall stats", () => {
      const updated = incStreak(result)(streaking)
      const overall = overallStats(updated)
      expect(overall.minimum).toBe(3)
      expect(overall.maximum).toBe(16)
      expect(overall.trials).toEqual([8, 4])
    })
    it("Does not update other modes", () => {
      const updated = incStreak(result)(streaking)
      expect(updated.record.three).toEqual(streaking.record.three)
      expect(updated.record.two).toEqual(streaking.record.two)
      expect(updated.record.four).not.toEqual(streaking.record.four)
    })
    it("Does not do updates for the same day", () => {
      const updated = incStreak({
        ...result,
        puzzleNumber: streaking.lastPuzzle,
      })(streaking)
      expect(updated.record.three).toEqual(streaking.record.three)
      expect(updated.record.two).toEqual(streaking.record.two)
      expect(updated.record.four).toEqual(streaking.record.four)
    })
  })
})
