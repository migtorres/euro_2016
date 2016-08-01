var diameter = 600;
var radius = diameter / 2;
var margin = 60;
var legend_h = 200
var legend_y = diameter
var legend_x = 6


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


function draw (data) {

d3.select("body").select("#circle")
.append("h1")
.text("Euro 2016 results")

d3.select("body").select("#circle")
.append("svg")
.attr("width", diameter)
.attr("height", diameter + 150);

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

var legend = d3.select("svg")
  .append("g")
  .attr("id", "legenda")
  .attr("transform", "translate(175, " + legend_y + ")")
  ;

// draw border around plot area
// plot.append("circle")
//     .attr("class", "outline")
//     .attr("r", radius - margin);

var node = d3.select("#plot").selectAll(".node"),
 link = d3.select("#plot").selectAll(".link");


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
    .on("mouseover", node_mouseover)
    .on("mouseout", node_mouseout)
    .on("click", node_mouseclicked)
    

  link = link
  	.data(links)
    .enter()
    .append("path")
        .attr("class", function(l){ return "link " + l.finish; })
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
    	})
    .on('mouseover', function(d){link_mouseover(d)})


  legend.append("image")
                .attr("xlink:href", "./legend.png")
                .attr("width", 250)
 				.attr("height", 60);

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
       team_list.push({name: name, matches: [data], opponents: []})
     }
     else {
     	team.matches.push(data)
     }
   }

   data.fixtures.forEach(function(d) {
     find(d.homeTeamName, d);
   });

   team_list.forEach(function(d) {
   		data.fixtures.forEach(function(f){
   			if (d.name == f.awayTeamName){
   				d.opponents.push(f.homeTeamName)
   			}
   			if(d.name == f.homeTeamName){
   				d.opponents.push(f.awayTeamName)
   			}
   		})
   	})
   		
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
            fullTimeGoals: m.result.goalsHomeTeam,
            halfTimeGoals: m.result.halfTime.goalsHomeTeam,
            link: m._links.homeTeam.href
          };
          awayCoords = findCoords(nodes, m.awayTeamName)
          match.target = {
            name: m.awayTeamName,
            x: awayCoords.x,
            y: awayCoords.y,
            fullTimeGoals: m.result.goalsAwayTeam,
            halfTimeGoals: m.result.halfTime.goalsAwayTeam,
            link: m._links.awayTeam.href
          };
          ['extraTime','penaltyShootout'].forEach(function(finish){
            if (m.result.hasOwnProperty(finish)) extraResults(match, m, finish)
          }) 
          match.finish =(match.hasOwnProperty('finish')) ? match.finish : 'fullTime'         
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

  function extraResults(match, m, finish){
    goals = finish + "Goals"
    match.source[goals] = m.result[finish].goalsHomeTeam;
    match.target[goals] = m.result[finish].goalsAwayTeam;
    match.finish = finish;
    match.value = m.result[finish].goalsHomeTeam + m.result[finish].goalsAwayTeam;
  }

  function node_mouseclicked(d){
  	if (typeof d.active == 'undefined' || d.active == false)
  		{d.active = true;
  		 add_colours(d);}
  		
  	else
  		{d.active = false;
  		remove_colours(d);}
  }

  function node_mouseover(d){
  	if (typeof d.active == 'undefined' || d.active == false)
  		{add_colours(d);}
  }

  function node_mouseout(d){
  	if (typeof d.active == 'undefined' || d.active == false)
  		{remove_colours(d);}
  }

  function add_colours(d) {

    link
      .classed("link--win", function(l) {
        if ((l.target.name === d.name && l.target[l.finish + "Goals"] < l.source[l.finish + "Goals"]) || (l.source.name === d.name && l.target[l.finish + "Goals"] > l.source[l.finish + "Goals"]))
         return true; 
      })
      .classed("link--loss", function(l) { 
        if ((l.target.name === d.name && l.target[l.finish + "Goals"] > l.source[l.finish + "Goals"]) || (l.source.name === d.name && l.target[l.finish + "Goals"] < l.source[l.finish + "Goals"]))
         return true; 
      })
      .classed("link--draw", function(l) { 
        if (( l.target.name === d.name || l.source.name === d.name ) && l.target[l.finish + "Goals"] == l.source[l.finish + "Goals"])
         return true; 
      })
      //.filter(function(l) { return l.target.name === d.name || l.source.name === d.name })
      //.each(function() { this.parentNode.appendChild(this);});
    
    node
    .classed("node--source", function(n) { 
    	if (d.name == n.name) return true; });
  }
  
  function remove_colours(d) {
    link
    .classed("link--win", false)
    .classed("link--loss", false)
    .classed("link--draw", false);
  
    node
    .classed("node--target", false)
    .classed("node--source", false);
  }

  function link_classes(d){
    link
      .classed("link--win " + d.finish, function(l) {
        if ((l.target.name === d.name && l.target.fullTimeGoals < l.source[d.finish + "Goals"]) || (l.source.name === d.name && l.target[d.finish + "Goals"] > l.source[d.finish + "Goals"]))
         return true; 
      })
      .classed("link--loss " + d.finish, function(l) { 
        if ((l.target.name === d.name && l.target.fullTimeGoals > l.source[d.finish + "Goals"]) || (l.source.name === d.name && l.target[d.finish + "Goals"] < l.source[d.finish + "Goals"]))
         return true; 
      })
      .classed("link--draw "  + d.finish, function(l) { 
        if (( l.target.name === d.name || l.source.name === d.name ) && l.target[d.finish + "Goals"] == l.source[d.finish + "Goals"])
         return true; 
      })
  }

  function link_mouseover(d){
  	

  }

 }

 d3.json("http://localhost:8000/fixtures.json", draw)

