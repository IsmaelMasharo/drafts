async function drawParabola() {

  // 0. Data model
  const fn = x => 1/x//Math.pow(x, 2)

  // 1. Access data
  let dataset = await makeArr(-6, 6, 5000).map(d => {
      return {
          x:d, y:fn(d)
      }
  })

  // 2. Create chart dimensions
  const width = d3.min([
      window.innerWidth * 0.9,
      window.innerHeight * 0.9,
    ])

  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }

  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom


  // 3. Draw canvas

  const wrapper = d3.select("#wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${
      dimensions.margin.left
    }px, ${
      dimensions.margin.top
    }px)`)

  const { xDomain, yDomain} = computeDomains(
    dimensions.boundedWidth, dimensions.boundedHeight
  )

  // 4. Create scales
  const xScale = d3.scaleLinear()
    .domain(xDomain)
    .range([0, dimensions.boundedWidth])
    .nice()

  const yScale = d3.scaleLinear()
    .domain(yDomain)
    .range([dimensions.boundedHeight, 0])
    .nice()

  // 5. Draw data

  const line = draw1d(dataset, bounds, xScale, yScale)


  // 6. Draw peripherals

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${
        yScale(0)
      }px)`)

  const yAxis = bounds.append("g")
    .call(yAxisGenerator)
      .style("transform", `translateX(${
        dimensions.boundedWidth/2
      }px)`)


  // delta dragable line
  let data = [
    {x:xScale(1), y:yScale(0)},
    {x:xScale(-1), y:yScale(0)}
  ]

  const deltaLineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)

  const deltaLine = bounds.append("path")
      .attr("d", deltaLineGenerator(data))
      .attr("stroke-width", 3)

  const dragC = d3.drag().on('drag', dragCircle)

  function dragCircle(d, i, nodes) {
    
    const current = nodes[i]
    // const pair = nodes[i ? 0 : 1]

    // update both circles equidistance x position
    d3.select(current).attr("cx", (position) => position.x += d3.event.dx)
    // d3.select(pair).attr("cx", (position) => position.x -= d3.event.dx)

    // update delta line
    updatePath()

    // update epsilon line
    const x0 = xScale.invert(data[0].x)
    const x1 = xScale.invert(data[1].x)

    const y0Scaled = yScale(fn(x0))
    const y1Scaled = yScale(fn(x1))

    ran[0].y = y0Scaled
    ran[1].y = y1Scaled

    updateEpsilon()

  }

  const circle = bounds
    .selectAll('circle')
    .data(data)
    .enter().append('circle')
      .attr('r', 5)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
    .call(dragC)

  function updatePath() {
    deltaLine.attr('d', deltaLineGenerator(data));
  }

  // draw epsilon path
  let ran = [
    {x:xScale(0), y:yScale(fn(-1))},
    {x:xScale(0), y:yScale(fn(1))}
  ]

  const epsilonLineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)

    const epsilonLine = bounds.append("path")
      .attr("d", epsilonLineGenerator(ran))
      .attr("stroke-width", 3)

  function updateEpsilon() {
    epsilonLine.attr('d', epsilonLineGenerator(ran));
  }
}
drawParabola()