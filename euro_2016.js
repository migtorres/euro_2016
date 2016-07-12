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

var link = svg.append("g").selectAll(".link"),
    node = svg.append("g").selectAll(".node");


function(draw) {

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



 	var teams = filterTeams(data)

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

