const express = require('express');
const UserController = require('../controllers/user.controller');
const { authenticate, authorize, authorizeRole } = require('../middlewares/auth.middleware');

const router = express.Router();

/* ========= RUTAS PÚBLICAS ========= */

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     tags: [Authentication]
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario. Se envía email de verificación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *               role:
 *                 type: string
 *                 enum: [user, admin, moderator]
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error de validación
 *       409:
 *         description: El email ya está registrado
 */
router.post('/', UserController.register);

/**
 * @swagger
 * /api/v1/users/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login de usuario
 *     description: Autentica un usuario y retorna JWT token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan@example.com
 *               password:
 *                 type: string
 *                 example: SecurePass123!
 *     responses:
 *       200:
 *         description: Login exitoso, retorna token
 *       401:
 *         description: Credenciales inválidas
 *       403:
 *         description: Email no verificado
 */
router.post('/login', UserController.login);

/**
 * @swagger
 * /api/v1/users/verify-email:
 *   post:
 *     tags: [Email Verification]
 *     summary: Verificar email
 *     description: Verifica el email del usuario usando el token recibido por email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token]
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de verificación
 *     responses:
 *       200:
 *         description: Email verificado correctamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/verify-email', UserController.verifyEmail);

/**
 * @swagger
 * /api/v1/users/resend-verification:
 *   post:
 *     tags: [Email Verification]
 *     summary: Reenviar email de verificación
 *     description: Reenvía el email de verificación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email reenviado
 *       404:
 *         description: Usuario no encontrado
 */
router.post('/resend-verification', UserController.resendVerificationEmail);

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     tags: [Password Reset]
 *     summary: Solicitar reset de contraseña
 *     description: Envía email con instrucciones para resetear contraseña
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Si el email existe, recibirás un enlace de reset
 */
router.post('/forgot-password', UserController.requestPasswordReset);

/**
 * @swagger
 * /api/v1/users/reset-password:
 *   post:
 *     tags: [Password Reset]
 *     summary: Resetear contraseña
 *     description: Cambia la contraseña usando el token de reset
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 example: NewPassword123!
 *     responses:
 *       200:
 *         description: Contraseña cambiada correctamente
 *       400:
 *         description: Token inválido o expirado
 */
router.post('/reset-password', UserController.resetPassword);

/* ========= RUTAS PROTEGIDAS (ESPECÍFICAS PRIMERO) ========= */

/**
 * @swagger
 * /api/v1/users/profile/me:
 *   get:
 *     tags: [Profile]
 *     summary: Obtener mi perfil
 *     description: Obtiene los datos del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Datos del perfil
 *       401:
 *         description: No autenticado
 */
router.get('/profile/me', authenticate, UserController.getProfile);

/**
 * @swagger
 * /api/v1/users/profile/me:
 *   put:
 *     tags: [Profile]
 *     summary: Actualizar mi perfil
 *     description: Actualiza los datos del perfil del usuario autenticado
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado
 *       401:
 *         description: No autenticado
 */
router.put('/profile/me', authenticate, UserController.updateProfile);

/* ========= RUTAS ADMIN ========= */

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     tags: [Users]
 *     summary: Obtener todos los usuarios (ADMIN ONLY)
 *     description: Lista todos los usuarios con paginación
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *       401:
 *         description: No autenticado
 *       403:
 *         description: Solo admins pueden acceder
 */
router.get('/', authenticate, authorizeRole('admin'), UserController.getAllUsers);

/* ========= RUTAS GENERALES (/:id DESPUÉS) ========= */

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener usuario por ID
 *     description: Obtiene los datos de un usuario específico
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Datos del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/:id', UserController.getUserById);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario
 *     description: Actualiza un usuario. Solo el dueño o admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               bio:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put('/:id', authenticate, authorize, UserController.updateUser);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Elimina un usuario. Solo el dueño o admin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *       401:
 *         description: No autenticado
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete('/:id', authenticate, authorize, UserController.deleteUser);

module.exports = router;