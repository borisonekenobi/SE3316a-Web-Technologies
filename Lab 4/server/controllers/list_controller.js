const db = require('../database/list_database');
const {isUUID} = require('../helper_functions');
const {verifyToken, decodeToken} = require('../conversion_functions');

exports.create = async (req, res) => {
  const token = verifyToken(req);
  const user = decodeToken(token);

  if (!user) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const list_obj = req.body;

  if (!list_obj || !list_obj.name) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }
  if (!list_obj.description) list_obj.description = '';
  if (!list_obj.is_private) list_obj.is_private = true;

  const result = await db.createList(user.id, list_obj);

  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result >= 20) {
    res.status(403).json({message: 'Maximum number of lists reached.'}).end();
  } else if (!result.id) {
    res.status(409).json({message: 'List already exists.'}).end();
  } else {
    const list = {
      id: result.id,
      name: result.name,
      description: result.description,
      is_private: result.is_private,
      user: {
        id: result.user_id,
        email: result.email,
        nickname: result.nickname,
        status: result.status,
        type: result.type,
      },
      destinations: [],
      average_rating: null,
      reviews: []
    }

    res.status(201).json({list: list, token: token}).end();
  }
};

exports.addToList = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (!updater) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const list_id = req.params.id;
  const destination_id = req.params.destination_id;
  const original = await db.getListById(list_id);

  if (!isUUID(list_id) || !isUUID(destination_id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  if (updater.id !== original.user.id) {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const result = await db.addToList(list_id, destination_id);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 'no list') {
    res.status(404).json({message: 'List not found.'}).end();
  } else if (result === 'no destination') {
    res.status(404).json({message: 'Destination not found.'}).end();
  } else if (result === 'already added') {
    res.status(409).json({message: 'Destination already added to list.'}).end();
  } else {
    res.status(201).json({token: token}).end();
  }
};

exports.addReview = async (req, res) => {
  const token = verifyToken(req);
  const reviewer = decodeToken(token);

  if (!reviewer) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const list_id = req.params.id;
  const review = req.body;

  if (!isUUID(list_id) || !review || review.list_id !== list_id || !review.rating) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  if (!review.comment) review.comment = '';

  const list = await db.getListById(list_id)

  if (list.is_private) {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const result = await db.addReview(review);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 'no list') {
    res.status(404).json({message: 'List not found.'}).end();
  } else if (result === 'no user') {
    res.status(404).json({message: 'User not found.'}).end();
  } else if (result === 'already reviewed') {
    res.status(409).json({message: 'User already reviewed list.'}).end();
  } else {
    res.status(201).json({token: token}).end();
  }
};

exports.getRandomLists = async (req, res) => {
  const token = verifyToken(req);

  const amount = req.params.amount;
  if (isNaN(amount) || amount < 1) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const result = await db.getRandomLists(amount);

  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else {
    const lists = new Map();

    result.forEach(list => {
      if (!lists.has(list.id)) {
        lists.set(list.id, {
          id: list.id,
          name: list.name,
          description: list.description,
          is_private: list.is_private,
          user: {
            id: list.user_id,
            email: list.email,
            nickname: list.nickname,
            status: list.status,
            type: list.type,
          },
          destinations: [],
          average_rating: list.average_rating,
          reviews: [],
        });
      }

      if (list.destination_id) {
        lists.get(list.id).destinations.push({
          id: list.destination_id,
          destination: list.destination,
          region: list.region,
          country: list.country,
          category: list.category,
          longitude: list.longitude,
          latitude: list.latitude,
          annual_tourists: list.annual_tourists,
          currency: list.currency,
          religion: list.religion,
          foods: list.foods,
          language: list.language,
          best_time_visit: list.best_time_visit,
          cost_of_living: list.cost_of_living,
          safety: list.safety,
          cultural_significance: list.cultural_significance,
          description: list.destination_description,
          tourist_sort: list.tourist_sort,
        });
      }
    });

    res.status(200).json({lists: Array.from(lists.values()), token: token}).end();
  }
};

exports.findAll = async (req, res) => {
  const token = verifyToken(req);

  const lists = await db.getLists();

  if (!lists) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else {
    res.status(200).json({lists: lists, token: token}).end();
  }
};

exports.findOne = async (req, res) => {
  const token = verifyToken(req);
  const user = decodeToken(token);

  const list_id = req.params.id;

  if (!isUUID(list_id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const list = await db.getListById(list_id, user.type === 'admin');

  if (list.is_private && list.user_id !== user.id) {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  if (!list) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!list.id) {
    res.status(404).json({message: 'List not found.'}).end();
  } else {
    res.status(200).json({list: list, token: token}).end();
  }
};

exports.update = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (!updater) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const id = req.params.id;
  const list = req.body;
  const original = await db.getListById(id);

  if (!isUUID(id) || !list || !list.name) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }
  if (!list.description) list.description = '';
  if (list.is_private === undefined) list.is_private = true;

  if (updater.id !== original.user.id) {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const result = await db.updateList(id, list);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 0) {
    res.status(404).json({message: 'List not found.'}).end();
  } else {
    res.status(200).json({message: 'List updated.', token: token}).end();
  }
};

exports.updateReview = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (updater.type !== 'admin') {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const list_id = req.params.id;
  const review = req.body;

  if (!isUUID(list_id) || !review || review.list_id !== list_id || !review.user.id || review.is_hidden === undefined) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  const result = await db.updateReview(review);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 0) {
    res.status(404).json({message: 'Review not found.'}).end();
  } else {
    res.status(200).json({message: 'Review updated.', token: token}).end();
  }
};

exports.delete = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (!updater) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const id = req.params.id;
  const original = await db.getListById(id);

  if (!isUUID(id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  if (updater.id !== original.user.id) {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const result = await db.deleteList(id);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 0) {
    res.status(404).json({message: 'List not found.'}).end();
  } else {
    res.status(200).json({message: 'List deleted.', token: token}).end();
  }
};

exports.deleteFromList = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (!updater) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const list_id = req.params.id;
  const destination_id = req.params.destination_id;
  const original = await db.getListById(list_id);

  if (!isUUID(list_id) || !isUUID(destination_id)) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  if (updater.id !== original.user.id) {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const result = await db.deleteFromList(list_id, destination_id);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 0) {
    res.status(404).json({message: 'List not found.'}).end();
  } else {
    res.status(200).json({message: 'Destination removed from list.', token: token}).end();
  }
};
