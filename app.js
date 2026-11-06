/* MACNICA WMS demo — open index.html directly, with no installation. */
(() => {
  'use strict';
  const data = window.WMSData;
  const app = document.getElementById('app');
  const themes = ['teal', 'cobalt', 'slate-dark'];
  function initialTheme() {
    try {
      const saved = window.localStorage.getItem('wms-demo-theme');
      if (themes.includes(saved)) return saved;
    } catch { /* Storage may be disabled for local files. */ }
    return themes.includes(document.documentElement.dataset.theme) ? document.documentElement.dataset.theme : 'teal';
  }
  const state = {
    signedIn: false, environment: 'UAT', route: 'login', theme: initialTheme(), dayOffset: 0, selectedModule: 2,
    filters: { ...data.defaults }, columnFilters: {}, sort: null,
    visible: new Set(data.columns.map(c => c.key)), page: 1, pageSize: 500, collapsed: false,
  };
  document.documentElement.dataset.theme = state.theme;
  const h = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const number = value => Number(value).toLocaleString('en-US');
  const paths = {
    box: '<path d="m12 3 9 5v10l-9 5-9-5V8zm0 10v10M3 8l9 5 9-5M7.5 5.5l9 5v5"/>',
    cubes: '<path d="m12 2 5 3v6l-5 3-5-3V5zm0 6v6M7 5l5 3 5-3M6 12l5 3v6l-5 3-5-3v-6zm0 6v6M1 15l5 3 5-3m7-6 5 3v6l-5 3-5-3v-6zm0 6v6m-5-9 5 3 5-3"/>',
    truck: '<path d="M2 5h12v13H2zm12 5h4l4 5v3h-8M4 18a2 2 0 1 0 4 0m9 0a2 2 0 1 0 4 0M15 11v4h6"/>',
    shield: '<path d="M12 2c3 2 6 3 9 3v7c0 5-4 9-9 12-5-3-9-7-9-12V5c3 0 6-1 9-3Z"/>',
    putaway: '<path d="M8 2h8v7H8zm-5 9h8v7H3zm10 0h8v7h-8M1 20h22v4H1M12 2v3m-5 6v3m10-3v3"/>',
    cart: '<path d="M2 3h3l3 13h12l3-10H6M9 20a1.5 1.5 0 1 0 0 .1m10-.1a1.5 1.5 0 1 0 0 .1"/>',
    clipboard: '<path d="M9 4H5v19h15V4h-4M9 2h7v5H9zm-1 9h9m-9 4h9m-9 4h6"/>',
    checkClipboard: '<path d="M9 4H4v19h17V4h-5M9 2h7v5H9zm-1 12 3 3 6-7"/>',
    document: '<path d="M5 2h10l5 5v16H5zm10 0v6h5M9 12h7m-7 4h7m-7 4h5"/>',
    documentSearch: '<path d="M13 22H4V2h11l5 5v6M14 2v6h6M8 11h5m-5 4h3m8-1a4 4 0 1 0 0 8 4 4 0 0 0 0-8m3 7 3 3"/>',
    documentClock: '<path d="M12 22H3V2h17v9M7 7h9M7 11h7m-7 4h3m7-2a5 5 0 1 0 0 10 5 5 0 0 0 0-10m0 2v3h3"/>',
    delivery: '<path d="M5 2h10l5 5v16H5zm10 0v6h5M8 16h10m-4-3 4 3-4 3"/>',
    wrench: '<path d="M14 3a7 7 0 0 0-7 9L1 19a3 3 0 0 0 4 4l8-8a7 7 0 0 0 9-9l-5 5-4-4 5-5a7 7 0 0 0-4 1Z"/>',
    settings: '<path d="m10 2 4 0 1 3 3 1 3-1 2 4-2 2v3l2 2-2 4-3-1-3 1-1 3h-4l-1-3-3-1-3 1-2-4 2-2v-3L1 9l2-4 3 1 3-1z"/><circle cx="12" cy="12" r="4"/>',
    headset: '<path d="M3 14v-3a9 9 0 0 1 18 0v3M3 12H1v8h5v-8zm18 0h2v8h-5v-8m3 8c0 3-2 4-6 4h-2"/>',
    lock: '<path d="M7 11V7a5 5 0 0 1 10 0v4M4 11h16v12H4z"/><circle cx="12" cy="16" r="1"/><path d="M12 17v3"/>',
    eye: '<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/>',
    eyeOff: '<path d="m2 2 20 20M7 6a13 13 0 0 1 5-1c7 0 11 7 11 7a20 20 0 0 1-4 5M4 7a20 20 0 0 0-3 5s4 7 11 7a13 13 0 0 0 5-1"/>',
    warning: '<path d="m12 2 11 20H1zm0 7v6m0 3v1"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
    down: '<path d="m6 9 6 6 6-6"/>', up: '<path d="m6 15 6-6 6 6"/>',
    right: '<path d="m9 5 7 7-7 7"/>', left: '<path d="m15 5-7 7 7 7"/>',
    arrow: '<path d="M3 12h18m-7-7 7 7-7 7"/>',
    refresh: '<path d="M21 8a9 9 0 0 0-16-3L2 9m0-7v7h7m-6 7a9 9 0 0 0 16 3l3-4m0 7v-7h-7"/>',
    cycle: '<path d="M21 8a9 9 0 0 0-16-3L2 9m0-7v7h7m-6 7a9 9 0 0 0 16 3l3-4m0 7v-7h-7"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 5v7h5"/>',
    pin: '<path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    barcode: '<path d="M2 4v16M5 4v16M9 4v16M11 4v16M15 4v16M18 4v16M22 4v16"/>',
    user: '<circle cx="12" cy="6" r="4"/><path d="M3 23v-3a9 9 0 0 1 18 0v3Z"/>',
    logout: '<path d="M11 3H3v18h8m-3-9h15m-6-6 6 6-6 6"/>',
    chart: '<path d="M3 15h4v8H3zm7-6h4v14h-4zm7-7h4v21h-4z"/>',
    help: '<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 1 1 5 3c-2 1-2 2-2 4m0 3h.01"/>',
    palette: '<path d="M12 3a9 9 0 1 0 0 18h1.2a2 2 0 0 0 1.4-3.4 1.7 1.7 0 0 1 1.2-2.9H18a3 3 0 0 0 3-3c0-4.8-4-8.7-9-8.7Z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="15" cy="8" r="1"/>',
    check: '<path d="M3 3h18v18H3zm4 9 4 4 7-9"/>',
    calendar: '<path d="M3 5h18v18H3zm0 5h18M7 2v6m10-6v6"/>',
    filter: '<path d="M2 3h20l-8 9v10l-4-2v-8Z"/>',
    funnel: '<path d="M3 5h18M6 9h12m-9 4h6m-4 4h2v4"/>',
    columns: '<path d="M3 3h18v18H3zm6 0v18m6-18v18"/>',
    list: '<path d="M8 5h14M8 12h14M8 19h14M2 5h1m-1 7h1m-1 7h1"/>',
    export: '<path d="M8 8H3v14h18V8h-5M12 16V1m-5 5 5-5 5 5"/>',
    bookmark: '<path d="M5 2h14v21l-7-5-7 5Z"/>',
    home: '<path d="m2 11 10-9 10 9M5 9v13h14V9M9 22v-8h6v8"/>',
    first: '<path d="M6 6v12m12-12-7 6 7 6Z"/>', last: '<path d="M18 6v12M6 6l7 6-7 6Z"/>',
  };
  function icon(name, extra = '') {
    return `<svg class="icon ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.document}</svg>`;
  }
  function crop(source, x, y, width, height, extra = '', label = '') {
    return `<svg class="image-crop ${extra}" viewBox="${x} ${y} ${width} ${height}" preserveAspectRatio="xMidYMid slice" ${label ? `role="img" aria-label="${h(label)}"` : 'aria-hidden="true"'}><image href="assets/${source}-reference.png" x="0" y="0" width="1672" height="941"/></svg>`;
  }
  const badge = () => `<span class="environment-badge">${icon('warning')}<span>${state.environment} ENVIRONMENT</span></span>`;
  function themePicker() {
    return `<div class="theme-picker">${icon('palette')}<label for="theme-select"><span>Theme</span><select id="theme-select" aria-label="Color theme"><option value="teal" ${state.theme === 'teal' ? 'selected' : ''}>Teal warehouse</option><option value="cobalt" ${state.theme === 'cobalt' ? 'selected' : ''}>Cobalt blue</option><option value="slate-dark" ${state.theme === 'slate-dark' ? 'selected' : ''}>Slate night</option></select></label></div>`;
  }
  function header(login) {
    return `<header class="topbar ${login ? 'login-topbar' : ''}">
      <div class="brand">${crop('login', 20, 8, 153, 40, 'brand-logo', 'MACNICA')}<span class="brand-divider"></span><strong>WMS</strong><span class="brand-divider"></span><span class="desk-name">OPERATIONS DESK</span>${login ? '' : '<span class="brand-divider warehouse-divider"></span><span class="warehouse-code">WH-03</span>'}</div>
      <div class="header-right">${themePicker()}${badge()}${login ? '' : `<span class="header-divider"></span><div class="header-date"><span>Tue, Oct 27, 2026</span><strong>10:14 AM</strong></div><span class="header-divider"></span><div class="dropdown account-dropdown"><button class="account-button" data-menu="account" aria-expanded="false"><span class="avatar">CH</span><span>CONRADHUA</span>${icon('down')}</button><div class="dropdown-panel" id="menu-account" hidden><button data-info="User info">${icon('user')}CONRADHUA · Warehouse operator</button><button data-action="logout">${icon('logout')}Sign out</button></div></div>`}</div>
    </header>`;
  }
  const navItems = ['Home', 'Inbound', 'Outbound', 'Inventory', 'Physical Count', 'Miscellaneous', 'Work in Process', 'Documents', 'Human Resources', 'System', 'Settings'];
  const navChildren = {
    Inbound: ['Receiving', 'Delivery lookup', 'Putaway', 'RMA returns'], Outbound: ['Order picking', 'Packing', 'Shipping'],
    Inventory: ['On-hand enquiry', 'Stock hold', 'FIFO', 'Locator'], 'Physical Count': ['Cycle count', 'Count sheets', 'Variance review'],
    Miscellaneous: ['Label design', 'Document lookup'], 'Work in Process': ['WIP overview'],
    Documents: ['Document lookup'], 'Human Resources': ['User info'], System: ['System status'], Settings: ['Preferences', 'Sign out'],
  };
  function navigation() {
    if (state.route === 'home') {
      const symbols = ['home', 'truck', 'box', 'cubes', 'clipboard', 'wrench', 'cycle', 'document', 'user', 'columns', 'settings'];
      return `<nav class="main-nav hover-nav" aria-label="Main navigation"><a href="#home" class="nav-link nav-home active" aria-current="page">${icon('home')}<span>Home</span></a>${navItems.slice(1).map((name, i) => `<div class="dropdown nav-dropdown"><button class="nav-link nav-compact" data-menu="nav-${i + 1}" aria-label="${h(name)}" aria-controls="menu-nav-${i + 1}" aria-expanded="false">${icon(symbols[i + 1])}<span class="nav-label">${h(name)}</span></button><div id="menu-nav-${i + 1}" class="dropdown-panel horizontal-menu" hidden>${navChildren[name].map(child => child === 'Receiving' ? '<a href="#inbound">Receiving</a>' : child === 'On-hand enquiry' ? '<a href="#inventory">On-hand enquiry</a>' : child === 'Sign out' ? '<button data-action="logout">Sign out</button>' : `<button data-info="${h(child)}">${h(child)}</button>`).join('')}</div></div>`).join('')}</nav>`;
    }
    return `<nav class="main-nav" aria-label="Main navigation">${navItems.map((name, index) => name === 'Home' ? `<a href="#home" class="nav-link ${state.route === 'home' ? 'active' : ''}" ${state.route === 'home' ? 'aria-current="page"' : ''}>Home</a>` : `<div class="dropdown nav-dropdown"><button class="nav-link ${state.route === 'inbound' && name === 'Inbound' || state.route === 'inventory' && name === 'Inventory' ? 'active' : ''}" data-menu="nav-${index}" aria-expanded="false">${h(name)}${icon('down')}</button><div id="menu-nav-${index}" class="dropdown-panel" hidden>${navChildren[name].map(child => child === 'Receiving' ? '<a href="#inbound">Receiving</a>' : child === 'On-hand enquiry' ? '<a href="#inventory">On-hand enquiry</a>' : child === 'Sign out' ? '<button data-action="logout">Sign out</button>' : `<button data-info="${h(child)}">${h(child)}</button>`).join('')}</div></div>`).join('')}</nav>`;
  }
  function footer() {
    if (state.route === 'login') return `<footer class="statusbar login-statusbar"><div class="status-left">${icon('box')}<span class="footer-divider"></span><strong>WMS ACCESS</strong><span class="footer-divider"></span><span class="environment-label">Environment:</span><span class="small-badge">${state.environment}</span></div><span class="authorized">Authorized users only</span></footer>`;
    if (state.route === 'inventory') return `<footer class="statusbar"><div class="status-left">${icon('box')}<span class="footer-divider"></span><strong class="query-status"><span class="status-dot"></span>QUERY COMPLETE</strong><span class="footer-divider"></span><span id="footer-summary">5 records · Total qty <b>2,033</b></span></div><div class="footer-actions"><span class="footer-divider"></span><button class="footer-button" data-action="refresh">${icon('refresh')}Refresh</button><button class="footer-button accent" data-action="export">${icon('document')}Export results</button></div></footer>`;
    if (state.route === 'inbound') return `<footer class="statusbar"><div class="status-left">${icon('truck')}<span class="footer-divider"></span><strong class="query-status"><span class="status-dot"></span>INBOUND WORKSPACE</strong><span class="footer-divider"></span><span>5 receiving records · 2 putaway tasks due</span></div><div class="footer-actions"><span class="footer-divider"></span><button class="footer-button" data-action="refresh-inbound">${icon('refresh')}Refresh</button><a class="footer-button accent" href="#home">${icon('home')}Back to home</a></div></footer>`;
    return `<footer class="statusbar home-statusbar"><div class="status-left">${icon('check')}<span class="footer-divider"></span><strong>WORKSPACE READY</strong><span class="footer-divider"></span><span class="environment-label">Environment:</span><span class="small-badge">${state.environment}</span><span class="footer-divider"></span><span class="support-label">Support: <b>wmsasia.support@macnica.com</b></span></div><div class="footer-actions"><span class="footer-divider"></span><button class="footer-button" data-info="Help">${icon('help')}Help</button><a class="footer-button accent" href="#inventory">${icon('document')}Open on-hand enquiry</a></div></footer>`;
  }
  function loginPage() {
    const steps = [['truck', 'Receiving'], ['shield', 'Quality'], ['putaway', 'Putaway'], ['cart', 'Picking'], ['box', 'Packing'], ['truck', 'Dispatch']];
    return `<main class="login-main"><section class="login-hero" aria-labelledby="hero-title">
      <div class="hero-copy"><div class="eyebrow">WAREHOUSE MANAGEMENT SYSTEM</div><div class="cyan-rule"></div><h1 id="hero-title">Your shift<br><span>starts here.</span></h1><p class="hero-subtitle">One workspace for warehouse operations.</p>
      <div class="warehouse-steps">${steps.map(([symbol, label], i) => `<div class="warehouse-step"><span class="step-number">0${i + 1}</span>${icon(symbol)}<span>${label}</span></div>`).join('')}</div></div>
      ${crop('login', 0, 542, 930, 285, 'warehouse-scene', 'Warehouse racks and forklift illustration')}
      <div class="hero-signature"><span></span>MACNICA · WAREHOUSE OPERATIONS</div>
    </section><section class="login-panel" aria-labelledby="login-title"><div class="login-content">
      <div class="secure-access">${icon('lock')}<span>SECURE ACCESS</span></div><h2 id="login-title">Sign in to WMS</h2><p class="login-subtitle">Use your company account to continue.</p>
      <div class="test-notice">${icon('warning')}<span>UAT / FUAT — Test environment</span></div>
      <form id="login-form"><div class="login-field"><label for="username">User name</label><input id="username" name="username" value="CONRADHUA" placeholder="Enter user name" autocomplete="username" required></div>
      <div class="login-field"><label for="password">Password</label><div class="password-input"><input id="password" name="password" type="password" value="Demo@123" placeholder="Enter password" autocomplete="current-password" required><button type="button" class="icon-button" data-action="password" aria-label="Show password" aria-pressed="false">${icon('eye')}</button></div></div>
      <div class="login-field"><label for="environment">Connect to</label><select id="environment" name="environment">${['UAT', 'FUAT'].map(env => `<option ${env === state.environment ? 'selected' : ''}>${env}</option>`).join('')}</select></div>
      <p id="login-error" class="form-error" role="alert" hidden></p><button class="primary-button sign-in" type="submit">Sign in ${icon('arrow')}</button></form>
      <button class="text-link forgot-password" data-info="Forgot password via Oracle EBS">Forgot password via Oracle EBS</button>
      <div class="login-support">${icon('headset')}<div>Need help? Contact WMS support<br><button class="text-link" data-info="Contact support">wmsasia.support@macnica.com</button></div></div>
    </div></section></main>`;
  }
  const modules = [
    { name: 'INBOUND', icon: 'truck', description: 'Receive and put away goods', links: [['documentClock', 'Receiving'], ['delivery', 'Delivery lookup'], ['documentSearch', 'Putaway'], ['document', 'ASN lookup'], ['shield', 'Quality inspection'], ['clock', 'Receiving history']] },
    { name: 'OUTBOUND', icon: 'box', description: 'Pick, pack and ship orders', links: [['cart', 'Order picking'], ['box', 'Packing'], ['truck', 'Shipping'], ['documentSearch', 'Order lookup'], ['checkClipboard', 'Delivery confirmation'], ['clock', 'Shipping history']] },
    { name: 'INVENTORY', icon: 'cubes', description: 'View and manage stock', links: [['document', 'On-hand enquiry'], ['lock', 'Stock hold'], ['clock', 'FIFO'], ['pin', 'Locator'], ['cycle', 'Stock movement'], ['search', 'Lot traceability'], ['chart', 'Inventory ageing'], ['putaway', 'Replenishment']] },
    { name: 'COUNT', icon: 'clipboard', description: 'Manage physical counts', links: [['cycle', 'Cycle count'], ['document', 'Count sheets'], ['chart', 'Variance review'], ['calendar', 'Count schedule'], ['checkClipboard', 'Count results'], ['clock', 'Count history']] },
    { name: 'TOOLS', icon: 'wrench', description: 'Operational tools and utilities', links: [['barcode', 'Label design'], ['documentSearch', 'Document lookup'], ['user', 'User info'], ['barcode', 'Barcode printing'], ['document', 'Label templates'], ['clock', 'Activity log']] },
    { name: 'SUPPORT', icon: 'settings', description: 'Get help and manage preferences', links: [['headset', 'Contact support'], ['settings', 'Settings'], ['logout', 'Sign out'], ['document', 'Knowledge base'], ['warning', 'Report an issue'], ['help', 'User guide']] },
  ];
  const news = [
    { title: 'Inventory count schedule', date: 'Oct 27, 2026', text: 'Q4 cycle count schedule has been released. Please check your assigned areas.', y: 192, detail: 'The Q4 cycle count schedule is ready. Warehouse operators should review their assigned areas before the next shift.\n\nThis offline demo contains no assigned count tasks.' },
    { title: 'Receiving procedure update', date: 'Oct 26, 2026', text: 'Updated receiving procedure is now effective. Please follow the latest work instruction.', y: 329, detail: 'The updated receiving procedure is effective from October 26, 2026. Confirm delivery references, received quantities and packaging condition before putaway.\n\nThis is demonstration content.' },
    { title: 'System maintenance notice', date: 'Oct 24, 2026', text: 'WMS will be unavailable on Oct 30, 2026 from 20:00 to 22:00 (UAT) for scheduled maintenance.', y: 469, detail: 'Scheduled maintenance: October 30, 2026, 20:00–22:00, UAT environment.\n\nThis notice is copied from the design reference. The offline demo remains available.' },
  ];
  function calendarLabel() {
    return new Date(Date.UTC(2026, 9, 27 + state.dayOffset)).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
  }
  function homePage() {
    return `<main class="home-main"><div class="home-heading"><h1>Warehouse operations</h1><span></span><p>Your daily workspace, SHIFT A.</p></div>
      <section class="modules-grid" aria-label="Warehouse modules">${modules.map((module, i) => `<article class="module-card ${i === state.selectedModule ? 'is-selected' : ''}" data-module="${i}" aria-labelledby="module-title-${i}"><button class="module-heading" data-module-select="${i}" aria-pressed="${i === state.selectedModule}" aria-label="Select ${h(module.name.charAt(0) + module.name.slice(1).toLowerCase())} module"><span class="module-symbol">${icon(module.icon)}</span><span class="module-number">0${i + 1}</span><span class="module-copy"><span class="module-name" id="module-title-${i}">${module.name}</span><span class="module-description">${module.description}</span></span></button><div class="module-links" tabindex="0" role="region" aria-label="${h(module.name.charAt(0) + module.name.slice(1).toLowerCase())} functions">${module.links.map(([symbol, label]) => {
        const attrs = label === 'Receiving' ? 'href="#inbound"' : label === 'On-hand enquiry' ? 'href="#inventory"' : label === 'Sign out' ? 'href="#login" data-action="logout"' : `href="#" data-info="${h(label)}"`;
        return `<a ${attrs} class="module-link ${label === 'On-hand enquiry' ? 'featured-link' : ''}"><span class="round-icon">${icon(symbol)}</span><span>${h(label)}</span>${icon('right', 'link-chevron')}</a>`;
      }).join('')}</div><div class="module-tail"><button class="module-scroll-button" data-module-scroll="${i}" aria-label="Scroll ${h(module.name.charAt(0) + module.name.slice(1).toLowerCase())} functions down">${icon('down')}</button><a class="open-module" ${i === 0 ? 'href="#inbound"' : i === 2 ? 'href="#inventory"' : `href="#" data-info="${h(module.name.charAt(0) + module.name.slice(1).toLowerCase())}"`}>Open ${module.name.toLowerCase()} ${icon('arrow')}</a></div></article>`).join('')}</section>
      <aside class="news-panel"><div class="news-heading"><h2>Latest news</h2><button data-action="all-news">View all news ${icon('arrow')}</button></div>${news.map((item, i) => `<button class="news-item" data-news="${i}">${crop('home', 1257, item.y, 141, 113, 'news-image', item.title)}<span class="news-copy"><span class="news-date">${item.date}</span><strong>${item.title}</strong><span>${item.text}</span></span></button>`).join('')}</aside>
      <div class="home-bottom"><section class="task-panel"><button class="panel-title" data-toggle-panel="todo" aria-controls="panel-todo" aria-expanded="false">${icon('checkClipboard')}<h2>To do</h2>${icon('down')}</button><div id="panel-todo" class="panel-content" hidden><div class="calendar-toolbar"><button class="small-button" data-action="previous-day" aria-label="Previous day">${icon('left')}</button><button class="small-button" data-action="next-day" aria-label="Next day">${icon('right')}</button><button class="small-button today-button" data-action="today">Today</button>${icon('calendar')}<span id="calendar-label">${calendarLabel()}</span></div><div class="task-table-head todo-head"><span>Time</span><span>Task</span><span>Status</span></div><div class="empty-tasks">${icon('clipboard')}<strong id="todo-empty">No scheduled tasks for today.</strong><span>You're all caught up.</span></div></div></section>
      <section class="task-panel"><button class="panel-title" data-toggle-panel="tasks" aria-controls="panel-tasks" aria-expanded="false">${icon('user')}<h2>My tasks</h2>${icon('down')}</button><div id="panel-tasks" class="panel-content" hidden><div class="task-table-head my-tasks-head"><span>Task</span><span>Related module</span><span>Due date</span><span>Status</span></div><div class="empty-tasks">${icon('clipboard')}<strong>No tasks assigned.</strong><span>Tasks assigned to you will appear here.</span></div></div></section></div>
    </main>`;
  }
  const filterGroups = [
    [['operatingUnit', 'Operating unit', ['MCHK_OU']], ['subinventory', 'Subinventory', ['All', 'WIP', 'GS', 'YKK-JB']], ['partNumber', 'Part number'], ['receivedFrom', 'Received date from', 'date'], ['vendorName', 'Vendor name'], ['manufacturingReference', 'Manufacturing reference']],
    [['warehouse', 'Warehouse', ['HKW']], ['locatorFrom', 'Locator from'], ['supplierDateCode', 'Supplier date code'], ['receivedTo', 'Received date to', 'date'], ['poNumber', 'PO number'], ['split', 'Split', ['All', 'Yes', 'No']]],
    [['productLine', 'Product line', ['All', 'Altera']], ['locatorTo', 'Locator to'], ['supplierLot', 'Supplier lot'], ['standardDateCodeFrom', 'Standard date code from'], ['asnNumber', 'ASN number']],
    [['lotNumber', 'Lot number'], ['mpn', 'MPN'], ['coo', 'COO', ['All', 'MY', '—']], ['standardDateCodeTo', 'Standard date code to'], ['receiptNumber', 'Receipt number']],
  ];
  function filterField([key, label, type]) {
    const value = state.filters[key] || '';
    return `<div class="query-field"><label for="query-${key}">${label}</label>${Array.isArray(type) ? `<select name="${key}" id="query-${key}">${type.map(option => `<option ${value === option ? 'selected' : ''}>${h(option)}</option>`).join('')}</select>` : `<div class="query-input-wrap ${type === 'date' && !value ? 'date-empty' : ''}"><input id="query-${key}" name="${key}" type="${type === 'date' ? 'date' : 'text'}" value="${h(value)}" placeholder="${type === 'date' ? 'dd/mm/yyyy' : 'Any'}" ${key === 'mpn' ? 'class="mpn-input"' : ''}>${type === 'date' ? '<span class="date-placeholder" aria-hidden="true">dd/mm/yyyy</span>' : ''}${['mpn', 'lotNumber'].includes(key) ? `<button type="button" class="clear-input" data-clear-field="${key}" aria-label="Clear ${label}">×</button>` : ''}</div>`}</div>`;
  }
  function inventoryPage() {
    return `<main class="inventory-main"><div class="inventory-heading"><div><h1>Real-time inventory enquiry</h1><span class="heading-divider"></span><p>Inventory / On-hand enquiry</p></div><div class="heading-actions"><button class="light-button" data-info="Saved views">${icon('bookmark')}Saved views ${icon('down')}</button><span class="heading-divider"></span><button class="light-button" data-action="filters" aria-expanded="${!state.collapsed}">${icon('filter')}<span id="filters-label">Filters ${state.collapsed ? 'collapsed' : 'expanded'}</span>${icon('down')}</button></div></div>
      <section class="query-panel"><button class="panel-title query-title" data-action="filters" aria-expanded="${!state.collapsed}">${icon('search')}<h2>QUERY FILTERS</h2><span class="collapse-label">${state.collapsed ? 'Expand' : 'Collapse'}</span>${icon(state.collapsed ? 'down' : 'up')}</button><form id="query-form" ${state.collapsed ? 'hidden' : ''}><div class="filter-columns">${filterGroups.map((fields, i) => `<div class="filter-column">${fields.map(filterField).join('')}${i === 3 ? `<div class="query-actions"><button class="primary-button" type="submit">${icon('search')}Search</button><button class="outline-button" type="button" data-action="clear">Clear</button></div>` : ''}</div>`).join('')}</div><p id="query-error" class="form-error" role="alert" hidden></p></form></section>
      <section class="results-panel" aria-label="Inventory results"><div class="panel-title results-title">${icon('cubes')}<h2>RESULTS</h2><span class="result-title-divider"></span><span id="record-count">5 records</span><div class="result-tools"><div class="dropdown columns-dropdown"><button class="tool-button" data-menu="columns" aria-expanded="false">${icon('columns')}Columns ${icon('down')}</button><div class="dropdown-panel column-options" id="menu-columns" hidden><strong>Visible columns</strong>${data.columns.map(c => `<label><input type="checkbox" data-column-toggle="${c.key}" ${state.visible.has(c.key) ? 'checked' : ''}>${c.label}</label>`).join('')}</div></div><button class="tool-button" data-info="Group by">${icon('list')}Group by ${icon('down')}</button><button class="tool-button" data-action="export">${icon('export')}Export ${icon('down')}</button><span class="result-title-divider"></span><button class="tool-button icon-only" data-action="refresh" aria-label="Refresh results">${icon('refresh')}</button></div></div>
      <button class="grouping-hint" data-info="Group by">Drag a column header here to group by that column</button><div class="table-viewport" tabindex="0" aria-label="Scrollable inventory results"><table class="inventory-table"><caption class="sr-only">On-hand inventory results. Select a column heading to sort.</caption></table></div><div class="pagination-bar" id="pagination"></div></section></main>`;
  }
  function inboundPage() {
    const rows = data.inboundRecords;
    return `<main class="inbound-main"><div class="inbound-heading"><div><h1>Inbound operations</h1><span class="heading-divider"></span><p>Receiving / Putaway / RMA returns</p></div><div class="heading-actions"><button class="light-button" data-info="Inbound work instructions">${icon('document')}Work instructions</button><button class="light-button" data-action="inbound-filter">${icon('filter')}Filters</button></div></div>
      <section class="inbound-kpis" aria-label="Inbound summary"><button class="inbound-kpi active" data-inbound-status="All"><span class="kpi-icon">${icon('truck')}</span><span><b>5</b><small>Open inbound records</small></span></button><button class="inbound-kpi" data-inbound-status="Ready to receive"><span class="kpi-icon amber">${icon('documentClock')}</span><span><b>1</b><small>Ready to receive</small></span></button><button class="inbound-kpi" data-inbound-status="Putaway pending"><span class="kpi-icon violet">${icon('putaway')}</span><span><b>1</b><small>Putaway pending</small></span></button><button class="inbound-kpi" data-inbound-status="Awaiting inspection"><span class="kpi-icon red">${icon('shield')}</span><span><b>1</b><small>Awaiting inspection</small></span></button></section>
      <section class="inbound-workspace"><div class="inbound-list-panel"><div class="panel-title results-title">${icon('truck')}<h2>INBOUND QUEUE</h2><span class="result-title-divider"></span><span id="inbound-count">5 records</span><div class="result-tools"><button class="tool-button" data-action="refresh-inbound">${icon('refresh')}Refresh</button><button class="tool-button" data-info="Export inbound queue">${icon('export')}Export</button></div></div><form class="inbound-filters" id="inbound-form"><label>Search<input name="search" placeholder="ASN, PO, supplier or receipt no."></label><label>Type<select name="type"><option>All</option><option>ASN receipt</option><option>Putaway</option><option>RMA return</option></select></label><label>Status<select name="status"><option>All</option><option>Ready to receive</option><option>Receiving in progress</option><option>Putaway pending</option><option>Awaiting inspection</option><option>Completed</option></select></label><button class="primary-button" type="submit">${icon('search')}Search</button></form><div class="inbound-table-wrap"><table class="inbound-table"><thead><tr><th>Reference</th><th>Source document</th><th>Supplier / return source</th><th>Status</th><th>Expected / received</th><th>Next action</th></tr></thead><tbody>${rows.map(row => `<tr data-status="${h(row.status)}"><td><strong>${h(row.reference)}</strong><small>${h(row.type)} · ${h(row.id)}</small></td><td><strong>${h(row.po)}</strong><small>${row.lines} lines · ETA ${h(row.eta)}</small></td><td>${h(row.supplier)}<small>${h(row.location)}</small></td><td><span class="inbound-status status-${row.status.toLowerCase().replaceAll(' ', '-')}">${h(row.status)}</span><small>Owner: ${h(row.owner)}</small></td><td><strong>${number(row.received)} / ${number(row.quantity)}</strong><div class="progress"><span style="width:${Math.min(100, row.received / row.quantity * 100)}%"></span></div></td><td><button class="row-action" data-inbound-action="${h(row.status)}" data-inbound-ref="${h(row.reference)}">${row.status === 'Putaway pending' ? 'Start putaway' : row.status === 'Ready to receive' ? 'Begin receiving' : row.status === 'Awaiting inspection' ? 'Open inspection' : 'View details'} ${icon('right')}</button></td></tr>`).join('')}</tbody></table></div></div>
        <aside class="inbound-side"><section class="action-panel"><div class="side-heading"><h2>QUICK ACTIONS</h2><span>${icon('wrench')}</span></div><button data-info="Receive against ASN">${icon('documentClock')}<span><strong>Receive against ASN</strong><small>Scan or enter an inbound delivery</small></span>${icon('right')}</button><button data-info="Putaway task">${icon('putaway')}<span><strong>Create putaway task</strong><small>Move received stock to a locator</small></span>${icon('right')}</button><button data-info="RMA return">${icon('cycle')}<span><strong>Process RMA return</strong><small>Register returned goods and inspection</small></span>${icon('right')}</button><button data-info="Receiving labels">${icon('barcode')}<span><strong>Print receiving labels</strong><small>Receipt, token and container labels</small></span>${icon('right')}</button></section><section class="today-panel"><div class="side-heading"><h2>TODAY'S INBOUND</h2>${icon('calendar')}</div><div class="today-line"><span class="timeline-dot amber"></span><span><strong>10:30</strong> ASN2608001 dock appointment<small>Dock 01 · 1,200 units expected</small></span></div><div class="today-line"><span class="timeline-dot violet"></span><span><strong>12:00</strong> Putaway wave PWA-26027<small>3 receipt lines · staging area A</small></span></div><div class="today-line"><span class="timeline-dot red"></span><span><strong>14:00</strong> RMA2601003 inspection<small>Quarantine area · 32 units</small></span></div></section></aside></section>
    </main>`;
  }
  function render() {
    const login = state.route === 'login';
    app.className = `app-shell ${state.route}-screen`;
    app.innerHTML = header(login) + (login ? '' : navigation()) + (login ? loginPage() : state.route === 'home' ? homePage() : state.route === 'inbound' ? inboundPage() : inventoryPage()) + footer();
    document.title = `${login ? 'Sign in' : state.route === 'home' ? 'Warehouse operations' : state.route === 'inbound' ? 'Inbound operations' : 'Real-time inventory enquiry'} · MACNICA WMS`;
    if (state.route === 'inventory') updateResults(true);
    if (state.route === 'home') syncModuleScroll();
  }
  function route() {
    const requested = location.hash.slice(1) || 'login';
    const next = state.signedIn && ['home', 'inbound', 'inventory'].includes(requested) ? requested : 'login';
    if (next === 'login') state.signedIn = false;
    state.route = next;
    if (location.hash !== `#${next}`) history.replaceState(null, '', `#${next}`);
    closeMenus();
    render();
  }
  function columns() { return data.columns.filter(c => state.visible.has(c.key)); }
  function tableHeader() {
    const visible = columns();
    return `<colgroup>${visible.map(c => `<col style="width:${c.width}px">`).join('')}</colgroup><thead><tr>${visible.map(c => `<th scope="col" aria-sort="${state.sort?.key === c.key ? state.sort.direction === 1 ? 'ascending' : 'descending' : 'none'}"><button class="sort-button" data-sort="${c.key}">${c.label}<span class="sort-marker">${state.sort?.key === c.key ? state.sort.direction === 1 ? '↑' : '↓' : ''}</span></button></th>`).join('')}</tr><tr class="column-filter-row">${visible.map(c => `<th>${c.key === 'hold' ? `<select data-column-filter="hold" aria-label="Filter Hold">${['All', 'No', 'Yes'].map(v => `<option ${state.columnFilters.hold === v ? 'selected' : ''}>${v}</option>`).join('')}</select>` : `<div class="column-filter-wrap"><input data-column-filter="${c.key}" value="${h(state.columnFilters[c.key] || '')}" aria-label="Filter ${c.label}" ${c.key === 'qty' ? 'inputmode="numeric"' : ''}>${icon('funnel')}</div>`}</th>`).join('')}</tr></thead><tbody></tbody>`;
  }
  function updateResults(rebuild = false) {
    const rows = data.query(state.filters, state.columnFilters, state.sort);
    const total = rows.reduce((sum, row) => sum + row.qty, 0);
    const maxPage = Math.max(1, Math.ceil(rows.length / state.pageSize));
    state.page = Math.max(1, Math.min(state.page, maxPage));
    const start = (state.page - 1) * state.pageSize;
    const table = app.querySelector('.inventory-table');
    if (!table) return;
    if (rebuild || !table.tHead) {
      table.innerHTML = tableHeader();
      table.style.minWidth = `${columns().reduce((sum, c) => sum + c.width, 0)}px`;
    }
    table.tBodies[0].innerHTML = rows.length ? rows.slice(start, start + state.pageSize).map(row => `<tr>${columns().map(c => `<td ${c.key === 'qty' ? 'class="quantity-cell"' : ''}>${c.key === 'hold' ? `<span class="hold-badge ${row.hold === 'Yes' ? 'on-hold' : ''}">${row.hold}</span>` : c.key === 'receivedDate' ? data.formatDate(row[c.key]) : h(c.key === 'qty' ? number(row[c.key]) : row[c.key])}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${columns().length}" class="no-results">${icon('search')}<strong>No matching inventory found.</strong><span>Try another search or clear your filters.</span></td></tr>`;
    document.getElementById('record-count').textContent = `${rows.length} record${rows.length === 1 ? '' : 's'}`;
    document.getElementById('footer-summary').innerHTML = `${rows.length} record${rows.length === 1 ? '' : 's'} · Total qty <b>${number(total)}</b>`;
    document.getElementById('pagination').innerHTML = `<div class="pagination-controls"><button class="page-button" data-page="first" ${state.page === 1 ? 'disabled' : ''} aria-label="First page">${icon('first')}</button><button class="page-button" data-page="previous" ${state.page === 1 ? 'disabled' : ''} aria-label="Previous page">${icon('left')}</button><span class="current-page" aria-label="Current page">${state.page}</span><button class="page-button" data-page="next" ${state.page === maxPage ? 'disabled' : ''} aria-label="Next page">${icon('right')}</button><button class="page-button" data-page="last" ${state.page === maxPage ? 'disabled' : ''} aria-label="Last page">${icon('last')}</button><span class="page-range">${rows.length ? start + 1 : 0}–${Math.min(start + state.pageSize, rows.length)} of ${rows.length}</span><span class="pagination-divider"></span><label for="page-size">Rows per page</label><select id="page-size">${[2, 5, 10, 50, 100, 500].map(v => `<option ${state.pageSize === v ? 'selected' : ''}>${v}</option>`).join('')}</select></div><div class="total-qty">TOTAL QTY <strong>${number(total)}</strong></div>`;
  }
  function showInfo(title, text) {
    closeMenus();
    const dialog = document.getElementById('info-dialog');
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-body').textContent = text || (title === 'Saved views' ? 'Saved views is a preview in this demo. Search, column filters, sorting, column visibility and CSV export are available.' : title === 'Group by' ? 'Grouping is a preview in this demo. Use the column filters and sorting to explore the five inventory records.' : /password/i.test(title) ? 'In the connected WMS, passwords are managed through Oracle EBS.\n\nFor this offline demo, use:\nUser name: CONRADHUA\nPassword: Demo@123' : /support|help/i.test(title) ? 'WMS support: wmsasia.support@macnica.com\n\nDemo account: CONRADHUA / Demo@123\n\nTry Sign in → Inventory → On-hand enquiry. Search, filter, sort and export inventory locally.' : title === 'User info' ? 'CONRADHUA\nWarehouse operator · SHIFT A\nWarehouse: WH-03 / HKW\nEnvironment: ' + state.environment : `${title} is outside this three-page demo.\n\nExplore the interactive inventory workflow through Inventory → On-hand enquiry.`);
    dialog.showModal();
  }
  let toastTimeout;
  function toast(message) {
    const element = document.getElementById('toast');
    element.textContent = message;
    element.classList.add('visible');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => element.classList.remove('visible'), 3200);
  }
  function closeMenus() {
    app.querySelectorAll('.dropdown-panel').forEach(menu => { menu.hidden = true; });
    app.querySelectorAll('[data-menu]').forEach(button => button.setAttribute('aria-expanded', 'false'));
    app.querySelectorAll('.nav-dropdown.is-open').forEach(menu => menu.classList.remove('is-open'));
  }
  function openHomeMenu(menu) {
    if (menu.classList.contains('is-open')) return;
    closeMenus();
    menu.classList.add('is-open');
    menu.querySelector('.dropdown-panel').hidden = false;
    menu.querySelector('[data-menu]').setAttribute('aria-expanded', 'true');
  }
  function selectModule(index) {
    state.selectedModule = index;
    app.querySelectorAll('.module-card').forEach(card => {
      const selected = Number(card.dataset.module) === index;
      card.classList.toggle('is-selected', selected);
      card.querySelector('[data-module-select]').setAttribute('aria-pressed', String(selected));
    });
  }
  function syncModuleScroll() {
    app.querySelectorAll('.module-links').forEach(list => {
      const button = list.closest('.module-card').querySelector('.module-scroll-button');
      const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
      button.hidden = list.scrollHeight <= list.clientHeight + 2;
      button.innerHTML = icon(atEnd ? 'up' : 'down');
      button.setAttribute('aria-label', `${atEnd ? 'Back to top of' : 'Scroll down in'} ${modules[Number(list.closest('.module-card').dataset.module)].name.toLowerCase()} functions`);
    });
  }
  function exportResults() {
    const rows = data.query(state.filters, state.columnFilters, state.sort);
    const url = URL.createObjectURL(new Blob([data.csv(rows, columns())], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `WMS-On-Hand-${state.environment}-2026-10-27.csv`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast(`Exported ${rows.length} record${rows.length === 1 ? '' : 's'} to CSV.`);
  }
  function clearQuery() {
    state.filters = { operatingUnit: 'MCHK_OU', warehouse: 'HKW' };
    state.columnFilters = {};
    state.sort = null;
    state.page = 1;
    app.querySelector('#query-form').reset();
    app.querySelectorAll('#query-form [name]').forEach(input => { input.value = state.filters[input.name] || (input.tagName === 'SELECT' ? 'All' : ''); input.removeAttribute('aria-invalid'); if (input.type === 'date') input.parentElement.classList.add('date-empty'); });
    document.getElementById('query-error').hidden = true;
    updateResults(true);
    toast('Filters cleared. Default operating unit and warehouse retained.');
  }
  app.addEventListener('submit', event => {
    event.preventDefault();
    if (event.target.id === 'login-form') {
      const form = new FormData(event.target);
      if (String(form.get('username')).trim().toUpperCase() !== 'CONRADHUA' || form.get('password') !== 'Demo@123') {
        const error = document.getElementById('login-error');
        error.textContent = 'Incorrect user name or password. Demo account: CONRADHUA / Demo@123';
        error.hidden = false;
        return;
      }
      state.signedIn = true;
      state.environment = form.get('environment');
      location.hash = 'home';
    } else if (event.target.id === 'inbound-form') {
      const form = new FormData(event.target);
      const search = String(form.get('search') || '').trim().toLowerCase();
      const type = String(form.get('type') || 'All');
      const status = String(form.get('status') || 'All');
      app.querySelectorAll('.inbound-table tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        row.hidden = Boolean((search && !text.includes(search)) || (type !== 'All' && !text.includes(type.toLowerCase())) || (status !== 'All' && row.dataset.status !== status));
      });
      const visible = [...app.querySelectorAll('.inbound-table tbody tr')].filter(row => !row.hidden).length;
      document.getElementById('inbound-count').textContent = `${visible} record${visible === 1 ? '' : 's'}`;
      toast(`Inbound queue filtered to ${visible} record${visible === 1 ? '' : 's'}.`);
    } else if (event.target.id === 'query-form') {
      const filters = Object.fromEntries(new FormData(event.target));
      Object.keys(filters).forEach(key => { filters[key] = filters[key].trim(); });
      const error = data.validate(filters);
      const errorElement = document.getElementById('query-error');
      event.target.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
      errorElement.hidden = !error;
      if (error) {
        errorElement.textContent = error.message;
        const input = document.getElementById(`query-${error.field}`);
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      state.filters = filters;
      state.page = 1;
      updateResults();
      toast('Query complete. Results updated.');
    }
  });
  app.addEventListener('click', event => {
    const card = event.target.closest('.module-card');
    if (card) selectModule(Number(card.dataset.module));
    const target = event.target.closest('button, a');
    if (!target) return;
    if (target.dataset.info) { event.preventDefault(); showInfo(target.dataset.info); }
    else if (target.dataset.news !== undefined) { const item = news[Number(target.dataset.news)]; showInfo(item.title, item.detail); }
    else if (target.dataset.menu) {
      const homeMenu = target.closest('.hover-nav .nav-dropdown');
      if (homeMenu) { openHomeMenu(homeMenu); return; }
      const panel = document.getElementById(`menu-${target.dataset.menu}`);
      const willOpen = panel.hidden;
      closeMenus();
      panel.hidden = !willOpen;
      target.setAttribute('aria-expanded', String(willOpen));
    } else if (target.dataset.inboundStatus) {
      app.querySelectorAll('.inbound-kpi').forEach(card => card.classList.toggle('active', card.dataset.inboundStatus === target.dataset.inboundStatus));
      app.querySelectorAll('.inbound-table tbody tr').forEach(row => { row.hidden = target.dataset.inboundStatus !== 'All' && row.dataset.status !== target.dataset.inboundStatus; });
      const visible = [...app.querySelectorAll('.inbound-table tbody tr')].filter(row => !row.hidden).length;
      document.getElementById('inbound-count').textContent = `${visible} record${visible === 1 ? '' : 's'}`;
    } else if (target.dataset.inboundAction) {
      showInfo(`${target.dataset.inboundAction}: ${target.dataset.inboundRef}`, `This offline inbound demo would open the ${target.dataset.inboundAction.toLowerCase()} workflow for ${target.dataset.inboundRef}.\n\nThe production flow will validate the SAP inbound delivery or RMA, capture batch attributes and quantities, then create the WMS transaction and integration message.`);
    } else if (target.dataset.moduleScroll !== undefined) {
      const list = target.closest('.module-card').querySelector('.module-links');
      const atEnd = list.scrollTop + list.clientHeight >= list.scrollHeight - 2;
      list.scrollTo({ top: atEnd ? 0 : list.scrollTop + Math.max(110, list.clientHeight * .75), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    } else if (target.dataset.clearField) {
      const field = document.getElementById(`query-${target.dataset.clearField}`);
      field.value = ''; field.focus();
    } else if (target.dataset.togglePanel) {
      const panel = document.getElementById(`panel-${target.dataset.togglePanel}`);
      panel.hidden = !panel.hidden;
      target.setAttribute('aria-expanded', String(!panel.hidden));
      target.lastElementChild.innerHTML = paths[panel.hidden ? 'down' : 'up'];
      syncModuleScroll();
    } else if (target.dataset.sort) {
      const key = target.dataset.sort;
      state.sort = { key, direction: state.sort?.key === key ? -state.sort.direction : 1 };
      state.page = 1;
      updateResults(true);
    } else if (target.dataset.page) {
      const last = Math.max(1, Math.ceil(data.query(state.filters, state.columnFilters, state.sort).length / state.pageSize));
      state.page = ({ first: 1, previous: state.page - 1, next: state.page + 1, last })[target.dataset.page];
      updateResults();
    } else if (target.dataset.action) {
      const action = target.dataset.action;
      if (action === 'logout') {
        event.preventDefault();
        state.signedIn = false;
        state.selectedModule = 2;
        state.filters = { ...data.defaults }; state.columnFilters = {}; state.sort = null;
        state.visible = new Set(data.columns.map(c => c.key)); state.page = 1; state.pageSize = 500; state.collapsed = false;
        location.hash = 'login';
      } else if (action === 'password') {
        const field = document.getElementById('password');
        const show = field.type === 'password';
        field.type = show ? 'text' : 'password';
        target.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        target.setAttribute('aria-pressed', String(show));
        target.innerHTML = icon(show ? 'eyeOff' : 'eye');
      } else if (action === 'filters') {
        state.collapsed = !state.collapsed;
        app.querySelector('#query-form').hidden = state.collapsed;
        app.querySelectorAll('[data-action="filters"]').forEach(button => button.setAttribute('aria-expanded', String(!state.collapsed)));
        document.getElementById('filters-label').textContent = `Filters ${state.collapsed ? 'collapsed' : 'expanded'}`;
        const title = app.querySelector('.query-title');
        title.querySelector('.collapse-label').textContent = state.collapsed ? 'Expand' : 'Collapse';
        title.lastElementChild.innerHTML = paths[state.collapsed ? 'down' : 'up'];
      } else if (action === 'clear') clearQuery();
      else if (action === 'refresh') { updateResults(); toast('Inventory refreshed using the current query.'); }
      else if (action === 'export') exportResults();
      else if (action === 'all-news') showInfo('Latest news', news.map(item => `${item.date} · ${item.title}\n${item.text}`).join('\n\n'));
      else if (['previous-day', 'next-day', 'today'].includes(action)) {
        state.dayOffset = action === 'today' ? 0 : state.dayOffset + (action === 'next-day' ? 1 : -1);
        document.getElementById('calendar-label').textContent = calendarLabel();
        document.getElementById('todo-empty').textContent = state.dayOffset === 0 ? 'No scheduled tasks for today.' : 'No scheduled tasks for this day.';
      }
    }
  });
  app.addEventListener('change', event => {
    const target = event.target;
    if (target.id === 'theme-select') {
      state.theme = themes.includes(target.value) ? target.value : 'teal';
      document.documentElement.dataset.theme = state.theme;
      try { window.localStorage.setItem('wms-demo-theme', state.theme); }
      catch { toast('Theme changed for this session. Browser storage is unavailable.'); }
    } else if (target.dataset.columnToggle) {
      const key = target.dataset.columnToggle;
      if (!target.checked && state.visible.size === 1) { target.checked = true; toast('Keep at least one column visible.'); return; }
      if (target.checked) state.visible.add(key);
      else { state.visible.delete(key); delete state.columnFilters[key]; if (state.sort?.key === key) state.sort = null; }
      state.page = 1;
      updateResults(true);
    } else if (target.id === 'page-size') { state.pageSize = Number(target.value); state.page = 1; updateResults(); }
    else if (target.dataset.columnFilter && target.tagName === 'SELECT') { state.columnFilters[target.dataset.columnFilter] = target.value; state.page = 1; updateResults(); }
    else if (target.id === 'environment') {
      state.environment = target.value;
      app.querySelector('.environment-badge span').textContent = `${state.environment} ENVIRONMENT`;
      app.querySelector('.small-badge').textContent = state.environment;
    }
  });
  app.addEventListener('input', event => {
    if (event.target.type === 'date') event.target.parentElement.classList.toggle('date-empty', !event.target.value);
    if (event.target.dataset.columnFilter) {
      state.columnFilters[event.target.dataset.columnFilter] = event.target.value;
      state.page = 1;
      updateResults();
    }
    if (event.target.closest('#login-form')) document.getElementById('login-error').hidden = true;
  });
  app.addEventListener('pointerover', event => {
    const menu = event.target.closest('.hover-nav .nav-dropdown');
    if (menu && (!event.relatedTarget || !menu.contains(event.relatedTarget))) openHomeMenu(menu);
  });
  app.addEventListener('pointerout', event => {
    const menu = event.target.closest('.hover-nav .nav-dropdown');
    if (menu && (!event.relatedTarget || !menu.contains(event.relatedTarget))) closeMenus();
  });
  app.addEventListener('focusin', event => {
    const card = event.target.closest('.module-card');
    if (card) selectModule(Number(card.dataset.module));
    const menu = event.target.closest('.hover-nav .nav-dropdown');
    if (menu) openHomeMenu(menu);
  });
  app.addEventListener('focusout', event => {
    const menu = event.target.closest('.hover-nav .nav-dropdown');
    if (menu && (!event.relatedTarget || !menu.contains(event.relatedTarget))) closeMenus();
  });
  app.addEventListener('scroll', event => { if (event.target.classList?.contains('module-links')) syncModuleScroll(); }, true);
  window.addEventListener('resize', syncModuleScroll);
  document.addEventListener('click', event => {
    if (!event.target.closest('.dropdown')) closeMenus();
    if (event.target.closest('[data-close-dialog]')) document.getElementById('info-dialog').close();
  });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenus(); });
  document.getElementById('info-dialog').addEventListener('click', event => { if (event.target.id === 'info-dialog') { const rect = event.target.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close(); } });
  window.addEventListener('hashchange', route);
  route();
})();
