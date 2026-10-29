use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};


pub fn get_user_token_from_cookie(
    jar: &CookieJar,
) -> Option<String> {
    let cookie_jwt_token = jar
        .get("jwt")
        .map(|c| c.value().to_owned()); 
        // 'c' = is a &Cookie (a borrow)
        // '.value()' = returns &str (also a borrow)'
        // '.to_owned()' = copies that text into a new String

    cookie_jwt_token

}

pub fn set_cookie(jar: CookieJar, jwt_token: String) -> CookieJar {
    let cookie = Cookie::build(("jwt", jwt_token))
    .http_only(true)
    .same_site(SameSite::Lax)
    .path("/")
    .build();

    jar.add(cookie)
}