use mongodb::{
    Database,
    bson::{Document, doc, oid::ObjectId},
    error::Result,
};

pub async fn get_all_resumes(db: &Database, user_id: &ObjectId) -> Result<Vec<Document>> {
    let collection = db.collection::<Document>("Resumes");

    let mut cursor = collection.find(doc! {"userId": user_id}).await?;

    let mut resumes = Vec::new();

    while cursor.advance().await? {
        resumes.push(cursor.deserialize_current()?);
    }
    Ok(resumes)
}
