use crate::dto::job_application::JobApplication;
use crate::dto::job_application::NewJobApplication;
use crate::repositories::job_application_repository;
use mongodb::Database;
use mongodb::bson::{DateTime, doc, from_document, oid::ObjectId};

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

pub async fn create_job_application(
    db: &Database,
    sub: &str,
    new_job_application: &NewJobApplication,
) -> Result<(), String> {
    let object_id = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let parsed_date =
        DateTime::parse_rfc3339_str(format!("{}T00:00:00Z", new_job_application.date))
            .map_err(|_| "Invalid date.".to_string())?;

    // Create MongoDB document
    let new_job_application_document = doc! {
        "userId": object_id,
        "company": &new_job_application.company,
        "position": &new_job_application.position,
        "status": &new_job_application.status,
        "location": &new_job_application.location,
        "date": parsed_date,
        "jobType": &new_job_application.job_type,
        "notes": &new_job_application.notes,
    };
    // Save a new job application
    job_application_repository::create_job_application(db, new_job_application_document)
        .await
        .map_err(|e| e.to_string())?;
    Ok(())
}

pub async fn edit_job_application(
    db: &Database,
    sub: &str,
    job_id: &str,
    changes: &NewJobApplication,
) -> Result<(), String> {
    let user_id_mongo = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let job_id_mongo = ObjectId::parse_str(job_id).map_err(|_| "Invalid job id.".to_string())?;

    let parsed_date = DateTime::parse_rfc3339_str(format!("{}T00:00:00Z", changes.date))
        .map_err(|_| "Invalid date.".to_string())?;

    // Create an edited job application
    let edited_job_application_document = doc! {
        "company": &changes.company,
        "position": &changes.position,
        "status": &changes.status,
        "location": &changes.location,
        "date": parsed_date,
        "jobType": &changes.job_type,
        "notes": &changes.notes,
    };

    let job_application_result = job_application_repository::edit_job_application(
        db,
        &job_id_mongo,
        &user_id_mongo,
        edited_job_application_document,
    )
    .await
    .map_err(|e| e.to_string())?;

    if job_application_result == 0 {
        return Err("Job application not found.".to_string());
    }
    Ok(())
}

pub async fn delete_job_application(db: &Database, sub: &str, job_id: &str) -> Result<(), String> {
    let user_id_mongo = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    let job_id_mongo = ObjectId::parse_str(job_id).map_err(|_| "Invalid job id.".to_string())?;

    let result =
        job_application_repository::delete_job_application(db, &job_id_mongo, &user_id_mongo)
            .await
            .map_err(|e| e.to_string())?;

    if result == 0 {
        return Err("Job application not found.".to_string());
    }
    Ok(())
}
