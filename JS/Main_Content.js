// JavaScript code to handle exclusive toggles and map area updates
// This code listens for changes on exclusive toggles and updates the map area accordingly
document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".exclusive-toggle");
  const mapArea = document.getElementById("indicator-map-area");
  const defaultMessage = document.getElementById("default-message");
  let activeSDGLabel = null;
  let currentTab = null;

  function showCard(toggle) {
    toggles.forEach((t) => {
        if (t !== toggle) t.checked = false;
    });

    mapArea.innerHTML = "";

    if (toggle.checked) {
        defaultMessage.style.display = "none";

        const label = toggle.closest(".switch-item").querySelector(".switch-label");
        const indicatorText = label.textContent.trim();

        activeSDGLabel = indicatorText;
        currentTab = null;

        const card = document.createElement("div");
        card.className = "map-card";
        card.innerHTML = `
        <div class="map-card-inner">
            <h4>🗺️ <strong>${indicatorText}</strong></h4>
            <p>This is the map for <strong>${indicatorText}</strong>.</p>
        </div>
        `;
        mapArea.appendChild(card);

        document.getElementById('bottom-panel').classList.remove('visible');
    } else {
        // No toggle is active
        defaultMessage.style.display = "block";
        activeSDGLabel = null;
        currentTab = null;

        // Hide panel
        const panel = document.getElementById('bottom-panel');
        panel.classList.remove('visible');

        // Reset panel content
        document.getElementById("bottom-panel-content").innerHTML = `
        <p style="font-weight: 500; color: #666; padding-top: 10px;">
            Select an item from the side panel to begin.
        </p>
        `;
    }
    }



  // Attach listeners
  toggles.forEach((toggle) => {
    toggle.addEventListener("change", () => showCard(toggle));
  });

  // 🟢 Check for initially checked toggle
  const initiallyChecked = Array.from(toggles).find(t => t.checked);
  if (initiallyChecked) {
    showCard(initiallyChecked); // Trigger on load
  } else {
    defaultMessage.style.display = "block";
  }

  // 📊 Tab Button Behavior
const panel = document.getElementById('bottom-panel');
const panelContent = document.getElementById('bottom-panel-content');

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', function () {
    const clickedTab = this.innerText.trim(); // "Charts" or "Tables"

    // 🔁 If same button clicked → toggle (close if open)
    if (currentTab === clickedTab) {
      panel.classList.remove('visible');
      currentTab = null;
      return;
    }

    // 🔁 New tab clicked
    currentTab = clickedTab;

    if (!activeSDGLabel) {
      // ✅ No SDG selected → show default message
      panelContent.innerHTML = `
        <p style="font-weight: 500; color: #666; padding-top: 10px;">
          Select an item from the side panel to begin.
        </p>
      `;
    } else {
      // ✅ SDG selected → show chart/table for selected
      panelContent.innerHTML = `
        <h4>${clickedTab} for ${activeSDGLabel}</h4>
        <p>This is the ${clickedTab.toLowerCase()} preview area for <strong>${activeSDGLabel}</strong>.</p>
      `;
    }

    panel.classList.add('visible');
  });
});

});








