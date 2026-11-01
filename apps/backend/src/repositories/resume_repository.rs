use mongodb::{
    Database,
    bson::{Document, doc, oid::ObjectId},
    error::Result,
    options::ReturnDocument,
};

pub async fn get_all_resumes(db: &Database, user_id: &ObjectId) -> Result<Vec<Document>> {
    let collection = db.collection::<Document>("Resumes");

    // Leave out "data" (the file bytes): lists only need the details
    let mut cursor = collection
        .find(doc! {"userId": user_id})
        .projection(doc! {"data": 0})
        .sort(doc! {"uploadedAt": -1})
        .await?;

    let mut resumes = Vec::new();

    while cursor.advance().await? {
        resumes.push(cursor.deserialize_current()?);
    }
    Ok(resumes)
}

pub async fn upload_resume(db: &Database, resume: &Document) -> Result<()> {
    let collection = db.collection::<Document>("Resumes");

    collection.insert_one(resume).await?;

    Ok(())
}

// Only the fields download/preview need, including "data" (the file bytes)
pub async fn find_resume_file(
    db: &Database,
    resume_id: &ObjectId,
    user_id: &ObjectId,
) -> Result<Option<Document>> {
    let collection = db.collection::<Document>("Resumes");

    collection
        .find_one(doc! {"_id": resume_id, "userId": user_id})
        .projection(doc! {"originalName": 1, "mimeType": 1, "data": 1})
        .await
}

pub async fn delete_resume(db: &Database, resume_id: &ObjectId, user_id: &ObjectId) -> Result<u64> {
    let collection = db.collection::<Document>("Resumes");

    let result = collection
        .delete_one(doc! {"_id": resume_id, "userId": user_id})
        .await?;
    Ok(result.deleted_count) // 0 means no resume with that id for this user
}

// Returns the resume after the change (without "data"), or None if not found
pub async fn update_resume(
    db: &Database,
    resume_id: &ObjectId,
    user_id: &ObjectId,
    changes: Document,
) -> Result<Option<Document>> {
    let collection = db.collection::<Document>("Resumes");

    collection
        .find_one_and_update(
            doc! {"_id": resume_id, "userId": user_id}, // which document
            doc! {"$set": changes},                    // what to change
        )
        .return_document(ReturnDocument::After)
        .projection(doc! {"data": 0})
        .await
}

// Only one resume can be the default: take it away from all the others
pub async fn clear_other_defaults(
    db: &Database,
    resume_id: &ObjectId,
    user_id: &ObjectId,
) -> Result<()> {
    let collection = db.collection::<Document>("Resumes");
    let others = doc! {"userId": user_id, "_id": {"$ne": resume_id}};

    collection
        .update_many(others.clone(), doc! {"$set": {"isDefault": false}})
        .await?;

    // Remove the "Default" tag from the others too, so the tag and isDefault stay in sync
    let mut others_tagged_default = others;
    others_tagged_default.insert("tag", "Default");
    collection
        .update_many(others_tagged_default, doc! {"$set": {"tag": ""}})
        .await?;

    Ok(())
}
