const db = require('../database/destination_database');
const {isUUID} = require('../helper_functions');
const {csvToJSON, touristToSort, verifyToken, decodeToken} = require('../conversion_functions');

const sort_map = {
  tourists_desc: 'tourist_sort DESC',
  tourists_asc: 'tourist_sort ASC',
  name_desc: 'destination DESC',
  name_asc: 'destination ASC',
  region_desc: 'region DESC',
  region_asc: 'region ASC',
  country_desc: 'country DESC',
  country_asc: 'country ASC',
};

exports.addReview = async (req, res) => {
  const token = verifyToken(req);
  const reviewer = decodeToken(token);

  if (!reviewer) {
    res.status(401).json({message: 'Unauthorized.'}).end();
    return;
  }

  const destination_id = req.params.id;
  const review = req.body;

  if (!isUUID(destination_id) || !review || review.destination_id !== destination_id || !review.rating) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  if (!review.comment) review.comment = '';

  const result = await db.addReview(review);
  if (!result) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (result === 'no destination') {
    res.status(404).json({message: 'Destination not found.'}).end();
  } else if (result === 'no user') {
    res.status(404).json({message: 'User not found.'}).end();
  } else if (result === 'already reviewed') {
    res.status(409).json({message: 'User already reviewed destination.'}).end();
  } else {
    res.status(201).json({token: token}).end();
  }
}

exports.findAll = async (req, res) => {
  const token = verifyToken(req);

  const search = '';
  const limit = 9999;
  const offset = 0;
  const sort = !!sort_map[req.body.sort] ?
      req.body.sort.toString() :
      'tourists_desc';

  const destinations = await db.getDestinations(search, limit, offset, sort_map[sort]);

  if (!destinations) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else {
    res.status(200).header('Authorization', token).json(destinations).end();
  }
};

exports.search = async (req, res) => {
  const token = verifyToken(req);

  const search = req.query.search.toString();
  const limit = parseInt(req.query.limit) || 9999;
  const offset = parseInt(req.query.offset) || 0;
  const sort = req.query.sort.toString();

  if (!sort_map[sort]) {
    res.status(400).json({message: 'Invalid limit.'}).end();
    return;
  }

  const destinations = await db.getDestinations(search, limit, offset,
      sort_map[sort]);

  if (!destinations) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else {
    res.status(200).json({destinations: destinations, token: token}).end();
  }
};

exports.findOne = async (req, res) => {
  const token = verifyToken(req);

  const id = req.params.id;

  if (!isUUID(id)) {
    res.status(400).json({message: 'Invalid id.'}).end();
    return;
  }

  const results = await db.getDestinationById(req.params.id);

  if (!results) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (results.length === 0) {
    res.status(404).json({message: 'Destination not found.'}).end();
  } else {
    const destination = {
      id: results[0].id,
      destination: results[0].destination,
      region: results[0].region,
      country: results[0].country,
      category: results[0].category,
      longitude: results[0].longitude,
      latitude: results[0].latitude,
      annual_tourists: results[0].annual_tourists,
      currency: results[0].currency,
      religion: results[0].religion,
      foods: results[0].foods,
      language: results[0].language,
      best_time_visit: results[0].best_time_visit,
      cost_of_living: results[0].cost_of_living,
      safety: results[0].safety,
      cultural_significance: results[0].cultural_significance,
      description: results[0].description,
      tourist_sort: results[0].tourist_sort,
      reviews: [],
    };

    results.forEach(result => {
      if (!result.user_id || result.is_hidden) {
        return;
      }

      destination.reviews.push({
        destination_id: result.destination_id, user: {
          id: result.user_id,
          email: result.email,
          nickname: result.nickname,
          status: result.status,
          type: result.type,
        }, rating: result.rating, comment: result.comment,
      });
    });

    res.status(200).json({destination: destination, token: token}).end();
  }
};

exports.updateAll = async (req, res) => {
  const token = verifyToken(req);
  const user = decodeToken(token);

  if (user.type !== 'admin') {
    res.status(403).json({message: 'Unauthorized.'}).end();
    return;
  }

  const data = req.body.data;
  let destinations = await csvToJSON(data);

  if (!data) {
    res.status(400).json({message: 'Invalid data.'}).end();
    return;
  }

  if (!destinations) {
    res.status(500).json({message: 'Internal server error.'}).end();
    return;
  }

  destinations.forEach(destination => {
    destination.tourist_sort = touristToSort(destination.annual_tourists);
  });

  destinations = await db.updateAllDestinations(destinations);
  if (!destinations) {
    res.status(500).json({message: 'Internal server error.'}).end();
  } else if (!destinations[destinations.length - 1].id) {
    res.status(400).json({message: 'Invalid data.'}).end();
  } else {
    res.status(200).json({message: 'Destinations updated.', token: token}).end();
  }
};

exports.updateReview = async (req, res) => {
  const token = verifyToken(req);
  const updater = decodeToken(token);

  if (updater.type !== 'admin') {
    res.status(403).json({message: 'Forbidden.'}).end();
    return;
  }

  const destination_id = req.params.id;
  const review = req.body;

  if (!isUUID(destination_id) || !review || review.destination_id !== destination_id || !review.user.id || review.is_hidden === undefined) {
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
