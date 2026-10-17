use axum::{Router, routing::post};
use mongodb::Database;

use crate::handlers::user_handler::create_user;

pub fn routes() -> Router<Database> {
    Router::new().route("/signup", post(create_user))
    //.route("/signin", post(sign_in))
}
