// Initialize an empty object to hold energy data
let energyData = {};
let countryEnergyMap = {};

// Function to update the pie chart based on the selected region
function updatePieChart(region) {
  // Retrieve the data for the specified region
  const countryData = countryEnergyMap[countryName];
  if (!countryData) return;

  // Calculate the total energy for the region
  const total = Object.values(regionData).reduce((sum, value) => sum + value, 0);
  let cumulativePercentage = 0; // Track cumulative percentage for slices

  // Generate gradient stops for the pie chart based on energy data
  const gradientStops = Object.entries(regionData).map(([type, value]) => {
    const percentage = (value / total) * 100; // Calculate percentage of each energy type
    const start = cumulativePercentage; // Start of the slice
    const end = cumulativePercentage + percentage; // End of the slice
    cumulativePercentage = end; // Update cumulative percentage

    // Define colors for each energy type
    const colors = {
      BIOENERGY: "#0fa049",
      HYDROPOWER: "#40a8c4",
      SOLAR: "#ffc107",
      WIND: "#8e44ad",
    };

    return { type, color: colors[type], start, end, value, percentage }; // Return gradient stop data
  });

  // Select the pie chart element and set its background using conic-gradient
  const chart = document.querySelector(".pie-chart");
  chart.style.background = `conic-gradient(${gradientStops
    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
    .join(", ")})`;

  // Add an event listener for mouse movement over the pie chart
  chart.addEventListener("mousemove", (e) => {
    const rect = chart.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2; // Calculate x relative to center
    const y = e.clientY - rect.top - rect.height / 2; // Calculate y relative to center
    const angle = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360; // Calculate angle in degrees

    // Find the slice corresponding to the mouse position
    const hoveredSlice = gradientStops.find(
      (stop) => angle >= stop.start * 3.6 && angle < stop.end * 3.6
    );

    // Display a tooltip with information about the hovered slice
    const tooltip = document.getElementById("tooltip");
    if (hoveredSlice) {
      tooltip.style.opacity = 1; // Show tooltip
      tooltip.style.left = `${e.clientX + 10}px`; // Position tooltip near the mouse
      tooltip.style.top = `${e.clientY + 10}px`;
      tooltip.textContent = `${hoveredSlice.type}: ${hoveredSlice.value.toFixed(
        2
      )} W/Capita (${hoveredSlice.percentage.toFixed(2)}%)`; // Display slice info
    } else {
      tooltip.style.opacity = 0; // Hide tooltip if no slice is hovered
    }
  });

  // Hide tooltip when the mouse leaves the pie chart
  chart.addEventListener("mouseleave", () => {
    document.getElementById("tooltip").style.opacity = 0;
  });
}

// Variable to store the currently selected region
let selectedRegion = "World";

// Add hover listeners to region list elements to update the pie chart
document.querySelectorAll(".geo-area").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    const region = item.textContent.trim(); // Get region name from element text
    selectedRegion = region; // Update selected region
    updatePieChart(selectedRegion); // Update the pie chart with new region data

    // Highlight the selected region in the list
    document
      .querySelectorAll(".geo-area")
      .forEach((el) => el.classList.remove("selected")); // Remove existing highlights
    item.classList.add("selected"); // Highlight the hovered region
  });
});

// Fetch energy data when the document is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Load energy data
  fetch("./data/Processed_Renewable_Energy_Data.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load energy data.");
      return response.json();
    })
    .then((data) => {
      energyData = data; // Assign energy data
      data.forEach((item) => {
        countryEnergyMap[item.country] = item; // Map country names to their energy data
      });
    })
    .catch((error) => console.error("Error loading energy data:", error));
});
