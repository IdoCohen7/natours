const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');

router.post('/signUp', authController.signUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

router.use(authController.protect);
// SINCE THIS RUNS IN SEQUENCE, ALL ROUTES BELOW THIS MIDDLEWARE WILL BE PROTECTED

router.get('/me', userController.getMe);

router.patch('/updateMyPassword', authController.updatePassword);

router.use(authController.restrictTo('admin'));
// ALL ROUTES BELOW THIS MIDDLEWARE ARE AVAILABLE FOR ADMIN USERS ONLY

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.patchUser)
  .delete(userController.deleteUser);

module.exports = router;
