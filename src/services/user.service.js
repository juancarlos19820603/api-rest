/**
 * CAPA DE SERVICIOS (SERVICE LAYER)
 * 
 * Contiene toda la lógica de negocio.
 * Aquí va:
 * - Validaciones de reglas de negocio
 * - Consultas a base de datos
 * - Operaciones complejas
 * - Interacciones con APIs externas
 */

const bcrypt = require('bcrypt');
const { AppError } = require('../middlewares/error.middleware');
const {
  UserResponseDTO,
  CreateUserDTO,
  UpdateUserDTO,
  AuthResponseDTO
} = require('../dtos/user.dto');
const User = require('../models/User');

class UserService {
  /**
   * Crea un nuevo usuario
   */
static async createUser(createUserDTO) {
  const existingUser = await User.findOne({ email: createUserDTO.email });
  if (existingUser) {
    throw new AppError('El email ya está registrado', 409);
  }

  const hashedPassword = await bcrypt.hash(createUserDTO.password, 10);

  const newUser = await User.create({
    email: createUserDTO.email,
    password: hashedPassword,
    firstName: createUserDTO.firstName,
    lastName: createUserDTO.lastName,
    role: createUserDTO.role || 'user'  // ← AGREGAR ESTO
  });

  return new UserResponseDTO(newUser);
}

  /**
   * Autentica un usuario
   */
static async login(email, password, generateToken) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Credenciales inválidas', 401);
  }

  // ✅ IMPORTANTE: Pasar los 3 parámetros incluyendo role
  const token = generateToken(user.id, user.email, user.role);

  return new AuthResponseDTO(user, token);
}

  /**
   * Obtiene todos los usuarios
   */
  static async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .exec();

    const total = await User.countDocuments();

    return {
      data: users.map(u => new UserResponseDTO(u)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Obtiene un usuario por ID
   */
  static async getUserById(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return new UserResponseDTO(user);
  }

  /**
   * Actualiza un usuario
   */
  static async updateUser(userId, updateUserDTO) {
    const user = await User.findById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar email único
    if (updateUserDTO.email && updateUserDTO.email !== user.email) {
      const existingUser = await User.findOne({ email: updateUserDTO.email });
      if (existingUser) {
        throw new AppError('El email ya está en uso', 409);
      }
    }

    // Actualizar usuario
    Object.assign(user, updateUserDTO);
    await user.save();

    return new UserResponseDTO(user);
  }

  /**
   * Elimina un usuario
   */
  static async deleteUser(userId) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      success: true,
      message: 'Usuario eliminado correctamente',
      user: new UserResponseDTO(user)
    };
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  static async getProfile(userId) {
    return this.getUserById(userId);
  }

  /**
   * Actualiza el perfil del usuario autenticado
   */
  static async updateProfile(userId, updateUserDTO) {
    return this.updateUser(userId, updateUserDTO);
  }
}

module.exports = UserService;