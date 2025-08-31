import { Type } from '@sinclair/typebox';

export interface JwtPayload {
  email: string;
  iat?: number;
}

export interface User {
  email: string;
  password: string;
  name?: string;
  surname?: string;
}

export const UserSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6 }),
  name: Type.Optional(Type.String()),
  surname: Type.Optional(Type.String())
});

export const LoginSchema = Type.Object({
  email: Type.String({ format: 'email' }),
  password: Type.String()
});

export const ForgotPasswordSchema = Type.Object({
  email: Type.String({ format: 'email' })
}); 