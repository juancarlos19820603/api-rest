const { CreateUserDTO, UpdateUserDTO, UserResponseDTO } = require('../../dtos/user.dto');

describe('UserDTOs - Unit Tests', () => {
  describe('CreateUserDTO', () => {
    it('debe transformar datos correctamente', () => {
      const data = {
        email: '  JUAN@EXAMPLE.COM  ',
        password: 'Test123!',
        firstName: '  Juan  ',
        lastName: '  Pérez  '
      };

      const dto = new CreateUserDTO(data);

      expect(dto.email).toBe('juan@example.com');
      expect(dto.firstName).toBe('Juan');
      expect(dto.lastName).toBe('Pérez');
    });
  });

  describe('UpdateUserDTO', () => {
    it('debe actualizar solo campos proporcionados', () => {
      const data = {
        firstName: '  NewName  ',
        bio: '  New bio  '
      };

      const dto = new UpdateUserDTO(data);

      expect(dto.firstName).toBe('NewName');
      expect(dto.bio).toBe('New bio');
      expect(dto.email).toBeUndefined();
    });
  });

  describe('UserResponseDTO', () => {
    it('debe ocultar datos sensibles', () => {
      const user = {
        _id: '123',
        email: 'test@example.com',
        password: 'hashedPassword',
        firstName: 'Test',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dto = new UserResponseDTO(user);

      expect(dto.email).toBe('test@example.com');
      expect(dto.role).toBe('admin');
      expect(dto.password).toBeUndefined();
    });
  });
});