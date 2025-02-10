const db = require('../database/country_database');
const {verifyToken} = require('../conversion_functions');

exports.findAll = async (req, res) => {
  const token = verifyToken(req);

  const countries = await db.getCountries();

  if (!countries) {
    res.status(500).send({message: 'Internal server error.'});
  } else {
    res.status(200).json({countries: countries, token: token}).end();
  }
};
