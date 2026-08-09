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
      const visible = selected === 'all' || card.dataset.category === selected;
      card.classList.toggle('is-filtered', !visible);
    });
  });
});

const lightbox = document.querySelector('[data-lightbox]');
const lightboxImage = lightbox.querySelector('img');
const lightboxCaption = lightbox.querySelector('figcaption');
const visibleCards = () => galleryCards.filter((card) => !card.classList.contains('is-filtered'));
let activeCard = null;

const showCard = (card) => {
  if (!card) return;
  activeCard = card;
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

lightbox.querySelector('[data-lightbox-close]').addEventListener('click', () => lightbox.close());
lightbox.querySelector('[data-lightbox-prev]').addEventListener('click', () => moveLightbox(-1));
lightbox.querySelector('[data-lightbox-next]').addEventListener('click', () => moveLightbox(1));
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) lightbox.close(); });
lightbox.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') moveLightbox(-1);
  if (event.key === 'ArrowRight') moveLightbox(1);
});

const enquiryForm = document.querySelector('[data-enquiry-form]');
const formNote = document.querySelector('[data-form-note]');
enquiryForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!enquiryForm.reportValidity()) return;
  const data = new FormData(enquiryForm);
  const name = data.get('name');
  const subject = `Photography enquiry from ${name}`;
  const body = [
    `Hello One Storyteller,`,
    '',
    `My name is ${name}.`,
    `My email is ${data.get('email')}.`,
    `Photography type: ${data.get('story-type')}.`,
    `Preferred date: ${data.get('date') || 'Flexible / to be discussed'}.`,
    '',
    data.get('message'),
    '',
    'I look forward to hearing from you.'
  ].join('\n');
  formNote.textContent = 'Your email app is opening. Please press send there to complete the enquiry.';
  window.location.href = `mailto:mlopezprieto84@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

document.querySelector('[data-year]').textContent = new Date().getFullYear();
