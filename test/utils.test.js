const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const utils = require('../utils.js');

describe('utils.js security and helper tests', () => {
  describe('escapeHtml', () => {
    it('escapes &, <, >, and "', () => {
      const input = '<div class="alert">&hello</div>';
      const expected = '&lt;div class=&quot;alert&quot;&gt;&amp;hello&lt;/div&gt;';
      assert.equal(utils.escapeHtml(input), expected);
    });

    it("escapes single quotes ' to prevent attribute/inline JS breakout", () => {
      const input = "test'onclick='alert(1)";
      const expected = 'test&#39;onclick=&#39;alert(1)';
      assert.equal(utils.escapeHtml(input), expected);
    });

    it('escapes backticks to prevent template literal breakout', () => {
      const input = 'test`alert(1)`';
      const expected = 'test&#96;alert(1)&#96;';
      assert.equal(utils.escapeHtml(input), expected);
    });

    it('handles null and undefined gracefully', () => {
      assert.equal(utils.escapeHtml(null), '');
      assert.equal(utils.escapeHtml(undefined), '');
    });

    it('converts numbers to escaped strings', () => {
      assert.equal(utils.escapeHtml(123), '123');
    });
  });

  describe('sanitizeImageUrl', () => {
    it('accepts valid base64 image data URLs for jpeg, png, webp', () => {
      const jpegData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD4gICAgICA==';
      const pngData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
      const webpData = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAIAAAAA';

      assert.equal(utils.sanitizeImageUrl(jpegData), jpegData);
      assert.equal(utils.sanitizeImageUrl(pngData), pngData);
      assert.equal(utils.sanitizeImageUrl(webpData), webpData);
    });

    it('accepts valid https image URLs', () => {
      const httpsUrl = 'https://firebasestorage.googleapis.com/v0/b/repair-system-sc-69/o/test.jpg?alt=media';
      assert.equal(utils.sanitizeImageUrl(httpsUrl), httpsUrl);
    });

    it('rejects javascript: URLs', () => {
      assert.equal(utils.sanitizeImageUrl('javascript:alert(1)'), '');
      assert.equal(utils.sanitizeImageUrl('JAVASCRIPT:alert(1)'), '');
      assert.equal(utils.sanitizeImageUrl(' javascript:alert(1)'), '');
    });

    it('rejects SVG data URLs to prevent SVG-embedded scripts', () => {
      assert.equal(utils.sanitizeImageUrl('data:image/svg+xml;utf8,<svg onload=alert(1)>'), '');
      assert.equal(utils.sanitizeImageUrl('data:image/svg+xml;base64,PHN2Zw=='), '');
    });

    it('rejects HTML/script data URLs', () => {
      assert.equal(utils.sanitizeImageUrl('data:text/html;base64,PHNjcmlwdD4='), '');
      assert.equal(utils.sanitizeImageUrl('data:application/javascript;base64,YWxlcnQoMSk='), '');
    });

    it('rejects file:, ftp:, and vbscript: URLs', () => {
      assert.equal(utils.sanitizeImageUrl('file:///etc/passwd'), '');
      assert.equal(utils.sanitizeImageUrl('ftp://example.com/photo.jpg'), '');
      assert.equal(utils.sanitizeImageUrl('vbscript:msgbox(1)'), '');
    });

    it('handles empty or non-string inputs', () => {
      assert.equal(utils.sanitizeImageUrl(null), '');
      assert.equal(utils.sanitizeImageUrl(undefined), '');
      assert.equal(utils.sanitizeImageUrl(''), '');
    });
  });

  describe('sanitizeExcelValue', () => {
    it('leaves safe strings and numbers unchanged', () => {
      assert.equal(utils.sanitizeExcelValue('ห้องเรียน 1500'), 'ห้องเรียน 1500');
      assert.equal(utils.sanitizeExcelValue(42), 42);
      assert.equal(utils.sanitizeExcelValue(null), '');
      assert.equal(utils.sanitizeExcelValue(undefined), '');
    });

    it('prepends single quote to formula trigger characters (=, +, -, @, tab, newline)', () => {
      assert.equal(utils.sanitizeExcelValue('=SUM(A1:A10)'), "'=SUM(A1:A10)");
      assert.equal(utils.sanitizeExcelValue('+12345'), "'+12345");
      assert.equal(utils.sanitizeExcelValue('-CMD("calc")'), "'-CMD(\"calc\")");
      assert.equal(utils.sanitizeExcelValue('@SUM(B1)'), "'@SUM(B1)");
      assert.equal(utils.sanitizeExcelValue('\tmalicious'), "'\tmalicious");
      assert.equal(utils.sanitizeExcelValue('\rmalicious'), "'\rmalicious");
    });
  });

  describe('validateImageFile', () => {
    it('accepts valid raster image files under size limit', () => {
      const validFile = { name: 'photo.jpg', size: 2 * 1024 * 1024, type: 'image/jpeg' };
      const result = utils.validateImageFile(validFile);
      assert.equal(result.valid, true);
    });

    it('rejects files exceeding 10MB', () => {
      const bigFile = { name: 'huge.jpg', size: 11 * 1024 * 1024, type: 'image/jpeg' };
      const result = utils.validateImageFile(bigFile);
      assert.equal(result.valid, false);
      assert.match(result.error, /10/);
    });

    it('rejects SVG images', () => {
      const svgFile = { name: 'exploit.svg', size: 1024, type: 'image/svg+xml' };
      const result = utils.validateImageFile(svgFile);
      assert.equal(result.valid, false);
      assert.match(result.error, /ประเภท/);
    });

    it('rejects non-image files like HTML, JS, or executables', () => {
      assert.equal(utils.validateImageFile({ name: 'test.html', size: 500, type: 'text/html' }).valid, false);
      assert.equal(utils.validateImageFile({ name: 'app.exe', size: 500, type: 'application/x-msdownload' }).valid, false);
    });

    it('rejects null or missing file', () => {
      assert.equal(utils.validateImageFile(null).valid, false);
    });
  });

  describe('Status and Date Helpers', () => {
    it('getStatusMeta returns expected metadata and falls back safely', () => {
      assert.equal(utils.getStatusMeta('received').label, 'รับเรื่องแล้ว');
      assert.equal(utils.getStatusMeta('inprogress').label, 'กำลังดำเนินการ');
      assert.equal(utils.getStatusMeta('done').label, 'ดำเนินการเสร็จแล้ว');
      assert.equal(utils.getStatusMeta('waiting').label, 'รออุปกรณ์/รองบประมาณ');
      assert.equal(utils.getStatusMeta('unknown-status').label, 'รับเรื่องแล้ว');
    });

    it('getMonthFromInputValue extracts 2-digit month correctly', () => {
      assert.equal(utils.getMonthFromInputValue('2026-08-21'), '08');
      assert.equal(utils.getMonthFromInputValue('2026-12-01'), '12');
      assert.equal(utils.getMonthFromInputValue(''), '01');
      assert.equal(utils.getMonthFromInputValue(null), '01');
    });

    it('formatDateThai handles valid and invalid dates safely', () => {
      const thaiDate = utils.formatDateThai('2026-08-15');
      assert.match(thaiDate, /2569|2026/); // Buddhist or Gregorian year
      assert.equal(utils.formatDateThai('invalid-date'), '-');
    });
  });
});
