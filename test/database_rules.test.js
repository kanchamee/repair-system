const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

describe('database.rules.json and firebase.json audit', () => {
  const rulesPath = path.join(__dirname, '../database.rules.json');
  const firebaseJsonPath = path.join(__dirname, '../firebase.json');

  it('database.rules.json exists and is valid JSON', () => {
    assert.ok(fs.existsSync(rulesPath), 'database.rules.json should exist');
    const content = fs.readFileSync(rulesPath, 'utf8');
    const rules = JSON.parse(content);
    assert.ok(rules.rules, 'rules root key should exist');
  });

  it('firebase.json exists and points to database rules', () => {
    assert.ok(fs.existsSync(firebaseJsonPath), 'firebase.json should exist');
    const config = JSON.parse(fs.readFileSync(firebaseJsonPath, 'utf8'));
    assert.equal(config.database.rules, 'database.rules.json');
  });

  it('defines indexes on reports for query optimization', () => {
    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    const indexOn = rules.rules.reports['.indexOn'];
    assert.ok(Array.isArray(indexOn), '.indexOn should be an array');
    assert.ok(indexOn.includes('locationType'));
    assert.ok(indexOn.includes('status'));
    assert.ok(indexOn.includes('month'));
  });

  it('validates required fields, data types, and status values on new reports', () => {
    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    const reportRules = rules.rules.reports['$reportId'];
    assert.ok(reportRules['.validate'], '.validate rule should be defined');
    const validateStr = reportRules['.validate'];
    assert.match(validateStr, /reporterType/);
    assert.match(validateStr, /fullName/);
    assert.match(validateStr, /locationType/);
    assert.match(validateStr, /problemType/);
    assert.match(validateStr, /status/);
  });
});
