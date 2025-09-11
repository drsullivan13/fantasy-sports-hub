# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a full-stack fantasy sports application with separate backend API and React frontend:

- **Backend** (`/src`): Express.js API server that fetches data from ESPN Fantasy Football API
- **Frontend** (`/client`): React application using Material-UI components and routing
- **Data Flow**: ESPN API → Backend services → Express routes → React frontend

### Key Components

- `src/app.js`: Main Express server with CORS configuration and API routes
- `src/service/espnService.js`: Core business logic for fantasy sports data processing
- `src/espnFantasyClient.js`: ESPN API client wrapper
- `client/src/components/Leaderboard.js`: Primary React component displaying fantasy data

### API Structure

The backend exposes these main endpoints:
- `/results/:leagueType/:leagueId/teamLeaderboard/:year/:week` - Weekly team rankings
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
- Environment variables `LEAGUE_TYPE` and `LEAGUE_ID` are set per request

### Data Processing
- "Freedom Points" system: Custom scoring logic in `espnService.js`
- Team data mapping and sorting happens server-side
- Frontend receives processed data ready for display

### React Structure
- Single-page app with React Router for league/season navigation
- Material-UI DataGrid for data display with custom styling
- Color coding based on performance percentages

## Testing & Quality

- ESLint configured with Standard rules (`.eslintrc.yml`)
- No backend tests currently configured

## Deployment

- Backend deploys to Vercel using Node.js 22 runtime (`vercel-build` script)
- CORS configured for API access