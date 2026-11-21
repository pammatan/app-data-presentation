(() => {
  const slides = [...document.querySelectorAll(".slide")];
  const railItems = [...document.querySelectorAll(".rail__item")];
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  const slideCount = document.getElementById("slideCount");
  const progressBar = document.getElementById("progressBar");
  const light = document.getElementById("light");
  const total = slides.length;
  let current = 0;
  let animating = false;

  const pad = (n) => String(n).padStart(2, "0");

  function goTo(index) {
    if (animating) return;
    const next = Math.max(0, Math.min(total - 1, index));
    if (next === current) return;

    animating = true;
    const prev = current;
    current = next;

    slides[prev].classList.remove("is-active");
    slides[prev].classList.add("is-exit");
    slides[current].classList.add("is-active");

    railItems.forEach((item, i) => {
      item.classList.toggle("is-active", i === current);
    });

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === total - 1;
    slideCount.textContent = `${pad(current + 1)} / ${pad(total)}`;
    progressBar.style.width = `${((current + 1) / total) * 100}%`;

    window.setTimeout(() => {
      slides[prev].classList.remove("is-exit");
      animating = false;
    }, 520);
  }

  prevBtn.addEventListener("click", () => goTo(current - 1));
  nextBtn.addEventListener("click", () => goTo(current + 1));

  railItems.forEach((item) => {
    item.addEventListener("click", () => goTo(Number(item.dataset.slide)));
  });

  document.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.addEventListener("click", () => goTo(Number(btn.dataset.goto)));
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      goTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      goTo(total - 1);
    }
  });

  let wheelLock = false;
  document.addEventListener(
    "wheel",
    (e) => {
      if (wheelLock) return;
      if (Math.abs(e.deltaY) < 30) return;
      wheelLock = true;
      if (e.deltaY > 0) goTo(current + 1);
      else goTo(current - 1);
      window.setTimeout(() => {
        wheelLock = false;
      }, 700);
    },
    { passive: true }
  );

  let touchStartY = 0;
  document.addEventListener(
    "touchstart",
    (e) => {
      touchStartY = e.changedTouches[0].screenY;
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      const dy = touchStartY - e.changedTouches[0].screenY;
      if (Math.abs(dy) < 50) return;
      if (dy > 0) goTo(current + 1);
      else goTo(current - 1);
    },
    { passive: true }
  );

  // Soft spotlight follows cursor
  document.addEventListener(
    "pointermove",
    (e) => {
      if (!light) return;
      light.style.setProperty("--x", `${(e.clientX / window.innerWidth) * 100}%`);
      light.style.setProperty("--y", `${(e.clientY / window.innerHeight) * 100}%`);
    },
    { passive: true }
  );

  // 3D tilt on spatial cards
  const maxTilt = 10;

  document.querySelectorAll("[data-tilt]").forEach((el) => {
    let frame = 0;

    el.addEventListener("pointerenter", () => {
      el.style.animationPlayState = "paused";
      el.style.transition = "transform 0.12s ease-out, box-shadow 0.35s ease";
    });

    el.addEventListener("pointermove", (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const ry = (px - 0.5) * maxTilt * 2;
        const rx = (0.5 - py) * maxTilt * 2;
        el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) scale3d(1.03, 1.03, 1.03)`;
      });
    });

    el.addEventListener("pointerleave", () => {
      el.style.transition = "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease";
      el.style.transform = "";
      el.style.animationPlayState = "";
    });
  });

  progressBar.style.width = `${(1 / total) * 100}%`;
  prevBtn.disabled = true;
})();
