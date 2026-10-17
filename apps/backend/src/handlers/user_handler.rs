use axum::{Json, extract::State, http::StatusCode};
use mongodb::Database;

use crate::dto::new_user::NewUser;
use crate::services::user_service;

pub async fn create_user(
    State(db): State<Database>,
    Json(payload): Json<NewUser>,
) -> Result<StatusCode, (StatusCode, String)> {
    user_service::create_user(&db, &payload)
        .await
        .map_err(|error| {
            if error == "User already exists" {
                (StatusCode::CONFLICT, error)
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;

    Ok(StatusCode::CREATED)
}
