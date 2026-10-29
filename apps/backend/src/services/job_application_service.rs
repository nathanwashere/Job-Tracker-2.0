use crate::dto::job_application::JobApplication;
use crate::repositories::job_application_repository;
use mongodb::Database;
use mongodb::bson::{from_document, oid::ObjectId};

pub async fn find_all_job_applications(
    db: &Database,
    sub: &str,
) -> Result<Vec<JobApplication>, String> {
    let object_id = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    // Get the job applications from db
    let job_documents = job_application_repository::get_all_job_application(db, &object_id)
        .await
        .map_err(|e| e.to_string())?;

    // Turns a list of MongoDB documents into a list of the struct 'JobApplication'
    let jobs_applications: Vec<JobApplication> = job_documents
        .into_iter()
        .map(|doc| from_document(doc).map_err(|e| e.to_string()))
        .collect::<Result<Vec<_>, String>>()?;

    // Returns Result what contains job applications
    Ok(jobs_applications)
}
