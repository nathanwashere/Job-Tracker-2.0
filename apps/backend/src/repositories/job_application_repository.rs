use mongodb::{
    Database,
    bson::{Document, doc, oid::ObjectId},
    error::Result,
};
pub async fn get_all_job_application(db: &Database, user_id: &ObjectId) -> Result<Vec<Document>> {
    let collection = db.collection::<Document>("Job Applications");

    let mut cursor = collection
        .find(doc! {
            "userId": user_id
        })
        .await?;
    let mut job_applications = Vec::new();

    while cursor.advance().await? {
        job_applications.push(cursor.deserialize_current()?);
    }
    Ok(job_applications)
}
