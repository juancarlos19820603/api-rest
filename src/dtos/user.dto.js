/**
 * CAPA DE DTOs (Data Transfer Objects)
 * 
 * Los DTOs definen la estructura de datos que entra (input) y sale (output)
 * de la API, garantizando consistencia y seguridad.
 * 
 * VENTAJAS:
 * - ✅ Validan los datos de entrada
 * - ✅ Transforman los datos antes de procesarlos
 * - ✅ Ocultan información sensible en respuestas
 * - ✅ Documentan la estructura esperada
 * - ✅ Protegen contra ataques (inyección, XSS, etc)
 */

const Joi = require('joi');

// ═══════════════════════════════════════════════════════════════════
// ESQUEMAS DE VALIDACIÓN (Joi Schemas)
// ═══════════════════════════════════════════════════════════════════

/**
 * CREATEUSERSCHEMA
 * Valida datos para crear un usuario
 * 
 * Reglas:
 * - email: Debe ser un email válido y requerido
 * - password: Min 8 caracteres, con letra, número y símbolo
 * - firstName: Min 2 caracteres, max 50
 * - lastName: Min 2 caracteres, max 50
 */
const createUserSchema = Joi.object({
  // EMAIL VALIDATION
  email: Joi.string()
    .email()                    // ← Valida formato de email
    .required()                 // ← No puede estar vacío
    .messages({
      'string.email': 'El email debe ser válido',
      'any.required': 'El email es requerido'
    }),
  
  // PASSWORD VALIDATION
  password: Joi.string()
    .min(8)                     // ← Mínimo 8 caracteres
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])/)  // ← Regex: letra + número + símbolo
    .required()
    .messages({
      'string.pattern.base': 'La contraseña debe tener al menos 8 caracteres, una letra, un número y un símbolo (@$!%*#?&)',
      'any.required': 'La contraseña es requerida'
    }),
  
  // FIRSTNAME VALIDATION
  firstName: Joi.string()
    .min(2)                     // ← Mínimo 2 caracteres
    .max(50)                    // ← Máximo 50 caracteres
    .required()
    .messages({
      'string.min': 'El nombre debe tener al menos 2 caracteres'
    }),
  
  // LASTNAME VALIDATION
  lastName: Joi.string()
    .min(2)
    .max(50)
    .required()
});

/**
 * UPDATEUSERSCHEMA
 * Valida datos para actualizar un usuario
 * 
 * Diferencia con createUserSchema:
 * - TODOS los campos son OPCIONALES
 * - PERO debe proporcionar al menos 1 campo
 */
const updateUserSchema = Joi.object({
  email: Joi.string().email(),        // ← Opcional pero si existe, debe ser email válido
  firstName: Joi.string().min(2).max(50),
  lastName: Joi.string().min(2).max(50),
  bio: Joi.string().max(500)          // ← Campo nuevo
}).min(1).messages({                   // ← DEBE haber al menos 1 campo
  'object.min': 'Debes proporcionar al menos un campo para actualizar'
});

/**
 * LOGINSCHEMA
 * Valida datos para login
 * 
 * Mucho más simple que createUserSchema:
 * - NO valida que la contraseña sea fuerte
 * - Solo requiere email y password
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// ═══════════════════════════════════════════════════════════════════
// CLASES DTO (Data Transfer Objects)
// ═══════════════════════════════════════════════════════════════════

/**
 * USERRESPONSEDTO
 * 
 * Define QUÉ DATOS se retornan al cliente
 * 
 * IMPORTANTE:
 * - NO incluye password
 * - NO incluye datos internos
 * - Solo datos públicos y seguros
 */
class UserResponseDTO {
  constructor(user) {
    this.id = user.id;
    this.email = user.email;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.bio = user.bio || null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
    
    // ❌ NO incluir:
    // this.password          ← Nunca exponer
    // this.isAdmin           ← Datos internos
    // this.secretToken       ← Información sensible
  }
}

/**
 * CREATEUSERDTO
 * 
 * Transforma y limpia los datos de entrada ANTES de procesarlos
 * 
 * Transformaciones:
 * - email → minúsculas + trim
 * - firstName → trim (elimina espacios)
 * - lastName → trim
 * 
 * Beneficios:
 * - "JUAN@EXAMPLE.COM  " → "juan@example.com"
 * - "  Juan  " → "Juan"
 * - Previene duplicados por capitalización
 * - Previene XSS por espacios
 */
class CreateUserDTO {
  constructor(data) {
    // Email: minúsculas + sin espacios
    // juan@EXAMPLE.COM → juan@example.com
    this.email = data.email.toLowerCase().trim();
    
    // Password: no transformar (está hasheado después)
    this.password = data.password;
    
    // Names: solo trim (preservar capitalización)
    // "  Juan  " → "Juan"
    this.firstName = data.firstName.trim();
    this.lastName = data.lastName.trim();
  }
}

/**
 * UPDATEUSERDTO
 * 
 * Similar a CreateUserDTO pero con campos opcionales
 * 
 * Solo transforma campos que existan
 */
class UpdateUserDTO {
  constructor(data) {
    // Solo transformar si el campo existe
    if (data.email) this.email = data.email.toLowerCase().trim();
    if (data.firstName) this.firstName = data.firstName.trim();
    if (data.lastName) this.lastName = data.lastName.trim();
    if (data.bio) this.bio = data.bio.trim();
    
    // Resultado:
    // { firstName: "Juan" } → { firstName: "Juan" }
    // { firstName: "Juan", bio: "Dev" } → { firstName: "Juan", bio: "Dev" }
  }
}

/**
 * AUTHRESPONSEDTO
 * 
 * Respuesta combinada para login:
 * - Usuario (sin password)
 * - JWT Token
 */
class AuthResponseDTO {
  constructor(user, token) {
    // Usar UserResponseDTO para el usuario (sin password)
    this.user = new UserResponseDTO(user);
    
    // Token JWT que el cliente debe guardar
    this.token = token;
  }
}

module.exports = {
  // Exportar esquemas
  createUserSchema,
  updateUserSchema,
  loginSchema,
  
  // Exportar clases DTO
  UserResponseDTO,
  CreateUserDTO,
  UpdateUserDTO,
  AuthResponseDTO
};