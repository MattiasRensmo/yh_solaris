/* 
https://gist.github.com/Andreas-Zocom/283889abba78b0a5edf9c09a430c02cd

Betygskriterier

Godkänt

    Att det ser ut enligt skiss.
    Att API:et används.
    Sidan fungerar med inga fel i konsolen i developer tools.
    Vettiga namn på variabler och funktioner på engelska.
    Inga hårdkodade API-nycklar utan det ska alltid göras ett anrop för att få en API-nyckel först.

Väl godkänt

    Allt i godkänt.
    Att din kod är uppdelad i moduler där du har skrivit en kommentar i varje modul om varför du har delat upp som du gjort.

Sista inlämningsdag

    torsdagen 7/12

    
*Psudo


Landingpage gör vi med HTML CSS utan API-call

Eventlistner på hela solsystemet. 
- Väljer vilket API-call vi vill göra beroende på id.

När vi klickar på en planet gör vi API-call
- Hämta api-key om vi inte redan har det
- Hämta info om planet. 

Visa-infosidan
- Stängknapp
- Bakåt i webbläsaren ska oxå fungera

*/

/*
 * Eventlistners
 */

/*
 * Globala variabler
 */
const baseUrl = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com'

let apiKey = getApiKey()
let planets = getPlanets()

const domPageHeader = document.querySelector('#page-header')
const domSolarSystem = document.querySelector('#solar-system')
const domPlanetInfo = document.querySelector('#planet-info')
const domDetailsPlanet = document.querySelector('#details__planet')
const domDetailsClose = document.querySelector('#details__close')
const domDetailsBackground = document.querySelector('.details__background')
const domPlanetName = document.querySelector('#planet-name')

domSolarSystem.addEventListener('click', showPlanetInfo)
domSolarSystem.addEventListener('mouseover', showPlanetName)
domDetailsClose.addEventListener('click', closeDetails)

console.log(planets)

function showPlanetName(event) {
  console.log(event.target.title)
  domPlanetName.innerText = event.target.dataset.title || ''
}

function showPlanetInfo(e) {
  const { classList, id } = e.target
  console.log(e)
  if (!classList.contains('planet')) return
  const clickedId = Number(id.replace('planet-', ''))
  console.log(planets)
  planets.then((resolvedPlanets) => {
    console.log(resolvedPlanets)
    const chosenPlanet = resolvedPlanets.filter((planet) => planet.id == clickedId)[0]
    const { name, latinName, desc, circumference, distance, temp, moons } = chosenPlanet
    console.log(chosenPlanet)
    console.log([name, latinName, desc, circumference, distance, temp, moons])
    addToDom(name, '', '.details__title')
    addToDom(latinName, '', '.details__subtitle')
    addToDom(desc, '', '.details__descritption')
    addToDom(circumference, 'km', '#planet__size')
    addToDom(distance, 'km', '#planet__distance')
    addToDom(temp.day, '°C', '#planet__max-temp')
    addToDom(temp.night, '°C', '#planet__min-temp')
    addToDom(moons, '', '#planet__moons')
    //Give the details illustration the right color
    domDetailsPlanet.className = `planet details__planet planet-${clickedId}`
    showDetails()
  })
}

function addToDom(input, unit, elementName) {
  if (Array.isArray(input)) {
    const ul = document.querySelector(elementName)
    ul.innerHTML = ''
    const clean = noDuplicates(input)
    clean.forEach((moon) => {
      const li = document.createElement('li')
      li.className = 'details__value'
      li.innerText = moon
      ul.append(li)
    })
  } else {
    if (typeof input == 'number') {
      document.querySelector(elementName).innerText = input.toLocaleString('sv-SE') + ' ' + unit
    } else {
      document.querySelector(elementName).innerText = input
    }
  }
}

function noDuplicates(arr) {
  return arr.filter((value, index) => arr.indexOf(value) === index)
}

async function getApiKey() {
  try {
    console.log('Trying API-key')
    const response = await fetch(baseUrl + '/keys', { method: 'POST' })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }
    const { key } = await response.json()
    return key
  } catch (error) {
    console.error(error)
    //toto: Vi har nätverksproblem i domen
  }
}

async function getPlanets() {
  try {
    console.log('Trying planets')
    if (!apiKey) {
      //Get an API-key if we dont have one
      apiKey = await getApiKey()
    }
    const response = await fetch(baseUrl + '/bodies', {
      headers: { 'x-zocom': await apiKey },
    })
    if (!response.ok) throw new Error(response.status)
    const planetData = await response.json()
    const { bodies } = planetData
    setPlanetSize(bodies)
    return bodies
  } catch (error) {
    console.error(error)
    //toto: Vi har nätverksproblem i domen
  }
}

async function setPlanetSize(bodies) {
  const sunSize = 4_379_000 //The sun is max size

  bodies.forEach((planet) => {
    const { circumference, id } = planet
    const flexBasis = map(circumference, 0, sunSize, 1, 100)
    const domPlanet = document.querySelector(`#planet-${id}`)
    domPlanet.style.flex = `${flexBasis}`
  })
}

function map(current, in_min, in_max, out_min, out_max) {
  const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  return clamp(mapped, out_min, out_max)
}

function clamp(input, min, max) {
  return input < min ? min : input > max ? max : input
}

function closeDetails() {
  domPageHeader.style.display = 'block'
  domSolarSystem.style.display = 'flex'
  domPlanetInfo.style.display = 'none'
  domDetailsPlanet.style.display = 'none'
  domDetailsBackground.style.display = 'none'
}

function showDetails() {
  domPageHeader.style.display = 'none'
  domSolarSystem.style.display = 'none'
  domPlanetInfo.style.display = 'block'
  domDetailsPlanet.style.display = 'block'
  domDetailsBackground.style.display = 'block'
}
