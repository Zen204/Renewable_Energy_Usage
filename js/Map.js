function map(dataset) {
  var format = d3.format(",");
  
  
  
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;
  
  var color = d3.scaleThreshold()
      .domain([10,20,30,40,50,60,70,80,90,100])
      .range(["rgb(255,255,217)", "rgb(237,248,177)", "rgb(199,233,180)", "rgb(127,205,187)", "rgb(65,182,196)", "rgb(29,145,192)","rgb(34,94,168)","rgb(12,44,132)","rgb(3,27,93)","rgb(2,13,43)"]);
  
  var path = d3.geoPath();
  
  
    var svg = d3.select("#map")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
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
                    return "<strong>Country: </strong><span class='details'>" + d.properties.name + 
                    "<br></span>" + "<strong>RNEW: </strong><span class='details'>" + format(d.Renewable2021) + "<br></span>" 
                    + "<strong>ELEC: </strong><span class='details'>" + format(d.Electricity2021) +"</span>";
                })

    svg.call(tip);

    queue()
        .defer(d3.json, "data/world_countries.json")
        .defer(d3.tsv, dataset)
        .await(ready);

    function ready(error, countries, data) {
        var countryById = {};
        var elecById = {};

        data.forEach(function(d) { countryById[d.id] = +d.Renewable2021; });
        countries.features.forEach(function(d) { d.Renewable2021 = countryById[d.id] });
        data.forEach(function(d) { elecById[d.id] = +d.Electricity2021; });     //adds elec data for tooltip use
        countries.features.forEach(function(d) { d.Electricity2021 = elecById[d.id] });

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
            .on('mouseover',function(d){
                tip.show(d);

                d3.select(this)
                .style("opacity", 1)
                .style("stroke","white")
                .style("stroke-width",3);
            })
            .on('mouseout', function(d){
                tip.hide(d);

                d3.select(this)
                .style("opacity", 0.8)
                .style("stroke","black")
                .style("stroke-width",0.3);
            });

        svg.append("path")
            .datum(topojson.mesh(countries.features, function(a, b) { return a.id !== b.id; }))
            // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
            .attr("class", "names")
            .attr("d", path);

        
    }
  

}