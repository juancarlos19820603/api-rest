API REST - Gestión de Usuarios con Autenticación JWT

API REST desarrollada en **Node.js + Express** siguiendo arquitectura por capas (routes, controllers, services, repositories, middleware).

Incluye autenticación con JWT, autorización por usuario y CRUD completo de usuarios.

---

Características

* ✅ Registro de usuarios
* ✅ Login con generación de JWT
* ✅ Middleware de autenticación
* ✅ Middleware de autorización (validación de permisos)
* ✅ Actualización de perfil
* ✅ Eliminación de usuario con control de acceso
* ✅ Estructura de respuesta estandarizada
* ✅ Arquitectura limpia por capas
* 🔜 Próximo paso: integración con base de datos (PostgreSQL + Prisma)

---

##  Arquitectura del Proyecto

```
src/
│
├── routes/        → Definición de endpoints
├── controllers/   → Manejo de request/response
├── services/      → Lógica de negocio
├── repositories/  → Acceso a datos
├── middleware/    → Autenticación y permisos
├── dtos/          → Validación y transferencia de datos
├── utils/         → Funciones auxiliares
└── app.js         → Configuración principal
```

---

Autenticación

Se utiliza **JWT (JSON Web Token)** para proteger rutas privadas.

Flujo:

1. El usuario se registra
2. Hace login
3. Recibe un `token`
4. Envía el token en el header:

```
Authorization: Bearer TU_TOKEN_AQUI
```

---

Endpoints

🟢 Registro

```
POST /api/auth/register
```

🔵 Login

```
POST /api/auth/login
```

🟡 Obtener perfil

```
GET /api/users/:id
```

Requiere token

🟠 Actualizar perfil

```
PUT /api/users/:id
```

Requiere token y ser propietario

🔴 Eliminar usuario

```
DELETE /api/users/:id
```

Requiere token y permisos

---

Instalación

1️⃣ Clonar repositorio

```
git clone https://github.com/TU-USUARIO/TU-REPO.git
cd TU-REPO
```

2️⃣ Instalar dependencias

```
npm install
```

3️⃣ Crear archivo `.env`

```
PORT=3000
JWT_SECRET=tu_clave_super_secreta
```

4️⃣ Ejecutar proyecto

```
npm run dev
```

---

Respuesta estándar de la API

Éxito:

```json
{
  "success": true,
  "message": "Operación realizada correctamente",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Mensaje descriptivo del error"
}
```

---

Seguridad Implementada

* Protección de rutas con middleware
* Validación de token
* Control de acceso por propietario
* Manejo centralizado de errores

---

Tecnologías Utilizadas

* Node.js
* Express
* JWT
* Arquitectura por capas
* Variables de entorno con dotenv

---

Próximas Mejoras

* Integración con PostgreSQL o Mongo
* ORM Prisma
* Hash de contraseñas con bcrypt
* Refresh Tokens
* Tests automatizados
* Dockerización
* Documentación con Swagger

---

Autor

Desarrollado por Juan Carlos Londoño
Proyecto académico y profesional de backend.

---


