
window.APP_CONFIG = {
  SUPABASE_URL:      'https://flalymcjyikdofwaklgn.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsYWx5bWNqeWlrZG9md2FrbGduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3ODYwOTEsImV4cCI6MjA5MDM2MjA5MX0.czvFwanHvGcqrmsXyQIEixlhRlRJBMbiNbgeAIpUOHQ',
  CACHE_TTL_MS:      10 * 60 * 1000, 
  SITE_URL:          'https://csi.griet.ac.in',
};


window.sb = null;
(function initSupabase() {
  try {
    if (typeof supabase === 'undefined') throw new Error('Supabase library not loaded');
    window.sb = supabase.createClient(
      window.APP_CONFIG.SUPABASE_URL,
      window.APP_CONFIG.SUPABASE_ANON_KEY
    );
    console.log('✓ Supabase initialized');
  } catch (err) {
    console.error('✗ Supabase init failed:', err.message);
    window.APP_CONFIG._initError = err.message;
  }
})();
