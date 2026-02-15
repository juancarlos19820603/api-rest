/**
 * MIDDLEWARE DE VALIDACIÓN
 * 
 * Responsabilidades:
 * - Valida los datos de entrada contra esquemas Joi
 * - Detiene la ejecución si hay errores
 * - Transforma/limpia datos si la validación es exitosa
 * - Reemplaza req.body con datos validados
 * 
 * FLUJO:
 * Cliente Envía → validateRequest Middleware → Si ✅ continúa
 *                                          └─ Si ❌ retorna 400
 */

const validateRequest = (schema, property = 'body') => {
  // validateRequest es una función que RETORNA un middleware
  // Esto es el patrón "Higher Order Function"
  
  return (req, res, next) => {
    // Aquí es donde se ejecuta el middleware real
    
    // ====== PASO 1: VALIDAR CONTRA ESQUEMA ======
    
    // schema.validate() recibe los datos a validar
    // req[property] permite validar req.body, req.query, req.params, etc
    // Por defecto es req.body
    const { error, value } = schema.validate(req[property], {
      // abortEarly: false
      // Si hay múltiples errores, retorna TODOS
      // Si fuera true, retorna solo el PRIMER error
      abortEarly: false,
      
      // stripUnknown: true
      // Elimina campos que NO están en el schema
      // Ejemplo:
      // Schema define: { email, password }
      // Cliente envía: { email, password, isAdmin, hacking }
      // stripUnknown: true → Elimina isAdmin y hacking ✅
      stripUnknown: true
    });

    // ====== PASO 2: MANEJAR ERRORES ======
    
    if (error) {
      // error.details contiene array de errores
      // Cada error tiene: path, message, type, etc
      
      const errors = error.details.map(err => ({
        field: err.path.join('.'),        // ['email'] → 'email'
        message: err.message              // Mensaje personalizado de Joi
      }));

      // Retornar respuesta de error
      // 400 = Bad Request (datos inválidos)
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    // ====== PASO 3: SI VALIDACIÓN EXITOSA ======
    
    // Reemplazar datos originales con datos validados
    // value contiene los datos después de validación + transformación
    req[property] = value;
    
    // Continuar con siguiente middleware/controlador
    next();
  };
};

module.exports = validateRequest;