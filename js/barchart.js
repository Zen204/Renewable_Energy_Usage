function barchart(width, height, id) {
  var margin = {top: 40, right: 30, bottom: 50, left: 60},
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

  // Append the svg object to the body of the page
  var svg = d3.select("#" + id)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleBand().range([0, width]).padding(0.2);
  var y = d3.scaleLinear().range([height, 0]);
  var color = d3.scaleOrdinal().range(['#e41a1c', '#377eb8']);

  // Add title
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", -10)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("text-decoration", "underline")
      .text("World and Selected Countries Energy Data");

  // Add axes
  svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")");
  svg.append("g").attr("class", "y axis");

  // Add axis labels
  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 10)
      .text("Country");

  svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 20)
      .text("Value (%)");

  function update(data) {
      var subgroups = data.columns.slice(1);
      var xSubgroup = d3.scaleBand().domain(subgroups).range([0, x.bandwidth()]).padding(0.05);

      x.domain(data.map(d => d.Country));
      y.domain([0, d3.max(data, d => d3.max(subgroups, key => +d[key]))]);

      svg.select(".x.axis").transition().call(d3.axisBottom(x));
      svg.select(".y.axis").transition().call(d3.axisLeft(y));

      var bars = svg.selectAll("g.bar-group").data(data, d => d.Country);

      bars.exit().remove();

      var enter = bars.enter().append("g")
          .attr("class", "bar-group")
          .attr("transform", d => `translate(${x(d.Country)},0)`);

      enter.selectAll("rect")
          .data(d => subgroups.map(key => ({key, value: d[key]})))
          .enter().append("rect")
          .attr("x", d => xSubgroup(d.key))
          .attr("y", y(0))
          .attr("width", xSubgroup.bandwidth())
          .attr("height", 0)
          .attr("fill", d => color(d.key))
          .transition()
          .attr("y", d => y(d.value))
          .attr("height", d => height - y(d.value));

      bars.selectAll("rect")
          .data(d => subgroups.map(key => ({key, value: d[key]})))
          .transition()
          .attr("x", d => xSubgroup(d.key))
          .attr("y", d => y(d.value))
          .attr("width", xSubgroup.bandwidth())
          .attr("height", d => height - y(d.value))
          .attr("fill", d => color(d.key));
  }

  // Load and filter data for initial display
  d3.csv("data/full_file.csv", function(data) {
      var initialData = data.filter(d => d.Country === "World");
      initialData.columns = data.columns;
      update(initialData);
  });

  return update; // Return the update function for later use
}

// Usage of the barchart function
var barChartUpdate = barchart(460, 400, "barchart");

// Function to update the bar chart based on selected countries
function updateBarChart(selectedCountries) {
  d3.csv("data/full_file.csv", function(data) {
      var filteredData = data.filter(d => selectedCountries.includes(d.Country) || d.Country === "World");
      filteredData.columns = data.columns;
      barChartUpdate(filteredData);
  });
}
