var diameter = 600;
var radius = diameter / 2;
var margin = 80;


function addTooltip(circle) {
  var x = parseFloat(circle.attr("cx"));
  var y = parseFloat(circle.attr("cy"));
  var r = parseFloat(circle.attr("r"));
  var text = circle.attr("id");

  var tooltip = d3.select("#plot")
  .append("text")
  .text(text)
  .attr("x", x)
  .attr("y", y)
  .attr("dy", -r * 2)
  .attr("id", "tooltip");

  var offset = tooltip.node().getBBox().width / 2;

  if ((x - offset) < -radius) {
    tooltip.attr("text-anchor", "start");
    tooltip.attr("dx", -r);
  } else if ((x + offset) > (radius)) {
    tooltip.attr("text-anchor", "end");
    tooltip.attr("dx", r);
  } else {
    tooltip.attr("text-anchor", "middle");
    tooltip.attr("dx", 0);
  }
}

d3.select("body").select("#circle")
.append("svg")
.attr("width", diameter)
.attr("height", diameter);

  // draw border around svg image
  // svg.append("rect")
  //     .attr("class", "outline")
  //     .attr("width", diameter)
  //     .attr("height", diameter);

  // create plot area within svg image
d3.select("svg")
.append("g")
.attr("id", "plot")
.attr("transform", "translate(" + radius + ", " + radius + ")");

// draw border around plot area
// plot.append("circle")
//     .attr("class", "outline")
//     .attr("r", radius - margin);

var link = d3.select("#plot").selectAll(".link"),
node = d3.select("#plot").selectAll(".node");


function draw (data) {
  var nodes = filterTeams(data);
  circleLayout(nodes);
  var links = createLinks(nodes);

  node = node
    .data(nodes)
    .enter()
    .append("text")
      .attr("class", "node")
      .attr("dx", function(d) { return d.x > 0 ? d.x + 5 : d.x-5 })
      .attr("dy", function(d) { return d.y })
      .text(function(d) { return d.name })
      .style("text-anchor", function(d) { return d.x > 0 ? "start" : "end"; })
      .text(function(d) { return d.name; })
    .on("mouseover", mouseovered)
    .on("mouseout", mouseouted)
    

  link = link.data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("d", function(d){
      var lineData = [
      {
        x: Math.round(d.target.x),
        y: Math.round(d.target.y)
      }, {
        x: Math.round(d.target.x) - Math.round(d.target.x)/3,
        y: Math.round(d.target.y) - Math.round(d.target.y)/3
      }, 
      {
        x: Math.round(d.source.x) - Math.round(d.source.x)/3,
        y: Math.round(d.source.y) - Math.round(d.source.y)/3
      },{
        x: Math.round(d.source.x),
        y: Math.round(d.source.y)
      }];
      return `M${lineData[0].x},${lineData[0].y}C${lineData[1].x},${lineData[1].y},${lineData[2].x},${lineData[2].y},${lineData[3].x},${lineData[3].y} `;
    });
  

  function circleLayout(nodes) {

    // use to scale node index to theta value
    var scale = d3.scale.linear()
    .domain([0, nodes.length])
    .range([0, 2 * Math.PI]);

    // calculate theta for each node
    nodes.forEach(function(d, i) {
      // calculate polar coordinates
      var theta = scale(i);
      var radial = radius-margin;

      // convert to cartesian coordinates
      d.x = radial * Math.sin(theta);
      d.y = radial * Math.cos(theta);
    });

  }

  function filterTeams (data){

    team_list = []
    function find(name, data) {
      var team = team_list.filter(function (team) {
        return team.name === name;
      })[0];

      if (!team) {
       team_list.push({name: name, matches: [data]})
     }
     else {
       team.matches.push(data)
     }
   }

   data.fixtures.forEach(function(d) {
     find(d.homeTeamName, d);
   });


   return team_list;
 }

  function createLinks(nodes){
    links = []
    nodes.forEach(function(d){
      d.matches.forEach(function(m){
        var match = {};
        if (m.status = "FINISHED") {
          match.source = {
            name: d.name,
            x: d.x,
            y: d.y,
            goals: m.result.goalsHomeTeam,
            htGoals: m.result.halfTime.goalsHomeTeam,
            link: m._links.homeTeam.href
          };
          awayCoords = findCoords(nodes, m.awayTeamName)
          match.target = {
            name: m.awayTeamName,
            x: awayCoords.x,
            y: awayCoords.y,
            goals: m.result.goalsAwayTeam,
            htGoals: m.result.halfTime.goalsAwayTeam,
            link: m._links.awayTeam.href
          };
          match.value = m.result.goalsHomeTeam + m.result.goalsAwayTeam
          match.date = m.date
          links.push(match)
        }
      });
    });

    return links

    function findCoords(nodes, name){
     var country = nodes.filter(function (obj) {
       return obj.name === name;
     })[0];
     return {x: country.x, y: country.y}
    }
  }


  function mouseovered(d) {
  
    link
    .classed("link--win", function(l) {
      if ((l.target.name === d.name && l.target.goals < l.source.goals) || (l.source.name === d.name && l.target.goals > l.source.goals))
       return true; 
    })
    .classed("link--loss", function(l) { 
      if ((l.target.name === d.name && l.target.goals > l.source.goals) || (l.source.name === d.name && l.target.goals < l.source.goals))
       return true; 
    })
    .classed("link--draw", function(l) { 
      if (( l.target.name === d.name || l.source.name === d.name ) && l.target.goals == l.source.goals)
       return true; 
    })
    //.filter(function(l) { return l.target.name === d.name || l.source.name === d.name })
    //.each(function() { this.parentNode.appendChild(this);});
  
    node
    .classed("node--target", function(n) { return n.target; })
    .classed("node--source", function(n) { return n.source; });
  }
  
  function mouseouted(d) {
    link
    .classed("link--win", false)
    .classed("link--loss", false)
    .classed("link--draw", false)
    ;
  
    node
    .classed("node--target", false)
    .classed("node--source", false)
  }
 }

 d3.json("https://migtorres.github.io/euro_2016/fixtures.json", draw)

