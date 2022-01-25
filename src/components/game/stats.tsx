/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import Tabs from "@mui/material/Tabs"
import {Result} from "../../models/state"
import {
  GameStats,
  overallStats,
  Streak,
  trialCount,
} from "../../models/streak"
import {ComplexListItem} from "./complex-list-item"

export interface StatProps {
  readonly result: Result
  readonly stat: GameStats
  readonly isSelected: boolean
  readonly tag: string
}

export function Stat({result, stat, isSelected, tag}: StatProps) {
  return (
    <Box
      role="tabpanel"
      hidden={!isSelected}
      id={`stat-board-${tag}`}
      aria-labelledby={`stat-board-${tag}`}
      sx={{
        display: "flex",
        width: "100%",
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      {isSelected && (
        <List>
          <ComplexListItem label="Plays">
            <Stack component="span" direction="row" spacing={2}>
              <Chip
                component="span"
                label={`Total: ${stat.totalDays}`}
              />
              <Chip
                component="span"
                label={`Streak: ${stat.longestStreak}`}
              />
              <Chip
                component="span"
                label={`Gap: ${stat.longestGap}`}
              />
            </Stack>
          </ComplexListItem>
          <Divider component="li" />
          <ComplexListItem label="Guesses">
            <Stack component="span" direction="row" spacing={2}>
              <Chip
                color={
                  result.minTrials === stat.minimum
                    ? "success"
                    : "default"
                }
                component="span"
                label={`Minimum: ${stat.minimum}`}
              />
              <Chip
                color={
                  result.maxTrials === stat.maximum
                    ? "success"
                    : "default"
                }
                component="span"
                label={`Maximum: ${stat.maximum}`}
              />
              <Chip
                color={
                  result.trialCount === trialCount(stat)
                    ? "success"
                    : "default"
                }
                component="span"
                label={`Total: ${trialCount(stat)}`}
              />
            </Stack>
          </ComplexListItem>
          <Divider component="li" />
          <ComplexListItem label="Best">
            <Chip
              color={
                result.trialCount === trialCount(stat)
                  ? "success"
                  : "default"
              }
              component="span"
              label={stat.trials.join(" | ")}
            />
          </ComplexListItem>
          <Divider component="li" />
        </List>
      )}
    </Box>
  )
}

export interface StreakProps {
  readonly result: Result
  readonly streak: Streak
}

function a11yProps(tag: string) {
  return {
    id: `stat-board-${tag}`,
    "aria-controls": `stat-board-${tag}`,
  }
}

type StatTabs = "all" | "2dle" | "3dle" | "4dle"

const tabTags: StatTabs[] = ["all", "2dle", "3dle", "4dle"]

function stats(t: StatTabs) {
  return (s: Streak) =>
    t === "all"
      ? overallStats(s)
      : s.record[t === "2dle" ? "two" : t === "3dle" ? "three" : "four"]
}

const fromResult = (result: Result) =>
  result.mode === "two" ? 1 : result.mode === "three" ? 3 : 4

export function Stats({result, streak}: StreakProps) {
  const [current, setCurrent] = React.useState(
    result.mode === "two" ? 1 : result.mode === "three" ? 3 : 4,
  )

  React.useEffect(
    () => setCurrent(fromResult(result)),
    [result, setCurrent],
  )
  const handleChange = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    event: React.SyntheticEvent,
    newValue: number,
  ) => {
    setCurrent(newValue)
  }
  return (
    <Box sx={{width: "100%"}}>
      <Box
        sx={{
          marginBottom: "2rem",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Tabs
          value={current}
          onChange={handleChange}
          aria-label="stat tabs"
          centered
        >
          {tabTags.map((t) => (
            <Tab
              key={`stat-tab-${t}`}
              label={t.toUpperCase()}
              {...a11yProps(t)}
            />
          ))}
        </Tabs>
      </Box>
      {tabTags.map((t, index) => (
        <Stat
          result={result}
          stat={pipe(streak, stats(t))}
          key={`stat-board-${t}`}
          isSelected={current === index}
          tag={t}
        />
      ))}
    </Box>
  )
}
