const User = require('./../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const filterObj = require('./../utils/filterObject');
const updateMe = catchAsync(async (req, res, next) => {
  //create an error if user wants to update PASSWORD
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  console.log(filteredBody);
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: { user: updatedUser },
  });
});
const deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
const getAllUsers = catchAsync(async (req, res, next) => {
  const query = User.find();
  const users = await query;

  //Sending response
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

const createUser = function (req, res) {
  res
    .status(500)
    .json({ status: 'fail', message: 'This route is not yet implemented!' });
};
const getUser = function (req, res) {
  res
    .status(500)
    .json({ status: 'fail', message: 'This route is not yet implemented!' });
};

//for admin
const updateUser = function (req, res) {
  res
    .status(500)
    .json({ status: 'fail', message: 'This route is not yet implemented!' });
};
const deleteUser = function (req, res) {
  res
    .status(500)
    .json({ status: 'fail', message: 'This route is not yet implemented!' });
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
