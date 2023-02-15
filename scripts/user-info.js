#!/usr/bin/env node

const {
  exec
} = require('child_process');

const args = require('../utils/args');

if (!args.has('KEYCLOAK_CLIENT_ID')) throw new Error('Parameter `KEYCLOAK_CLIENT_ID` is required');
const KEYCLOAK_CLIENT_ID = args.get('KEYCLOAK_CLIENT_ID');

if (!args.has('KEYCLOAK_CLIENT_SECRET')) throw new Error('Parameter `KEYCLOAK_CLIENT_SECRET` is required');
const KEYCLOAK_CLIENT_SECRET = args.get('KEYCLOAK_CLIENT_SECRET');

if (!args.has('KEYCLOAK_PROTOCOL')) throw new Error('Parameter `KEYCLOAK_PROTOCOL` is required');
const KEYCLOAK_PROTOCOL = args.get('KEYCLOAK_PROTOCOL');

if (!args.has('KEYCLOAK_HOST')) throw new Error('Parameter `KEYCLOAK_HOST` is required');
const KEYCLOAK_HOST = args.get('KEYCLOAK_HOST');

if (!args.has('KEYCLOAK_REALM')) throw new Error('Parameter `KEYCLOAK_REALM` is required');
const KEYCLOAK_REALM = args.get('KEYCLOAK_REALM');

if (!args.has('USERNAME')) throw new Error('Parameter `USERNAME` is required');
const USERNAME = args.get('USERNAME');

if (!args.has('PASSWORD')) throw new Error('Parameter `PASSWORD` is required');
const PASSWORD = args.get('PASSWORD');

const ADMIN = `
  curl \
    -d "client_id=${KEYCLOAK_CLIENT_ID}" \
    -d "client_secret=${KEYCLOAK_CLIENT_SECRET}" \
    -d "username=${encodeURIComponent(USERNAME)}" \
    -d "password=${encodeURIComponent(PASSWORD)}" \
    -d "grant_type=password" \
    -d "scope=openid" \
    "${KEYCLOAK_PROTOCOL}://${KEYCLOAK_HOST}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token"
`;

exec(ADMIN, (e, v) => {
  if (e) throw e;

  const { access_token: accessToken } = JSON.parse(v);

  const USER_INFO = `
    curl \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${accessToken}" \
      "${KEYCLOAK_PROTOCOL}://${KEYCLOAK_HOST}/auth/realms/${KEYCLOAK_REALM}/protocol/openid-connect/userinfo"
  `;

  exec(USER_INFO, (e, v) => {
    if (e) throw e;

    console.log(JSON.parse(v));
  });
});
