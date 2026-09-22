/**
 * Contact & Collaboration Page Script
 * Handles institutional coordinate rendering and interactive inquiry dispatching
 */

(function () {
  'use strict';

  // 1. Mobile Menu Drawer Toggle
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
    });
  }

  // 2. Fetch & Render Dynamic Institutional Data
  async function loadContactData() {
    try {
      const isStaticHost = window.location.hostname.endsWith('github.io') || window.location.protocol === 'file:';
      let res = null;
      if (!isStaticHost) {
        try {
          res = await fetch('/api/content');
        } catch (_) {}
      }
      if (!res || !res.ok) {
        try {
          res = await fetch('data/portfolio.json');
        } catch (_) {}
      }
      if (!res || !res.ok) {
        res = await fetch('./data/portfolio.json');
      }
      if (!res || !res.ok) return;
      const data = await res.json();

      // Guard brand name logo
      if (data.profile && data.profile.name) {
        const brand = document.getElementById('header-brand-name');
        if (brand) {
          const brandImg = brand.querySelector('img');
          if (brandImg) brandImg.alt = data.profile.name;
          else brand.textContent = data.profile.name;
        }
      }

      if (data.contact) {
        const c = data.contact;
        const setTxt = (id, val) => {
          const el = document.getElementById(id);
          if (el && val) el.textContent = val;
        };

        setTxt('contact-page-dept', c.department);
        setTxt('contact-page-office', c.office);
        setTxt('contact-page-mission', c.mission);
        setTxt('footer-lab-name', c.labName || 'Kelina Cyril');
        setTxt('footer-copyright', c.copyright || '© 2026 Kelina Cyril. All rights reserved.');

        if (c.email) {
          const emailLink = document.getElementById('contact-page-email-link');
          if (emailLink) {
            emailLink.textContent = c.email;
            emailLink.href = `mailto:${c.email}`;
          }
          const mailtoBtn = document.getElementById('contact-page-mailto-btn');
          if (mailtoBtn) {
            mailtoBtn.href = `mailto:${c.email}`;
          }
        }
      }
    } catch (err) {
      console.warn('Could not load live contact data:', err);
    }
  }

  loadContactData();

  // 3. Form Submission Handling
  const form = document.getElementById('contact-inquiry-form');
  const successBox = document.getElementById('inquiry-success-box');
  const successMsg = document.getElementById('inquiry-success-msg');
  const errorAlert = document.getElementById('form-error-alert');
  const submitBtn = document.getElementById('form-submit-btn');
  const submitText = document.getElementById('form-submit-text');
  const resetBtn = document.getElementById('inquiry-reset-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (errorAlert) errorAlert.style.display = 'none';

      const name = document.getElementById('form-name').value.trim();
      const email = document.getElementById('form-email').value.trim();
      const subject = document.getElementById('form-subject').value;
      const message = document.getElementById('form-message').value.trim();

      if (!name || !email || !message) {
        showError('Please fill in all required fields (Name, Email, and Message).');
        return;
      }

      // Disable button & show spinner state
      if (submitBtn) submitBtn.disabled = true;
      if (submitText) submitText.textContent = 'Transmitting note...';

      try {
        const res = await fetch('/api/contact/inquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, subject, message })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok || !data || !data.success) {
          throw new Error((data && data.error) || 'Backend API unavailable on static host');
        }

        // Display Success Card
        form.style.display = 'none';
        if (successBox) {
          successBox.classList.add('show');
          if (successMsg) {
            successMsg.textContent = data.message || `Thank you, ${name}! Your inquiry has been delivered to Kelina Cyril.`;
          }
        }
      } catch (err) {
        // Fallback for static hosts (e.g., GitHub Pages): open mail client directly
        const mailtoUrl = `mailto:kelina@iitj.ac.in?subject=${encodeURIComponent(`[Research Inquiry] ${subject}`)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`;
        window.location.href = mailtoUrl;

        form.style.display = 'none';
        if (successBox) {
          successBox.classList.add('show');
          if (successMsg) {
            successMsg.textContent = `Opening your email client to send your message directly to Kelina Cyril...`;
          }
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (submitText) submitText.textContent = 'Send Message';
      }
    });
  }

  function showError(msg) {
    if (errorAlert) {
      errorAlert.textContent = msg;
      errorAlert.style.display = 'block';
    } else {
      alert(msg);
    }
  }

  // Reset & Send Another
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (form) {
        form.reset();
        form.style.display = 'block';
      }
      if (successBox) {
        successBox.classList.remove('show');
      }
      if (errorAlert) {
        errorAlert.style.display = 'none';
      }
    });
  }
})();
