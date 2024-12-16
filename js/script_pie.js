// Initialize an empty object to hold energy data
let energyData = {};

// Function to update the pie chart based on the selected region
function updatePieChart(region) {
    let regionData;

    if (Array.isArray(region)) {
        // Compute average renewable energy data for selected countries
        const countryData = region.map(country => energyData[country]).filter(Boolean);

        if (countryData.length === 0) return; // No valid data found, exit

        regionData = countryData.reduce((acc, data) => {
            Object.keys(data).forEach(key => {
                acc[key] = (acc[key] || 0) + data[key];
            });
            return acc;
        }, {});

        // Divide the total by the number of countries to get the average
        Object.keys(regionData).forEach(key => {
            regionData[key] /= countryData.length;
        });
    } else {
        // Retrieve data for the specified region
        regionData = energyData[region];
    }

    if (!regionData) return; // Ensure region data exists, exit if not

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

    // Add tooltip functionality as in the original implementation
    const tooltip = document.getElementById("tooltip");
    chart.addEventListener("mousemove", (e) => {
        const rect = chart.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2; // Calculate x relative to center
        const y = e.clientY - rect.top - rect.height / 2; // Calculate y relative to center
        const angle = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360; // Calculate angle in degrees

        // Find the slice corresponding to the mouse position
        const hoveredSlice = gradientStops.find(
            (stop) => angle >= stop.start * 3.6 && angle < stop.end * 3.6
        );

        if (hoveredSlice) {
            tooltip.style.opacity = 1;
            tooltip.style.left = `${e.clientX + 10}px`;
            tooltip.style.top = `${e.clientY + 10}px`;
            tooltip.textContent = `${hoveredSlice.type}: ${hoveredSlice.value.toFixed(
                2
            )} W/Capita (${hoveredSlice.percentage.toFixed(2)}%)`;
        } else {
            tooltip.style.opacity = 0;
        }
    });

    chart.addEventListener("mouseleave", () => {
        tooltip.style.opacity = 0;
    });
}


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
