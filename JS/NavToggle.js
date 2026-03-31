// Toggle sidebar on mobile
document.getElementById('sidebarToggle').addEventListener('click', function() {
  document.getElementById('sidebar').classList.toggle('open');
});

// Accordion functionality
const accordionBtns = document.querySelectorAll('.accordion-btn');
accordionBtns.forEach(btn => {
  btn.addEventListener('click', function() {
    this.classList.toggle('active');
    const panel = this.nextElementSibling;
    panel.classList.toggle('open');
  });
});

// Close other accordion panels when one is opened
document.querySelectorAll('.accordion-btn').forEach(button => {
  button.addEventListener('click', function() {
    const allPanels = document.querySelectorAll('.accordion-panel');
    const allButtons = document.querySelectorAll('.accordion-btn');
    
    if (this.nextElementSibling.classList.contains('open')) {
      // Close all other panels
      allPanels.forEach(panel => {
        if (panel !== this.nextElementSibling) {
          panel.classList.remove('open');
        }
      });
      
      // Deactivate all other buttons
      allButtons.forEach(btn => {
        if (btn !== this) {
          btn.classList.remove('active');
        }
      });
    }
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