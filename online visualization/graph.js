var chosenDay = window.location.search.split('=')[1]
var chosenLength = 60;
var chosenSpeed = 0.1;
var chosenLongest = 10;

d3.select("h2").text(chosenDay);
d3.select("title").text("Interactive graph visualization of " + chosenDay)



var daydata;
var sessions;

var modes = [
  { id: 0, color: "black", colorHSL: d3.hsl("black"), name: "Off" },
  { id: 1, color: "#ff545f", colorHSL: d3.hsl("#ff545f"), name: "Láva" },
  { id: 2, color: "#72ff3a", colorHSL: d3.hsl("#72ff3a"), name: "Krajina" },
  { id: 3, color: "#fff53d", colorHSL: d3.hsl("#fff53d"), name: "Plné vrstevnice" },
  { id: 4, color: "#653fff", colorHSL: d3.hsl("#653fff"), name: "Spádové oblasti" },
  { id: 5, color: "#3dffff", colorHSL: d3.hsl("#3dffff"), name: "Voda" },
  { id: 6, color: "#c575ff", colorHSL: d3.hsl("#c575ff"), name: "Psychadelický" },
  { id: 7, color: "#da627d", colorHSL: d3.hsl("#da627d"), name: "Vrstevnice" },
  { id: 8, color: "#ff8f49", colorHSL: d3.hsl("#ff8f49"), name: "Výukový" },
];

var modeColors = { 0:"black", 1:"#ff545f", 2:"#72ff3a", 3:"#fff53d", 4:"#653fff",
                    5:"#3dffff", 6:"#c575ff", 7:"#da627d", 8:"#ff8f49" };
var modeColorsHSL = { 0:d3.hsl("black"), 1:d3.hsl("#ff545f"), 2:d3.hsl("#72ff3a"),
                      3:d3.hsl("#fff53d"), 4:d3.hsl("#653fff"),
                      5:d3.hsl("#3dffff"), 6:d3.hsl("#c575ff"),
                      7:d3.hsl("#da627d"), 8:d3.hsl("#ff8f49") };


var inFormat = d3.timeParse("%Y-%m-%d");
var outFormat = d3.timeFormat("%-d-%-m");

d3.csv("sessions_continue.csv", function(d) {
  return {
    date : d.date,
    sStart : d.session_start,
    sEnd : d.session_end,
    sLength : +d.session_length,
    sID : +d.id,
    sLongestLength : +d.longest_length,
    sSpeed : +d.mode_changes_per_second
  };

}, function(d){
  sessions = d;

});

daydataPath = "full_" + outFormat(inFormat(chosenDay)) + ".csv";
d3.csv(daydataPath, function(d){
  return {
    time: d.time,
    points: +d.overpoints,
    click: +d.click,
    mode: d.mode_id,
  };
}, function(d){
  daydata = d;

  graphWindowFunction();
});

function updateLength(length) {
  chosenLength = length;
  d3.select("#length").text(length)
}

function updateSpeed(speed) {
  chosenSpeed = speed/10000;
  d3.select("#speed").text(speed/1000)
}

function updateLongest(length) {
  chosenLongest = length;
  d3.select("#longest").text(length)
}

function graphWindowFunction() {

  showLegend();

  var gw = 756;
  var gh = 320;

  var graph = d3.select(".graph");
  showReduced(daydata, graph);

  d3.select("p.loading").remove();

  d3.select("#lengthSelect").on("click", function () {
    d3.select("p.loading").append("p")
       .attr("class", "loading").text("Please wait. Data is Loading.");

    showReduced(daydata, graph);
    d3.select("#reduced").attr("disabled", "disabled");
    d3.select("#full").attr("disabled", null);
    d3.select("p.loading").remove;
  });

  d3.select("#speedSelect").on("click", function () {
    showReduced(daydata, graph);
  });

  d3.select("#longestSelect").on("click", function () {
    showReduced(daydata, graph);
  });

  d3.select("#full").on('click', function () {
    d3.select("div.loading").append("p")
      .attr("class", "loading")
      .text("Please wait. Data is Loading.");
    d3.select("#full").attr("disabled", "disabled");
    showFull(daydata, graph);
    d3.select("#reduced").attr("disabled", null);
    d3.select("p.loading").remove();
  });

  d3.select("#reduced").on('click', function () {
    d3.select("div.loading").append("p")
      .attr("class", "loading")
      .text("Please wait. Data is Loading.");
    d3.select("#reduced").attr("disabled", "disabled");
    showReduced(daydata, graph);
    d3.select("#full").attr("disabled", null);
    d3.select("p.loading").remove();
  });

  function showLegend() {
    var legend = d3.select("svg.legend").attr("width", 300).attr("height", 230);
    legend.selectAll("rect")
      .data(modes)
      .enter()
      .append("rect")
        .attr("x", 0)
        .attr("y", function (d) {
          return d.id*25 + 5;
        })
        .attr("width", 50)
        .attr("height", 10)
        .attr("stroke", "none")
        .attr("fill", function (d) {
          return d.color;
        });
    legend.selectAll("text")
      .data(modes)
      .enter()
      .append("text")
        .attr("x", 55)
        .attr("y", function (d) {
          return d.id*25 + 13;
        })
        .text(function (d) {
          return d.name;
        })
        .attr("font-family", "Trebuchet MS")
        .attr("font-size", "15px")
        .attr("stroke", "none")
        .attr("fill", "#c0c0c0");
    legend.append("rect")
      .attr("x", 150)
      .attr("y", 5)
      .attr("width", 50)
      .attr("height", 10)
      .attr("stroke", "none")
      .attr("fill","#ff545f");
    legend.append("rect")
      .attr("x", 150)
      .attr("y", 15)
      .attr("width", 50)
      .attr("height", 10)
      .attr("stroke", "none")
      .attr("fill","#72ff3a");

    legend.append("rect")
      .attr("x", 150)
      .attr("y", 35)
      .attr("width", 50)
      .attr("height", 10)
      .attr("stroke", "none")
      .attr("fill","#ff545f");
    legend.append("rect")
      .attr("x", 150)
      .attr("y", 45)
      .attr("width", 50)
      .attr("height", 10)
      .attr("stroke", "none")
      .attr("fill","#72ff3a");
    legend.append("line")
      .attr("x1", 150)
      .attr("x2", 200)
      .attr("y1", 45)
      .attr("y2", 45)
      .attr("stroke", "white")
      .attr("stroke-width", "2px");
    legend.append("text")
      .text("click")
      .attr("x", 210)
      .attr("y", 48)
      .attr("font-family", "Trebuchet MS")
      .attr("font-size", "15px")
      .attr("stroke", "none")
      .attr("fill", "#c0c0c0");
    legend.append("text")
      .text("automatic")
      .attr("x", 210)
      .attr("y", 20)
      .attr("font-family", "Trebuchet MS")
      .attr("font-size", "15px")
      .attr("stroke", "none")
      .attr("fill", "#c0c0c0");
  }

  // Show reduced graph

  function showReduced(daydata, graph) {
    var graphData = prepareGraphData(daydata);

    graph.selectAll(".gData").remove();
    graph.selectAll(".gLayout").remove();

    gh = graphData.gLength + graphData.gData.length*15;

    graph.attr("width", gw).attr("height", gh);


    drawLayout(graph);

    var position = 0;

    for (sData of graphData.gData) {
      var id = graphData.sIDs.shift();
      drawSessionData(graph, sData, position);
      graph.append("text")
        .text("Session " + id)
        .attr("x", 600)
        .attr("y", position+(sData.length/2))
        .attr("font-family", "Trebuchet MS")
        .attr("font-size", "15px")
        .attr("stroke", "none")
        .attr("fill", "#c0c0c0")
        .attr("class", "gData")
        .append("svg:title")
        .text(function(d) {
          var s = sessions[id];
          return  "Session length: " +
                  s.sLength +
                  " seconds\nLength of the longest interaction: " +
                  s.sLongestLength +
                  " seconds\nNumber of mode changes in 10 seconds: " +
                  s.sSpeed*10;
        });
      drawDivider(graph, position+sData.length);
      position += sData.length + 15;
    }
  }


  // Show full graph
  function showFull(daydata, graph) {

    gh = daydata.length
    graph.attr("height",daydata.length+15);
    graph.selectAll(".gData").remove();
    graph.selectAll(".gLayout").remove();

    drawLayout(graph);

    drawFullGraphData(graph, daydata);

  }


  function prepareGraphData(daydata) {
    var graphData = [];
    var sIDs = [];
    var totalLength = 0;
    for (var i = 0; i < sessions.length; i++) {
      // sem pridat podmienku, ktore session nebrat v uvahu
      // 9 podmienok na mode0 - mode8 ked session[i].modex < pozadovana.modex
      if (sessions[i].date != chosenDay | sessions[i].sLength < chosenLength
            | sessions[i].sSpeed > chosenSpeed
            | sessions[i].sLongestLength < chosenLongest) { // sessions[i].mode0 < 1
        continue;
      }
      sIDs.push(sessions[i].sID);
      for (var j = 0; j < daydata.length; j++) {
        if (daydata[j].time == sessions[i].sStart) {
          if (j<5 | j>daydata.length-5 ) {
            graphData.push(daydata.slice(j,j+sessions[i].sLength));
          } else {
            graphData.push(daydata.slice(j-5,j+sessions[i].sLength+5));
          }
          totalLength += sessions[i].sLength+10;
        }
      }
    }
    return {
      gData: graphData,
      gLength: totalLength,
      sIDs: sIDs
    };
  }

  function drawDivider(graph, position) {
    graph.append("line")
      .attr("x1", 100)
      .attr("y1", position + 5)
      .attr("x2", 665)
      .attr("y2", position + 5)
      .attr("stroke-dasharray", "1, 5")
      .attr("class", "gData")
      .attr("stroke-width", 2)
      .attr("stroke", "#949599");
    graph.append("line")
      .attr("x1", 100)
      .attr("y1", position + 9)
      .attr("x2", 665)
      .attr("y2", position + 9)
      .attr("stroke-dasharray", "1, 5")
      .attr("class", "gData")
      .attr("stroke-width", 2)
      .attr("stroke", "#949599");
  }

  function drawLayout(graph) {
    // Stredova linia
    graph.append("line")
    	.attr("x1", 147)
    	.attr("y1", 0)
    	.attr("x2", 147)
    	.attr("y2", gh)
      .attr("class", "gLayout")
    	.attr("stroke-width", 6)
    	.attr("stroke", "#949599");

    // Pomocne linie
    graph.append("line")
      .attr("x1", 275)
      .attr("y1", 0)
      .attr("x2", 275)
      .attr("y2", gh)
      .attr("stroke-dasharray", "1, 5")
      .attr("class", "gLayout")
      .attr("stroke-width", 2)
      .attr("stroke", "#949599");
    graph.append("line")
      .attr("x1", 400)
      .attr("y1", 0)
      .attr("x2", 400)
      .attr("y2", gh)
      .attr("stroke-dasharray", "1, 5")
      .attr("class", "gLayout")
      .attr("stroke-width", 2)
      .attr("stroke", "#949599");
    graph.append("line")
      .attr("x1", 525)
      .attr("y1", 0)
      .attr("x2", 525)
      .attr("y2", gh)
      .attr("stroke-dasharray", "1, 5")
      .attr("class", "gLayout")
      .attr("stroke-width", 2)
      .attr("stroke", "#949599");
    graph.append("line")
      .attr("x1", 650)
      .attr("y1", 0)
      .attr("x2", 650)
      .attr("y2", gh)
      .attr("stroke-dasharray", "1, 5")
      .attr("class", "gLayout")
      .attr("stroke-width", 4)
      .attr("stroke", "#949599");
  }

  function drawSessionData(graph, sessionGraphData, position) {
    for (var i = 0; i < sessionGraphData.length; i++) {
      graph.append("line") // mod
        .attr("x1", 100)
        .attr("y1", position + i)
        .attr("x2", 144)
        .attr("y2", position + i)
        .attr("stroke-width", 1)
        .attr("class", "gData")
        .attr("stroke", modeColors[sessionGraphData[i].mode]);
      if (sessionGraphData[i].click == 1) {
        graph.append("line") // click
          .attr("x1", 100)
          .attr("y1", position + i)
          .attr("x2", 150)
          .attr("y2", position + i)
          .attr("stroke-width", 2)
          .attr("class", "gData")
          .attr("stroke", "white");
      }
      if (i>0) {
        graph.append("line") // datova linia
          .attr("x1", (sessionGraphData[i-1].points / 40) + 150)
          .attr("y1", position + i-1)
          .attr("x2", (sessionGraphData[i].points / 40) + 150)
          .attr("y2", position + i)
          .attr("stroke-width", 1)
          .attr("stroke", "#f9e526")
          .attr("class", "gData");
      }
      if (i % 60 == 0 | i == sessionGraphData.length) {
        graph.append("text") // cas
          .text(sessionGraphData[i].time)
          .attr("x", 10)
          .attr("y", position+i+15)
          .attr("font-family", "Trebuchet MS")
          .attr("font-size", "15px")
          .attr("stroke", "none")
          .attr("fill", "#c0c0c0")
          .attr("class", "gData");

      }
    }
  }

  // Mody + click + linia + cas
  function drawFullGraphData(graph, graphData) {
    for (var i = 0; i < graphData.length; i++) {
      graph.append("line")
        .attr("x1", 100)
      	.attr("y1", i)
      	.attr("x2", 144)
      	.attr("y2", i)
      	.attr("stroke-width", 1)
        .attr("class", "gData")
      	.attr("stroke", modeColors[graphData[i].mode]);
      if (graphData[i].click == 1) {
        graph.append("line")
          .attr("x1", 100)
          .attr("y1", i)
          .attr("x2", 150)
          .attr("y2", i)
          .attr("stroke-width", 2)
          .attr("class", "gData")
        	.attr("stroke", "white");
      }
      if (i>0) {
        graph.append("line")
          .attr("x1", (graphData[i-1].points / 40) + 150)
          .attr("y1", i-1)
          .attr("x2", (graphData[i].points / 40) + 150)
          .attr("y2", i)
          .attr("stroke-width", 1)
          .attr("stroke", "#f9e526")
          .attr("class", "gData");
      }
      if (i % 600 == 0) {
        graph.append("text")
          .text(graphData[i].time)
          .attr("x", 10)
          .attr("y", i+15)
          .attr("font-family", "Trebuchet MS")
          .attr("font-size", "15px")
          .attr("stroke", "none")
          .attr("fill", "#c0c0c0")
          .attr("class", "gData")
      }
    }
  }
}
