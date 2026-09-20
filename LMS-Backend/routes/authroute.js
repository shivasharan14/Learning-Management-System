const express = require('express')

const router = express.Router()

const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../validators/authValidator');
const validate = require('../middleware/validate');
const protect =require('../middleware/authmiddleware')

router.post('/register', registerValidation, validate, registerUser);
router.post('/login', loginValidation, validate, loginUser);
router.get('/getMe', protect, getMe);

module.exports = router;