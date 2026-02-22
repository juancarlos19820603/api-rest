// ✅ MOCKS PRIMERO
jest.mock('../../models/User');
jest.mock('bcrypt');
jest.mock('../../services/email.service', () => ({
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendPasswordResetEmail: jest.fn().mockResolvedValue(true)
}))


const UserService = require('../../services/user.service');
const User = require('../../models/User');
const { AppError } = require('../../middlewares/error.middleware');
const bcrypt = require('bcrypt');

jest.mock('../../models/User');
jest.mock('bcrypt');

describe('UserService - Unit Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('debe crear un nuevo usuario correctamente', async () => {
      const createUserDTO = {
        email: 'test@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'user'
      };

      const mockUser = {
        id: '123',
        ...createUserDTO,
        isEmailVerified: false
      };

      User.findOne.mockResolvedValueOnce(null);
      bcrypt.hash.mockResolvedValueOnce('hashedPassword');
      User.create.mockResolvedValueOnce(mockUser);

      const result = await UserService.createUser(createUserDTO);

      expect(User.findOne).toHaveBeenCalledWith({ email: createUserDTO.email });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDTO.password, 10);
      expect(User.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('debe lanzar error si el email ya existe', async () => {
      const createUserDTO = {
        email: 'existing@example.com',
        password: 'Test123!',
        firstName: 'Test',
        lastName: 'User'
      };

      User.findOne.mockResolvedValueOnce({ email: createUserDTO.email });

      try {
        await UserService.createUser(createUserDTO);
      } catch (error) {
        expect(error).toEqual(expect.any(Error));
      }
    });
  });

  describe('login', () => {
    it('debe autenticar usuario correctamente', async () => {
      const email = 'test@example.com';
      const password = 'Test123!';
      const hashedPassword = 'hashedPassword123';

      const mockUser = {
        id: '123',
        email,
        password: hashedPassword,
        role: 'user',
        isEmailVerified: true
      };

      const generateToken = jest.fn().mockReturnValue('token123');

      User.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(true);

      const result = await UserService.login(email, password, generateToken);

      expect(User.findOne).toHaveBeenCalledWith({ email });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(generateToken).toHaveBeenCalledWith(mockUser.id, mockUser.email, mockUser.role);
      expect(result).toBeDefined();
    });

    it('debe fallar con contraseña incorrecta', async () => {
      const email = 'test@example.com';
      const password = 'WrongPassword';

      const mockUser = {
        id: '123',
        email,
        password: 'hashedPassword123',
        isEmailVerified: true
      };

      User.findOne.mockResolvedValueOnce(mockUser);
      bcrypt.compare.mockResolvedValueOnce(false);

      try {
        await UserService.login(email, password, jest.fn());
      } catch (error) {
        expect(error).toEqual(expect.any(Error));
      }
    });
  });

  describe('getAllUsers', () => {
    it('debe obtener lista de usuarios con paginación', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' }
      ];

      User.find.mockReturnValue({
        skip: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            exec: jest.fn().mockResolvedValueOnce(mockUsers)
          })
        })
      });

      User.countDocuments.mockResolvedValueOnce(2);

      const result = await UserService.getAllUsers(1, 10);

      expect(result.data).toHaveLength(2);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(2);
    });
  });

  describe('getUserById', () => {
    it('debe obtener usuario por ID', async () => {
      const userId = '123';
      const mockUser = { id: userId, email: 'test@example.com' };

      User.findById.mockResolvedValueOnce(mockUser);

      const result = await UserService.getUserById(userId);

      expect(User.findById).toHaveBeenCalledWith(userId);
      expect(result).toBeDefined();
    });

    it('debe lanzar error si usuario no existe', async () => {
      const userId = 'nonexistent';

      User.findById.mockResolvedValueOnce(null);

      try {
        await UserService.getUserById(userId);
      } catch (error) {
        expect(error).toEqual(expect.any(Error));
      }
    });
  });
});