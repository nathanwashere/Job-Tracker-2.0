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

pub async fn create_job_application(db: &Database, job_application: Document) -> Result<()> {
    let collection = db.collection::<Document>("Job Applications");

    collection.insert_one(job_application).await?;

    Ok(())
}

pub async fn edit_job_application(
    db: &Database,
    job_id: &ObjectId,
    user_id: &ObjectId,
    changes: Document,
) -> Result<u64> {
    let collection = db.collection::<Document>("Job Applications");

    let result = collection
        .update_one(
            doc! { "_id": job_id, "userId": user_id }, // which document
            doc! { "$set": changes },                  // what to change
        )
        .await?;

    Ok(result.matched_count) // 0 means no job with that id for this user (returnes 404), 1 means it updated
}

pub async fn delete_job_application(
    db: &Database,
    job_id: &ObjectId,
    user_id: &ObjectId,
) -> Result<u64> {
    let collection = db.collection::<Document>("Job Applications");

    let result = collection
        .delete_one(doc! {"_id": job_id, "userId": user_id})
        .await?;
    Ok(result.deleted_count)
}
