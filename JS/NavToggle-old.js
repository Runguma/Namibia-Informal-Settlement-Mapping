// Toggle top navbar (mobile)
function toggleNav() {
  const nav = document.getElementById("mainNav");
  nav.classList.toggle("show-nav");
}

// Toggle sidebar (from header hamburger)
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("collapsed");
}


// Toggle accord... panel (from sidebar button)
document.querySelectorAll(".accordion-btn").forEach(button => {
  button.addEventListener("click", () => {
    const panel = button.nextElementSibling;
    panel.classList.toggle("open");
  });
});


// Toggle exclusive checkboxes
document.querySelectorAll('.exclusive-toggle').forEach(toggle => {
  toggle.addEventListener('change', function () {
    if (this.checked) {
      document.querySelectorAll('.exclusive-toggle').forEach(other => {
        if (other !== this) other.checked = false;
      });
    }
  });
});




