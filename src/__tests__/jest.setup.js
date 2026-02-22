// jest.setup.js
const mongoose = require('mongoose');

// Desconectar de MongoDB después de los tests
afterAll(async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error desconectando de MongoDB:', error);
  }
});