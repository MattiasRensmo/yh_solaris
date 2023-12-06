'use strict'
const domPageHeader = document.querySelector('#page-header')
const domSolarSystem = document.querySelector('#solar-system')
const domPlanetInfo = document.querySelector('#planet-info')
const domFooter = document.querySelector('#footer')
const domPlanetName = document.querySelector('#planet-name')
const domDetailsPlanet = document.querySelector('#details__planet')
const domDetailsClose = document.querySelector('#details__close')
const domDetailsBackground = document.querySelector('.details__background')
domSolarSystem?.addEventListener('click', createDetailsPage)
domSolarSystem?.addEventListener('mouseover', showPlanetName)
domDetailsClose?.addEventListener('click', closeDetails)
const baseUrl = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com'
const planets = getPlanets(baseUrl)
async function getPlanets(url) {
  try {
    const apiKey = await getApiKey(url)
    const response = await fetch(url + '/bodies', {
      headers: { 'x-zocom': apiKey },
    })
    if (!response.ok) throw new Error(response.status.toString())
    const planetData = await response.json()
    const { bodies } = planetData
    setPlanetSize(bodies)
    return bodies
  } catch (error) {
    console.error(error)
    if (domPlanetName)
      domPlanetName.innerText = `${error.status.toString()} Just nu har vi nätverksproblem. Testa igen om en stund.`
  }
}
async function getApiKey(url) {
  try {
    const response = await fetch(url + '/keys', { method: 'POST' })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }
    const { key } = await response.json()
    return key
  } catch (error) {
    console.error(error)
    if (domPlanetName)
      domPlanetName.innerText = `${error} Just nu har vi nätverksproblem. Testa igen om en stund.`
  }
}
function setPlanetSize(bodies) {
  const sunSize = 4_379_000 / Math.PI
  bodies.forEach((planet) => {
    const { circumference, id } = planet
    const diameter = circumference / Math.PI
    const flexBasis = map(diameter, 0, sunSize, 1, 100)
    const domPlanet = document.querySelector(`#planet-${id}`)
    if (domPlanet) domPlanet.style.setProperty(`--planet-flex`, flexBasis.toString())
  })
}
function map(current, in_min, in_max, out_min, out_max) {
  const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  if (mapped < out_min) return out_min
  if (mapped > out_max) return out_max
  return mapped
}
function showPlanetName(event) {
  if (!('ontouchstart' in document.documentElement)) {
    if (domPlanetName) {
      const planet = event.target
      domPlanetName.innerText = planet.dataset.title || ''
    }
  }
}
function createDetailsPage(e) {
  const { classList, id } = e.target
  if (!classList.contains('planet')) return
  const clickedId = Number(id.replace('planet-', ''))
  planets.then((resolvedPlanets) => {
    const chosenPlanet = resolvedPlanets.filter((planet) => planet.id == clickedId)[0]
    const { name, latinName, desc, circumference, distance, temp, moons } = chosenPlanet
    addToDom(name, '', '.details__title')
    addToDom(latinName, '', '.details__subtitle')
    addToDom(desc, '', '.details__description')
    addToDom(circumference, 'km', '#planet__size')
    addToDom(distance, 'km', '#planet__distance')
    addToDom(temp.day, '°C', '#planet__max-temp')
    addToDom(temp.night, '°C', '#planet__min-temp')
    addToDom(moons, '', '#planet__moons')
    if (domDetailsPlanet) domDetailsPlanet.className = `planet details__planet planet-${clickedId}`
    showDetails()
  })
}
function addToDom(input, unit, elementName) {
  const parent = document.querySelector(elementName)
  if (!parent) return
  if (Array.isArray(input)) {
    const ul = parent
    ul.innerHTML = ''
    const clean = noDuplicates(input)
    if (clean.length <= 0) {
      ul.innerHTML = '<li class="details__value">Himlakroppen har inga månar</li>'
    }
    clean.forEach((moon) => {
      const li = document.createElement('li')
      li.className = 'details__value'
      li.innerText = moon
      ul.append(li)
    })
  } else {
    if (typeof input == 'number') {
      parent.innerText = input.toLocaleString('sv-SE') + ' ' + unit
    } else {
      parent.innerText = input
    }
  }
}
function noDuplicates(arr) {
  return arr.filter((value, index) => arr.indexOf(value) === index)
}
function closeDetails() {
  if (!document.startViewTransition) {
    toggleDetails(false)
  } else {
    document.startViewTransition(() => {
      toggleDetails(false)
    })
  }
}
function showDetails() {
  if (!document.startViewTransition) {
    toggleDetails(true)
  } else {
    document.startViewTransition(() => {
      toggleDetails(true)
    })
  }
}
function toggleDetails(showDetails) {
  if (
    !domPageHeader ||
    !domSolarSystem ||
    !domPlanetInfo ||
    !domDetailsPlanet ||
    !domDetailsBackground ||
    !domFooter
  )
    return
  if (showDetails) {
    domPageHeader.style.display = 'none'
    domSolarSystem.style.display = 'none'
    domPlanetInfo.style.display = 'block'
    domDetailsPlanet.style.display = 'block'
    domDetailsBackground.style.display = 'block'
    domFooter.style.display = 'none'
  } else {
    domPageHeader.style.display = 'block'
    domSolarSystem.style.display = 'flex'
    domPlanetInfo.style.display = 'none'
    domDetailsPlanet.style.display = 'none'
    domDetailsBackground.style.display = 'none'
    domFooter.style.display = 'block'
  }
}
