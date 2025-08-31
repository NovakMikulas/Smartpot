import { Type } from '@sinclair/typebox';

export interface JwtPayload {
  email: string;
  iat?: number;
}

export interface User {
  email: string;
  password: string;
}

export const UserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 })
});

export const LoginSchema = UserSchema;

export const ForgotPasswordSchema = Type.Object({
  email: Type.String({ format: 'email' })
}); 