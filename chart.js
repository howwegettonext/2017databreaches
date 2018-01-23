// This is the main chart script
// Set chart size
var margin = {
    top: 20,
    right: 50,
    bottom: 20,
    left: 100
  },
  width = parseInt(d3.select('#chartgoeshere').style('width'), 10) - margin.left - margin.right,
  height = width / 0.3333;

// Define a "move to front" function for the mouseover
// Thanks to https://stackoverflow.com/questions/14167863/how-can-i-bring-a-circle-to-the-front-with-d3
d3.selection.prototype.moveToFront = function () {
  return this.each(function () {
    this.parentNode.appendChild(this);
  });
};

// Create date/time parser
var parseTime = d3.timeParse("%d/%m/%Y");

// Create trackers for mobile touch and mouse coords
var touched = false;

// Create an end date for the Y axis - currently mid-September
var endDate = parseTime("15/09/2017");

// Set ranges
var x = d3.scaleLog()
  .range([0, width]);

var y = d3.scaleTime()
  .range([0, height]);

var r = d3.scaleSqrt()
  .range([width / 200, width / 10]);

// Add an SVG element
var svg = d3.select("#chartgoeshere")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Get the data
d3.csv("breach_level_index.csv", function (error, data) {
  if (error) throw error;

  // Format the data
  data.forEach(function (d) {
    d.date = parseTime(d.date); // date parse
    d.records = +d.records; // integer size of breach
  });

  // Scale the ranges
  // X goes from 10,000 to the max of the dataset, niced
  x.domain([10000, d3.max(data, function (d) {
    return d.records;
  })]).nice();

  // Y goes from the first date to a magic number enddate, set above
  y.domain([d3.min(data, function (d) {
      return d.date;
    }) - 20,
				endDate
			  	//d3.max(data, function(d) {
				//	return d.date;
				//})
			]);

  // Circle radius goes from min to max of the dataset
  r.domain([d3.min(data, function (d) {
      return d.records;
    }),
			  d3.max(data, function (d) {
      return d.records;
    })]).nice();

  // Add the dots
  var dots = svg.selectAll("dot")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", function (d) {
      return r(d.records);
    })
    .attr("cx", function (d) {
      return x(d.records);
    })
    .attr("cy", function (d) {
      return y(d.date);
    })
    .attr("fill", function (d) {
      if (d.industry == "Government") return "#e85859";
      else return "#416160";
    });

  // Add mouseover effect
  dots.on("mouseover", function (data) {
    d3.select(this)
      .moveToFront()
      .transition()
      .attr("fill", function (d) {
        if (d.industry == "Government") return "#f8957e";
        else return "#6f9b94";
      }) // Change colour
      .attr("r", function (d) {
        return r(d.records) + 5; // Larger radius
      });

    // Update tooltip position and values
    var tip = d3.select("#tooltip");

    tip.style("left", (x(data.records) + document.getElementById("chartgoeshere").offsetLeft) + 90 + "px")
      .style("top", (y(data.date) + document.getElementById("chartgoeshere").offsetTop) + 30 + "px");


    tip.select("#tip-header")
      .text(data.organisation);

    tip.select("#tip-records")
      .text(d3.format(",d")(data.records));

    tip.select("#tip-location")
      .text(data.location);

    // Show the tooltip
    tip.classed("hidden", false);

  });

  // Add mouseout effect
  dots.on("mouseout", function (data) {
    d3.select(this)
      .transition()
      .attr("fill", function (d) {
        if (d.industry == "Government") return "#e85859";
        else return "#416160";
      }) // Regular colour again
      .attr("r", function (d) {
        return r(d.records); // Radius normal
      });

    // Hide the tooltip
    d3.select("#tooltip").classed("hidden", true);
  });

  // Add touch effect
  dots.on("touch", function (data) {
    // If a tooltip is displayed
    if (touched === false) {
      d3.select(this)
        .moveToFront()
        .transition()
        .attr("fill", function (d) {
          if (d.industry == "Government") return "#f8957e";
          else return "#6f9b94";
        }) // Change colour
        .attr("r", function (d) {
          return r(d.records) + 5; // Larger radius
        });

      // Update tooltip position and values
      var tip = d3.select("#tooltip");

      tip.style("left", (x(data.records) + ((window.innerWidth - width + margin.left + margin.right) / 2)) + "px")
        .style("top", y(data.date) + "px");

      tip.select("#tip-header")
        .text(data.organisation);

      tip.select("#tip-records")
        .text(d3.format(",d")(data.records));

      tip.select("#tip-location")
        .text(data.location);

      // Show the tooltip
      window.setTimeout(function () {
        tip.classed("hidden", false);
      }, 200);

      touched = true;
    } else if (touched === true) {
      d3.select(this)
        .transition()
        .attr("fill", function (d) {
          if (d.industry == "Government") return "#e85859";
          else return "#416160";
        }) // Regular colour again
        .attr("r", function (d) {
          return r(d.records); // Radius normal
        });

      // Hide the tooltip
      d3.select("#tooltip").classed("hidden", true);

      touched = false;
    }
  });

  // Add the x axis
  var xaxis = svg.append("g")
    .style("font", "14px sans-serif")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .tickFormat(function (d) {
        return x.tickFormat(4, d3.format(",d"))(d);
      }));

  // Add the y axis
  var yaxis = svg.append("g")
    .style("font", "14px sans-serif")
    .call(d3.axisLeft(y));



  // Update function
  function update() {

    // Get new width and height
    width = parseInt(d3.select('#chartgoeshere').style('width'), 10) - margin.left - margin.right;
    height = width / 0.3333;

    // Redraw the SVG
    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    // Redefine the scales
    x.range([0, width]);
    y.range([0, height]);
    r.range([width / 200, width / 10]);

    // Move the dots
    dots.attr("r", function (d) {
        return r(d.records);
      })
      .attr("cx", function (d) {
        return x(d.records);
      })
      .attr("cy", function (d) {
        return y(d.date);
      });

    // Move the axes
    xaxis.attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x)
        .tickFormat(function (d) {
          return x.tickFormat(4, d3.format(",d"))(d);
        }));

    yaxis.call(d3.axisLeft(y));
  }

  // Listen for resize and update
  // via https://bl.ocks.org/curran/3a68b0c81991e2e94b19
  window.addEventListener("resize", update);

});
