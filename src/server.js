// Cargar variables de entorno desde .env
require('dotenv').config();

const connectDB = require('./config/db');

connectDB();

// Importar la aplicación Express ya configurada
const app = require('./app');

// Leer puerto de .env o usar 3000 por defecto
const PORT = process.env.PORT || 3000;

// Leer ambiente de .env o usar 'development' por defecto
const NODE_ENV = process.env.NODE_ENV || 'development';

// Iniciar el servidor en el puerto especificado
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📍 Ambiente: ${NODE_ENV}`);
});

// ====== MANEJO DE ERRORES NO CAPTURADOS ======

// Captura promesas rechazadas que no fueron manejadas
// Ejemplo: await database.connect() → error no capturado
process.on('unhandledRejection', (err) => {
  console.error('❌ Rechazo no manejado:', err);
  // Cierra el servidor y termina el proceso
  server.close(() => process.exit(1));
});

// ====== CIERRE GRACEFUL ======

// SIGTERM: Señal enviada por Docker, Heroku, systemd, etc cuando paran el servidor
// Permite cerrar conexiones a BD, liberar recursos, etc antes de terminar
process.on('SIGTERM', () => {
  console.log('SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('Servidor cerrado');
    process.exit(0);
    
  });
});

module.exports = server;