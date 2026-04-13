/**
 * VenueFlow — Test Suite
 * 
 * Validates core functionality of the VenueFlow data engine,
 * queue logic, and alert system.
 * 
 * Run: node public/js/tests.js
 * 
 * @module tests
 * @author Mamidi Vashisht
 */

/* ---- Minimal Test Runner ---- */
let passed = 0;
let failed = 0;
const failures = [];

/**
 * Assert that a condition is true.
 * @param {string} name - Test name
 * @param {boolean} condition - The assertion
 */
function assert(name, condition) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    failures.push(name);
    console.log(`  ❌ ${name}`);
  }
}

/**
 * Assert that two values are equal.
 * @param {string} name - Test name
 * @param {*} actual - Actual value
 * @param {*} expected - Expected value
 */
function assertEqual(name, actual, expected) {
  const pass = actual === expected;
  if (!pass) {
    console.log(`     Expected: ${expected}, Got: ${actual}`);
  }
  assert(name, pass);
}

/**
 * Assert that a value is within a range (inclusive).
 * @param {string} name - Test name
 * @param {number} value - Value to check
 * @param {number} min - Minimum bound
 * @param {number} max - Maximum bound
 */
function assertInRange(name, value, min, max) {
  const pass = value >= min && value <= max;
  if (!pass) {
    console.log(`     Expected: ${min}-${max}, Got: ${value}`);
  }
  assert(name, pass);
}

/* ---- Load modules ---- */
const path = require('path');
const VenueData = require(path.join(__dirname, 'data.js'));

/* ==== TEST SUITES ==== */

console.log('\n🏟️ VenueFlow Test Suite\n');
console.log('━'.repeat(50));

// ---- Data Engine Tests ----
console.log('\n📊 Data Engine Tests');

assert('VenueData module exists', typeof VenueData === 'object');
assert('getZones returns array', Array.isArray(VenueData.getZones()));
assertEqual('getZones returns 10 zones', VenueData.getZones().length, 10);
assert('getQueues returns array', Array.isArray(VenueData.getQueues()));
assertEqual('getQueues returns 8 queues', VenueData.getQueues().length, 8);
assert('getSchedule returns array', Array.isArray(VenueData.getSchedule()));
assertEqual('getSchedule returns 12 events', VenueData.getSchedule().length, 12);
assert('getAlertTemplates returns array', Array.isArray(VenueData.getAlertTemplates()));

// ---- Zone Validation Tests ----
console.log('\n🗺️ Zone Validation Tests');

const zones = VenueData.getZones();
zones.forEach(zone => {
  assert(`Zone "${zone.name}" has valid id`, typeof zone.id === 'string' && zone.id.length > 0);
  assert(`Zone "${zone.name}" has valid capacity`, typeof zone.capacity === 'number' && zone.capacity > 0);
  assertInRange(`Zone "${zone.name}" x position`, zone.x, 0, 100);
  assertInRange(`Zone "${zone.name}" y position`, zone.y, 0, 100);
});

// ---- Crowd Data Tests ----
console.log('\n📈 Crowd Data Tests');

const crowdData = VenueData.getCrowdData();
assert('Crowd data is populated', Object.keys(crowdData).length === zones.length);

zones.forEach(zone => {
  const d = crowdData[zone.id];
  assert(`Crowd data exists for "${zone.name}"`, d !== undefined);
  assertInRange(`"${zone.name}" crowd within capacity`, d.current, 0, zone.capacity);
  assert(`"${zone.name}" has trend`, ['rising', 'falling', 'stable'].includes(d.trend));
});

// ---- Density Calculation Tests ----
console.log('\n🚦 Density Calculation Tests');

const densityLevels = ['low', 'medium', 'high'];
zones.forEach(zone => {
  const density = VenueData.getZoneDensity(zone.id);
  assert(`"${zone.name}" density is valid level`, densityLevels.includes(density));
});

// ---- Queue Data Tests ----
console.log('\n⏱️ Queue Data Tests');

const queues = VenueData.getQueues();
const queueData = VenueData.getQueueData();

queues.forEach(queue => {
  const d = queueData[queue.id];
  assert(`Queue "${queue.name}" data exists`, d !== undefined);
  assert(`Queue "${queue.name}" wait >= 0`, d.waitMinutes >= 0);
  assert(`Queue "${queue.name}" people >= 0`, d.peopleInQueue >= 0);
  
  const density = VenueData.getQueueDensity(queue.id);
  assert(`Queue "${queue.name}" density is valid`, densityLevels.includes(density));
});

// ---- Average Wait Time Test ----
console.log('\n⏳ Average Wait Time Tests');

const avgWait = VenueData.getAvgWaitTime();
assert('Average wait returns number', typeof avgWait === 'number');
assertInRange('Average wait is reasonable', avgWait, 0, 30);

// ---- Total Attendees Test ----
console.log('\n👥 Attendees Tests');

const total = VenueData.getTotalAttendees();
assert('Total attendees returns number', typeof total === 'number');
assertInRange('Total attendees in range', total, 5000, 25000);

// ---- Tick (Simulation) Tests ----
console.log('\n🔄 Simulation Tick Tests');

const beforeTick = JSON.parse(JSON.stringify(VenueData.getCrowdData()));
VenueData.tick();
const afterTick = VenueData.getCrowdData();

assert('Tick modifies crowd data', JSON.stringify(beforeTick) !== JSON.stringify(afterTick));

// Verify data stays within bounds after tick
zones.forEach(zone => {
  const d = afterTick[zone.id];
  assertInRange(`After tick: "${zone.name}" crowd valid`, d.current, 0, zone.capacity);
});

// ---- Zone Override Tests ----
console.log('\n🎛️ Zone Override Tests');

VenueData.overrideZone('main-stage', 'low');
const overridden = VenueData.getCrowdData()['main-stage'];
const mainStage = zones.find(z => z.id === 'main-stage');
const expectedLow = Math.floor(mainStage.capacity * 0.25);
assertEqual('Override to low sets correct crowd', overridden.current, expectedLow);

VenueData.overrideZone('main-stage', 'high');
const overriddenHigh = VenueData.getCrowdData()['main-stage'];
const expectedHigh = Math.floor(mainStage.capacity * 0.85);
assertEqual('Override to high sets correct crowd', overriddenHigh.current, expectedHigh);

VenueData.overrideZone('food-court', 'medium', 50);
const overriddenPct = VenueData.getCrowdData()['food-court'];
const foodCourt = zones.find(z => z.id === 'food-court');
const expectedPct = Math.floor(foodCourt.capacity * 0.5);
assertEqual('Override with percentage sets correct crowd', overriddenPct.current, expectedPct);

// ---- Schedule Validation Tests ----
console.log('\n📅 Schedule Validation Tests');

const schedule = VenueData.getSchedule();
schedule.forEach(event => {
  assert(`Event "${event.title}" has valid id`, typeof event.id === 'string');
  assert(`Event "${event.title}" has time`, typeof event.time === 'string');
  assert(`Event "${event.title}" has ampm`, ['AM', 'PM'].includes(event.ampm));
  assert(`Event "${event.title}" has location`, typeof event.location === 'string');
  assert(`Event "${event.title}" has stage`, typeof event.stage === 'string');
});

// ---- Edge Cases ----
console.log('\n⚠️ Edge Case Tests');

assertEqual('Invalid zone density returns low', VenueData.getZoneDensity('nonexistent'), 'low');
assertEqual('Invalid queue density returns low', VenueData.getQueueDensity('nonexistent'), 'low');

// Override nonexistent zone should not throw
let noError = true;
try {
  VenueData.overrideZone('nonexistent', 'low');
} catch (e) {
  noError = false;
}
assert('Override nonexistent zone does not throw', noError);

// ---- Input Sanitization Tests ----
console.log('\n🔒 Security / Input Tests');

// Test that special characters in data don't cause issues
const specialChars = '<script>alert("xss")</script>';
noError = true;
try {
  VenueData.overrideZone('main-stage', specialChars);
} catch (e) {
  noError = false;
}
assert('Special chars in override do not throw', noError);

// ---- Results ----
console.log('\n' + '━'.repeat(50));
console.log(`\n📋 Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);

if (failed > 0) {
  console.log('\n❌ Failed tests:');
  failures.forEach(f => console.log(`   - ${f}`));
  process.exit(1);
} else {
  console.log('\n🎉 All tests passed!\n');
  process.exit(0);
}
