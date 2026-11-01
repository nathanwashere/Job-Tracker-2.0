import { apiUrl } from "./clients";
import type { UserSignIn, SignInResponse, UserSignUp } from "../types/userType";

export async function signIn(user: UserSignIn): Promise<SignInResponse> {
  const response = await fetch(`${apiUrl}/auth/signin`, {
    method: "POST",
    body: JSON.stringify(user),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while trying to sign in, status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log(data);
  return data;
}
export async function signUp(user: UserSignUp): Promise<SignInResponse> {
  const response = await fetch(`${apiUrl}/auth/sign-up`, {
    body: JSON.stringify(user),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while trying to sign up, status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log(data);
  return data;
}
export async function signOut(): Promise<void> {
  const response = await fetch(`${apiUrl}/auth/signout`, {
    method: "POST",
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while trying to sign out, status: ${response.status}`,
    );
  }
}
