const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('report.html validation and security audit', () => {
  const reportHtml = fs.readFileSync(path.join(__dirname, '../report.html'), 'utf8');

  it('includes Content-Security-Policy meta tag', () => {
    assert.match(reportHtml, /http-equiv=["']Content-Security-Policy["']/i);
  });

  it('includes Referrer-Policy meta tag', () => {
    assert.match(reportHtml, /name=["']referrer["']/i);
  });

  it('enforces maxlength constraints on all text and textarea inputs', () => {
    assert.match(reportHtml, /id="fullName"[^>]*maxlength=/);
    assert.match(reportHtml, /id="email"[^>]*maxlength=/);
    assert.match(reportHtml, /id="phone"[^>]*maxlength=/);
    assert.match(reportHtml, /id="description"[^>]*maxlength=/);
  });

  it('restricts file input to raster image types (jpeg, png, webp) and not generic image/*', () => {
    assert.match(reportHtml, /id="imageFile"[^>]*accept=["'][^"']*image\/jpeg/);
    assert.doesNotMatch(reportHtml, /id="imageFile"[^>]*accept=["']image\/\*["']/);
  });

  it('validates image file using validateImageFile before compression', () => {
    assert.match(reportHtml, /validateImageFile/);
  });
});
