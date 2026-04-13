/* ============================================
   VenueFlow — Main Application Controller
   ============================================ */

// ---- Scroll to section helper ----
function scrollToSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// ---- App Init ----
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏟️ VenueFlow initializing...');

  // Initial render
  VenueMap.render();
  Heatmap.renderQueueCards();
  Schedule.init();
  Alerts.init();
  Admin.init();

  // ---- Navbar navigation ----
  document.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      if (section) scrollToSection(section);
      // Update active state
      document.querySelectorAll('.navbar__link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      // Close mobile menu
      document.getElementById('nav-menu')?.classList.remove('open');
    });
  });

  // ---- Hamburger menu ----
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }

  // ---- Intersection Observer for active nav link ----
  const sections = document.querySelectorAll('.section, .hero');
  const navLinks = document.querySelectorAll('.navbar__link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3, rootMargin: '-72px 0px 0px 0px' });

  sections.forEach(section => observer.observe(section));

  // ---- Reveal animations ----
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ---- Real-time data simulation loop ----
  setInterval(() => {
    VenueData.tick();
    VenueMap.update();
    Heatmap.update();
    Admin.update();
    updateHeroStats();
  }, 5000); // Update every 5 seconds

  // ---- Navbar scroll effect ----
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('navbar');
    if (navbar) {
      if (window.scrollY > 100) {
        navbar.style.background = 'rgba(2, 6, 23, 0.95)';
      } else {
        navbar.style.background = 'rgba(2, 6, 23, 0.85)';
      }
    }
  });

  // ---- Update hero stats dynamically ----
  function updateHeroStats() {
    const statAttendees = document.getElementById('stat-attendees');
    const statAvgWait = document.getElementById('stat-avg-wait');
    
    if (statAttendees) {
      const target = VenueData.getTotalAttendees();
      animateValue(statAttendees, parseInt(statAttendees.textContent.replace(/,/g, '')), target, 800);
    }
    if (statAvgWait) {
      statAvgWait.textContent = VenueData.getAvgWaitTime() + 'm';
    }
  }

  // ---- Animated number counter ----
  function animateValue(el, start, end, duration) {
    if (start === end) return;
    const range = end - start;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.floor(start + range * eased);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // ---- Marquee text updates ----
  function updateMarquee() {
    const marqueeEl = document.getElementById('marquee-text');
    if (!marqueeEl) return;

    const zones = VenueData.getZones();
    const parts = zones.slice(0, 5).map(z => {
      const density = VenueData.getZoneDensity(z.id);
      const emoji = density === 'low' ? '🟢' : density === 'medium' ? '🟡' : '🔴';
      return `${z.icon} ${z.name}: ${emoji} ${density}`;
    });
    
    marqueeEl.textContent = `⚡ VenueFlow Active — Real-time crowd monitoring · ${parts.join(' · ')} · Avg wait: ${VenueData.getAvgWaitTime()}m ·`;
  }

  setInterval(updateMarquee, 10000);

  console.log('🏟️ VenueFlow ready!');
});
