const axios = require('axios');

const BASE_URL = 'https://v3.football.api-sports.io';

function client() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY is not set. Add it as a Railway environment variable.');
  }

  return axios.create({
    baseURL: BASE_URL,
    headers: { 'x-apisports-key': apiKey },
    timeout: 15000,
  });
}

async function getStandings(http, { league, season }) {
  const { data } = await http.get('/standings', { params: { league, season } });
  return data.response;
}

async function getFixtures(http, { league, season, from, to }) {
  const { data } = await http.get('/fixtures', {
    params: { league, season, from, to },
  });
  return data.response;
}

async function getInjuries(http, { league, season }) {
  const { data } = await http.get('/injuries', { params: { league, season } });
  return data.response;
}

module.exports = { client, getStandings, getFixtures, getInjuries };
