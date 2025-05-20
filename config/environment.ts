// Environment configuration
export const env = {
  // API Keys
  SONAR_API_KEY: process.env.NEXT_PUBLIC_SONAR_API_KEY || process.env.SONAR_API_KEY || '',
  
  // Other environment variables can be added here
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Helper method to check if we're in production
  isProd: process.env.NODE_ENV === 'production'
};
