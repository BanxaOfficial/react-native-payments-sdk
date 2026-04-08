/**
 * Load .env before tests so BANXA_* variables are available for live API tests.
 * Live API tests are skipped when BANXA_API_KEY and BANXA_PARTNER are not set.
 */
require('dotenv').config();
