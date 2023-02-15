# auth0-to-keycloak

Enables Auth0 to validate usernames and passwords with a client in Keycloak

## Keycloak

### Client

You'll need an administrator account to create the _client_

- Client [for Keycloak `v15`](docs/keycloak-v15.md)

### Users

You'll need an administrator account to create some _users_

- `the-user-1@sequencemedia.net`
- `the-user-2@sequencemedia.net`
- `the-user-3@sequencemedia.net`

You should assign them valid _and not temporary_ passwords

These users are only for confirming that communication between Auth0 and Keycloak is successful, after which you should remove them

## Auth0

- [Auth0](docs/auth0.md)
- [Auth0 with MongoDB](docs/auth0-with-mongodb.md)
