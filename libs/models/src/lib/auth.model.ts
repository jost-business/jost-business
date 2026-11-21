/** The logged-in account as the API returns it. Never contains the password hash. */
export interface UserDto {
  id: string;
  email: string;
  name: string;
}

/** Body of POST /auth/login. */
export interface LoginRequest {
  email: string;
  password: string;
}

/** GET /auth/session: who is logged in, or null. */
export interface SessionDto {
  user: UserDto | null;
}
