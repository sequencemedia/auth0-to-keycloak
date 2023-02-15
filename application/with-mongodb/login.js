async function login (email, password, callback) { // eslint-disable-line no-unused-vars
  const {
    MongoClient
  } = require('mongodb@4.1.0');

  const {
    MONGODB_USERNAME,
    MONGODB_PASSWORD,
    MONGODB_HOST
  } = configuration;

  const client = new MongoClient(`mongodb+srv://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}/?authSource=admin&appName=auth0`);

  const {
    MONGODB_DATABASE,
    MONGODB_COLLECTION
  } = configuration;

  /**
   *  Open the connection
   */
  await client.connect();

  const db = client.db(MONGODB_DATABASE);
  const users = db.collection(MONGODB_COLLECTION);
  const user = await users.findOne({ email });

  /**
   *  And close it
   */
  await client.close();

  if (user) {
    /**
     *  The user is found
     */
    const bcrypt = require('bcrypt');

    try {
      const {
        password: hash
      } = user;

      const isValid = await bcrypt.compare(password, hash);

      if (isValid) {
        const {
          _id: id,
          app_metadata,
          name,
          given_name,
          family_name,
          preferred_username: preferredUsername,
          username,
          email_verified
        } = user;

        return callback(null, {
          id: id.toString(),
          app_metadata,
          name,
          given_name,
          family_name,
          preferred_username: preferredUsername,
          username,
          email,
          email_verified
        });
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

        const bcrypt = require('bcrypt');

        const {
          ITERATIONS
        } = configuration;

        const iterations = Number(ITERATIONS);
        const salt = await bcrypt.genSalt(iterations);
        const hash = await bcrypt.hash(password, salt);

        /**
         *  Open the connection again
         */
        await client.connect();

        const db = client.db(MONGODB_DATABASE);
        const users = db.collection(MONGODB_COLLECTION);
        const user = await users.insertOne({
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
          email_verified,
          password: hash,
          iterations,
          updatedAt: new Date()
        });

        /**
         *  And close it
         */
        await client.close();

        const {
          insertedId: id
        } = user;

        return callback(null, {
          id: id.toString(),
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
