use mongodb::{Client, Database};

pub async fn connect_db() -> Database {
    let uri = std::env::var("MONGODB_URI").expect("MONGODB_URI must be set");
    let client = Client::with_uri_str(&uri)
        .await
        .expect("Failed to create MongoDB client");
    let db = client.database("test");

    db.run_command(mongodb::bson::doc! { "ping": 1 })
        .await
        .expect("Failed to connect to MongoDB");
    db
}
