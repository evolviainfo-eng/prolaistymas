/* ProLaistymas — interactions */
(function () {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Header: scrolled + over-hero state ---------- */
  const header = $(".site-header");
  const hero = $(".hero");
  const setHeader = () => {
    const y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);
    const heroH = hero ? hero.offsetHeight - 90 : 0;
    header.classList.toggle("is-hero-top", y < heroH);
  };
  setHeader();
  window.addEventListener("scroll", setHeader, { passive: true });

  /* ---------- Mobile nav ---------- */
  const mnav = $(".mobile-nav");
  const openNav = () => { mnav.classList.add("open"); document.body.style.overflow = "hidden"; };
  const closeNav = () => { mnav.classList.remove("open"); document.body.style.overflow = ""; };
  $(".burger")?.addEventListener("click", openNav);
  $(".mobile-nav__close")?.addEventListener("click", closeNav);
  mnav?.addEventListener("click", (e) => { if (e.target === mnav) closeNav(); });
  $$(".mobile-nav a").forEach((a) => a.addEventListener("click", closeNav));

  /* ---------- Reveal on scroll (staggered) ---------- */
  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));
  } else {
    $$(".reveal").forEach((el) => el.classList.add("in"));
  }

  /* ---------- Count-up stats ---------- */
  const counters = $$("[data-count]");
  if (counters.length && !reduce && "IntersectionObserver" in window) {
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const dec = (el.dataset.count.indexOf(".") > -1) ? 1 : 0;
        const dur = 1400; const t0 = performance.now();
        const tick = (t) => {
          const p = Math.min((t - t0) / dur, 1);
          const e = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * e).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        cio.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => cio.observe(c));
  } else {
    counters.forEach((c) => (c.textContent = c.dataset.count + (c.dataset.suffix || "")));
  }

  /* ---------- Portfolio filter ---------- */
  const filterBtns = $$(".filters button");
  const items = $$(".gitem");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const f = btn.dataset.filter;
      items.forEach((it) => {
        const show = f === "all" || it.dataset.cat === f;
        it.classList.toggle("hide", !show);
      });
      buildLbList();
    });
  });

  /* ---------- Lightbox ---------- */
  const lb = $(".lightbox");
  const lbImg = $(".lightbox img");
  const lbCount = $(".lb-count");
  let lbList = [];
  let lbIdx = 0;
  const buildLbList = () => { lbList = items.filter((it) => !it.classList.contains("hide")); };
  buildLbList();
  const showLb = (i) => {
    lbIdx = (i + lbList.length) % lbList.length;
    const img = lbList[lbIdx].querySelector("img");
    lbImg.src = img.dataset.full || img.src;
    lbImg.alt = img.alt;
    lbCount.textContent = `${lbIdx + 1} / ${lbList.length}`;
  };
  const openLb = (item) => {
    buildLbList();
    showLb(lbList.indexOf(item));
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  };
  const closeLb = () => { lb.classList.remove("open"); document.body.style.overflow = ""; };
  items.forEach((it) => it.addEventListener("click", () => openLb(it)));
  $(".lb-close")?.addEventListener("click", closeLb);
  $(".lb-next")?.addEventListener("click", () => showLb(lbIdx + 1));
  $(".lb-prev")?.addEventListener("click", () => showLb(lbIdx - 1));
  lb?.addEventListener("click", (e) => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowRight") showLb(lbIdx + 1);
    if (e.key === "ArrowLeft") showLb(lbIdx - 1);
  });

  /* ---------- FAQ accordion ---------- */
  $$(".faq__item").forEach((item) => {
    const q = $(".faq__q", item);
    const a = $(".faq__a", item);
    q.addEventListener("click", () => {
      const open = item.classList.contains("open");
      $$(".faq__item").forEach((other) => {
        other.classList.remove("open");
        $(".faq__a", other).style.maxHeight = null;
      });
      if (!open) { item.classList.add("open"); a.style.maxHeight = a.scrollHeight + "px"; }
    });
  });

  /* ---------- Contact form (EmailJS → prolaistymas@inbox.lt) ----------
     Laiškai siunčiami IŠ evolvia.info@gmail.com Į prolaistymas@inbox.lt per EmailJS.
     Aktyvavimas (vienkartinis):
       1) Sukurti paskyrą https://emailjs.com ir prijungti Gmail (evolvia.info@gmail.com)
       2) Šablone nustatyti "To Email" = prolaistymas@inbox.lt
       3) Įrašyti šiuos VIEŠUS ID žemiau (saugu laikyti kliento kode):              */
  const EMAILJS = { publicKey: "aKHIdlUWowgK1b9Bd", serviceId: "service_t5n2r4b", templateId: "template_litmokd" };

  const form = $("#leadForm");
  if (form) {
    const okBox = $(".form__ok");
    const submitBtn = form.querySelector('button[type="submit"]');
    if (EMAILJS.publicKey && window.emailjs) emailjs.init({ publicKey: EMAILJS.publicKey });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const phone = (data.get("phone") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const msg = (data.get("message") || "").toString().trim();
      const params = {
        from_name: name, name: name,            // {{from_name}} / {{name}}
        phone: phone,                            // {{phone}}
        email: email, reply_to: email,           // {{email}} / Reply To
        title: "Nauja užklausa iš svetainės",    // {{title}}
        time: new Date().toLocaleString("lt-LT"),// {{time}}
        message: msg,                            // {{message}}
        to_email: "prolaistymas@inbox.lt"
      };

      const configured = EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId && window.emailjs;
      if (configured) {
        const orig = submitBtn.innerHTML;
        submitBtn.disabled = true; submitBtn.textContent = "Siunčiama…";
        try {
          await emailjs.send(EMAILJS.serviceId, EMAILJS.templateId, params);
          okBox?.classList.add("show");
          form.reset();
        } catch (err) {
          alert("Nepavyko išsiųsti. Paskambinkite +370 636 45478 arba rašykite prolaistymas@inbox.lt");
        } finally {
          submitBtn.disabled = false; submitBtn.innerHTML = orig;
        }
      } else {
        // Atsarginis variantas, kol EmailJS nesukonfigūruotas — paruošia laišką el. pašto programoje.
        const subject = encodeURIComponent("Užklausa dėl laistymo sistemos — " + (name || "svetainė"));
        const body = encodeURIComponent(`Vardas: ${name}\nTelefonas: ${phone}\nEl. paštas: ${email}\n\nŽinutė:\n${msg}`);
        window.location.href = `mailto:prolaistymas@inbox.lt?subject=${subject}&body=${body}`;
        okBox?.classList.add("show");
        form.reset();
      }
    });
  }

  /* ---------- Footer year ---------- */
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
