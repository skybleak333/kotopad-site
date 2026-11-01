import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { config, content, legal } from '../src/content.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(path.join(root, 'public'), out, { recursive: true });
await cp(path.join(root, 'src/style.css'), path.join(out, 'assets/style.css'));
await cp(path.join(root, 'src/site.js'), path.join(out, 'assets/site.js'));

const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const plain = s => s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const route = (lang, page = '') => `${lang === 'en' ? '/en' : ''}/${page ? `${page}/` : ''}`;
const icon = (name, cls = '') => {
  const paths = {
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    paw: '<ellipse cx="12" cy="15" rx="5" ry="4"/><ellipse cx="5" cy="9" rx="2" ry="2.8"/><ellipse cx="10" cy="5" rx="2" ry="2.8"/><ellipse cx="16" cy="6" rx="2" ry="2.8"/><ellipse cx="20" cy="11" rx="2" ry="2.8"/>',
    heart: '<path d="M20.8 4.6a5.6 5.6 0 0 0-7.9 0l-.9.9-.9-.9a5.6 5.6 0 0 0-7.9 7.9L12 21l8.8-8.5a5.6 5.6 0 0 0 0-7.9Z"/>',
    star: '<path d="m12 2 2.8 6 6.6.8-4.8 4.6 1.2 6.6-5.8-3.2-5.8 3.2 1.2-6.6L2.6 8.8l6.6-.8Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M15 8V4H4v11h4"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a18 18 0 0 1 0 18 18 18 0 0 1 0-18Z"/>',
    shield: '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6L12 2Z"/><path d="m8 12 3 3 5-6"/>',
    offline: '<path d="m3 3 18 18M2 8a17 17 0 0 1 4-2M9 5a17 17 0 0 1 13 3M5 12a11 11 0 0 1 5-2M14 10a11 11 0 0 1 5 2M8 16a6 6 0 0 1 8 0M12 20h.01"/>',
  };
  return `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.star}</svg>`;
};
const cat = (key, extra = '') => `<img src="/assets/cats/${key}.webp" alt="" width="600" height="600" ${extra}>`;
const spark = cls => `<span class="spark ${cls}" aria-hidden="true">✦</span>`;
const faq = items => items.map(([q,a]) => `<details class="faq-item"><summary>${esc(q)}${icon('plus')}</summary><div class="faq-answer"><p>${esc(a).replace('reportaproblem.apple.com', '<a href="https://reportaproblem.apple.com/">reportaproblem.apple.com</a>')}</p></div></details>`).join('');
const mail = (lang, subject = '') => `mailto:${config.email}?subject=${encodeURIComponent(subject || (lang === 'ru' ? 'Котопад — поддержка' : 'Meowfall support'))}`;

function header(lang, page) {
  const t = content[lang];
  const home = route(lang);
  return `<a class="skip-link" href="#main">${t.skip}</a>
  <header class="site-header"><div class="header-inner wrap">
    <a class="brand" href="${home}" aria-label="${t.brand} — ${lang === 'ru' ? 'на главную' : 'home'}"><img src="/assets/icon.webp" width="46" height="46" alt=""><span>${t.brand}<small>kotopad.fun</small></span></a>
    <nav class="main-nav" id="navigation" aria-label="${lang === 'ru' ? 'Основная навигация' : 'Main navigation'}">
      <a href="${home}#game">${t.nav[0]}</a><a href="${home}#house">${t.nav[1]}</a><a href="${route(lang,'support')}" ${page === 'support' ? 'aria-current="page"' : ''}>${t.nav[2]}</a>
    </nav>
    <div class="header-actions"><a class="language-link" href="${route(lang === 'ru' ? 'en' : 'ru', page === '404' ? '' : page)}" lang="${lang === 'ru' ? 'en' : 'ru'}" hreflang="${lang === 'ru' ? 'en' : 'ru'}" aria-label="${lang === 'ru' ? 'Read this page in English' : 'Читать эту страницу по-русски'}">${icon('globe')}${t.otherLanguage}</a>
    <span class="release-pill"><span></span>${t.coming}</span>
    <button class="menu-toggle" aria-controls="navigation" aria-expanded="false" aria-label="${t.menu}" data-open="${t.menu}" data-close="${t.close}"><span></span><span></span></button></div>
  </div></header>`;
}
function footer(lang) {
  const t = content[lang];
  return `<footer class="site-footer"><div class="wrap footer-top"><div><a class="brand footer-brand" href="${route(lang)}">${icon('paw')}<span>${t.brand}</span></a><p>${t.footerCopy}</p></div><nav aria-label="${lang === 'ru' ? 'Документы и поддержка' : 'Support and legal'}">${['support','privacy','terms','data'].map((p,i) => `<a href="${route(lang,p)}">${t.footerLinks[i]}</a>`).join('')}</nav><a class="footer-email" href="${mail(lang)}">${config.email}${icon('arrow')}</a></div><div class="wrap footer-bottom"><span>© 2026 Котопад / Meowfall</span><span>${t.footerSmall}${icon('heart')}</span><a href="${route(lang === 'ru' ? 'en' : 'ru')}" lang="${lang === 'ru' ? 'en' : 'ru'}">${lang === 'ru' ? 'English version' : 'Русская версия'}</a></div></footer>`;
}
function layout(lang, page, body, title, description) {
  const canonical = config.origin + route(lang, page === '404' ? '' : page);
  const social = config.origin + '/assets/social.png';
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#fff8ed"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="color-scheme" content="light">${page === '404' ? '<meta name="robots" content="noindex">' : ''}<link rel="canonical" href="${canonical}"><link rel="alternate" hreflang="ru" href="${config.origin + route('ru', page === '404' ? '' : page)}"><link rel="alternate" hreflang="en" href="${config.origin + route('en', page === '404' ? '' : page)}"><link rel="alternate" hreflang="x-default" href="${config.origin + route('ru', page === '404' ? '' : page)}"><meta property="og:type" content="website"><meta property="og:site_name" content="Котопад / Meowfall"><meta property="og:locale" content="${lang === 'ru' ? 'ru_RU' : 'en_US'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${canonical}"><meta property="og:image" content="${social}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image"><link rel="icon" type="image/png" href="/assets/apple-touch-icon.png"><link rel="apple-touch-icon" href="/assets/apple-touch-icon.png"><link rel="stylesheet" href="/assets/fonts/fonts.css"><link rel="stylesheet" href="/assets/style.css"><script src="/assets/site.js" defer></script></head><body data-page="${page || 'home'}" data-boop="${tBoop(lang)}">${header(lang,page)}${body}${footer(lang)}<div id="announce" class="sr-only" role="status" aria-live="polite"></div></body></html>`;
}
const tBoop = lang => esc(content[lang].boop);

function home(lang) {
  const t = content[lang];
  const heroCats = [['ginger-chef','hero-ginger',1],['smokey','hero-smokey',2],['siam-flower','hero-siam',5],['crumb-bow','hero-crumb',0],['peach-sleepy','hero-peach',6]];
  return `<main id="main">
    <section class="hero wrap" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow">${t.eyebrow}</p><h1 id="hero-title">${t.hero}</h1><p class="hero-intro">${t.intro}</p><div class="hero-buttons"><a class="button button-primary" href="#family">${t.meet}${icon('arrow')}</a><a class="text-link" href="#game">${t.how}<span>↘</span></a></div><ul class="hero-notes">${t.heroNotes.map(n=>`<li>${icon('check')}${n}</li>`).join('')}</ul></div>
    <div class="hero-art"><div class="hero-halo" aria-hidden="true"></div>${spark('spark-one')}${spark('spark-two')}${spark('spark-three')}<div class="cozy-seal" aria-hidden="true">100%<span>cozy</span></div><div class="cat-box"><div class="box-back"></div>${heroCats.map(([key,cls,i])=>`<button class="pat-cat hero-cat ${cls}" aria-label="${t.catLabel}: ${t.catNames[i]}">${cat(key,'fetchpriority="high"')}<span class="cat-bubble">${t.boop}</span></button>`).join('')}<div class="box-front" aria-hidden="true"><span>${icon('heart')}${t.box}</span><i></i></div></div><p class="pat-hint">${icon('heart')}${t.boopHint}<span>↗</span></p></div></section>
    <div class="ribbon" aria-hidden="true"><div>${[...t.ticker,...t.ticker].map(n=>`<span>${n}</span>${icon('paw')}`).join('')}</div></div>
    <section class="family-section section-space" id="family"><div class="wrap"><div class="section-heading"><div><p class="eyebrow">${t.familyEyebrow}</p><h2>${t.familyTitle}</h2></div><p>${t.familyCopy}</p></div><div class="cat-parade" aria-label="${lang==='ru'?'Котики в порядке слияния':'Cats in merge order'}">${['crumb','ginger','smokey','patches','coal','siam','peach','barsik','tigress','lordFluff','kingPurr'].map((key,i)=>`<button class="pat-cat parade-cat" aria-label="${t.catLabel}: ${t.catNames[i]}"><span class="cat-level">${String(i+1).padStart(2,'0')}</span>${cat(key,'loading="lazy"')}<span class="cat-name">${t.catNames[i]}</span><span class="cat-bubble">${t.boop}</span></button>`).join('')}</div><div class="parade-footer"><span>01 — 11</span><div class="parade-line"></div><span>${lang==='ru'?'Листай, чтобы познакомиться со всеми':'Scroll to meet everyone'} →</span></div></div></section>
    <section class="game-section section-space" id="game"><div class="wrap game-grid"><div class="game-copy"><p class="eyebrow">${t.storyEyebrow}</p><h2>${t.storyTitle}</h2><p class="body-large">${t.storyCopy}</p><ol class="play-steps">${t.storySteps.map(([n,title,desc])=>`<li><span>${n}</span><div><h3>${title}</h3><p>${desc}</p></div></li>`).join('')}</ol></div><div class="mode-showcase"><div class="mode-tabs" role="tablist" aria-label="${lang==='ru'?'Игровые режимы':'Game modes'}">${t.modes.map((m,i)=>`<button role="tab" id="tab-${m.id}" aria-controls="panel-${m.id}" aria-selected="${i===0}" tabindex="${i===0?0:-1}">${m.name}</button>`).join('')}</div>${t.modes.map((m,i)=>`<div class="mode-panel" id="panel-${m.id}" role="tabpanel" aria-labelledby="tab-${m.id}" ${i?'hidden':''}><div class="phone-shell"><img src="/assets/screens/${lang}-${m.image}.webp" alt="${m.alt}" width="660" height="1435" loading="lazy"></div><div class="mode-caption"><h3>${m.title}</h3><p>${m.text}</p></div></div>`).join('')}<p class="screenshot-note">${icon('check')}${t.screenshotNote}</p>${spark('game-spark')}</div></div></section>
    <section class="house-section section-space" id="house"><div class="wrap house-grid"><div class="house-visual"><div class="room-window"><img src="/assets/screens/${lang}-2-room.webp" alt="${lang==='ru'?'Настоящая комната Рыжика с мебелью в Котодоме':'Ginger’s actual furnished room in the Cat House'}" width="660" height="1435" loading="lazy"></div><span class="house-sticker">${icon('heart')}${t.houseSticker}</span>${spark('house-spark')}</div><div class="house-copy"><p class="eyebrow">${t.houseEyebrow}</p><h2>${t.houseTitle}</h2><p class="body-large">${t.houseCopy}</p><div class="house-stats">${t.houseStats.map(([n,l])=>`<div><strong>${n}</strong><span>${l}</span></div>`).join('')}</div></div></div></section>
    <section class="wardrobe-section section-space"><div class="wrap"><div class="wardrobe-heading"><p class="eyebrow">${t.wardrobeEyebrow}</p><h2>${t.wardrobeTitle}</h2><p class="body-large">${t.wardrobeCopy}</p></div><div class="outfit-line">${[['crumb-bow',t.catNames[0]],['ginger-chef',t.catNames[1]],['siam-flower',t.catNames[5]],['coal-witch',t.catNames[4]]].map(([key,name],i)=>`<button class="pat-cat outfit-cat outfit-${i}" aria-label="${t.catLabel}: ${name}">${cat(key,'loading="lazy"')}<span class="cat-bubble">${t.boop}</span></button>`).join('')}</div></div></section>
    <section class="quiet-section"><div class="wrap quiet-grid"><h2>${t.quietTitle}${icon('heart')}</h2><div class="quiet-items">${t.quietItems.map(([title,desc],i)=>`<div>${icon(['shield','offline','paw'][i])}<h3>${title}</h3><p>${desc}</p></div>`).join('')}</div></div></section>
    <section class="faq-section section-space wrap"><div><p class="eyebrow">${t.faqEyebrow}</p><h2>${t.faqTitle}</h2><a class="text-link" href="${route(lang,'support')}">${t.moreHelp}${icon('arrow')}</a></div><div class="faq-list">${faq(t.faq)}</div></section>
    <section class="closing-section wrap"><div class="closing-copy"><p class="eyebrow">${t.endEyebrow}</p><h2>${t.endTitle}</h2><p>${t.endCopy}</p><span class="coming-badge">${icon('paw')}<span>${t.coming}<small>iPhone & iPad · iOS 17+</small></span></span><a class="text-link" href="${route(lang,'support')}">${t.endHelp}${icon('arrow')}</a></div><div class="closing-cat">${cat('ginger-chef','loading="lazy"')}${cat('crumb-bow','loading="lazy"')}${spark('closing-spark')}</div></section>
  </main>`;
}
function support(lang) {
  const t = content[lang];
  return `<main id="main" class="support-main"><section class="document-hero wrap"><a class="back-link" href="${route(lang)}">← ${t.back}</a><p class="eyebrow">${t.footerLinks[0]}</p><h1>${t.supportTitle}</h1><p class="body-large">${t.supportIntro}</p></section><section class="wrap support-grid"><div class="contact-card">${icon('mail')}<p class="eyebrow">${t.supportEmailNote}</p><a class="contact-email" href="${mail(lang)}">${config.email}</a><div class="contact-actions"><a class="button button-primary" href="${mail(lang)}">${t.emailAction}${icon('arrow')}</a><button class="copy-button" data-copy="${config.email}" data-copied="${t.copied}" data-failed="${t.copyFailed}" aria-label="${t.copyEmail}" title="${t.copyEmail}">${icon('copy')}</button></div><p class="contact-privacy">${t.supportPrivacy} <a href="${route(lang,'privacy')}">${t.footerLinks[1]} →</a></p></div><div class="include-card"><h2>${t.includeTitle}</h2><ul>${t.include.map(s=>`<li>${icon('check')}${s}</li>`).join('')}</ul>${cat('crumb-bow','loading="lazy"')}</div></section><section class="wrap support-faq section-space"><p class="eyebrow">FAQ</p><h2>${t.supportFaqTitle}</h2><div class="faq-list">${faq([...t.faq,...t.supportExtra])}</div><p class="data-note">${icon('shield')}<a href="${route(lang,'data')}">${t.footerLinks[3]} →</a></p></section></main>`;
}
function document(lang, page) {
  const t = content[lang], d = legal[lang][page];
  return `<main id="main"><section class="document-hero wrap"><a class="back-link" href="${route(lang)}">← ${t.back}</a><p class="eyebrow">${t.footerLinks[['privacy','terms','data'].indexOf(page)+1]}</p><h1>${d.title}</h1><p class="body-large">${d.intro}</p></section><div class="wrap document-layout"><aside class="document-toc"><p>${t.contents}</p><nav aria-label="${t.contents}">${d.sections.map(([id,title])=>`<a href="#${id}">${title}</a>`).join('')}</nav><a class="document-contact" href="${route(lang,'support')}">${icon('mail')}${t.nav[2]} →</a></aside><article class="document-content"><div class="document-summary">${icon('shield')}<p>${d.summary}</p></div>${d.sections.map(([id,title,html])=>`<section id="${id}"><h2>${title}</h2>${html}</section>`).join('')}<div class="document-end"><p>${t.revised}</p><a class="text-link" href="${route(lang,'support')}">${t.endHelp}${icon('arrow')}</a></div></article></div></main>`;
}
const urls = [];
for (const lang of ['ru','en']) {
  for (const page of ['', 'support','privacy','terms','data']) {
    const t = content[lang];
    const name = page === '' ? t.brand : page === 'support' ? t.footerLinks[0] : t.footerLinks[['','support','privacy','terms','data'].indexOf(page)-1];
    const title = page === '' ? `${t.brand} — ${lang==='ru'?'маленькая коробка, большая кошачья семья':'a little box, a whole family of cats'}` : `${name} — ${t.brand}`;
    const desc = page === '' ? t.meta : page === 'support' ? t.supportIntro : legal[lang][page].intro;
    const html = layout(lang,page,page===''?home(lang):page==='support'?support(lang):document(lang,page),title,desc);
    const target = path.join(out, route(lang,page), 'index.html');
    await mkdir(path.dirname(target),{recursive:true}); await writeFile(target,html);
    urls.push(config.origin + route(lang,page));
  }
}
await writeFile(path.join(out,'404.html'),layout('ru','404',`<main id="main" class="not-found wrap">${cat('crumb-bow')}<p class="eyebrow">404 · LOST CAT</p><h1>${content.ru.notFound}</h1><p>${content.ru.notFoundCopy}</p><a class="button button-primary" href="/">${content.ru.back}${icon('arrow')}</a></main>`,'404 — Котопад',content.ru.notFoundCopy));
await writeFile(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\nSitemap: ${config.origin}/sitemap.xml\n`);
await writeFile(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url=>`<url><loc>${url}</loc><lastmod>${config.revision}</lastmod></url>`).join('')}</urlset>`);
for (const page of ['privacy','support','terms','data']) {
  await writeFile(path.join(out,`${page}.html`),`<!doctype html><html lang="ru"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/${page}/"><title>Котопад</title><link rel="canonical" href="${config.origin}/${page}/"><a href="/${page}/">${content.ru.brand} — ${page}</a></html>`);
}
console.log(`Built ${urls.length} localized pages, compatibility links, sitemap and 404 in dist/.`);
