
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}
function getCookie(name) {
  const match = document.cookie.match('(?:^|; )' + name + '=([^;]*)');
  return match ? decodeURIComponent(match[1]) : null;
}

window.initCookieConsent = function() {
  const banner    = document.getElementById('cookieBanner');
  const floatBtn  = document.getElementById('cookieFloatBtn');
  const modal     = document.getElementById('cookieModal');
  if (!banner) return;

  const showBanner = () => {
    floatBtn.style.display = 'none';
    requestAnimationFrame(() => banner.classList.add('show'));
  };
  const hideBanner = () => {
    banner.classList.remove('show');
    floatBtn.style.display = 'flex';
  };
  const apply = (choice) => {
    setCookie('csi_cookie_consent', choice, 180);
    hideBanner();
    modal?.classList.remove('open');
  };
  
  window._showCookieBanner = showBanner;

  if (getCookie('csi_cookie_consent')) {
    floatBtn.style.display = 'flex';
  } else {
    floatBtn.style.display = 'none';
    setTimeout(showBanner, 600);
  }

  document.addEventListener('click', e => {
    if (e.target.id === 'cookieAcceptBtn')   apply('accepted');
    if (e.target.id === 'cookieRejectBtn')   apply('rejected');
    if (e.target.id === 'cookieInfoBtn')     modal?.classList.add('open');
    if (e.target.id === 'cookieModalAccept') apply('accepted');
    if (e.target.id === 'cookieModalReject') apply('rejected');
    if (e.target.id === 'cookieModalClose' || e.target.id === 'cookieModal') modal?.classList.remove('open');
    if (e.target.id === 'cookieFloatBtn')    { floatBtn.style.display = 'none'; showBanner(); }
  });
};
