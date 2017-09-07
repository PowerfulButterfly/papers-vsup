/*
  A lightweight factory for making legends.
*/
import * as d3 from "d3";

export function simpleLegend(m_scale,m_size,m_height,m_format,m_title,m_x,m_y) {
  var el = null,
      title = m_title,
      scale = m_scale ? m_scale : null,
      size = m_size ? m_size : 200,
      height = m_height ? m_height : 30,
      fmat = m_format ? m_format : ".2f",
      x = m_x ? m_x : 0,
      y = m_y ? m_y : 0;

  function legend(nel) {
    el = nel;
    legend.setProperties();
  }

  legend.setProperties = function() {
    if (!el) {
      return;
    }

    var domain = scale.domain(),
        w = size / scale.range().length,
        step = (domain[1] - domain[0]) / scale.range().length,
        dom = d3.range(domain[0], domain[1] + step, step),
        axisScale = d3.scalePoint().range([0, size]).domain(dom).round(true);

    el
      .attr("class", "legend")
      .attr("transform", "translate("+x+","+y+")");

    var rect = el.selectAll("rect").data(scale.range())
    
    rect.enter()
        .append("rect")
      .merge(rect)
        .attr("x", function(d,i) { return i * w; })
        .attr("y", 0)
        .attr("height", height)
        .attr("width", w)
        .attr("fill", function(d) { return d; });

    var axis = el.select("g.legend > g");
    if (axis.empty()) {
      axis = el.append("g");
    }
    axis
      .attr("transform", "translate(0, " + height + ")")
      .call(d3.axisBottom(axisScale).tickFormat(d3.format(fmat)));

    var label = el.select("g.legend > text");
    if (label.empty()) {
      label = el.append("text");
    }
    label
      .style("text-anchor", "middle")
      .style("font-size", 13)
      .attr("transform", "translate(" + (size / 2) + ", " + (height + 30) + ")")
      .text(title);
  };

  legend.title = function(t) {
    if(!arguments.length) {
      return title;
    }
    else {
      title = t;
      legend.setProperties();
      return legend;
    }
  };

  legend.scale = function(s) {
    if(!arguments.length) {
      return scale;
    }
    else {
      scale = s;
      legend.setProperties();
      return legend;
    }
  };

  legend.size = function(s) {
    if(!arguments.length) {
      return size;
    }
    else {
      size = s;
      legend.setProperties();
      return legend;
    }
  };

  legend.height = function(h) {
    if(!arguments.length) {
      return height;
    }
    else {
      height = h;
      legend.setProperties();
      return legend;
    }
  };

  legend.format = function(f) {
    if(!arguments.length) {
      return fmat;
    }
    else {
      fmat = f;
      legend.setProperties();
      return legend;
    }
  };

  legend.x = function(nx) {
    if(!arguments.length) {
      return x;
    }
    else {
      x = nx;
      legend.setProperties();
      return legend;
    }
  };

  legend.y = function(ny) {
    if(!arguments.length) {
      return y;
    }
    else {
      y = ny;
      legend.setProperties();
      return legend;
    }
  };

  return legend;
};

export function heatmapLegend(m_heatmap) {
  var heatmap = m_heatmap;

  var legend = {};

  legend.make = function() {
    if (!heatmap) {
      return;
    }
    // TODO: finish

    var svgGroup = heatmap.svg().append("g")
    var size = heatmap.size;

    svgGroup.attr("transform", "translate(-20, -20)");

    var xAxis = d3.scalePoint().range([0, size]).domain([0,1]);

    svgGroup.append("g")
      .call(d3.axisTop(xAxis).tickFormat(d3.format("d")));

    svgGroup.append("text")
      .style("text-anchor", "middle")
      .style("font-size", 13)
      .attr("transform", "translate(" + (size / 2) + ", " + (-30) + ")")
      .text("Value");

    var yAxis = d3.scalePoint().range([0, size]).domain([0,1]);

    svgGroup.append("g")
      .attr("transform", "translate(" + size + ", 0)")
      .call(d3.axisRight(yAxis).tickFormat(d3.format("d")));

    svgGroup.append("text")
      .style("text-anchor", "middle")
      .style("font-size", 13)
      .attr("transform", "translate(" + (size + 40) + ", " + (size / 2) + ")rotate(90)")
      .text("Uncertainty");
  };

  legend.unmake = function() {
    // TODO
  };

  legend.heatmap = function(nheatmap) {
    if(!arguments.length) {
      return heatmap;
    }
    else {
      heatmap = nheatmap;
      legend.uname();
      legend.make();
      return legend;
    }
  };

  legend.make();
  return legend;
};