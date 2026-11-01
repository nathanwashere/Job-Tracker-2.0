use crate::dto::resume::{NewResume, ResumeUpdate};
use crate::security::jwt::Claims;
use crate::services::resume_service;
use crate::state::AppState;
use axum::{
    Extension, Json,
    extract::{Multipart, Path, State, multipart::MultipartError},
    http::{StatusCode, header},
    response::{IntoResponse, Response},
};
use serde_json::{Value, json};

pub const MAX_RESUME_SIZE: usize = 10 * 1024 * 1024; // 10 MB

const ALLOWED_TYPES: [&str; 3] = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

pub async fn get_all_resumes(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let resumes = resume_service::get_all_resumes(&state.db, &claims.sub)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else {
                eprintln!("Failed to fetch all resumes: {error}");
                (StatusCode::INTERNAL_SERVER_ERROR, error)
            }
        })?;
    Ok((StatusCode::OK, Json(json!({"resumes": resumes}))))
}

// Multipart must be the last argument: it reads the request body
pub async fn upload_resume(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    mut multipart: Multipart,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    // Turns a broken/too-large form into the right status (400, 413...)
    let form_error = |error: MultipartError| (error.status(), error.body_text());

    let mut file: Option<(String, String, Vec<u8>)> = None; // (file name, type, bytes)
    let mut name: Option<String> = None;

    // The form has a "resume" file field and an optional "name" text field
    while let Some(field) = multipart.next_field().await.map_err(form_error)? {
        match field.name() {
            Some("resume") => {
                let original_name = field.file_name().unwrap_or("resume").to_string();
                let mime_type = field.content_type().unwrap_or_default().to_string();
                let bytes = field.bytes().await.map_err(form_error)?;
                file = Some((original_name, mime_type, bytes.to_vec()));
            }
            Some("name") => name = Some(field.text().await.map_err(form_error)?),
            _ => {}
        }
    }

    let (original_name, mime_type, data) =
        file.ok_or((StatusCode::BAD_REQUEST, "No file uploaded.".to_string()))?;

    if !ALLOWED_TYPES.contains(&mime_type.as_str()) {
        return Err((
            StatusCode::UNSUPPORTED_MEDIA_TYPE,
            "Only PDF and Word documents are allowed.".to_string(),
        ));
    }
    if data.len() > MAX_RESUME_SIZE {
        return Err((
            StatusCode::PAYLOAD_TOO_LARGE,
            "File must be under 10 MB.".to_string(),
        ));
    }

    // No name given → use the file name without its extension ("cv.pdf" → "cv")
    let name = name
        .map(|n| n.trim().to_string())
        .filter(|n| !n.is_empty())
        .unwrap_or_else(|| {
            original_name
                .rsplit_once('.')
                .map(|(stem, _)| stem)
                .filter(|stem| !stem.is_empty())
                .unwrap_or(&original_name)
                .to_string()
        });

    let new_resume = NewResume {
        name,
        original_name,
        mime_type,
        data,
    };

    let resume = resume_service::upload_resume(&state.db, &claims.sub, new_resume)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else {
                eprintln!("Failed to upload a resume: {error}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to upload the resume".to_string(),
                )
            }
        })?;

    Ok((
        StatusCode::CREATED,
        Json(json!({"message": "Resume uploaded successfully", "resume": resume})),
    ))
}

// Shared by download and preview. disposition: "attachment" = save it, "inline" = open it
async fn send_resume_file(
    state: &AppState,
    claims: &Claims,
    id: &str,
    disposition: &str,
) -> Result<Response, (StatusCode, String)> {
    let file = resume_service::get_resume_file(&state.db, &claims.sub, id)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else if error == "Invalid resume id." {
                (StatusCode::BAD_REQUEST, error)
            } else if error == "Resume not found." {
                (StatusCode::NOT_FOUND, error)
            } else {
                eprintln!("Failed to load a resume file: {error}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to load the resume".to_string(),
                )
            }
        })?;

    // Header values must be plain ASCII: swap anything else (and quotes) for "_"
    let safe_name: String = file
        .original_name
        .chars()
        .map(|c| {
            if (c.is_ascii_graphic() && c != '"') || c == ' ' {
                c
            } else {
                '_'
            }
        })
        .collect();

    Ok((
        [
            (header::CONTENT_TYPE, file.mime_type),
            (
                header::CONTENT_DISPOSITION,
                format!("{disposition}; filename=\"{safe_name}\""),
            ),
        ],
        file.data.bytes,
    )
        .into_response())
}

pub async fn download_resume(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<Response, (StatusCode, String)> {
    send_resume_file(&state, &claims, &id, "attachment").await
}

pub async fn preview_resume(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<Response, (StatusCode, String)> {
    send_resume_file(&state, &claims, &id, "inline").await
}

pub async fn delete_resume(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    resume_service::delete_resume(&state.db, &claims.sub, &id)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else if error == "Invalid resume id." {
                (StatusCode::BAD_REQUEST, error)
            } else if error == "Resume not found." {
                (StatusCode::NOT_FOUND, error)
            } else {
                eprintln!("Failed to delete a resume: {error}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to delete the resume".to_string(),
                )
            }
        })?;
    Ok((
        StatusCode::OK,
        Json(json!({"message": "Resume deleted successfully"})),
    ))
}

pub async fn update_resume(
    State(state): State<AppState>,
    Extension(claims): Extension<Claims>,
    Path(id): Path<String>,
    Json(payload): Json<ResumeUpdate>,
) -> Result<(StatusCode, Json<Value>), (StatusCode, String)> {
    let resume = resume_service::update_resume(&state.db, &claims.sub, &id, &payload)
        .await
        .map_err(|error| {
            if error == "Invalid user id." {
                (StatusCode::UNAUTHORIZED, error)
            } else if error == "Invalid resume id."
                || error == "Name cannot be empty."
                || error == "Nothing to update."
            {
                (StatusCode::BAD_REQUEST, error)
            } else if error == "Resume not found." {
                (StatusCode::NOT_FOUND, error)
            } else {
                eprintln!("Failed to update a resume: {error}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "Failed to update the resume".to_string(),
                )
            }
        })?;
    Ok((
        StatusCode::OK,
        Json(json!({"message": "Resume updated", "resume": resume})),
    ))
}
