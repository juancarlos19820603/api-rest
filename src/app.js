// Importa el framework Express para crear el servidor y manejar rutas
const express = require('express');

// Importa el middleware CORS para controlar qué dominios pueden consumir la API
const cors = require('cors');

// Importa Helmet para agregar headers de seguridad HTTP automáticamente
const helmet = require('helmet');

// Importa Morgan para registrar logs de las peticiones HTTP
const morgan = require('morgan');

// Importa express-rate-limit para limitar la cantidad de peticiones por IP
const rateLimit = require('express-rate-limit');


// Importa las rutas relacionadas con usuarios
// Este archivo contiene los endpoints (GET, POST, etc.)
const userRoutes = require('./routes/user.routes');

// Importa el middleware global de manejo de errores
// Este captura errores lanzados en cualquier parte de la app
const { errorHandler } = require('./middlewares/error.middleware');



// Crea la aplicación Express
// Aquí comienza la configuración del servidor
const app = express();


// ====== MIDDLEWARES DE SEGURIDAD ======


// Registra Helmet como middleware global
// Agrega headers de seguridad para proteger contra:
// - XSS
// - Clickjacking
// - Sniffing de contenido
app.use(helmet());


// Registra CORS con configuración personalizada
app.use(cors({

  // Permite solicitudes solo desde el dominio definido en variable de entorno
  // Si no existe, permite desde localhost:3000
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Permite el envío de cookies y credenciales en requests cross-origin
  credentials: true
}));


// Configura el limitador de peticiones
const limiter = rateLimit({

  // Tiempo de ventana en milisegundos (15 minutos)
  windowMs: 15 * 60 * 1000,

  // Máximo número de requests permitidos por IP en esa ventana
  max: 100,

  // Mensaje que se devuelve cuando se supera el límite
  message: 'Demasiadas solicitudes desde esta IP'
});


// Aplica el limitador solo a rutas que comiencen con /api/
// Protege endpoints públicos de abuso
app.use('/api/', limiter);


// Registra Morgan como middleware
// 'combined' es un formato detallado de logging estilo Apache
app.use(morgan('combined'));


// ====== MIDDLEWARES DE PARSEO ======


// Permite que la aplicación reciba y procese datos JSON en el body
// Límite máximo de tamaño del payload: 10MB
app.use(express.json({ limit: '10mb' }));


// Permite procesar datos enviados desde formularios HTML
// extended: true permite objetos anidados
// También limita el tamaño del body a 10MB
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// ====== RUTAS ======


// Registra las rutas de usuarios bajo el prefijo /api/v1/users
// Ejemplo:
// GET /api/v1/users
// POST /api/v1/users
app.use('/api/v1/users', userRoutes);


// ====== MANEJO DE ERRORES ======


// Middleware para manejar rutas no encontradas (404)
// Si ninguna ruta anterior respondió, se ejecuta este bloque
app.use((req, res) => {

  // Devuelve estado HTTP 404
  res.status(404).json({

    // Indica que la operación no fue exitosa
    success: false,

    // Mensaje descriptivo
    message: 'Ruta no encontrada',

    // Devuelve la ruta que el cliente intentó acceder
    path: req.originalUrl
  });
});


// Middleware global de manejo de errores
// Captura errores enviados con next(error)
// Debe ir después de todos los middlewares y rutas
app.use(errorHandler);


// Exporta la aplicación configurada
// Permite que otro archivo (ej: server.js) la importe y ejecute app.listen()
module.exports = app;
