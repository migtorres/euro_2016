var diameter = 600,
radius = diameter / 2,
margin = 60,
plot_width = radius + 50,
legend_h = 200,
legend_y = diameter,
legend_x = 6,
result_y = legend_y + 90,
name_selected = null,
extra_game = ["extraTime", "penaltyShootout"]


function draw (data) {


d3.select("body").select("#circle")
.append("h1")
.text("Euro 2016 results")

d3.select("body").select("#circle")
.append("h2")
.text("Winner: Portugal")

d3.select("body").select("#circle")
.append("svg")
.attr("width", diameter + 150)
.attr("height", diameter + 450);

d3.select("svg")
.append("g")
.attr("id", "plot")
.attr("transform", "translate(" + plot_width + ", " + radius + ")");

var legend = d3.select("svg")
  .append("g")
  .attr("id", "legenda")
  .attr("transform", "translate(225, " + legend_y + ")");


// draw border around plot area
// plot.append("circle")
//     .attr("class", "outline")
//     .attr("r", radius - margin);

var node = d3.select("#plot").selectAll(".node"),
link2 = d3.select("#plot").selectAll(".transplink"),
 link = d3.select("#plot").selectAll(".link");
 


  var nodes = filterTeams(data);
  circleLayout(nodes);
  var links = createLinks(nodes),
  links_selected = links

  node = node
    .data(nodes)
    .enter()
    .append("text")
      .attr("class", "node")
      .attr("id", function(d) { return d.name.replace(/\s+/g, '-').toLowerCase(); })
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

     link2 = link2
  	.data(links)
    .enter()
    .append("path")
        .attr("class", function(l){ return "transplink " + l.finish; })
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
    	.on('mouseout', link_mouseout);
    


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
          extra_game.forEach(function(finish){
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

  	if (name_selected){
  		remove_colours(d);
  		name_selected = d.name;
  		add_colours(d);
  		}
  		
  	else
  		{name_selected = d.name;
  		 add_colours(d);}
  }

  function node_mouseover(d){
  	if (name_selected == null)
  		{add_colours(d);}
  }

  function node_mouseout(d){
  	if (name_selected == null)
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
    	if (d.name == n.name) return true; })

    d.opponents.forEach(function(n){
		d3.select('#' + n.replace(/\s+/g, '-').toLowerCase())
    	.classed("node--target", true);
    })
  
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
  	if (name_selected == d.source.name || name_selected == d.target.name){
  		write_results(d)
  	} else if (name_selected == null){
  		write_results(d)
  	}

  }

  function write_results(d){
  	var result = d3.select("svg")
  	.append("g")
  	.attr("id", "result")
  	.attr("transform", "translate(" + plot_width + ", " + result_y + ")")
  	.attr("height", 100)
  	.attr("width",300)

  	result
  		.append("text")
  		.text(d.date.substr(0,10))
  		.attr("class", "date")
  		.style("text-anchor", "middle");

  	var homeTeam = d.source.name,
  	awayTeam = d.target.name,
  	mainScore = result_creator(d.source.fullTimeGoals, d.target.fullTimeGoals)
  	secondaryScore = result_creator(d.source.halfTimeGoals, d.target.halfTimeGoals)

  	if (extra_game.includes(d.finish)) {
  		mainScore = result_creator(d.source.extraTimeGoals, d.target.extraTimeGoals)
  	
  		// Need to improve this

  		if (d.finish == "extraTime"){
  			secondaryScore = result_creator(d.source.fullTimeGoals, d.target.fullTimeGoals)
  			write_score(secondaryScore, 40)
  			result_text("FT:", "end", -35, 40)
  			var tertiaryScore = result_creator(d.source.halfTimeGoals, d.target.halfTimeGoals)
  			write_score(tertiaryScore, 40)
  			result_text("HT:", "end", -35, 60)
  		} 
	
  		if (d.finish == "penaltyShootout") {
  			secondaryScore = result_creator(d.source.penaltyShootoutGoals, d.target.penaltyShootoutGoals)
  			write_score(secondaryScore, 20)
  			result_text("PN:", "end", -35, 40)
  			var tertiaryScore = result_creator(d.source.fullTimeGoals, d.target.fullTimeGoals)
  			write_score(tertiaryScore, 40)
  			result_text("FT:", "end", -35, 60)
  			var quaternaryScore = result_creator(d.source.halfTimeGoals, d.target.halfTimeGoals)
  			write_score(quaternaryScore, 60)
  			result_text("HT:", "end", -35, 80)
  		}

  	} else {
  		write_score(secondaryScore, 40)
  		result_text("HT:", "end", -35, 40)
  	}

  	result
  		.append("text")
  		.text(mainScore)
  		.attr("class", "mainresult")
  		.style("text-anchor", "middle")
  		.attr("transform", "translate(0, 20)");

  	result_text(d.source.name, "end", -35, 20)
  	result_text(d.target.name, "start", 35, 20)

  function result_creator(homeGoals, awayGoals){
  	return homeGoals + " - " + awayGoals
  }

  function result_text(text, type, x, y){
  	result
  		.append("text")
  		.text(text)
  		.attr("class", "subresult")
  		.style("text-anchor", type)
  		.attr("transform", "translate(" + x +","+ y +")")
  }

  function write_score(score, y){
  	d3.select("#result")
  	.append("text")
  	.attr("class", "subresult")
  	.attr("transform", "translate(0, " + y +")")
  	.attr("height", 20)
  	.attr("width",300)
  	.style("text-anchor", "middle")
  	.text(score)}
  }

  function link_mouseout(){
  	d3.select("#result")
  	.remove()
  }

 }

 d3.json("./fixtures.json", draw)
