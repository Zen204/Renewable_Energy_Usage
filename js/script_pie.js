// Initialize an empty object to hold energy data
let energyData = {};

// Function to update the pie chart based on the selected region or regions
function updatePieChart(regions) {
  // Handle single or multiple regions
  let regionNames = Array.isArray(regions) ? regions : [regions];

  // Get data for the specified regions
  const validData = regionNames
    .map((region) => energyData[region])
    .filter((data) => data); // Filter out invalid regions

  if (!validData.length) return; // Exit if no valid data found

  // Calculate average data if multiple regions are selected
  let averagedData = validData.reduce((acc, regionData) => {
    for (let type in regionData) {
      acc[type] = (acc[type] || 0) + regionData[type];
    }
    return acc;
  }, {});

  // Divide by the number of regions to get the average
  if (regionNames.length > 1) {
    for (let type in averagedData) {
      averagedData[type] /= validData.length;
    }
  }

  // Calculate the total energy for the selected regions
  const total = Object.values(averagedData).reduce((sum, value) => sum + value, 0);
  let cumulativePercentage = 0; // Track cumulative percentage for slices

  // Generate gradient stops for the pie chart based on energy data
  const gradientStops = Object.entries(averagedData).map(([type, value]) => {
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

  // Update the country/region name above the pie chart
  const chartTitle = document.querySelector(".chart-title");
  chartTitle.textContent =
    regionNames.length === 1
      ? `${regionNames[0]}`
      : "Average for Selected Countries";

  // Select the pie chart element and set its background using conic-gradient
  const chart = document.querySelector(".pie-chart");
  chart.style.background = `conic-gradient(${gradientStops
    .map((stop) => `${stop.color} ${stop.start}% ${stop.end}%`)
    .join(", ")})`;
  // chart.style.width = '150px';
  // chart.style.height = '200px';

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
  fetch("./data/energyData.json") // Fetch energy data from a JSON file
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load energy data."); // Handle fetch errors
      }
      return response.json(); // Parse response as JSON
    })
    .then((data) => {
      energyData = data; // Populate the energyData object with fetched data
      updatePieChart("World"); // Initialize chart with "World" data
    })
    .catch((error) => {
      console.error("Error loading energy data:", error); // Log errors to the console
      document.querySelector(".pie-chart").textContent =
        "Failed to load chart data."; // Display error message in the chart area
    });
});
