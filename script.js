// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  // Services dropdown: click/tap or keyboard to open, Escape or outside click to close
  document.querySelectorAll('.nav-dropdown').forEach(dd => {
    const btn = dd.querySelector('.nav-dropdown-toggle');
    if (!btn) return;
    const setOpen = open => {
      dd.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    btn.addEventListener('click', () => setOpen(!dd.classList.contains('open')));
    dd.addEventListener('keydown', e => {
      if (e.key === 'Escape' && dd.classList.contains('open')) { setOpen(false); btn.focus(); }
    });
    document.addEventListener('click', e => { if (!dd.contains(e.target)) setOpen(false); });
    dd.addEventListener('focusout', e => { if (!dd.contains(e.relatedTarget)) setOpen(false); });
  });

  // Contact form: preselect a service from the link, e.g. /contact/?service=In-Home%20Respite
  const serviceSelect = document.querySelector('select#service');
  if (serviceSelect) {
    const wanted = new URLSearchParams(location.search).get('service');
    if (wanted && [...serviceSelect.options].some(o => o.value === wanted)) serviceSelect.value = wanted;
  }

  // Inquiry form: send in the background and show the thank-you message on the page.
  // If the background send is refused (for example Formspree's reCAPTCHA spam check,
  // which can't run in a background send) or blocked by a browser extension, the form
  // falls back to a normal submit, so Formspree's own page can finish the job.
  // Without JavaScript the form posts to Formspree normally.
  const inquiry = document.getElementById('inquiry-form');
  if (inquiry && window.fetch) {
    const status = document.getElementById('form-status');
    const sendNormally = (reason) => {
      console.warn('Background form send failed; sending normally instead.', reason);
      status.className = 'form-status';
      status.textContent = 'Finishing your inquiry on our form provider’s page…';
      HTMLFormElement.prototype.submit.call(inquiry);  // skips this handler
    };
    inquiry.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = inquiry.querySelector('button[type="submit"]');
      btn.disabled = true;
      status.className = 'form-status';
      status.textContent = 'Sending…';
      let res;
      try {
        res = await fetch(inquiry.action, {
          method: 'POST',
          body: new FormData(inquiry),
          headers: { Accept: 'application/json' }
        });
      } catch (err) {
        sendNormally(err);  // network error or request blocked
        return;
      }
      if (!res.ok) {
        let reason = 'HTTP ' + res.status;
        try {
          const data = await res.json();
          if (data.errors && data.errors.length) reason += ': ' + data.errors.map(x => x.message).join('; ');
          else if (data.error) reason += ': ' + data.error;
        } catch (_) { /* not JSON */ }
        sendNormally(reason);
        return;
      }
      // Sent: show the thank-you message in place of the form
      const done = document.createElement('div');
      done.className = 'form-success';
      done.setAttribute('role', 'status');
      done.setAttribute('tabindex', '-1');
      done.innerHTML = '<h3>Thank you.</h3><p>Your inquiry has been sent to ACP. We will review it and contact you about the next step. This does not confirm a start date.</p>';
      inquiry.replaceWith(done);
      done.focus();
    });
  }

  // Team filter (only present on team.html)
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.person-card');
  if (filterBtns.length && cards.length) {
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const dept = btn.dataset.filter;
        cards.forEach(card => {
          const match = dept === 'all' || card.dataset.dept === dept;
          card.style.display = match ? '' : 'none';
        });
      });
    });
  }

  // Simple contact form UX (no backend — placeholder)
  
});
