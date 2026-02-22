const request = require('supertest');
const app = require('../../app');

describe('Users Routes - Integration Tests', () => {
  describe('Validaciones y Seguridad', () => {
    it('debe retornar 401 sin token en ruta protegida', async () => {
      const response = await request(app)
        .get('/api/v1/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('debe retornar 404 para ruta inexistente', async () => {
      const response = await request(app)
        .get('/api/v1/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('no encontrada');
    });

    it('debe validar email en registro', async () => {
      const invalidUser = {
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/v1/users')
        .send(invalidUser);

      expect(response.body.success).toBe(false);
    }, 10000);
  });

  describe('Endpoints Públicos', () => {
    it('GET /profile/me debe retornar 401 sin token', async () => {
      const response = await request(app)
        .get('/api/v1/users/profile/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('POST /verify-email debe validar token', async () => {
      const response = await request(app)
        .post('/api/v1/users/verify-email')
        .send({ token: '' });

      expect(response.status).toBeGreaterThanOrEqual(400);
    }, 10000);
  });
});