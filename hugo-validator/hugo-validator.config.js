// hugo-validator configuration
// See: https://github.com/thedavecarroll/hugo-validator

module.exports = {
  // Required: Your site's URL (used to skip self-referential links)
  siteUrl: 'https://anovelidea.org/',

  // Ports to kill before validation (dev servers that might conflict)
  portsToKill: [1313, 3000],

  // External domains to skip in link checking
  // Key is domain, value is reason for skipping
  skipExternalDomains: {
    // 'challenges.cloudflare.com': 'Cloudflare Turnstile widget',
    // 'web.archive.org': 'Archive.org rate-limits automated requests',
  },

  // CSS validation: glob pattern for SCSS/CSS files
  cssPattern: 'themes/*/assets/scss/**/*.scss',

  // Paths to skip in accessibility and link tests
  skipPaths: ['/rss.xml', '/sitemap.xml', '/robots.txt'],

  // Responsive testing configuration
  responsive: {
    // CSS selector for your main page wrapper
    wrapperSelector: '.page-wrapper',
    // Pages to spot-check for responsive layout issues
    spotCheckPages: ['/', '/posts/', '/about/'],
  },

  // Interaction testing configuration
  interaction: {
    // CSS selector for main navigation links
    navSelector: '.site-nav a',
    // Selectors for touch target size testing
    touchTargetSelectors: [
      'button',
      'input',
      'select',
      'textarea',
      '[role="button"]',
      'nav a',
    ],
  },

  // Report settings
  reportRetention: 8,                    // Number of reports to keep
  reportFilename: 'VALIDATION-REPORT.md', // Main report filename
  reportsDir: 'hugo-validator/reports',  // Directory for timestamped reports

  // Test server settings
  testServerPort: 3000,
};
