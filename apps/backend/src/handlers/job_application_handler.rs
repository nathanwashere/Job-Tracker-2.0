use crate::dto::job_application::NewJobApplication;
use crate::security::jwt::Claims;
use crate::services::job_application_service;
use crate::state::AppState;
use axum::{
    Extension, Json,
    extract::{Path, State},
    http::StatusCode,
};
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
                } else if error == "Invalid date." {
                    (StatusCode::BAD_REQUEST, error)
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

pub async fn create_job_application(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Json(payload): Json<NewJobApplication>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    job_application_service::create_job_application(&state.db, &claims.sub, &payload)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else {
                eprintln!("Failed to create a job application: {error}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to create a job application".to_string(),
                )
            }
        })?;
    Ok((
        StatusCode::CREATED,
        Json(json!({"message": "Job application created"})),
    ))
}

pub async fn edit_job_application(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
    Json(payload): Json<NewJobApplication>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    job_application_service::edit_job_application(&state.db, &claims.sub, &id, &payload)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else if error == "Invalid job id." || error == "Invalid date." {
                (StatusCode::BAD_REQUEST, error)
            } else if error == "Job application not found." {
                (StatusCode::NOT_FOUND, error)
            } else {
                eprintln!("Failed to edit a job application: {error}");
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;
    Ok((
        StatusCode::OK,
        Json(json!({"message": "Job application has been edited"})),
    ))
}

pub async fn delete_job_application(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    job_application_service::delete_job_application(&state.db, &claims.sub, &id)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else if error == "Invalid job id." {
                (StatusCode::BAD_REQUEST, error)
            } else if error == "Job application not found." {
                (StatusCode::NOT_FOUND, error)
            } else {
                eprintln!("Failed to delete a job application: {error}");
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;
    Ok((
        StatusCode::OK,
        Json(json!({"message": "Job application has been deleted"})),
    ))
}
