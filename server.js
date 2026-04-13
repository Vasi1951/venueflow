/**
 * VenueFlow — Express Server
 * 
 * Serves the VenueFlow single-page application with:
 * - Security headers (CSP, HSTS, X-Content-Type-Options)
 * - Static file serving with cache control
 * - Health check endpoint for Cloud Run
 * - Structured error handling
 * 
 * @module server
 * @author Mamidi Vashisht
 */

const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

/**
 * Security middleware — sets protective HTTP headers.
 * Mitigates XSS, clickjacking, MIME sniffing, and enforces HTTPS.
 */
app.use((req, res, next) => {
  // Content Security Policy — restrict resource origins
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://*.googleapis.com https://*.gstatic.com",
      "connect-src 'self' https://*.googleapis.com https://www.google-analytics.com",
      "frame-ancestors 'none'",
    ].join('; ')
  );

  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS filter
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy — disable unused browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(self), payment=()'
  );

  // HSTS — enforce HTTPS (1 year)
  if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

/**
 * Health check endpoint for Google Cloud Run.
 * Returns 200 with service status metadata.
 * @route GET /healthz
 */
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'venueflow',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Serve static files with appropriate cache control.
 * CSS/JS assets are cached for 1 day; HTML is not cached.
 */
app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
      // Don't cache HTML — always serve fresh
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  })
);

/**
 * SPA fallback — serve index.html for all non-file routes.
 * Enables client-side routing.
 * @route GET *
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Global error handler — catches unhandled errors.
 * Returns a sanitized error response (no stack traces in production).
 */
app.use((err, req, res, _next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.message}`);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🏟️ VenueFlow is running at http://localhost:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Health check: http://localhost:${PORT}/healthz`);
});
