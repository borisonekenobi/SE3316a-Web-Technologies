const {createClient} = require("./database_client");
const {csvToJSON, touristToSort} = require("../conversion_functions");

async function getDestinations(search = '', limit = 9999, offset = 0, sort = 'tourist_desc') {
    if (isNaN(limit) || limit < 0) limit = 9999;
    if (isNaN(offset) || offset < 0) offset = 0;
    let destinations = [];

    const client = createClient();
    await (async () => {
        await client.connect();
        const sort_map = {
            tourists_desc:'tourist_sort DESC',
            tourists_asc:'tourist_sort ASC',
            name_desc:'destination DESC',
            name_asc:'destination ASC',
            region_desc:'region DESC',
            region_asc:'region ASC',
            country_desc:'country DESC',
            country_asc:'country ASC'
        };
        if (!sort_map[sort]) sort = 'tourist_sort DESC';
        else sort = sort_map[sort];

        const res = await client.query(
            `SELECT *
             FROM ed.destinations
             WHERE destination LIKE $1
                OR region LIKE $1
                OR country LIKE $1
             ORDER BY ${sort}
             LIMIT $2
             OFFSET $3;`,
            [`%${search}%`, limit, offset]
        );

        destinations = res.rows;
    })();
    await client.end();

    return destinations;
}

async function getDestinationById(id) {
    let destination = {};

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return destination;
    }

    const client = createClient();
    await (async () => {
        await client.connect();
        const res = await client.query(
            `SELECT *
             FROM ed.destinations
             WHERE id = $1;`,
            [id]
        );
        destination = res.rows[0];
    })();
    await client.end();

    return destination;
}

async function updateAllDestinations(destinations) {
    destinations = await csvToJSON(destinations);
    if (!destinations) return false;

    destinations.forEach(destination => {
        destination.tourist_sort = touristToSort(destination.annual_tourists);
    });

    const client = createClient();
    await (async () => {
        await client.connect();
        await client.query(
            `DELETE FROM ed.list_destinations;`,
            []
        )
        await client.query(
            `DELETE FROM ed.destinations;`,
            []
        );
        for (let destination of destinations) {
            await client.query(
                `INSERT INTO ed.destinations (destination, region, country, category, longitude, latitude,
                 annual_tourists, currency, religion, foods, language, best_time_visit, cost_of_living, safety,
                 cultural_significance, description, tourist_sort)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17);`,
                [
                    destination.destination, destination.region, destination.country, destination.category,
                    destination.longitude, destination.latitude, destination.annual_tourists, destination.currency,
                    destination.religion, destination.foods, destination.language, destination.best_time_visit,
                    destination.cost_of_living, destination.safety, destination.cultural_significance,
                    destination.description, destination.tourist_sort
                ]
            );
        }
    })();
    await client.end();

    return true;
}

module.exports = {
    getDestinations,
    getDestinationById,
    updateAllDestinations
};
