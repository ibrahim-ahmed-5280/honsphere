const pages = [
  ['index.html', 'Home'], ['about.html', 'About'], ['services.html', 'Services'],
  ['education.html', 'Study abroad'], ['insights.html', 'Insights'],
  ['contact.html', 'Contact']
];

const current = location.pathname.split('/').pop() || 'index.html';
const currentPage = current.replace('.html', '');
const servicePages = ['services.html', 'consulting.html', 'training.html', 'international-education.html', 'climate-environment.html', 'agriculture-food-security.html', 'development-infrastructure.html', 'business-economics.html', 'digital-systems-technology.html', 'built-environment-architecture.html'];
const serviceLinks = [
  ['consulting.html', 'Research & Advisory'],
  ['training.html', 'Research Training'],
  ['international-education.html', 'International Student Recruitment']
];
const serviceSectionIsCurrent = servicePages.includes(current);
const educationSectionIsCurrent = current === 'education.html' || current === 'university-detail.html';
document.body.dataset.page = currentPage;

const icon = (name, extra = '') => `<span class="material-symbols-outlined ${extra}" aria-hidden="true">${name}</span>`;

const header = document.getElementById('site-header');
if (header) {
  header.innerHTML = `<div class="hs-container header-inner">
    <a class="brand" href="index.html" aria-label="HornSphere Consulting home"><img src="brand/HS Logo-13.png" alt="HornSphere Consulting" width="218" height="59"></a>
    <nav class="desktop-nav" aria-label="Main navigation">${pages.slice(0, 5).map(([url, label]) => url === 'services.html' ? `<div class="nav-services"><a href="services.html" ${current === url ? 'aria-current="page"' : serviceSectionIsCurrent ? 'class="is-current"' : ''}>Services</a><button class="nav-services-toggle" type="button" aria-label="Show service pages" aria-controls="desktop-services-menu" aria-expanded="false">${icon('expand_more')}</button><div class="services-menu" id="desktop-services-menu" hidden>${serviceLinks.map(([href, name]) => `<a href="${href}" ${current === href ? 'aria-current="page"' : ''}>${name}${icon('arrow_outward')}</a>`).join('')}</div></div>` : `<a href="${url}" ${(current === url || (url === 'education.html' && educationSectionIsCurrent)) ? 'aria-current="page"' : ''}>${label}</a>`).join('')}</nav>
    <a class="header-action" href="contact.html#contact-form">Start a conversation ${icon('arrow_outward')}</a>
    <button class="menu-toggle" type="button" aria-label="Open menu" aria-controls="mobile-nav" aria-expanded="false">${icon('menu')}</button>
  </div><nav id="mobile-nav" class="mobile-nav" aria-label="Mobile navigation" hidden>${pages.map(([url, label]) => url === 'services.html' ? `<div class="mobile-services"><div class="mobile-services-row"><a href="services.html" ${current === url ? 'aria-current="page"' : ''}>Services</a><button class="mobile-services-toggle" type="button" aria-label="Show service pages" aria-controls="mobile-services-menu" aria-expanded="false">${icon('expand_more')}</button></div><div class="mobile-services-menu" id="mobile-services-menu" hidden>${serviceLinks.map(([href, name]) => `<a href="${href}" ${current === href ? 'aria-current="page"' : ''}>${name}${icon('arrow_outward')}</a>`).join('')}</div></div>` : `<a href="${url}" ${(current === url || (url === 'education.html' && educationSectionIsCurrent)) ? 'aria-current="page"' : ''}>${label}${icon('arrow_outward')}</a>`).join('')}</nav>`;

  const toggle = header.querySelector('.menu-toggle');
  const mobile = header.querySelector('.mobile-nav');
  const desktopServicesToggle = header.querySelector('.nav-services-toggle');
  const desktopServicesMenu = header.querySelector('.services-menu');
  const mobileServicesToggle = header.querySelector('.mobile-services-toggle');
  const mobileServicesMenu = header.querySelector('.mobile-services-menu');
  // One Services control opens each menu; the overview remains inside the menu.
  const addOverviewLink = menu => {
    const link = document.createElement('a');
    link.href = 'services.html';
    link.textContent = 'All services';
    if (current === 'services.html') link.setAttribute('aria-current', 'page');
    menu.prepend(link);
  };
  desktopServicesToggle.prepend(document.createTextNode('Services'));
  mobileServicesToggle.prepend(document.createTextNode('Services'));
  desktopServicesToggle.removeAttribute('aria-label');
  mobileServicesToggle.removeAttribute('aria-label');
  desktopServicesToggle.classList.toggle('is-current', serviceSectionIsCurrent);
  mobileServicesToggle.classList.toggle('is-current', serviceSectionIsCurrent);
  header.querySelector('.nav-services > a').remove();
  header.querySelector('.mobile-services-row > a').remove();
  addOverviewLink(desktopServicesMenu);
  addOverviewLink(mobileServicesMenu);
  mobile.hidden = false;
  mobile.inert = true;
  mobile.setAttribute('aria-hidden', 'true');
  const setServicesMenu = (button, menu, open) => {
    menu.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  desktopServicesToggle.addEventListener('click', () => setServicesMenu(desktopServicesToggle, desktopServicesMenu, desktopServicesMenu.hidden));
  mobileServicesToggle.addEventListener('click', () => setServicesMenu(mobileServicesToggle, mobileServicesMenu, mobileServicesMenu.hidden));
  const setMenu = open => {
    if (open) header.style.setProperty('--mobile-nav-top', `${header.getBoundingClientRect().bottom}px`);
    mobile.classList.toggle('open', open);
    mobile.inert = !open;
    mobile.setAttribute('aria-hidden', String(!open));
    document.body.classList.toggle('mobile-menu-open', open);
    if (!open) setServicesMenu(mobileServicesToggle, mobileServicesMenu, false);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    toggle.querySelector('.material-symbols-outlined').textContent = open ? 'close' : 'menu';
  };
  toggle.addEventListener('click', () => setMenu(!mobile.classList.contains('open')));
  mobile.addEventListener('click', event => {
    if (event.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !desktopServicesMenu.hidden) {
      setServicesMenu(desktopServicesToggle, desktopServicesMenu, false);
      desktopServicesToggle.focus();
    }
    if (event.key === 'Escape' && mobile.classList.contains('open')) {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!desktopServicesMenu.hidden && !header.querySelector('.nav-services').contains(event.target)) setServicesMenu(desktopServicesToggle, desktopServicesMenu, false);
    if (mobile.classList.contains('open') && !header.contains(event.target)) setMenu(false);
  });
  window.addEventListener('resize', () => {
    if (!mobile.classList.contains('open')) return;
    if (window.innerWidth > 820) setMenu(false);
    else header.style.setProperty('--mobile-nav-top', `${header.getBoundingClientRect().bottom}px`);
  });
}

const footer = document.getElementById('site-footer');
if (footer) {
  footer.innerHTML = `<div class="hs-container footer-grid">
    <div class="footer-lead"><a class="footer-logo" href="index.html"><img src="brand/icon logo.png" alt="" width="46" height="46"><span>HornSphere</span></a><p>Consulting for a Brighter Africa.</p><span>Research-led advisory, capacity development and international student recruitment from Mogadishu.</span></div>
    <div class="footer-col"><h3>Company</h3><a href="about.html">About us</a><a href="about.html#experience">Experience</a><a href="insights.html">Insights</a><a href="contact.html#contact-form">Contact</a></div>
    <div class="footer-col"><h3>Services</h3><a href="services.html">All services</a><a href="consulting.html">Research &amp; advisory</a><a href="training.html">Research training</a><a href="international-education.html">International student recruitment</a></div>
    <div class="footer-col"><h3>Education</h3><a href="education.html">Find a university</a><a href="international-education.html#university-partnerships">For universities</a><a href="contact.html?route=student#contact-form">Talk to an advisor</a></div>
  </div><div class="hs-container footer-bottom"><span>&copy; ${new Date().getFullYear()} HornSphere Consulting &middot; Hodan District, Mogadishu, Somalia</span><span><a href="mailto:office@hornsphere.com">office@hornsphere.com</a><a href="tel:+252614809010">+252 61 4809010</a></span></div>`;
}

// The number matches the shared header and footer contact number.
const whatsappIcon = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3.5a12.5 12.5 0 0 0-10.9 18.6L3.5 28.5l6.5-1.7A12.5 12.5 0 1 0 16 3.5Z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/><path d="M11.2 10.1c-.5-.4-1.1-.3-1.5.2-.8.9-1.1 2-.7 3.4 1.1 3.7 4.4 7.1 8.2 8.2 1.3.4 2.5.1 3.4-.7.5-.4.6-1 .2-1.5l-1.6-1.8c-.4-.4-.9-.5-1.4-.2l-1.2.8a10.3 10.3 0 0 1-4.1-4.1l.8-1.2c.3-.5.2-1-.2-1.4l-1.9-1.7Z" fill="currentColor"/></svg>`;
document.body.insertAdjacentHTML('beforeend', `
  <div class="whatsapp-widget">
    <section class="whatsapp-panel" id="whatsapp-panel" role="dialog" aria-labelledby="whatsapp-title" aria-hidden="true" inert>
      <div class="whatsapp-panel-header">
        <span class="whatsapp-panel-avatar"><img src="brand/icon logo.png" alt="" width="37" height="37"></span>
        <div class="whatsapp-panel-heading"><strong id="whatsapp-title">HornSphere Consulting</strong><span>How can we help?</span></div>
        <button class="whatsapp-panel-close" type="button" aria-label="Close chat">${icon('close')}</button>
      </div>
      <div class="whatsapp-panel-body">
        <div class="whatsapp-greeting"><strong>HornSphere Consulting</strong><p>Salaam! Welcome to HornSphere. Tell us what you need help with.</p></div>
      </div>
      <form class="whatsapp-composer" action="https://wa.me/252614809010" method="get" target="_blank" rel="noopener noreferrer">
        <label class="sr-only" for="whatsapp-message">Your message</label>
        <input id="whatsapp-message" name="text" type="text" placeholder="Type a message..." maxlength="500" required>
        <button type="submit" aria-label="Send message in WhatsApp">${icon('send')}</button>
      </form>
      <p class="whatsapp-handoff">Send continues in WhatsApp.</p>
    </section>
    <button class="whatsapp-float" type="button" aria-controls="whatsapp-panel" aria-expanded="false" aria-label="Open WhatsApp chat">${whatsappIcon}<span>WhatsApp</span></button>
  </div>`);
const whatsappWidget = document.querySelector('.whatsapp-widget');
const whatsappPanel = whatsappWidget.querySelector('.whatsapp-panel');
const whatsappToggle = whatsappWidget.querySelector('.whatsapp-float');
const whatsappMessage = whatsappWidget.querySelector('#whatsapp-message');
const setWhatsAppOpen = (open, returnFocus = false) => {
  whatsappWidget.classList.toggle('is-open', open);
  whatsappPanel.classList.toggle('is-open', open);
  whatsappPanel.inert = !open;
  whatsappPanel.setAttribute('aria-hidden', String(!open));
  whatsappToggle.setAttribute('aria-expanded', String(open));
  whatsappToggle.setAttribute('aria-label', open ? 'Close WhatsApp chat' : 'Open WhatsApp chat');
  if (open) whatsappMessage.focus();
  else if (returnFocus) whatsappToggle.focus();
};
whatsappToggle.addEventListener('click', () => setWhatsAppOpen(true));
whatsappWidget.querySelector('.whatsapp-panel-close').addEventListener('click', () => setWhatsAppOpen(false, true));
header?.querySelector('.menu-toggle')?.addEventListener('click', () => {
  if (whatsappWidget.classList.contains('is-open')) setWhatsAppOpen(false);
});
whatsappWidget.querySelector('.whatsapp-composer').addEventListener('submit', event => {
  whatsappMessage.value = whatsappMessage.value.trim();
  if (!whatsappMessage.value) {
    event.preventDefault();
    whatsappMessage.focus();
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && whatsappWidget.classList.contains('is-open')) setWhatsAppOpen(false, true);
});
document.addEventListener('click', event => {
  if (whatsappWidget.classList.contains('is-open') && !whatsappWidget.contains(event.target)) setWhatsAppOpen(false);
});

// These sample records are illustrative and must be verified with each institution.
const universities = [
  {id:'apu', name:'Asia Pacific University', short:'APU', website:'https://www.apu.edu.my/', location:'Kuala Lumpur', type:'Private', levels:['Foundation','Diploma',"Bachelor's","Master's"], fields:['Computer Science','Business','Engineering'], fee:'From $9,800', feeFrom:9800},
  {id:'upm', name:'Universiti Putra Malaysia', short:'UPM', website:'https://upm.edu.my/', location:'Selangor', type:'Public', levels:["Bachelor's","Master's",'PhD'], fields:['Public Health','Health Sciences','Business'], fee:'From $5,200', feeFrom:5200},
  {id:'unikl', name:'Universiti Kuala Lumpur', short:'UniKL', website:'https://www.unikl.edu.my/', location:'Kuala Lumpur', type:'Private', levels:['Diploma',"Bachelor's","Master's"], fields:['Engineering','Business','Computer Science'], fee:'From $7,500', feeFrom:7500},
  {id:'mahsa', name:'MAHSA University', short:'MAHSA', website:'https://mahsa.edu.my/', location:'Selangor', type:'Private', levels:['Foundation','Diploma',"Bachelor's"], fields:['Health Sciences','Public Health'], fee:'From $11,000', feeFrom:11000},
  {id:'city-u', name:'City University Malaysia', short:'City U', website:'https://city.edu.my/', location:'Selangor', type:'Private', levels:['Diploma',"Bachelor's","Master's"], fields:['Business','Engineering'], fee:'From $6,900', feeFrom:6900},
  {id:'msu', name:'Management & Science University', short:'MSU', website:'https://www.msu.edu.my/', location:'Selangor', type:'Private', levels:['Foundation',"Bachelor's","Master's",'PhD'], fields:['Business','Health Sciences','Computer Science'], fee:'From $8,400', feeFrom:8400},
  {id:'uniten', name:'Universiti Tenaga Nasional', short:'UNITEN', website:'https://www.uniten.edu.my/', location:'Putrajaya', type:'Private', levels:["Bachelor's","Master's",'PhD'], fields:['Engineering','Computer Science','Business'], fee:'From $9,000', feeFrom:9000}
];

const universityDetailUrl = university => `university-detail.html?university=${university.id}`;
const universityGuidanceUrl = university => `contact.html?route=student&university=${university.id}#contact-form`;
const universityLogo = university => `<span class="uni-logo-fallback" aria-hidden="true" hidden>${university.short}</span><img class="uni-logo-img" src="https://www.google.com/s2/favicons?domain=${new URL(university.website).hostname}&sz=128" alt="" width="52" height="52" loading="lazy" decoding="async">`;
document.addEventListener('error', event => {
  if (!event.target.matches('.uni-logo-img')) return;
  const fallback = event.target.previousElementSibling;
  event.target.remove();
  if (fallback) fallback.hidden = false;
}, true);

const searchForm = document.getElementById('university-search');
if (searchForm) {
  const results = document.getElementById('university-results');
  const count = document.getElementById('result-count');
  const selects = [...searchForm.querySelectorAll('select')];
  const render = list => {
    count.textContent = `${list.length} study ${list.length === 1 ? 'option' : 'options'} shown`;
    results.innerHTML = list.length ? list.map(u => `<article class="university-card">
      <div class="uni-top"><a class="uni-logo-link" href="${universityDetailUrl(u)}" aria-label="View ${u.name}">${universityLogo(u)}</a><span class="uni-type">${u.type}</span></div>
      <h3><a href="${universityDetailUrl(u)}">${u.name}</a></h3><p class="location">${u.location}, Malaysia</p>
      <div class="uni-tags">${u.levels.slice(0,3).map(level => `<span>${level}</span>`).join('')}</div>
      <div class="uni-fee"><strong>${u.fee}</strong><span>Indicative yearly tuition · verify</span></div>
      <div class="uni-actions"><a class="btn uni-view" href="${universityDetailUrl(u)}">View details</a><a class="btn btn-navy" href="${universityGuidanceUrl(u)}">Get guidance</a></div>
    </article>`).join('') : `<div class="no-results">${icon('search_off')}<h3>No sample matches these filters.</h3><p>Adjust your filters or <a href="contact.html?route=student#contact-form">ask an advisor</a> about more options.</p></div>`;
  };
  const filter = () => {
    const {level, field, location, budget} = searchForm.elements;
    const max = Number(budget.value);
    render(universities.filter(u => (!level.value || u.levels.includes(level.value)) && (!field.value || u.fields.includes(field.value)) && (!location.value || u.location === location.value) && (!max || u.feeFrom <= max)));
  };
  searchForm.addEventListener('submit', event => { event.preventDefault(); filter(); });
  searchForm.addEventListener('reset', () => requestAnimationFrame(filter));
  render(universities);
}

const requestedUniversityId = new URLSearchParams(location.search).get('university');
const requestedUniversity = universities.find(university => university.id === requestedUniversityId);
const detail = document.getElementById('university-detail');
if (detail) {
  if (requestedUniversity) {
    const u = requestedUniversity;
    document.title = `${u.name} | International Student Recruitment | HornSphere`;
    detail.innerHTML = `<a class="detail-back" href="education.html#search">${icon('arrow_back')} Back to study options</a>
      <div class="university-detail-heading"><span class="uni-logo-link uni-detail-logo">${universityLogo(u)}</span><div><span class="eyebrow">International student recruitment</span><h1>${u.name}</h1><p>${u.location}, Malaysia</p></div><span class="uni-type">${u.type} university</span></div>
      <p class="detail-disclaimer">These details are indicative. Confirm current programmes, fees and requirements with an advisor or the university before applying.</p>
      <p class="detail-intro">Explore ${u.levels.join(', ')} study options in ${u.fields.join(', ')}. HornSphere can help you check which programmes suit your goals and what to prepare for an application.</p>
      <div class="detail-facts"><div><span>Qualification levels</span><p>${u.levels.join(' · ')}</p></div><div><span>Fields of study</span><p>${u.fields.join(' · ')}</p></div><div><span>Indicative tuition</span><p>${u.fee} per year. Confirm the fee for your programme.</p></div><div><span>Intakes</span><p>Dates vary by programme. Ask for the current schedule.</p></div><div><span>Entry &amp; English requirements</span><p>Requirements vary by programme. We can help check your eligibility.</p></div><div><span>How HornSphere helps</span><p>Programme choice, eligibility, application documents and next steps.</p></div></div>
      <div class="detail-actions"><a class="btn btn-navy" href="${universityGuidanceUrl(u)}">Get guidance ${icon('arrow_forward')}</a><a class="btn detail-official" href="${u.website}" target="_blank" rel="noopener noreferrer">Official website ${icon('arrow_outward')}</a></div>`;
  } else {
    document.title = 'Study option not found | HornSphere';
    detail.innerHTML = `<a class="detail-back" href="education.html#search">${icon('arrow_back')} Back to study options</a><h1>Study option not found.</h1><p>Choose a university from the study options list to see its details.</p>`;
  }
}

const route = new URLSearchParams(location.search).get('route');
const selectedRoute = route && document.getElementById(route);
if (selectedRoute) {
  const subjectSelect = document.getElementById('contact-subject');
  const subject = selectedRoute.dataset.contactSubject;
  if (subjectSelect && subject) subjectSelect.value = subject;
  selectedRoute.setAttribute('aria-pressed', 'true');
}

if (current === 'contact.html' && requestedUniversity) {
  const message = document.querySelector('#contact-form-fields textarea[name="message"]');
  if (message && !message.value) message.value = `I would like guidance about ${requestedUniversity.name}. Please help me check suitable programmes, current tuition and entry requirements.`;
}

const contactForm = document.getElementById('contact-form-fields');
if (contactForm) {
  const subjectSelect = contactForm.elements.subject;
  const subjectCards = [...document.querySelectorAll('[data-contact-subject]')];
  const status = document.getElementById('contact-route-status');
  const setSubject = value => {
    if (!subjectSelect || ![...subjectSelect.options].some(option => option.value === value)) return;
    subjectSelect.value = value;
    subjectCards.forEach(card => card.setAttribute('aria-pressed', String(card.dataset.contactSubject === value)));
    const label = subjectSelect.selectedOptions[0]?.textContent;
    if (status && label) status.textContent = `Selected enquiry: ${label}`;
  };

  const subjectFromUrl = new URLSearchParams(location.search).get('subject');
  if (subjectFromUrl) setSubject(subjectFromUrl);
  else if (selectedRoute?.dataset.contactSubject) setSubject(selectedRoute.dataset.contactSubject);

  subjectCards.forEach(card => card.addEventListener('click', () => {
    setSubject(card.dataset.contactSubject);
    document.getElementById('contact-form')?.scrollIntoView({behavior:'smooth', block:'start'});
    subjectSelect?.focus({preventScroll:true});
  }));

  contactForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const label = subjectSelect.selectedOptions[0]?.textContent || 'General';
    const body = [
      `Name: ${data.get('name')}`,
      `Email: ${data.get('email')}`,
      `Organisation: ${data.get('organisation') || 'Not provided'}`,
      `Subject: ${label}`,
      '',
      'Message:',
      data.get('message')
    ].join('\n');
    const mailto = `mailto:office@hornsphere.com?subject=${encodeURIComponent(`${label} enquiry`)}&body=${encodeURIComponent(body)}`;
    if (status) status.textContent = 'Opening your email app with this message ready to send.';
    location.href = mailto;
  });
}
