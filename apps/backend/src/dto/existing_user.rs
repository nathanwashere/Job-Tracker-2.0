use mongodb::bson::oid::ObjectId;
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct FindExistingUser {
    pub email: String,
    pub password: String,
}
// 'ExistingUser' struct is sent without password to the frontend.
#[derive(Debug, Deserialize, Serialize)]
pub struct ExistingUser {
    #[serde(
        rename(deserialize = "_id"),
        serialize_with = "mongodb::bson::serde_helpers::serialize_object_id_as_hex_string"
    )]
    pub id: ObjectId,
    #[serde(rename = "firstName")]
    pub first_name: String,
    #[serde(rename = "lastName")]
    pub last_name: String,
    pub email: String,
    pub employed: bool,
}

#[derive(Serialize, Deserialize)]
pub struct ResponseResultWithUser {
    pub message: String,
    pub token: String,
    pub user: ExistingUser,
}
