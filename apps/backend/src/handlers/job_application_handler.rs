use crate::security::jwt::Claims;
use crate::services::job_application_service;
use crate::state::AppState;
use axum::{Extension, Json, extract::State, http::StatusCode};
use serde_json::{Value, json};
pub async fn get_all_job_applications(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let job_applications =
        job_application_service::find_all_job_applications(&state.db, &claims.sub)
            .await
            .map_err(|error| {
                if error == "Invalid user id." {
                    (StatusCode::UNAUTHORIZED, error)
                } else {
                    eprintln!("Failed to load job applications: {error}");
                    (
                        StatusCode::INTERNAL_SERVER_ERROR,
                        "Failed to load job applications".to_string(),
                    )
                }
            })?;
    Ok((
        StatusCode::OK,
        Json(json!({"jobApplications": job_applications})),
    ))
}
