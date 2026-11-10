/* The Race: picks the setting, then loads its content file, the engine and the screens, in that order.
   Every setting has the same map, groups, numbers and ids; only names and text differ. */
const SETTINGS = [
  { id:'harlan', name:'Harlan Valley', blurb:'County roads, diners and union halls. Money in dollars.' },
  { id:'rajnagar', name:'Rajnagar', blurb:'Mill gates, tea stalls and village panchayats. Money in lakhs.' },
];
const SETTING_ID = (() => {
  let id = null;
  try { id = new URLSearchParams(location.search).get('s') || localStorage.getItem('race-setting'); } catch (e) {}
  return SETTINGS.some(x => x.id === id) ? id : SETTINGS[0].id;
})();
function pickSetting(id) {
  if (id === SETTING_ID) return;
  try { localStorage.setItem('race-setting', id); } catch (e) {}
  location.search = '?s=' + id;
}
for (const src of ['assets/js/content/' + SETTING_ID + '.js', 'assets/js/engine.js', 'assets/js/ui.js']) {
  const el = document.createElement('script'); el.src = src; el.async = false; document.body.appendChild(el);
}
