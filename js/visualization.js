// Immediately Invoked Function Expression to limit access to our 
// variables and prevent race conditions
((() => {
  // Load the data from a json file (you can make these using
  // JSON.stringify(YOUR_OBJECT), just remove the surrounding "")
  d3.json("data/simplifiedData2021.json", (data) => {
    // General event type for selections, used by d3-dispatch
    // https://github.com/d3/d3-dispatch
    const dispatchString = "selectionUpdated";

    // Create a scatterplot given x and y attributes, labels, offsets; 
    // a dispatcher (d3-dispatch) for selection events; 
    // a div id selector to put our svg in; and the data to use.
    let scatter = scatterplot()[0]

    scatter
      .x(d => d.Electricity2021)[0]
      .xLabel("Percent of Population with Access to Electricty")[0]
      .y(d => d.Renewable2021)[0]
      .yLabel("Percent of Total Energy that comes from Renewable Sources")[0]
      .yLabelOffset(150)[0]
      .selectionDispatcher(d3.dispatch(dispatchString))[0]
      ("#scatterplot", data);

    var mapScatterPipeline = mapToScatter(scatter)

  });

})());
