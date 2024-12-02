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
    updatePieChart("World");
  });
  
