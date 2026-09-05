# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This repository is the backend fantasy sports API:

- **Backend** (`/src`): Express.js API server that fetches data from ESPN Fantasy Football API
- **Consumer**: the separate `freedom-league-ui` Next.js application
- **Data Flow**: ESPN API → backend scoring modules → Express routes → Next.js server adapter

### Key Components

- `src/app.js`: Express app factory, validation, CORS, and API routes
- `src/server.js`: Local listener entry point
- `src/service/espnService.js`: Core business logic for fantasy sports data processing
- `src/espnFantasyClient.js`: ESPN API client wrapper
- `client/src/components/Leaderboard.js`: Primary React component displaying fantasy data

### API Structure

The backend exposes these main endpoints:
- `/results/:leagueType/:leagueId/dashboard/:year?week=:week` - Canonical dashboard snapshot
- `/results/:leagueType/:leagueId/freedomStandings/:year` - Season standings
- `/leagueInfo` - League metadata

The app uses dynamic routing with `leagueType` and `leagueId` parameters to support multiple fantasy leagues.

## Development Commands

### Backend Development
- `npm run start:dev` - Start backend in development mode with babel-node and nodemon
- `npm run start` - Start backend with nodemon (production-like)
- `npm run build` - Build backend to `/dist` directory using Babel
- `npm run lint` - Run ESLint with auto-fix

### Frontend Development  
- `cd client && npm start` - Start React development server (port 3000)
- `cd client && npm run build` - Build React app for production
- `cd client && npm test` - Run React test suite

### Full Development Setup
1. Install backend dependencies: `npm install`
2. Install frontend dependencies: `cd client && npm install`  
3. Start backend: `npm run start:dev`
4. Start frontend: `cd client && npm start`

## Code Architecture Notes

### ESPN Integration
- Uses `espn-fantasy-football-api` package for data fetching
- Requires ESPN cookies (espnS2, SWID) for private league access
- League arguments are passed explicitly; request handlers never mutate process environment
- ESPN cookies are server-only environment variables

### Data Processing
- "Freedom Points" system: Custom scoring logic in `espnService.js`
- Team data mapping and sorting happens server-side
- Frontend receives processed data ready for display

## Testing & Quality

- ESLint configured with Standard rules (`.eslintrc.yml`)
- Node's built-in test runner covers scoring and HTTP validation

## Deployment

- Backend deploys to Vercel using Node.js 22
- `api/index.js` imports the Express app without starting a local listener