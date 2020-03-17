function computeDomains(width, height) {

  function computeYScale (xDomain) {
    var xDiff = xDomain[1] - xDomain[0]
    return height * xDiff / width
  }

  var xDomain = (function () {
    var xLimit = 12
    return [-xLimit / 2, xLimit / 2]
  })()

  var yDomain = (function () {
    var yLimit = computeYScale(xDomain)
    return [-yLimit / 2, yLimit / 2]
  })()

  return {
    xDomain: xDomain,
    yDomain: yDomain
  }
}
