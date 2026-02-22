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

  // ✅ Generar token de verificación
  const verificationToken = require('crypto').randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

  const newUser = await User.create({
    email: createUserDTO.email,
    password: hashedPassword,
    firstName: createUserDTO.firstName,
    lastName: createUserDTO.lastName,
    role: createUserDTO.role || 'user',
    emailVerificationToken: verificationToken,
    emailVerificationTokenExpires: verificationTokenExpires,
    isEmailVerified: false
  });

  // ✅ Enviar email de verificación
  const EmailService = require('./email.service');
  await EmailService.sendVerificationEmail(createUserDTO.email, verificationToken);

  return new UserResponseDTO(newUser);
} 

/**
 * Verifica el email del usuario
 */
static async verifyEmail(token) {
  const user = await User.findOne({
    emailVerificationToken: token,
    emailVerificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token de verificación inválido o expirado', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationTokenExpires = null;
  await user.save();

  return {
    success: true,
    message: 'Email verificado correctamente'
  };
}

/**
 * Reenviar email de verificación
 */
static async resendVerificationEmail(email) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('Usuario no encontrado', 404);
  }

  if (user.isEmailVerified) {
    throw new AppError('El email ya está verificado', 400);
  }

  // Generar nuevo token
  const verificationToken = require('crypto').randomBytes(32).toString('hex');
  const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.emailVerificationToken = verificationToken;
  user.emailVerificationTokenExpires = verificationTokenExpires;
  await user.save();

  // Enviar email
  const EmailService = require('./email.service');
  await EmailService.sendVerificationEmail(email, verificationToken);

  return {
    success: true,
    message: 'Email de verificación reenviado'
  };
}

  /**
   * Autentica un usuario
   */
static async login(email, password, generateToken) {
  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError('Credenciales inválidas', 401);
  }
// Verificar si el email está verificado
  if (!user.isEmailVerified) {
    throw new AppError('Por favor verifica tu email antes de iniciar sesión', 403);
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
/**
 * Solicita reset de contraseña
 */
static async requestPasswordReset(email) {
  const user = await User.findOne({ email });

  if (!user) {
    // Por seguridad, NO decimos si el usuario existe o no
    return {
      success: true,
      message: 'Si el email existe, recibirás un enlace de reset'
    };
  }

  // Generar token de reset
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  user.passwordResetToken = resetToken;
  user.passwordResetTokenExpires = resetTokenExpires;
  await user.save();

  // Enviar email
  const EmailService = require('./email.service');
  await EmailService.sendPasswordResetEmail(email, resetToken);

  return {
    success: true,
    message: 'Si el email existe, recibirás un enlace de reset'
  };
}

/**
 * Resetea la contraseña con token
 */
static async resetPassword(token, newPassword) {
  const user = await User.findOne({
    passwordResetToken: token,
    passwordResetTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    throw new AppError('Token de reset inválido o expirado', 400);
  }

  // Hashear nueva contraseña
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  user.password = hashedPassword;
  user.passwordResetToken = null;
  user.passwordResetTokenExpires = null;
  await user.save();

  return {
    success: true,
    message: 'Contraseña cambiada correctamente'
  };
}
  
}

module.exports = UserService;