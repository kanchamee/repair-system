const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const utils = require('../utils.js');

describe('status.html security audit', () => {
  const statusHtml = fs.readFileSync(path.join(__dirname, '../status.html'), 'utf8');

  it('includes Content-Security-Policy meta tag', () => {
    assert.match(statusHtml, /http-equiv=["']Content-Security-Policy["']/i);
  });

  it('includes Referrer-Policy meta tag', () => {
    assert.match(statusHtml, /name=["']referrer["']/i);
  });

  it('does not contain unsafe inline onclick attribute with string interpolation in thumbnails', () => {
    // Should NOT have onclick="openLightbox('${...}'...)" which allows breakout
    assert.doesNotMatch(statusHtml, /onclick=["']openLightbox\(['"]?\$\{/);
  });

  it('escapes problemLabel in rendered output to prevent Stored XSS', () => {
    // Check that status.html uses escapeHtml on problemLabel or escapes problemOther
    assert.match(statusHtml, /escapeHtml\(problemLabel\)/);
  });

  it('does not expose reporter private phone number or student ID in status card template', () => {
    assert.doesNotMatch(statusHtml, /\$\{r\.phone\}/);
    assert.doesNotMatch(statusHtml, /\$\{r\.studentId\}/);
  });
});
