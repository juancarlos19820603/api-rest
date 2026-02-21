const jwt = require('jsonwebtoken');

/**
 * Autenticación: Verifica JWT
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token no proporcionado'
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.userRole = decoded.role;  // ← IMPORTANTE
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

/**
 * Autorización: Solo dueño o admin
 */
const authorize = (req, res, next) => {
  const userId = req.params.id;

  // Admin puede hacer todo
  if (req.userRole === 'admin') {
    return next();
  }

  // Users solo su propio recurso
  if (req.userId !== parseInt(userId)) {
    return res.status(403).json({
      success: false,
      message: 'No tienes permiso para acceder a este recurso'
    });
  }

  next();
};

/**
 * Verificar rol específico
 */
const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.userRole) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o sin role'
      });
    }

    if (req.userRole !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: `Solo ${requiredRole}s pueden acceder a este recurso`
      });
    }

    next();
  };
};

/**
 * Generar JWT
 */
const generateToken = (userId, email, role = 'user') => {
  return jwt.sign(
    { id: userId, email: email, role: role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  authorize,
  authorizeRole,
  generateToken
};