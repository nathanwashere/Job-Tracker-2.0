use crate::dto::existing_user::ExistingUser;
use crate::dto::existing_user::FindExistingUser;
use crate::dto::existing_user::ResponseResultWithUser;
use crate::dto::new_user::NewUser;
use crate::repositories::user_repository;
use crate::security::jwt::create_token;
use crate::security::password::hash_password;
use crate::security::password::verify_password;
use mongodb::bson::{from_document, oid::ObjectId};
use mongodb::{Database, bson::doc};

pub async fn create_user(
    db: &Database,
    new_user: &NewUser,
    jwt_secret: &str,
) -> Result<ResponseResultWithUser, String> {
    // Check if the user already exists
    let existing = user_repository::find_user_by_email(db, &new_user.email)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Err("User already exists".to_string());
    }

    let hashed_password = hash_password(&new_user.password)?;

    // Create MongoDB document
    let new_user_document = doc! {
        "firstName":&new_user.first_name,
        "lastName":&new_user.last_name,
        "email": &new_user.email,
        "password": hashed_password,
        "employed": &new_user.is_employed,
    };

    // Save user
    let user_id = user_repository::insert_user(db, new_user_document)
        .await
        .map_err(|e| e.to_string())?;

    // Create a user to send back to front
    let user = ExistingUser {
        id: user_id,
        first_name: new_user.first_name.clone(),
        last_name: new_user.last_name.clone(),
        email: new_user.email.clone(),
        employed: new_user.is_employed.clone(),
    };

    // Creat a JWT token for the new user
    let token = create_token(&user_id.to_hex(), jwt_secret)?;

    let result = ResponseResultWithUser {
        message: "User has been created and a token!".to_string(),
        token: token,
        user: user,
    };

    Ok(result)
}

pub async fn sign_in_user(
    db: &Database,
    user: &FindExistingUser,
    jwt_secret: &str,
) -> Result<ResponseResultWithUser, String> {
    //Check if user already exists
    let found_existing_user = user_repository::find_user_by_email(db, &user.email)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("User not found".to_string())?;

    let email = found_existing_user
        .get_str("email")
        .map_err(|e| e.to_string())?;

    println!("found_existing_user email: {email}");

    let existing_user_password = found_existing_user
        .get_str("password")
        .map_err(|e| e.to_string())?;

    let pass_match_check = verify_password(&user.password, existing_user_password)?;

    if !pass_match_check {
        return Err("Invalid password".to_string());
    }

    let user_id = found_existing_user
        .get_object_id("_id")
        .map_err(|e| e.to_string())?
        .to_hex();

    let token = create_token(&user_id, jwt_secret)
        .map_err(|_| "Error while creating a JWT token!".to_string())?;

    let user: ExistingUser = from_document(found_existing_user).map_err(|e| e.to_string())?;

    let result = ResponseResultWithUser {
        message: "User has been signed in and a token!".to_string(),
        token: token,
        user: user,
    };

    Ok(result)
}

pub async fn get_user_by_id(db: &Database, sub: &str) -> Result<ExistingUser, String> {
    let object_id = ObjectId::parse_str(sub).map_err(|_| "Invalid user id.".to_string())?;

    // Gets the user from db via _id
    let user_document = user_repository::get_user_by_id(db, &object_id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or("User not found.".to_string())?;

    // Conver that user ('MongoDB Document') into Rust struct in order to return it
    let user: ExistingUser = from_document(user_document).map_err(|e| e.to_string())?;
    println!("This is user: {user:?}");

    Ok(user)
}
