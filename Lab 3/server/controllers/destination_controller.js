const db = require("../database/destination_database");

exports.findAll = async (req, res) => {
    return res.json({destinations: await db.getDestinations(undefined, undefined, undefined, req.query.sort)});
};

exports.search = async (req, res) => {
    return res.json({destinations: await db.getDestinations(req.query.search, parseInt(req.query.limit), parseInt(req.query.offset), req.query.sort)});
};

exports.findOne = async (req, res) => {
    return res.json(await db.getDestinationById(req.params.id));
};

exports.updateAll = async (req, res) => {
    const dataUpdated = await db.updateAllDestinations(req.body.data);
    if (!dataUpdated) {
        res
            .status(400)
            .json({message: 'Invalid data.'})
            .end();
    } else {
        res
            .status(200)
            .json({message: 'Destinations updated.'})
            .end();
    }
}
