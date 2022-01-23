import * as React from "react"
import {colors} from "@mui/material"
import Stack from "@mui/material/Stack"
import {ConfigContext} from "../../context/settings/config"
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
  return (
    <Slot
      keyCap={keyCap}
      isSolution={isSolution}
      isCommitted={entry.isCommitted}
      isInvalid={entry.isInvalid}
    />
  )
}

export const Entry: React.FC<EntryProps> = ({
  entry,
  isSolution,
}: EntryProps) => {
  const {
    config: {isAccessible},
  } = React.useContext(ConfigContext)
  return (
    <Stack
      className="entry"
      direction="row"
      justifyContent="center"
      sx={{
        backgroundColor: isSolution
          ? keyColor("BULLSEYE", isAccessible)
          : "transparent",
        borderColor: isSolution ? colors.grey[900] : "transparent",
        borderWidth: "4px",
        borderStyle: "solid",
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
    </Stack>
  )
}
