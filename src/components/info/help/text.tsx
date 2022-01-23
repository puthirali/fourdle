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
      sx={{margin: "1rem 0"}}
    >
      How to play?
    </Typography>
    <Typography variant="body1" component="p">
      The game play is identical to wordle. Except, when you guess, your
      guess applies to multiple words at the same time. The challenge is
      to make the guesses minimizing the total guesses across the words.
    </Typography>
    <Typography
      color="text.secondary"
      variant="h5"
      sx={{margin: "1rem 0"}}
    >
      Some unexplained things
    </Typography>
    <Typography variant="body1" component="p">
      On smaller screens, it will be harder to play the game with just 2
      words showing up. The zoom mode on the toolbar allows you to focus
      on just one board at a time. The words you enter will go to all of
      them though, so be careful :)
    </Typography>
    <Typography variant="body1" component="p">
      You can play 4, 3 or 2 boards at a time. To change the mode, you
      have to go the settings modal (The gear icon). Will make this
      easier, in the coming days.
    </Typography>
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
  </CardContent>
)

export default function HelpInfo() {
  return (
    <Box sx={{minWidth: 275}}>
      <Card variant="outlined">{helpText}</Card>
    </Box>
  )
}
