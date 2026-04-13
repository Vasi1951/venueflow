/* ============================================
   VenueFlow — Admin / Organizer Panel
   ============================================ */

const Admin = (() => {

  function renderStats() {
    const container = document.getElementById('admin-stats');
    if (!container) return;

    const total = VenueData.getTotalAttendees();
    const avgWait = VenueData.getAvgWaitTime();
    const zones = VenueData.getZones();
    const crowdData = VenueData.getCrowdData();

    // Count zones by density
    let high = 0, medium = 0, low = 0;
    zones.forEach(z => {
      const d = VenueData.getZoneDensity(z.id);
      if (d === 'high') high++;
      else if (d === 'medium') medium++;
      else low++;
    });

    const stats = [
      { value: total.toLocaleString(), label: 'Total Attendees', color: 'var(--primary-400)' },
      { value: avgWait + 'm', label: 'Avg Wait Time', color: 'var(--accent-400)' },
      { value: high, label: 'High Density Zones', color: 'var(--crowd-high)' },
      { value: low, label: 'Clear Zones', color: 'var(--crowd-low)' },
    ];

    container.innerHTML = stats.map(s => `
      <div class="admin-stat">
        <div class="admin-stat__value" style="color: ${s.color}">${s.value}</div>
        <div class="admin-stat__label">${s.label}</div>
      </div>
    `).join('');
  }

  function populateZoneSelect() {
    const select = document.getElementById('zone-select');
    if (!select) return;

    const zones = VenueData.getZones();
    select.innerHTML = zones.map(z => `
      <option value="${z.id}">${z.icon} ${z.name}</option>
    `).join('');
  }

  function init() {
    populateZoneSelect();
    renderStats();

    // Alert form handler
    const alertForm = document.getElementById('alert-form');
    if (alertForm) {
      alertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('alert-type').value;
        const title = document.getElementById('alert-title-input').value;
        const message = document.getElementById('alert-message-input').value;

        if (title && message) {
          Alerts.addToast({ type, title, message });
          // Reset form
          document.getElementById('alert-title-input').value = '';
          document.getElementById('alert-message-input').value = '';
        }
      });
    }

    // Zone override form handler
    const zoneForm = document.getElementById('zone-form');
    if (zoneForm) {
      zoneForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const zoneId = document.getElementById('zone-select').value;
        const level = document.getElementById('zone-crowd-level').value;
        const capacity = document.getElementById('zone-capacity-input').value;

        VenueData.overrideZone(zoneId, level, capacity ? parseInt(capacity) : undefined);

        // Trigger immediate refresh
        VenueMap.update();
        Heatmap.update();
        renderStats();

        const zone = VenueData.getZones().find(z => z.id === zoneId);
        Alerts.addToast({
          type: 'success',
          title: '🎛️ Zone Updated',
          message: `${zone?.name || zoneId} crowd level set to ${level.toUpperCase()}.`,
        });
      });
    }
  }

  function update() {
    renderStats();
  }

  return { init, update, renderStats };
})();
