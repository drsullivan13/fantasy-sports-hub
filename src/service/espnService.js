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
  sortedListOfScores.forEach((score, index) => {
    const { teamName, abbreviation } = teamIdToNameMap.get(pointsScoredToTeamIdMap[score])

    list.push({ teamName, score, abbreviation, freedomPoints: parseInt(index) + 1 })
  })

  return list
}

export const getFreedomStandings = async () => {
  // todo a lot of optomizing to do here but it works, use new function instead of the getAll
  // instead of the looping and switching from object to map to list maybe way we can do in one fell swoop
  const teamNameToFreedomPointsDataMap = new Map()
  for (let i = 1; i <= 10; i++) { // todo this will change based on what's the current scoring period
    const leagueScoresSortedForGivenWeek = await getAllTeamScoresSortedForWeek(i)
    leagueScoresSortedForGivenWeek.forEach(({ teamName, freedomPoints, abbreviation }) => {
      if (teamNameToFreedomPointsDataMap.has(teamName)) {
        const { freedomPoints: currentPoints } = teamNameToFreedomPointsDataMap.get(teamName)
        teamNameToFreedomPointsDataMap.set(teamName, { teamName, freedomPoints: currentPoints + freedomPoints, abbreviation })
      } else {
        teamNameToFreedomPointsDataMap.set(teamName, { teamName, freedomPoints, abbreviation })
      }
    })
  }

  const responseList = []
  for (const entry of teamNameToFreedomPointsDataMap.entries()) {
    responseList.push(entry[1])
  }

  return responseList
}

export const replaceTeamIdWithTeamName = async (matchups) => {
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

  teamsList.forEach(({ id, location, nickname, abbrev }) => {
    responseMap.set(id, { teamName: `${location} ${nickname}`, abbreviation: abbrev })
  })

  return responseMap
}
