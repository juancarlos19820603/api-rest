const express = require('express');
const UserController = require('../controllers/user.controller');
const validateRequest = require('../middlewares/validation.middleware');
const { authenticate, authorize, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/* ========= RUTAS PÚBLICAS ========= */

router.post('/', UserController.register);
router.post('/login', UserController.login);

/* ========= RUTAS SOLO ADMIN ========= */

router.get(
  '/',
  authenticate,
  authorizeRole('admin'),   // 🔥 Solo admin puede ver todos
  UserController.getAllUsers
);

/* ========= RUTAS PROTEGIDAS ========= */

router.get(
  '/profile/me',
  authenticate,
  UserController.getProfile
);

router.put(
  '/profile/me',
  authenticate,
  UserController.updateProfile
);

router.put(
  '/:id',
  authenticate,
  authorize,      // 🔥 user dueño o admin
  UserController.updateUser
);

router.delete(
  '/:id',
  authenticate,
  authorize,      // 🔥 user dueño o admin
  UserController.deleteUser
);

module.exports = router;
