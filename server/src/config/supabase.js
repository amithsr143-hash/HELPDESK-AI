import { createClient } from '@supabase/supabase-js';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isLiveConfigured =
  Boolean(
    env.SUPABASE_URL &&
    !env.SUPABASE_URL.includes('mock') &&
    !env.SUPABASE_URL.includes('your-project') &&
    env.SUPABASE_SERVICE_ROLE_KEY &&
    !env.SUPABASE_SERVICE_ROLE_KEY.includes('mock') &&
    !env.SUPABASE_SERVICE_ROLE_KEY.includes('your_')
  );

export let supabase = null;

if (isLiveConfigured) {
  try {
    supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    logger.info({ url: env.SUPABASE_URL }, 'Supabase Client initialized with Service Role');

    // Test connectivity non-blockingly; if unreachable (sandbox/offline), gracefully fall back
    supabase
      .from('profiles')
      .select('id')
      .limit(1)
      .then(({ error }) => {
        if (error) {
          logger.warn({ err: error.message }, 'Supabase remote host unreachable; seamlessly using local persistent data store');
          isLiveConfigured = false;
        } else {
          logger.info('Supabase live connectivity confirmed');
        }
      })
      .catch((err) => {
        logger.warn({ err: err.message }, 'Supabase remote host unreachable; seamlessly using local persistent data store');
        isLiveConfigured = false;
      });
  } catch (err) {
    logger.warn({ error: err.message }, 'Failed to initialize live Supabase client, falling back to local store');
    isLiveConfigured = false;
  }
} else {
  logger.info('Running in Local Data Store mode (configured with local persistent/in-memory store until live Supabase credentials provided in .env)');
}

export { isLiveConfigured };


