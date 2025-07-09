const { resource } = require('../app');
const Tour = require('../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

// const toursDataPath = path.join(
//   __dirname,
//   '..',
//   'dev-data',
//   'data',
//   'tours.json'
// );
// let tours;
// try {
//   tours = JSON.parse(fs.readFileSync(toursDataPath, 'utf-8'));
// } catch (err) {
//   console.log('Failed to load tours data:', err.message);
// }
// tours.forEach((tour, index) => {
//   tour['_id'] = index;
// });

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
const getAllTours = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);

    const response = {
      status: 'fail',
      message: err.message,
    };
    res.status(404).json(response);
  }
};

const getTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findById(id);
    //Tour.findOne({_id:id})
    res.status(200).json({
      status: 'success',
      data: { tour },
    });
  } catch (err) {
    const response = {
      status: 'fail',
      message: err.message,
    };
    res.status(404).json(response);
  }
  // const id = +req.params.id;
  // const tour = tours.find((tour) => tour._id === id);
  // if (tour) {
  //   const response = { status: 'success', tour };
  //   res.status(200).json(response);
  // } else {
  //   const response = { status: 'fail', message: 'Tour not found!' };
  //   res.status(404).json(response);
  // }
};

const createTour = async (req, res) => {
  try {
    console.log('createTour called');
    const newTour = await Tour.create(req.body);
    res.status(201).json({ status: 'success', data: { tour: newTour } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
  // console.log(req.body);
  //figure out id
  // const newId = (tours.at(-1)?._id ?? 0) + 1;
  // const newTour = Object.assign({ _id: newId }, req.body);
  // // console.log(newTour);
  // tours.push(newTour);
  // fs.writeFile(toursDataPath, JSON.stringify(tours), (err) => {
  //   if (err) {
  //     res
  //       .status(500)
  //       .json({ status: 'fail', message: 'Failed to persist Tours Data' });
  //   } else {
  //     res.status(201).json({ status: 'success' });
  //   }
  // });
};
const updateTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { tour } });
  } catch (err) {
    const response = {
      status: 'fail',
      message: err.message,
    };
    res.status(404).json(response);
  }
  // const id = +req.params.id;
  // const tour = tours.find((tour) => tour._id === id);
  // if (tour) {
  //   res.status(200).json({ status: 'success', tour: '<Updated Tour Here>' });
  // } else {
  //   const response = { status: 'fail', message: 'Tour not found!' };
  //   res.status(404).json(response);
  // }
};
const deleteTour = async (req, res) => {
  try {
    const id = req.params.id;
    await Tour.findByIdAndDelete(id);
    res.status(200).json({ status: 'success', data: null });
  } catch (err) {
    const response = { status: 'fail', message: err.message };
    res.status(404).json(response);
  }
  // const id = +req.params.id;
  // const tour = tours.find((tour) => tour._id === id);
  // if (tour) {
  //   res.status(200).json({ status: 'success', data: null });
  // } else {
  //   const response = { status: 'fail', message: 'Invalid ID' };
  //   res.status(404).json(response);
  // }
};

const getTourStats = async (req, res) => {
  try {
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
  } catch (err) {
    const response = {
      status: 'fail',
      message: err.message,
    };
    res.status(404).json(response);
  }
};
const getMonthlyPlan = async (req, res) => {
  try {
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
  } catch (err) {
    const response = {
      status: 'fail',
      message: err.message,
    };
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
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
};
