use jsonwebtoken::{
    decode, encode, Algorithm, DecodingKey, EncodingKey,
    Header, Validation
};
use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String, // User ID
    pub exp: u64,    // Expiration: Unix timestamp in seconds
}

pub fn create_token(user_id: &str, secret: &str) -> Result<String, String> {
    // Getting the current time
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_secs();

    let claims = Claims {
        sub: user_id.to_owned(),   // from borrowing to ownership
        exp: now + 15 * 60, // Expires after 15 minutes
    };

    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| e.to_string())
}

pub fn verify_token(token: &str, secret: &str) -> Result<Claims, String> {
    let mut validation = Validation::new(Algorithm::HS256);
    validation.leeway = 0;

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &validation,
    )
    .map(|data| data.claims)
    .map_err(|e| e.to_string())
}