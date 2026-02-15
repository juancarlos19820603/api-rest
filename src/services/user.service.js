/**
 * CAPA DE SERVICIOS (SERVICE LAYER)
 * 
 * Contiene toda la lógica de negocio.
 * Aquí va:
 * - Validaciones de reglas de negocio
 * - Consultas a base de datos
 * - Operaciones complejas
 * - Interacciones con APIs externas
 * 
 * CARACTERÍSTICAS IMPORTANTES:
 * - No conoce detalles de HTTP
 * - Independiente de Express
 * - Reutilizable en diferentes contextos (API, CLI, WebSocket, etc)
 */


// Importa librería bcrypt para encriptar contraseñas
const bcrypt = require('bcrypt');

// Importa clase personalizada para manejo de errores de negocio
// Permite lanzar errores con código HTTP específico
const { AppError } = require('../middlewares/error.middleware');

// Importa los DTOs para transformar datos antes de enviarlos al exterior
const {
  UserResponseDTO,  // DTO para devolver usuario sin password
  CreateUserDTO,    // DTO para crear usuario
  UpdateUserDTO,    // DTO para actualizar usuario
  AuthResponseDTO   // DTO para login (usuario + token)
} = require('../dtos/user.dto');


/**
 * SIMULACIÓN DE BASE DE DATOS
 * En producción sería una base de datos real.
 * Aquí usamos un array en memoria.
 */
let users = [
  {
    id: 1,  // ID único
    email: 'admin@example.com', // Email del usuario
    password: '$2b$10$YjuHC0L.KwXYzBVEaFgGauG5tYhLJ/6x4qLXqjzHJJPD5r9y3LKCC', // password123 hasheado
    firstName: 'Admin',
    lastName: 'User',
    bio: null,
    createdAt: new Date('2025-01-01'), // Fecha creación
    updatedAt: new Date('2025-01-01')  // Fecha actualización
  }
];

// Variable para simular auto-incremento de ID
let nextUserId = 2;


// Clase que contiene toda la lógica de negocio
class UserService {


  // ====== 1. CREAR USUARIO ======

  static async createUser(createUserDTO) {

    // VALIDACIÓN DE NEGOCIO:
    // Verificar que el email no esté registrado
    const existingUser = users.find(
      u => u.email === createUserDTO.email
    );

    if (existingUser) {
      // Error 409 = Conflict
      throw new AppError('El email ya está registrado', 409);
    }

    // SEGURIDAD:
    // Encriptar contraseña antes de guardar
    // 10 = salt rounds
    const hashedPassword = await bcrypt.hash(
      createUserDTO.password,
      10
    );

    // CONSTRUCCIÓN:
    // Crear objeto del nuevo usuario
    const newUser = {
      id: nextUserId++,  // Auto incremento
      email: createUserDTO.email,
      password: hashedPassword, // Nunca guardar texto plano
      firstName: createUserDTO.firstName,
      lastName: createUserDTO.lastName,
      bio: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // PERSISTENCIA:
    // Guardar en array (simula base de datos)
    users.push(newUser);

    // RESPUESTA:
    // Retornar DTO sin exponer password
    return new UserResponseDTO(newUser);
  }


  // ====== 2. LOGIN ======

  static async login(email, password, generateToken) {

    // BÚSQUEDA:
    // Buscar usuario por email
    const user = users.find(u => u.email === email);

    // VALIDACIÓN:
    // Si no existe → error genérico
    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    console.log("EMAIL ENVIADO:", email);
    console.log("PASSWORD ENVIADO:", password);
    console.log("USUARIO ENCONTRADO:", user);
    console.log("HASH GUARDADO:", user.password);

    // VERIFICACIÓN:
    // Comparar contraseña ingresada con hash almacenado
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // GENERACIÓN:
    // Crear JWT usando función inyectada
    const token = generateToken(user.id, user.email);

    // RESPUESTA:
    // Retornar usuario + token
    return new AuthResponseDTO(user, token);
  }


  // ====== 3. OBTENER TODOS LOS USUARIOS ======

  static async getAllUsers(page = 1, limit = 10) {

    // CÁLCULO DE PAGINACIÓN
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    // EXTRACCIÓN
    // Similar a SQL LIMIT/OFFSET
    const paginatedUsers = users.slice(startIndex, endIndex);

    // TOTAL DE REGISTROS
    const total = users.length;

    // RESPUESTA CON METADATA
    return {
      data: paginatedUsers.map(
        u => new UserResponseDTO(u) // Transformar cada usuario
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }


  // ====== 4. OBTENER USUARIO POR ID ======

  static async getUserById(userId) {

    // BÚSQUEDA
    const user = users.find(u => u.id === userId);

    // VALIDACIÓN
    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // RESPUESTA
    return new UserResponseDTO(user);
  }


  // ====== 5. ACTUALIZAR USUARIO ======

  static async updateUser(userId, updateUserDTO) {

    // BÚSQUEDA
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // VALIDACIÓN DE NEGOCIO:
    // Si se cambia email, verificar que no exista
    if (
      updateUserDTO.email &&
      updateUserDTO.email !== user.email
    ) {

      const existingUser = users.find(
        u => u.email === updateUserDTO.email
      );

      if (existingUser) {
        throw new AppError('El email ya está en uso', 409);
      }
    }

    // ACTUALIZACIÓN:
    // Copiar propiedades del DTO al usuario
    Object.assign(user, updateUserDTO, {
      updatedAt: new Date()
    });

    // RESPUESTA
    return new UserResponseDTO(user);
  }


  // ====== 6. ELIMINAR USUARIO ======

  static async deleteUser(userId) {

    // BÚSQUEDA DEL ÍNDICE
    const userIndex = users.findIndex(
      u => u.id === userId
    );

    if (userIndex === -1) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // ELIMINACIÓN
    // splice elimina y retorna el elemento
    const deletedUser = users.splice(userIndex, 1)[0];

    // RESPUESTA
    return {
      success: true,
      message: 'Usuario eliminado correctamente',
      user: new UserResponseDTO(deletedUser)
    };
  }


  // ====== 7. OBTENER PERFIL ======

  static async getProfile(userId) {

    // Reutiliza lógica existente
    return this.getUserById(userId);
  }


  // ====== 8. ACTUALIZAR PERFIL ======

  static async updateProfile(userId, updateUserDTO) {

    // Reutiliza lógica existente
    return this.updateUser(userId, updateUserDTO);
  }
}


// Exporta la clase para usarla en los controladores
module.exports = UserService;
