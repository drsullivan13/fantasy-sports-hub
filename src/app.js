import pkg from 'espn-fantasy-football-api/node'
import { getMatchupResults, getTeamInformation } from './espnFantasyClient'
import { stringify } from './util'

const { Client } = pkg
const myClient = new Client({ leagueId: 40736849 })
myClient.setCookies({
  espnS2: 'AEBNiyj2iDnjuTXVAfbzp1pJYeiACmmgU6Wq7sVi%2FR6PadoeiBqbyO1DH59pPiFrj2j46fyrAz6QglTFRfdv6UdBcilVsEz7qoLmze5cFbAyZzlbf0DnO2j1WBEUnvsKegjCpZwn93Epo0eIuwaXD108Q5mCzmRFjAsMLlAaRhTEvVsq7NOiRQUje7vatEUkn1t5OtKkwpAJSRao1Hp5ngbbM%2Flb1%2F3cKaozUeJ%2BSuJ5q9CBCSbb7j3vBvmxk2jX8I2KUv5jGorqKgBVi6LtJbOKMuPo4XBH3gB%2BdEoMiKhnHOB%2FYHshQA67slLdfDvyN%2BE%3D',
  SWID: '{A393ED4A-3AB9-47FF-8EDB-747983FB025A}'
})

// this is base url to get fantasy baseball stuff
// https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/40736849?view=mMatchup&view=mMatchupScore&scoringPeriodId=81
// const url = 'https://fantasy.espn.com/apis/v3/games/flb/seasons/2022/segments/0/leagues/40736849?view=mMatchup&view=mMatchupScore&scoringPeriodId=81'

// https://fantasy.espn.com/apis/v3/games/flb/seasons/2021/segments/0/leagues/40736849?scoringPeriodId=0&view=mRoster&view=mTeam

// todo how to cache calls because oh baby are they slow

export default async () => {
  const matchupScoresForWeek9 = await getHomeAndAwayScoresForWeek(1)
  console.log('matchup scores for week 1:', stringify(matchupScoresForWeek9))
  const friendlyMatchupScoresForWeek9 = await replaceTeamIdWithTeamName(matchupScoresForWeek9)

  console.log(`Result: ${stringify(friendlyMatchupScoresForWeek9)}`)
}

const getHomeAndAwayScoresForWeek = async (weekNumber) => {
  const result = await getMatchupResults(weekNumber, '2021')
  return result.map(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId }, winner }) => ({
    homeTotalPoints,
    homeTeamId,
    awayTotalPoints,
    awayTeamId,
    winner
  }))
}

const getTeamIdToNameMap = async () => {
  const teamsList = await getTeamInformation('2021')

  const responseMap = new Map()

  teamsList.forEach(({ id, location, nickname }) => {
    responseMap.set(id, `${location} ${nickname}`)
  })

  return responseMap
}

const replaceTeamIdWithTeamName = async (matchups) => {
  // todo this gotta be fixed now
  const teamMap = await getTeamIdToNameMap()
  return matchups.map(({ homeScore, homeTeamId, awayScore, awayTeamId }) => ({
    homeTeamName: teamMap.get(homeTeamId),
    homeScore,
    awayTeamName: teamMap.get(awayTeamId),
    awayScore
  }))
}
