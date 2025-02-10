const {createClient} = require("./database_client");

async function createList(listName) {
    let id = false;

    const client = createClient();
    await (async () => {
        await client.connect();
        let res = await client.query(
            `SELECT *
             FROM ed.lists
             WHERE name = $1;`,
            [listName]
        );
        if (res.rows.length > 0) {
            return;
        }

        res = await client.query(
            `INSERT INTO ed.lists (name)
             VALUES ($1)
             RETURNING id;`,
            [listName]
        );

        id = res.rows[0].id;
    })();
    await client.end();

    return id;
}

async function getLists() {
    let lists = [];

    const client = createClient();
    await (async () => {
        await client.connect();
        const res = await client.query(
            `SELECT *
             FROM ed.lists
             LEFT JOIN ed.list_destinations ON ed.lists.id = ed.list_destinations.list_id
             ORDER BY name ASC;`,
            []
        );

        for (let row of res.rows) {
            let list = lists.find(list => list.id === row.id);
            if (!list) {
                list = {
                    id: row.id,
                    name: row.name,
                    destinations: []
                };
                lists.push(list);
            }

            if (row.destination_id) {
                list.destinations.push(row.destination_id);
            }
        }
    })();
    await client.end();

    return lists;
}

async function getListById(id) {
    let list = {};

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        return list;
    }

    const client = createClient();
    await (async () => {
        await client.connect();
        const res = await client.query(
            `SELECT *
             FROM ed.lists
             LEFT JOIN ed.list_destinations ON ed.lists.id = ed.list_destinations.list_id
             LEFT JOIN ed.destinations ON ed.list_destinations.destination_id = ed.destinations.id
             WHERE ed.lists.id = $1;`,
            [id]
        );

        list.id = id;
        list.name = res.rows[0].name;
        list.destinations = [];

        for (let row of res.rows) {
            if (row.destination_id) {
                list.destinations.push({
                    id: row.destination_id,
                    destination: row.destination,
                    region: row.region,
                    country: row.country,
                    latitude: row.latitude,
                    longitude: row.longitude,
                    annual_tourists: row.annual_tourists,
                    currency: row.currency,
                    religion: row.religion,
                    foods: row.foods,
                    language: row.language,
                    best_time_visit: row.best_time_visit,
                    cost_of_living: row.cost_of_living,
                    safety: row.safety,
                    cultural_significance: row.cultural_significance,
                    description: row.description,
                    tourist_sort: row.tourist_sort
                });
            }
        }
    })();
    await client.end();

    return list;
}

async function addToList(listId, destinationId) {
    let destinationAddedToList = 201;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listId) ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(destinationId)) {
        return 404;
    }

    const client = createClient();
    await (async () => {
        await client.connect();
        let res = await client.query(
            `SELECT *
             FROM ed.lists
             WHERE id = $1;`,
            [listId]
        );
        if (res.rows.length === 0) {
            destinationAddedToList = 404;
            return;
        }

        res = await client.query(
            `SELECT *
             FROM ed.list_destinations
             WHERE list_id = $1
             AND destination_id = $2;`,
            [listId, destinationId]
        );
        if (res.rows.length > 0) {
            destinationAddedToList = 409;
            return;
        }
        await client.query(
            `INSERT INTO ed.list_destinations (list_id, destination_id)
             VALUES ($1, $2);`,
            [listId, destinationId]
        );
    })();
    await client.end();

    return destinationAddedToList;
}

async function deleteList(id) {
    let listExists = true;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
        listExists = false;
        return listExists;
    }

    const client = createClient();
    await (async () => {
        await client.connect();
        const res = await client.query(
            `SELECT *
             FROM ed.lists
             WHERE id = $1;`,
            [id]
        );
        if (res.rows.length === 0) {
            listExists = false;
            return;
        }

        await client.query(
            `DELETE FROM ed.list_destinations
             WHERE list_id = $1;`,
            [id]
        );
        await client.query(
            `DELETE FROM ed.lists
             WHERE id = $1;`,
            [id]
        );
    })();
    await client.end();

    return listExists;
}

async function deleteFromList(listId, destinationId) {
    let listExists = true;

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(listId) ||
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(destinationId)) {
        listExists = false;
        return listExists;
    }

    const client = createClient();
    await (async () => {
        await client.connect();
        const res = await client.query(
            `SELECT *
             FROM ed.lists
             WHERE list_id = $1;`,
            [listId]
        );
        if (res.rows.length === 0) {
            listExists = false;
            return;
        }

        await client.query(
            `DELETE FROM ed.list_destinations
             WHERE list_id = $1
             AND destination_id = $2;`,
            [listId, destinationId]
        );
    })();
    await client.end();

    return listExists;
}

module.exports = {
    createList,
    getLists,
    getListById,
    addToList,
    deleteList,
    deleteFromList
};
