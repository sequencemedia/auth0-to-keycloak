async function login (email, password, callback) { // eslint-disable-line no-unused-vars
  /**
   *  The user is not found
   */
  const axios = require('axios');

  const {
    KEYCLOAK_PROTOCOL,
    KEYCLOAK_HOST,
    KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID,
    KEYCLOAK_CLIENT_SECRET
  } = configuration;

  try {
    const url = `${KEYCLOAK_PROTOCOL}://${KEYCLOAK_HOST}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const tokenResponse = await axios.post(url, new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_CLIENT_SECRET,
      grant_type: 'password',
      username: email,
      password,
      scope: 'openid'
    }));

    const {
      status
    } = tokenResponse;

    if (status === 200) {
      const {
        data: {
          access_token: accessToken
        } = {}
      } = tokenResponse;

      const url = `${KEYCLOAK_PROTOCOL}://${KEYCLOAK_HOST}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo`;
      const userInfoResponse = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });

      const {
        status
      } = userInfoResponse;

      if (status === 200) {
        const {
          data: {
            sub,
            email_verified,
            realm_access: {
              roles
            } = {},
            groups,
            name,
            given_name,
            family_name,
            preferred_username: preferredUsername,
            username
          } = {}
        } = userInfoResponse;

        return callback(null, {
          id: sub,
          app_metadata: {
            sub,
            roles,
            groups
          },
          name,
          given_name,
          family_name,
          preferred_username: preferredUsername,
          username,
          email,
          email_verified
        });
      }
    }

    return callback(new WrongUsernameOrPasswordError(email));
  } catch ({
    message
  }) {
    /**
     *  Log the message
     */
    console.error(message);

    /**
     *  Return a "wrong username or password" error
     */
    return callback(new WrongUsernameOrPasswordError(email));
  }
}
