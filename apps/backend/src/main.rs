mod db;
mod dto;
mod handlers;
mod middleware;
mod repositories;
mod routes;
mod security;
mod services;
mod state;

use axum::Router;
use axum::http::{
    HeaderValue, Method,
    header::{AUTHORIZATION, CONTENT_TYPE},
};
use state::AppState;
use std::env;
use tower_http::cors::CorsLayer;

use dotenvy;

const METHODS: [Method; 5] = [
    Method::GET,
    Method::POST,
    Method::PUT,
    Method::PATCH,
    Method::DELETE,
];
const ALLOW_CREDENTIALS: bool = true;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:5173".parse::<HeaderValue>().unwrap())
        .allow_methods(METHODS)
        .allow_headers([CONTENT_TYPE, AUTHORIZATION])
        .allow_credentials(ALLOW_CREDENTIALS);

    let database = db::connect_db().await;
    let jwt_secret = env::var("JWT_SECRET").expect("JWT_SECRET must be set");

    let state = AppState {
        db: database,
        jwt_secret: jwt_secret,
    };

    let app = Router::new()
        .nest("/auth", routes::auth_routes::routes(state.clone()))
        .nest(
            "/job-applications",
            routes::job_application_routes::routes(state.clone()),
        )
        .nest("/resume", routes::resume_routes::routes(state.clone()))
        .layer(cors)
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}
