use mongodb::bson::{DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};
#[derive(Deserialize, Serialize)]
pub struct JobApplication {
    #[serde(
        rename(deserialize = "_id", serialize = "_id"),
        serialize_with = "mongodb::bson::serde_helpers::serialize_object_id_as_hex_string"
    )]
    pub id: ObjectId,
    #[serde(
        serialize_with = "mongodb::bson::serde_helpers::bson_datetime_as_rfc3339_string::serialize"
    )]
    pub date: DateTime,
    pub company: String,
    pub position: String,
    pub status: String,
    #[serde(rename(deserialize = "userId"), skip_serializing)]
    pub user_id: ObjectId,
    #[serde(default)]
    pub location: Option<String>,
    #[serde(rename(deserialize = "jobType", serialize = "jobType"), default)]
    pub job_type: Option<String>,
    #[serde(default)]
    pub notes: Option<String>,
}
