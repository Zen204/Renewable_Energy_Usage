function map(dataset, scatterplotFunction) {
  var format = d3.format(",");
  
  

  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 820 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
  
  var color = d3.scaleThreshold()
      .domain([10,20,30,40,50,60,70,80,90,100])
      .range(["rgb(255,255,217)", "rgb(237,248,177)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)","rgb(34,94,168)","rgb(12,44,132)","rgb(3,27,93)","rgb(2,13,43)"]);
  
  var path = d3.geoPath();
  
  
    var svg = d3.select("#map")
                .append("svg")
                .attr("preserveAspectRatio", "xMidYMid meet")
                .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
                .classed("svg-content", true)
                // .attr("width", width)
                // .attr("height", height)
                .append('g')
                .attr('class', 'map');

    var projection = d3.geoMercator()
                        .scale(130)
                        .translate( [width / 2, height / 1.5]);

    var path = d3.geoPath().projection(projection);

    // Set tooltips
    var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d) {
                    return "<strong>Country: </strong><span class='details'>" + d.properties.name +  "<br></span>" + 
                    "<strong>RNEW: </strong><span class='details'>" + format(d.Renewable2021) + "<br></span>" +
                    "<strong>ELEC: </strong><span class='details'>" + format(d.Electricity2021) +"<br></span>" +
                    "<strong>GDP per capita: </strong><span class='details'>" + format(d.GDP) +"</span>";
                })

    svg.call(tip);
    let selectedCountries = [];

    queue()
        .defer(d3.json, "data/world_countries.json")
        .defer(d3.tsv, dataset)
        .await(ready);

    function ready(error, countries, data) {
        var countryById = {};
        var elecById = {};
        var gdpById = {};

        data.forEach(function(d) { countryById[d.id] = +d.Renewable2021; });
        countries.features.forEach(function(d) { d.Renewable2021 = countryById[d.id] });
        data.forEach(function(d) { elecById[d.id] = +d.Electricity2021; });     //adds elec data for tooltip use
        countries.features.forEach(function(d) { d.Electricity2021 = elecById[d.id] });
        data.forEach(function(d) { gdpById[d.id] = +d.GDP; });     //adds GDP per capita data for tooltip use
        countries.features.forEach(function(d) { d.GDP = gdpById[d.id] });

        svg.append("g")
            .attr("class", "countries")
        .selectAll("path")
            .data(countries.features)
        .enter().append("path")
            .attr("d", path)
            .style("fill", function(d) { return color(countryById[d.id]); })
            .style('stroke', 'white')
            .style('stroke-width', 1.5)
            .style("opacity",0.8)
            // tooltips
            .style("stroke","black")
            .style('stroke-width', 0.3)
            .on('mouseover', function(d) {
                tip.show(d);

                d3.select(this)
                    .style("opacity", 1)
                    .style("stroke-width", 3);

                if (d.mapSelected == false || d.mapSelected == undefined){
                    d3.select(this).style("stroke", "pink");
                }
                        
            })
            .on('mouseout', function(d){
                tip.hide(d);

                d3.select(this)
                .style("opacity", 0.8)
                if (d.mapSelected == false || d.mapSelected == undefined){
                    d3.select(this)
                    .style("stroke","black")
                    .style("stroke-width",0.3);
                }
            })//MAYA EDITED
            .on('click', function(d) {
                 const countryName = d.properties.name;
                
                if (d.mapSelected == true) {
                    d.mapSelected = false;
                    d3.select(this).style("stroke", "pink");
                    // Highlighted Code Start
                    // selectedCountries = selectedCountries.filter(name => name !== countryName);
                    // Highlighted Code End
                } else {
                    d.mapSelected = true;
                    d3.select(this).style("stroke", "red");
                    // Highlighted Code Start
                    // selectedCountries.push(countryName);
                    // Highlighted Code End
                }
                
                nodeList = svg.selectAll("path")._groups[0]

                selectedCountries = [];
                nodeList.forEach(country => {
                    if (country.__data__.properties != undefined){
                        if (country.__data__.mapSelected == true){
                            selectedCountries.push(country.__data__.properties.name)
                        }
                    }
                  });
                updatePieChart(countryName);
                // Highlighted Code Start
                updateBarChart(selectedCountries); // Update bar chart with selected countries
                updateBarChart(selectedCountries);
                scatterplotFunction.updateSelection(selectedCountries)
                // console.log(selectedCountries)
                
                // END MAYA EDIT
                  // Check if the country name exists in the energy data
                
                //   dispatcher = d3.dispatch(dispatchString)
                //   let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
                //   // Let other charts know about our selection
                //   dispatcher.call(dispatchString, this, selectedCountries)
            });

        svg.append("path")
            .datum(topojson.mesh(countries.features, function(a, b) { return a.id !== b.id; }))
            // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
            .attr("class", "names")
            .attr("d", path);

        
        
        var svg2 = d3.select("#map")
            .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", [0, 0, width + margin.left + margin.right, 100].join(' '))
            .classed("svg-content", true)
        const legend = svg2.append("g")
            .attr("transform", `translate(${0}, ${50})`);
          var colorScaleDomain = [0,10,20,30,40,50,60,70,80,90]

          const legendWidth = 82
          const legendItems = legend.selectAll("g")
            .data(colorScaleDomain)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(${i * legendWidth}, 0)`);
          
          legendItems.append("rect")
            .attr("height", 25)
            .attr("width",legendWidth+3)
            .attr("fill", color)
            .attr("stroke-width", 0.5)
            .attr("stroke", "black")
          
          legendItems.append("text")
            .attr("x", 42)
            .attr("y", 45)
            .text(d => d + "-" + (d+10) + "%")
            .attr("text-anchor", "middle");        
        //   legendItems._groups.shift()  
          
        let legendLabel = svg2.append("text")
            // .classed("legend ", "axisLabel")
            .attr("transform", `translate(${37}, ${40})`)
            .text("Percent of Total Energy that comes from Renewable Sources")
            .classed("colorscaleTitle", true)
    }

    function update(countrySelection){
        // function findFunction(country){
        //     console.log("country")
        //     console.log(country)
        //     return true
        // }
        nodeList = svg.selectAll("path")._groups[0]
        
        nodeList.forEach(country => {
            if (country.__data__.properties != undefined){
                if (countrySelection.includes(country.__data__.properties.name)){
                    country.__data__.mapSelected = true
                    d3.select(country).style("stroke", "red").style("stroke-width",3)
                }
                else{
                    country.__data__.mapSelected = false
                    d3.select(country).style("stroke", "black").style("stroke-width",0.3)
                }
                // if (country.__data__.properties.name === "China"){
                //     console.log(country.__data__.mapSelected)
                // }
            }
          });
        // console.log(user)
    }
    return update;
}

var mapUpdate;
function mapToScatter(scatterplotFunction){
    // Usage of the map function
    mapUpdate = map("data/world_rnew.tsv", scatterplotFunction);
}


// Function to update the bar chart based on selected countries
function updateMap(selectedCountries) {
    // console.log(selectedCountries)
    mapUpdate(selectedCountries);
}
