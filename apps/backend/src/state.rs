use mongodb::Database;

#[derive(Clone)]
pub struct AppState {
    pub db: Database,
    pub jwt_secret: String,
    pub google_client_id: String,
    pub google_client_secret: String,
}
