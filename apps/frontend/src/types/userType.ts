export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  employed: boolean;
};
export type UserSignIn = {
  email: string;
  password: string;
};
export type UserSignUp = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  isEmployed: boolean;
};
export type SignInResponse = {
  message: string;
  user: User;
};
