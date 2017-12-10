var chosenDay = "";
var overview;
var chosenMode = 0;

var inFormat = d3.timeParse("%Y-%m-%d");
var dowFormat = d3.timeFormat("%a");
var shortFormat = d3.timeFormat("%-d.%-m.")

var modeColors = { 0:"black", 1:"#ff545f", 2:"#72ff3a", 3:"#fff53d", 4:"#653fff",
                    5:"#3dffff", 6:"#c575ff", 7:"#da627d", 8:"#ff8f49" };
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
var lights = Array.from(new Array(75), (x,i) => i / 100 );

var modeColorsHSL = { 0:d3.hsl("black"), 1:d3.hsl("#ff545f"), 2:d3.hsl("#72ff3a"),
                      3:d3.hsl("#fff53d"), 4:d3.hsl("#653fff"),
                      5:d3.hsl("#3dffff"), 6:d3.hsl("#c575ff"),
                      7:d3.hsl("#da627d"), 8:d3.hsl("#ff8f49") };

d3.csv("overview.csv", function(d){
  return {
    date : d.date,
    mode : d.mode,
    saturation : d.saturation
  };
}, function (d) {
  overview = d;

  visualize();
});

// visualization

function visualize() {
var days = ['2017-05-08','2017-05-09','2017-05-10','2017-05-11','2017-05-12'
            ,'2017-05-13','2017-05-14'];

d3.select('#selectedDays').on('click', function(){
  days = [];
	var lowerBound = d3.select('#daysFrom').property("value");
	var upperBound = d3.select('#daysTo').property("value");
	var currentDay = lowerBound;
	while(currentDay != upperBound){
		days.push(currentDay);
		currentDay = addDay(currentDay);

	}
	days.push(currentDay);
	console.log(days);
	drawGraph();
});

function addDay(currentDay) {
    var y = currentDay.substr(0,4),
        m = currentDay.substr(5,2),
        d = currentDay.substr(8,2);


    if(m.valueOf()=='04' && d.valueOf()=='30'){
    	m='05';
    	d='01';

    }else if(m.valueOf()=='05' && d.valueOf()=='31'){
    	m='06';
    	d='01';

    }else{
    	d = parseInt(d)+1;
    }
    if(m.substr(0,1)!='0'){ m = checkLeadingZero(m);}
    d = checkLeadingZero(d);

   var nextDay = y+'-'+m+'-'+d;

   return nextDay;
}

function checkLeadingZero(n) {
    return (n < 10) ? ("0" + n) : n;
}

var legend = d3.select("svg.legend").attr("width", 1260).attr("height", 100);
showLegend();

var gh = 32400;
var gw = 756;

// Show overview

var click = false;
var d = days[0];
var oGraph = d3.select("svg.overviewGraph");
var xtranslation = 100;
var ytranslation = 40;
var columnWidth = 50;
var columnHeight = 1081;
var collumnOffset = 5;


drawGraph();


function drawGraph() {
  var column = 0;
  var xp = 0;
  var yp = 0;
  var op = 0;
  oGraph.selectAll("g.hLabel").remove();
  oGraph.selectAll("g.strip").remove();
  oGraph.selectAll("g.brush").remove();
  console.log("removed");

  for (var i = 0; i < days.length; i++) {
    d = days[i];
    yp = 0;

    // prepare a group for labels
    var labels = oGraph.append("g")
      .attr("class", "hLabel")
      .attr("stroke", "none").attr("fill", "#c0c0c0")
      .attr("font-family", "Trebuchet MS").attr("font-size", "18")
      .attr("transform", "translate("
        + (xtranslation + (column*columnWidth) + (column*collumnOffset))
        + ", 0)");

    // write day of Week label
    labels.append("text")
      .attr("x", "5").attr("y", "15")
      .text(dowFormat(inFormat(d)));

    // write date label
    labels.append("text")
      .attr("x", "5").attr("y", "35")
      .text(shortFormat(inFormat(d)));

    // create a clickable rectangle
    labels.append("rect")
      .attr("x", "5").attr("y", "0")
      .attr("width", columnWidth-10).attr("height", "37")
      .attr("class", "daySelect").attr("id", "c"+d)
      .attr("opacity", "0");

    // prepare group for strip
    var group = oGraph.append("g")
      .attr("class", "strip").attr("id", "d" + d)
      .attr("transform", "translate("
          + (xtranslation + (column*columnWidth) + (column*collumnOffset)) + ","
          + ytranslation + ")");

    // prepare group for brush
    oGraph.append("g")
        .attr("class", "brush").attr("id", "b" + d)
        .attr("transform", "translate(" +
          (xtranslation + (column*columnWidth) + (column*collumnOffset)) + "," +
          ytranslation + ")")
        .call(d3.brushY().on("end", brushended).on("start", checkDblclick).extent(function () {
          return [[0, 0], [columnWidth, columnHeight]]
        }));

    // find correct data
    console.log(op);
    while (overview[op].date != d) {
        op++;
    }

    //write lines
    while (overview[op].date == d) {
      var c = modeColorsHSL[overview[op].mode];
      c.l = +overview[op].saturation;
      group.append("line")
        .attr("x1", xp)
        .attr("y1", yp)
        .attr("x2", xp+columnWidth)
        .attr("y2", yp)
        .attr("class", "gData")
        .attr("stroke-width", 1)
        .attr("stroke", c.toString())
        .attr("color", c.toString())
        .attr("mode", overview[op].mode);
      yp++;
      op++;
    }

    column++;
  }
  lines = oGraph.selectAll("line.gData");
  d3.selectAll("rect.daySelect").on('click', function() {
    chosenDay = d3.select(this).attr('id').slice(1);
    window.open('graph.html?day=' + chosenDay);
  });

}

function brushended() {
    if (!d3.event.selection) return; // Ignore empty selections.
    var chosenDay = d3.select(this)['_groups'][0][0].getAttribute('id').slice(1);
}

function checkDblclick() {
  if (click) {
    var chosenDay = d3.select(this)['_groups'][0][0].getAttribute('id').slice(1);
    var chosenStart = d3.event.selection.map(Math.round)[0]
    var chosenEnd = d3.event.selection.map(Math.round)[1]
    setTimeout(function(){window.open('full_graph.html?day=' + chosenDay + '&start=' + chosenStart +
                                '&end=' + chosenEnd);}, 500);

  } else {
    setTimeout(function(){click=false;}, 500);
  }
  click = !click;
};


function showLegend() {

  legend.append("text")
    .text("minimum interactions")
      .attr("x", 0)
      .attr("y", 15)
      .attr("font-family", "Trebuchet MS")
      .attr("font-size", "15px")
      .attr("stroke", "none")
      .attr("fill", "#c0c0c0");
  legend.append("text")
    .text("maximum interactions")
      .attr("x", 0)
      .attr("y", 73)
      .attr("font-family", "Trebuchet MS")
      .attr("font-size", "15px")
      .attr("stroke", "none")
      .attr("fill", "#c0c0c0");

  legend.selectAll("g")
    .data(modes)
    .enter()
    .append("g")
    .attr("id", function (d) {
      return "i"+d.id;
    })
    .attr("transform", function (d) {
      return "translate(" + (d.id*120+35) + ")"
    })
    .attr("class", "mode");

    for (var j = 1; j < modes.length; j++) {
      g = legend.select("g#i"+j);
      g.append("text")
        .text(modes[j].name)
        .attr("x", 0)
        .attr("y", 90)
        .attr("font-family", "Trebuchet MS")
        .attr("font-size", "15px")
        .attr("stroke", "none")
        .attr("fill", "#c0c0c0");

      for (var i = 0; i < lights.length; i++) {
        var c = modeColorsHSL[j];
        c.l = lights[i];
        g.append("line")
            .attr("x1", 0)
            .attr("x2", 50)
            .attr("y1", i)
            .attr("y2", i)
            .attr("stroke-width", 1)
            .attr("stroke", c.toString());
          }
        }

  }

legend.selectAll("g.mode").on("click", function () {
  chosenMode = d3.select(this).attr('id').slice(1);
  // d3.select("div.chosenMode").append("p").text("Chosen mode: " + chosenMode);
  var mb=0;
  lines.each(function () {
    line = d3.select(this);
    line.attr("stroke", line.attr("color"));
    if (line.attr('mode') != chosenMode) {
      line.attr("stroke", "black");
    } else {
      mb += line.attr("")
    }
  });
  // d3.select("div.chosenMode").append("p").text("Mean brightness: " + chosenMode);
});

d3.select("button.allModes").on("click", function () {
  lines.each(function () {
    line = d3.select(this);
    line.attr("stroke", line.attr("color"));
  });
});


}
  // legend.selectAll("text")
  //   .data(modes)
  //   .enter()
  //   .append("text")
  //     .attr("x", 55)
  //     .attr("y", function (d) {
  //       return d.id*25 + 13;
  //     })
  //     .text(function (d) {
  //       return d.name;
  //     })
  //     .attr("font-family", "Trebuchet MS")
  //     .attr("font-size", "15px")
  //     .attr("stroke", "none")
  //     .attr("fill", "#c0c0c0");
