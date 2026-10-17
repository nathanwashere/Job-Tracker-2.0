use mongodb::{
    Database,
    bson::{Document, doc},
    error::Result,
};

pub async fn find_user_by_email(db: &Database, email: &str) -> Result<Option<Document>> {
    let collection = db.collection::<Document>("Users");

    collection
        .find_one(doc! {
            "email":email
        })
        .await
}

pub async fn insert_user(db: &Database, user: Document) -> Result<()> {
    let collection = db.collection::<Document>("Users");

    collection.insert_one(user).await?;

    Ok(())
}

pub async fn get_users(db: &Database) -> Result<Vec<Document>> {
    let collection = db.collection::<Document>("Users");

    let mut cursor = collection.find(doc! {}).await?;
    let mut users = Vec::new();

    while cursor.advance().await? {
        users.push(cursor.deserialize_current()?);
    }
    Ok(users)
}
