// This script generates a bubble chart showing 
// the 100 biggest data breaches of 2017

// Set chart size

var container = d3.select("#chartgoeshere")
var margin = {
		top: 20,
		right: 20,
		bottom: 20,
		left: 90
	},

	width = container.node().getBoundingClientRect().width - margin.left - margin.right,
	height = container.node().getBoundingClientRect().height - margin.top - margin.bottom;

// Create date/time parser
var parseTime = d3.timeParse("%d/%m/%Y");

// Create trackers for mobile touch and mouse coords
var touched = false;

// Set the custom time format
var formatDay = d3.timeFormat("%a %d"),
	formatWeek = d3.timeFormat("%b %d"),
	formatMonth = d3.timeFormat("%b"),
	formatYear = d3.timeFormat("%Y");

function multiFormat(date) {
	return (d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek) :
		d3.timeYear(date) < date ? formatMonth :
		formatYear)(date);
}

// Set ranges
var x = d3.scaleTime()
	.range([0, width]);

var y = d3.scaleLog()
	.range([height, 0]);

var r = d3.scaleSqrt()
	.range([3, 35]);

// Add an SVG element
var svg = container.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")")

// Get the data
d3.csv("breach_level_index2.csv", function (error, data) {
	if (error) throw error;

	// Format the data
	data.forEach(function (d) {
		d.date = parseTime(d.date) // date parse
		d.records = +d.records // integer size of breach
	});

	// Scale the range
	x.domain([
					d3.min(data, function (d) {
			return d.date;
		}) - 20,
					d3.max(data, function (d) {
			return d.date;
		})
				]).nice();
	y.domain([10000, d3.max(data, function (d) {
		return d.records;
	})]).nice();
	r.domain([
					d3.min(data, function (d) {
			return d.records;
		}),
					d3.max(data, function (d) {
			return d.records;
		})
				]).nice();

	// Add the dots
	svg.selectAll("dot")
		.data(data)
		.enter()
		.append("circle")
		.attr("r", function (d) {
			return r(d.records);
		})
		.attr("cx", function (d) {
			return x(d.date);
		})
		.attr("cy", function (d) {
			return y(d.records);
		})
		.attr("fill", "#e85859")

		// Add mouseover effect
		.on("mouseover", function (data) {
			d3.select(this)
				.transition()
				.attr("fill", "#6f9b94") // Change colour
				.attr("r", function (d) {
					return r(d.records) + 5; // Larger radius
				});

			// Update tooltip position and values
			var tip = d3.select("#tooltip")

			tip.style("left", (x(data.date) + document.getElementById("chartgoeshere").offsetLeft) + 90 + "px")
				.style("top", (y(data.records) + document.getElementById("chartgoeshere").offsetTop) + 30 + "px");


			tip.select("#tip-header")
				.text(data.organisation);

			tip.select("#tip-records")
				.text(d3.format(",d")(data.records));

			tip.select("#tip-location")
				.text(data.location);

			// Show the tooltip
			tip.classed("hidden", false);

		})

		// Add mouseout effect
		.on("mouseout", function (data) {
			d3.select(this)
				.transition()
				.attr("fill", "#e85859") // Regular colour again
				.attr("r", function (d) {
					return r(d.records); // Radius normal
				});

			// Hide the tooltip
			d3.select("#tooltip").classed("hidden", true);
		})

		// Add touch effect
		.on("touch", function (data) {
			// If a tooltip is displayed
			if (touched == false) {
				d3.select(this)
					.transition()
					.attr("fill", "#6f9b94") // Change colour
					.attr("r", function (d) {
						return r(d.records) + 5; // Larger radius
					});

				// Update tooltip position and values
				var tip = d3.select("#tooltip")

				tip.style("left", (x(data.date) + ((window.innerWidth - width + margin.left + margin.right) / 2)) + "px")
					.style("top", y(data.records) + "px");

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
			} else if (touched == true) {
				d3.select(this)
					.transition()
					.attr("fill", "#e85859") // Regular colour again
					.attr("r", function (d) {
						return r(d.records); // Radius normal
					});

				// Hide the tooltip
				d3.select("#tooltip").classed("hidden", true);

				touched = false;
			};
		});


	// Add the x axis
	svg.append("g")
		.attr("transform", "translate(0," + height + ")")
		.call(d3.axisBottom(x)
			.tickFormat(multiFormat));

	// Add the y axis
	svg.append("g")
		.call(d3.axisLeft(y)
			.tickFormat(function (d) {
				return y.tickFormat(4, d3.format(",d"))(d)
			}));
});
