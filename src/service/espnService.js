import { getScheduleResultsForYear, getTeamInformation, getSeasonYears, getSeasonWeeks } from '../espnFantasyClient.js'

export const getHomeAndAwayScoresForWeek = async (weekNumber) => {
  // const result = await getScheduleForWeek(weekNumber, '2021')
  // return result.map(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId }, winner }) => ({
  //   homeTotalPoints,
  //   homeTeamId,
  //   awayTotalPoints,
  //   awayTeamId,
  //   winner
  // }))
}

export const getAllTeamScoresSortedForWeek = async (year, weekNum) => {
  // const result = await getScheduleForWeek(year, weekNum)
  const pointsScoredToTeamIdMap = {}
  // result.forEach(({ home: { totalPoints: homeTotalPoints, teamId: homeTeamId }, away: { totalPoints: awayTotalPoints, teamId: awayTeamId } }) => {
  //   pointsScoredToTeamIdMap[homeTotalPoints] = homeTeamId
  //   pointsScoredToTeamIdMap[awayTotalPoints] = awayTeamId
  // })

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
  const result = await getScheduleResultsForYear(year)
  const teamIdToNameMap = await getTeamIdToNameMap(year)

  const freedomPointsResult = generateFreedomPointsData(result, teamIdToNameMap)

  return freedomPointsResult
}

const generateFreedomPointsData = (matchupData, teamIdToNameMap) => {
  const result = {
    freedomPoints: {},
    weeklyFreedomPoints: []
  }

  const matchupPeriods = [...new Set(matchupData.map((matchup) => matchup.matchupPeriodId))]

  const teamIdToOverallFreedomPoints = {}

  matchupPeriods.forEach((matchupPeriodId) => {
    const weeklyPoints = {}
    const teamIdTotalPointsForGivenWeek = []
    matchupData
      .filter((matchup) => (matchup.matchupPeriodId === matchupPeriodId) && matchup.playoffTierType === 'NONE' && matchup.winner !== 'UNDECIDED')
      .forEach(({ home, away }) => {
        // get an array {teamId: totalPoints}
        teamIdTotalPointsForGivenWeek.push({ teamName: teamIdToNameMap.get(home.teamId).teamName, totalPoints: home.totalPoints }, { teamName: teamIdToNameMap.get(away.teamId).teamName, totalPoints: away.totalPoints })
        // sort array by totalPoints
      })
    const sortedTeamIdTotalPointsForGivenWeek = teamIdTotalPointsForGivenWeek.sort((a, b) => a.totalPoints - b.totalPoints)

    // based on the order award freedom points for given teamId
    sortedTeamIdTotalPointsForGivenWeek.forEach(({ teamName }, index) => {
      const freedomPointsCollectedInWeek = index + 1
      const freedomPointsCollectedThroughWeek = (teamIdToOverallFreedomPoints[teamName] ?? 0) + freedomPointsCollectedInWeek

      weeklyPoints[teamName] = { freedomPointsInWeek: freedomPointsCollectedInWeek, totalFreedomPointsThroughWeek: freedomPointsCollectedThroughWeek }
      teamIdToOverallFreedomPoints[teamName] = freedomPointsCollectedThroughWeek
    })

    result.weeklyFreedomPoints.push(weeklyPoints)
  })

  result.freedomPoints = teamIdToOverallFreedomPoints

  return result
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

export const getLeagueInfo = async () => {
  const years = await getSeasonYears()
  const yearToWeeksMap = {}

  console.log('YEARS' + years)

  const test = await Promise.all(years.map(processYear))
    .then(yearToWeeks => {
      // const yearToWeeksMap = {}
      yearToWeeks.forEach(({ year, currentWeek }) => {
        yearToWeeksMap[year] = currentWeek
      })
      return yearToWeeksMap
    })
    .catch(error => {
      console.error('Error processing years:', error)
    })

  // await years.forEach(async (year) => {
  //   const currentWeek = await getSeasonWeeks(year)
  //   console.log(`CURRENT WEEK` + currentWeek)
  //   yearToWeeksMap[year] = currentWeek
  // })

  console.log('YO YO YO' + JSON.stringify(test))

  return test
}

const processYear = async (year) => {
  // todo want to update this to only return the amount of REGULAR SEASON weeks
  const currentWeek = await getSeasonWeeks(year);
  console.log(`CURRENT WEEK for ${year}: ${currentWeek}`);
  return { year, currentWeek };
}
