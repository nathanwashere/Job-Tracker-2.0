use axum::{
    extract::Request,
    http::StatusCode,
    middleware::Next,
    response::Response,
    extract::State,
};
use axum_extra::extract::cookie::CookieJar; 

use crate::security::jwt::verify_token;
use crate::security::cookie::get_user_token_from_cookie;
use crate::state::AppState;

pub async fn auth_middleware(
    State(state): State<AppState>,
    jar: CookieJar,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    // Get the JWT from cookie
    let token = get_user_token_from_cookie(&jar)
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // Verify the JWT here.
    // If verification fails, return Err(StatusCode::UNAUTHORIZED).  
    let claims = verify_token(&token, &state.jwt_secret)
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // Insert the claims (token) into the request for next function
    // * CLAIMS IS A STRUCT FROM jwt.rs * 
    request.extensions_mut().insert(claims);

    
    Ok(next.run(request).await)
}