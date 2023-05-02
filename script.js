const title = d3
  .select("body")
  .append("h1")
  .attr("id", "title")
  .text("Video Game Sales");

const description = d3
  .select("body")
  .append("h2")
  .attr("id", "description")
  .text("Top 100 Most Sold Video Games Grouped by Platform");

const tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .attr("id", "tooltip")
  .style("opacity", 0);

const legendWidth = 540;
const legendHeight = 100;
const legendRectSize = 20;

const legendSVG = d3
  .select("body")
  .append("svg")
  .attr("id", "legend")
  .attr("class", "legend")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .attr("transform", (d, i) => {
    const windowWidthHalf = window.innerWidth / 2;
    const legendWidthHalf = legendWidth / 2;
    return `translate(${windowWidthHalf - legendWidthHalf}, 0)`;
  });

const margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

const width = 1200 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;
// Add graph svg
const graphSVG = d3
  .select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom);

const callback = (data) => {
  const color = d3
    .scaleOrdinal()
    .range([
      "#1f77b4",
      "#aec7e8",
      "#ff7f0e",
      "#ffbb78",
      "#2ca02c",
      "#98df8a",
      "#d62728",
      "#ff9896",
      "#9467bd",
      "#c5b0d5",
      "#8c564b",
      "#c49c94",
      "#e377c2",
      "#f7b6d2",
      "#7f7f7f",
      "#c7c7c7",
      "#bcbd22",
      "#dbdb8d",
      "#17becf",
      "#9edae5",
    ]);

  // Get all console names from data outputed with console.log
  const consoleNames = data.children.map((child) => child.name);

  // Add legend and g elements.
  const legendElem = legendSVG
    .selectAll("g")
    .data(consoleNames)
    .enter()
    .append("g")
    .attr("transform", (d, i) => {
      return `translate(${i * (legendRectSize + 10)}, 0)`;
    });

  // Add all rects to legend
  legendElem
    .append("rect")
    .attr("class", "legend-item")
    .style("width", legendRectSize)
    .style("height", legendRectSize)
    .style("fill", (d) => color(d));

  // Add console names to rects
  legendElem
    .append("text")
    .attr("class", "legendText")
    .text((d) => d)
    .attr("transform", "translate(0 , " + (legendRectSize + 10) + ")");

  // Create 1 treemap(NES games data)

  // Isolate the data for NES games
  const nesGamesData = data.children.filter((child) => child.name === "NES")[0];

  // Make data into a hierarchy
  const hierarchy = d3
    .hierarchy(data)
    .eachBefore((d) => {
      d.data.id = `${d.data.name}`;
    })
    .sum((d) => +d.value);

  // Create treemap in order to get the root object
  const treemap = d3.treemap().size([width, height]).padding(1);
  const root = treemap(hierarchy);

  // Add g elements
  const tile = graphSVG
    .selectAll("g")
    .data(root.leaves())
    .enter()
    .append("g")
    .attr("class", "group")
    .attr("transform", (d) => "translate(" + d.x0 + "," + d.y0 + ")");

  //Add rectangles
  tile
    .append("rect")

    .attr("class", "tile")
    .attr("id", (d) => d.data.id)
    .attr("data-name", (d) => d.data.name)
    .attr("data-category", (d) => d.data.category)
    .attr("data-value", (d) => d.value)

    .attr("width", (d) => d.x1 - d.x0)
    .attr("height", (d) => d.y1 - d.y0)
    .style("fill", (d) => color(d.data.category))

    // Add tooltip
    .on("mousemove", (e, d) => {
      tooltip
        .attr("data-value", () => d.data.value)
        .style("opacity", 0.8)
        .style("left", e.pageX + 20 + "px")
        .style("top", e.pageY - 150 + "px");

      tooltip.html(
        "Name: " +
          d.data.name +
          "<br>" +
          "Category: " +
          d.data.category +
          "<br>" +
          "Value: " +
          d.data.value
      );
    })
    .on("mouseout", (e, d) => {
      tooltip.style("opacity", 0);
    });

  // Add text to the rectangles
  tile
    .append("text")
    .attr("class", "tile-text")
    .selectAll("tspan")
    // Split text into many lines, or 1 word per line
    .data((d) => d.data.name.split(" "))
    .enter()
    .append("tspan")
    .attr("x", 5)
    .attr("y", (d, i) => 12 + i * 15)
    .text((d) => d);
};

// Get data
d3.json(
  "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json"
)
  .then(callback)
  .catch((error) => console.error(error));
