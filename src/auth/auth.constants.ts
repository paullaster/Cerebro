/**
 * Domains that are allowed to receive secure cookies even in non-production environments
 * or specific external domains that require strict cookie handling.
 */
export const SECURE_COOKIE_ALLOW_LIST = [
  'cereals-project.com',
  'api.cereals-project.com',
];

export const AUTH_CONSTANTS = {
  SESSION_PREFIX: 'session:',
  REFRESH_TOKEN_COOKIE_NAME: 'refresh_token',
};
