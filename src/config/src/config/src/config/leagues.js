// Leagues currently tracked by the daily sync.
// Start narrow on the API-Football Free tier (100 req/day), expand this list
// as the plan is upgraded. API-Football league IDs are stable and documented
// at https://www.api-football.com/documentation-v3#tag/Leagues
//
// Season is the year the season *starts* in (API-Football convention),
// e.g. the 2026-27 season is requested as season=2026.

module.exports = {
  season: 2026,
  leagues: [
    { id: 39, name: 'Premier League', country: 'England', tier: 'core' },
    { id: 140, name: 'La Liga', country: 'Spain', tier: 'core' },

    // Uncomment as the plan is upgraded past Free tier:
    // { id: 78, name: 'Bundesliga', country: 'Germany', tier: 'core' },
    // { id: 135, name: 'Serie A', country: 'Italy', tier: 'core' },
    // { id: 61, name: 'Ligue 1', country: 'France', tier: 'core' },
    // { id: 88, name: 'Eredivisie', country: 'Netherlands', tier: 'europe-2' },
    // { id: 94, name: 'Primeira Liga', country: 'Portugal', tier: 'europe-2' },
    // { id: 144, name: 'Belgian Pro League', country: 'Belgium', tier: 'europe-2' },
    // { id: 179, name: 'Scottish Premiership', country: 'Scotland', tier: 'europe-2' },
    // { id: 203, name: 'Süper Lig', country: 'Turkey', tier: 'europe-2' },
    // { id: 288, name: 'South African Premiership', country: 'South Africa', tier: 'africa' },
    // { id: 233, name: 'Egyptian Premier League', country: 'Egypt', tier: 'africa' },
    // { id: 200, name: 'Botola Pro', country: 'Morocco', tier: 'africa' },
    // { id: 253, name: 'MLS', country: 'USA', tier: 'americas' },
    // { id: 262, name: 'Liga MX', country: 'Mexico', tier: 'americas' },
    // { id: 71, name: 'Brasileirão Série A', country: 'Brazil', tier: 'americas' },
    // { id: 128, name: 'Argentina Primera División', country: 'Argentina', tier: 'americas' },
    // { id: 169, name: 'Chinese Super League', country: 'China', tier: 'asia' },
    // { id: 98, name: 'J1 League', country: 'Japan', tier: 'asia' },
    // { id: 292, name: 'K League 1', country: 'South Korea', tier: 'asia' },
    // { id: 188, name: 'A-League Men', country: 'Australia', tier: 'asia' },
  ],
};
