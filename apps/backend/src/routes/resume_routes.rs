use crate::handlers::resume_handlers::{
    MAX_RESUME_SIZE, delete_resume, download_resume, get_all_resumes, preview_resume,
    update_resume, upload_resume,
};
use crate::middleware::auth_middleware::auth_middleware;
use crate::state::AppState;
use axum::{
    Router,
    extract::DefaultBodyLimit,
    middleware,
    routing::{get, patch, post},
};

pub fn routes(state: AppState) -> Router<AppState> {
    let protected: Router<AppState> = Router::new()
        .route("/", get(get_all_resumes))
        .route(
            "/upload",
            // axum's default body limit is 2 MB. Allow a 10 MB file plus the rest of the form
            post(upload_resume).layer(DefaultBodyLimit::max(MAX_RESUME_SIZE + 1024 * 1024)),
        )
        .route("/{id}", patch(update_resume).delete(delete_resume))
        .route("/{id}/download", get(download_resume))
        .route("/{id}/preview", get(preview_resume))
        .route_layer(middleware::from_fn_with_state(state, auth_middleware));

    protected
}
