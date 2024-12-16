// Initialize an empty object to hold energy data
let energyData = {};

// Function to update the pie chart based on the selected region
function updatePieChartAverage(countries) {
    if (!countries || countries.length === 0) return;

    // Initialize an object to store the sum of energy types
    const totalData = { BIOENERGY: 0, HYDROPOWER: 0, SOLAR: 0, WIND: 0 };

    // Sum up the renewable energy data for the selected countries
    countries.forEach(country => {
        const countryData = energyData[country];
        if (countryData) {
            Object.keys(countryData).forEach(type => {
                totalData[type] += countryData[type];
            });
        }
    });

    // Calculate the average for each energy type
    const averageData = {};
    Object.keys(totalData).forEach(type => {
        averageData[type] = totalData[type] / countries.length;
    });

    // Use the existing updatePieChart logic to display the averaged data
    updatePieChartWithData(averageData);
}

// Update the pie chart with explicit data
function updatePieChartWithData(data) {
    const total = Object.values(data).reduce((sum, value) => sum + value, 0);
    let cumulativePercentage = 0;

    const gradientStops = Object.entries(data).map(([type, value]) => {
        const percentage = (value / total) * 100;
        const start = cumulativePercentage;
        const end = cumulativePercentage + percentage;
        cumulativePercentage = end;

        const colors = {
            BIOENERGY: "#0fa049",
            HYDROPOWER: "#40a8c4",
            SOLAR: "#ffc107",
            WIND: "#8e44ad",
        };

        return { type, color: colors[type], start, end, value, percentage };
    });

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

document.addEventListener("DOMContentLoaded", () => {
  fetch("./data/Processed_Renewable_Energy.json") // Update to use the processed file
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load processed renewable energy data."); // Handle fetch errors
      }
      return response.json(); // Parse response as JSON
    })
    .then((data) => {
      // Assign the fetched data to the energyData object
      energyData = data;
      // Call the function to update the pie chart with the "World" region by default
      updatePieChart("World");
    })
    .catch((error) => {
      console.error("Error loading processed renewable energy data:", error); // Log errors to the console
      // Display an error message on the pie chart element
      document.querySelector(".pie-chart").textContent =
        "Failed to load chart data.";
    });
});
