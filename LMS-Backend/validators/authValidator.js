const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .notEmpty().withMessage('Name is required'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),

  body('contactNumber')
    .notEmpty().withMessage('Contact number is required')
    .matches(/^[0-9]{10}$/).withMessage('Contact number must be 10 digits'),
];

const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidation, loginValidation };