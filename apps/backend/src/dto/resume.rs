use mongodb::bson::{Binary, DateTime, oid::ObjectId};
use serde::{Deserialize, Serialize};
#[derive(Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Resume {
    #[serde(
        rename(deserialize = "_id", serialize = "_id"),
        serialize_with = "mongodb::bson::serde_helpers::serialize_object_id_as_hex_string"
    )]
    pub id: ObjectId,
    pub name: String,
    pub original_name: String, // ↔ originalName
    #[serde(default)]
    pub mime_type: String, // ↔ mimeType
    #[serde(default)]
    pub size: i64, // file size in bytes
    #[serde(default)]
    pub tag: Option<String>,
    #[serde(default)]
    pub is_default: Option<bool>, // ↔ isDefault
    #[serde(
        serialize_with = "mongodb::bson::serde_helpers::bson_datetime_as_rfc3339_string::serialize"
    )]
    uploaded_at: DateTime, // ↔ uploadedAt, stored as a Date
    #[serde(rename(deserialize = "userId"), skip_serializing)]
    user_id: ObjectId,
}

// What the upload handler reads from the multipart form.
// Not serialized: the service builds the MongoDB document from it.
pub struct NewResume {
    pub name: String,
    pub original_name: String,
    pub mime_type: String,
    pub data: Vec<u8>, // the file itself
}

// Body of PATCH /resume/update/{id}: send only what changes
#[derive(Deserialize)]
pub struct ResumeUpdate {
    pub name: Option<String>,
    pub tag: Option<String>,
}

// What download/preview need from the database: the file and how to send it
#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ResumeFile {
    pub original_name: String,
    pub mime_type: String,
    pub data: Binary, // the file itself
}
