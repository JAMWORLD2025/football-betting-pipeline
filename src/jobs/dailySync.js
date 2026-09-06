require('dotenv').config();
const { connect, close } = require('../db/mongo');
const { client, getStandings, getFixtures, getInjuries } = require('../apiFootball');
const { season, leagues } = require('../config/leagues');

function todayPlusRange(daysBack = 2, daysForward = 5) {
  const fmt = (d) => d.toISOString().slice(0, 10);
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - daysBack);
  const to = new Date(now);
  to.setDate(now.getDate() + daysForward);
  return { from: fmt(from), to: fmt(to) };
}

async function syncLeague(db, http, league) {
  const results = { league: league.name, standings: 0, fixtures: 0, injuries: 0, errors: [] };

  try {
    const standings = await getStandings(http, { league: league.id, season });
    if (standings.length) {
      await db.collection('standings').updateOne(
        { leagueId: league.id, season },
        {
          $set: {
            leagueId: league.id,
            leagueName: league.name,
            country: league.country,
            season,
            data: standings[0]?.league?.standings ?? [],
            updatedAt: new Date(),
          },
        },
        { upsert: true }
      );
      results.standings = 1;
    }
  } catch (err) {
    results.errors.push(`standings: ${err.message}`);
  }

  try {
    const { from, to } = todayPlusRange();
    const fixtures = await getFixtures(http, { league: league.id, season, from, to });
    if (fixtures.length) {
      const ops = fixtures.map((f) => ({
        updateOne: {
          filter: { fixtureId: f.fixture.id },
          update: {
            $set: {
              fixtureId: f.fixture.id,
              leagueId: league.id,
              leagueName: league.name,
              date: f.fixture.date,
              status: f.fixture.status.short,
              home: f.teams.home.name,
              away: f.teams.away.name,
              goalsHome: f.goals.home,
              goalsAway: f.goals.away,
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));
      await db.collection('matches').bulkWrite(ops);
      results.fixtures = fixtures.length;
    }
  } catch (err) {
    results.errors.push(`fixtures: ${err.message}`);
  }

  try {
    const injuries = await getInjuries(http, { league: league.id, season });
    if (injuries.length) {
      const ops = injuries.map((i) => ({
        updateOne: {
          filter: {
            leagueId: league.id,
            player: i.player.name,
            team: i.team.name,
            fixtureId: i.fixture?.id ?? null,
          },
          update: {
            $set: {
              leagueId: league.id,
              leagueName: league.name,
              player: i.player.name,
              team: i.team.name,
              reason: i.player.reason,
              type: i.player.type,
              fixtureId: i.fixture?.id ?? null,
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));
      await db.collection('injuries').bulkWrite(ops);
      results.injuries = injuries.length;
    }
  } catch (err) {
    results.errors.push(`injuries: ${err.message}`);
  }

  return results;
}

async function runDailySync() {
  const db = await connect();
  const http = client();

  console.log(`[sync] starting daily sync for ${leagues.length} league(s), season ${season}`);
  const summary = [];

  for (const league of leagues) {
    const result = await syncLeague(db, http, league);
    summary.push(result);
    console.log(`[sync] ${league.name}:`, JSON.stringify(result));
  }

  await db.collection('sync_runs').insertOne({
    runAt: new Date(),
    season,
    summary,
  });

  console.log('[sync] daily sync complete');
  return summary;
}

if (require.main === module) {
  runDailySync()
    .then(() => close())
    .catch((err) => {
      console.error('[sync] fatal error:', err);
      process.exitCode = 1;
    })
    .finally(() => close());
}

module.exports = { runDailySync };
