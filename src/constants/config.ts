type Environment = 'development' | 'staging' | 'production';

interface Config {
  env: Environment;
  apiBaseUrl: string;
  bemsApiBaseUrl: string;
  pcApiBaseUrl: string;
  sentryDsn: string | null;
  enableMockApi: boolean;
}

const getEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  // In production, check APP_VARIANT from app.config.ts
  // This is set during build time
  return 'production';
};

const configs: Record<Environment, Config> = {
  development: {
    env: 'development',
    apiBaseUrl: 'https://stage.hdc-insite.com:8083/api',
    bemsApiBaseUrl: 'https://stage.hdc-insite.com:8086/bems',
    pcApiBaseUrl: 'https://stage.hdc-insite.com:8081/pc',
    sentryDsn: null,
    enableMockApi: false,
  },
  staging: {
    env: 'staging',
    apiBaseUrl: 'https://stage.hdc-insite.com:8083/api',
    bemsApiBaseUrl: 'https://stage.hdc-insite.com:8086/bems',
    pcApiBaseUrl: 'https://stage.hdc-insite.com:8081/pc',
    sentryDsn: 'YOUR_STAGING_SENTRY_DSN',
    enableMockApi: false,
  },
  production: {
    env: 'production',
    apiBaseUrl: 'https://www.hdc-insite.com:8083/api',
    bemsApiBaseUrl: 'https://www.hdc-insite.com:8086/bems',
    pcApiBaseUrl: 'https://www.hdc-insite.com:8081/pc',
    sentryDsn: 'YOUR_PRODUCTION_SENTRY_DSN',
    enableMockApi: false,
  },
};

export const config: Config = configs[getEnvironment()];

// App constants
export const APP_NAME = 'Insite';
export const APP_VERSION = '2.0.0';

// Session timeout (30 minutes)
export const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

// Senior Mode scale factor
export const SENIOR_MODE_SCALE = 1.2;

// Default page size for lists
export const DEFAULT_PAGE_SIZE = 20;

// Cache durations
export const CACHE_DURATION = {
  short: 1000 * 60 * 5, // 5 minutes
  medium: 1000 * 60 * 30, // 30 minutes
  long: 1000 * 60 * 60 * 24, // 24 hours
};
