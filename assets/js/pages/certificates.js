

window.initCertificatesPage = function() {
  let certData     = {};
  let currentNames = [];

  const certYear       = document.getElementById('certYear');
  const certEvent      = document.getElementById('certEvent');
  const certName       = document.getElementById('certName');
  const suggestionsBox = document.getElementById('nameSuggestions');
  const previewBtn     = document.getElementById('previewCertBtn');
  const previewSection = document.getElementById('certificatePreviewSection');
  if (!certYear) return;

  
  if (window._certInit) { _certReset(); return; }
  window._certInit = true;

  function _certReset() {
    certYear.innerHTML  = '<option value="">Select Year</option>';
    certEvent.innerHTML = '<option value="">Select Year First</option>';
    certEvent.disabled  = true;
    certName.value      = '';
    certName.disabled   = true;
    if (suggestionsBox) { suggestionsBox.innerHTML = ''; suggestionsBox.style.display = 'none'; }
    if (previewBtn) previewBtn.disabled = true;
    if (previewSection) previewSection.classList.remove('show');
    updateCertSteps(1);
  }
  _certReset();

  
  if (sb) {
    sb.from('certificate_events').select('id,year,event_name,date').then(({ data, error }) => {
      if (error) { displayErrorBanner('Failed to load certificate data: ' + error.message); return; }
      if (!data) return;
      data.forEach(r => {
        const y = String(r.year || 'Unknown');
        certData[y] = certData[y] || [];
        if (!certData[y].find(e => e.id === r.id)) {
          certData[y].push({ id: r.id, name: r.event_name || r.id, date: r.date || '' });
        }
      });
      Object.keys(certData)
        .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))
        .forEach(y => { certYear.innerHTML += `<option value="${y}">${y}</option>`; });
      updateCertSteps(1);
    });
  }

  certYear.addEventListener('change', () => {
    certEvent.innerHTML = '<option value="">Select Event</option>';
    certName.value = ''; certName.disabled = true;
    if (suggestionsBox) { suggestionsBox.innerHTML = ''; suggestionsBox.style.display = 'none'; }
    if (previewBtn) previewBtn.disabled = true;
    if (previewSection) previewSection.classList.remove('show');
    if (!certYear.value) { certEvent.disabled = true; return; }
    certEvent.disabled = false;
    (certData[certYear.value] || []).forEach(ev => {
      certEvent.innerHTML += `<option value="${ev.id}">${ev.name}${ev.date ? ' • ' + ev.date : ''}</option>`;
    });
    updateCertSteps(2);
  });

  certEvent.addEventListener('change', () => {
    certName.value = ''; currentNames = [];
    if (suggestionsBox) { suggestionsBox.innerHTML = ''; suggestionsBox.style.display = 'none'; }
    if (previewBtn) previewBtn.disabled = true;
    if (previewSection) previewSection.classList.remove('show');
    if (!certEvent.value) { certName.disabled = true; return; }
    certName.disabled = false;
    updateCertSteps(3);
    if (sb) {
      sb.from('certificate_participants').select('name').eq('event_id', certEvent.value)
        .then(({ data }) => { currentNames = (data || []).map(r => r.name).filter(Boolean); });
    }
  });

  certName.addEventListener('input', () => {
    const val = certName.value.toLowerCase().trim();
    if (suggestionsBox) suggestionsBox.innerHTML = '';
    if (previewBtn) previewBtn.disabled = true;
    if (!val) { if (suggestionsBox) suggestionsBox.style.display = 'none'; return; }
    const matches = currentNames.filter(n => n.toLowerCase().includes(val)).slice(0, 8);
    if (!matches.length) { if (suggestionsBox) suggestionsBox.style.display = 'none'; return; }
    matches.forEach(name => {
      const d = document.createElement('div');
      d.textContent = name;
      d.setAttribute('role', 'option');
      d.addEventListener('click', () => {
        certName.value = name;
        if (suggestionsBox) suggestionsBox.style.display = 'none';
        if (previewBtn) previewBtn.disabled = false;
        updateCertSteps(4);
      });
      if (suggestionsBox) suggestionsBox.appendChild(d);
    });
    if (suggestionsBox) suggestionsBox.style.display = 'block';
    if (previewBtn) previewBtn.disabled = !currentNames.some(n => n.toLowerCase() === val);
  });

  document.addEventListener('click', e => {
    if (!e.target.closest('.autocomplete') && suggestionsBox) suggestionsBox.style.display = 'none';
  });

  previewBtn?.addEventListener('click', async () => {
    const year = certYear.value, eventId = certEvent.value, name = certName.value.trim();
    if (!year || !eventId || !name) return;
    previewBtn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;"></div> Verifying…';
    previewBtn.disabled = true;
    const { data } = await sb.from('certificate_participants')
      .select('*').eq('event_id', eventId).ilike('name', name).maybeSingle();
    previewBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Preview Certificate';
    previewBtn.disabled = false;
    if (!data) { alert('Name not found for this event. Please check your spelling.'); return; }
    const pos = (data.position || '').toLowerCase();
    const isWinner = ['first','second','third','1','2','3','winner','1st','2nd','3rd'].includes(pos);
    const certTypeLabel = isWinner ? 'Certificate of Achievement' : 'Certificate of Participation';
    document.getElementById('certPreviewPosition').textContent = certTypeLabel;
    document.getElementById('certPreviewName').textContent = data.name || name;
    document.getElementById('certPreviewEvent').textContent = certEvent.options[certEvent.selectedIndex].text;
    document.getElementById('certPreviewYear').textContent = year;
    if (previewSection) {
      previewSection.classList.add('show');
      previewSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    updateCertSteps(5);
  });

  document.getElementById('downloadCertBtn')?.addEventListener('click', async () => {
    const nameVal  = document.getElementById('certPreviewName')?.textContent?.trim();
    const eventVal = document.getElementById('certPreviewEvent')?.textContent?.trim();
    const yearVal  = document.getElementById('certPreviewYear')?.textContent?.trim();
    const posVal   = document.getElementById('certPreviewPosition')?.textContent?.trim() || 'Certificate of Participation';
    if (!nameVal || nameVal === '—') return;
    const btn = document.getElementById('downloadCertBtn');
    btn.innerHTML = '<div class="spinner" style="width:18px;height:18px;border-width:2px;display:inline-block;"></div> Compiling…';
    btn.disabled = true;
    const setCA4 = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setCA4('ca4Name', nameVal); setCA4('ca4Event', eventVal || '');
    setCA4('ca4Year', yearVal || ''); setCA4('ca4CertTitle', posVal.toUpperCase());
    setCA4('ca4Verify', `Verify at: ${APP_CONFIG.SITE_URL}/pages/certificates`);
    const wrapper = document.getElementById('certA4Wrapper');
    const certEl  = document.getElementById('certA4');
    if (wrapper) { wrapper.style.left = '-9999px'; wrapper.style.visibility = 'visible'; }
    await new Promise(r => setTimeout(r, 120));

    
    
    
    
    
    async function waitForPdfLibs(timeoutMs = 5000) {
      const start = Date.now();
      while (typeof window.html2pdf === 'undefined' || typeof window.jspdf === 'undefined') {
        if (Date.now() - start > timeoutMs) return false;
        await new Promise(r => setTimeout(r, 150));
      }
      return true;
    }
    const ready = await waitForPdfLibs();
    if (!ready) {
      console.error('PDF generation failed: jsPDF/html2pdf libraries did not load in time.');
      alert('PDF tools are still loading (or were blocked by your network/ad-blocker). Please wait a moment and try again.');
      btn.innerHTML = '<i class="fa-solid fa-download"></i> Download Certificate PDF';
      btn.disabled = false;
      if (wrapper) wrapper.style.visibility = 'hidden';
      return;
    }

    try {
      await html2pdf().set({
        margin: 0,
        filename: `CSI-GRIET-Certificate-${nameVal.replace(/\s+/g, '_')}.pdf`,
        image:       { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          width: certEl.offsetWidth,
          height: certEl.offsetHeight,
          logging: false,
          
          
          
          ignoreElements: el => el.tagName === 'IMG' && !el.classList.contains('ca4-logo')
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      }).from(certEl).save();
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('PDF generation failed. Please try again.');
    }
    if (wrapper) wrapper.style.visibility = 'hidden';
    btn.innerHTML = '<i class="fa-solid fa-download"></i> Download Certificate PDF';
    btn.disabled = false;
  });
};

function updateCertSteps(activeStep) {
  for (let i = 1; i <= 4; i++) {
    const dot  = document.getElementById(`step${i}Dot`);
    const line = document.getElementById(`line${i}`);
    if (!dot) continue;
    if (i < activeStep) {
      dot.classList.add('done'); dot.classList.remove('active');
      dot.innerHTML = '<i class="fa-solid fa-check" style="font-size:0.7rem"></i>';
    } else if (i === activeStep) {
      dot.classList.add('active'); dot.classList.remove('done');
      dot.textContent = i;
    } else {
      dot.classList.remove('active','done'); dot.textContent = i;
    }
    if (line) line.style.width = i < activeStep ? '100%' : '0%';
  }
}
