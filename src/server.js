require('dotenv').config();
const express = require('express');
const cron = require('node-cron');
const { connect } = require('./db/mongo');
const { runDailySync } = require('./jobs/dailySync');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'football-betting-pipeline' });
});

app.get('/standings/:leagueId', async (req, res) => {
  try {
    const db = await connect();
    const doc = await db
      .collection('standings')
      .findOne({ leagueId: Number(req.params.leagueId) });
    res.json(doc || { message: 'no data yet for this league' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/last-sync', async (req, res) => {
  try {
    const db = await connect();
    const doc = await db
      .collection('sync_runs')
      .find()
      .sort({ runAt: -1 })
      .limit(1)
      .next();
    res.json(doc || { message: 'no sync has run yet' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/sync/run-now', async (req, res) => {
  try {
    const summary = await runDailySync();
    res.json({ status: 'complete', summary });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[server] listening on port ${PORT}`);
});

cron.schedule('0 6 * * *', () => {
  console.log('[cron] triggering scheduled daily sync');
  runDailySync().catch((err) => console.error('[cron] sync failed:', err));
});
