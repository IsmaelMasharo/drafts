

module.exports = function (chart) {
  var minWidthHeight
  var xScale = chart.meta.xScale
  var yScale = chart.meta.yScale

  function clampRange (vLo, vHi, gLo, gHi) {
    if (gLo > gHi) {
      var t = gLo
      gLo = gHi
      gHi = t
    }
    var hi = Math.min(vHi, gHi)
    var lo = Math.max(vLo, gLo)
    if (lo > hi) {
      // no overlap
      return [-minWidthHeight, 0]
    }
    return [lo, hi]
  }

  var line = function (points, closed) {
    var path = ''
    var range = yScale.range()
    var minY = Math.min.apply(Math, range)
    var maxY = Math.max.apply(Math, range)
    for (var i = 0, length = points.length; i < length; i += 1) {
      if (points[i]) {
        var x = points[i][0]
        var y = points[i][1]
        var yLo = y.lo
        var yHi = y.hi
        // if options.closed is set to true then one of the bounds must be zero
        if (closed) {
          yLo = Math.min(yLo, 0)
          yHi = Math.max(yHi, 0)
        }
        // points.scaledDX is added because of the stroke-width
        var moveX = xScale(x.lo) + points.scaledDx / 2
        var viewportY = clampRange(
          minY, maxY,
          isFinite(yHi) ? yScale(yHi) : -Infinity,
          isFinite(yLo) ? yScale(yLo) : Infinity
        )
        var vLo = viewportY[0]
        var vHi = viewportY[1]
        path += ' M ' + moveX + ' ' + vLo
        path += ' v ' + Math.max(vHi - vLo, minWidthHeight)
      }
    }
    return path
  }

  function plotLine (selection) {
    selection.each(function (d) {
      var el = d3.select(this)
      var evaluatedData = [{scaledDx:0}]
      var innerSelection = el.selectAll(':scope > path.line')
        .data(evaluatedData)

      // the min height/width of the rects drawn by the path generator
      minWidthHeight = 1

      innerSelection.enter()
        .append('path')
        .attr('fill', 'none')

      // enter + update
      innerSelection
        .attr('stroke-width', minWidthHeight)
        .attr('opacity', 1)
        .attr('d', function (d) {
          return line(d, closed)
        })
        .attr(d.attr)

      innerSelection.exit().remove()
    })
  }

  return plotLine
}
