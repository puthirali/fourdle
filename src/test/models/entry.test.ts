import { pipe } from "effect"
import {
  areDistributionsEqual,
  checkEntry,
  fromSolution,
  fromWord,
  getDistribution,
  normalizeCharDist,
} from "../../models/entry"

const solution = "sweat"
const solutionDist = pipe(fromSolution(solution), getDistribution)
describe("Entry", () => {
  describe("distributions", () => {
    it("Returns true when we check if a === a", () => {
      expect(areDistributionsEqual(solutionDist, solutionDist)).toBe(
        true,
      )
    })
  })
  describe("normalizeCharDist", () => {
    it("doesn't change the distribution if everything is a BULLSEYE", () => {
      const normalized = normalizeCharDist(solution)(solutionDist)
      expect(areDistributionsEqual(normalized, solutionDist)).toBe(true)
    })
    it.each([
      "sewer",
      "sweee",
      "eaaaa",
      "eeaaa",
      "eeeaa",
      "eeeea",
      "eeeee",
      "aeeee",
      "aaeee",
      "aaaee",
      "aaaae",
      "aaaaa",
    ])("handles repeating characters properly", (word: string) => {
      const normalized = pipe(
        word,
        fromWord,
        checkEntry(solution, true),
        getDistribution,
      )
      const countE = word
        .split("")
        .reduce((n, c) => (c === "e" ? n + 1 : n), 0)
      expect(normalized.e).toHaveLength(countE)
      const bulls = normalized.e.filter((v) => v.mode === "BULLSEYE")
      const hits = normalized.e.filter((v) => v.mode === "HIT")
      expect(bulls.length).toBeLessThanOrEqual(1)
      expect(hits.length).toBeLessThanOrEqual(1)
      expect(bulls.length + hits.length).toBeLessThanOrEqual(1)
      const res = normalized.e.every((v) =>
        v.index === 2
          ? v.mode === "BULLSEYE"
          : v.mode === "HIT" || v.mode === "MISS",
      )
      expect(res).toBe(true)
    })
  })
})
