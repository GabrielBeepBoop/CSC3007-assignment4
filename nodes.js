var linkURL = "https://chi-loong.github.io/CSC3007/assignments/links-sample.json";
var casesURL = "https://chi-loong.github.io/CSC3007/assignments/cases-sample.json";


let width = 800;
let height = 400;
let selection = "gender";
let caseInformation = [];
let dateFormat = d3.timeParse("%d/%m/%Y");

//Scales for the Gender/Vaccination
let genderScale = d3.scaleOrdinal(["male", "female"], ["blue", "pink"]);
let vaccinatedScale = d3.scaleOrdinal(["no", "partial (1 dose)", "yes (2 doses)"], ["red", "yellow", "green"]);

// Array for the legends
var genderArray = ["Male", "Female"];
var genderColorArray = ["blue", "pink"]

var vaccinationArray = ["No", "Partial (1 Dose)", "Yes"]
var vaccinationColorArray = ["Red", "Yellow", "Green"]

Promise.all([d3.json(linkURL), d3.json(casesURL)]).then(data => {

// Data preprocessing
    data[0].forEach(e => {
        e.source = e.infector;
        e.target = e.infectee;
    });
    
    caseInformation = data[1];
    
    let simulation = d3.forceSimulation(data[1])
    .force("charge", d3.forceManyBody().strength(-350))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX()
        .strength(0.1)
    )
    .force("y", d3.forceY()
        .y(height / 2)
        .strength(0.1)
    )
    .force("link", d3.forceLink(data[0])
        .id(d => d.id)
        .distance(20)
        .strength(0.5)
    )
    .on("tick", tick);
    
let svg = d3.select("#graph").append("svg")
    .attr("viewBox", "0 0 " + width + " " + height);

svg.append("rect")
    .attr("class", "rectBackground")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);
    
let graph = svg.append("g").attr("id", "graph");
    
let linkpath = graph.append("g").attr("id", "links")
    .selectAll("path")
    .data(data[0])
  .enter().append("path")
    .attr("class", "link");

let nodes = graph.append("g").attr("id", "nodes")
    .selectAll("g")
    .data(data[1])
    .enter()
    .append("g");
    
let circle = nodes.append("circle")
    .attr("class", "node")
    .attr("id", d => "case_" + d.id)
    .attr("r", 15)
    .attr("fill", d => { 
        if (selection == "gender") {
            return genderScale(d.gender);
        } else if (selection == "vaccinated") {
            return vaccinatedScale(d.vaccinated);
        }
    })
    .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).classed("selected", true);
        
        linkpath
        .attr("class", e => { 
            if (e.source.id == d.id || e.target.id == d.id) { return "link selected"; } else { return "link"; }
        });
        
        //Display tooltip
        d3.select(".tooltip")
        .html("Case: #" + d.id + "<br />" + "Age: " + d.age + "<br />"
        + "Nationality: " + d.nationality + "<br />" + "Occupation: " + d.occupation + "<br />" + "Organization: " + d.orginzation + "<br />" )
        .style("position", "absolute")
        .style("background", "black")
        .style("color", "white")
        .style("opacity", 0.5)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px")
        
    })
    .on("mouseout", (event, d) => {
        d3.select(event.currentTarget).classed("selected", false);

        linkpath
        .attr("class", "link");
        
        // Hide the tooltip
        d3.select(".tooltip")
        .text("");
    })
   
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
        
        // Setting the Male/Female Icons
        let image = nodes.append("image")
        .attr("xlink:href",  d => {
            if (d.gender == "male") return "images/male.svg"; else return "images/female.svg"
        })
        .attr("width", 15)
        .attr("height", 15)
        .attr("pointer-events", "none");
        
      
      // Use elliptical arc path segments to doubly-encode directionality.
      function tick() {
        linkpath.attr("d", d => {
          let dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y,
          dr = Math.sqrt(dx * dx + dy * dy);
          return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0 1 " + d.target.x + "," + d.target.y;
        });
        
        circle
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
        
        image
        .attr("x", d => d.x - 7.5)
        .attr("y", d => d.y - 7.5);
      }

      //Function for Dragging the nodes
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      // Function to be called when radio button is selected
      d3.select("#genderSelect").on("click", (event,d)=> {
        createLegend("gender");
        updateSelection("gender");

      });
      d3.select("#vaccinatedSelect").on("click", (event,d)=> {
        createLegend("vaccinated");
        updateSelection("vaccinated");
      });
      
      // Function to be update the nodes
      function updateSelection(category) {
        selection = category;
        
        circle
        .attr("fill", d => { 
          if (selection == "gender") {
          return genderScale(d.gender);
        }  else if (selection == "vaccinated") {
          return vaccinatedScale(d.vaccinated);
        }
    });
}    
    // Function to draw the legends
    function createLegend(selection){
        clearLegend();

        if (selection == "gender"){
            for (var i = 0; i < genderArray.length; i++)
            {
                svg.append("circle")
                .attr('cx',35)
                .attr('cy',40 + (20*i))
                .attr('r',9)
                .style('fill',genderColorArray[i])
                .attr('id',genderColorArray[i])
                
                svg.append("text")
                .attr('x',50)
                .attr('y',40+ (20*i))
                .text(genderArray[i])
                .attr('alignment-baseline','middle')
                .attr('text-anchor','start')
                .attr('id',genderArray[i])
            }
        }

        if (selection == "vaccinated"){
            for (var i = 0; i < vaccinationArray.length; i++)
            {
                svg.append("circle")
                .attr('cx',35)
                .attr('cy',40 + (20*i))
                .attr('r',9)
                .style('fill',vaccinationColorArray[i])
                .attr('id',vaccinationColorArray[i])
                
                svg.append("text")
                .attr('x',50)
                .attr('y',40+ (20*i))
                .text(vaccinationArray[i])
                .attr('alignment-baseline','middle')
                .attr('text-anchor','start')
                .attr('id',vaccinationArray[i])
            }
        }
    }

    // Function to clear the legends
    function clearLegend(){
        var text = d3.selectAll("text")
        text.remove();

        //Remove only the green, rest will overlay
        d3.select("#Green").remove();
        
    }

    // Draw the legend for the first time
    createLegend("gender");
});