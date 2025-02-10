const {createClient} = require("./database_client");

async function createList(user_id, list) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
      `SELECT id, name, description, is_private, user_id
       FROM ed.lists
       WHERE name = $1
         AND user_id = $2;`,
      [list.name, user_id]
    );
    if (res.rows.length > 0) {
      return {};
    }

    res = await client.query(
      `SELECT COUNT(*)
       FROM ed.lists
       WHERE user_id = $1;`,
      [user_id]
    );
    if (res.rows[0].count >= 20) {
      return res.rows[0].count;
    }

    res = await client.query(
      `WITH list AS (
         INSERT INTO ed.lists (name, description, is_private, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, is_private, user_id
       )
       SELECT list.id, name, description, is_private,
              user_id, email, nickname, status, type
       FROM list
       JOIN ed.users ON users.id = list.user_id;`,
      [list.name, list.description, list.is_private, user_id]
    );
    await client.end();

    return res.rows[0];
  } catch (e) {
    console.error(e);
  }
}

async function getLists() {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
        `SELECT list.id, list.name, list.description, list.is_private, list.user_id,
                "user".email, "user".nickname, "user".status, "user".type,
                destination.id AS destination_id, destination.destination, region, country, category, longitude, latitude, annual_tourists, currency, religion, foods, language, best_time_visit, cost_of_living, safety, cultural_significance, destination.description AS destination_description, tourist_sort
         FROM ed.lists list
         JOIN ed.users "user" ON "user".id = list.user_id
         LEFT JOIN ed.list_destinations ON ed.list_destinations.list_id = list.id
         LEFT JOIN ed.destinations destination ON destination.id = ed.list_destinations.destination_id
         WHERE is_private = false
         ORDER BY list.updated_at DESC;`
    );

    const lists = new Map();
    res.rows.forEach(row => {
      if (!lists.has(row.id)) {
        lists.set(row.id, {
          id: row.id,
          name: row.name,
          description: row.description,
          is_private: row.is_private,
          user: {
            id: row.user_id,
            email: row.email,
            nickname: row.nickname,
            status: row.status,
            type: row.type
          },
          destinations: [],
          average_rating: null,
          reviews: []
        });
      }
      if (row.destination_id) {
        lists.get(row.id).destinations.push({
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
          description: row.destination_description,
          tourist_sort: row.tourist_sort
        });
      }
    });

    for (const list of lists.values()) {
      res = await client.query(
        `SELECT review.user_id, review.rating, review.comment, review.is_hidden,
                "user".email, "user".nickname, "user".status, "user".type,
                AVG(avg_review.rating) AS average_rating
         FROM ed.list_reviews review
         JOIN ed.users "user" ON "user".id = review.user_id
         LEFT JOIN ed.list_reviews avg_review ON avg_review.list_id = review.list_id
         WHERE review.list_id = $1
         GROUP BY review.user_id, review.list_id, "user".id;`,
        [list.id]
      );

      if (res.rows.length > 0) list.average_rating = res.rows[0].average_rating;
      res.rows.forEach(row => {
        if (row.is_hidden) return;

        list.reviews.push({
          list_id: list.id,
          user: {
            id: row.user_id,
            email: row.email,
            nickname: row.nickname,
            status: row.status,
            type: row.type
          },
          rating: row.rating,
          comment: row.comment,
          is_hidden: row.is_hidden
        });
      });
    }
    await client.end();

    return Array.from(lists.values());
  } catch (e) {
    console.error(e);
  }
}

async function getRandomLists(amount) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `SELECT *
       FROM (
         SELECT lists.id, lists.name, lists.description, lists.user_id, lists.updated_at,
                email, nickname, status, type,
                AVG(avg_review.rating) AS average_rating,
                destinations.id AS destination_id, destination, region, country, category, longitude, latitude, annual_tourists, currency, religion, foods, language, best_time_visit, cost_of_living, safety, cultural_significance, destinations.description AS destination_description, tourist_sort
         FROM ed.lists
         LEFT JOIN ed.users ON users.id = lists.user_id
         LEFT JOIN ed.list_reviews avg_review ON avg_review.list_id = ed.lists.id
         LEFT JOIN ed.list_destinations ON ed.lists.id = ed.list_destinations.list_id
         LEFT JOIN ed.destinations ON ed.destinations.id = ed.list_destinations.destination_id
         WHERE is_private = false
         GROUP BY lists.id, users.id, destinations.id
         ORDER BY RANDOM()
         LIMIT $1
       ) AS random_lists
       ORDER BY random_lists.updated_at DESC;`,
      [amount]
    );
    await client.end();

    return res.rows;
  } catch (e) {
    console.error(e);
  }
}

async function getListById(id, include_hidden_reviews = false) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
      `SELECT lists.id, lists.name, lists.description, lists.is_private,
              lists.user_id, email, nickname, status, type,
              destinations.id AS destination_id, destination, region, country, latitude, longitude, annual_tourists, currency, religion, foods, language, best_time_visit, cost_of_living, safety, cultural_significance, destinations.description AS destination_description, tourist_sort
       FROM ed.lists
       JOIN ed.users ON users.id = lists.user_id
       LEFT JOIN ed.list_destinations ON ed.lists.id = ed.list_destinations.list_id
       LEFT JOIN ed.destinations ON ed.list_destinations.destination_id = ed.destinations.id
       WHERE ed.lists.id = $1;`,
      [id]
    );

    if (res.rows.length === 0) {
      return {};
    }

    let list = {
      id: id,
      name: res.rows[0].name,
      description: res.rows[0].description,
      is_private: res.rows[0].is_private,
      user: {
        id: res.rows[0].user_id,
        email: res.rows[0].email,
        nickname: res.rows[0].nickname,
        status: res.rows[0].status,
        type: res.rows[0].type
      },
      destinations: [],
      average_rating: null,
      reviews: []
    };
    for (let row of res.rows) {
      if (!row.destination_id) {
        continue;
      }

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
        description: row.destination_description,
        tourist_sort: row.tourist_sort
      });
    }

    res = await client.query(
      `SELECT user_id, rating, comment, is_hidden,
              email, nickname, status, type
       FROM ed.list_reviews
       JOIN ed.users ON users.id = list_reviews.user_id
       WHERE list_id = $1;`,
      [id]
    );
    await client.end();

    res.rows.forEach(row => {
      if (row.is_hidden && !include_hidden_reviews) return;

      list.reviews.push({
        list_id: list.id,
        user: {
          id: row.user_id,
          email: row.email,
          nickname: row.nickname,
          status: row.status,
          type: row.type
        },
        rating: row.rating,
        comment: row.comment,
        is_hidden: row.is_hidden
      });
    });

    return list;
  } catch (e) {
    console.error(e);
  }
}

async function updateList(id, list) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `UPDATE ed.lists
       SET name = $1,
           description = $2,
           is_private = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4;`,
      [list.name, list.description, list.is_private, id]
    );
    await client.end();

    return res.rowCount;
  } catch (e) {
    console.error(e);
  }
}

async function addToList(listId, destinationId) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
      `SELECT *
       FROM ed.lists
       WHERE id = $1;`,
      [listId]
    );
    if (res.rows.length === 0) {
      return 'no list';
    }

    res = await client.query(
      `SELECT *
       FROM ed.destinations
       WHERE id = $1;`,
      [destinationId]
    );
    if (res.rows.length === 0) {
      return 'no destination';
    }

    res = await client.query(
      `SELECT *
       FROM ed.list_destinations
       WHERE list_id = $1
         AND destination_id = $2;`,
      [listId, destinationId]
    );
    if (res.rows.length > 0) {
      return 'already added';
    }

    await client.query(
      `INSERT INTO ed.list_destinations (list_id, destination_id)
       VALUES ($1, $2);`,
      [listId, destinationId]
    );
    await client.end();

    return true;
  } catch (e) {
    console.error(e);
  }
}

async function deleteList(id) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `DELETE FROM ed.lists
       WHERE id = $1;`,
      [id]
    );
    await client.end();

    return res.rowCount;
  } catch (e) {
    console.error(e);
  }
}

async function deleteFromList(listId, destinationId) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `DELETE
       FROM ed.list_destinations
       WHERE list_id = $1
         AND destination_id = $2;`,
      [listId, destinationId]
    );
    await client.end();

    return res.rowCount;
  } catch (e) {
    console.error(e);
  }
}

async function addReview(review) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
      `SELECT *
       FROM ed.lists
       WHERE id = $1;`,
      [review.list_id]
    );
    if (res.rows.length === 0) {
      await client.end();
      return 'no list';
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
       FROM ed.list_reviews
       WHERE list_id = $1
         AND user_id = $2;`,
      [review.list_id, review.user.id]
    );
    if (res.rows.length > 0) {
      await client.end();
      return 'already reviewed';
    }

    res = await client.query(
      `INSERT INTO ed.list_reviews (list_id, user_id, rating, comment, is_hidden)
       VALUES ($1, $2, $3, $4, FALSE);`,
      [review.list_id, review.user.id, review.rating, review.comment]
    );
    await client.end();

    return res.rowCount;
  }
  catch (e) {
    console.error(e);
  }
}

async function updateReview(review) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `UPDATE ed.list_reviews
       SET is_hidden = $1
       WHERE list_id = $2
         AND user_id = $3;`,
      [review.is_hidden, review.list_id, review.user.id]
    );
    await client.end();

    return res.rowCount;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  createList,
  getLists,
  getRandomLists,
  getListById,
  updateList,
  addToList,
  deleteList,
  deleteFromList,
  addReview,
  updateReview
};
