export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female' | 'other' | '';
  country: string;
  city: string;
  phone: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface UserProfile {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar?: string;
  bio?: string;
}

