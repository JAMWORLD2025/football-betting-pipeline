require('dotenv').config();
const { connect, close } = require('../db/mongo');
const { client, getFixtures } = require('../apiFootball');
const { season, leagues } = require('../config/leagues');

function last90Days(){
  const fmt = (d) => d.toISOString().slice(0, 10);
  const now = new Date();
  const from = new Date(now);
  from.setDate(now.getDate() - 90);
  return { from: fmt(from), to: fmt(now) };
}

async function backfillLeague(db, http, league) {
  const { from, to } = last90Days();
  const result = { league: league.name, fixtures: 0, errors: [] };
  try {
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
              backfilled: true,
              updatedAt: new Date(),
            },
          },
          upsert: true,
        },
      }));
      await db.collection('matches').bulkWrite(ops);
      result.fixtures = fixtures.length;
    }
  } catch (err) {
    result.errors.push(err.message);
  }
  return result;
}

async function runBackfill() {
  const db = await connect();
  const http = client();
  console.log(`[backfill] pulling last 90 days for ${leagues.length} league(s)`);
  const summary = [];
  for (const league of leagues) {
    const result = await backfillLeague(db, http, league);
    summary.push(result);
    console.log(`[backfill] ${league.name}:`, JSON.stringify(result));
  }
  await db.collection('sync_runs').insertOne({ runAt: new Date(), type: 'backfill', summary });
  console.log('[backfill] complete');
  return summary;
}

if (require.main === module) {
  runBackfill().then(() => close()).catch((err) => { console.error('[backfill] fatal error:', err); process.exitCode = 1; }).finally(() => close());
}

module.exports = { runBackfill };
