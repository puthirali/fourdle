/* eslint-disable react/jsx-props-no-spreading */
import * as React from "react"
import {pipe} from "@effect-ts/core/Function"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"
import Box from "@mui/material/Box"
import Chip from "@mui/material/Chip"
import Divider from "@mui/material/Divider"
import List from "@mui/material/List"
import Stack from "@mui/material/Stack"
import Tab from "@mui/material/Tab"
import {ConfigContext} from "../../context/settings/config"
import {
  ScreenInferenceContext,
  ScreenWidth,
} from "../../context/system/screen"
import {BoardNumber, DayResults, Result} from "../../models/state"
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
      hidden={!isSelected}
      id={`stat-board-${tag}`}
      aria-labelledby={`stat-board-${tag}`}
      sx={{
        display: "flex",
        justifyContent: "center",
        flexGrow: 1,
      }}
    >
      {isSelected && (
        <List sx={{width: "100%"}}>
          <ComplexListItem label="Plays">
            <Stack component="span" direction="row" spacing={1}>
              <Chip
                color={result.isSolved ? "success" : "default"}
                size="small"
                label={`Total: ${stat.totalDays}`}
              />
              <Chip
                color={
                  result.isSolved &&
                  stat.currentStreak === stat.longestStreak
                    ? "success"
                    : "default"
                }
                size="small"
                label={`Streak: ${stat.longestStreak}`}
              />
              <Chip
                color={
                  stat.longestGap ===
                  result.puzzleNumber - stat.lastPuzzle
                    ? "success"
                    : "default"
                }
                size="small"
                label={`Gap: ${stat.longestGap}`}
              />
            </Stack>
          </ComplexListItem>
          <Divider component="li" />
          <ComplexListItem label="Guesses">
            <Stack component="span" direction="row" spacing={1}>
              <Chip
                size="small"
                color={
                  result.minTrials === stat.minimum
                    ? "success"
                    : "default"
                }
                label={`Min: ${stat.minimum}`}
              />
              <Chip
                size="small"
                color={
                  result.maxTrials === stat.maximum
                    ? "success"
                    : "default"
                }
                label={`Max: ${stat.maximum}`}
              />
              <Chip
                size="small"
                color={
                  result.trialCount === trialCount(stat)
                    ? "success"
                    : "default"
                }
                label={`Total: ${trialCount(stat)}`}
              />
            </Stack>
          </ComplexListItem>
          <Divider component="li" />
          <ComplexListItem label="Trials">
            <Stack component="span" direction="column" spacing={1}>
              <Chip
                size="small"
                color={
                  result.trialCount === trialCount(stat)
                    ? "success"
                    : "default"
                }
                label={`Best: ${stat.trials.join(" | ")}`}
              />
              {result.isSolved && (
                <Chip
                  size="small"
                  color={
                    result.trialCount === trialCount(stat)
                      ? "success"
                      : "default"
                  }
                  label={`Now: ${result.trials.join(" | ")}`}
                />
              )}
            </Stack>
          </ComplexListItem>
          <Divider component="li" />
        </List>
      )}
    </Box>
  )
}

export interface StreakProps {
  readonly results: DayResults
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

const fromTabTag = (t: StatTabs): BoardNumber | null => {
  return t === "2dle"
    ? "two"
    : t === "3dle"
    ? "three"
    : t === "4dle"
    ? "four"
    : null
}

const nameFromBoardNumber = (n: BoardNumber): StatTabs =>
  n === "four" ? "4dle" : n === "three" ? "3dle" : "2dle"

const shortName = (t: StatTabs): string =>
  t === "all" ? "all" : t === "2dle" ? "2" : t === "3dle" ? "3" : "4"

const fromTag = (t: StatTabs, w: ScreenWidth) => {
  return w !== "NARROW" && w !== "SMALL"
    ? t.toUpperCase()
    : shortName(t)
}

export function Stats({results, streak}: StreakProps) {
  const {
    config: {mode},
  } = React.useContext(ConfigContext)
  const [current, setCurrent] = React.useState(
    nameFromBoardNumber(mode),
  )

  React.useEffect(
    () => setCurrent(nameFromBoardNumber(mode)),
    [mode, setCurrent],
  )
  const handleChange = (
    // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
    event: React.SyntheticEvent,
    newValue: string,
  ) => {
    setCurrent(newValue as StatTabs)
  }

  const resultFromTabTag = React.useMemo(() => {
    return (tabTag: StatTabs) =>
      pipe(tabTag, fromTabTag, (m) =>
        m === null ? results[mode] : results[m],
      )
  }, [mode, results])

  const {screenWidth} = React.useContext(ScreenInferenceContext)
  return (
    <TabContext value={current}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <TabList
          onChange={handleChange}
          aria-label="stat tabs"
          centered
        >
          {tabTags.map((t) => (
            <Tab
              sx={{minWidth: "auto"}}
              key={`stat-tab-${t}`}
              value={t}
              label={fromTag(t, screenWidth)}
              {...a11yProps(t)}
            />
          ))}
        </TabList>
      </Box>
      {tabTags.map((t) => (
        <TabPanel
          key={`stat-board-${t}`}
          value={t}
          sx={{width: "100%", padding: "0"}}
        >
          <Stat
            result={resultFromTabTag(t)}
            stat={pipe(streak, stats(t))}
            isSelected={current === t}
            tag={t}
          />
        </TabPanel>
      ))}
    </TabContext>
  )
}
