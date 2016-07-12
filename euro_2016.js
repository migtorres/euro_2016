var diameter = 960,
    radius = diameter / 2,
    innerRadius = radius - 120;


function draw (data) {

  var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");


    var svg  = d3.select("body").select("#circle")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter);

    var plot = svg.append("g")
        .attr("id", "plot")
        .attr("transform", "translate(" + radius + ", " + radius + ")");



 	var nodes = filterTeams(data)
  circleLayout(nodes)
  
  function circleLayout(nodes) {

      // use to scale node index to theta value
      var scale = d3.scale.linear()
        .domain([0, nodes.length])
        .range([0, 2 * Math.PI]);

      // calculate theta for each node
      nodes.forEach(function(d, i) {
        // calculate polar coordinates
        var theta = scale(i);
        var radial = innerRadius;

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
      	team_list.push({name: name, matches: [{data}]})
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


}

d3.json("http://localhost:8000/fixtures.json", draw)

