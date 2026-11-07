use crate::dto::google_auth::{GoogleClaims, GoogleTokenResponse};
use jsonwebtoken::dangerous::insecure_decode_claims;

pub async fn exchange_code(
    code: &str,
    client_id: &str,
    client_secret: &str,
) -> Result<GoogleClaims, String> {
    // 1. Trade the one-time code for tokens
    let response = reqwest::Client::new()
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code),
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("redirect_uri", "postmessage"), // what the @react-oauth/google popup uses
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err("Invalid Google code.".to_string());
    }
    let tokens: GoogleTokenResponse = response.json().await.map_err(|e| e.to_string())?;

    // 2. Read the user's info from the id_token
    let claims: GoogleClaims =
        insecure_decode_claims(&tokens.id_token).map_err(|e| e.to_string())?;

    // 3. Make sure it's from Google and meant for our app
    let from_google =
        claims.iss == "https://accounts.google.com" || claims.iss == "accounts.google.com";
    if claims.aud != client_id || !from_google {
        return Err("Invalid Google token.".to_string());
    }
    if !claims.email_verified {
        return Err("Google email is not verified.".to_string());
    }

    Ok(claims)
}
