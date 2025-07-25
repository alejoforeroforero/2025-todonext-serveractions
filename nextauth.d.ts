// nextauth.d.ts
import { DefaultSession, DefaultUser } from "next-auth";


interface IUser extends DefaultUser {
  /**
   * Roles del usuario
   */
  roles?: string[];
  isActive?: boolean;
  /**
   * Agregar cualquier otro campo que tu manejas
   */
}

declare module "next-auth" {
  type User = IUser;

  interface Session {
    user?: User;
  }
}

declare module "next-auth/jwt" {
  type JWT = IUser;
}
