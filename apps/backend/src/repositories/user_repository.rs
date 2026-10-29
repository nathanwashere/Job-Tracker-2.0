use mongodb::{
    Database, bson::{Document, doc, oid::ObjectId}, error::Result,
};

pub async fn find_user_by_email(db: &Database, email: &str) -> Result<Option<Document>> {
    let collection = db.collection::<Document>("Users");

    collection
        .find_one(doc! {
            "email":email
        })
        .await
}

pub async fn insert_user(db: &Database, user: Document) -> Result<ObjectId> {
    let collection = db.collection::<Document>("Users");

    let result = collection.insert_one(user).await?;

    Ok(result
        .inserted_id
        .as_object_id()
        .expect("MongoDB should generater an ObjectId"))
}

pub async fn get_user_by_id(db: &Database, user_id: &ObjectId) -> Result<Option<Document>> {
    let collection = db.collection::<Document>("Users");

    collection
        .find_one(doc!{
            "_id":user_id
        })
        .await
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
