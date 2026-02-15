/**
 * CAPA DE RUTAS (ROUTES LAYER)
 * 
 * Responsabilidades:
 * - Define los endpoints HTTP
 * - Aplica middlewares de validación
 * - Aplica middlewares de autenticación/autorización
 * - Conecta rutas con controladores
 * 
 * PATRÓN IMPORTANTE:
 * router.METHOD(
 *   'ruta',
 *   middleware1,
 *   middleware2,
 *   middleware3,
 *   controlador
 * )
 */

const express = require('express');
const UserController = require('../controllers/user.controller');
const validateRequest = require('../middlewares/validation.middleware');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const {
  createUserSchema,
  updateUserSchema,
  loginSchema
} = require('../dtos/user.dto');

// Crear router (sub-aplicación de Express)
const router = express.Router();

// ═══════════════════════════════════════════════════════════════════
// RUTAS PÚBLICAS (sin autenticación)
// ═══════════════════════════════════════════════════════════════════

/**
 * POST /api/v1/users
 * Registra un nuevo usuario
 * 
 * Flujo:
 * 1. Cliente envía datos
 * 2. validateRequest(createUserSchema) valida contra Joi
 * 3. UserController.register maneja la solicitud
 * 
 * Validaciones:
 * - email: debe ser válido y único
 * - password: min 8 caracteres, letra, número, símbolo
 * - firstName: min 2 caracteres
 * - lastName: min 2 caracteres
 * 
 * Respuesta:
 * - 201: Usuario creado
 * - 400: Error de validación
 * - 409: Email ya registrado
 */
router.post(
  '/',
  validateRequest(createUserSchema),  // ← Middleware 1: Validación
  UserController.register              // ← Controlador
);

/**
 * POST /api/v1/users/login
 * Autentica un usuario y retorna JWT token
 * 
 * Flujo:
 * 1. Cliente envía email y password
 * 2. validateRequest(loginSchema) valida estructura
 * 3. UserController.login verifica credenciales
 * 
 * Respuesta:
 * - 200: { user, token }
 * - 400: Error de validación
 * - 401: Credenciales inválidas
 */
router.post(
  '/login',
  validateRequest(loginSchema),        // ← Middleware: Validación
  UserController.login                 // ← Controlador
);

/**
 * GET /api/v1/users?page=1&limit=10
 * Obtiene todos los usuarios con paginación
 * 
 * Parámetros Query:
 * - page: número de página (default: 1)
 * - limit: usuarios por página (default: 10, máximo: 50)
 * 
 * Respuesta:
 * - 200: { data: [], pagination: { page, limit, total, totalPages } }
 * 
 * Ejemplo:
 * GET /api/v1/users?page=2&limit=5
 */
router.get('/', UserController.getAllUsers);

/**
 * GET /api/v1/users/:id
 * Obtiene un usuario específico por ID
 * 
 * Parámetros:
 * - id: ID del usuario (número)
 * 
 * Respuesta:
 * - 200: { data: user }
 * - 400: ID inválido
 * - 404: Usuario no encontrado
 * 
 * Ejemplo:
 * GET /api/v1/users/1
 */
router.get('/:id', UserController.getUserById);

// ═══════════════════════════════════════════════════════════════════
// RUTAS PROTEGIDAS (requieren autenticación JWT)
// ═══════════════════════════════════════════════════════════════════

/**
 * GET /api/v1/users/profile/me
 * Obtiene el perfil del usuario autenticado
 * 
 * ⚠️ IMPORTANTE: Esta ruta debe estar ANTES de GET /:id
 * Si estuviese después, Express interpretaría "me" como un ID
 * 
 * Headers Requeridos:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Flujo:
 * 1. Cliente envía request con JWT en header
 * 2. authenticate middleware verifica el token
 *    - Si válido: extrae userId y lo pone en req.userId
 *    - Si inválido: retorna 401
 * 3. UserController.getProfile usa req.userId
 * 
 * Respuesta:
 * - 200: { data: user }
 * - 401: Token no válido o expirado
 * 
 * Ejemplo:
 * curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3000/api/v1/users/profile/me
 */
router.get(
  '/profile/me',
  authenticate,                        // ← Middleware: Verificar JWT
  UserController.getProfile            // ← Controlador
);

/**
 * PUT /api/v1/users/profile/me
 * Actualiza el perfil del usuario autenticado
 * 
 * Headers Requeridos:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Body (todos opcionales):
 * {
 *   "firstName": "Nuevo Nombre",
 *   "bio": "Mi biografía"
 * }
 * 
 * Flujo:
 * 1. authenticate verifica JWT
 * 2. validateRequest(updateUserSchema) valida datos
 * 3. UserController.updateProfile usa req.userId
 * 
 * Respuesta:
 * - 200: { data: user actualizado }
 * - 400: Error de validación
 * - 401: No autenticado
 */
router.put(
  '/profile/me',
  authenticate,                        // ← Middleware: Verificar JWT
  validateRequest(updateUserSchema),   // ← Middleware: Validación
  UserController.updateProfile         // ← Controlador
);

/**
 * PUT /api/v1/users/:id
 * Actualiza un usuario (solo el dueño puede)
 * 
 * Headers Requeridos:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Parámetros:
 * - id: ID del usuario a actualizar
 * 
 * Flujo:
 * 1. authenticate verifica JWT → extrae req.userId
 * 2. authorize verifica que req.userId === params.id
 *    - Solo el dueño del recurso puede actualizar
 * 3. validateRequest valida los datos
 * 4. UserController.updateUser actualiza
 * 
 * Respuesta:
 * - 200: { data: user actualizado }
 * - 400: Error de validación
 * - 401: No autenticado
 * - 403: No autorizado (intentas actualizar otro usuario)
 * - 404: Usuario no encontrado
 * 
 * Ejemplo:
 * PUT /api/v1/users/2
 * Authorization: Bearer <token_del_usuario_2>  ← DEBE SER DEL USUARIO 2
 * { "firstName": "Juan" }
 */
router.put(
  '/:id',
  authenticate,                        // ← Middleware: Verificar JWT
  authorize,                           // ← Middleware: Solo el dueño
  validateRequest(updateUserSchema),   // ← Middleware: Validación
  UserController.updateUser            // ← Controlador
);

/**
 * DELETE /api/v1/users/:id
 * Elimina un usuario (solo el dueño puede)
 * 
 * Headers Requeridos:
 * Authorization: Bearer <JWT_TOKEN>
 * 
 * Parámetros:
 * - id: ID del usuario a eliminar
 * 
 * Flujo:
 * 1. authenticate verifica JWT
 * 2. authorize verifica que sea el dueño
 * 3. UserController.deleteUser elimina
 * 
 * Respuesta:
 * - 200: { success: true }
 * - 401: No autenticado
 * - 403: No autorizado
 * - 404: Usuario no encontrado
 * 
 * Ejemplo:
 * DELETE /api/v1/users/2
 * Authorization: Bearer <token>
 */
router.delete(
  '/:id',
  authenticate,                        // ← Middleware: Verificar JWT
  authorize,                           // ← Middleware: Solo el dueño
  UserController.deleteUser            // ← Controlador
);

module.exports = router;

