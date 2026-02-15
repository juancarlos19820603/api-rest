/**
 * CAPA DE CONTROLADORES (CONTROLLER LAYER)
 * 
 * Responsabilidades:
 * - Recibe las solicitudes HTTP
 * - Extrae parámetros (body, params, query)
 * - Llama a los servicios
 * - Retorna respuestas HTTP
 * - NO contiene lógica de negocio
 * 
 * PRINCIPIO: Los controladores son delgados, los servicios son gruesos
 */


// Importa la capa de servicios donde vive la lógica de negocio
const UserService = require('../services/user.service');

// Importa función que genera el token JWT
// Se utiliza en el proceso de login
const { generateToken } = require('../middlewares/auth.middleware');

// Importa los DTOs para transformar y validar datos de entrada
const { CreateUserDTO, UpdateUserDTO } = require('../dtos/user.dto');


// Define la clase controladora
// Contiene métodos estáticos que manejan endpoints
class UserController {

  // ====== 1. REGISTRAR USUARIO ======

  /**
   * POST /api/v1/users
   * Crea un nuevo usuario
   */
  static async register(req, res, next) {
    try {

      // Convierte el body en un DTO
      // Esto valida y estandariza los datos recibidos
      const createUserDTO = new CreateUserDTO(req.body);

      // Llama al servicio para ejecutar la lógica de negocio
      // El servicio se encarga de guardar el usuario
      const user = await UserService.createUser(createUserDTO);

      // Retorna respuesta HTTP 201 (Created)
      return res.status(201).json({
        success: true, // Indica éxito
        message: 'Usuario registrado correctamente',
        data: user     // Datos del usuario creado
      });

    } catch (error) {

      // Si ocurre un error, se pasa al middleware global de errores
      next(error);
    }
  }


  // ====== 2. LOGIN ======

  /**
   * POST /api/v1/users/login
   * Autentica un usuario y retorna token
   */
  static async login(req, res, next) {
    try {

      // Extrae email y password del body
      const { email, password } = req.body;

      // Llama al servicio de autenticación
      // Se pasa generateToken como dependencia
      const authResponse = await UserService.login(
        email,
        password,
        generateToken
      );

      // Retorna respuesta HTTP 200 (OK)
      return res.status(200).json({
        success: true,
        message: 'Autenticación exitosa',
        data: authResponse // Contiene usuario + token
      });

    } catch (error) {
      next(error);
    }
  }


  // ====== 3. OBTENER TODOS LOS USUARIOS ======

  /**
   * GET /api/v1/users?page=1&limit=10
   * Obtiene usuarios con paginación
   */
  static async getAllUsers(req, res, next) {
    try {

      // Extrae parámetros de query string
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      // Valida que la página sea mayor que 0
      if (page < 1) {
        return res.status(400).json({
          success: false,
          message: 'El número de página debe ser mayor a 0'
        });
      }

      // Valida que el límite esté en rango permitido
      if (limit < 1 || limit > 50) {
        return res.status(400).json({
          success: false,
          message: 'El límite debe estar entre 1 y 50'
        });
      }

      // Llama al servicio para obtener datos paginados
      const result = await UserService.getAllUsers(page, limit);

      // Devuelve respuesta HTTP 200
      return res.status(200).json({
        success: true,
        message: 'Usuarios obtenidos correctamente',
        data: result.data,             // Lista de usuarios
        pagination: result.pagination  // Información de paginación
      });

    } catch (error) {
      next(error);
    }
  }


  // ====== 4. OBTENER USUARIO POR ID ======

  /**
   * GET /api/v1/users/:id
   * Obtiene un usuario específico
   */
  static async getUserById(req, res, next) {
    try {

      // Extrae el ID desde los parámetros de la URL
      const userId = parseInt(req.params.id);

      // Valida que sea un número válido
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID debe ser un número válido'
        });
      }

      // Llama al servicio para buscar el usuario
      const user = await UserService.getUserById(userId);

      // Devuelve respuesta HTTP 200
      return res.status(200).json({
        success: true,
        message: 'Usuario obtenido correctamente',
        data: user
      });

    } catch (error) {
      next(error);
    }
  }


  // ====== 5. ACTUALIZAR USUARIO ======

  /**
   * PUT /api/v1/users/:id
   * Actualiza datos de un usuario
   */
  static async updateUser(req, res, next) {
    try {

      // Extrae ID de parámetros
      const userId = parseInt(req.params.id);

      // Valida que sea número
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID debe ser un número válido'
        });
      }

      // Transforma el body en DTO
      const updateUserDTO = new UpdateUserDTO(req.body);

      // Llama al servicio para actualizar
      const user = await UserService.updateUser(userId, updateUserDTO);

      // Devuelve respuesta HTTP 200
      return res.status(200).json({
        success: true,
        message: 'Usuario actualizado correctamente',
        data: user
      });

    } catch (error) {
      next(error);
    }
  }


  // ====== 6. ELIMINAR USUARIO ======

  /**
   * DELETE /api/v1/users/:id
   * Elimina un usuario
   */
  static async deleteUser(req, res, next) {
    try {

      // Extrae ID de parámetros
      const userId = parseInt(req.params.id);

      // Valida que sea número
      if (isNaN(userId)) {
        return res.status(400).json({
          success: false,
          message: 'El ID debe ser un número válido'
        });
      }

      // Llama al servicio para eliminar
      const result = await UserService.deleteUser(userId);

      // Devuelve resultado directamente (puede incluir mensaje personalizado)
      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }


  // ====== 7. OBTENER MI PERFIL (PROTEGIDO) ======

  /**
   * GET /api/v1/users/profile/me
   * Requiere autenticación JWT
   */
  static async getProfile(req, res, next) {
    try {

      // req.userId fue agregado por middleware de autenticación
      const user = await UserService.getProfile(req.userId);

      // Devuelve perfil del usuario autenticado
      return res.status(200).json({
        success: true,
        message: 'Perfil obtenido correctamente',
        data: user
      });

    } catch (error) {
      next(error);
    }
  }


  // ====== 8. ACTUALIZAR MI PERFIL (PROTEGIDO) ======

  /**
   * PUT /api/v1/users/profile/me
   * Requiere autenticación JWT
   */
  static async updateProfile(req, res, next) {
    try {

      // Convierte datos en DTO
      const updateUserDTO = new UpdateUserDTO(req.body);

      // Usa userId obtenido del middleware authenticate
      const user = await UserService.updateProfile(req.userId, updateUserDTO);

      // Devuelve respuesta HTTP 200
      return res.status(200).json({
        success: true,
        message: 'Perfil actualizado correctamente',
        data: user
      });

    } catch (error) {
      next(error);
    }
  }
}


// Exporta la clase para que pueda ser usada en el archivo de rutas
module.exports = UserController;



