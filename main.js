/*
 * Global variables
 */

// Dom objects on landing page
const domPageHeader = document.querySelector('#page-header')
const domSolarSystem = document.querySelector('#solar-system')
const domPlanetInfo = document.querySelector('#planet-info')
const domFooter = document.querySelector('#footer')
const domPlanetName = document.querySelector('#planet-name')

// Dom objects on details page
const domDetailsPlanet = document.querySelector('#details__planet')
const domDetailsClose = document.querySelector('#details__close')
const domDetailsBackground = document.querySelector('.details__background')

/*
 * Event listeners
 */

//Event listeners without inline anonyms functions for added readability
domSolarSystem.addEventListener('click', createDetailsPage)
domSolarSystem.addEventListener('mouseover', showPlanetName)
domDetailsClose.addEventListener('click', closeDetails)

/*
 * Program Start
 */

const baseUrl = 'https://n5n3eiyjb0.execute-api.eu-north-1.amazonaws.com'

const planets = getPlanets(baseUrl)

/*
 * API Functions
 */

/*
 * En funktion som är ansvarig för att hämta all data från API:et. Jag vill dela upp
 * funktionerna mellan att hämta data och att processa och att visa data. Jag valde
 * att  lägga API-url:en som en global funktion istället för i funktionen för
 * enklare underhåll i framtiden.
 * Anropar en funktion som sätter planeternas storlek på skärmen och returnerar
 * ett promise om en array med 9 himlakroppar
 */
async function getPlanets(url) {
  try {
    // console.log('Trying planets')

    //We need an api-key to make api-requests
    const apiKey = await getApiKey(url)

    //Get the planets with our key
    const response = await fetch(url + '/bodies', {
      headers: { 'x-zocom': apiKey },
    })
    if (!response.ok) throw new Error(response.status)
    const planetData = await response.json()
    const { bodies } = planetData
    setPlanetSize(bodies)
    return bodies
  } catch (error) {
    console.error(error)
    domPlanetName.innerText = `${response.status} Just nu har vi nätverksproblem. Testa igen om en stund.`
  }
}

/*
 * En särskild funktion för att hämta API-nyckeln för att det är ett
 * särskilt moment (jämfört med att hämta data från api:et) med annan metod etc.
 * Det blir också tydligare vad som händer när vi använder funktionen 'getApiKey'
 */
async function getApiKey(url) {
  try {
    // console.log('Trying API-key')
    const response = await fetch(url + '/keys', { method: 'POST' })
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`)
    }
    const { key } = await response.json()
    return key
  } catch (error) {
    // console.error(error)
    domPlanetName.innerText = `${response.status} Just nu har vi nätverksproblem. Testa igen om en stund.`
  }
}

/*
 * Landing page functions
 */

/*
 * Jag vill att planeterna på skärmen ska ha korrekt storlek relaterat till solen.
 * Eftersom detta är en särskild uppgift får den en egen funktion.
 *
 * Efter att jag plockat ut planetens omkrets från API-svaret använder vi Pi för att räkna
 * ut diametern. Sen mappar vi planetens diameter mellan 0 och solens diameter och översätter det
 * till en siffra mellan 1 och 100 (För helt korrekt resultat skulle jag mappa mellan 0 och 100,
 * men det är för svårt att klicka på de minsta planeterna på små skärmar då).
 * Till sist sätter vi flex basis som en css-variabel direkt på varje planet-div
 *  för att sedan använda i CSS-filen.
 */

function setPlanetSize(bodies) {
  const sunSize = 4_379_000 / Math.PI //The sun is max size

  bodies.forEach((planet) => {
    const { circumference, id } = planet
    const diameter = circumference / Math.PI
    const flexBasis = map(diameter, 0, sunSize, 1, 100)

    const domPlanet = document.querySelector(`#planet-${id}`)
    domPlanet.style.setProperty(`--planet-flex`, flexBasis)
  })
}

/*
 * Jag har sett många Coding Train-videor som ofta handlar om JS-biblioteket P5. Där finns en funktion som heter map.
 * Jag googlade hur man gör sin egna.
 * Vi skickar in ett värde tillsammans med vilken skala värdet befinner sig och till vilken skala vi vill konvertera det.
 *
 * EXEMPEL:
 * map(5,0,10,100,200) blir 150
 * 5 är samma på skalan mellan 0 och 10 som 150 är på skalan mellan 100 och 200
 * (5 - 0) * (200 - 100) / (10 - 100) + 0 = 5*100 / 0,1 + 0 = 150
 * På slutet kollar vi oxå att svaret inte blivit större eller mindre än gränsvärdena för den nya skalan.
 * I så fall returnerar vi gränsvärdet.
 */
function map(current, in_min, in_max, out_min, out_max) {
  const mapped = ((current - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min
  if (mapped < out_min) return out_min
  if (mapped > out_max) return out_max
  return mapped
}

/*
 * Hanterar event listener för 'mouseover'
 * Hämtar namnet från dataattribut på varje planet. Om det inte finns
 * visar vi en tom sträng istället.  *
 */
function showPlanetName(event) {
  //No hover on touchscreens
  if (!('ontouchstart' in document.documentElement)) {
    domPlanetName.innerText = event.target.dataset.title || ''
  }
}

/*
 * Detail page functions
 */

/*
 * Hanterar Event listener. Om vi klickat på en planet ska vi ändra innehållet i alla element som
 * redan ligger i html-filen. Vi filtrerar ut vilket planet vi klickat på baserat på dess id i DOM:en
 *
 * Sen har jag gjort en särskild funktion (addToDom) för att lägga till varje värde i DOM:en. Framförallt för
 * ökad läsbarhet i den här funktionen.
 *
 * Visar detaljerna när allt är ändrat.
 */
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

    //Give the planet image on the details page the right color
    domDetailsPlanet.className = `planet details__planet planet-${clickedId}`

    showDetails()
  })
}

/*
 * Egen funktion för tydlighet i 'createDetailsPage'-funktionen
 * Gör en <ul> om den får en array med <li> för varje item. (Printar "Inga månar" om array är tom)
 * Lägger till tusentalsavgränsare och enhet om det är ett nummer.
 * Annars printar den text precis som den är.
 */
function addToDom(input, unit, elementName) {
  if (Array.isArray(input)) {
    const ul = document.querySelector(elementName)
    ul.innerHTML = ''
    const clean = noDuplicates(input)

    //Show 'No moons' if we don't have moons
    if (clean.length <= 0) {
      document.querySelector(elementName).innerHTML =
        '<li class="details__value">Himlakroppen har inga månar</li>'
    }
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

/*
 * Vissa månar upprepas flera gånger i svaret från API. Ta bort dubbletter.
 * Egen funktion för att vi ska kunna återanvända denna överallt
 * där vi vill ta bort dubbletter ur en array.
 * Men också för ökad tydlighet vad den gör utan att behöva skriva kommentarer.
 * indexOf returnerar första index av värdet. Så filtrera bara om det är första gången
 * value hittas i vår array
 */
function noDuplicates(arr) {
  return arr.filter((value, index) => arr.indexOf(value) === index)
}

/*
 * closeDetails(), showDetails(), showDetails() - Funktioner som anropas från lite varstans.
 * Använd inte 'document.startViewTransition' (skapar en liten fade mellan sidorna) om det inte finns stöd för den i webbläsaren.
 * Detta var tidigare två funktioner men flyttade ut alla display:none/block för att inte behöva återupprepa så mycket. Men vill
 * ha kvar en 'closeDetails' och en 'showDetails' för ökad tydlighet i koden.
 *
 */

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
