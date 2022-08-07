import { getMatchupResults, getTeamInformation } from '../espnFantasyClient'

export const getHomeAndAwayScoresForWeek = async (weekNumber) => {
  const result = await getMatchupResults(weekNumber, '2021')
  return result.map(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId }, winner }) => ({
    homeTotalPoints,
    homeTeamId,
    awayTotalPoints,
    awayTeamId,
    winner
  }))
}

export const replaceTeamIdWithTeamName = async (matchups) => {
  // todo this gotta be fixed now
  const teamMap = await getTeamIdToNameMap()
  return matchups.map(({ homeTotalPoints, homeTeamId, awayTotalPoints, awayTeamId, winner }) => ({
    homeTeamName: teamMap.get(homeTeamId),
    homeTotalPoints,
    awayTeamName: teamMap.get(awayTeamId),
    awayTotalPoints,
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
