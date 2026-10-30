use crate::handlers::job_application_handler::create_job_application;
use crate::handlers::job_application_handler::edit_job_application;
use crate::handlers::job_application_handler::get_all_job_applications;
use crate::middleware::auth_middleware::auth_middleware;
use crate::state::AppState;
use axum::{
    Router, middleware,
    routing::{get, patch},
};

pub fn routes(state: AppState) -> Router<AppState> {
    let protected: Router<AppState> = Router::new()
        .route(
            "/",
            get(get_all_job_applications).post(create_job_application),
        )
        .route("/{id}", patch(edit_job_application))
        .route_layer(middleware::from_fn_with_state(state, auth_middleware));

    protected
}
