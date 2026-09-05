import cors from 'cors'
import express from 'express'
import { getDashboard, getFreedomStandings, getLeagueInfo } from './service/index.js'

const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://freedom-league-ui.vercel.app'
]

const parseLeagueParams = (input) => {
  const leagueType = String(input.leagueType ?? '')
  const leagueId = String(input.leagueId ?? '')

  if (leagueType !== 'football' || !/^\d+$/.test(leagueId)) {
    const error = new Error('Invalid league type or league ID')
    error.status = 400
    throw error
  }

  const configuredLeagueId = process.env.LEAGUE_ID ?? '248873'
  if (leagueId !== configuredLeagueId) {
    const error = new Error('League is not configured')
    error.status = 404
    throw error
  }

  return { leagueType, leagueId }
}

const parseSeason = (season) => {
  const value = Number(season)
  if (!Number.isInteger(value) || value < 2010 || value > new Date().getFullYear() + 1) {
    const error = new Error('Invalid season')
    error.status = 400
    throw error
  }
  return value
}

const asyncRoute = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

export const createApp = () => {
  const app = express()
  const configuredOrigins = process.env.ALLOWED_ORIGINS?.split(',').map((origin) => origin.trim())
  const allowedOrigins = configuredOrigins?.filter(Boolean) ?? DEFAULT_ALLOWED_ORIGINS

  app.disable('x-powered-by')
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
      callback(new Error('Origin is not allowed'))
    },
    methods: ['GET'],
    maxAge: 86400
  }))
  app.use(express.json({ limit: '16kb' }))

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.get('/results/:leagueType/:leagueId/dashboard/:year', asyncRoute(async (req, res) => {
    const league = parseLeagueParams(req.params)
    const season = parseSeason(req.params.year)
    const week = req.query.week == null ? undefined : Number(req.query.week)
    const dashboard = await getDashboard({ ...league, season, week })
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900')
    res.json({ data: dashboard })
  }))

  app.get('/results/:leagueType/:leagueId/freedomStandings/:year', asyncRoute(async (req, res) => {
    const league = parseLeagueParams(req.params)
    const season = parseSeason(req.params.year)
    const standings = await getFreedomStandings({ ...league, season })
    res.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=900')
    res.json({ data: standings })
  }))

  app.get('/leagueInfo', asyncRoute(async (req, res) => {
    const league = parseLeagueParams(req.query)
    const info = await getLeagueInfo(league)
    res.set('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    res.json({ data: info })
  }))

  app.use((error, _req, res, _next) => {
    const status = error.status ?? (error.message === 'Origin is not allowed' ? 403 : 500)
    if (status >= 500) console.error('Request failed:', error.message)
    res.status(status).json({
      error: status >= 500 ? 'Unable to load league data' : error.message
    })
  })

  return app
}

export default createApp()
