var promise1 = d3.csv("summary.csv");

// load the second CSV file
var promise2 = d3.csv("graph_edges.csv");

var selected2;
var hovered2;
var nodesToReviewLater = [];

var promise3 = d3.csv("keywords_para.csv");

var promise4 = d3.csv("vocab_edges\\vocab_edges\\sinusoids.csv");

var selected;
var hovered;
var clickedWord;

// wait for both promises to resolve
Promise.all([promise1, promise2, promise3, promise4]).then(function (values) {
  var summaries = values[0];
  var links = values[1];
  var keywords = values[2]; 
  var sinusoids = values[3];

  links = links.filter(function (e) {
    return e["value"] > 0.25;
  });

  var nodes = {};
  var similarities = {};

  var nodes2 = {};

  links.forEach(function (link) {
    if (!(link.source in similarities)) similarities[link.source] = [];
    if (!(link.target in similarities)) similarities[link.target] = [];

    similarities[link.source].push([link.target, parseFloat(link.value)]);
    similarities[link.target].push([link.source, parseFloat(link.value)]);
  });

  links.forEach(function (link) {
    link.source =
      nodes[link.source] || (nodes[link.source] = { name: link.source });
    link.target = 
      nodes[link.target] || (nodes[link.target] = { name: link.target });
  });

  sinusoids.forEach(function (link) {
    link.source =
      nodes2[link.source] || (nodes2[link.source] = { name: link.source });
    link.target =
      nodes2[link.target] || (nodes2[link.target] = { name: link.target });
  });
  
  console.log(nodes2);

  var width = 750, height = 550;
  summaries.forEach(function (summary) {
    if (summary["sub_chapter"] in nodes) {
      nodes[summary["sub_chapter"]]["summary"] = summary["summarization"];
    }
  });

  keywords.forEach(function (row) {
    if (row["sub_chapter"] in nodes) {
      nodes[row["sub_chapter"]]["keywords"] = JSON5.parse(row["keywords"]).slice(0, 5);
    }
  });

  var force = d3
    .forceSimulation()
    .nodes(d3.values(nodes))
    .force("link", d3.forceLink(links).distance(25))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(-100))
    .alphaTarget(1)
    .on("tick", tick);

  var svg = d3
    .select(".graph")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // add the links
  var path = svg
    .append("g")
    .selectAll("path")
    .data(links)
    .enter()
    .append("path")
    .attr("class", function (d) {
      return "link " + d.type;
    });

  // define the nodes
  var node = svg
    .selectAll(".node")
    .data(force.nodes())
    .enter()
    .append("g")
    .attr("class", "node")
    .each(function (d) {
      d.clickCount = 0; //Initialize clickCount to 0 for each node
    })
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );
    var force2 = d3
    .forceSimulation()
    .nodes(d3.values(nodes2))
    .force("link", d3.forceLink(sinusoids).distance(25))
    .force("center", d3.forceCenter(width / 4, height / 5))
    .force("x", d3.forceX())
    .force("y", d3.forceY())
    .force("charge", d3.forceManyBody().strength(-100))
    .alphaTarget(1)
    .on("tick", tick2);

  var svg2 = d3
    .select(".panel")
    .append("svg")
    .attr("width", width / 2)
    .attr("height", height / 3);

    console.log(svg2);

  // add the links
  var path2 = svg2
    .append("g")
    .selectAll("path")
    .data(sinusoids)
    .enter()
    .append("path")
    .attr("class", function (d) {
      return "link " + d.type;
    });

    var node2 = svg2
    .selectAll(".node")
    .data(force2.nodes())
    .enter()
    .append("g")
    .attr("class", "node")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

    node2
    .append("circle")
    .attr("id", function (d) {
      return d.name.toLowerCase();
    })
    .attr("r", 10)
    .style("fill", "black");


  node
    .append("circle")
    .attr("id", function (d) {
      return d.name.toLowerCase();
    })
    .attr("r", 10)
    .style("fill", "pink")
    .on("click", function (d) {
        //reset the fill color for all nodes
        //node.selectAll("circle").style("fill", "pink");

        //Increment clickCount for the clicked node
        d.clickCount++;
        //change the color of the clicked node
        d3.select(this).style("fill", "green");

        selected2 = d;

        if(d.clickCount == 3) {
          d3.select('.summary').html(d.summary + "<br/><span style='color: #FF5733;'>You've clicked on this sub-chapter 3 times. Consider reviewing adjacent subchapters!</span>");
        } else {
        d3.select('.summary').html(d.summary);
        }

        selected = d;

        d3.select(".summary").html(d.summary);
        d3.selectAll(".chip").remove();

        d.keywords.forEach(function(keyword) {
          d3.select(".keywords")
            .append("div")
            .attr("class", "chip")
            .text(keyword)
        });
    })
    .on("mouseover", function (d) {
        hovered2 = d;
        console.log(hovered2);
        if (d.clickCount == 3) {
          d3.select('.summary').html(d.summary + "<br/><span style='color: #FF5733;'>You've clicked on this sub-chapter 3 times. Consider reviewing adjacent subchapters!</span>");
        } else {
        d3.select('.summary').html(d.summary);
        }

        hovered = d;        

        d3.selectAll('.chip').remove();
        d3.select(".summary").html(d.summary);
        
        d.keywords.forEach(function(keyword) {
          d3.select(".keywords").append("div").attr("class", "chip").text(keyword);
        });
        
      // show a tooltip with information about the clicked node
      //tooltip
      //  .html(d.summary)
      //  .style("opacity", 0.9);


        path.style('stroke-width', function(l) {
            if (d === l.source || d === l.target)
            return 6;
        })
        }
    )
    .on("mouseout", function (d) {
        hovered2 = undefined;
        d3.select('.summary').html(selected2.summary);
        path.style('stroke-width', function(l) {
            if (d === l.source || d === l.target)
                return 2;
            })

        hovered = undefined;

        d3.select('.summary').html(selected.summary);
        d3.selectAll('.chip').remove();

        selected.keywords.forEach(function(keyword) {
          d3.select(".keywords").append("div").attr("class", "chip").text(keyword);
        });
    });

  node
    .append("text")
    .attr("dx", 0) // set x position of text relative to node center
    .attr("dy", 0) // set y position of text relative to node center
    .text(function (d) {
      return d.name;
    })
    .style("fill", "blue")
    .style("text-anchor", "middle");

    //added code
    var reviewLaterButton = document.createElement('button');
    reviewLaterButton.id = 'reviewLaterButton';
    reviewLaterButton.innerText = 'Review Later';
    document.body.appendChild(reviewLaterButton);
  
    var reviewLaterList = document.createElement('div');
    reviewLaterList.id = 'reviewLaterList';
    document.body.appendChild(reviewLaterList);
    
    reviewLaterButton.addEventListener('click', function () {
      if (selected2) {
        nodesToReviewLater.push(selected2);
        updateReviewLaterList();
        d3.select('.summary').html(selected2.summary + "<br/><span style='color: #FF5733;'>Node added for later review!</span>");
      } else {
        console.log('No node selected');
      }
    });

    function updateReviewLaterList() {
      // Clear the existing list
      reviewLaterList.innerHTML = '<h3>Nodes to Review Later:</h3>';
      
      // Display the nodes to be reviewed later
      nodesToReviewLater.forEach(function (node) {
        var nodeDiv = document.createElement('div');
        nodeDiv.innerText = node.name;
        reviewLaterList.appendChild(nodeDiv);
      });
    }

    node2
    .append("text")
    .attr("dx", 0) // set x position of text relative to node center
    .attr("dy", 0) // set y position of text relative to node center
    .text(function (d) {
      return d.name;
    })
    .style("fill", "white")
    .style("text-anchor", "middle");

  // add the curvy lines
  function tick() {
    path.attr("d", function (d) {
      var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      return (
        "M" +
        d.source.x +
        "," +
        d.source.y +
        "A" +
        dr +
        "," +
        dr +
        " 0 0,1 " +
        d.target.x +
        "," +
        d.target.y
      );
    });

    node.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function tick2() {
    path2.attr("d", function (d) {
      var dx = d.target.x - d.source.x,
        dy = d.target.y - d.source.y,
        dr = Math.sqrt(dx * dx + dy * dy);
      return (
        "M" +
        d.source.x +
        "," +
        d.source.y +
        "A" +
        dr +
        "," +
        dr +
        " 0 0,1 " +
        d.target.x +
        "," +
        d.target.y
      );
    });
    
    node2.attr("transform", function (d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  function dragstarted(d) {
    if (!d3.event.active) force.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) force.alphaTarget(0);
    if (d.fixed == true) {
      d.fx = d.x;
      d.fy = d.y;
    } else {
      d.fx = null;
      d.fy = null;
    }
  }
});
