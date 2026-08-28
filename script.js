// Ticking timecode
  const tc = document.getElementById('timecode');
  const ft = document.getElementById('footer-time');
  let frame = 0;
  function pad(n, len){ return String(n).padStart(len, '0'); }
  function tick(){
    const now = new Date();
    const h = pad(now.getHours(),2), m = pad(now.getMinutes(),2), s = pad(now.getSeconds(),2);
    frame = (frame + 1) % 24;
    if(tc) tc.textContent = `${h}:${m}:${s}:${pad(frame,2)}`;
    if(ft) ft.textContent = `${h}:${m}:${s}`;
  }
  tick();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  setInterval(tick, reduceMotion ? 1000 : 1000/24);

  // Scroll reveal
  const clips = document.querySelectorAll('.clip');
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.15 });
    clips.forEach(c=>io.observe(c));
  } else { clips.forEach(c=>c.classList.add('in-view')); }

  // Accordion toggle
  document.querySelectorAll('.clip-toggle').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const clip = btn.closest('.clip');
      const open = clip.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
      btn.querySelector('.clip-chevron').textContent = open ? '×' : '+';
    });
  });

  // Expand / collapse all
  const expandAllBtn = document.getElementById('expandAllBtn');
  let allOpen = false;
  expandAllBtn.addEventListener('click', ()=>{
    allOpen = !allOpen;
    document.querySelectorAll('.clip').forEach(clip=>{
      clip.classList.toggle('open', allOpen);
      const btn = clip.querySelector('.clip-toggle');
      btn.setAttribute('aria-expanded', allOpen);
      btn.querySelector('.clip-chevron').textContent = allOpen ? '×' : '+';
    });
    expandAllBtn.textContent = allOpen ? 'Collapse all' : 'Expand all';
  });

  // Dashboard count-up
  const countEls = document.querySelectorAll('.dash-stat-value[data-count]');
  function runCount(el){
    const target = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    if(reduceMotion){ el.textContent = target + suffix; return; }
    const duration = 900;
    const start = performance.now();
    function frameFn(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if(progress < 1) requestAnimationFrame(frameFn);
    }
    requestAnimationFrame(frameFn);
  }
  if('IntersectionObserver' in window){
    const countIo = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ runCount(e.target); countIo.unobserve(e.target); } });
    }, { threshold: 0.4 });
    countEls.forEach(el=>countIo.observe(el));
  } else {
    countEls.forEach(el=>{ el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  }

  // Reel filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const reels = document.querySelectorAll('.reel');
  filterBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      filterBtns.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      reels.forEach(r=>{
        r.classList.toggle('hidden', f !== 'all' && r.dataset.type !== f);
      });
    });
  });