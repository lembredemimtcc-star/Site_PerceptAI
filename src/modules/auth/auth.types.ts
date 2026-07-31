export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  role: "doctor" | "nurse" | "admin";
  email: string;
}
