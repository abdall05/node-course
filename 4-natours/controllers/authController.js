const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const { promisify } = require('util');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const validator = require('validator');

const generateJwtToken = (id) =>
  jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
const createSendToken = function (
  user,
  statusCode,
  res,
  sendUserToClient = false
) {
  const token = generateJwtToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  // if (process.env.NODE_ENV === 'production') {
  //   cookieOptions.secure = true;
  // }
  res.cookie('jwt', token, cookieOptions);
  const response = {
    status: 'success',
    token,
  };

  if (sendUserToClient) {
    response.data = {
      user,
    };
  }

  res.status(statusCode).json(response);
};
const verifyJwtToken = async function (token) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded);
    });
  });
};
const getToken = (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  return token;
};

//or simply return promisify(jwt.verify) (provided by node)
exports.signup = catchAsync(async (req, res, next) => {
  const userData = {
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,

    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };
  const newUser = await User.create(userData);
  newUser.password = undefined;
  createSendToken(newUser, 201, res, (sendUserToClient = true));
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select('+password');
  // const isValidPassword = await bcrypt.compare(password, user.password)
  //do it im Model! fat model
  let isValidPassword;
  if (user) isValidPassword = await user.verifyPassword(password);
  if (!user || !isValidPassword) {
    return next(new AppError('Incorrect email or password', 401));
  }
  createSendToken(user, 201, res, (sendUserToClient = false));
});

exports.protect = catchAsync(async function (req, res, next) {
  let token = getToken(req);
  if (!token) return next(new AppError('Access denied'));
  // try {
  //   const id = await verifyJwtToken(token);
  //   req.user = id;
  // } catch (err) {
  //   return next(new AppError('Access denied'));
  // } or handle the error globally ;
  const payload = await promisify(jwt.verify)(token, JWT_SECRET);
  //check if user still exists
  const freshUser = await User.findById(payload.id);
  if (!freshUser)
    return new next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );

  //check if password hasn't been changed after the jwt was issued
  const JWTTimestamp = payload.iat;
  if (freshUser.changedPasswordAfter(JWTTimestamp)) {
    return new next(
      new AppError(
        'The user password was recently changed. Please log in again!',
        401
      )
    );
  }
  req.user = freshUser;

  next();
});

exports.restrictTo = (...roles) =>
  function (req, res, next) {
    const userRole = req.user.role;
    if (!roles.includes(userRole)) {
      return next(
        new AppError("You don't have permission to perform this action", 401)
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email || !validator.isEmail(email)) {
    return next(new AppError('Please provide a valid email address.', 400));
  }
  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }
  //generate random reset token for the user (add it to user schema methods)
  const resetToken = user.createPasswordResetToken();
  //save it in DB
  await user.save({ validateBeforeSave: false }); //important to skip validators (no password / confirm)
  //send it to user's email
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;
  const text = `Forgot you password? Submit a PATCH request with the new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email,
      subject: 'Your password reset token (valid for 10 min)',
      text,
    });
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
  next();
});

//verify token and update password
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm } = req.body;
  if (password !== passwordConfirm)
    return next(new AppError('Passwords are not the same!', 400));
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 404));
  }
  user.password = password;
  user.passwordConfirm = passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 201, res, (sendUserToClient = false));
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select('+password');
  const isCorrect = await user.verifyPassword(req.body.passwordCurrent);
  if (!isCorrect) {
    return next(new AppError('Incorrect password!', 401));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  createSendToken(user, 201, res, (sendUserToClient = false));
});
