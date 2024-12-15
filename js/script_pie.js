let energyData = {};

function updatePieChart(region) {
  const regionData = energyData[region];
  if (!regionData) return; // Ensure region data exists
  const total = Object.values(regionData).reduce((sum, value) => sum + value, 0);
  let cumulativePercentage = 0;

  const gradientStops = Object.entries(regionData).map(([type, value]) => {
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

  chart.addEventListener("mousemove", (e) => {
    const rect = chart.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = (Math.atan2(y, x) * (180 / Math.PI) + 360) % 360;

    const hoveredSlice = gradientStops.find(
      (stop) => angle >= stop.start * 3.6 && angle < stop.end * 3.6
    );

    const tooltip = document.getElementById("tooltip");
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
    document.getElementById("tooltip").style.opacity = 0;
  });
}

let selectedRegion = "World";

document.querySelectorAll(".geo-area").forEach((item) => {
  item.addEventListener("mouseenter", () => {
    const region = item.textContent.trim();
    selectedRegion = region;
    updatePieChart(selectedRegion);

    document
      .querySelectorAll(".geo-area")
      .forEach((el) => el.classList.remove("selected"));
    item.classList.add("selected");
  });
});

document.addEventListener("DOMContentLoaded", () => {
  fetch("./data/energyData.json") // Ensure this path matches where the file is hosted
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load energy data.");
      }
      return response.json();
    })
    .then((data) => {
      energyData = data; // Populate the energyData object with fetched data
      updatePieChart("World"); // Initialize chart with World data
    })
    .catch((error) => {
      console.error("Error loading energy data:", error);
      document.querySelector(".pie-chart").textContent =
      "Failed to load chart data.";
  });
});
