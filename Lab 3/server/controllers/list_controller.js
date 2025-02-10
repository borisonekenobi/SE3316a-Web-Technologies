const db = require("../database/list_database");

exports.create = async (req, res) => {
    const id = await db.createList(req.body.name);
    if (!id) {
        res
            .status(409)
            .json({message: 'List already exists.'})
            .end();
    } else {
        res
            .status(201)
            .json({id: id})
            .end();
    }
};

exports.findAll = async (req, res) => {
    return res.json({lists: await db.getLists()});
};

exports.findOne = async (req, res) => {
    return res.json(await db.getListById(req.params.id));
};

exports.update = async (req, res) => {
    await db.updateList(req.params.id, req.body.name);
    res
        .status(200)
        .json({message: 'List updated.'})
        .end();
}

exports.addToList = async (req, res) => {
    const status = await db.addToList(req.params.id, req.params.destination_id);
    if (status === 404) {
        res
            .status(404)
            .json({message: 'List not found.'})
            .end();
    } else if (status === 409) {
        res
            .status(409)
            .json({message: 'Destination already in list.'})
            .end();
    } else {
        res
            .status(201)
            .json({message: 'Destination added to list.'})
            .end();
    }
}

exports.delete = async (req, res) => {
    const listExists = await db.deleteList(req.params.id);
    if (!listExists) {
        res
            .status(404)
            .json({message: 'List not found.'})
            .end();
    } else {
        res
            .status(204)
            .json({message: 'List deleted.'})
            .end();
    }
};

exports.deleteFromList = async (req, res) => {
    const listExists = await db.deleteFromList(req.params.id, req.params.destination_id);
    if (!listExists) {
        res
            .status(404)
            .json({message: 'List not found.'})
            .end();
    } else {
        res
            .status(204)
            .json({message: 'Destination removed from list.'})
            .end();
    }
};
