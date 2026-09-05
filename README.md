# Fantasy Sports Hub

The server-side ESPN adapter and Freedom Points scoring authority for the
National Freedom League.

## Configuration

Copy `.env.example` to your preferred local environment loader or configure the
same values in Vercel:

```bash
ESPN_S2=
ESPN_SWID=
LEAGUE_ID=248873
ALLOWED_ORIGINS=http://localhost:3000
```

`ESPN_S2` and `ESPN_SWID` are private ESPN cookies. Never commit them, log them,
or send them to the browser.

## Commands

```bash
npm install
npm run start:dev
npm test
npm run lint
npm run build
```

The local API defaults to <http://localhost:5001>.

## Endpoints

- `GET /health`
- `GET /leagueInfo?leagueType=football&leagueId=:id`
- `GET /results/football/:id/dashboard/:season?week=:week`
- `GET /results/football/:id/freedomStandings/:season` (legacy compatibility)

The dashboard response is the canonical contract. It includes the latest
completed week, real W-L-T records, weekly fantasy and Freedom Points, cumulative
Freedom Points, ranks, movement, and scoring-integrity status.

## Freedom Points

Teams receive 1 through N points each completed regular-season week, ordered by
fantasy score. Equal fantasy scores are broken by that week's bench fantasy
points. If ESPN does not provide the required bench data, the response marks the
ranking unresolved instead of silently inventing a result.

Only fully decided regular-season matchup periods are included.
