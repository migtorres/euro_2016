	var diameter = 960,
    radius = diameter / 2,
    innerRadius = radius - 120;

var cluster = d3.layout.cluster()
    .size([360, innerRadius])
    .sort(null)
    .value(function(d) { return d.size; });

var bundle = d3.layout.bundle();

var line = d3.svg.line.radial()
    .interpolate("bundle")
    .tension(.85)
    .radius(function(d) { return d.y; })
    .angle(function(d) { return d.x / 180 * Math.PI; });

var svg = d3.select("body").append("svg")
    .attr("width", diameter)
    .attr("height", diameter)
  .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");

d3.json("http://localhost:8000/fixtures.json", function(data) {

 	var teams = filterTeams(data)

 	function filterTeams (data){


 	map = {}
 	function find(name, data) {
      var team = map[name];
      if (!team) {
      	team = map[name] = {team: name, matches: [{data}]}
      }
      else {
      	map[name].matches.push(data)
      }
      
    return map[name];
  	}

  	team_list = []
 	data.fixtures.forEach(function(d) {
    	team_list.push(find(d.homeTeamName, d));
  	});
 	return team_list
 	}

})

