import * as React from "react"
import Box from "@mui/material/Box"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import Typography from "@mui/material/Typography"

const helpText = (
  <CardContent>
    <Typography
      color="text.secondary"
      variant="h5"
      sx={{margin: "1rem, 0"}}
    >
      Why 4dle?
    </Typography>
    <Typography variant="body1" component="p">
      The internet is a place of joyous creation and sharing. It has
      been that way since I first *dialed-in* worried how much it would
      cost in telephone bills.
    </Typography>
    <Typography variant="body1" component="p">
      Wordle has been a nostalgic throwback to those times. A free game
      that has managed to connect individuals across boundaries, brought
      joy to many. A personal toy becoming the worlds playground.
    </Typography>
    <Typography variant="body1" component="p">
      Heeding to requests from the early fans and exploding as a
      cultural phenomenon. 4dle is a tribute to wordle, attempting to
      satisfy a smaller niche of players that want something slightly
      more complex or just want more than 1 word puzzle :)
    </Typography>
    <Typography
      color="text.secondary"
      variant="h5"
      sx={{margin: "1rem 0"}}
    >
      How to play?
    </Typography>
    <Typography variant="body1" component="p">
      The game play is identical to wordle. Except, when you guess, your
      guess applies to multiple words at the same time. The challenge is
      to make the guesses minimizing the total guesses across the words.
    </Typography>
  </CardContent>
)

export default function HelpInfo() {
  return (
    <Box sx={{minWidth: 275}}>
      <Card variant="outlined">{helpText}</Card>
    </Box>
  )
}
