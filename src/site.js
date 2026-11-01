const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const announce = document.querySelector('#announce');
const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('.main-nav');
const setMenu = open => {
  menu?.setAttribute('aria-expanded', String(open));
  menu?.setAttribute('aria-label', open ? menu.dataset.close : menu.dataset.open);
  nav?.classList.toggle('is-open', open);
};
menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
nav?.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') { setMenu(false); menu.focus(); }
});
document.addEventListener('click', e => { if (!e.target.closest('.header-inner')) setMenu(false); });
window.matchMedia('(min-width: 821px)').addEventListener('change', e => { if(e.matches) setMenu(false); });

document.querySelectorAll('.pat-cat').forEach(button => {
  let timer;
  button.addEventListener('click', () => {
    clearTimeout(timer);
    button.classList.remove('is-patted');
    void button.offsetWidth;
    button.classList.add('is-patted');
    if (announce) announce.textContent = `${button.getAttribute('aria-label')}. ${document.body.dataset.boop}`;
    timer = setTimeout(() => button.classList.remove('is-patted'), reduceMotion ? 1200 : 1800);
  });
});

document.querySelectorAll('[role="tablist"]').forEach(list => {
  const tabs = [...list.querySelectorAll('[role="tab"]')];
  const select = tab => {
    tabs.forEach(t => {
      const active = t === tab;
      t.setAttribute('aria-selected', String(active));
      t.tabIndex = active ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.hidden = !active;
    });
  };
  tabs.forEach((tab,i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = tabs[(i+1)%tabs.length];
      if (e.key === 'ArrowLeft') next = tabs[(i-1+tabs.length)%tabs.length];
      if (e.key === 'Home') next = tabs[0];
      if (e.key === 'End') next = tabs.at(-1);
      if (next) { e.preventDefault(); select(next); next.focus(); }
    });
  });
});

document.querySelectorAll('[data-copy]').forEach(button => {
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      button.classList.add('is-copied');
      if (announce) announce.textContent = button.dataset.copied;
      button.setAttribute('aria-label', button.dataset.copied);
      setTimeout(() => button.classList.remove('is-copied'), 2000);
    } catch {
      if (announce) announce.textContent = button.dataset.failed;
    }
  });
});

// Progressive enhancement: every section stays visible if JavaScript is unavailable.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('has-arrived'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.section-heading,.game-copy,.house-copy,.wardrobe-heading,.quiet-grid,.closing-copy').forEach(el => observer.observe(el));
}
