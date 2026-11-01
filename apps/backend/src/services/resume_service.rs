use crate::repositories::resume_repository;
use mongodb::{
    Database,
    bson::{DateTime, doc, from_document, oid::ObjectId},
};

// pub async fn get_all_resumes(db: &Database, sub: &str) {
//     let object_id = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

//     let resumes_document = resume_repository::get_all_resumes(db, sub)
//         .await
//         .map_err(|e| e.to_string())?;

//     // Turns a list of MongoDB documents into a list of the struct 'JobApplication'
//     let jobs_applications: Vec<JobApplication> = resumes_documents
//         .into_iter()
//         .map(|doc| from_document(doc).map_err(|e| e.to_string()))
//         .collect::<Result<Vec<_>, String>>()?;
// }
