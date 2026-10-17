use mongodb::{Database, bson::doc};

use crate::dto::new_user::NewUser;
use crate::repositories::user_repository;
use crate::security::password::hash_password;

pub async fn create_user(db: &Database, new_user: &NewUser) -> Result<(), String> {
    // Check if the user already exists
    let existing = user_repository::find_user_by_email(db, &new_user.email)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("User already exists".to_string());
    }

    let hashed_password = hash_password(&new_user.password)?;

    // Create MongoDB document
    let user = doc! {
        "firstName":&new_user.first_name,
        "lastName":&new_user.last_name,
        "email": &new_user.email,
        "password": hashed_password,
        "employed": &new_user.is_employed,
    };

    // Save user
    user_repository::insert_user(db, user)
        .await
        .map_err(|e| e.to_string())?;

    Ok(())
}
