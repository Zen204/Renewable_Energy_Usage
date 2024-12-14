/* global D3 */

// Initialize a scatterplot. Modeled after Mike Bostock's
// Reusable Chart framework https://bost.ocks.org/mike/chart/
function scatterplot() {

    // Based on Mike Bostock's margin convention
    // https://bl.ocks.org/mbostock/3019563
    let margin = {
        top: 60,
        left: 50,
        right: 30, 
        bottom: 150
      },
    width = 500 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    xValue = d => d[1],
    yValue = d => d[0],
    rValue = d => d.GDP,
    xLabelText = "",
    yLabelText = "",
    yLabelOffsetPx = 0,
    xScale = d3.scaleLinear(),
    yScale = d3.scaleLinear(),
    rScale = d3.scaleLog(),
    ourBrush = null,
    selectableElements = d3.select(null),
    dispatcher;
  
    // Create the chart by adding an svg to the div with the id 
    // specified by the selector using the given data
    function chart(selector, data) {
        let svg = d3.select(selector)
            .append("svg")
            .attr("preserveAspectRatio", "xMidYMid meet")
            .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom].join(' '))
            .classed("svg-content", true)
            .classed("text-unselectable", true);
    
        svg = svg.append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        //Define scales
        xScale
            .domain([
            d3.min(data, d => +xValue(d)),
            d3.max(data, d => +xValue(d))
            ])
            .rangeRound([0, width]);
        
    
        yScale
            .domain([
            d3.min(data, d => +yValue(d)),
            d3.max(data, d => +yValue(d))
            ])
            .rangeRound([height, 0]);
    

        // Create a linear scale
        rScale
            .domain([
                d3.min(data, d => +rValue(d)),
                d3.max(data, d => +rValue(d))
            ]) 
            .range([1, 7]);

        let xAxis = svg.append("g")
            .attr("transform", "translate(0," + (height) + ")")
            .call(d3.axisBottom(xScale));
          
        // X axis label
        xAxis.append("text")        
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + (width - 300) + ",-10)")
            .text(xLabelText);
        
        
        let yAxis = svg.append("g")
            .call(d3.axisLeft(yScale))
            .append("text")
            .attr("class", "axisLabel")
            .attr("transform", "translate(" + yLabelOffsetPx + ", -12)")
            .text(yLabelText);
  
        const colorScale = d3.scaleOrdinal()
            .domain(data.map(d => d.category)) // Get unique categories
            .range(["#000000", "#e6194B", "#f58231", "#FFD700", "#3cb44b",
              "#42d4f4", "#911eb4"]); // Use a built-in color scheme


        // Add the points
        let points = svg.append("g")
            .selectAll(".scatterPoint")
            .data(data)

        points.exit().remove();
    
        // svg.selectAll("point.scatterPoint")
        // .on('mouseover',function(d){
        //     tip.show(d);
        // })

        


        // Set tooltips
        var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            return "<strong>Country: </strong><span class='details'>" + d.GeoAreaName + "<br></span>" 
            + "<strong>Electricity: </strong><span class='details'>" + d.Electricity2021 +"<br></span>" 
            + "<strong>Renewable Energy: </strong><span class='details'>" + d.Renewable2021 + "<br></span>" 
            + "<strong>GDP per Capita: </strong><span class='details'>" + d.GDP + "</span>";
        })

        svg.call(tip);



        
        points = points.enter()
            .append("circle")
            .attr("class", "point scatterPoint")
            .merge(points)
            .attr("cx", X)
            .attr("cy", Y)
            .attr("r", R)
            //     function(d) 
            // {
            // // { 
            //     return d.GDP/10000; })
            .attr("pointer-events", "all")
            .style("fill", d => colorScale(d.Continent)); 

            
          const legend = svg.append("g")
            .attr("transform", `translate(${margin.left-20}, ${325})`);
          var colorScaleDomain = colorScale.domain()
          colorScaleDomain.shift()

          const legendItems = legend.selectAll("g")
            .data(colorScaleDomain)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);
          
          legendItems.append("circle")
            .attr("r", 5)
            .attr("fill", colorScale)
            .classed("colorLegendPoint", true);
          
          legendItems.append("text")
            .attr("x", 15)
            .attr("y", 6)
            .text(d => d);        
          legendItems._groups.shift()  



        
        const legend2 = svg.append("g")
            .attr("transform", `translate(${margin.left+200}, ${325})`);
          
          //   var colorScaleDomain2 = colorScale2.domain()
          // colorScaleDomain2.shift()

          const legendItems2 = legend2.selectAll("g")
            // .data(rScale.domain())
            .data([1000, 5000, 10000, 50000, 100000])
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0, ${i * 20})`);
          
          legendItems2.append("circle")
            .attr("r", rScale)
            .classed("sizeLegendPoint", true)
            // .attr("r", rScale);
          
          
          legendItems2.append("text")
            .attr("x", 15)
            .attr("y", 6)
            .text(d => d);        

        selectableElements = points;
      
        
        let mouseIsDown = false
        let clickedOnPoint = false

        

        svg.selectAll('.scatterPoint')
        .on("mouseover", function(d, i, elements) {
          if (mouseIsDown == true) {
            selectNode(this)
            updateHighlight()   
          }
          tip.show(d);
        })
        .on("mouseout", function(d, i, elements) {
          if (mouseIsDown == true) {
            selectNode(this)
            updateHighlight()
          }
          tip.hide(d)
        })
        .on("mousedown", function(dataFromClick, i, elements) {
            mouseIsDown = true
            clickedOnPoint = true
            svg.selectAll(".scatterPoint").classed("selected", false)
            selectNode(this)
            updateHighlight()
        });
        

        document.addEventListener("mousedown", () => {
            if (clickedOnPoint == false){
                mouseIsDown = true
                svg.selectAll(".scatterPoint").classed("selected", false)
                updateHighlight()
            }
        });
  
        document.addEventListener("mouseup", () => {
            mouseIsDown = false
            clickedOnPoint = false
        });

        
        function selectNode(activeNode) {
          d3.select(activeNode).classed("selected", true)
          const parent = activeNode.parentNode;
          parent.removeChild(activeNode);
          parent.appendChild(activeNode);
        }

        function updateHighlight() {
            let list = svg.selectAll(".selected").data()
            //MAYA ADDED THIS SECTION
            let selectedCountries = list.map(d => d.GeoAreaName);          
            updateBarChart(selectedCountries);
            //END MAYA ADDED
            let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];

            // Let other charts know about our selection
            dispatcher.call(dispatchString, this, list);
        }
        // svg.call(brush);
  
      // Highlight points when brushed
      function brush(g) {
        const brush = d3.brush() // Create a 2D interactive brush
          .on("start brush", highlight) // When the brush starts/continues do...
          .on("end", brushEnd) // When the brush ends do...
          .extent([
            [-margin.left, -margin.bottom],
            [width + margin.right, height + margin.top]
          ]);
          
        ourBrush = brush;
  
        g.call(brush); // Adds the brush to this element
  
        // Highlight the selected circles
        function highlight() {
          if (d3.event.selection === null) return;
          const [
            [x0, y0],
            [x1, y1]
          ] = d3.event.selection;
  
          // If within the bounds of the brush, select it
          points.classed("selected", d => x0 <= X(d) && X(d) <= x1 && y0 <= Y(d) && Y(d) <= y1
          );
  
          // Get the name of our dispatcher's event
          let dispatchString = Object.getOwnPropertyNames(dispatcher._)[0];
  
          // Let other charts know about our selection
          dispatcher.call(dispatchString, this, svg.selectAll(".selected").data());
        }
        
        function brushEnd(){
          // We don't want infinite recursion
          if(d3.event.sourceEvent.type!="end"){
            d3.select(this).call(brush.move, null);
          }         
        }
      }
  
      return chart;
    }
  
    // The x-accessor from the datum
    function X(d) {
      return xScale(xValue(d));
    }
  
    // The y-accessor from the datum
    function Y(d) {
      return yScale(yValue(d));
    }

    function R(d) {
        return rScale(rValue(d));
      }
  
    chart.margin = function (_) {
      if (!arguments.length) return margin;
      margin = _;
      return chart;
    };
  
    chart.width = function (_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };
  
    chart.height = function (_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };
  
    chart.x = function (_) {
      if (!arguments.length) return xValue;
      xValue = _;
      return chart;
    };
  
    chart.y = function (_) {
      if (!arguments.length) return yValue;
      yValue = _;
      return chart;
    };

    chart.r = function (_) {
        if (!arguments.length) return rValue;
        rValue = _;
        return chart;
      };
  
    chart.xLabel = function (_) {
      if (!arguments.length) return xLabelText;
      xLabelText = _;
      return chart;
    };
  
    chart.yLabel = function (_) {
      if (!arguments.length) return yLabelText;
      yLabelText = _;
      return chart;
    };
  
    chart.yLabelOffset = function (_) {
      if (!arguments.length) return yLabelOffsetPx;
      yLabelOffsetPx = _;
      return chart;
    };
  
    // Gets or sets the dispatcher we use for selection events
    chart.selectionDispatcher = function (_) {
      if (!arguments.length) return dispatcher;
      dispatcher = _;
      return chart;
    };
  
    // Given selected data from another visualization 
    // select the relevant elements here (linking)
    chart.updateSelection = function (selectedData) {
      if (!arguments.length) return;
  
      // Select an element if its datum was selected
      selectableElements.classed("selected", d => {
        return selectedData.includes(d)
      });
  
    };
  
    return chart;
  }
