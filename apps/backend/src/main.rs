mod db;
mod dto;
mod handlers;
mod repositories;
mod routes;
mod security;
mod services;

use axum::Router;
use dotenvy;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().ok();
    let database = db::connect_db().await;

    let app = Router::new()
        .nest("/auth", routes::auth_routes::routes())
        //.nest("/resume", routes::resume_routes::routes())
        // .merge(routes::auth_routes::routes())
        .with_state(database);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();

    axum::serve(listener, app).await.unwrap();
}
