import { ApiService } from './api';
import type { LoginFormData, RegisterFormData, UserProfile } from '../types/auth';
import usersData from '../data/users.json';

interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string | null;
  bio?: string;
  role: string;
}

class AuthService {
  private readonly USERS_KEY = 'users';

  async initializeUsers(): Promise<void> {
    await ApiService.initializeData(this.USERS_KEY, usersData);
  }

  async login(data: LoginFormData): Promise<{ user: UserProfile; token: string }> {
    await this.initializeUsers();
    const users: User[] = await ApiService.readData(this.USERS_KEY);

    const user = users.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (!user) {
      throw new Error('Credenciales inválidas');
    }

    const userProfile: UserProfile = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar || undefined,
      bio: user.bio,
    };

    const token = `token_${user.id}_${Date.now()}`;

    return { user: userProfile, token };
  }

  async register(data: RegisterFormData): Promise<{ user: UserProfile; token: string }> {
    await this.initializeUsers();
    const users: User[] = await ApiService.readData(this.USERS_KEY);

    // Verificar si el email ya existe
    const existingUser = users.find((u) => u.email === data.email);
    if (existingUser) {
      throw new Error('El email ya está registrado');
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      password: data.password, // En producción, esto debería estar hasheado
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatar: null,
      bio: '',
      role: 'user',
    };

    users.push(newUser);
    await ApiService.saveData(this.USERS_KEY, users);

    const userProfile: UserProfile = {
      email: newUser.email,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      phone: newUser.phone,
      avatar: newUser.avatar || undefined,
      bio: newUser.bio,
    };

    const token = `token_${newUser.id}_${Date.now()}`;

    return { user: userProfile, token };
  }

  async forgotPassword(email: string): Promise<void> {
    await this.initializeUsers();
    const users: User[] = await ApiService.readData(this.USERS_KEY);

    const user = users.find((u) => u.email === email);
    if (!user) {
      throw new Error('Email no encontrado');
    }

    // En producción, aquí se enviaría un email con el enlace de recuperación
    console.log(`Enlace de recuperación enviado a ${email}`);
  }

  async updateProfile(
    email: string,
    profile: Partial<UserProfile>
  ): Promise<UserProfile> {
    await this.initializeUsers();
    const users: User[] = await ApiService.readData(this.USERS_KEY);

    const userIndex = users.findIndex((u) => u.email === email);
    if (userIndex === -1) {
      throw new Error('Usuario no encontrado');
    }

    users[userIndex] = {
      ...users[userIndex],
      ...profile,
    };

    await ApiService.saveData(this.USERS_KEY, users);

    return {
      email: users[userIndex].email,
      firstName: users[userIndex].firstName,
      lastName: users[userIndex].lastName,
      phone: users[userIndex].phone,
      avatar: users[userIndex].avatar || undefined,
      bio: users[userIndex].bio,
    };
  }
}

export const authService = new AuthService();

