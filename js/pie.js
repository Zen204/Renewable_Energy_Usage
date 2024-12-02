
const style = document.createElement('style');
style.textContent = `
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
  }
  h1 {
    text-align: center;
    margin-top: 20px;
  }
  .content {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
  }
  .chart-container {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 20px auto;
  }
  .pie-chart {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(#ddd 0%, #ddd 100%);
    position: relative;
    transform: rotate(90deg);
  }
  .tooltip {
    position: absolute;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 15px;
    border-radius: 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 10;
  }
  .geo-area-list {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    gap: 10px;
    background-color: #f9f9f9;
    padding: 10px 0;
    border-top: 1px solid #ccc;
    box-shadow: 0 -4px 8px rgba(0, 0, 0, 0.1);
  }
  .geo-area {
    background-color: #ddd;
    padding: 10px 15px;
    border-radius: 5px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
  }
  .geo-area:hover {
    background-color: #ccc;
    transform: scale(1.1);
  }
  .geo-area.selected {
    background-color: #bbb;
    font-weight: bold;
  }
`;
document.head.appendChild(style);

// Energy data for the chart
const energyData = {
  World: {
    BIOENERGY: 18.89716,
    HYDROPOWER: 157.45718,
    SOLAR: 133.1536,
    WIND: 112.73321,
  },
  Africa: {
    BIOENERGY: 1.3081,
    HYDROPOWER: 25.09364,
    SOLAR: 8.79402,
    WIND: 5.38977,
  },
  Asia: {
    BIOENERGY: 14.01943,
    HYDROPOWER: 124.90919,
    SOLAR: 132.9331,
    WIND: 92.79868,
  },
  Australia: {
    BIOENERGY: 33.32109,
    HYDROPOWER: 294.64332,
    SOLAR: 1133.76368,
    WIND: 403.2102,
  },
  Europe: {
    BIOENERGY: 58.1471,
    HYDROPOWER: 333.65778,
    SOLAR: 305.0016,
    WIND: 326.10341,
  },
  "Northern America": {
    BIOENERGY: 37.09818,
    HYDROPOWER: 444.5027,
    SOLAR: 314.0642,
    WIND: 92.79868,
  },
  "South America": {
    BIOENERGY: 46.66449,
    HYDROPOWER: 409.83812,
    SOLAR: 75.13627,
    WIND: 76.78482,
  },
};

// Update the pie chart based on selected region
function updatePieChart(region) {
  const regionData = energyData[region];
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

// Initialize the chart on page load
document.addEventListener("DOMContentLoaded", () => {
  updatePieChart("World");
  document.querySelectorAll(".geo-area").forEach((item) => {
    item.addEventListener("mouseenter", () => {
      const region = item.textContent.trim();
      updatePieChart(region);
      document
        .querySelectorAll(".geo-area")
        .forEach((el) => el.classList.remove("selected"));
      item.classList.add("selected");
    });
  });
});
