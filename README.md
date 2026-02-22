API REST Profesional – Node.js + Express + JWT

Backend desarrollado con arquitectura modular, autenticación JWT, autorización por roles, pruebas automatizadas y documentación profesional con Swagger.

Descripción:

Esta API REST fue desarrollada como proyecto práctico para fortalecer conocimientos en:

Arquitectura backend escalable

Autenticación y autorización

Testing profesional

Buenas prácticas (Clean Code + separación de responsabilidades)

Incluye manejo de usuarios con roles (user, admin) y protección de rutas.

Tecnologías utilizadas:

Node.js

Express

JSON Web Token (JWT)

MongoDB

Jest (Unit & Integration Testing)

Swagger (Documentación API)

Arquitectura del Proyecto:
src/
 ├── controllers/
 ├── services/
 ├── repositories/
 ├── routes/
 ├── middleware/
 ├── dtos/
 ├── utils/
 └── __tests__/

Arquitectura basada en separación por capas:

Controller → Maneja HTTP

Service → Lógica de negocio

Repository → Acceso a datos

DTO → Normalización de datos

Middleware → Autenticación y autorización

Autenticación y Roles

La API implementa:

Registro de usuario

Login con generación de JWT

Middleware de autenticación

Middleware de autorización por rol (admin)

Testing

Pruebas automatizadas con:

npm test

Incluye:

Unit Tests

Integration Tests

Mocking de servicios externos

Documentación Swagger

La documentación interactiva está disponible en:

/api-docs

Permite probar los endpoints directamente desde el navegador.

Cómo ejecutar el proyecto
npm install
npm run dev

Autor:

Juan Carlos Londoño
Backend Developer en formación | Ingeniería de Software