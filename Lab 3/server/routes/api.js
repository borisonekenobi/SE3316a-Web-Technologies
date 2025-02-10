const express = require('express');
const router = express.Router();

const destinationController = require('../controllers/destination_controller');
const listController = require('../controllers/list_controller');
const countryController = require('../controllers/country_controller');

router.get('/destinations', destinationController.findAll);
router.get('/destinations/search', destinationController.search);
router.get('/destinations/:id', destinationController.findOne);
router.put('/destinations', destinationController.updateAll);

router.post('/lists', listController.create);
router.post('/lists/:id/:destination_id', listController.addToList);
router.get('/lists', listController.findAll);
router.get('/lists/:id', listController.findOne);
router.put('/lists/:id', listController.update);
router.delete('/lists/:id', listController.delete);
router.delete('/lists/:id/:destination_id', listController.deleteFromList);

router.get('/countries', countryController.findAll);

router.get('/brew', (req, res) => {
    res
        .status(418)
        .send('I\'m a teapot');
});

module.exports = router;
