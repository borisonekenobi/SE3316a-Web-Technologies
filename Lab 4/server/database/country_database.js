const {createClient} = require('./database_client');

async function getCountries() {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
        `SELECT country
         FROM ed.destinations
         GROUP BY country
         ORDER BY country;`,
        []
    );
    await client.end();

    return res.rows.map(row => row.country);
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  getCountries,
};
