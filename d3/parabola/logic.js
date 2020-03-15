async function drawParabola() {

  // 0. Data model
  const fn = x => Math.pow(x, 2)

  // 1. Access data
  let dataset = await d3.range(-10, 11).map(d => {
      return {
          x:d, y:fn(d)
      }
  })
  console.log({dataset})
  const xAccessor = d => d.x
  const yAccessor = d => d.y

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

  // 4. Create scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.boundedWidth])
    .nice()

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])
    .nice()

  // 5. Draw data

  const lineGenerator = d3.line()
    .curve(d3.curveCatmullRomOpen)
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))

  const line = bounds.append("path")
      .attr("d", lineGenerator(dataset))
      .attr("fill", "none")
      .attr("stroke", "#af9358")
      .attr("stroke-width", 2)

  // 6. Draw peripherals

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${
        dimensions.boundedHeight
      }px)`)

  const yAxis = bounds.append("g")
    .call(yAxisGenerator)
      .style("transform", `translateX(${
        dimensions.boundedWidth/2
      }px)`)


  // draw delta dragable line
  let data = [
    {x:xScale(0), y:yScale(0)},
    {x:xScale(2), y:yScale(0)}
  ]

  const deltaLineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)

  const deltaLine = bounds.append("path")
      .attr("d", deltaLineGenerator(data))
      .attr("stroke-width", 2)

  const dragC = d3.drag().on('drag', dragCircle)

  function dragCircle(d, i, nodes) {
    
    const current = nodes[i]
    const pair = nodes[i ? 0 : 1]

    // update both circles equidistance x position
    d3.select(current).attr("cx", (position) => position.x += d3.event.dx)
    d3.select(pair).attr("cx", (position) => position.x -= d3.event.dx)

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
    {x:xScale(1), y:yScale(fn(0))},
    {x:xScale(1), y:yScale(fn(2))}
  ]

  const epsilonLineGenerator = d3.line()
    .x(d => d.x)
    .y(d => d.y)

  const epsilonLine = bounds.append("path")
      .attr("d", epsilonLineGenerator(ran))
      .attr("stroke-width", 2)

  function updateEpsilon() {
    epsilonLine.attr('d', epsilonLineGenerator(ran));
  }
}
drawParabola()