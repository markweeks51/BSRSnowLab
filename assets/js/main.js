// Sticky navbar shadow on scroll
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 10) {
    navbar.classList.add("shadow-lg", "shadow-black/40");
  } else {
    navbar.classList.remove("shadow-lg", "shadow-black/40");
  }
});

// Mobile menu toggle
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");
menuBtn.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Close mobile menu when a link is clicked
mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
  });
});

// FAQ accordion — one item open at a time
const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
  const btn = item.querySelector(".faq-btn");
  const answer = item.querySelector(".faq-answer");
  const icon = item.querySelector(".faq-icon");

  btn.addEventListener("click", () => {
    const isOpen = !answer.classList.contains("hidden");

    // Close all
    faqItems.forEach((el) => {
      el.querySelector(".faq-answer").classList.add("hidden");
      el.querySelector(".faq-icon").textContent = "+";
      el.querySelector(".faq-btn").setAttribute("aria-expanded", "false");
    });

    // Open clicked (if it was closed)
    if (!isOpen) {
      answer.classList.remove("hidden");
      icon.textContent = "−";
      btn.setAttribute("aria-expanded", "true");
    }
  });
});

// Contact form success message
const contactForm = document.getElementById("contact-form");
const successMsg = document.getElementById("form-success");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    // Netlify handles submission; show success after a short delay
    setTimeout(() => {
      contactForm.classList.add("hidden");
      successMsg.classList.remove("hidden");
    }, 300);
  });
}
