import axios from 'axios'

const footballBaseUrl = 'https://fantasy.espn.com/apis/v3/games/ffl/seasons'
const baseballBaseUrl = 'https://fantasy.espn.com/apis/v3/games/flb/seasons'
const leagueId = '248873'

const cookie = 'espn_s2=AEB6eYtlqIgLDkLzrwf4LAS7KQwaliUFhzuOgsTduWE01%2FhOEbOKQFyeH%2F6gelPrp6Oxkxv00Cw1F1Us13PqoDaHJa4sPl8cLumbND2Kaitv%2BMYpZCYvk4eg53IzA5D8yi%2BbD%2Fk3a%2B8ARmGrOAkDqG71m75xzLzqhm4rvxeUdMftUAh2tTfBtfgTlAq3Uwcrf7yDlzaWyocJa5X4xrYoExKcxcZc%2BvuFI%2F3kROX2BRxjh30EP9QzjtUsaiufdXVY5Qqzqy96c8RPOR6hh5wSe5Ce%2FJXNufBg47j4ml8WizHMo73HIb4Vl%2BKQYIrK4yyE3PQ%3D; SWID={A393ED4A-3AB9-47FF-8EDB-747983FB025A};'

const axiosInstance = axios.create({ withCredentials: true })

export const getTeamInformation = async (year) => {
  const { data: { teams } } = await axiosInstance.get(`${getBaseUrl()}/${year}/segments/0/leagues/${process.env.LEAGUE_ID}?scoringPeriodId=1&view=mRoster&view=mTeam`,
    { withCredentials: true, headers: { cookie } })
  return teams
}

export const getScheduleResultsForYear = async (year) => {
  const { data: { schedule } } = await axiosInstance.get(`${getBaseUrl()}/${year}/segments/0/leagues/${process.env.LEAGUE_ID}?view=mMatchup&view=mMatchupScore`,
    { withCredentials: true, headers: { cookie } })

  return schedule.map(({ home, away, matchupPeriodId, playoffTierType, winner }) =>
    ({ home: { teamId: home.teamId, totalPoints: home.totalPoints }, away: { teamId: away?.teamId, totalPoints: away?.totalPoints }, matchupPeriodId, playoffTierType, winner }))
}

export const getScheduleForUpToWeek = async (weekNum) => {
  const { data: { schedule } } = await axiosInstance.get(`${getBaseUrl()}/${2022}/segments/0/leagues/${process.env.LEAGUE_ID}?view=mMatchup&view=mMatchupScore`,
    { withCredentials: true, headers: { cookie } })

  return schedule.filter((matchup) => matchup.matchupPeriodId <= weekNum)
}

export const getLatestScoringPeriod = async () => {
  const { data: { status: { latestScoringPeriod } } } = await axiosInstance.get(`${getBaseUrl()}/${2022}/segments/0/leagues/${process.env.LEAGUE_ID}`,
    { withCredentials: true, headers: { cookie } })

  return latestScoringPeriod
}

export const getSeasonYears = async () => {
  const { data: { seasonId, status: { previousSeasons } } } = await axiosInstance.get(`${getBaseUrl()}/2024/segments/0/leagues/${process.env.LEAGUE_ID}?view=mMatchup&view=mMatchupScore`,
    { withCredentials: true, headers: { cookie } })

  return [seasonId, ...previousSeasons]
}

export const getSeasonWeeks = async (year) => {
  const { data: { status: { currentMatchupPeriod } } } = await axiosInstance.get(`${getBaseUrl()}/${year}/segments/0/leagues/${process.env.LEAGUE_ID}?view=mMatchup&view=mMatchupScore`,
    { withCredentials: true, headers: { cookie } })

  return currentMatchupPeriod
}

const getBaseUrl = () => {
  const leagueTypeToUrl = {
    football: footballBaseUrl,
    baseball: baseballBaseUrl
  }

  return leagueTypeToUrl[process.env.LEAGUE_TYPE]
}
