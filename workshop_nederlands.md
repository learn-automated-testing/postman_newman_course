# Postman Newman Workshop

## Deel 1: Introductie Postman en de CRUD API

### Wat is Postman?

Postman is een API platform waarmee je API's kunt bouwen, testen en documenteren. In deze workshop gebruiken we Postman om een Books API te testen met CRUD operaties (Create, Read, Update, Delete).

*Postman is an API platform for building, testing and documenting APIs. In this workshop we use Postman to test a Books API with CRUD operations (Create, Read, Update, Delete).*

### De Books API

We werken met een Books API die de volgende CRUD operaties ondersteunt:

*We work with a Books API that supports the following CRUD operations:*

| Operatie / Operation | HTTP Method | Endpoint | Beschrijving / Description |
|----------------------|-------------|----------|----------------------------|
| Create | POST | `/books` | Maak een nieuw boek aan / *Create a new book* |
| Read (alle) | GET | `/books` | Haal alle boeken op / *Get all books* |
| Read (één) | GET | `/books/{id}` | Haal één boek op / *Get a single book* |
| Update | PUT | `/books/{id}` | Werk een boek bij / *Update a book* |
| Delete | DELETE | `/books/{id}` | Verwijder een boek / *Delete a book* |

### Collectie Importeren / Import Collection

1. Open Postman
2. Ga naar "My Workspace" / *Go to "My Workspace"*
3. Klik op "Import" / *Click "Import"*
4. Importeer het bestand: `Books API - CRUD Regression Tests.postman_collection.json`

---

## Deel 2: Test Validaties Maken 

### Tests Tab in Postman

In Postman kun je tests schrijven in de "Tests" tab van elke request. Tests worden geschreven in JavaScript.

*In Postman you can write tests in the "Tests" tab of each request. Tests are written in JavaScript.*

### Basis Test Voorbeelden / 

**Status code controleren / Check status code:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});
```

**Response tijd controleren / Check response time:**
```javascript
pm.test("Response time is less than 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});
```

**JSON response valideren / Validate JSON response:**
```javascript
pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("id");
    pm.expect(jsonData).to.have.property("title");
    pm.expect(jsonData).to.have.property("author");
});
```

**Array lengte controleren / Check array length:**
```javascript
pm.test("Response contains books", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an("array");
    pm.expect(jsonData.length).to.be.above(0);
});
```

**Specifieke waarde controleren / Check specific value:**
```javascript
pm.test("Book title is correct", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.title).to.eql("The Great Gatsby");
});
```

---

## Deel 3: API Requests aan Elkaar Linken / Linking API Requests

### Variabelen Gebruiken / Using Variables

Om data door te geven tussen requests gebruik je variabelen. Dit is essentieel voor CRUD testen waarbij je eerst een item aanmaakt en daarna het ID nodig hebt voor volgende requests.

*To pass data between requests you use variables. This is essential for CRUD testing where you first create an item and then need the ID for subsequent requests.*

### Data Opslaan in Variabelen / Saving Data to Variables

**In de Tests tab van een POST request:**

```javascript
// Haal de response data op / Get the response data
const jsonData = pm.response.json();

// Sla het ID op als collection variabele / Save the ID as collection variable
pm.collectionVariables.set("bookId", jsonData.id);

// Of als environment variabele / Or as environment variable
pm.environment.set("bookId", jsonData.id);
```

### Variabelen Gebruiken in Requests / Using Variables in Requests

Gebruik de variabele in de URL of body met dubbele accolades:

*Use the variable in the URL or body with double curly braces:*

**URL:**
```
GET {{baseUrl}}/books/{{bookId}}
```

**Request Body:**
```json
{
    "id": "{{bookId}}",
    "title": "Updated Title"
}
```

### Voorbeeld CRUD Flow / Example CRUD Flow

**Stap 1: Create (POST) - Tests tab:**
```javascript
pm.test("Book created successfully", function () {
    pm.response.to.have.status(201);
    const jsonData = pm.response.json();

    // Sla het ID op voor volgende requests
    // Save the ID for subsequent requests
    pm.collectionVariables.set("bookId", jsonData.id);

    console.log("Created book with ID: " + jsonData.id);
});
```

**Stap 2: Read (GET) - Gebruik het opgeslagen ID:**
```
GET {{baseUrl}}/books/{{bookId}}
```

**Stap 3: Update (PUT) - Tests tab:**
```javascript
pm.test("Book updated successfully", function () {
    pm.response.to.have.status(200);
    const jsonData = pm.response.json();
    pm.expect(jsonData.title).to.eql("Updated Title");
});
```

**Stap 4: Delete (DELETE) - Tests tab:**
```javascript
pm.test("Book deleted successfully", function () {
    pm.response.to.have.status(200);
});

// Ruim de variabele op / Clean up the variable
pm.collectionVariables.unset("bookId");
```

### Pre-request Scripts

Je kunt ook pre-request scripts gebruiken om data voor te bereiden voordat de request wordt verzonden:

*You can also use pre-request scripts to prepare data before the request is sent:*

```javascript
// Genereer een unieke titel / Generate a unique title
const uniqueTitle = "Book " + Date.now();
pm.collectionVariables.set("bookTitle", uniqueTitle);
```

---

## Deel 4: Newman Installeren / Installing Newman

### Wat is Newman? / What is Newman?

Newman is een command-line tool voor het uitvoeren van Postman collecties. Hiermee kun je Postman collecties direct vanaf de command line uitvoeren en testen, wat ideaal is voor CI/CD pipelines en geautomatiseerd testen.

*Newman is a command-line collection runner for Postman. It allows you to run and test Postman collections directly from the command line, making it ideal for CI/CD pipelines and automated testing.*

### Vereisten: Node.js Installatie / Prerequisites: Node.js Installation

Newman draait op Node.js, dus dit moet je eerst installeren.

*Newman runs on Node.js, so you need to install it first.*

#### Windows

1. Ga naar [https://nodejs.org](https://nodejs.org) / *Go to [https://nodejs.org](https://nodejs.org)*
2. Download de LTS (Long Term Support) versie / *Download the LTS (Long Term Support) version*
3. Voer het installatiebestand uit en volg de installatie wizard / *Run the installer and follow the installation wizard*
4. Herstart je terminal/command prompt na de installatie / *Restart your terminal/command prompt after installation*

#### macOS

**Optie 1: Downloaden van de website / Option 1: Download from website**
1. Ga naar [https://nodejs.org](https://nodejs.org) / *Go to [https://nodejs.org](https://nodejs.org)*
2. Download de LTS versie voor macOS / *Download the LTS version for macOS*
3. Voer het installatiebestand uit / *Run the installer*

**Optie 2: Met Homebrew / Option 2: Using Homebrew**
```bash
brew install node
```

#### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Node.js Installatie Controleren / Verify Node.js Installation

```bash
node --version
npm --version
```

Je zou versienummers moeten zien voor beide commando's (Node.js 16 of hoger wordt aanbevolen).

*You should see version numbers for both commands (Node.js 16 or higher is recommended).*

### Newman Installeren / Install Newman

Installeer Newman globaal: / *Install Newman globally:*

```bash
npm install -g newman
```

Controleer de installatie: / *Verify the installation:*

```bash
newman --version
```

---

## Deel 5: Collectie Uitvoeren met Newman / Running Collection with Newman

### Basis Commando / Basic Command

```bash
newman run "Books API - CRUD Regression Tests.postman_collection.json"
```

### Met Environment Bestand / With Environment File

```bash
newman run collection.json -e environment.json
```

### Veelgebruikte Opties / Common Options

| Optie / Option | Beschrijving / Description |
|----------------|----------------------------|
| `-e, --environment <pad>` | Environment bestand / *Environment file* |
| `-n, --iteration-count <n>` | Aantal iteraties / *Number of iterations* |
| `-r, --reporters <reporters>` | Output formaat (cli, json, html, junit) / *Output format* |
| `--delay-request <ms>` | Vertraging tussen requests / *Delay between requests* |

### Voorbeeld met Meerdere Opties / Example with Multiple Options

```bash
newman run collection.json \
  -e environment.json \
  -r cli,json \
  --reporter-json-export results.json
```

---

## Workshop Opdracht / Workshop Assignment

1. Importeer de Books API collectie in Postman / *Import the Books API collection in Postman*
2. Controleer de tests en fix eventuele fouten / *Check the tests and fix any errors*
3. Zorg dat data correct wordt doorgegeven tussen requests / *Ensure data is passed correctly between requests*
4. Exporteer de collectie en voer deze uit met Newman / *Export the collection and run it with Newman*
