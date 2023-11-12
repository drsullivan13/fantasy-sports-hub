import { getScheduleForWeek, getTeamInformation, getScheduleForUpToWeek } from '../espnFantasyClient'

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

export const getAllTeamScoresSortedForWeek = async (year, weekNum) => {
  const result = await getScheduleForWeek(year, weekNum)
  const pointsScoredToTeamIdMap = {}
  result.forEach(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId } }) => {
    pointsScoredToTeamIdMap[homeTotalPoints] = homeTeamId
    pointsScoredToTeamIdMap[awayTotalPoints] = awayTeamId
  })

  const sortedListOfScores = Object.keys(pointsScoredToTeamIdMap).sort((a, b) => a - b)

  const teamIdToNameMap = await getTeamIdToNameMap(year)

  const list = []

  // [
  //   { id: 1, teamName: 'Hello', freedomPoints: 'World' },
  //   { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
  //   { id: 3, col1: 'MUI', col2: 'is Amazing' },
  // ];

  sortedListOfScores.forEach((score, index) => {
    const { teamName, abbreviation } = teamIdToNameMap.get(pointsScoredToTeamIdMap[score])

    list.push({ id: abbreviation, teamName, freedomPoints: parseInt(index) + 1 })
  })

  return list
}

export const getFreedomStandings = async (year) => {
  // todo a lot of optomizing to do here but it works, use new function instead of the getAll
  // instead of the looping and switching from object to map to list maybe way we can do in one fell swoop
  const teamNameToFreedomPointsDataMap = new Map()
  for (let i = 1; i <= 10; i++) { // todo this will change based on what's the current scoring period
    const leagueScoresSortedForGivenWeek = await getAllTeamScoresSortedForWeek(year, i)
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

  // console.log('WHAT IS THIS: ', JSON.stringify(responseList))

  return responseList
}

const getFreedomPointsForUpToWeek = (week) => {
  const scheduleUpToWeek = getScheduleForUpToWeek(week)
  const points = scheduleUpToWeek.map(matchup => matchup.away.totalPoints + matchup.home.totalPoints);
  const maxPoints = Math.max(...points)
  const minPoints = Math.min(...points)

  const sortedPoints = points.slice().sort((a, b) => b - a);
  const rankMap = points.reduce((acc, curr) => {
    acc[curr] = sortedPoints.indexOf(curr) + 1
    return acc
  }, {})

  return scheduleUpToWeek.map(matchup => {
    const homePoints = matchup.home.totalPoints
    const awayPoints = matchup.away.totalPoints
    const homeFreedomPoints = rankMap[homePoints] + (10 - rankMap[maxPoints]) * (homePoints - minPoints) / (maxPoints - minPoints)
    const awayFreedomPoints = rankMap[awayPoints] + (10 - rankMap[maxPoints]) * (awayPoints - minPoints) / (maxPoints - minPoints)
    return {
      home: {
        teamId: matchup.home.teamId,
        freedomPoints: homeFreedomPoints
      },
      away: {
        teamId: matchup.away.teamId,
        freedomPoints: awayFreedomPoints
      }
    }
  })
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

const getTeamIdToNameMap = async (year) => {
  const teamsList = await getTeamInformation(year)

  // console.log('TEAMS LIST: ', JSON.stringify(teamsList))

  const responseMap = new Map()

  teamsList.forEach(({ id, name, abbrev }) => {
    responseMap.set(id, { teamName: name, abbreviation: abbrev })
  })

  return responseMap
}
