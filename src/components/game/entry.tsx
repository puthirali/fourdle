import * as React from "react"
import Box from "@mui/system/Box"
import {Entry as EntryModel} from "../../models/entry"
import {emptyChar, keyColor} from "../../models/key"
import {Slot} from "./slot"

export interface EntryProps {
  readonly entry: EntryModel
  readonly isSolution: boolean
}

interface EntrySlotProps {
  readonly entry: EntryModel
  readonly index: number
  readonly isSolution: boolean
}

export const EntrySlot: React.FC<EntrySlotProps> = ({
  entry,
  index,
  isSolution,
}: EntrySlotProps) => {
  const keyCap =
    entry.chars.length <= index ? emptyChar : entry.chars[index]
  return <Slot keyCap={keyCap} isSolution={isSolution} />
}

export const Entry: React.FC<EntryProps> = ({
  entry,
  isSolution,
}: EntryProps) => (
  <Box
    className="entry"
    sx={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      backgroundColor: isSolution
        ? keyColor("BULLSEYE", false)
        : "transparent",
    }}
  >
    {[0, 1, 2, 3, 4].map((index) => (
      <EntrySlot
        key={`entry-slot-${index}`}
        entry={entry}
        index={index}
        isSolution={isSolution}
      />
    ))}
  </Box>
)
