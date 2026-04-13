/* ============================================
   VenueFlow — Event Schedule
   ============================================ */

const Schedule = (() => {
  let currentFilter = 'all';
  let reminders = new Set();

  // Load saved reminders
  function loadReminders() {
    try {
      const saved = localStorage.getItem('venueflow_reminders');
      if (saved) reminders = new Set(JSON.parse(saved));
    } catch(e) {}
  }

  function saveReminders() {
    try {
      localStorage.setItem('venueflow_reminders', JSON.stringify([...reminders]));
    } catch(e) {}
  }

  function render() {
    const list = document.getElementById('schedule-list');
    if (!list) return;

    const events = VenueData.getSchedule();
    const filtered = currentFilter === 'all' 
      ? events 
      : events.filter(e => e.stage === currentFilter);

    // Determine which event is "active" (nearest to current simulated time)
    const now = new Date();
    const currentHour = now.getHours();
    
    list.innerHTML = filtered.map((event, idx) => {
      const eventHour = parseInt(event.time.split(':')[0]) + (event.ampm === 'PM' && event.time.split(':')[0] !== '12' ? 12 : 0);
      const isActive = Math.abs(eventHour - currentHour) <= 1;
      const hasReminder = reminders.has(event.id);

      return `
        <div class="schedule-item ${isActive ? 'active' : ''}" id="event-${event.id}" style="animation: fadeInUp 0.5s ease ${idx * 0.05}s both;">
          <div class="schedule-item__time">
            <div class="schedule-item__time-value">${event.time}</div>
            <div class="schedule-item__time-ampm">${event.ampm}</div>
          </div>
          <div class="schedule-item__divider"></div>
          <div class="schedule-item__info">
            <div class="schedule-item__title">${event.icon} ${event.title}</div>
            <div class="schedule-item__location">📍 ${event.location} · ${event.duration}</div>
          </div>
          <div class="schedule-item__actions">
            <button class="btn btn--sm ${hasReminder ? 'btn--accent' : 'btn--secondary'}" 
                    onclick="Schedule.toggleReminder('${event.id}')"
                    id="reminder-${event.id}"
                    title="${hasReminder ? 'Remove reminder' : 'Set reminder'}">
              ${hasReminder ? '🔔' : '🔕'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function setFilter(filter) {
    currentFilter = filter;
    // Update tab styles
    document.querySelectorAll('#schedule-tabs .tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.stage === filter);
    });
    render();
  }

  function toggleReminder(eventId) {
    if (reminders.has(eventId)) {
      reminders.delete(eventId);
    } else {
      reminders.add(eventId);
      // Show a confirmation alert
      const event = VenueData.getSchedule().find(e => e.id === eventId);
      if (event) {
        Alerts.addToast({
          type: 'success',
          title: '🔔 Reminder Set',
          message: `You'll be reminded about "${event.title}" at ${event.time} ${event.ampm}`,
        });
      }
    }
    saveReminders();
    render();
  }

  function init() {
    loadReminders();

    // Tab click handlers
    document.querySelectorAll('#schedule-tabs .tab').forEach(tab => {
      tab.addEventListener('click', () => setFilter(tab.dataset.stage));
    });

    render();
  }

  return { init, render, setFilter, toggleReminder };
})();
