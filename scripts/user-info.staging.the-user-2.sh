#!/bin/bash

# the-user-2 gmFOO%!1W5sO

./scripts/user-info.js \
  --KEYCLOAK_CLIENT_ID 'Auth0' \
  --KEYCLOAK_CLIENT_SECRET 'af816709-b7de-4784-b4ef-b91cf42ae6e3' \
  --KEYCLOAK_PROTOCOL 'https' \
  --KEYCLOAK_HOST 'auth.stg.timeshighereducation.com' \
  --KEYCLOAK_REALM 'THE' \
  --USERNAME 'the-user-2@sequencemedia.net' \
  --PASSWORD 'gmFOO%!1W5sO'

exit 0
