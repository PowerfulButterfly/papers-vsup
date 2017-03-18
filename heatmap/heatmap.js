
//Global Variables

var svg = d3.select("body").append("svg");

// viridis
var NUM_STEPS = 1000;
var map = d3.range(NUM_STEPS).map(d => d3.interpolateViridis(d/(NUM_STEPS-1)));

var z = d3.scaleQuantize().range(map);


//Chart creation functions

function makeHeatmap(x,y,size,data,z,name){
  //creates an svg heatmap with a 2d matrix of data, and a mapping function z
  var w = size/data[0].length;
  var h = size/data.length;

  var heatmap = svg.append("g")
             .attr("transform","translate("+x+","+y+")");

  if(name){
    heatmap.attr("id",name);
  }

  heatmap.selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .selectAll("rect")
    .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
    .enter()
    .append("rect")
    .datum(function(d,i){ d.c = i; return d; })
    .attr("x", function(d){ return d.c*w;})
    .attr("y", function(d){ return d.r*h;})
    .attr("width",w)
    .attr("height",h)
    .attr("fill", function(d){ return z(d.v);});
}

function makeArcmap(x,y,size,data,z,name){
  //creates an svg "wedge" map
  var w = size/data[0].length;
  var h = size/data.length;

  var arcmap = svg.append("g")
             .attr("transform","translate("+(x+size/2)+","+(y+size)+")");

  if(name){
    arcmap.attr("id",name);
  }

  arcmap.selectAll("g")
  .data(data)
  .enter()
  .append("g")
  .selectAll("path")
    .data(function(d,i){ return d.map(function(val){ return {r:i, v:val};});})
    .enter()
    .append("path")
    .datum(function(d,i){ d.c = i; return d; })
    .attr("d", function(d){ return makeArc(d,size,data.length,data[d.r].length)();})
    .attr("fill", function(d){ return z(d.v);});
}

function makeArc(d,size,rows,cols){
  var angle = d3.scaleLinear().domain([0,cols]).range([-Math.PI/6,Math.PI/6]);
  var radius = d3.scaleLinear().domain([0,rows]).range([size,0]);

  var arc = d3.arc()
  .innerRadius(radius(d.r+1))
  .outerRadius(radius(d.r))
  .startAngle(angle(d.c))
  .endAngle(angle(d.c+1));

  return arc;
}

//Data loading and generation

function randomData(rows,cols){
  //uniform random data
  var data = [];
  for(var i = 0;i<rows;i++){
    data[i] = [];
    for(var j=0;j<cols;j++){
      data[i].push({ u: Math.random(), v: Math.random()});
    }
  }

  return data;
}

//should use d3.interpolateLab for colors.

function cDist(color1,color2){
  //Euclidean distance between two colors in Lab space.
  var c1 = d3.lab(color1);
  var c2 = d3.lab(color2);

  return Math.sqrt( Math.pow( (c1.l-c2.l),2) + Math.pow(c1.a-c2.a,2) + Math.pow(c1.b - c2.b,2));
}

function minDist(colorRamp){
  //What's the closest distance between colors, in our array of colors?
  var minD, D,c1,c2;

  for(var i = 0;i<colorRamp.length;i++){
    for(var j = i+1;j<colorRamp.length;j++){
        D = cDist(colorRamp[i],colorRamp[j]);
        if((i==0 && j==1) || D<minD){
          minD = D;
          c1 = colorRamp[i];
          c2 = colorRamp[j];
        }
    }
  }

  return {"minD": minD, "c1": c1, "c2": c2};
}

// TODO: delete
function checkMap(mapName){
  //Takes a d3 selection containing all the marks we care about
  //Checks to make sure that colors it contains are sufficiently far apart.
  var colorList = [];
  var aColor;

  mapName
    .each(function(d){
      aColor = d3.select(this).attr("fill");
      if(!colorList.includes(aColor)){
        colorList.push(aColor);
      }
    });

    var closest = minDist(colorList);
    console.log( "The two closest colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" apart in CIELAB.");
    return closest.minD>5;
}

/**
 * Uncertainty is in the range from 0 to 1-1/n.
 * Value is in the range of 0 to 1.
 */
function makeScaleData(n) {
  var arr = [];
  for (var u = 0; u < n; u++) {
    var row = [];
    for (var v = 0; v < n; v++) {
      row.push({u: u/n, v: v/(n - 1)});
    }
    arr.push(row);
  }
  return arr;
}

/**
 * Value is in the range 0 to 1.
 * Uncertainty is in the range 0 to 1-1/n.
 */
function makeArcScaleData(n) {
  var arr = [];
  var perRow = n%2==0 ? n : n-1;
  var numRows = Math.floor(Math.log2(n));
  var u = 0;
  while(perRow>=2){
    var row = [];
    for (var v = 0; v < perRow; v++) {
      row.push({u: u/numRows, v: v/(perRow)});
    }
    arr.push(row);
    u++;
    perRow/=2;
  }

  // tip
  arr.push([{u: (n-1)/n, v:1/n}]);

  return arr;
}

function colorDiff(scaleData) {
  var colors = scaleData.reduce(function(arr, curr) {
    return arr.concat(curr.map(uSL));
  }, []);
  return minDist(colors);
}

function main(){
  //Create all relevant maps

  /*TODO
  We'll need:
  1) Juxtaposed Data/Uncertainty maps
  2) Integrated map with regular "square" mapping
  3) Integrated map with "arc" mapping
  4) Legends for both square and arc maps.
  */

  // var scaleData = [
  //   [{v:0.25,u:0.0},{v:0.5,u:0.0},{v:0.75,u:0.0},{v:1.0,u:0.0}],
  //   [{v:0.25,u:0.25},{v:0.5,u:0.25},{v:0.75,u:0.25},{v:1.0,u:0.25}],
  //   [{v:0.25,u:0.5},{v:0.5,u:0.5},{v:0.75,u:0.5},{v:1.0,u:0.5}],
  //   [{v:0.25,u:0.75},{v:0.5,u:0.75},{v:0.75,u:0.75},{v:1.0,u:0.75}]
  // ];

  // 5 is quite low in the yellows
  var THRESHOLD = 10;

  var scaleData, arcScaleData, closest, n;

  n = 2;
  while (true) {
    var data = makeScaleData(n);
    var c = colorDiff(data);
    if (c.minD >= THRESHOLD) {
      scaleData = data;
      closest = c;
    } else {
      break;
    }
    n++;
  }
  console.log("The two closest matrix colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" apart in CIELAB.");

  // var arcScaleData = [
  //   [{v:0.25,u:0.0},{v:0.5,u:0.0},{v:0.75,u:0.0},{v:1.0,u:0.0}],
  //   [{v:0.25,u:0.25},{v:0.5,u:0.25},{v:1.0,u:0.25}],
  //   [{v:0.25,u:0.5},{v:1.0,u:0.5}],
  //   [{v:0.5,u:0.75}]
  // ];

  n = 2;
  while (true) {
    var data = makeArcScaleData(n);
    var c = colorDiff(data);
    if (c.minD >= THRESHOLD) {
      arcScaleData = data;
      closest = c;
    } else {
      break;
    }
    n++;
  }
  console.log("The two closest arc colors:(" + closest.c1 +"," + closest.c2 +") are "+closest.minD+" apart in CIELAB.");


  makeHeatmap(0,0,250,scaleData, uSL, "SquareWhite");
  makeArcmap(300,0,250,arcScaleData, uSL, "ArcWhite");
}

//Uncertainty maps

function uSL(d){
  //interpolate to white
  var cScale = d3.scaleQuantize().domain([0,1]).range(map);
  var steps = map.length;
  var c = (d3.hsl(cScale(d.v)));
  var iVal = d3.scaleLinear().domain([0,1]).range([0.0,1.0]);
  return d3.interpolateLab(c,"white")(iVal(d.u));
}

main();