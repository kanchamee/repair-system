const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const locations = require('../locations.js');

describe('locations.js tests', () => {
  describe('buildLocationLabel', () => {
    it('builds classroom label correctly', () => {
      const label = locations.buildLocationLabel('classroom', { roomNumber: '1500' });
      assert.equal(label, 'ห้องเรียน 1500');
    });

    it('builds bathroom label with and without side correctly', () => {
      const withSide = locations.buildLocationLabel('bathroom', {
        building: '1',
        floor: '2',
        side: 'ฝั่งโภชนาการ',
        type: 'ชาย'
      });
      assert.equal(withSide, 'ห้องน้ำ อาคาร 1 ชั้น 2 (ฝั่งโภชนาการ) - ห้องน้ำชาย');

      const withoutSide = locations.buildLocationLabel('bathroom', {
        building: '3',
        floor: '4',
        side: null,
        type: 'หญิง'
      });
      assert.equal(withoutSide, 'ห้องน้ำ อาคาร 3 ชั้น 4 - ห้องน้ำหญิง');
    });

    it('builds subject group label correctly', () => {
      const label = locations.buildLocationLabel('subject', {
        group: 'วิทยาศาสตร์และเทคโนโลยี',
        room: 'อาคาร 1 ชั้น 3 (1320)'
      });
      assert.equal(label, 'ห้องหมวดวิทยาศาสตร์และเทคโนโลยี - อาคาร 1 ชั้น 3 (1320)');
    });

    it('builds office label correctly', () => {
      const label = locations.buildLocationLabel('office', {
        room: 'ห้องพัสดุ'
      });
      assert.equal(label, 'ห้องพัสดุ (อาคาร 1 ชั้น 2)');
    });

    it('defensively handles null or undefined detail without throwing', () => {
      assert.equal(locations.buildLocationLabel('classroom', null), '');
      assert.equal(locations.buildLocationLabel('bathroom', undefined), '');
      assert.equal(locations.buildLocationLabel('unknown', {}), '');
      assert.equal(locations.buildLocationLabel(null, null), '');
    });
  });

  describe('Location data structures', () => {
    it('contains all 6 bathroom buildings with expected configurations', () => {
      for (let i = 1; i <= 6; i++) {
        const b = locations.BATHROOM_BUILDINGS[String(i)];
        assert.ok(b, `Building ${i} configuration should exist`);
        assert.ok(Array.isArray(b.floors), `Building ${i} should have floors array`);
        assert.ok(Array.isArray(b.types), `Building ${i} should have types array`);
      }
    });

    it('contains valid subject groups and rooms', () => {
      assert.ok(Object.keys(locations.SUBJECT_GROUPS).length >= 8);
      assert.ok(locations.OFFICE_ROOMS.includes('ห้องผู้อำนวยการ'));
    });
  });
});
