import * as React from "react"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

export interface PopMessageProps {
  readonly message: string
}

export const PopMessage: React.FC<PopMessageProps> = ({
  message,
}: PopMessageProps) => {
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "primary.dark",
        minWidth: "240px",
        padding: "1rem",
        justifyContent: "center",
        display: "flex",
        borderRadius: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      <Typography
        variant="caption"
        fontWeight="bold"
        color="text.primary"
        textAlign="center"
      >
        {message}
      </Typography>
    </Box>
  )
}
