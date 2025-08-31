import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import { Type } from "@sinclair/typebox";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import crypto from "crypto";
import {
  User,
  UserSchema,
  LoginSchema,
  ForgotPasswordSchema,
  JwtPayload,
} from "../types/auth";
import "@fastify/jwt";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    jwt: {
      sign: (payload: JwtPayload) => string;
      verify: (token: string) => JwtPayload;
    };
  }
}

// Simulate a simple user database (replace with real database in production)
const users = new Map<string, User>();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const auth: FastifyPluginAsync = async (fastify) => {
  const server = fastify.withTypeProvider<TypeBoxTypeProvider>();

  // Register endpoint
  server.post(
    "/auth/register",
    {
      schema: {
        body: UserSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email, password } = request.body;

      if (users.has(email)) {
        return reply.code(400).send({ error: "User already exists" });
      }

      const hashedPassword = hashPassword(password);
      users.set(email, {
        email,
        password: hashedPassword,
      });

      return { message: "User registered successfully" };
    }
  );

  // Login endpoint
  server.post(
    "/auth/login",
    {
      schema: {
        body: LoginSchema,
        response: {
          200: Type.Object({
            token: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email, password } = request.body;
      const user = users.get(email);

      if (!user || user.password !== hashPassword(password)) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }

      const token = server.jwt.sign({ email: user.email });
      return { token };
    }
  );

  // Forgot password endpoint
  server.post(
    "/auth/forgotPassword",
    {
      schema: {
        body: ForgotPasswordSchema,
        response: {
          200: Type.Object({
            message: Type.String(),
          }),
        },
      },
    },
    async (request: any, reply: any) => {
      const { email } = request.body;

      if (!users.has(email)) {
        return reply.code(404).send({ error: "User not found" });
      }

      // In a real application, send password reset email
      return { message: "Password reset instructions sent to email" };
    }
  );

  // Get user info endpoint (protected route)
  server.get(
    "/auth/get",
    {
      onRequest: [server.authenticate],
      schema: {
        response: {
          200: Type.Object({
            email: Type.String(),
          }),
        },
      },
    },
    async (request: any) => {
      const user = users.get(request.user.email);
      if (!user) {
        throw new Error("User not found");
      }

      return {
        email: user.email,
      };
    }
  );
};

export default auth;
