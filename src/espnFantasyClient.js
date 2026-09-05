import pkg from 'espn-fantasy-football-api/node.js'

const { Client } = pkg

const BASE_URLS = {
  football: 'https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons'
}

const getCredentials = () => {
  const espnS2 = process.env.ESPN_S2
  const SWID = process.env.ESPN_SWID

  if (!espnS2 || !SWID) {
    throw new Error('ESPN_S2 and ESPN_SWID must be configured')
  }

  return { espnS2, SWID }
}

const getLeagueUrl = ({ leagueType, leagueId, season }) => {
  const baseUrl = BASE_URLS[leagueType]
  if (!baseUrl) {
    throw new Error(`Unsupported league type: ${leagueType}`)
  }

  return `${baseUrl}/${season}/segments/0/leagues/${leagueId}`
}

const getCookieHeader = () => {
  const { espnS2, SWID } = getCredentials()
  return `espn_s2=${espnS2}; SWID=${SWID};`
}

const fetchEspnJson = async (url) => {
  const response = await fetch(url, {
    headers: { cookie: getCookieHeader() },
    signal: AbortSignal.timeout(10000)
  })

  if (!response.ok) throw new Error(`ESPN returned ${response.status}`)
  return response.json()
}

const getClient = (leagueId) => {
  const client = new Client({ leagueId: Number(leagueId) })
  client.setCookies(getCredentials())
  return client
}

export const getLeagueSeason = async ({ leagueType, leagueId, season }) => {
  const search = new URLSearchParams({ scoringPeriodId: '1' })
  ;['mMatchup', 'mMatchupScore', 'mRoster', 'mSettings', 'mStatus', 'mTeam']
    .forEach((view) => search.append('view', view))

  return fetchEspnJson(`${getLeagueUrl({ leagueType, leagueId, season })}?${search}`)
}

export const getBoxscoresForWeek = async ({ leagueId, season, week }) => {
  const client = getClient(leagueId)
  return client.getBoxscoreForWeek({
    seasonId: Number(season),
    matchupPeriodId: week,
    scoringPeriodId: week
  })
}

export const getSeasonYears = async ({ leagueType, leagueId }) => {
  const today = new Date()
  const currentSeason = Number(process.env.CURRENT_SEASON) ||
    (today.getMonth() < 6 ? today.getFullYear() - 1 : today.getFullYear())
  const data = await fetchEspnJson(`${getLeagueUrl({
    leagueType,
    leagueId,
    season: currentSeason
  })}?view=mStatus`)
  return [data.seasonId, ...(data.status?.previousSeasons ?? [])]
}
