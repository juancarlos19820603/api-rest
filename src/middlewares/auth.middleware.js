/**
 * MIDDLEWARE DE AUTENTICACIÓN Y AUTORIZACIÓN
 * 
 * Responsabilidades:
 * - ✅ Verifica JWT en el header Authorization
 * - ✅ Extrae información del usuario del token
 * - ✅ Protege rutas (solo usuarios autenticados)
 * - ✅ Verifica permisos (solo el dueño accede a su recurso)
 * - ✅ Genera nuevos tokens
 * 
 * DIFERENCIA IMPORTANTE:
 * - AUTENTICACIÓN: "¿Eres quien dices ser?" (verificar token)
 * - AUTORIZACIÓN: "¿Tienes permiso para esto?" (verificar que sea el dueño)
 */

const jwt = require('jsonwebtoken');

// ═══════════════════════════════════════════════════════════════════
// 1. AUTENTICACIÓN: VERIFY JWT TOKEN
// ═══════════════════════════════════════════════════════════════════

/**
 * Middleware authenticate
 * 
 * Responsabilidades:
 * - Extrae token del header Authorization
 * - Verifica que el token sea válido
 * - Extrae información del usuario del token
 * - Almacena userId en req para usar en controladores
 * 
 * Header esperado: "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
 */
const authenticate = (req, res, next) => {
  try {
    // ====== PASO 1: EXTRAER TOKEN DEL HEADER ======
    
    // Header Authorization es: "Bearer TOKEN"
    // Ejemplo: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwi..."
    const authHeader = req.headers.authorization;
    
    // Validar que el header exista y empiece con "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    // Extraer el token eliminando "Bearer " (7 caracteres)
    // "Bearer TOKEN" → "TOKEN"
    const token = authHeader.substring(7);

    // ====== PASO 2: VERIFICAR Y DECODIFICAR TOKEN ======
    
    // jwt.verify() verifica:
    // 1. Token está bien formado
    // 2. Token no está expirado
    // 3. Token fue firmado con el JWT_SECRET correcto
    // 4. Si todo está bien, retorna el payload decodificado
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // decoded = { id: 1, email: 'juan@example.com', iat: ..., exp: ... }

    // ====== PASO 3: GUARDAR INFO EN REQ PARA CONTROLADOR ======
    
    // Almacenar información del usuario en req
    // Ahora el controlador puede acceder a req.userId y req.userEmail
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    
    // IMPORTANTE: esto es disponible en:
    // - Siguiente middleware
    // - Controlador
    // - Cualquier middleware posterior

    // ====== PASO 4: CONTINUAR ======
    next();
    
  } catch (error) {
    // ====== MANEJO DE ERRORES ======
    
    // jwt.verify() puede lanzar diferentes errores
    // TokenExpiredError: token expirado
    // JsonWebTokenError: token inválido o tampering
    // NotBeforeError: token aún no válido
    
    if (error.name === 'TokenExpiredError') {
      // Token expiró
      // Usuario debe hacer login de nuevo
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    // Cualquier otro error (formato inválido, signature inválido, etc)
    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2. AUTORIZACIÓN: VERIFY OWNERSHIP
// ═══════════════════════════════════════════════════════════════════

/**
 * Middleware authorize
 * 
 * Responsabilidades:
 * - Verifica que el usuario sea el DUEÑO del recurso
 * - Solo se ejecuta si authenticate pasó (req.userId está disponible)
 * - Compara req.userId con el ID en la URL
 * 
 * Uso:
 * router.put('/:id', authenticate, authorize, controlador)
 * 
 * Si usuario 1 intenta actualizar usuario 2:
 * - authenticate pasa ✅ (token válido)
 * - authorize falla ❌ (no es el dueño)
 */
const authorize = (req, res, next) => {
  // ====== PASO 1: EXTRAER ID DEL RECURSO ======
  
  // El ID del recurso viene de la URL
  // PUT /api/v1/users/2
  // req.params.id = '2'
  const userId = req.params.id;

  // ====== PASO 2: COMPARAR CON USUARIO AUTENTICADO ======
  
  // req.userId viene del middleware authenticate
  // Si no pasó authenticate, req.userId sería undefined
  // parseInt() convierte string a número
  // '2' (string) → 2 (número)
  if (req.userId !== parseInt(userId)) {
    // El usuario autenticado NO es el dueño del recurso
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a este recurso'
    });
  }

  // ====== PASO 3: AUTORIZACIÓN EXITOSA ======
  
  // El usuario es el dueño, continuar
  next();
};

// ═══════════════════════════════════════════════════════════════════
// 3. GENERAR TOKENS JWT
// ═══════════════════════════════════════════════════════════════════

/**
 * Genera un JWT token
 * 
 * Responsabilidades:
 * - Crea un JWT con la información del usuario
 * - Firma con JWT_SECRET
 * - Establece expiración en 24 horas
 * 
 * Parámetros:
 * @param {number} userId - ID del usuario
 * @param {string} email - Email del usuario
 * 
 * Retorna:
 * @returns {string} Token JWT firmado
 * 
 * Uso:
 * const token = generateToken(user.id, user.email);
 */
const generateToken = (userId, email) => {
  // ====== PAYLOAD ======
  // Esto es lo que se codifica en el token
  // { id: 1, email: 'juan@example.com' }
  
  // ====== FIRMA ======
  // jwt.sign() crea el token
  return jwt.sign(
    // Payload: datos del usuario
    { id: userId, email: email },
    
    // Secret: clave para firmar (NUNCA compartir)
    // Debe estar en variables de entorno
    process.env.JWT_SECRET,
    
    // Opciones
    { expiresIn: '24h' }  // Token expira en 24 horas
  );
};

module.exports = {
  authenticate,
  authorize,
  generateToken
};

