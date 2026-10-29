use axum::{Extension, Json, extract::State, http::StatusCode};
use axum_extra::extract::cookie::CookieJar; // axum fills the 'jar:: CookieJar' value
use serde_json::{Value, json};

use crate::dto::existing_user::FindExistingUser;
use crate::dto::new_user::NewUser;
use crate::security::cookie::set_cookie;
use crate::security::jwt::Claims;
use crate::services::user_service;
use crate::state::AppState;

pub async fn create_user(
    State(state): State<AppState>,
    jar: CookieJar,
    Json(payload): Json<NewUser>,
) -> Result<(StatusCode, CookieJar, Json<Value>), (StatusCode, String)> {
    let result = user_service::create_user(&state.db, &payload, &state.jwt_secret)
        .await
        .map_err(|error| {
            if error == "User already exists" {
                (StatusCode::CONFLICT, error)
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;

    // Creates the cookie
    let jar = set_cookie(jar, result.token);

    Ok((
        StatusCode::CREATED,
        jar,
        Json(json!({"user": result.user, "message": result.message })),
    ))
}

pub async fn sign_in_user(
    State(state): State<AppState>,
    jar: CookieJar, // axum automatically sets jar on its own
    Json(payload): Json<FindExistingUser>,
) -> Result<(StatusCode, CookieJar, Json<Value>), (StatusCode, String)> {
    let result = user_service::sign_in_user(&state.db, &payload, &state.jwt_secret)
        .await
        .map_err(|error| {
            if error == "User not found" {
                (StatusCode::NOT_FOUND, error)
            } else if error == "Invalid password" {
                (StatusCode::BAD_REQUEST, error)
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;

    // Creates the cookie
    let jar = set_cookie(jar, result.token);

    Ok((
        StatusCode::OK,
        jar,
        Json(json!({"message": result.message, "user": result.user})),
    ))
}

pub async fn get_current_user(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let user = user_service::get_user_by_id(&state.db, &claims.sub)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else if error == "User not found." {
                (StatusCode::NOT_FOUND, error)
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;
    println!("This is user in backend: {user:?}");
    Ok((StatusCode::OK, Json(json!({"user":user}))))
}
