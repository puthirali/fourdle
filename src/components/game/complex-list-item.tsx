import * as React from "react"
import ListItem from "@mui/material/ListItem"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

export interface ComplexListItemProps {
  readonly label: string
  readonly children: React.ReactNode
}

export function ComplexListItem({
  label,
  children,
}: ComplexListItemProps) {
  return (
    <ListItem>
      <Stack direction="column" spacing={1} pb="1rem">
        <Typography
          variant="caption"
          fontSize={{sm: "1rem", md: "1.5rem"}}
          fontWeight="bold"
        >
          {label}
        </Typography>
        {children}
      </Stack>
    </ListItem>
  )
}
