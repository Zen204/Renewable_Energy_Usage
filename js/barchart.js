function barchart(width, height, id) {

  
	var margin = {top: 10, right: 30, bottom: 50, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;



// append the svg object to the body of the page
var svg = d3.select("#barchart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");




// Parse the Data

d3.csv("data/full_file.csv", function(data) {	
  country_dict={}
  for (let i = 0; i < data.length; i++) { //assigning value pairs between indices and a country name
    country_this=data[i]["Country"]
    country_dict[country_this] = i;
  }
country_list=["World", "United States of America", "China", "Congo"]


  // List of subgroups = header of the csv files = soil condition here
  var subgroups = data.columns.slice(1)//ELEC and RNEW
  
  //console.log(subgroups)
  /*
  var worldDATA=data.slice(-1)
  console.log(worldDATA)
  */
  // List of groups = species here = value of the first column called group -> I show them on the X axis
  //var groups = d3.map(data, function(d){return(d.group)}).keys()
  //data=data.slice(0,3);
data=[data[country_dict[country_list[0]]], data[country_dict[country_list[1]]], data[country_dict[country_list[2]]], data[country_dict[country_list[3]]]]
  //console.log(data)
  //data=worldDATA;
  var groups=[]
  var Countries = data.map(function(d) {
    return {
      Country: d.Country,
    }
  });
  //console.log(Countries)
  for (let i = 0; i < Countries.length; i++) {
    groups.push(Countries[i]["Country"])
  }
  //console.log(groups)//COUNTRIES

  // Add X axis
  
  var x = d3.scaleBand()
      .domain(groups)
      .range([0, width])
      .padding([0.2])

  
  svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0));

  // Add Y axis
  
  var y = d3.scaleLinear()
    .domain([0, 100])
    .range([ height, 0 ]);

  
  svg.append("g")
    .call(d3.axisLeft(y));

  // Another scale for subgroup position?
  var xSubgroup = d3.scaleBand()
    .domain(subgroups)
    .range([0, x.bandwidth()])
    .padding([0.05])

  // color palette = one color per subgroup
  var color = d3.scaleOrdinal()
    .domain(subgroups)
    .range(['#e41a1c','#377eb8'])

  // Show the bars
  svg.append("g")
    .selectAll("g")
    // Enter in data = loop group per group
    .data(data)
    .enter()
    .append("g")
    .attr("transform", function(d) { return "translate(" + x(d.Country) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return subgroups.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
      .attr("x", function(d) { return xSubgroup(d.key); })
      .attr("y", function(d) { return y(d.value); })
      .attr("width", xSubgroup.bandwidth())
      .attr("height", function(d) { return height - y(d.value); })
      .attr("fill", function(d) { return color(d.key); });

        // X-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", height + margin.bottom - 10)
            .text("Country");

        // Y-axis label
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -height / 2)
            .attr("y", -margin.left + 20)
            .text("Value (%)");
    

})
      



}








