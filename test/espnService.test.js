import assert from 'node:assert/strict'
import test from 'node:test'
import { buildDashboardSnapshot, getCompletedWeeks, rankWeek } from '../src/service/espnService.js'

test('rankWeek awards higher Freedom Points to higher fantasy scores', () => {
  const result = rankWeek({
    entries: [
      { teamId: 1, fantasyPoints: 90 },
      { teamId: 2, fantasyPoints: 120 },
      { teamId: 3, fantasyPoints: 105 }
    ]
  })

  assert.deepEqual(
    result.ranked.map(({ teamId, freedomPoints }) => ({ teamId, freedomPoints })),
    [
      { teamId: 1, freedomPoints: 1 },
      { teamId: 3, freedomPoints: 2 },
      { teamId: 2, freedomPoints: 3 }
    ]
  )
  assert.equal(result.isResolved, true)
})

test('rankWeek uses bench points to break equal fantasy scores', () => {
  const result = rankWeek({
    entries: [
      { teamId: 1, fantasyPoints: 110 },
      { teamId: 2, fantasyPoints: 110 }
    ],
    benchScores: new Map([[1, 34.5], [2, 42]])
  })

  assert.deepEqual(result.ranked.map(({ teamId }) => teamId), [1, 2])
  assert.equal(result.ranked[1].freedomPoints, 2)
  assert.equal(result.isResolved, true)
})

test('rankWeek exposes missing bench tiebreak data', () => {
  const result = rankWeek({
    entries: [
      { teamId: 1, fantasyPoints: 110 },
      { teamId: 2, fantasyPoints: 110 }
    ]
  })

  assert.equal(result.isResolved, false)
  assert.deepEqual(result.unresolvedTeamIds, [1, 2])
  assert.deepEqual(result.ranked.map(({ freedomPoints }) => freedomPoints), [null, null])
})

test('rankWeek exposes an unresolved tie when bench scores are also equal', () => {
  const result = rankWeek({
    entries: [
      { teamId: 1, fantasyPoints: 110 },
      { teamId: 2, fantasyPoints: 110 }
    ],
    benchScores: new Map([[1, 40], [2, 40]])
  })

  assert.equal(result.isResolved, false)
  assert.deepEqual(result.unresolvedTeamIds, [1, 2])
  assert.deepEqual(result.ranked.map(({ freedomPoints }) => freedomPoints), [null, null])
})

test('completed weeks require every expected team and matchup decision', () => {
  const schedule = [
    {
      matchupPeriodId: 1,
      playoffTierType: 'NONE',
      winner: 'HOME',
      home: { teamId: 1 },
      away: { teamId: 2 }
    },
    {
      matchupPeriodId: 1,
      playoffTierType: 'NONE',
      winner: 'UNDECIDED',
      home: { teamId: 3 },
      away: { teamId: 4 }
    },
    {
      matchupPeriodId: 2,
      playoffTierType: 'NONE',
      winner: 'AWAY',
      home: { teamId: 1 },
      away: { teamId: 2 }
    }
  ]

  assert.deepEqual(getCompletedWeeks(schedule, 4), [])
})

test('dashboard uses competition ranks and real matchup records', () => {
  const league = {
    id: 248873,
    settings: { name: 'Test League' },
    teams: [
      { id: 1, name: 'Alpha', abbrev: 'ALP' },
      { id: 2, name: 'Bravo', abbrev: 'BRV' }
    ],
    schedule: [
      {
        matchupPeriodId: 1,
        playoffTierType: 'NONE',
        winner: 'HOME',
        home: { teamId: 1 },
        away: { teamId: 2 }
      }
    ]
  }

  const snapshot = buildDashboardSnapshot({
    league,
    season: 2026,
    selectedWeek: 1,
    completedWeeks: [1],
    rankedWeeks: [{
      week: 1,
      ranked: [
        { teamId: 1, fantasyPoints: 100, benchPoints: null, freedomPoints: 1 },
        { teamId: 2, fantasyPoints: 120, benchPoints: null, freedomPoints: 2 }
      ],
      isResolved: true,
      unresolvedTeamIds: []
    }]
  })

  assert.equal(snapshot.teams[0].name, 'Bravo')
  assert.equal(snapshot.teams[0].rank, 1)
  assert.deepEqual(snapshot.teams.find(({ teamId }) => teamId === 1).record, {
    wins: 1,
    losses: 0,
    ties: 0
  })
})
