const fs = require('fs');
const path = require('path');

const toursDataPath = path.join(
  __dirname,
  '..',
  'dev-data',
  'data',
  'tours.json'
);
let tours;
try {
  tours = JSON.parse(fs.readFileSync(toursDataPath, 'utf-8'));
} catch (err) {
  console.log('Failed to load tours data:', err.message);
}
tours.forEach((tour, index) => {
  tour['_id'] = index;
});

//param middleware
const checkID = (req, res, next, val) => {
  const id = +val;
  console.log(`checkID param middleware : id=${id}`);
  if (id >= tours.length) {
    const response = { status: 'fail', message: 'Invalid ID' };
    return res.status(404).json(response);
  }
  next();
};

//middleware to check post request body
const checkBody = (req, res, next) => {
  if (!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('price')) {
    const response = {
      status: 'fail',
      message: 'Missing name or price property!',
    };
    return res.status(400).json(response);
  }
  next();
};
const getAllTours = (req, res) => {
  if (tours) {
    const response = { status: 'success', results: tours.length, tours }; // only if data is an array
    res.status(200).json(response);
  } else {
    const response = {
      status: 'fail',
      message: 'Unable to load tours data',
    };
    res.status(500).json(response);
  }
};

const getTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour._id === id);
  if (tour) {
    const response = { status: 'success', tour };
    res.status(200).json(response);
  } else {
    const response = { status: 'fail', message: 'Tour not found!' };
    res.status(404).json(response);
  }
};

const createTour = (req, res) => {
  // console.log(req.body);
  //figure out id
  const newId = (tours.at(-1)?._id ?? 0) + 1;
  const newTour = Object.assign({ _id: newId }, req.body);
  // console.log(newTour);
  tours.push(newTour);
  fs.writeFile(toursDataPath, JSON.stringify(tours), (err) => {
    if (err) {
      res
        .status(500)
        .json({ status: 'fail', message: 'Failed to persist Tours Data' });
    } else {
      res.status(201).json({ status: 'success' });
    }
  });
};
const updateTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour._id === id);
  if (tour) {
    res.status(200).json({ status: 'success', tour: '<Updated Tour Here>' });
  } else {
    const response = { status: 'fail', message: 'Tour not found!' };
    res.status(404).json(response);
  }
};
const deleteTour = (req, res) => {
  const id = +req.params.id;
  const tour = tours.find((tour) => tour._id === id);
  if (tour) {
    res.status(200).json({ status: 'success', data: null });
  } else {
    const response = { status: 'fail', message: 'Invalid ID' };
    res.status(404).json(response);
  }
};
module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  checkBody,
};
