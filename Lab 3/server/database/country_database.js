const {createClient} = require("./database_client");

async function getCountries() {
    let countries = [];

    const client = createClient();
    await (async () => {
        await client.connect();
        const res = await client.query(
            `SELECT country
             FROM ed.destinations
             GROUP BY country
             ORDER BY country;`,
            []
        );

        countries = res.rows.map(row => row.country);
    })();
    await client.end();

    return countries;
}

module.exports = {
    getCountries
}
