const express = require('express');
const router = express.Router();

const userController = require('../controllers/user_controller');
const destinationController = require('../controllers/destination_controller');
const listController = require('../controllers/list_controller');
const countryController = require('../controllers/country_controller');

router.post('/login', userController.login);
router.post('/users', userController.create);
router.post('/users/:id', userController.register);
router.get('/users/:id', userController.findOne);
router.get('/users/:id/lists', userController.getLists);
router.put('/users/:id/password', userController.changePassword);
router.put('/users/:id', userController.update);

router.post('/destinations/:id/review', destinationController.addReview);
router.get('/destinations', destinationController.findAll);
router.get('/destinations/search', destinationController.search);
router.get('/destinations/:id', destinationController.findOne);
router.put('/destinations', destinationController.updateAll);
router.put('/destinations/:id/review', destinationController.updateReview);

router.post('/lists', listController.create);
router.post('/lists/:id/review', listController.addReview);
router.post('/lists/:id/:destination_id', listController.addToList);
router.get('/random-lists/:amount', listController.getRandomLists);
router.get('/lists', listController.findAll);
router.get('/lists/:id', listController.findOne);
router.put('/lists/:id', listController.update);
router.put('/lists/:id/review', listController.updateReview);
router.delete('/lists/:id', listController.delete);
router.delete('/lists/:id/:destination_id', listController.deleteFromList);

router.get('/countries', countryController.findAll);

router.get('/brew', (req, res) => {
  res.status(418).send('I\'m a teapot');
});

module.exports = router;
