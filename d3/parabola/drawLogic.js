
function draw1d(dataset, bounds, xScale, yScale) {

  const scaledDx = xScale(dataset[1].x) - xScale(dataset[0].x)
  const minWidthHeight = Math.max(scaledDx, 1)

  const line = bounds.append("path")
      .data([dataset])
      .attr("fill", "none")
      .attr("stroke", "#af9358")
      .attr("stroke-width", minWidthHeight)

  const clamp = (val, min, max) => {
    val = isFinite(val) ? yScale(val) : Math.sign(val)*Infinity
    return val < min ? min : (val > max ? max : val)
  }

  const clampLineGenerator = function (points) {
    let path = ''
    let range = yScale.range()
    let minY = Math.min.apply(Math, range)
    let maxY = Math.max.apply(Math, range)
    for (let i = 0, length = points.length; i < length; i += 1) {
      let x = points[i].x
      let y = points[i].y

      let moveX = xScale(x) + scaledDx / 2
      let viewportY = clamp(
        y, minY, maxY
      )
      let ind = 0
      let viewportbefore = viewportY

      try {
        ind = points[i-1].y
        viewportbefore = clamp(
          ind, minY, maxY
        )
      } catch { 
        ind = points[i].y
      }

      const dif = Math.abs(viewportY-viewportbefore)

      if (viewportY === 0 && viewportY === 0) {
        continue
      }

      path += ' M ' + moveX + ' ' + Math.min(viewportY, viewportbefore)
      path += ' v ' + Math.max(minWidthHeight, dif)
    }
    return path
  }

  line.attr("d", function (d) {
    return clampLineGenerator(d)
  })

  return line
}