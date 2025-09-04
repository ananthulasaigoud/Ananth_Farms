// Webhook configuration
export const WEBHOOK_CONFIG = {
  // Default webhook URL (kept as test URL for safety; prod switch happens in getWebhookUrl)
  N8N_WEBHOOK_URL: 'https://sai1709.app.n8n.cloud/webhook-test/4df4d7e1-a255-46dd-be21-66299d0681e4',
  
  // Alternative webhook URLs for testing
  ALTERNATIVE_URLS: [
    'https://sai1709.app.n8n.cloud/webhook/4df4d7e1-a255-46dd-be21-66299d0681e4'
  ],
  
  // Timeout settings
  TIMEOUT_MS: 10000, // 10 seconds
  
  // Retry settings
  MAX_RETRIES: 3,
  RETRY_DELAY_MS: 1000, // 1 second
  
  // CORS settings
  CORS_MODE: 'cors' as RequestMode,
  
  // Headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Check if we're in development mode
export const isDevelopment = import.meta.env.DEV;

// Environment-specific overrides
export const getWebhookUrl = (): string => {
  // 1) Explicit override wins
  const envUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;
  if (envUrl && envUrl.trim()) {
    return envUrl.trim();
  }

  // 2) Derive from default: use /webhook-test when developing, /webhook when in production
  const defaultUrl = WEBHOOK_CONFIG.N8N_WEBHOOK_URL;

  // If default contains /webhook-test/ and we're not in development, switch to /webhook/
  if (!isDevelopment && defaultUrl.includes('/webhook-test/')) {
    return defaultUrl.replace('/webhook-test/', '/webhook/');
  }

  // If in development and default accidentally points to /webhook/, force test URL
  if (isDevelopment && defaultUrl.includes('/webhook/')) {
    return defaultUrl.replace('/webhook/', '/webhook-test/');
  }

  // 3) Fallback to default
  return defaultUrl;
};

// Check if we should use fallback responses
export const shouldUseFallback = (): boolean => {
  // In development, always allow fallbacks
  if (isDevelopment) {
    return true;
  }
  
  // In production, you might want to disable fallbacks
  return import.meta.env.VITE_ENABLE_FALLBACKS !== 'false';
};
