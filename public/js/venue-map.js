/* ============================================
   VenueFlow — Interactive SVG Venue Map
   ============================================ */

const VenueMap = (() => {
  let tooltipEl = null;

  function render() {
    const container = document.getElementById('map-container');
    if (!container) return;

    const zones = VenueData.getZones();
    const crowdData = VenueData.getCrowdData();

    // Build SVG
    const svgNS = 'http://www.w3.org/2000/svg';
    
    // Clear existing
    container.innerHTML = '';

    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.style.width = '100%';
    svg.style.height = '100%';

    // Defs for gradients and filters
    const defs = document.createElementNS(svgNS, 'defs');
    
    // Glow filter
    const filter = document.createElementNS(svgNS, 'filter');
    filter.setAttribute('id', 'glow');
    const feGauss = document.createElementNS(svgNS, 'feGaussianBlur');
    feGauss.setAttribute('stdDeviation', '0.5');
    feGauss.setAttribute('result', 'coloredBlur');
    const feMerge = document.createElementNS(svgNS, 'feMerge');
    const feMergeNode1 = document.createElementNS(svgNS, 'feMergeNode');
    feMergeNode1.setAttribute('in', 'coloredBlur');
    const feMergeNode2 = document.createElementNS(svgNS, 'feMergeNode');
    feMergeNode2.setAttribute('in', 'SourceGraphic');
    feMerge.appendChild(feMergeNode1);
    feMerge.appendChild(feMergeNode2);
    filter.appendChild(feGauss);
    filter.appendChild(feMerge);
    defs.appendChild(filter);

    // Gradient definitions for density
    ['low', 'medium', 'high'].forEach(level => {
      const grad = document.createElementNS(svgNS, 'linearGradient');
      grad.setAttribute('id', `grad-${level}`);
      grad.setAttribute('x1', '0%');
      grad.setAttribute('y1', '0%');
      grad.setAttribute('x2', '100%');
      grad.setAttribute('y2', '100%');
      const colors = {
        low: ['#10b981', '#059669'],
        medium: ['#f59e0b', '#d97706'],
        high: ['#ef4444', '#dc2626'],
      };
      const stop1 = document.createElementNS(svgNS, 'stop');
      stop1.setAttribute('offset', '0%');
      stop1.setAttribute('stop-color', colors[level][0]);
      stop1.setAttribute('stop-opacity', '0.3');
      const stop2 = document.createElementNS(svgNS, 'stop');
      stop2.setAttribute('offset', '100%');
      stop2.setAttribute('stop-color', colors[level][1]);
      stop2.setAttribute('stop-opacity', '0.15');
      grad.appendChild(stop1);
      grad.appendChild(stop2);
      defs.appendChild(grad);
    });

    svg.appendChild(defs);

    // Background grid
    for (let i = 0; i <= 100; i += 10) {
      const lineH = document.createElementNS(svgNS, 'line');
      lineH.setAttribute('x1', '0');
      lineH.setAttribute('y1', i);
      lineH.setAttribute('x2', '100');
      lineH.setAttribute('y2', i);
      lineH.setAttribute('stroke', 'rgba(99, 102, 241, 0.06)');
      lineH.setAttribute('stroke-width', '0.2');
      svg.appendChild(lineH);

      const lineV = document.createElementNS(svgNS, 'line');
      lineV.setAttribute('x1', i);
      lineV.setAttribute('y1', '0');
      lineV.setAttribute('x2', i);
      lineV.setAttribute('y2', '100');
      lineV.setAttribute('stroke', 'rgba(99, 102, 241, 0.06)');
      lineV.setAttribute('stroke-width', '0.2');
      svg.appendChild(lineV);
    }

    // Venue outer boundary
    const boundary = document.createElementNS(svgNS, 'rect');
    boundary.setAttribute('x', '1');
    boundary.setAttribute('y', '1');
    boundary.setAttribute('width', '98');
    boundary.setAttribute('height', '98');
    boundary.setAttribute('rx', '3');
    boundary.setAttribute('fill', 'none');
    boundary.setAttribute('stroke', 'rgba(99, 102, 241, 0.2)');
    boundary.setAttribute('stroke-width', '0.3');
    boundary.setAttribute('stroke-dasharray', '2 1');
    svg.appendChild(boundary);

    // Pathways
    const pathways = [
      'M 50,85 L 50,45',  // Main walkway vertical
      'M 12,50 L 88,50',  // Horizontal main path
      'M 50,45 L 35,22',  // To main stage
      'M 50,45 L 68,22',  // To merch
      'M 50,45 L 15,22',  // To VIP
    ];
    pathways.forEach(d => {
      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', d);
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', 'rgba(99, 102, 241, 0.12)');
      path.setAttribute('stroke-width', '0.5');
      path.setAttribute('stroke-dasharray', '1 0.5');
      svg.appendChild(path);
    });

    // Draw zones
    zones.forEach(zone => {
      const density = VenueData.getZoneDensity(zone.id);
      const d = crowdData[zone.id];
      const ratio = d ? d.current / d.capacity : 0;

      const g = document.createElementNS(svgNS, 'g');
      g.setAttribute('class', 'map-zone');
      g.setAttribute('data-zone', zone.id);
      g.style.cursor = 'pointer';

      // Zone rectangle
      const rect = document.createElementNS(svgNS, 'rect');
      rect.setAttribute('x', zone.x);
      rect.setAttribute('y', zone.y);
      rect.setAttribute('width', zone.w);
      rect.setAttribute('height', zone.h);
      rect.setAttribute('rx', '1.5');
      rect.setAttribute('fill', `url(#grad-${density})`);
      rect.setAttribute('stroke', densityColor(density));
      rect.setAttribute('stroke-width', '0.4');
      rect.setAttribute('filter', 'url(#glow)');
      rect.style.transition = 'all 0.5s ease';

      // Animated pulse for high density
      if (density === 'high') {
        const animate = document.createElementNS(svgNS, 'animate');
        animate.setAttribute('attributeName', 'stroke-opacity');
        animate.setAttribute('values', '1;0.4;1');
        animate.setAttribute('dur', '2s');
        animate.setAttribute('repeatCount', 'indefinite');
        rect.appendChild(animate);
      }

      g.appendChild(rect);

      // Icon
      const icon = document.createElementNS(svgNS, 'text');
      icon.setAttribute('x', zone.x + zone.w / 2);
      icon.setAttribute('y', zone.y + zone.h / 2 - 1);
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('dominant-baseline', 'middle');
      icon.setAttribute('font-size', Math.min(zone.w, zone.h) * 0.3 + '');
      icon.textContent = zone.icon;
      g.appendChild(icon);

      // Label
      const label = document.createElementNS(svgNS, 'text');
      label.setAttribute('x', zone.x + zone.w / 2);
      label.setAttribute('y', zone.y + zone.h / 2 + 3);
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('dominant-baseline', 'middle');
      label.setAttribute('font-size', '1.8');
      label.setAttribute('fill', 'rgba(255,255,255,0.8)');
      label.setAttribute('font-family', 'Inter, sans-serif');
      label.setAttribute('font-weight', '600');
      label.textContent = zone.name;
      g.appendChild(label);

      // Crowd % indicator
      const pctText = document.createElementNS(svgNS, 'text');
      pctText.setAttribute('x', zone.x + zone.w - 1);
      pctText.setAttribute('y', zone.y + 2.5);
      pctText.setAttribute('text-anchor', 'end');
      pctText.setAttribute('font-size', '1.6');
      pctText.setAttribute('fill', densityColor(density));
      pctText.setAttribute('font-family', 'JetBrains Mono, monospace');
      pctText.setAttribute('font-weight', '600');
      pctText.textContent = Math.round(ratio * 100) + '%';
      g.appendChild(pctText);

      // Event listeners
      g.addEventListener('mouseenter', (e) => showTooltip(e, zone, density, d));
      g.addEventListener('mouseleave', hideTooltip);
      g.addEventListener('mousemove', moveTooltip);

      svg.appendChild(g);
    });

    container.appendChild(svg);
  }

  function densityColor(density) {
    const colors = { low: '#10b981', medium: '#f59e0b', high: '#ef4444' };
    return colors[density] || '#94a3b8';
  }

  function showTooltip(event, zone, density, data) {
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.className = 'zone-tooltip';
      document.getElementById('map-container').appendChild(tooltipEl);
    }

    const ratio = data ? Math.round((data.current / data.capacity) * 100) : 0;
    const trendIcon = data?.trend === 'rising' ? '📈' : data?.trend === 'falling' ? '📉' : '➡️';

    tooltipEl.innerHTML = `
      <div class="zone-tooltip__name">${zone.icon} ${zone.name}</div>
      <div class="zone-tooltip__detail">Density: <span class="badge badge--${density}" style="font-size: 0.7rem; padding: 2px 8px;">${density.toUpperCase()}</span></div>
      <div class="zone-tooltip__detail">Occupancy: ${data?.current?.toLocaleString() || 0} / ${zone.capacity.toLocaleString()} (${ratio}%)</div>
      <div class="zone-tooltip__detail">Trend: ${trendIcon} ${data?.trend || 'stable'}</div>
    `;
    tooltipEl.style.display = 'block';
    moveTooltip(event);
  }

  function moveTooltip(event) {
    if (!tooltipEl) return;
    const container = document.getElementById('map-container');
    const rect = container.getBoundingClientRect();
    let x = event.clientX - rect.left + 15;
    let y = event.clientY - rect.top - 10;
    
    // Keep tooltip within bounds
    if (x + 200 > rect.width) x = event.clientX - rect.left - 200;
    if (y + 100 > rect.height) y = event.clientY - rect.top - 100;
    
    tooltipEl.style.left = x + 'px';
    tooltipEl.style.top = y + 'px';
  }

  function hideTooltip() {
    if (tooltipEl) {
      tooltipEl.style.display = 'none';
    }
  }

  // Update map with new data (called on each tick)
  function update() {
    render();
    document.getElementById('map-last-update').textContent = 'Updated: ' + new Date().toLocaleTimeString();
  }

  return { render, update };
})();
