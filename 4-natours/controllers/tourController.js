const { resource } = require('../app');
const Tour = require('../models/tourModel');
const AppError = require('../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
//param middleware
const checkID = (req, res, next, val) => {
  // const id = +val;
  // console.log(`checkID param middleware : id=${id}`);
  // if (id >= tours.length) {
  //   const response = { status: 'fail', message: 'Invalid ID' };
  //   return res.status(404).json(response);
  // }
  next();
};
const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = 'price -ratingsAverage';

  next();
};
//middleware to check post request body
// const checkBody = (req, res, next) => {
//   if (!req.body.hasOwnProperty('name') || !req.body.hasOwnProperty('price')) {
//     const response = {
//       status: 'fail',
//       message: 'Missing name or price property!',
//     };
//     return res.status(400).json(response);
//   }
//   next();
// };
const getAllTours = catchAsync(async (req, res, next) => {
  const query = Tour.find();
  const features = new APIFeatures(query, req.query);
  await features.filter().sort().limit().paginate();
  const tours = await query;

  //Sending response
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: { tours },
  });
});

const getTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findById(id);
  //Tour.findOne({_id:id})
  if (!tour) {
    return next(new AppError('No tour was found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { tour },
  });
});

const createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({ status: 'success', data: { tour: newTour } });
});

const updateTour = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('No tour was found with that ID', 404));
  }

  res.status(200).json({ status: 'success', data: { tour } });
});
const deleteTour = catchAsync(async (req, res) => {
  const id = req.params.id;
  const tour = await Tour.findByIdAndDelete(id);
  if (!tour) {
    return next(new AppError('No tour was found with that ID', 404));
  }
  res.status(200).json({ status: 'success', data: null });
});

const getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        num: { $sum: 1 },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
      },
    },
    {
      $sort: { num: 1 },
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } },
    // },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
});
const getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const stats = await Tour.aggregate([
    { $unwind: '$startDates' },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: { name: '$name', startDate: '$startDates' } },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: {
        _id: 0,
      },
    },
    { $sort: { numTourStarts: -1 } },
    // { $limit: 12 },
  ]);
  res.status(200).json({
    status: 'success',
    results: stats.length,
    data: { stats },
  });
});
module.exports = {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkID,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
