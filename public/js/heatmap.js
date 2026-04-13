/* ============================================
   VenueFlow — Queue / Heatmap Cards
   ============================================ */

const Heatmap = (() => {

  function renderQueueCards() {
    const grid = document.getElementById('queue-grid');
    if (!grid) return;

    const queues = VenueData.getQueues();
    const queueData = VenueData.getQueueData();

    grid.innerHTML = queues.map(queue => {
      const data = queueData[queue.id];
      const density = VenueData.getQueueDensity(queue.id);
      const waitMin = data?.waitMinutes || 0;
      const people = data?.peopleInQueue || 0;
      const maxWait = queue.maxWait;
      const fillPct = Math.min(100, Math.round((waitMin / (maxWait + 5)) * 100));
      const fillColor = density === 'low' ? 'var(--crowd-low)' : density === 'medium' ? 'var(--crowd-medium)' : 'var(--crowd-high)';

      return `
        <div class="queue-card" id="queue-${queue.id}">
          <div class="queue-card__header">
            <div class="queue-card__name">${queue.icon} ${queue.name}</div>
            <span class="badge badge--${density}">${density}</span>
          </div>
          <div class="queue-card__wait queue-card__wait--${density}">${waitMin}m</div>
          <div class="queue-card__label">Estimated wait · ${people} people in queue</div>
          <div class="queue-card__bar">
            <div class="queue-card__bar-fill" style="width: ${fillPct}%; background: ${fillColor};"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function update() {
    renderQueueCards();
  }

  return { renderQueueCards, update };
})();
