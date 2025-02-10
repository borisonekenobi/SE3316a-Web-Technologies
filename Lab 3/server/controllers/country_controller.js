const db = require("../database/country_database");

exports.findAll = async (req, res) => {
    return res.json({destinations: await db.getCountries()});
};
