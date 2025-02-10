const {createClient} = require("./database_client");

async function getSalt(email) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `SELECT salt
       FROM ed.users
       WHERE email = $1;`,
      [email]
    );
    await client.end();

    return res.rows.length === 1 ? res.rows[0] : {};
  } catch (e) {
    console.error(e);
  }
}

async function getUser(email, password) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `SELECT id, email, nickname, status, type
       FROM ed.users
       WHERE email = $1
         AND password = $2;`,
      [email, password]
    );
    await client.end();

    return res.rows[0] || {};
  } catch (e) {
    console.error(e);
  }
}

async function getUserById(id) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `SELECT id, email, nickname, status, type
       FROM ed.users
       WHERE id = $1;`,
      [id]
    );
    await client.end();

    return res.rows[0];
  } catch (e) {
    console.error(e);
  }
}

async function getLists(user_id) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
      `SELECT list.id AS list_id, list.name, list.description, list.is_private,
              destination.id AS destination_id, destination.destination, destination.region,
              destination.country, destination.category, destination.longitude, destination.latitude,
              destination.annual_tourists, destination.currency, destination.religion, destination.foods,
              destination.language, destination.best_time_visit, destination.cost_of_living,
              destination.safety, destination.cultural_significance, destination.description AS destination_description,
              destination.tourist_sort
       FROM ed.lists list
       LEFT JOIN ed.list_destinations ON list.id = list_destinations.list_id
       LEFT JOIN ed.destinations destination ON list_destinations.destination_id = destination.id
       WHERE user_id = $1
       ORDER BY list.updated_at;`,
      [user_id]
    );

    const lists = new Map();
    res.rows.forEach(row => {
      if (!lists.has(row.list_id)) {
        lists.set(row.list_id, {
          id: row.list_id,
          name: row.name,
          description: row.description,
          is_private: row.is_private,
          user: {},
          destinations: [],
          average_rating: NaN,
          reviews: []
        });
      }

      if (!row.destination_id) return;
      lists.get(row.list_id).destinations.push({
        id: row.destination_id,
        destination: row.destination,
        region: row.region,
        country: row.country,
        category: row.category,
        longitude: row.longitude,
        latitude: row.latitude,
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
        tourist_sort: row.tourist_sort,
      });
    });

    for (const list of Array.from(lists.values())) {
      res = await client.query(
          `SELECT review.user_id, review.rating, review.comment, review.is_hidden,
                  "user".email, "user".nickname, "user".status, "user".type,
                  AVG(avg_review.rating) AS average_rating
           FROM ed.lists list
           LEFT JOIN ed.list_reviews review ON list.id = review.list_id
           LEFT JOIN ed.list_reviews avg_review ON list.id = avg_review.list_id
           LEFT JOIN ed.users "user" ON review.user_id = "user".id
           WHERE list.id = $1
           GROUP BY list.id, review.list_id, review.user_id, "user".id;`,
          [list.id]
      );

      if (!res.rows[0].average_rating) continue;
      list.reviews = res.rows.map(row => ({
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
      }));
    }

    await client.end();

    return Array.from(lists.values());
  } catch (e) {
    console.error(e);
  }
}

async function createUser(user) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `INSERT INTO ed.users (email, password, salt, nickname, status, type)
       VALUES ($1, $2, $3, $4, 'pending', 'standard')
       RETURNING id, email, nickname, status, type;`,
      [user.email, user.password, user.salt, user.nickname]
    );
    await client.end();

    return res.rows[0];
  }
  catch (e) {
    console.error(e);
  }
}

async function registerUser(id) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `UPDATE ed.users
       SET status = 'active'
       WHERE id = $1
         AND status = 'pending'
       RETURNING id, email, nickname, status, type;`,
      [id]
    );
    await client.end();

    return res.rows.length === 1 ? res.rows[0] : {};
  } catch (e) {
    console.error(e);
  }
}

async function changePassword(id, password, new_password) {
  try {
    const client = createClient();
    await client.connect();
    let res = await client.query(
        `SELECT status, password
         FROM ed.users
         WHERE id = $1;`,
        [id]
    );
    if (res.rows.length !== 1) {
      await client.end();
      return 'not found';
    }
    if (res.rows[0].status !== 'active') {
      await client.end();
      return 'not active';
    }
    if (res.rows[0].password !== password) {
      await client.end();
      return 'wrong password';
    }

    res = await client.query(
      `UPDATE ed.users
       SET password = $1
       WHERE id = $2
         AND password = $3
         AND status = 'active';`,
      [new_password, id, password]
    );
    await client.end();

    return res.rowCount;
  }
  catch (e) {
    console.error(e);
  }
}

async function setUserStatusType(id, user) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `UPDATE ed.users
       SET status = $1,
           type = $2
       WHERE id = $3
       RETURNING id;`,
      [user.status, user.type, id]
    );
    await client.end();

    return res.rows[0];
  } catch (e) {
    console.error(e);
  }
}

async function updateUser(id, user) {
  try {
    const client = createClient();
    await client.connect();
    const res = await client.query(
      `UPDATE ed.users
       SET email = $1, nickname = $2
       WHERE id = $3;`,
      [user.email, user.nickname, id]
    );
    await client.end();

    return res.rowCount;
  } catch (e) {
    console.error(e);
  }
}

module.exports = {
  getSalt,
  getUser,
  getUserById,
  getLists,
  createUser,
  registerUser,
  changePassword,
  setUserStatusType,
  updateUser
};
