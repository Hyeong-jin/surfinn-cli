// Use this import if you want to use "env.js" file
const { REACT_APP_API_URL, REACT_APP_TIMEOUT } = process.env;

/**
 * The options used to configure the API.
 */
export interface ApiConfig {
  /**
   * The URL of the api.
   */
  url: string | undefined;

  /**
   * Milliseconds before we timeout the request.
   */
  timeout: number;
}

/**
 * The default configuration for the app.
 */
export const DEFAULT_API_CONFIG: ApiConfig = {
  url: REACT_APP_API_URL,
  timeout: REACT_APP_TIMEOUT ? parseInt(REACT_APP_TIMEOUT) : 3000,
};
