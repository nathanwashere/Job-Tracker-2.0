use crate::state::AppState;
use axum::{
    Router, middleware,
    routing::{get, post},
};

use crate::handlers::user_handler::create_user;
use crate::handlers::user_handler::get_current_user;
use crate::handlers::user_handler::sign_in_user;
use crate::middleware::auth_middleware::auth_middleware;

pub fn routes(state: AppState) -> Router<AppState> {
    let protected: Router<AppState> = Router::new()
        .route("/me", get(get_current_user))
        .route_layer(middleware::from_fn_with_state(state, auth_middleware));

    let public: Router<AppState> = Router::new()
        .route("/signin", post(sign_in_user))
        .route("/signup", post(create_user));

    public.merge(protected)
}
