const {createClient} = require('./database_client');

async function addReview(review) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
        `SELECT *
         FROM ed.destinations
         WHERE id = $1;`,
        [review.destination_id]
    );
    if (res.rows.length === 0) {
      await client.end();
      return 'no destination';
    }

    res = await client.query(
      `SELECT *
       FROM ed.users
       WHERE id = $1;`,
        [review.user.id]
    );
    if (res.rows.length === 0) {
      await client.end();
      return 'no user';
    }

    res = await client.query(
        `SELECT *
       FROM ed.destination_reviews
       WHERE destination_id = $1
         AND user_id = $2;`,
        [review.destination_id, review.user.id]
    );
    if (res.rows.length > 0) {
      await client.end();
      return 'already reviewed';
    }

    res = await client.query(
      `INSERT INTO ed.destination_reviews (destination_id, user_id, rating, comment, is_hidden)
       VALUES ($1, $2, $3, $4, FALSE);`,
        [review.destination_id, review.user.id, review.rating, review.comment]
    );
    await client.end();

    return res.rowCount;
  }
  catch (e) {
    console.error(e);
  }
}

async function getDestinations(search, limit, offset, sort) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `SELECT id, destination, region, country, category, longitude, latitude,
              annual_tourists, currency, religion, foods, language,
              best_time_visit, cost_of_living, safety, cultural_significance,
              description, tourist_sort, AVG(review.rating) AS average_rating
       FROM ed.destinations
       LEFT JOIN ed.destination_reviews review ON id = review.destination_id
       WHERE destination ILIKE $1
          OR region ILIKE $1
          OR country ILIKE $1
       GROUP BY id
       ORDER BY ${sort}
       LIMIT $2 OFFSET $3;`,
      [`%${search}%`, limit, offset]
    );
    await client.end();

    return res.rows;
  } catch (e) {
    console.error(e);
  }
}

async function getDestinationById(id) {
  const client = createClient();
  try {
    await client.connect();
    const res = await client.query(
        `SELECT destinations.id, destinations.destination, destinations.region, destinations.country, destinations.category, destinations.longitude, destinations.latitude, destinations.annual_tourists, destinations.currency, destinations.religion, destinations.foods, destinations.language, destinations.best_time_visit, destinations.cost_of_living, destinations.safety, destinations.cultural_significance, destinations.description, destinations.tourist_sort,
                destination_reviews.destination_id, destination_reviews.user_id, destination_reviews.rating, destination_reviews.comment, destination_reviews.is_hidden,
                users.email, users.nickname, users.status, users.type
         FROM ed.destinations
         LEFT JOIN ed.destination_reviews ON destinations.id = destination_reviews.destination_id
         LEFT JOIN ed.users ON destination_reviews.user_id = users.id
         WHERE destinations.id = $1;`,
        [id]
    );
    await client.end();

    return res.rows;
  } catch (e) {
    console.error(e);
  } finally {
    await client.end();
  }
}

async function updateAllDestinations(destinations) {
  try {
    const client = createClient();
    await client.connect();
    await client.query(
        `TRUNCATE TABLE ed.destinations CASCADE;`,
        []
    );
    for (let destination of destinations) {
      const res = await client.query(
        `INSERT INTO ed.destinations (destination, region, country, category,
                     longitude, latitude, annual_tourists, currency, religion,
                     foods, language, best_time_visit, cost_of_living, safety,
                     cultural_significance, description, tourist_sort)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         RETURNING id;`,
        [
          destination.destination,
          destination.region,
          destination.country,
          destination.category,
          destination.longitude,
          destination.latitude,
          destination.annual_tourists,
          destination.currency,
          destination.religion,
          destination.foods,
          destination.language,
          destination.best_time_visit,
          destination.cost_of_living,
          destination.safety,
          destination.cultural_significance,
          destination.description,
          destination.tourist_sort
        ]
      );
      destination.id = res.rows[0].id;
    }
    await client.end();

    return destinations;
  } catch (e) {
    console.error(e);
  }
}

async function updateReview(review) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `UPDATE ed.destination_reviews
       SET is_hidden = $1
       WHERE destination_id = $2
         AND user_id = $3;`,
        [review.is_hidden, review.destination_id, review.user.id]
    );
    await client.end();

    return res.rowCount;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  addReview,
  getDestinations,
  getDestinationById,
  updateAllDestinations,
  updateReview
};
