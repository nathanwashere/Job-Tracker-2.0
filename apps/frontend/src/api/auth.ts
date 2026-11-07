import { apiUrl } from "./clients";
import type {
  UserSignIn,
  SignInResponse,
  UserSignUp,
  GoogleAuthResponse,
} from "../types/userType";
import type { CodeResponse } from "@react-oauth/google";

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
  const response = await fetch(`${apiUrl}/auth/signup`, {
    method: "POST",
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
export async function googleAuth(
  codeResponse: CodeResponse,
): Promise<GoogleAuthResponse> {
  const authorizationCode = codeResponse.code;
  const response = await fetch(`${apiUrl}/auth/google`, {
    method: "POST",
    body: JSON.stringify({ code: authorizationCode }),
    headers: { "Content-Type": "application/json" },
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error(
      `Error while trying to use Google auth, status: ${response.status}`,
    );
  }
  const data = await response.json();
  console.log(data);
  return data;
}
