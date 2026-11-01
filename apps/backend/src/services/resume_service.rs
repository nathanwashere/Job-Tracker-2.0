use crate::dto::resume::{NewResume, Resume, ResumeFile, ResumeUpdate};
use crate::repositories::resume_repository;
use mongodb::{
    Database,
    bson::{Binary, DateTime, doc, from_document, oid::ObjectId, spec::BinarySubtype},
};

pub async fn get_all_resumes(db: &Database, sub: &str) -> Result<Vec<Resume>, String> {
    let object_id = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let resumes_document = resume_repository::get_all_resumes(db, &object_id)
        .await
        .map_err(|e| e.to_string())?;

    // Turns a list of MongoDB documents into a list of the struct 'JobApplication'
    let resumes: Vec<Resume> = resumes_document
        .into_iter()
        .map(|doc| from_document(doc).map_err(|e| e.to_string()))
        .collect::<Result<Vec<_>, String>>()?;

    Ok(resumes)
}

pub async fn upload_resume(
    db: &Database,
    sub: &str,
    new_resume: NewResume,
) -> Result<Resume, String> {
    let user_id_mongo = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let size = new_resume.data.len() as i64;

    // Create a MongoDB document (everything except the file bytes for now)
    let mut new_resume_document = doc! {
        "_id": ObjectId::new(),
        "name": new_resume.name,
        "originalName": new_resume.original_name,
        "mimeType": new_resume.mime_type,
        "size": size,
        "tag": "",
        "isDefault": false,
        "uploadedAt": DateTime::now(),
        "userId": user_id_mongo,
    };

    // The resume sent back to the frontend, without the file bytes
    let resume: Resume = from_document(new_resume_document.clone()).map_err(|e| e.to_string())?;

    // Only the saved document gets the file itself
    new_resume_document.insert(
        "data",
        Binary {
            subtype: BinarySubtype::Generic,
            bytes: new_resume.data,
        },
    );

    resume_repository::upload_resume(db, &new_resume_document)
        .await
        .map_err(|e| e.to_string())?;

    Ok(resume)
}

pub async fn get_resume_file(db: &Database, sub: &str, resume_id: &str) -> Result<ResumeFile, String> {
    let user_id_mongo = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let resume_id_mongo =
        ObjectId::parse_str(resume_id).map_err(|_| "Invalid resume id.".to_string())?;

    let resume_document = resume_repository::find_resume_file(db, &resume_id_mongo, &user_id_mongo)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("Resume not found.".to_string())?;

    from_document(resume_document).map_err(|e| e.to_string())
}

pub async fn delete_resume(db: &Database, sub: &str, resume_id: &str) -> Result<(), String> {
    let user_id_mongo = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let resume_id_mongo =
        ObjectId::parse_str(resume_id).map_err(|_| "Invalid resume id.".to_string())?;

    let result = resume_repository::delete_resume(db, &resume_id_mongo, &user_id_mongo)
        .await
        .map_err(|e| e.to_string())?;

    if result == 0 {
        return Err("Resume not found.".to_string());
    }
    Ok(())
}

pub async fn update_resume(
    db: &Database,
    sub: &str,
    resume_id: &str,
    changes: &ResumeUpdate,
) -> Result<Resume, String> {
    let user_id_mongo = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let resume_id_mongo =
        ObjectId::parse_str(resume_id).map_err(|_| "Invalid resume id.".to_string())?;

    // Only set the fields that were sent
    let mut changes_document = doc! {};
    if let Some(name) = &changes.name {
        let name = name.trim();
        if name.is_empty() {
            return Err("Name cannot be empty.".to_string());
        }
        changes_document.insert("name", name);
    }
    let is_default = changes.tag.as_deref() == Some("Default");
    if let Some(tag) = &changes.tag {
        changes_document.insert("tag", tag);
        changes_document.insert("isDefault", is_default);
    }
    if changes_document.is_empty() {
        return Err("Nothing to update.".to_string());
    }

    let resume_document =
        resume_repository::update_resume(db, &resume_id_mongo, &user_id_mongo, changes_document)
            .await
            .map_err(|e| e.to_string())?
            .ok_or("Resume not found.".to_string())?;

    // This resume is now the default → none of the others can be
    if is_default {
        resume_repository::clear_other_defaults(db, &resume_id_mongo, &user_id_mongo)
            .await
            .map_err(|e| e.to_string())?;
    }

    from_document(resume_document).map_err(|e| e.to_string())
}
