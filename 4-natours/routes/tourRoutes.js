const express = require('express');

const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  checkID,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');
const router = express.Router();
// the '/' root will be determined relate to app.use in app.js

//add param middleware
router.param('id', checkID);
router.route('/monthly-plan/:year').get(getMonthlyPlan);

router.route('/stats').get(getTourStats);
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);
router.route('/').get(getAllTours).post(createTour);
router.route('/:id').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
