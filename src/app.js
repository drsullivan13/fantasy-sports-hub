import { Client } from 'espn-fantasy-football-api' // node
import { getFreedomStandings, getAllTeamScoresSortedForWeek } from './service'
import express from 'express'
import { JSend } from 'jsend-express'

const myClient = new Client({ leagueId: 40736849 })
myClient.setCookies({
  espnS2: 'AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D',
  SWID: '{A393ED4A-3AB9-47FF-8EDB-747983FB025A}'
})

const app = express()
const jsend = new JSend({ name: 'fantasy-sports-hub', version: '0.0.1', release: '0.0.1' })

app.use(jsend.middleware.bind(jsend))
app.use(express.json())

const PORT = 5001

// Serve static files
app.use(express.static('client/build'))

app.get('/results/teamLeaderboard/:year/:week', async (req, res, next) => {
  const year = req.params.year
  const weekNum = Number(req.params.week)

  const leaderboardForWeek = await getAllTeamScoresSortedForWeek(year, weekNum)

  res.success({ data: leaderboardForWeek })
})

app.get('/results/freedomStandings/:year', async (req, res, next) => {
  const year = req.params.year
  const freedomStandings = await getFreedomStandings(year)
  res.success({ data: freedomStandings })
})

app.listen(PORT, () => console.log(`App listening at port ${PORT}`))
