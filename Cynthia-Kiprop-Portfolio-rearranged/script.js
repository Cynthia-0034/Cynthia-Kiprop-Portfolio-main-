// =========================
// Premium Loader
// =========================
(function initPremiumLoader() {
  console.log("Initializing Premium Loader...");

  const loader = document.getElementById("page-loader");
  const particleWrap = document.getElementById("qParticles");
  const status = document.getElementById("qStatus");

  if (!loader) {
    console.warn("Page loader element not found");
    return;
  }

  document.body.classList.add("is-loading");

  // Minimal particles (performance-safe)
  if (particleWrap) {
    const colors = ["#00ffff", "#8b5cf6", "#ec4899"];
    const N = 30;

    for (let i = 0; i < N; i++) {
      const p = document.createElement("span");
      p.className = "p";
      p.style.left = `${Math.random() * 100}%`;
      p.style.bottom = `${Math.random() * 30}px`;
      p.style.background = colors[i % colors.length];
      p.style.animationDuration = `${2.2 + Math.random() * 2.8}s`;
      p.style.animationDelay = `${Math.random() * 1.8}s`;
      p.style.opacity = `${0.35 + Math.random() * 0.55}`;
      p.style.width = p.style.height = `${2 + Math.random() * 2}px`;
      particleWrap.appendChild(p);
    }
  }

  // Soft rotating status text
  const messages = [
    "Initializing experience…",
    "Loading portfolio assets…",
    "Warming up visuals…",
  ];

  let i = 0;
  const t = setInterval(() => {
    if (status) status.textContent = messages[i % messages.length];
    i++;
  }, 650);

  const MIN_SHOW_MS = 2000;
  const start = performance.now();

  window.addEventListener("load", () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN_SHOW_MS - elapsed);

    setTimeout(() => {
      clearInterval(t);
      loader.classList.add("is-hidden");
      document.body.classList.remove("is-loading");
      document.body.classList.add("loaded");

      setTimeout(() => {
        if (loader.parentNode) {
          loader.remove();
        }
      }, 900);
    }, wait);
  });
})();

// =========================
// Page Transition Loader
// =========================
(function initPageTransitions() {
  console.log("Initializing Page Transitions...");

  // Create transition loader if it doesn't exist
  function createTransitionLoader() {
    if (document.getElementById("page-transition-loader")) return;

    const transitionLoader = document.createElement("div");
    transitionLoader.id = "page-transition-loader";
    transitionLoader.className = "page-transition-loader";
    transitionLoader.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0f172a;
      z-index: 9999;
      display: none;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;

    const loaderContent = document.createElement("div");
    loaderContent.className = "transition-loader-content";
    loaderContent.style.cssText = `
      text-align: center;
      color: white;
    `;

    const spinner = document.createElement("div");
    spinner.className = "transition-spinner";
    spinner.style.cssText = `
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      border-top-color: #00ffff;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    `;

    const text = document.createElement("div");
    text.className = "transition-text";
    text.textContent = "Loading...";
    text.style.cssText = `
      font-size: 18px;
      font-weight: 500;
      color: #94a3b8;
    `;

    // Add CSS animation
    const style = document.createElement("style");
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .page-transition-loader.fade-in {
        animation: fadeIn 0.3s ease forwards;
        display: flex !important;
      }
      .page-transition-loader.fade-out {
        animation: fadeIn 0.3s ease reverse forwards;
      }
    `;

    document.head.appendChild(style);
    loaderContent.appendChild(spinner);
    loaderContent.appendChild(text);
    transitionLoader.appendChild(loaderContent);
    document.body.appendChild(transitionLoader);

    return transitionLoader;
  }

  // Initialize transition loader
  const transitionLoader = createTransitionLoader();
  let isTransitioning = false;

  // Show transition loader
  function showPageTransition() {
    if (!transitionLoader || isTransitioning) return;

    isTransitioning = true;
    transitionLoader.style.display = "flex";

    // Force reflow
    void transitionLoader.offsetWidth;

    transitionLoader.classList.remove("fade-out");
    transitionLoader.classList.add("fade-in");

    // Set a minimum display time (2 seconds)
    setTimeout(() => {
      // The actual page transition will happen after this
      // The fade-out will be handled by the new page's JS
    }, 5000);
  }

  // Hide transition loader (called on new page load)
  function hidePageTransition() {
    if (!transitionLoader || !isTransitioning) return;

    transitionLoader.classList.remove("fade-in");
    transitionLoader.classList.add("fade-out");

    setTimeout(() => {
      transitionLoader.style.display = "none";
      transitionLoader.classList.remove("fade-out");
      isTransitioning = false;
    }, 300);
  }

  // Intercept link clicks
  document.addEventListener("click", function (e) {
    // Find the closest anchor tag
    let target = e.target;
    while (target && target.tagName !== "A") {
      target = target.parentElement;
    }

    if (!target) return;

    const href = target.getAttribute("href");

    // Check if it's an external link or anchor link
    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:") ||
      href.startsWith("mailto:") ||
      href.startsWith("tel:") ||
      target.target === "_blank" ||
      target.hasAttribute("download")
    ) {
      return;
    }

    // Check if it's a same-origin link
    try {
      const url = new URL(href, window.location.origin);
      if (url.origin === window.location.origin) {
        e.preventDefault();
        showPageTransition();

        // Navigate after showing loader
        setTimeout(() => {
          window.location.href = href;
        }, 500); // Small delay before navigation
      }
    } catch (error) {
      console.error("Error parsing URL:", error);
    }
  });

  // Handle browser back/forward buttons
  window.addEventListener("beforeunload", function () {
    if (!isTransitioning) {
      showPageTransition();
    }
  });

  // Hide transition loader when page loads
  window.addEventListener("load", function () {
    setTimeout(() => {
      hidePageTransition();
    }, 100);
  });

  // Expose functions globally (for use in other pages)
  window.showPageTransition = showPageTransition;
  window.hidePageTransition = hidePageTransition;

  // Initial hide
  hidePageTransition();
})();

// =========================
// Main DOMContentLoaded Handler
// =========================
document.addEventListener("DOMContentLoaded", () => {
  console.log("=== PORTFOLIO SCRIPT LOADED ===");

  // -------------------------
  // Sticky navbar on scroll
  // -------------------------
  const navbar = document.querySelector(".navbar");
  const hero = document.querySelector("#home");

  if (navbar) {
    const handleSticky = () => {
      if (!navbar) return;
      const heroHeight = hero ? hero.offsetHeight : 600;
      const triggerY = Math.min(140, heroHeight * 0.25);
      navbar.classList.toggle("is-sticky", window.scrollY > triggerY);
    };

    window.addEventListener("scroll", handleSticky, { passive: true });
    handleSticky(); // Initial check
  }

  // -------------------------
  // Mobile menu (Hamburger)
  // -------------------------
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector("#mobile-menu");
  const menuOverlay = document.querySelector(".menu-overlay");

  const setMenuOpen = (open) => {
    if (!hamburger) return;

    hamburger.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", String(open));

    if (mobileMenu) mobileMenu.classList.toggle("active", open);
    if (menuOverlay) menuOverlay.classList.toggle("active", open);

    const icon = hamburger.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars", !open);
      icon.classList.toggle("fa-times", open);
    }

    document.body.classList.toggle("menu-open", open);
  };

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const open = !hamburger.classList.contains("active");
      setMenuOpen(open);
    });
  }

  if (menuOverlay) {
    menuOverlay.addEventListener("click", () => setMenuOpen(false));
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenuOpen(false);
  });

  document.querySelectorAll("#mobile-menu a.nav-link").forEach((a) => {
    a.addEventListener("click", () => {
      setMenuOpen(false);

      // For smooth scroll links, don't show page transition
      const href = a.getAttribute("href");
      if (href && href.startsWith("#")) {
        return;
      }
    });
  });

  // -------------------------
  // Smooth scroll (anchors)
  // -------------------------
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const navOffset = navbar ? navbar.offsetHeight + 16 : 90;
      const y = target.getBoundingClientRect().top + window.scrollY - navOffset;

      // Close mobile menu if open
      if (hamburger && hamburger.classList.contains("active")) {
        setMenuOpen(false);
      }

      window.scrollTo({ top: y, behavior: "smooth" });
    });
  });

  // -------------------------
  // Typewriter Effect
  // -------------------------
  const typewriterElement = document.getElementById("typewriter");
  if (typewriterElement) {
    const texts = [
      "Full-Stack Developer",
      "Data Analyst",
      "UI/UX Designer",
      "Creative Problem Solver",
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    function typewriterTick() {
      const fullText = texts[textIndex];

      if (isDeleting) {
        charIndex--;
      } else {
        charIndex++;
      }

      typewriterElement.textContent = fullText.slice(0, charIndex);

      let delay = isDeleting ? 50 : 100;

      // Pause at the end of typing
      if (!isDeleting && charIndex === fullText.length) {
        isDeleting = true;
        delay = 2000;
      }

      // Move to next word
      if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        delay = 500;
      }

      setTimeout(typewriterTick, delay);
    }

    // Start with a delay
    setTimeout(typewriterTick, 1000);
  }

  // -------------------------
  // Project Modal Functions
  // -------------------------
  window.openProjectModal = function (html) {
    const modal = document.getElementById("project-modal");
    if (!modal) return;

    const body = modal.querySelector(".modal-body");
    if (body) body.innerHTML = html || "";

    modal.classList.add("active");
    document.body.classList.add("modal-open");
  };

  window.closeProjectModal = function () {
    const modal = document.getElementById("project-modal");
    if (!modal) return;

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
  };

  // Close project modal by clicking backdrop
  const projectModal = document.getElementById("project-modal");
  if (projectModal) {
    projectModal.addEventListener("click", (e) => {
      if (e.target === projectModal) window.closeProjectModal();
    });
  }

  // -------------------------
  // Thank-you Modal Functions
  // -------------------------
  const thanksModal = document.getElementById("thanksModal");
  const thanksMsg = document.getElementById("thanksMessage");

  const showThanksModal = (message) => {
    if (!thanksModal) return;

    if (thanksMsg && message) thanksMsg.textContent = message;

    thanksModal.classList.add("is-open");
    thanksModal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
  };

  const closeThanksModal = () => {
    if (!thanksModal) return;

    thanksModal.classList.remove("is-open");
    thanksModal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
  };

  window.closeThanksModal = closeThanksModal;

  if (thanksModal) {
    thanksModal.addEventListener("click", (e) => {
      const close = e.target.closest("[data-close='true']");
      if (close) closeThanksModal();
    });
  }

  // -------------------------
  // Contact Form Submission
  // -------------------------
  const contactForm = document.getElementById("contact-form");
  const formStatus = document.getElementById("form-status");
  const sendBtn = document.getElementById("sendBtn");

  if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (sendBtn) {
        sendBtn.classList.add("is-sending");
        sendBtn.disabled = true;
      }

      if (formStatus) {
        formStatus.textContent = "";
      }

      try {
        const formData = new FormData(contactForm);
        const endpoint = contactForm.getAttribute("action");

        const res = await fetch(endpoint, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" },
        });

        if (res.ok) {
          contactForm.reset();
          showThanksModal(
            "Thanks for reaching out! I'll get back to you within 24 hours."
          );

          if (formStatus) {
            formStatus.textContent =
              "Message received ✅ I'll reply within 24 hours.";
            formStatus.style.color = "#22c55e";
          }
        } else {
          if (formStatus) {
            formStatus.textContent =
              "Oops — something went wrong. Please try again.";
            formStatus.style.color = "#ef4444";
          }
        }
      } catch (err) {
        console.error("Form submission error:", err);
        if (formStatus) {
          formStatus.textContent =
            "Network error — please check your internet and try again.";
          formStatus.style.color = "#ef4444";
        }
      } finally {
        if (sendBtn) {
          sendBtn.classList.remove("is-sending");
          sendBtn.disabled = false;
        }
      }
    });
  }

  // -------------------------
  // Portfolio Filtering & Search
  // -------------------------
  const portfolioGrid = document.getElementById("portfolio-grid");
  if (portfolioGrid) {
    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const searchInput = document.querySelector(".search-input");
    const emptyState = document.getElementById("portfolio-empty");
    const loadMoreBtn = document.getElementById("load-more");
    const statCounts = document.querySelectorAll(".stat-count");

    let visibleItems = 3;
    const totalItems = portfolioItems.length;

    // Animate stats counter
    if (statCounts.length > 0) {
      statCounts.forEach((stat) => {
        const target = parseInt(stat.getAttribute("data-count") || "0");
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          stat.textContent =
            Math.floor(current) + (stat.textContent.includes("+") ? "+" : "");
        }, 16);
      });
    }

    // Filter functionality
    if (filterBtns.length > 0) {
      filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
          filterBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          filterProjects();
        });
      });
    }

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener("input", filterProjects);
    }

    // Load more functionality
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        loadMoreBtn.classList.add("loading");

        setTimeout(() => {
          visibleItems += 3;
          updateVisibleItems();
          loadMoreBtn.classList.remove("loading");

          if (visibleItems >= totalItems) {
            loadMoreBtn.style.display = "none";
          }

          const loadMoreInfo = document.querySelector(".load-more-info");
          if (loadMoreInfo) {
            loadMoreInfo.textContent = `Showing ${Math.min(
              visibleItems,
              totalItems
            )} of ${totalItems} projects`;
          }
        }, 600);
      });
    }

    function filterProjects() {
      const activeFilter = document.querySelector(".filter-btn.active");
      const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
      let visibleCount = 0;

      portfolioItems.forEach((item, index) => {
        const category = item.dataset.category || "";
        const tags = item.dataset.tags ? item.dataset.tags.toLowerCase() : "";
        const titleElement = item.querySelector(".project-title");
        const descElement = item.querySelector(".project-description");

        const title = titleElement
          ? titleElement.textContent.toLowerCase()
          : "";
        const description = descElement
          ? descElement.textContent.toLowerCase()
          : "";

        const matchesFilter =
          !activeFilter ||
          activeFilter.dataset.filter === "all" ||
          category.includes(activeFilter.dataset.filter);

        const matchesSearch =
          !searchTerm ||
          title.includes(searchTerm) ||
          description.includes(searchTerm) ||
          tags.includes(searchTerm);

        if (matchesFilter && matchesSearch && index < visibleItems) {
          item.style.display = "block";
          visibleCount++;

          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, index * 50);
        } else {
          item.style.display = "none";
        }
      });

      // Show/hide empty state
      if (emptyState) {
        if (visibleCount === 0) {
          emptyState.style.display = "block";
          portfolioGrid.style.display = "none";
        } else {
          emptyState.style.display = "none";
          portfolioGrid.style.display = "grid";
        }
      }
    }

    function updateVisibleItems() {
      portfolioItems.forEach((item, index) => {
        if (index < visibleItems) {
          item.style.display = "block";
          setTimeout(() => {
            item.style.opacity = "1";
            item.style.transform = "translateY(0)";
          }, index * 50);
        }
      });
    }

    // Initial setup
    updateVisibleItems();
    if (loadMoreBtn && visibleItems >= totalItems) {
      loadMoreBtn.style.display = "none";
    }
  }

  // -------------------------
  // Back to Top Button
  // -------------------------
  const backToTop = document.querySelector(".back-to-top");
  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        if (window.pageYOffset > 300) {
          backToTop.classList.add("visible");
        } else {
          backToTop.classList.remove("visible");
        }
      },
      { passive: true }
    );
  }

  // -------------------------
  // Lightbox Functions
  // -------------------------
  window.openLightbox = function (imageSrc, caption) {
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const lightboxCaption = document.getElementById("lightbox-caption");

    if (lightbox && lightboxImg) {
      lightboxImg.src = imageSrc;
      lightboxImg.alt = caption;

      if (lightboxCaption) lightboxCaption.textContent = caption;

      lightbox.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  };

  window.closeLightbox = function () {
    const lightbox = document.getElementById("lightbox");
    if (lightbox) {
      lightbox.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  };

  // Close lightbox on escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      const lightbox = document.getElementById("lightbox");
      if (lightbox && lightbox.classList.contains("active")) {
        closeLightbox();
      }
      if (thanksModal && thanksModal.classList.contains("is-open")) {
        closeThanksModal();
      }
      const projectModal = document.getElementById("project-modal");
      if (projectModal && projectModal.classList.contains("active")) {
        closeProjectModal();
      }
    }
  });

  // -------------------------
  // Plexus Background with Interactive Effects
  // -------------------------
  const plexusCanvas = document.getElementById("poly-canvas");
  if (plexusCanvas) {
    console.log("Initializing Plexus Background...");

    const ctx = plexusCanvas.getContext("2d");
    let width, height;
    let dots = [];
    let mouse = { x: null, y: null, radius: 100 };
    let animationId;
    let time = 0;

    // Interactive zones that affect particles
    let interactiveZones = [];
    let clickEffects = [];

    // Color palette
    const colorSchemes = {
      primary: {
        dot: "rgba(255, 111, 97, 0.9)",
        line: "rgba(212, 165, 255, 0.3)",
        glow: "rgba(255, 111, 97, 0.15)",
      },
      secondary: {
        dot: "rgba(97, 168, 255, 0.9)",
        line: "rgba(165, 220, 255, 0.3)",
        glow: "rgba(97, 168, 255, 0.15)",
      },
      neon: {
        dot: "rgba(0, 255, 157, 0.9)",
        line: "rgba(255, 0, 242, 0.3)",
        glow: "rgba(0, 255, 157, 0.15)",
      },
    };

    let currentScheme = "primary";

    // Mouse tracking with smoothing
    const mouseTrail = [];
    const maxTrailLength = 5;

    document.addEventListener("mousemove", (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // Add to trail for secondary effects
      mouseTrail.push({ x: e.clientX, y: e.clientY, time: Date.now() });
      if (mouseTrail.length > maxTrailLength) mouseTrail.shift();
    });

    // Click effect
    document.addEventListener("click", (e) => {
      clickEffects.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 200,
        life: 1,
      });
    });

    // Touch support for mobile
    document.addEventListener("touchmove", (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      mouse.x = touch.clientX;
      mouse.y = touch.clientY;
    });

    function resizeCanvas() {
      width = plexusCanvas.width = window.innerWidth;
      height = plexusCanvas.height = window.innerHeight;
      initDots();
      initInteractiveZones();
    }

    function initInteractiveZones() {
      interactiveZones = [];

      // Create some automatic interactive zones
      const zoneCount = 3;
      for (let i = 0; i < zoneCount; i++) {
        interactiveZones.push({
          x: Math.random() * width,
          y: Math.random() * height,
          radius: 100 + Math.random() * 150,
          strength: 0.5 + Math.random() * 1,
          type: Math.random() > 0.5 ? "attract" : "repel",
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function initDots() {
      dots = [];
      const numDots = Math.floor((width * height) / 12000);

      for (let i = 0; i < numDots; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 2 + 1;
        const speed = 0.3 + Math.random() * 0.4;

        dots.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: radius,
          originalRadius: radius,
          color: colorSchemes[currentScheme].dot,
          connectionCount: 0,
          pulseOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawDot(dot, alpha = 1) {
      // Pulsing effect
      const pulse = Math.sin(time * 0.002 + dot.pulseOffset) * 0.5 + 0.5;
      const currentRadius = dot.radius * (0.8 + pulse * 0.4);

      // Glow effect
      const gradient = ctx.createRadialGradient(
        dot.x,
        dot.y,
        0,
        dot.x,
        dot.y,
        currentRadius * 3
      );

      gradient.addColorStop(0, dot.color.replace("0.9", alpha.toString()));
      gradient.addColorStop(
        0.5,
        dot.color.replace("0.9", (alpha * 0.3).toString())
      );
      gradient.addColorStop(1, "transparent");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, currentRadius, 0, Math.PI * 2);
      ctx.fill();

      // Inner highlight
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(
        dot.x - currentRadius * 0.3,
        dot.y - currentRadius * 0.3,
        currentRadius * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    function updateDots() {
      // Update interactive zones
      interactiveZones.forEach((zone) => {
        zone.pulse += 0.02;
        zone.radius = 80 + Math.sin(zone.pulse) * 40;
      });

      // Update click effects
      for (let i = clickEffects.length - 1; i >= 0; i--) {
        const effect = clickEffects[i];
        effect.radius += 5;
        effect.life -= 0.02;

        if (effect.life <= 0 || effect.radius > effect.maxRadius) {
          clickEffects.splice(i, 1);
        }
      }

      dots.forEach((dot) => {
        // Mouse interaction with trail
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            const force = Math.pow((mouse.radius - dist) / mouse.radius, 2) * 4;
            const angle = Math.atan2(dy, dx);
            dot.x -= Math.cos(angle) * force;
            dot.y -= Math.sin(angle) * force;
          }

          // Mouse trail interaction
          mouseTrail.forEach((trailPoint, index) => {
            const trailDx = trailPoint.x - dot.x;
            const trailDy = trailPoint.y - dot.y;
            const trailDist = Math.sqrt(trailDx * trailDx + trailDy * trailDy);

            if (trailDist < 60) {
              const trailForce =
                ((60 - trailDist) / 60) * 1.5 * (index / mouseTrail.length);
              const trailAngle = Math.atan2(trailDy, trailDx);
              dot.x += Math.cos(trailAngle) * trailForce;
              dot.y += Math.sin(trailAngle) * trailForce;
            }
          });
        }

        // Interactive zones
        interactiveZones.forEach((zone) => {
          const dx = zone.x - dot.x;
          const dy = zone.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < zone.radius) {
            const strength =
              Math.pow((zone.radius - dist) / zone.radius, 2) * zone.strength;
            const angle = Math.atan2(dy, dx);

            if (zone.type === "attract") {
              dot.x += Math.cos(angle) * strength;
              dot.y += Math.sin(angle) * strength;
            } else {
              dot.x -= Math.cos(angle) * strength;
              dot.y -= Math.sin(angle) * strength;
            }
          }
        });

        // Click effects
        clickEffects.forEach((effect) => {
          const dx = effect.x - dot.x;
          const dy = effect.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < effect.radius) {
            const force =
              Math.pow((effect.radius - dist) / effect.radius, 2) *
              effect.life *
              6;
            const angle = Math.atan2(dy, dx);
            dot.x += Math.cos(angle) * force;
            dot.y += Math.sin(angle) * force;
          }
        });

        // Natural movement with boundary wrapping
        dot.x += dot.vx;
        dot.y += dot.vy;

        // Wrap around edges
        if (dot.x < -50) dot.x = width + 50;
        if (dot.x > width + 50) dot.x = -50;
        if (dot.y < -50) dot.y = height + 50;
        if (dot.y > height + 50) dot.y = -50;
      });
    }

    function drawConnections() {
      dots.sort((a, b) => a.y - b.y); // Sort for better layering

      // Reset connection counts
      dots.forEach((dot) => (dot.connectionCount = 0));

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            // Calculate opacity based on distance
            const opacity = Math.pow(1 - distance / 120, 2) * 0.3;

            // Line gradient based on dot positions
            const gradient = ctx.createLinearGradient(
              dots[i].x,
              dots[i].y,
              dots[j].x,
              dots[j].y
            );

            gradient.addColorStop(
              0,
              colorSchemes[currentScheme].line.replace(
                "0.3",
                opacity.toString()
              )
            );
            gradient.addColorStop(
              1,
              colorSchemes[currentScheme].line.replace(
                "0.3",
                (opacity * 0.7).toString()
              )
            );

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 0.5 + (1 - distance / 120) * 1.5;

            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);

            // Add subtle curve for organic feel
            const midX = (dots[i].x + dots[j].x) / 2;
            const midY = (dots[i].y + dots[j].y) / 2;
            const offset = Math.sin(time * 0.003 + i + j) * 3;

            ctx.quadraticCurveTo(
              midX + Math.cos(time * 0.001 + i) * offset,
              midY + Math.sin(time * 0.001 + i) * offset,
              dots[j].x,
              dots[j].y
            );

            ctx.stroke();

            dots[i].connectionCount++;
            dots[j].connectionCount++;
          }
        }
      }
    }

    function drawEffects() {
      // Draw click effects
      clickEffects.forEach((effect) => {
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.strokeStyle = colorSchemes[currentScheme].glow.replace(
          "0.15",
          (effect.life * 0.3).toString()
        );
        ctx.lineWidth = 2;
        ctx.stroke();
      });

      // Draw interactive zones
      interactiveZones.forEach((zone) => {
        ctx.beginPath();
        ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
        ctx.strokeStyle =
          zone.type === "attract"
            ? "rgba(0, 255, 157, 0.1)"
            : "rgba(255, 0, 100, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Add subtle background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, "rgba(10, 10, 20, 0.05)");
      bgGradient.addColorStop(1, "rgba(20, 10, 30, 0.05)");
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      time++;

      updateDots();
      drawConnections();

      // Draw dots with connection-based size
      dots.forEach((dot) => {
        const sizeMultiplier = 1 + Math.min(dot.connectionCount * 0.1, 0.5);
        dot.radius = dot.originalRadius * sizeMultiplier;
        drawDot(dot);
      });

      drawEffects();

      // Subtle vignette effect
      const vignette = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        Math.max(width, height) / 1.5
      );
      vignette.addColorStop(0, "transparent");
      vignette.addColorStop(1, "rgba(0, 0, 0, 0.1)");
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(animate);
    }

    // Performance optimization for inactive tabs
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        cancelAnimationFrame(animationId);
      } else {
        animate();
      }
    });

    window.addEventListener("resize", resizeCanvas);

    // Initialize
    resizeCanvas();
    animate();
  }

  // -------------------------
  // Enhanced Custom Cursor
  // -------------------------
  const customCursor = document.querySelector(".custom-cursor");
  if (customCursor) {
    console.log("Initializing Custom Cursor...");

    let cursorX = 0;
    let cursorY = 0;
    let cursorTrail = [];
    const trailLength = 5;
    let isHovering = false;
    let cursorScale = 1;

    // Create cursor trail elements
    for (let i = 0; i < trailLength; i++) {
      const trailDot = document.createElement("div");
      trailDot.className = "cursor-trail";
      trailDot.style.cssText = `
        position: fixed;
        width: 6px;
        height: 6px;
        background: rgba(212, 165, 255, ${0.5 - i * 0.1});
        border-radius: 50%;
        pointer-events: none;
        z-index: 9998;
        transform: translate(-50%, -50%);
        transition: opacity 0.2s ease;
      `;
      document.body.appendChild(trailDot);
      cursorTrail.push({ el: trailDot, x: 0, y: 0 });
    }

    // Smooth cursor movement with trail
    function updateCursor(e) {
      cursorX = e.clientX;
      cursorY = e.clientY;

      // Update trail with delay
      cursorTrail.forEach((trail, index) => {
        setTimeout(() => {
          trail.x = cursorX;
          trail.y = cursorY;
          trail.el.style.left = trail.x + "px";
          trail.el.style.top = trail.y + "px";
          trail.el.style.opacity = isHovering ? "0.3" : "0.5";
        }, index * 20);
      });

      // Main cursor
      customCursor.style.left = cursorX + "px";
      customCursor.style.top = cursorY + "px";

      // Add slight rotation on movement
      const velocityX = e.movementX || 0;
      const velocityY = e.movementY || 0;
      const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      const rotation = velocity * 0.02;

      customCursor.style.transform = `translate(-50%, -50%) rotate(${rotation}deg) scale(${cursorScale})`;
    }

    document.addEventListener("mousemove", updateCursor);

    // Enhanced hover detection
    const hoverables = document.querySelectorAll(
      'a, button, .btn, [role="button"], input, select, textarea, label, .clickable, .hover-effect, [data-cursor-hover]'
    );

    hoverables.forEach((el) => {
      el.addEventListener("mouseenter", (e) => {
        customCursor.classList.add("hover");
        isHovering = true;
        cursorScale = 1.5;

        // Add specific class based on element type
        if (el.tagName === "A") customCursor.classList.add("hover-link");
        if (el.tagName === "BUTTON") customCursor.classList.add("hover-button");
        if (el.tagName === "INPUT") customCursor.classList.add("hover-input");

        // Add ripple effect on some elements
        if (el.hasAttribute("data-cursor-ripple")) {
          const ripple = document.createElement("div");
          ripple.className = "cursor-ripple";
          ripple.style.cssText = `
            position: absolute;
            width: 50px;
            height: 50px;
            border: 2px solid rgba(212, 165, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out forwards;
            z-index: 9999;
          `;
          document.body.appendChild(ripple);

          setTimeout(() => {
            ripple.style.left = e.clientX - 25 + "px";
            ripple.style.top = e.clientY - 25 + "px";
          }, 10);

          setTimeout(() => ripple.remove(), 600);
        }
      });

      el.addEventListener("mouseleave", () => {
        customCursor.classList.remove(
          "hover",
          "hover-link",
          "hover-button",
          "hover-input"
        );
        isHovering = false;
        cursorScale = 1;
      });
    });

    // Click animation
    document.addEventListener("mousedown", () => {
      customCursor.classList.add("click");
      cursorScale = 0.8;
    });

    document.addEventListener("mouseup", () => {
      customCursor.classList.remove("click");
      cursorScale = isHovering ? 1.5 : 1;
    });

    // Hide cursor when leaving window
    document.addEventListener("mouseleave", () => {
      customCursor.style.opacity = "0";
      cursorTrail.forEach((trail) => (trail.el.style.opacity = "0"));
    });

    document.addEventListener("mouseenter", () => {
      customCursor.style.opacity = "1";
      cursorTrail.forEach((trail) => (trail.el.style.opacity = "0.5"));
    });

    // Add CSS for ripple animation
    if (!document.querySelector("#cursor-styles")) {
      const style = document.createElement("style");
      style.id = "cursor-styles";
      style.textContent = `
        @keyframes ripple {
          0% { transform: scale(0.1); opacity: 1; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        @keyframes cursorPulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          50% { transform: translate(-50%, -50%) scale(1.1); }
        }
        
        .custom-cursor.hover {
          animation: cursorPulse 2s infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // -------------------------
  // Initialize Demos
  // -------------------------
  console.log("Initializing demos...");

  // Utility functions
  const utils = {
    random(min, max) {
      return Math.random() * (max - min) + min;
    },
    clamp(value, min, max) {
      return Math.min(Math.max(value, min), max);
    },
    distance(x1, y1, x2, y2) {
      return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    },
  };
  // ✅ Only smooth-scroll for in-page anchors, allow normal navigation for .html pages
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    const href = link.getAttribute("href");
    if (!href) return;

    // Allow external links + normal pages
    const isHash = href.startsWith("#");
    if (!isHash) return;

    // Only block default for hash links
    e.preventDefault();

    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });

    // Optional: close mobile menu after click
    const mobileMenu = document.getElementById("mobile-menu");
    const overlay = document.querySelector(".menu-overlay");
    const hamburger = document.querySelector(".hamburger");
    if (mobileMenu && overlay && hamburger) {
      mobileMenu.classList.remove("open");
      overlay.classList.remove("active");
      hamburger.setAttribute("aria-expanded", "false");
    }
  });

  // =========================
  // ENHANCED PARTICLE GALAXY
  // =========================
  const galaxyCanvas = document.getElementById("galaxyCanvas");
  if (galaxyCanvas) {
    console.log("Initializing Enhanced Cosmic Galaxy...");

    class EnhancedParticleGalaxy {
      constructor() {
        this.canvas = galaxyCanvas;
        this.ctx = this.canvas.getContext("2d");
        this.resizeCanvas();

        // Enhanced properties
        this.particles = [];
        this.blackHoles = [];
        this.nebulae = [];
        this.supernovae = [];
        this.gravity = 1.5;
        this.trailOpacity = 0.85;
        this.warpStrength = 0.8;
        this.lastTime = 0;
        this.fps = 60;
        this.time = 0;

        // Create initial cosmic scene
        this.createStars(300);
        this.createNebulae(3);
        this.setupControls();
        this.animate();

        // Add a central black hole
        setTimeout(() => {
          this.addBlackHole(this.canvas.width / 2, this.canvas.height / 2);
        }, 1000);

        // Add occasional supernovae
        this.startSupernovaEvents();
      }

      resizeCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = Math.min(400, window.innerHeight * 0.4);
      }

      createStars(count) {
        for (let i = 0; i < count; i++) {
          const starType = Math.random();
          let radius, brightness, speed, color;

          // Different star types
          if (starType < 0.7) {
            // Main sequence stars
            radius = Math.random() * 1.5 + 0.5;
            brightness = Math.random() * 0.6 + 0.4;
            speed = Math.random() * 0.3 + 0.1;
            color = this.getStarColor(6000 + Math.random() * 4000);
          } else if (starType < 0.9) {
            // Red giants
            radius = Math.random() * 3 + 2;
            brightness = Math.random() * 0.8 + 0.2;
            speed = Math.random() * 0.2 + 0.05;
            color = this.getStarColor(3000 + Math.random() * 2000);
          } else {
            // Blue supergiants
            radius = Math.random() * 2.5 + 1.5;
            brightness = Math.random() * 0.9 + 0.6;
            speed = Math.random() * 0.4 + 0.2;
            color = this.getStarColor(15000 + Math.random() * 10000);
          }

          this.particles.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * speed,
            vy: (Math.random() - 0.5) * speed,
            radius: radius,
            originalRadius: radius,
            color: color,
            brightness: brightness,
            trail: [],
            maxTrail: Math.floor(Math.random() * 10 + 10),
            twinklePhase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 2 + 0.5,
            flickerRate: Math.random() * 0.02 + 0.01,
            type: starType < 0.7 ? "main" : starType < 0.9 ? "red" : "blue",
            hasGlare: Math.random() > 0.7,
            glareAngle: Math.random() * Math.PI * 2,
          });
        }
        this.updateStats();
      }

      getStarColor(temperature) {
        // Convert temperature to RGB color (simplified)
        let r, g, b;

        if (temperature < 4000) {
          // Red
          r = 255;
          g = Math.floor(255 * (temperature / 4000));
          b = Math.floor(255 * ((temperature / 4000) * 0.5));
        } else if (temperature < 8000) {
          // Yellow to white
          r = 255;
          g = 255;
          b = Math.floor(255 * ((temperature - 4000) / 4000));
        } else {
          // Blue
          r = Math.floor(255 * (1 - (temperature - 8000) / 8000));
          g = Math.floor(255 * (1 - (temperature - 8000) / 12000));
          b = 255;
        }

        return `rgb(${r}, ${g}, ${b})`;
      }

      createNebulae(count) {
        for (let i = 0; i < count; i++) {
          this.nebulae.push({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            radius: Math.random() * 100 + 50,
            color: `hsl(${Math.random() * 60 + 250}, 70%, 50%)`,
            density: Math.random() * 0.3 + 0.1,
            pulse: Math.random() * Math.PI * 2,
            pulseSpeed: Math.random() * 0.01 + 0.005,
          });
        }
      }

      addBlackHole(x, y, mass = 1500) {
        const blackHole = {
          x: x || this.canvas.width / 2,
          y: y || this.canvas.height / 2,
          radius: 18,
          mass: mass,
          glowPulse: 0,
          rotation: 0,
          accretionDisk: [],
          hasGravitationalLensing: true,
          lensingStrength: 1.2,
        };

        // Create accretion disk particles
        for (let i = 0; i < 50; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance =
            blackHole.radius * 3 + Math.random() * blackHole.radius * 4;
          blackHole.accretionDisk.push({
            angle: angle,
            distance: distance,
            speed: Math.sqrt(blackHole.mass / distance) * 0.1,
            size: Math.random() * 2 + 1,
            heat: Math.random() * 0.8 + 0.2,
          });
        }

        this.blackHoles.push(blackHole);
        this.updateStats();
      }

      createSupernova(x, y) {
        const supernova = {
          x: x || Math.random() * this.canvas.width,
          y: y || Math.random() * this.canvas.height,
          age: 0,
          maxAge: 120, // frames
          radius: 0,
          maxRadius: Math.random() * 50 + 30,
          shockwaveRadius: 0,
          particles: [],
          color: `hsl(${Math.random() * 40 + 30}, 100%, 60%)`,
        };

        // Create explosion particles
        for (let i = 0; i < 100; i++) {
          supernova.particles.push({
            angle: Math.random() * Math.PI * 2,
            speed: Math.random() * 3 + 1,
            distance: 0,
            size: Math.random() * 3 + 1,
            decay: Math.random() * 0.03 + 0.01,
          });
        }

        this.supernovae.push(supernova);

        // Remove a nearby star
        const nearestStar = this.findNearestStar(supernova.x, supernova.y);
        if (nearestStar) {
          const index = this.particles.indexOf(nearestStar);
          if (index > -1) {
            this.particles.splice(index, 1);
          }
        }
      }

      findNearestStar(x, y) {
        let nearest = null;
        let nearestDist = Infinity;

        this.particles.forEach((star) => {
          const dx = star.x - x;
          const dy = star.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < nearestDist && dist < 50) {
            nearestDist = dist;
            nearest = star;
          }
        });

        return nearest;
      }

      animate(timestamp) {
        this.time++;

        // Calculate FPS
        if (this.lastTime) {
          this.fps = Math.round(1000 / (timestamp - this.lastTime));
        }
        this.lastTime = timestamp;

        // Update FPS display
        const fpsEl = document.getElementById("galaxyFPS");
        if (fpsEl) fpsEl.textContent = this.fps;

        // Clear canvas with space background
        this.drawSpaceBackground();

        // Update and draw nebulae
        this.updateNebulae();

        // Update and draw particles with enhanced effects
        this.updateParticles();

        // Update and draw black holes with accretion disks
        this.updateBlackHoles();

        // Update and draw supernovae
        this.updateSupernovae();

        // Draw gravitational lensing effects
        this.drawGravitationalLensing();

        this.updateStats();
        requestAnimationFrame((t) => this.animate(t));
      }

      drawSpaceBackground() {
        // Deep space gradient
        const gradient = this.ctx.createLinearGradient(
          0,
          0,
          0,
          this.canvas.height
        );
        gradient.addColorStop(0, "#0a0a1a");
        gradient.addColorStop(1, "#1e1b4b");

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Subtle starfield background
        this.ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
        for (let i = 0; i < 50; i++) {
          const x =
            ((this.time * 0.1 + i * 100) % (this.canvas.width + 200)) - 100;
          const y =
            Math.sin(i * 0.5 + this.time * 0.02) * 50 + this.canvas.height / 2;
          const size = Math.sin(this.time * 0.02 + i) * 0.5 + 1;

          this.ctx.beginPath();
          this.ctx.arc(x, y, size, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      updateNebulae() {
        this.nebulae.forEach((nebula) => {
          nebula.pulse += nebula.pulseSpeed;
          const pulse = Math.sin(nebula.pulse) * 0.3 + 0.7;

          // Draw nebula glow
          const gradient = this.ctx.createRadialGradient(
            nebula.x,
            nebula.y,
            0,
            nebula.x,
            nebula.y,
            nebula.radius * pulse
          );
          gradient.addColorStop(
            0,
            `${nebula.color.replace(")", ", 0.8)").replace("hsl", "hsla")}`
          );
          gradient.addColorStop(
            1,
            `${nebula.color.replace(")", ", 0)").replace("hsl", "hsla")}`
          );

          this.ctx.globalCompositeOperation = "lighter";
          this.ctx.fillStyle = gradient;
          this.ctx.beginPath();
          this.ctx.arc(
            nebula.x,
            nebula.y,
            nebula.radius * pulse,
            0,
            Math.PI * 2
          );
          this.ctx.fill();
          this.ctx.globalCompositeOperation = "source-over";
        });
      }

      updateParticles() {
        const time = Date.now() * 0.001;

        this.particles.forEach((p) => {
          // Update trail
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > p.maxTrail) p.trail.shift();

          // Apply gravitational forces from black holes
          this.blackHoles.forEach((bh) => {
            const dx = bh.x - p.x;
            const dy = bh.y - p.y;
            const dist = Math.max(5, Math.sqrt(dx * dx + dy * dy));

            // Realistic inverse square law gravity
            const force = (bh.mass / (dist * dist)) * this.gravity * 0.15;

            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;

            // Warp effect near black holes
            if (dist < bh.radius * 10) {
              const warp = (1 - dist / (bh.radius * 10)) * this.warpStrength;
              const angle = Math.atan2(dy, dx);
              p.vx += Math.cos(angle + Math.PI / 2) * warp * 0.5;
              p.vy += Math.sin(angle + Math.PI / 2) * warp * 0.5;
            }
          });

          // Natural motion damping
          p.vx *= 0.995;
          p.vy *= 0.995;

          // Update position
          p.x += p.vx;
          p.y += p.vy;

          // Boundary handling with slight bounce
          const margin = 20;
          if (p.x < -margin) p.x = this.canvas.width + margin;
          if (p.x > this.canvas.width + margin) p.x = -margin;
          if (p.y < -margin) p.y = this.canvas.height + margin;
          if (p.y > this.canvas.height + margin) p.y = -margin;

          // Dynamic twinkle with flicker
          const twinkle =
            Math.sin(time * p.twinkleSpeed + p.twinklePhase) * 0.2 + 0.9;
          const flicker = Math.random() > p.flickerRate ? 1 : 0.7;
          const brightness = p.brightness * twinkle * flicker;

          // Update star radius based on brightness
          p.radius = p.originalRadius * brightness;

          // Draw trail with fading effect
          p.trail.forEach((point, i) => {
            const alpha = (i / p.trail.length) * 0.3 * brightness;
            this.ctx.fillStyle = p.color
              .replace("rgb", "rgba")
              .replace(")", `, ${alpha})`);
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, p.radius * 0.5, 0, Math.PI * 2);
            this.ctx.fill();
          });

          // Draw star with enhanced glow
          this.drawStar(p, brightness);

          // Draw star glare for bright stars
          if (p.hasGlare && brightness > 0.6) {
            this.drawStarGlare(p, brightness);
          }
        });
      }

      drawStar(star, brightness) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = "lighter";

        // Outer glow
        const outerGlow = this.ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 6
        );
        outerGlow.addColorStop(
          0,
          `${star.color.replace(")", ", 0.4)").replace("rgb", "rgba")}`
        );
        outerGlow.addColorStop(
          0.5,
          `${star.color.replace(")", ", 0.1)").replace("rgb", "rgba")}`
        );
        outerGlow.addColorStop(1, "rgba(0,0,0,0)");

        this.ctx.fillStyle = outerGlow;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius * 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Inner glow
        const innerGlow = this.ctx.createRadialGradient(
          star.x,
          star.y,
          0,
          star.x,
          star.y,
          star.radius * 3
        );
        innerGlow.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        innerGlow.addColorStop(
          0.7,
          `${star.color.replace(")", ", 0.6)").replace("rgb", "rgba")}`
        );
        innerGlow.addColorStop(1, "rgba(0,0,0,0)");

        this.ctx.fillStyle = innerGlow;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius * 3, 0, Math.PI * 2);
        this.ctx.fill();

        // Star core
        this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.9})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
      }

      drawStarGlare(star, brightness) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = "lighter";
        this.ctx.translate(star.x, star.y);
        this.ctx.rotate(star.glareAngle + this.time * 0.01);

        const glareLength = star.radius * 8 * brightness;
        const glareWidth = star.radius * 1.5;

        // Horizontal glare
        const gradient1 = this.ctx.createLinearGradient(
          -glareLength,
          0,
          glareLength,
          0
        );
        gradient1.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient1.addColorStop(0.3, `rgba(255, 255, 255, ${brightness * 0.2})`);
        gradient1.addColorStop(0.5, `rgba(255, 255, 255, ${brightness * 0.3})`);
        gradient1.addColorStop(0.7, `rgba(255, 255, 255, ${brightness * 0.2})`);
        gradient1.addColorStop(1, "rgba(255, 255, 255, 0)");

        this.ctx.fillStyle = gradient1;
        this.ctx.fillRect(
          -glareLength,
          -glareWidth / 2,
          glareLength * 2,
          glareWidth
        );

        // Vertical glare
        this.ctx.rotate(Math.PI / 2);
        const gradient2 = this.ctx.createLinearGradient(
          -glareLength * 0.7,
          0,
          glareLength * 0.7,
          0
        );
        gradient2.addColorStop(0, "rgba(255, 255, 255, 0)");
        gradient2.addColorStop(
          0.5,
          `rgba(255, 255, 255, ${brightness * 0.15})`
        );
        gradient2.addColorStop(1, "rgba(255, 255, 255, 0)");

        this.ctx.fillStyle = gradient2;
        this.ctx.fillRect(
          -glareLength * 0.7,
          -glareWidth / 3,
          glareLength * 1.4,
          glareWidth * 0.7
        );

        this.ctx.restore();
      }

      updateBlackHoles() {
        const time = Date.now() * 0.001;

        this.blackHoles.forEach((bh) => {
          // Update rotation and pulse
          bh.rotation += 0.01;
          bh.glowPulse = Math.sin(time * 1.5) * 0.4 + 0.6;

          // Update accretion disk
          bh.accretionDisk.forEach((particle) => {
            particle.angle += particle.speed;
            particle.heat = Math.sin(time * 2 + particle.angle) * 0.3 + 0.7;
          });

          // Draw black hole with enhanced effects
          this.drawBlackHole(bh, time);
        });
      }

      drawBlackHole(bh, time) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = "lighter";

        // Schwarzschild radius glow (gravitational lensing effect)
        if (bh.hasGravitationalLensing) {
          const lensingGradient = this.ctx.createRadialGradient(
            bh.x,
            bh.y,
            bh.radius * 0.5,
            bh.x,
            bh.y,
            bh.radius * 4
          );
          lensingGradient.addColorStop(0, "rgba(0, 0, 0, 0.9)");
          lensingGradient.addColorStop(
            0.3,
            `rgba(50, 0, 100, ${bh.glowPulse * 0.3})`
          );
          lensingGradient.addColorStop(
            0.6,
            `rgba(100, 20, 200, ${bh.glowPulse * 0.15})`
          );
          lensingGradient.addColorStop(1, "rgba(180, 76, 255, 0)");

          this.ctx.fillStyle = lensingGradient;
          this.ctx.beginPath();
          this.ctx.arc(bh.x, bh.y, bh.radius * 4, 0, Math.PI * 2);
          this.ctx.fill();
        }

        // Accretion disk
        bh.accretionDisk.forEach((particle) => {
          const x = bh.x + Math.cos(particle.angle) * particle.distance;
          const y = bh.y + Math.sin(particle.angle) * particle.distance;

          // Heat-based color
          const heatColor = `hsl(${330 - particle.heat * 50}, 100%, ${
            50 + particle.heat * 30
          }%)`;

          // Draw disk particle with motion blur
          this.ctx.save();
          this.ctx.translate(x, y);
          this.ctx.rotate(particle.angle + Math.PI / 2);

          const particleGradient = this.ctx.createLinearGradient(
            -particle.size,
            0,
            particle.size,
            0
          );
          particleGradient.addColorStop(0, "rgba(255, 255, 255, 0)");
          particleGradient.addColorStop(
            0.5,
            `${heatColor.replace(")", ", 0.8)").replace("hsl", "hsla")}`
          );
          particleGradient.addColorStop(1, "rgba(255, 255, 255, 0)");

          this.ctx.fillStyle = particleGradient;
          this.ctx.fillRect(
            -particle.size * 2,
            -particle.size / 2,
            particle.size * 4,
            particle.size
          );

          this.ctx.restore();
        });

        // Event horizon glow
        const horizonGradient = this.ctx.createRadialGradient(
          bh.x,
          bh.y,
          bh.radius * 0.8,
          bh.x,
          bh.y,
          bh.radius * 2.5
        );
        horizonGradient.addColorStop(
          0,
          `rgba(0, 0, 0, ${0.8 + bh.glowPulse * 0.2})`
        );
        horizonGradient.addColorStop(
          0.7,
          `rgba(100, 20, 200, ${bh.glowPulse * 0.4})`
        );
        horizonGradient.addColorStop(
          1,
          `rgba(180, 76, 255, ${bh.glowPulse * 0.1})`
        );

        this.ctx.fillStyle = horizonGradient;
        this.ctx.beginPath();
        this.ctx.arc(bh.x, bh.y, bh.radius * 2.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Photon sphere
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${
          0.2 + Math.sin(time * 3) * 0.1
        })`;
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]);
        this.ctx.beginPath();
        this.ctx.arc(bh.x, bh.y, bh.radius * 1.5, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Inner accretion disk
        this.ctx.strokeStyle = `rgba(255, 100, 255, ${
          0.4 + Math.cos(time * 2) * 0.2
        })`;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(bh.x, bh.y, bh.radius * 3, 0, Math.PI * 2);
        this.ctx.stroke();

        // Black hole singularity (true black)
        this.ctx.fillStyle = "#000";
        this.ctx.beginPath();
        this.ctx.arc(bh.x, bh.y, bh.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
      }

      drawGravitationalLensing() {
        this.blackHoles.forEach((bh) => {
          if (!bh.hasGravitationalLensing) return;

          // Create distortion effect around black hole
          this.ctx.save();
          this.ctx.globalCompositeOperation = "source-over";

          // Draw lensing rings
          for (let i = 0; i < 3; i++) {
            const radius = bh.radius * (2 + i * 1.5);
            const alpha = 0.1 - i * 0.03;

            this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.arc(
              bh.x,
              bh.y,
              radius + Math.sin(this.time * 0.02 + i) * 2,
              0,
              Math.PI * 2
            );
            this.ctx.stroke();
          }

          this.ctx.restore();
        });
      }

      updateSupernovae() {
        for (let i = this.supernovae.length - 1; i >= 0; i--) {
          const sn = this.supernovae[i];
          sn.age++;

          if (sn.age > sn.maxAge) {
            this.supernovae.splice(i, 1);
            continue;
          }

          const progress = sn.age / sn.maxAge;
          sn.radius = sn.maxRadius * (1 - Math.pow(1 - progress, 2));
          sn.shockwaveRadius = sn.maxRadius * 1.5 * progress;

          // Draw supernova
          this.drawSupernova(sn, progress);

          // Update and draw explosion particles
          sn.particles.forEach((p) => {
            p.distance += p.speed;
            p.size *= 1 - p.decay;

            if (p.size > 0) {
              const x = sn.x + Math.cos(p.angle) * p.distance;
              const y = sn.y + Math.sin(p.angle) * p.distance;

              const alpha = (1 - progress) * 0.7;
              this.ctx.fillStyle = `${sn.color
                .replace(")", `, ${alpha})`)
                .replace("hsl", "hsla")}`;
              this.ctx.beginPath();
              this.ctx.arc(x, y, p.size, 0, Math.PI * 2);
              this.ctx.fill();
            }
          });
        }
      }

      drawSupernova(sn, progress) {
        this.ctx.save();
        this.ctx.globalCompositeOperation = "lighter";

        // Shockwave
        const shockwaveGradient = this.ctx.createRadialGradient(
          sn.x,
          sn.y,
          sn.radius,
          sn.x,
          sn.y,
          sn.shockwaveRadius
        );
        shockwaveGradient.addColorStop(
          0,
          `${sn.color.replace(")", ", 0.8)").replace("hsl", "hsla")}`
        );
        shockwaveGradient.addColorStop(
          0.7,
          `${sn.color.replace(")", ", 0.3)").replace("hsl", "hsla")}`
        );
        shockwaveGradient.addColorStop(1, "rgba(0,0,0,0)");

        this.ctx.fillStyle = shockwaveGradient;
        this.ctx.beginPath();
        this.ctx.arc(sn.x, sn.y, sn.shockwaveRadius, 0, Math.PI * 2);
        this.ctx.fill();

        // Core explosion
        const coreGradient = this.ctx.createRadialGradient(
          sn.x,
          sn.y,
          0,
          sn.x,
          sn.y,
          sn.radius
        );
        coreGradient.addColorStop(0, "rgba(255, 255, 255, 0.9)");
        coreGradient.addColorStop(
          0.5,
          `${sn.color.replace(")", ", 0.7)").replace("hsl", "hsla")}`
        );
        coreGradient.addColorStop(1, "rgba(0,0,0,0)");

        this.ctx.fillStyle = coreGradient;
        this.ctx.beginPath();
        this.ctx.arc(sn.x, sn.y, sn.radius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
      }

      startSupernovaEvents() {
        setInterval(() => {
          if (Math.random() > 0.7 && this.particles.length > 50) {
            this.createSupernova();
          }
        }, 5000);
      }

      reset() {
        this.particles = [];
        this.blackHoles = [];
        this.nebulae = [];
        this.supernovae = [];
        this.createStars(300);
        this.createNebulae(3);
      }

      addStar(x, y) {
        const starType = Math.random();
        let radius, color;

        if (starType < 0.8) {
          radius = Math.random() * 2 + 1;
          color = this.getStarColor(6000 + Math.random() * 4000);
        } else {
          radius = Math.random() * 3 + 2;
          color = this.getStarColor(3000 + Math.random() * 3000);
        }

        this.particles.push({
          x: x || Math.random() * this.canvas.width,
          y: y || Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          radius: radius,
          originalRadius: radius,
          color: color,
          brightness: Math.random() * 0.7 + 0.5,
          trail: [],
          maxTrail: 15,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 2 + 0.5,
          flickerRate: Math.random() * 0.02 + 0.01,
          type: starType < 0.8 ? "main" : "red",
          hasGlare: Math.random() > 0.5,
        });
        this.updateStats();
      }

      updateStats() {
        const starCountEl = document.getElementById("starCount");
        if (starCountEl) starCountEl.textContent = this.particles.length;

        const blackHoleCountEl = document.getElementById("blackHoleCount");
        if (blackHoleCountEl)
          blackHoleCountEl.textContent = this.blackHoles.length;
      }

      setupControls() {
        // Gravity slider
        const gravitySlider = document.getElementById("gravitySlider");
        if (gravitySlider) {
          gravitySlider.addEventListener("input", (e) => {
            this.gravity = parseFloat(e.target.value);
            const gravityValue = document.getElementById("gravityValue");
            if (gravityValue)
              gravityValue.textContent = this.gravity.toFixed(1);
          });
        }

        // Trail slider
        const trailSlider = document.getElementById("trailSlider");
        if (trailSlider) {
          trailSlider.addEventListener("input", (e) => {
            this.trailOpacity = parseFloat(e.target.value);
            const trailValue = document.getElementById("trailValue");
            if (trailValue)
              trailValue.textContent = this.trailOpacity.toFixed(1);
          });
        }

        // Warp strength slider
        const warpSlider = document.createElement("input");
        warpSlider.type = "range";
        warpSlider.min = "0";
        warpSlider.max = "2";
        warpSlider.step = "0.1";
        warpSlider.value = this.warpStrength;
        warpSlider.style.width = "100%";

        warpSlider.addEventListener("input", (e) => {
          this.warpStrength = parseFloat(e.target.value);
        });

        // Add warp control if needed
        const controlsContainer = document.querySelector(".controls");
        if (controlsContainer) {
          const warpControl = document.createElement("div");
          warpControl.className = "control-group";
          warpControl.innerHTML = `
          <label>Warp Strength</label>
          <input type="range" min="0" max="2" step="0.1" value="${
            this.warpStrength
          }" id="warpSlider">
          <div class="value-display">${this.warpStrength.toFixed(1)}</div>
        `;
          controlsContainer.appendChild(warpControl);

          document
            .getElementById("warpSlider")
            .addEventListener("input", (e) => {
              this.warpStrength = parseFloat(e.target.value);
              e.target.nextElementSibling.textContent =
                this.warpStrength.toFixed(1);
            });
        }

        // Buttons
        document
          .getElementById("galaxyReset")
          ?.addEventListener("click", () => this.reset());

        document
          .getElementById("galaxyAddStar")
          ?.addEventListener("click", () => this.addStar());

        document
          .getElementById("galaxyAddBlackHole")
          ?.addEventListener("click", () => {
            this.addBlackHole(
              Math.random() * this.canvas.width,
              Math.random() * this.canvas.height,
              Math.random() * 1000 + 500
            );
          });

        document
          .getElementById("galaxyAddSupernova")
          ?.addEventListener("click", () => {
            this.createSupernova(
              Math.random() * this.canvas.width,
              Math.random() * this.canvas.height
            );
          });

        // Canvas click
        this.canvas.addEventListener("click", (e) => {
          const rect = this.canvas.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          if (e.shiftKey) {
            this.addBlackHole(x, y);
          } else if (e.ctrlKey) {
            this.createSupernova(x, y);
          } else {
            this.addStar(x, y);
          }
        });

        // Handle window resize
        window.addEventListener("resize", () => {
          this.resizeCanvas();
        });

        // Touch events for mobile
        this.canvas.addEventListener(
          "touchstart",
          (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;

            if (e.touches.length > 1) {
              this.addBlackHole(x, y);
            } else {
              this.addStar(x, y);
            }
          },
          { passive: false }
        );
      }
    }

    // Initialize the enhanced galaxy
    window.galaxyDemo = new EnhancedParticleGalaxy();

    // Add some instructions
    console.log("Enhanced Cosmic Galaxy Ready!");
    console.log("Click to add stars");
    console.log("Shift+Click to add black holes");
    console.log("Ctrl+Click to create supernovae");
  }

  // =========================
  // DEMO 2: AI ART GENERATOR
  // =========================
  const aiCanvas = document.getElementById("aiCanvas");
  if (aiCanvas) {
    console.log("Initializing AI Art Generator...");

    class AIArtGenerator {
      constructor() {
        this.canvas = aiCanvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 500;
        this.canvas.height = 300;

        this.generation = 1;
        this.complexity = 5;
        this.isAnimating = false;
        this.animationTime = 0;

        this.generateArt();
        this.setupControls();
        this.animate();
      }

      generateArt() {
        // Clear canvas
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw neural network
        const layers = 3 + Math.floor(this.complexity / 3);

        for (let l = 0; l < layers; l++) {
          const nodes = 3 + Math.floor(this.complexity / 2);
          const xSpacing = this.canvas.width / (nodes + 1);
          const y = (l + 1) * (this.canvas.height / (layers + 1));

          for (let n = 0; n < nodes; n++) {
            const x = xSpacing * (n + 1);
            const radius = 5 + this.complexity;
            const hue = (l * 60 + n * 30) % 360;

            // Draw connections from previous layer
            if (l > 0) {
              for (let i = 0; i < 3; i++) {
                const prevX =
                  xSpacing * (Math.floor(Math.random() * nodes) + 1);
                const prevY = l * (this.canvas.height / (layers + 1));

                this.ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.3)`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX, prevY);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
              }
            }

            // Draw node
            this.ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();

            // Glow
            const gradient = this.ctx.createRadialGradient(
              x,
              y,
              0,
              x,
              y,
              radius * 2
            );
            gradient.addColorStop(0, `hsla(${hue}, 100%, 60%, 0.5)`);
            gradient.addColorStop(1, "transparent");

            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        // Update stats
        const generationCount = document.getElementById("generationCount");
        if (generationCount) generationCount.textContent = this.generation++;

        const layerCount = document.getElementById("layerCount");
        if (layerCount) layerCount.textContent = layers;
      }

      animate() {
        if (this.isAnimating) {
          this.animationTime += 0.02;

          // Add subtle animation
          this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
          this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

          // Draw moving particles
          const time = Date.now() / 1000;
          for (let i = 0; i < 5; i++) {
            const x = this.canvas.width / 2 + Math.sin(time + i) * 100;
            const y = this.canvas.height / 2 + Math.cos(time * 1.3 + i) * 80;
            const radius = 5 + Math.sin(time * 2 + i) * 3;

            this.ctx.fillStyle = `hsla(${
              (time * 50 + i * 72) % 360
            }, 100%, 60%, 0.5)`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
          }
        }

        requestAnimationFrame(() => this.animate());
      }

      setupControls() {
        // Generate button
        document.getElementById("aiGenerate")?.addEventListener("click", () => {
          this.generateArt();
        });

        // Animate button
        const animateBtn = document.getElementById("aiAnimate");
        if (animateBtn) {
          animateBtn.addEventListener("click", () => {
            this.isAnimating = !this.isAnimating;
            animateBtn.textContent = this.isAnimating
              ? "Stop Animation"
              : "Animate";
          });
        }

        // Complexity slider
        const complexitySlider = document.getElementById("complexitySlider");
        if (complexitySlider) {
          complexitySlider.addEventListener("input", (e) => {
            this.complexity = parseInt(e.target.value);
            const complexityValue = document.getElementById("complexityValue");
            if (complexityValue) complexityValue.textContent = this.complexity;
            this.generateArt();
          });
        }

        // Style select
        const styleSelect = document.getElementById("styleSelect");
        if (styleSelect) {
          styleSelect.addEventListener("change", (e) => {
            const label = e.target.selectedOptions?.[0]?.text || e.target.value;
            const badge = document.getElementById("currentStyle");
            if (badge) badge.textContent = label.replace(/^[^A-Za-z0-9]+/, "");
            this.generateArt();
          });
        }
      }
    }

    window.aiArtDemo = new AIArtGenerator();
  }

  // =========================
  // DEMO 3: MUSIC VISUALIZER
  // =========================
  const musicCanvas = document.getElementById("musicCanvas");
  if (musicCanvas) {
    console.log("Initializing Music Visualizer...");

    class MusicVisualizer {
      constructor() {
        this.canvas = musicCanvas;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = this.canvas.parentElement.clientWidth;
        this.canvas.height = 300;

        this.isPlaying = false;
        this.visualStyle = "particles";
        this.sensitivity = 0.7;
        this.particles = [];
        this.audioData = new Array(64).fill(0);

        this.setupControls();
        this.animate();
      }

      animate() {
        if (!this.isPlaying) {
          this.drawIdle();
        } else {
          this.simulateAudio();
        }

        requestAnimationFrame(() => this.animate());
      }

      drawIdle() {
        const time = Date.now() * 0.001;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Clear with fade
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
        this.ctx.fillRect(0, 0, width, height);

        // Draw calming waves
        for (let i = 0; i < 3; i++) {
          const y = height / 2 + Math.sin(time + i * 0.5) * 50;
          const alpha = 0.2 + Math.sin(time * 2 + i) * 0.1;

          this.ctx.strokeStyle = `rgba(180, 76, 255, ${alpha})`;
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();

          for (let x = 0; x < width; x += 10) {
            const waveY = y + Math.sin(time * 2 + x * 0.01 + i) * 20;
            if (x === 0) this.ctx.moveTo(x, waveY);
            else this.ctx.lineTo(x, waveY);
          }

          this.ctx.stroke();
        }

        // Update stats
        const frequencyValue = document.getElementById("frequencyValue");
        if (frequencyValue) frequencyValue.textContent = "440";

        const amplitudeValue = document.getElementById("amplitudeValue");
        if (amplitudeValue) amplitudeValue.textContent = "0.000";
      }

      simulateAudio() {
        const time = Date.now() * 0.001;
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Update audio data (simulated)
        for (let i = 0; i < this.audioData.length; i++) {
          this.audioData[i] = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
        }

        // Clear with fade
        this.ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
        this.ctx.fillRect(0, 0, width, height);

        // Draw based on visual style
        switch (this.visualStyle) {
          case "spectrum":
            this.drawSpectrum();
            break;
          case "waves":
            this.drawWaves();
            break;
          case "kaleidoscope":
            this.drawKaleidoscope();
            break;
          case "particle-wave":
            this.drawParticleWave();
            break;
          default:
            this.drawParticles();
        }

        // Update stats
        const avgFreq =
          this.audioData.reduce((a, b) => a + b) / this.audioData.length;

        const frequencyValue = document.getElementById("frequencyValue");
        if (frequencyValue)
          frequencyValue.textContent = Math.round(avgFreq * 500);

        const amplitudeValue = document.getElementById("amplitudeValue");
        if (amplitudeValue) amplitudeValue.textContent = avgFreq.toFixed(3);

        const latencyValue = document.getElementById("latencyValue");
        if (latencyValue)
          latencyValue.textContent = Math.round(Math.random() * 10);

        // Update volume bar
        const volumeBar = document.getElementById("volumeBar");
        if (volumeBar) {
          volumeBar.style.width = `${avgFreq * 100}%`;
        }
      }

      drawSpectrum() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const barWidth = width / this.audioData.length;

        for (let i = 0; i < this.audioData.length; i++) {
          const barHeight = this.audioData[i] * height * this.sensitivity;
          const x = i * barWidth;
          const y = height - barHeight;

          const gradient = this.ctx.createLinearGradient(x, y, x, height);
          gradient.addColorStop(0, "#b44cff");
          gradient.addColorStop(1, "#00ffff");

          this.ctx.fillStyle = gradient;
          this.ctx.fillRect(x, y, barWidth - 1, barHeight);
        }
      }

      drawWaves() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.strokeStyle = "#00ffff";
        this.ctx.lineWidth = 2;

        for (let i = 0; i < 3; i++) {
          this.ctx.beginPath();

          for (let x = 0; x < width; x += 5) {
            const index = Math.floor((x / width) * this.audioData.length);
            const intensity = this.audioData[index];
            const y =
              height / 2 +
              Math.sin(x * 0.02 + Date.now() * 0.001 * (i + 1)) *
                intensity *
                100 *
                this.sensitivity;

            if (x === 0) this.ctx.moveTo(x, y);
            else this.ctx.lineTo(x, y);
          }

          this.ctx.stroke();
        }
      }

      drawKaleidoscope() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const segments = 12;
        const maxRadius = Math.min(centerX, centerY);

        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const intensity =
            this.audioData[Math.floor((i / segments) * this.audioData.length)];
          const radius = intensity * maxRadius * this.sensitivity;

          this.ctx.save();
          this.ctx.translate(centerX, centerY);
          this.ctx.rotate(angle);

          this.ctx.fillStyle = `hsla(${i * 30}, 100%, 60%, 0.7)`;
          this.ctx.beginPath();
          this.ctx.moveTo(0, 0);
          this.ctx.arc(0, 0, radius, 0, (Math.PI * 2) / segments);
          this.ctx.fill();

          this.ctx.restore();
        }
      }

      drawParticles() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        // Add new particles
        if (Math.random() < this.sensitivity * 0.1) {
          const intensity =
            this.audioData[Math.floor(Math.random() * this.audioData.length)];

          this.particles.push({
            x: Math.random() * width,
            y: height,
            vx: (Math.random() - 0.5) * 4,
            vy: -Math.random() * 10 - 5,
            radius: intensity * 10 + 2,
            color: `hsl(${Math.random() * 60 + 200}, 100%, 60%)`,
            life: 1,
          });

          if (this.particles.length > 500) this.particles.shift();
        }

        // Update and draw particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];

          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.2;
          p.life -= 0.01;

          if (p.life <= 0 || p.y > height + 100) {
            this.particles.splice(i, 1);
            continue;
          }

          this.ctx.globalAlpha = p.life;
          this.ctx.fillStyle = p.color;
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.globalAlpha = 1;
      }

      drawParticleWave() {
        const width = this.canvas.width;
        const height = this.canvas.height;

        this.ctx.strokeStyle = "#b44cff";
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();

        for (let x = 0; x < width; x += 10) {
          const index = Math.floor((x / width) * this.audioData.length);
          const intensity = this.audioData[index];
          const y =
            height / 2 +
            Math.sin(x * 0.03 + Date.now() * 0.002) *
              intensity *
              80 *
              this.sensitivity;

          if (x === 0) this.ctx.moveTo(x, y);
          else this.ctx.lineTo(x, y);

          // Draw particles along the wave
          this.ctx.fillStyle = "#00ffff";
          this.ctx.beginPath();
          this.ctx.arc(x, y, intensity * 6, 0, Math.PI * 2);
          this.ctx.fill();
        }

        this.ctx.stroke();
      }

      setupControls() {
        const micBtn = document.getElementById("micBtn");
        const toneBtn = document.getElementById("toneBtn");
        const stopBtn = document.getElementById("stopBtn");
        const visualStyleSelect = document.getElementById("visualStyle");
        const sensitivitySlider = document.getElementById("sensitivitySlider");

        if (micBtn) {
          micBtn.addEventListener("click", () => {
            this.isPlaying = true;
            const audioStatus = document.getElementById("audioStatus");
            if (audioStatus)
              audioStatus.innerHTML =
                '<i class="fas fa-microphone"></i> Listening...';
          });
        }

        if (toneBtn) {
          toneBtn.addEventListener("click", () => {
            this.isPlaying = true;
            const audioStatus = document.getElementById("audioStatus");
            if (audioStatus)
              audioStatus.innerHTML =
                '<i class="fas fa-wave-square"></i> Generating Tone...';
          });
        }

        if (stopBtn) {
          stopBtn.addEventListener("click", () => {
            this.isPlaying = false;
            this.particles = [];
            const audioStatus = document.getElementById("audioStatus");
            if (audioStatus)
              audioStatus.innerHTML =
                '<i class="fas fa-microphone-slash"></i> Ready';

            const volumeBar = document.getElementById("volumeBar");
            if (volumeBar) volumeBar.style.width = "0%";
          });
        }

        if (visualStyleSelect) {
          visualStyleSelect.addEventListener("change", (e) => {
            this.visualStyle = e.target.value;
            this.particles = []; // Clear particles when changing style
          });
        }

        if (sensitivitySlider) {
          sensitivitySlider.addEventListener("input", (e) => {
            this.sensitivity = parseFloat(e.target.value);
            const sensitivityValue =
              document.getElementById("sensitivityValue");
            if (sensitivityValue)
              sensitivityValue.textContent = this.sensitivity.toFixed(1);
          });
        }

        // Handle window resize
        window.addEventListener("resize", () => {
          if (this.canvas) {
            const container = this.canvas.parentElement;
            if (container) {
              this.canvas.width = container.clientWidth;
            }
          }
        });
      }
    }

    window.musicDemo = new MusicVisualizer();
  }

  // Demo fullscreen buttons
  const demoPageMap = {
    "ai-art": "ai-art-generator.html",
    music: "interactive-music.html",
    "space-defender": "space-defender.html",
    climate: "climate-dashboard-demo.html",
    "create-viz": "create-viz-preview.html",
  };

  document.querySelectorAll(".demo-fullscreen").forEach((el) => {
    if (el.tagName === "A") return; // anchors already work

    el.addEventListener("click", (e) => {
      e.preventDefault();
      const key = el.getAttribute("data-demo");
      const url = demoPageMap[key];
      if (url) window.open(url, "_blank");
    });
  });

  console.log("✅ All components initialized!");
});
