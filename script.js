const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
const navLinks = [...document.querySelectorAll('.site-nav a')];

const syncHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 36);
syncHeader();
window.addEventListener('scroll', syncHeader, { passive: true });

const setMenu = (open) => {
  menuButton.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
  document.body.classList.toggle('menu-open', open);
  menuButton.querySelector('.menu-toggle__label').textContent = open ? 'Close' : 'Menu';
};

menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
navLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false);
});

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) {
  reveals.forEach((item) => item.classList.add('is-visible'));
} else {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
  reveals.forEach((item) => revealObserver.observe(item));
}

const filters = [...document.querySelectorAll('[data-filter]')];
const galleryCards = [...document.querySelectorAll('.gallery-card')];
filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const selected = filter.dataset.filter;
    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle('is-active', active);
      item.setAttribute('aria-pressed', String(active));
    });
    galleryCards.forEach((card) => {
      const visible = selected === 'all' || card.dataset.category.split(/\s+/).includes(selected);
      card.classList.toggle('is-filtered', !visible);
    });
  });
});

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('figcaption');
const lightboxPrevious = lightbox.querySelector('[data-lightbox-prev]');
const lightboxNext = lightbox.querySelector('[data-lightbox-next]');
const standaloneLightboxTriggers = [...document.querySelectorAll('[data-lightbox-trigger]')];
const visibleCards = () => galleryCards.filter((card) => !card.classList.contains('is-filtered'));
let activeCard = null;

const setLightboxNavigation = (visible) => {
  lightboxPrevious.hidden = !visible;
  lightboxNext.hidden = !visible;
};

const showCard = (card) => {
  if (!card) return;
  activeCard = card;
  setLightboxNavigation(true);
  const source = card.querySelector('img');
  lightboxImage.src = source.currentSrc || source.src;
  lightboxImage.alt = source.alt;
  lightboxCaption.textContent = card.dataset.caption;
};

const moveLightbox = (direction) => {
  const cards = visibleCards();
  const current = cards.indexOf(activeCard);
  showCard(cards[(current + direction + cards.length) % cards.length]);
};

galleryCards.forEach((card) => {
  card.querySelector('button').addEventListener('click', () => {
    showCard(card);
    lightbox.showModal();
  });
});

standaloneLightboxTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    activeCard = null;
    setLightboxNavigation(false);
    const source = trigger.querySelector('img');
    lightboxImage.src = source.currentSrc || source.src;
    lightboxImage.alt = source.alt;
    lightboxCaption.textContent = trigger.closest('[data-caption]')?.dataset.caption || source.alt;
    lightbox.showModal();
  });
});

lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
lightboxPrevious.addEventListener('click', () => moveLightbox(-1));
lightboxNext.addEventListener('click', () => moveLightbox(1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (event) => {
  if (activeCard && event.key === 'ArrowLeft') moveLightbox(-1);
  if (activeCard && event.key === 'ArrowRight') moveLightbox(1);
});

const enquiryForm = document.querySelector('[data-enquiry-form]');
const formNote = document.querySelector('[data-form-note]');
const submitButton = enquiryForm.querySelector('.submit-button');
const submitButtonLabel = submitButton.querySelector('span');
const packageSelect = enquiryForm.querySelector('#package');

document.querySelectorAll('[data-package]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    packageSelect.value = link.dataset.package;
    document.querySelector('#contact').scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    window.setTimeout(() => packageSelect.focus(), reducedMotion ? 0 : 550);
  });
});

enquiryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;

  const data = new FormData(enquiryForm);
  formNote.classList.remove('is-success', 'is-error');
  formNote.textContent = 'Sending your enquiry…';
  submitButton.disabled = true;
  submitButtonLabel.textContent = 'Sending…';

  try {
    const response = await fetch('https://formsubmit.co/ajax/onestorytellerlondon@gmail.com', {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    });
    const result = await response.json();
    if (!response.ok || result.success === false || result.success === 'false') throw new Error('Submission failed');

    enquiryForm.reset();
    formNote.classList.add('is-success');
    formNote.textContent = 'Thank you — your enquiry has been sent. I will be in touch soon.';
  } catch (error) {
    formNote.classList.add('is-error');
    formNote.textContent = 'The form could not be sent. Please email onestorytellerlondon@gmail.com or use WhatsApp.';
  } finally {
    submitButton.disabled = false;
    submitButtonLabel.textContent = 'Send enquiry';
  }
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
