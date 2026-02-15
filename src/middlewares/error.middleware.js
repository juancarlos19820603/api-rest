/**
 * MIDDLEWARE DE MANEJO DE ERRORES
 * 
 * Responsabilidades:
 * - ✅ Captura TODOS los errores de la aplicación
 * - ✅ Proporciona respuestas consistentes al cliente
 * - ✅ Loguea errores para debugging
 * - ✅ Diferencia entre desarrollo y producción
 * - ✅ Retorna códigos HTTP apropiados
 * 
 * IMPORTANTE: Debe ser el ÚLTIMO middleware en app.js
 * app.use(routes);
 * app.use(errorHandler);  ← AQUÍ, al final
 */

const errorHandler = (err, req, res, next) => {
  // ====== PASO 1: LOGUEAR ERROR (para debugging) ======
  
  // Registrar en consola/logs para saber qué pasó
  // En producción, esto iría a un servicio como:
  // - Sentry
  // - LogRocket
  // - New Relic
  // - Datadog
  console.error('❌ Error:', {
    message: err.message,           // ← Mensaje del error
    stack: err.stack,               // ← Dónde ocurrió (ubicación en código)
    path: req.path,                 // ← Ruta que causó el error
    method: req.method              // ← HTTP method (GET, POST, etc)
  });

  // Ejemplo de salida:
  // ❌ Error: {
  //   message: 'El email ya está registrado',
  //   stack: 'Error: El email ya está registrado\n    at UserService.createUser...',
  //   path: '/api/v1/users',
  //   method: 'POST'
  // }

  // ====== PASO 2: DETERMINAR STATUS CODE Y MENSAJE ======
  
  // Valores por defecto
  // Si el error NO tiene statusCode, usar 500 (error interno del servidor)
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';

  // ====== PASO 3: MAPEAR ERRORES ESPECÍFICOS ======
  
  // Si el error tiene un nombre específico, ajustar status code
  // Esto es para errores que NO son AppError
  
  if (err.name === 'ValidationError') {
    statusCode = 400;  // Bad Request
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;  // Unauthorized
  }

  if (err.name === 'NotFoundError') {
    statusCode = 404;  // Not Found
  }

  // ====== PASO 4: RESPUESTA AL CLIENTE ======
  
  // Respuesta estándar (igual para todos los errores)
  return res.status(statusCode).json({
    success: false,                    // ← Indicador de error
    message,                           // ← Mensaje del error
    // Stack trace SOLO en desarrollo
    // En producción, los usuarios NO ven esto (por seguridad)
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// ═══════════════════════════════════════════════════════════════════
// CLASE PERSONALIZADA PARA ERRORES
// ═══════════════════════════════════════════════════════════════════

/**
 * Clase AppError
 * 
 * Extrae las propiedades necesarias:
 * - message: Mensaje descriptivo del error
 * - statusCode: Código HTTP (400, 401, 403, 404, 409, 500, etc)
 * 
 * Uso:
 * throw new AppError('El email ya existe', 409);
 * throw new AppError('Usuario no encontrado', 404);
 * throw new AppError('No autorizado', 401);
 * 
 * Ventajas:
 * - Errores consistentes en toda la aplicación
 * - Status code automático
 * - Fácil de testear
 * - Stack trace automático
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    // Llamar al constructor de Error
    // Esto establece this.message y this.stack automáticamente
    super(message);
    
    // Guardar el status code HTTP
    this.statusCode = statusCode;
  }
}

module.exports = {
  errorHandler,
  AppError
};