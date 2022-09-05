import { getScheduleForWeek, getTeamInformation } from '../espnFantasyClient'

export const getHomeAndAwayScoresForWeek = async (weekNumber) => {
  const result = await getScheduleForWeek(weekNumber, '2021')
  return result.map(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId }, winner }) => ({
    homeTotalPoints,
    homeTeamId,
    awayTotalPoints,
    awayTeamId,
    winner
  }))
}

export const getAllTeamScoresSortedForWeek = async (weekNum) => {
  const result = await getScheduleForWeek(weekNum)
  const pointsScoredToTeamIdMap = {}
  result.forEach(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId } }) => {
    pointsScoredToTeamIdMap[homeTotalPoints] = homeTeamId
    pointsScoredToTeamIdMap[awayTotalPoints] = awayTeamId
  })

  const sortedListOfScores = Object.keys(pointsScoredToTeamIdMap).sort((a, b) => a - b)

  const teamIdToNameMap = await getTeamIdToNameMap()

  const list = []
  sortedListOfScores.forEach((score) => {
    list.push({ teamName: teamIdToNameMap.get(pointsScoredToTeamIdMap[score]), score })
  })

  return list
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
