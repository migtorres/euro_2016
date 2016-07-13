    var diameter = 500;
    var radius = diameter / 2;
    var margin = 20;


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

 	var nodes = filterTeams(data);
  circleLayout(nodes);
  var links = createLinks(nodes);
  drawCurves(links)
  drawNodes(nodes);
  
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

    function drawNodes(nodes) {
      // used to assign nodes color by group
      d3.select("#plot").selectAll(".node")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr("id", function(d, i) {
          return d.name;
        })
        .attr("cx", function(d, i) {
          return d.x;
        })
        .attr("cy", function(d, i) {
          return d.y;
        })
        .attr("r", 5)
        .style("fill", "#black")
        .on("mouseover", function(d, i) {
          addTooltip(d3.select(this));
        })
        .on("mouseout", function(d, i) {
          d3.select("#tooltip").remove();
        });
    }

  function drawCurves(links) {
      // remember this from tree example?

      d3.select("#plot").selectAll(".link")
        .data(links)
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
  }

  function findCoords(nodes, name){
    var country = nodes.filter(function (obj) {
      return obj.name === name;
    })[0];
    return {x: country.x, y: country.y}
  }

  



}

d3.json("http://localhost:8000/fixtures.json", draw)

