use serde::Deserialize;

#[derive(Deserialize)]
pub struct NewUser {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub password: String,
    pub is_employed: bool,
}
