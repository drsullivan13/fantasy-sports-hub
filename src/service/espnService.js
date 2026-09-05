import { getBoxscoresForWeek, getLeagueSeason, getSeasonYears } from '../espnFantasyClient.js'

const UNDECIDED = 'UNDECIDED'
const REGULAR_SEASON = 'NONE'

const round = (value) => Math.round((value + Number.EPSILON) * 100) / 100

const getTeamName = (team) =>
  team.name || [team.location, team.nickname].filter(Boolean).join(' ') || team.abbrev

export const getCompletedWeeks = (schedule, teamCount) => {
  const weeks = new Map()

  schedule
    .filter((matchup) => matchup.playoffTierType === REGULAR_SEASON)
    .forEach((matchup) => {
      const week = matchup.matchupPeriodId
      const matchups = weeks.get(week) ?? []
      matchups.push(matchup)
      weeks.set(week, matchups)
    })

  return [...weeks.entries()]
    .filter(([, matchups]) =>
      matchups.length > 0 &&
      matchups.flatMap((matchup) => [matchup.home, matchup.away]).filter(Boolean).length === teamCount &&
      matchups.every((matchup) => matchup.winner && matchup.winner !== UNDECIDED)
    )
    .map(([week]) => Number(week))
    .sort((a, b) => a - b)
}

const getWeekEntries = (schedule, week) =>
  schedule
    .filter((matchup) =>
      matchup.matchupPeriodId === week &&
      matchup.playoffTierType === REGULAR_SEASON &&
      matchup.winner !== UNDECIDED
    )
    .flatMap((matchup) => [matchup.home, matchup.away])
    .filter((team) => team?.teamId != null && Number.isFinite(team.totalPoints))
    .map((team) => ({
      teamId: Number(team.teamId),
      fantasyPoints: round(team.totalPoints)
    }))

const getTiedTeamIds = (entries) => {
  const scoreCounts = new Map()
  entries.forEach(({ fantasyPoints }) => {
    scoreCounts.set(fantasyPoints, (scoreCounts.get(fantasyPoints) ?? 0) + 1)
  })

  return new Set(
    entries
      .filter(({ fantasyPoints }) => scoreCounts.get(fantasyPoints) > 1)
      .map(({ teamId }) => teamId)
  )
}

const getBenchScores = (boxscores) => {
  const scores = new Map()

  boxscores.forEach((boxscore) => {
    const collect = (teamId, roster = []) => {
      const total = roster
        .filter((player) => player.position === 'Bench')
        .reduce((sum, player) => sum + (Number(player.totalPoints) || 0), 0)
      scores.set(Number(teamId), round(total))
    }

    collect(boxscore.homeTeamId, boxscore.homeRoster)
    collect(boxscore.awayTeamId, boxscore.awayRoster)
  })

  return scores
}

export const rankWeek = ({ entries, benchScores = new Map() }) => {
  const tiedTeamIds = getTiedTeamIds(entries)
  const unresolvedTeamIds = new Set([...tiedTeamIds].filter((teamId) => {
    if (!benchScores.has(teamId)) return true
    const entry = entries.find((candidate) => candidate.teamId === teamId)
    return entries.some((candidate) =>
      candidate.teamId !== teamId &&
      candidate.fantasyPoints === entry.fantasyPoints &&
      benchScores.get(candidate.teamId) === benchScores.get(teamId)
    )
  }))

  const ranked = entries
    .map((entry) => ({
      ...entry,
      benchPoints: benchScores.get(entry.teamId) ?? null
    }))
    .sort((a, b) =>
      a.fantasyPoints - b.fantasyPoints ||
      (a.benchPoints ?? Number.NEGATIVE_INFINITY) - (b.benchPoints ?? Number.NEGATIVE_INFINITY) ||
      a.teamId - b.teamId
    )
    .map((entry, index) => ({
      ...entry,
      freedomPoints: unresolvedTeamIds.has(entry.teamId) ? null : index + 1,
      tiebreakerUsed: tiedTeamIds.has(entry.teamId)
    }))

  return {
    ranked,
    isResolved: unresolvedTeamIds.size === 0,
    unresolvedTeamIds: [...unresolvedTeamIds]
  }
}

const getRecordsThroughWeek = (schedule, selectedWeek, teamIds) => {
  const records = new Map(teamIds.map((teamId) => [
    teamId,
    { wins: 0, losses: 0, ties: 0 }
  ]))

  schedule
    .filter((matchup) =>
      matchup.matchupPeriodId <= selectedWeek &&
      matchup.playoffTierType === REGULAR_SEASON &&
      matchup.winner !== UNDECIDED
    )
    .forEach((matchup) => {
      const home = records.get(Number(matchup.home?.teamId))
      const away = records.get(Number(matchup.away?.teamId))
      if (!home || !away) return

      if (matchup.winner === 'HOME') {
        home.wins += 1
        away.losses += 1
      } else if (matchup.winner === 'AWAY') {
        away.wins += 1
        home.losses += 1
      } else {
        home.ties += 1
        away.ties += 1
      }
    })

  return records
}

const competitionRanks = (teams) => {
  let previousTotal
  let previousRank = 0

  return [...teams]
    .sort((a, b) => b.totalFreedomPoints - a.totalFreedomPoints || a.teamId - b.teamId)
    .map((team, index) => {
      const rank = team.totalFreedomPoints === previousTotal ? previousRank : index + 1
      previousTotal = team.totalFreedomPoints
      previousRank = rank
      return { ...team, rank }
    })
}

export const buildDashboardSnapshot = ({
  league,
  season,
  selectedWeek,
  completedWeeks,
  rankedWeeks
}) => {
  const teamIds = league.teams.map((team) => Number(team.id))
  const records = getRecordsThroughWeek(league.schedule, selectedWeek, teamIds)
  const totals = new Map(teamIds.map((teamId) => [teamId, 0]))
  const weeklyHistory = new Map(teamIds.map((teamId) => [teamId, []]))

  rankedWeeks
    .filter(({ week }) => week <= selectedWeek)
    .forEach(({ week, ranked }) => {
      ranked.forEach(({ teamId, freedomPoints }) => {
        totals.set(teamId, (totals.get(teamId) ?? 0) + freedomPoints)
        weeklyHistory.get(teamId)?.push({ week, freedomPoints })
      })
    })

  const selectedRanking = rankedWeeks.find(({ week }) => week === selectedWeek)
  const selectedByTeam = new Map(
    selectedRanking?.ranked.map((team) => [team.teamId, team]) ?? []
  )
  const previousRanks = selectedWeek === completedWeeks[0]
    ? new Map()
    : new Map(
      competitionRanks(teamIds.map((teamId) => ({
        teamId,
        totalFreedomPoints:
          (totals.get(teamId) ?? 0) -
          (selectedByTeam.get(teamId)?.freedomPoints ?? 0)
      }))).map(({ teamId, rank }) => [teamId, rank])
    )

  const teams = competitionRanks(league.teams.map((team) => {
    const teamId = Number(team.id)
    const week = selectedByTeam.get(teamId)
    const record = records.get(teamId) ?? { wins: 0, losses: 0, ties: 0 }

    return {
      teamId,
      name: getTeamName(team),
      abbreviation: team.abbrev ?? team.abbreviation ?? '',
      logoUrl: team.logo ?? team.logoURL ?? null,
      record,
      fantasyPoints: week?.fantasyPoints ?? 0,
      benchPoints: week?.benchPoints ?? null,
      weeklyFreedomPoints: week?.freedomPoints ?? 0,
      totalFreedomPoints: totals.get(teamId) ?? 0,
      weeklyHistory: weeklyHistory.get(teamId) ?? []
    }
  })).map((team) => {
    const previousRank = previousRanks.get(team.teamId) ?? team.rank
    return {
      ...team,
      previousRank,
      rankMovement: previousRank - team.rank
    }
  })

  return {
    league: {
      id: String(league.id ?? ''),
      name: league.settings?.name ?? 'The National Freedom League'
    },
    season: Number(season),
    selectedWeek,
    latestCompletedWeek: completedWeeks.at(-1) ?? null,
    availableWeeks: completedWeeks,
    isWeekComplete: completedWeeks.includes(selectedWeek),
    isScoringResolved: selectedRanking?.isResolved ?? false,
    unresolvedTeamIds: selectedRanking?.unresolvedTeamIds ?? [],
    updatedAt: new Date().toISOString(),
    teams
  }
}

export const getDashboard = async ({ leagueType, leagueId, season, week }) => {
  const league = await getLeagueSeason({ leagueType, leagueId, season })
  const completedWeeks = getCompletedWeeks(league.schedule ?? [], league.teams?.length ?? 0)
  const selectedWeek = week == null ? completedWeeks.at(-1) : Number(week)

  if (!selectedWeek || !completedWeeks.includes(selectedWeek)) {
    const error = new Error('The requested week is not complete')
    error.status = 404
    throw error
  }

  const rankedWeeks = await Promise.all(
    completedWeeks.filter((value) => value <= selectedWeek).map(async (completedWeek) => {
      const entries = getWeekEntries(league.schedule, completedWeek)
      const tiedTeamIds = getTiedTeamIds(entries)
      let benchScores = new Map()

      if (tiedTeamIds.size > 0) {
        try {
          const boxscores = await getBoxscoresForWeek({
            leagueId,
            season,
            week: completedWeek
          })
          benchScores = getBenchScores(boxscores)
        } catch {
          benchScores = new Map()
        }
      }

      return {
        week: completedWeek,
        ...rankWeek({ entries, benchScores })
      }
    })
  )

  if (rankedWeeks.some((weekResult) => !weekResult.isResolved)) {
    const error = new Error('Freedom Points are awaiting a bench-score tiebreak')
    error.status = 409
    throw error
  }

  return buildDashboardSnapshot({
    league,
    season,
    selectedWeek,
    completedWeeks,
    rankedWeeks
  })
}

export const getFreedomStandings = async (options) => {
  const snapshot = await getDashboard(options)
  const totals = Object.fromEntries(
    snapshot.teams.map((team) => [team.name, team.totalFreedomPoints])
  )
  const runningTotals = new Map(snapshot.teams.map((team) => [team.teamId, 0]))
  const entriesByTeamAndWeek = new Map(snapshot.teams.map((team) => [
    team.teamId,
    new Map(team.weeklyHistory.map((entry) => [entry.week, entry.freedomPoints]))
  ]))
  const maxWeek = Math.max(...snapshot.availableWeeks)
  const weeklyFreedomPoints = Array.from({ length: maxWeek }, (_, index) => {
    const week = index + 1
    if (!snapshot.availableWeeks.includes(week)) return null

    return Object.fromEntries(snapshot.teams.map((team) => {
      const freedomPointsInWeek = entriesByTeamAndWeek.get(team.teamId)?.get(week) ?? 0
      const totalFreedomPointsThroughWeek =
        (runningTotals.get(team.teamId) ?? 0) + freedomPointsInWeek
      runningTotals.set(team.teamId, totalFreedomPointsThroughWeek)
      return [team.name, { freedomPointsInWeek, totalFreedomPointsThroughWeek }]
    }))
  })

  return { freedomPoints: totals, weeklyFreedomPoints }
}

export const getLeagueInfo = async ({ leagueType, leagueId }) => {
  const years = await getSeasonYears({ leagueType, leagueId })
  return Object.fromEntries(years.map((year) => [year, null]))
}
