/* ============================================
   VenueFlow — Simulated Real-Time Data Engine
   ============================================ */

const VenueData = (() => {
  // ---- Zone Definitions ----
  const zones = [
    { id: 'main-stage', name: 'Main Stage', icon: '🎤', type: 'stage', capacity: 5000, x: 35, y: 20, w: 30, h: 22 },
    { id: 'tech-arena', name: 'Tech Arena', icon: '💻', type: 'stage', capacity: 2000, x: 10, y: 50, w: 22, h: 20 },
    { id: 'food-court', name: 'Food Court', icon: '🍔', type: 'food', capacity: 1500, x: 68, y: 50, w: 22, h: 20 },
    { id: 'gate-a', name: 'Gate A (Main)', icon: '🚪', type: 'gate', capacity: 800, x: 45, y: 85, w: 14, h: 10 },
    { id: 'gate-b', name: 'Gate B (East)', icon: '🚪', type: 'gate', capacity: 600, x: 85, y: 40, w: 10, h: 14 },
    { id: 'gate-c', name: 'Gate C (West)', icon: '🚪', type: 'gate', capacity: 600, x: 2, y: 40, w: 10, h: 14 },
    { id: 'restrooms', name: 'Restrooms', icon: '🚻', type: 'facility', capacity: 200, x: 52, y: 55, w: 12, h: 10 },
    { id: 'merch-zone', name: 'Merch Store', icon: '🛍️', type: 'shop', capacity: 300, x: 68, y: 20, w: 16, h: 14 },
    { id: 'vip-lounge', name: 'VIP Lounge', icon: '⭐', type: 'vip', capacity: 500, x: 15, y: 20, w: 16, h: 14 },
    { id: 'parking', name: 'Parking Area', icon: '🅿️', type: 'parking', capacity: 3000, x: 30, y: 72, w: 40, h: 10 },
  ];

  // ---- Queue Definitions ----
  const queues = [
    { id: 'q-gate-a', name: 'Gate A Entry', icon: '🚪', zone: 'gate-a', maxWait: 25 },
    { id: 'q-gate-b', name: 'Gate B Entry', icon: '🚪', zone: 'gate-b', maxWait: 20 },
    { id: 'q-food-1', name: 'Burger Station', icon: '🍔', zone: 'food-court', maxWait: 18 },
    { id: 'q-food-2', name: 'Pizza Corner', icon: '🍕', zone: 'food-court', maxWait: 15 },
    { id: 'q-food-3', name: 'Drinks Bar', icon: '🥤', zone: 'food-court', maxWait: 10 },
    { id: 'q-restroom', name: 'Restrooms', icon: '🚻', zone: 'restrooms', maxWait: 12 },
    { id: 'q-merch', name: 'Merchandise', icon: '🛍️', zone: 'merch-zone', maxWait: 20 },
    { id: 'q-vip', name: 'VIP Check-in', icon: '⭐', zone: 'vip-lounge', maxWait: 5 },
  ];

  // ---- Schedule ----
  const schedule = [
    { id: 'e1', time: '09:00', ampm: 'AM', title: 'Gates Open — Welcome Address', location: 'Gate A & B', stage: 'main', icon: '🚪', duration: '30 min' },
    { id: 'e2', time: '09:30', ampm: 'AM', title: 'Opening Keynote: Future of Events', location: 'Main Stage', stage: 'main', icon: '🎤', duration: '45 min' },
    { id: 'e3', time: '10:15', ampm: 'AM', title: 'AI in Crowd Management Workshop', location: 'Tech Arena', stage: 'tech', icon: '💻', duration: '1 hr' },
    { id: 'e4', time: '10:30', ampm: 'AM', title: 'Food Festival Opens', location: 'Food Court', stage: 'food', icon: '🍔', duration: 'All Day' },
    { id: 'e5', time: '11:30', ampm: 'AM', title: 'Panel: Smart Venues & IoT', location: 'Tech Arena', stage: 'tech', icon: '🔬', duration: '45 min' },
    { id: 'e6', time: '12:00', ampm: 'PM', title: 'Live Music: Indie Showcase', location: 'Main Stage', stage: 'main', icon: '🎵', duration: '1 hr' },
    { id: 'e7', time: '01:00', ampm: 'PM', title: 'Lunch Break & Networking', location: 'Food Court', stage: 'food', icon: '🤝', duration: '1 hr' },
    { id: 'e8', time: '02:00', ampm: 'PM', title: 'Hackathon Demo Showcase', location: 'Tech Arena', stage: 'tech', icon: '🏆', duration: '2 hrs' },
    { id: 'e9', time: '03:00', ampm: 'PM', title: 'Cultural Dance Performance', location: 'Main Stage', stage: 'main', icon: '💃', duration: '45 min' },
    { id: 'e10', time: '04:00', ampm: 'PM', title: 'VIP Meet & Greet', location: 'VIP Lounge', stage: 'main', icon: '⭐', duration: '1 hr' },
    { id: 'e11', time: '05:30', ampm: 'PM', title: 'Grand Finale Concert', location: 'Main Stage', stage: 'main', icon: '🎸', duration: '2 hrs' },
    { id: 'e12', time: '07:30', ampm: 'PM', title: 'Closing Ceremony & Awards', location: 'Main Stage', stage: 'main', icon: '🏅', duration: '1 hr' },
  ];

  // ---- Smart Alert Templates ----
  const alertTemplates = [
    { type: 'info', title: '🎤 Performance Starting', message: 'Grand Finale Concert begins in 15 minutes at Main Stage!' },
    { type: 'warning', title: '⚠️ Gate A Crowded', message: 'Gate A is experiencing high traffic. Consider using Gate B or Gate C for faster entry.' },
    { type: 'success', title: '✅ Gate B Now Clear', message: 'Gate B currently has minimal wait time. Perfect time to enter!' },
    { type: 'info', title: '🍔 Food Court Update', message: 'Drinks Bar has the shortest wait time right now — just 2 minutes!' },
    { type: 'warning', title: '🚻 Restroom Advisory', message: 'Main Restrooms are busy. Additional facilities are available near Gate C.' },
    { type: 'info', title: '🅿️ Parking Update', message: 'East Parking (near Gate B) has 120+ spots available.' },
    { type: 'danger', title: '🚨 Weather Alert', message: 'Light rain expected in 30 minutes. Indoor areas recommended.' },
    { type: 'success', title: '🛍️ Merch Drop!', message: 'Limited edition event merchandise now available at the Merch Store.' },
    { type: 'info', title: '📱 App Tip', message: 'Set reminders for your favorite events to never miss a performance!' },
    { type: 'warning', title: '⚡ Peak Hours', message: 'Food Court is entering peak hours. Consider eating at 1:30 PM for shorter waits.' },
  ];

  // ---- Mutable State ----
  let crowdData = {};
  let queueData = {};
  let totalAttendees = 12450;

  // Initialize with random data
  function init() {
    zones.forEach(zone => {
      crowdData[zone.id] = {
        current: Math.floor(zone.capacity * (0.3 + Math.random() * 0.5)),
        capacity: zone.capacity,
        trend: Math.random() > 0.5 ? 'rising' : 'falling',
      };
    });

    queues.forEach(queue => {
      queueData[queue.id] = {
        waitMinutes: Math.floor(1 + Math.random() * queue.maxWait),
        peopleInQueue: Math.floor(5 + Math.random() * 40),
      };
    });
  }

  // Simulate real-time updates
  function tick() {
    zones.forEach(zone => {
      const d = crowdData[zone.id];
      const delta = Math.floor(Math.random() * 80) - 40;
      d.current = Math.max(10, Math.min(zone.capacity, d.current + delta));
      d.trend = delta > 0 ? 'rising' : delta < 0 ? 'falling' : 'stable';
    });

    queues.forEach(queue => {
      const d = queueData[queue.id];
      const delta = Math.floor(Math.random() * 6) - 3;
      d.waitMinutes = Math.max(0, Math.min(queue.maxWait + 5, d.waitMinutes + delta));
      d.peopleInQueue = Math.max(0, d.peopleInQueue + Math.floor(Math.random() * 8) - 4);
    });

    // Total attendees fluctuation
    totalAttendees = Math.max(8000, Math.min(18000, totalAttendees + Math.floor(Math.random() * 200) - 80));
  }

  // ---- Getters ----
  function getZones() { return zones; }
  function getQueues() { return queues; }
  function getSchedule() { return schedule; }
  function getAlertTemplates() { return alertTemplates; }
  function getCrowdData() { return crowdData; }
  function getQueueData() { return queueData; }
  function getTotalAttendees() { return totalAttendees; }

  function getZoneDensity(zoneId) {
    const d = crowdData[zoneId];
    if (!d) return 'low';
    const ratio = d.current / d.capacity;
    if (ratio < 0.4) return 'low';
    if (ratio < 0.7) return 'medium';
    return 'high';
  }

  function getQueueDensity(queueId) {
    const d = queueData[queueId];
    if (!d) return 'low';
    const q = queues.find(q => q.id === queueId);
    const maxW = q ? q.maxWait : 15;
    const ratio = d.waitMinutes / maxW;
    if (ratio < 0.35) return 'low';
    if (ratio < 0.65) return 'medium';
    return 'high';
  }

  function getAvgWaitTime() {
    const vals = Object.values(queueData);
    if (vals.length === 0) return 0;
    const sum = vals.reduce((acc, d) => acc + d.waitMinutes, 0);
    return Math.round(sum / vals.length);
  }

  // Override a zone's crowd level (from admin)
  function overrideZone(zoneId, level, capacityPercent) {
    const zone = zones.find(z => z.id === zoneId);
    if (!zone) return;
    const d = crowdData[zoneId];
    if (capacityPercent !== undefined) {
      d.current = Math.floor(zone.capacity * (capacityPercent / 100));
    } else {
      const targets = { low: 0.25, medium: 0.55, high: 0.85 };
      d.current = Math.floor(zone.capacity * (targets[level] || 0.5));
    }
  }

  init();

  return {
    getZones, getQueues, getSchedule, getAlertTemplates,
    getCrowdData, getQueueData, getTotalAttendees,
    getZoneDensity, getQueueDensity, getAvgWaitTime,
    overrideZone, tick, init,
  };
})();
