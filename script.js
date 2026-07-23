// JavaScript logic for Mahesh Portfolio

  // Slide-in text reveal: wrap each word in an overflow-hidden mask
  function splitWords(el, baseDelay){
    if(el.dataset.split) return;
    el.dataset.split = '1';
    // If we previously scrambled and saved the text, use that
    const text = el.dataset.originalText || el.textContent;
    const words = text.split(/(\s+)/);
    el.innerHTML = words.map((w,i)=>{
      if(/^\s+$/.test(w)) return w;
      const delay = baseDelay + (i*0.06);
      return `<span class="split-mask"><span class="split-word" style="--wd:${delay}s">${w}</span></span>`;
    }).join('');
  }

  // Wrap all heading words immediately on load
  document.querySelectorAll('.hero h1, .head-row h2, .contact-head h2, .module-intro h2, .about-copy .statement').forEach(el=>{
    const delay = el.closest('.hero') ? 0.15 : 0;
    splitWords(el, delay);
  });
  
  // Section headings animate in and out when scrolled
  const headingIo = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('in');
      else e.target.classList.remove('in');
    });
  },{threshold:.4});
  document.querySelectorAll('.hero h1, .head-row h2, .contact-head h2, .module-intro h2, .about-copy .statement').forEach(el=>headingIo.observe(el));

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('in');
      else e.target.classList.remove('in');
    });
  },{threshold:.12});
  document.querySelectorAll('.reveal, .reveal-item').forEach(el=>io.observe(el));

  // Module card meters also fill once scrolled into view (not just on hover)
  const moduleIo = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting) e.target.classList.add('in');
      else e.target.classList.remove('in');
    });
  },{threshold:.4});
  document.querySelectorAll('.module-card').forEach(el=>moduleIo.observe(el));

  // Animated stat counters
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function animateCounter(el){
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    if(reducedMotion){ el.textContent = target + suffix; return; }
    const duration = 1100;
    const start = performance.now();
    function tick(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counterIo = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){ animateCounter(e.target); obs.unobserve(e.target); }
    });
  },{threshold:.15});
  document.querySelectorAll('.counter').forEach(el=>counterIo.observe(el));

  // Fallback: if a counter is already visible on load (e.g. fast scroll, small
  // screens, or the observer missing the threshold), animate it immediately.
  function checkCountersOnLoad(){
    document.querySelectorAll('.counter').forEach(el=>{
      const r = el.getBoundingClientRect();
      const visible = r.top < window.innerHeight && r.bottom > 0;
      if(visible && el.textContent === '0'){
        animateCounter(el);
        counterIo.unobserve(el);
      }
    });
  }
  window.addEventListener('load', checkCountersOnLoad);
  setTimeout(checkCountersOnLoad, 800);

  // Subtle parallax on hero chips + glow, following pointer
  const heroSection = document.querySelector('.hero');
  const glow = document.querySelector('.hero-glow');
  const watermark = document.querySelector('.hero-watermark');
  const chips = [document.getElementById('chipA'), document.getElementById('chipB'), document.getElementById('chipC')];
  if(heroSection && !reducedMotion){
    heroSection.addEventListener('mousemove', (e)=>{
      const r = heroSection.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if(glow) glow.style.transform = `translateY(-52%) translate(${px*24}px, ${py*24}px)`;
      if(watermark) watermark.style.transform = `translate(${px*-10}px, ${py*-10}px)`;
      chips.forEach((c,i)=>{
        if(!c) return;
        const depth = (i+1)*6;
        c.style.translate = `${px*depth}px ${py*depth}px`;
      });
    });
  }  // Cursor-follow glow dot (whole page)
  const cursorGlow = document.getElementById('cursorGlow');
  if(cursorGlow && !reducedMotion && window.matchMedia('(hover:hover)').matches){
    window.addEventListener('mousemove', (e)=>{
      cursorGlow.style.opacity = '1';
      cursorGlow.style.left = e.clientX + 'px';
      cursorGlow.style.top = e.clientY + 'px';
    });
    window.addEventListener('mouseleave', ()=>{ cursorGlow.style.opacity = '0'; });
  }

  // Magnetic buttons: pull slightly toward the cursor on hover
  if(!reducedMotion){
    document.querySelectorAll('.magnetic').forEach(btn=>{
      btn.addEventListener('mousemove', (e)=>{
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width/2) * 0.28;
        const y = (e.clientY - r.top - r.height/2) * 0.28;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', ()=>{ btn.style.transform = 'translate(0,0)'; });
    });
  }

  // Scroll-focus: sections blur while mostly off-screen and sharpen into full
  // clarity once roughly half of the section has scrolled into view.
  const focusSections = document.querySelectorAll('.scroll-focus');
  if(focusSections.length && !reducedMotion){
    const MAX_BLUR = 6;        // px, blur when barely entering the viewport
    const MAX_DIM = 0.35;      // opacity drop when barely entering the viewport
    const CLEAR_AT = 0.5;      // fraction of the viewport height that must be covered by the section to be fully clear
    let queued = false;
    function updateScrollFocus(){
      const vh = window.innerHeight;
      focusSections.forEach(sec=>{
        const r = sec.getBoundingClientRect();
        const visibleTop = Math.max(r.top, 0);
        const visibleBottom = Math.min(r.bottom, vh);
        const visible = Math.max(0, visibleBottom - visibleTop);
        const ratio = visible / vh; // how much of the viewport this section currently fills
        const t = 1 - Math.min(ratio / CLEAR_AT, 1); // 0 = clear (half+ revealed), 1 = just entering
        sec.style.filter = `blur(${(t * MAX_BLUR).toFixed(2)}px)`;
        sec.style.opacity = (1 - t * MAX_DIM).toFixed(2);
      });
      queued = false;
    }
    window.addEventListener('scroll', ()=>{
      if(!queued){ requestAnimationFrame(updateScrollFocus); queued = true; }
    }, {passive:true});
    window.addEventListener('resize', updateScrollFocus);
    updateScrollFocus();
  }

  // Mobile nav toggle
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  if(navToggle && mobileMenu){
    navToggle.addEventListener('click', ()=>{
      const isOpen = mobileMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      navToggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    });
    // Close the menu after tapping a link, and on resize back to desktop
    mobileMenu.querySelectorAll('a').forEach(a=>{
      a.addEventListener('click', ()=>{
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      });
    });
    window.addEventListener('resize', ()=>{
      if(window.innerWidth > 760 && mobileMenu.classList.contains('open')){
        mobileMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Open menu');
      }
    });
  }

  // Featured Project module selector — click a module to update the readout panel
  const fpModules = document.querySelectorAll('.fp-mod-btn');
  const fpModuleName = document.getElementById('fpModuleName');
  const fpStatus = document.getElementById('fpStatus');
  const fpDesc = document.getElementById('fpDesc');
  fpModules.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      fpModules.forEach(b=>{ b.classList.remove('active'); b.setAttribute('aria-pressed','false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed','true');
      const name = btn.querySelector('span').firstChild.textContent.trim();
      if(fpModuleName) fpModuleName.textContent = name;
      if(fpStatus) fpStatus.textContent = btn.dataset.status;
      if(fpDesc) fpDesc.textContent = btn.dataset.desc;
    });
  });

  // Fetch Live GitHub Stats
  async function fetchGitHubStats() {
    const username = 'Mxhesh-07';
    const reposCounter = document.getElementById('github-repos');
    if (!reposCounter) return;

    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (response.ok) {
        const data = await response.json();
        if (data.public_repos !== undefined) {
          reposCounter.dataset.target = data.public_repos;
          // If the counter already finished animating (or is static) before
          // this fetch resolved, update the displayed number directly so it
          // doesn't stay stuck on the placeholder value.
          if (reducedMotion || reposCounter.dataset.split || reposCounter.textContent !== '0') {
            reposCounter.textContent = data.public_repos + (reposCounter.dataset.suffix || '');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching GitHub stats:', error);
    }
  }
  
  fetchGitHubStats();

  // --- Contact form: submit via fetch so the page never navigates away ---
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn ? submitBtn.textContent : '';

      formStatus.textContent = 'Sending...';
      formStatus.className = 'form-status';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: new FormData(contactForm),
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.textContent = "Thanks! Your message has been sent — I'll get back to you soon.";
          formStatus.className = 'form-status success';
          contactForm.reset();
        } else {
          const data = await response.json().catch(() => null);
          const message = data && data.errors && data.errors.length
            ? data.errors.map(err => err.message).join(', ')
            : 'Something went wrong. Please try again or email me directly.';
          formStatus.textContent = message;
          formStatus.className = 'form-status error';
        }
      } catch (error) {
        formStatus.textContent = 'Network error — please check your connection and try again.';
        formStatus.className = 'form-status error';
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });
  }