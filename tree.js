var i = 0;  // Initialize the counter at the top of your script

function update(source) {
    var i = 0;  // Initialize the counter

    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

      // Now apply the exit transition to the exiting nodes
        var nodeExit = node.exit().transition()
        .duration(750)
        .attr("transform", function(d) { 
            return "translate(" + source.y + "," + source.x + ")"; 
        })
        .remove();

        nodeExit.select('circle')
        .attr('r', 1e-6);

        nodeExit.select('text')
        .style('fill-opacity', 1e-6);

        // Same for links
        var linkExit = link.exit().transition()
        .duration(750)
        .attr('d', function(d) {
            var o = {x: source.x, y: source.y};
            return diagonal(o, o);
        })
        .remove();

        // Redefine the `diagonal` path for updated nodes
        function diagonal(s, d) {
        // Define the path from source s to destination d
        }
        
}


// Set the dimensions and margins of the diagram
var margin = {top: 20, right: 90, bottom: 30, left: 90},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the svg object to the body of the page
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Define the data for the tree
var treeData = {
    "name": "Root",
    "children": [
        {
            "name": "Child 1",
            "children": [
                { "name": "Grandchild 1" },
                { "name": "Grandchild 2" }
            ]
        },
        { "name": "Child 2" },
        { "name": "Child 3",             
        "children": [
            { "name": "Grandchild 1" },
            { "name": "Grandchild 2" },
            { "name": "Grandchild 3" },
            { "name": "Grandchild 4" },
            { "name": "Grandchild 5" },
            { "name": "Grandchild 6" }
        ]
        },
    ]
};

// Create a tree layout and specify the size
var treemap = d3.tree().size([height, width]);

// Assigns parent, children, height, depth
var root = d3.hierarchy(treeData, function(d) { return d.children; });
root.x0 = height / 2;
root.y0 = 0;

// Collapse the node and all its children
function collapse(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
        d._children.forEach(collapse);
    }
}

// Collapse after the second level
root.children.forEach(collapse);
update(root);

// Update function to manage the tree layout
function update(source) {
    // Assigns the x and y position for the nodes
    var treeData = treemap(root);

    // Compute the new tree layout.
    var nodes = treeData.descendants(),
        links = treeData.descendants().slice(1);

    // Normalize for fixed-depth
    nodes.forEach(function (d) {
        d.y = d.depth * 180;
    });

    // ****************** Nodes section ***************************

    // Update the nodes...
    var node = svg.selectAll('g.node')
        .data(nodes, function(d) {return d.id || (d.id = ++i); });

    // Enter any new modes at the parent's previous position.
    var nodeEnter = node.enter().append('g')
        .attr('class', 'node')
        .attr("transform", function(d) {
          return "translate(" + source.y0 + "," + source.x0 + ")";
      })
      .on('click', click);

    // Add Circle for the nodes
    nodeEnter.append('circle')
        .attr('class', 'node')
        .attr('r', 1e-6)
        .style("fill", function(d) {
            return d._children ? "lightsteelblue" : "#fff";
        });

    // Add labels for the nodes
    nodeEnter.append('text')
        .attr("dy", ".35em")
        .attr("x", function(d) {
            return d.children || d._children ? -13 : 13;
        })
        .attr("text-anchor", function(d) {
            return d.children || d._children ? "end" : "start";
        })
        .text(function(d) { return d.data.name; });

    // UPDATE
    var nodeUpdate = nodeEnter.merge(node);

    // Transition to the proper position for the node
    nodeUpdate.transition()
      .duration(750)
      .attr("transform", function(d) { 
          return "translate(" + d.y + "," + d.x + ")";
       });

    // Update the node attributes and style
    nodeUpdate.select('circle.node')
      .attr('r', 10)
      .style("fill", function(d) {
          return d._children ? "lightsteelblue" : "#fff";
      })
      .attr('cursor', 'pointer');

      var nodeExit = node.exit().transition()
      .duration(750)
      .attr("transform", function (d) {
          return "translate(" + source.y + "," + source.x + ")";
      })
      .remove();

  // On exit reduce the node circles size to 0
  nodeExit.select('circle')
      .attr('r', 1e-6);

  // On exit reduce the opacity of text labels
  nodeExit.select('text')
      .style('fill-opacity', 1e-6);


    // ****************** links section ***************************

    // Update the links...
    var link = svg.selectAll('path.link')
        .data(links, function(d) { return d.id; });

    // Enter any new links at the parent's previous position.
    var linkEnter = link.enter().insert('path', "g")
        .attr("class", "link")
        .attr('d', function(d){
          var o = {x: source.x0, y: source.y0}
          return diagonal(o, o)
        });

    // UPDATE
    var linkUpdate = linkEnter.merge(link);

    // Transition back to the parent element position
    linkUpdate.transition()
        .duration(750)
        .attr('d', function(d){ return diagonal(d, d.parent) });

    // Remove any exiting links
    var linkExit = link.exit().transition()
        .duration(750)
        .attr('d', function(d) {
          var o = {x: source.x, y: source.y}
          return diagonal(o, o)
        })
        .remove();

    // Store the old positions for transition.
    nodes.forEach(function(d){
      d.x0 = d.x;
      d.y0 = d.y;
    });

    // Creates a curved (diagonal) path from parent to the child nodes
    function diagonal(s, d) {

      path = `M ${s.y} ${s.x}
              C ${(s.y + d.y) / 2} ${s.x},
                ${(s.y + d.y) / 2} ${d.x},
                ${d.y} ${d.x}`

      return path
    }

    function click(event, d) {
        if (d.children) {
          d._children = d.children;
          d.children = null;
        } else {
          d.children = d._children;
          d._children = null;
        }
        update(d);
      }


}