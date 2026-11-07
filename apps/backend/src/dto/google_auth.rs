use serde::Deserialize;
#[derive(Deserialize)]
pub struct AuthorizationCode {
    pub code: String,
}
// Google's answer when we trade the code
#[derive(Deserialize)]
pub struct GoogleTokenResponse {
    pub id_token: String,
}
// What's inside the id_token
#[derive(Deserialize)]
pub struct GoogleClaims {
    pub sub: String, // Google's user id → saved as googleId
    pub aud: String, // must be our Client ID
    pub iss: String, // must be Google
    pub email: String,
    #[serde(default)]
    pub email_verified: bool,
    #[serde(default)]
    pub given_name: String,
    #[serde(default)]
    pub family_name: String,
}
