const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('admin.html security audit', () => {
  const adminHtml = fs.readFileSync(path.join(__dirname, '../admin.html'), 'utf8');

  it('does NOT contain hardcoded plaintext admin password "6933"', () => {
    // Plaintext password comparison should be removed
    assert.doesNotMatch(adminHtml, /ADMIN_CODE\s*=\s*["']6933["']/);
    assert.doesNotMatch(adminHtml, /val\s*===\s*["']6933["']/);
  });

  it('includes Content-Security-Policy meta tag', () => {
    assert.match(adminHtml, /http-equiv=["']Content-Security-Policy["']/i);
  });

  it('includes Referrer-Policy meta tag', () => {
    assert.match(adminHtml, /name=["']referrer["']/i);
  });

  it('escapes problemLabel in report cards to prevent Stored XSS', () => {
    assert.match(adminHtml, /escapeHtml\(problemLabel\)/);
  });

  it('escapes month summary categories in renderMonthSummary to prevent XSS', () => {
    assert.match(adminHtml, /escapeHtml\(k\)/);
  });

  it('does not contain unsafe inline onclick attribute with string interpolation in thumbnails', () => {
    assert.doesNotMatch(adminHtml, /onclick=["']openLightbox\(['"]?\$\{/);
  });

  it('sanitizes exported Excel values against CSV/Formula Injection', () => {
    assert.match(adminHtml, /sanitizeExcelValue/);
  });

  it('has a logout button for session management', () => {
    assert.match(adminHtml, /ออกจากระบบ/);
  });

  it('contains brute-force protection logic (lockout / attempt tracking)', () => {
    assert.match(adminHtml, /lockout|failedAttempts/i);
  });
});
