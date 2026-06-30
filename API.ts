
                       APIs             

The main idea
fetch is JavaScript's tool for talking to any server over the internet. Every API — no matter who built it — speaks the same language: HTTP. Once you understand the shape of that language, you can work with an API you've never seen before, because they're all built on the same rules.

Why it matters
In a real job, you will be handed APIs you've never used, with documentation that's sometimes incomplete or wrong. The developers who struggle are the ones who only know how to copy a working example. The developers who thrive understand the underlying mechanics well enough to debug a fetch call that's failing for reasons no tutorial ever covered.

1. The anatomy of every fetch call
javascriptconst response = await fetch(URL, {
  method: "GET",              // what you want to do
  headers: { ... },           // metadata about the request
  body: JSON.stringify({...}) // data you're sending (not for GET)
});
Every single fetch call, for every API in existence, is some combination of these four pieces. Memorize this shape — not the specific values, the shape.

2. The five methods, and when to use each
MethodMeaningHas a body?ExampleGETRead dataNoFetch a list of productsPOSTCreate new dataYesSubmit a new commentPATCHUpdate part of a recordYesMark a task completePUTReplace a whole recordYesOverwrite a user profileDELETERemove dataUsually noDelete a comment
GET is the default if you don't specify method at all — that's why your Week 2 project never needed a method key.
PATCH vs PUT trips people up: PATCH sends only the fields that changed. PUT sends the entire object, replacing everything — even fields you didn't mean to touch. Prefer PATCH unless documentation specifically calls for PUT.

3. Headers — the request's metadata
javascriptheaders: {
  "Content-Type": "application/json",
  "Authorization": "Bearer YOUR_TOKEN_HERE"
}
Two headers you'll use constantly:

Content-Type: application/json — tells the server "the body I'm sending you is JSON." Required any time you send a body.
Authorization — many APIs require proof you're allowed to access them. Usually a token, like Bearer abc123.... Without it, you'll get a 401 Unauthorized error.

You won't always need headers — GET requests to public APIs often need none at all.

4. The body — and why JSON.stringify exists
javascriptbody: JSON.stringify({ title: "Buy milk", completed: false })
fetch can only send text over the network — never a live JavaScript object. JSON.stringify converts your object into a text string that looks like JSON. The server then parses that text back into its own object on its end.
javascript// What you have in JS:
{ title: "Buy milk", completed: false }

// What actually travels over the network (a string):
'{"title":"Buy milk","completed":false}'
Forget JSON.stringify and most APIs will reject your request or silently misread your data.

5. Reading the response — it's a two-step unwrap
javascriptconst response = await fetch(url);     // step 1: get the response wrapper
const data = await response.json();    // step 2: unwrap the actual data
response itself isn't your data — it's a wrapper containing status info, headers, and a stream of the body. response.json() reads that stream and parses it into a usable JavaScript object. This is also a Promise, so it needs its own await.

6. Status codes — how to actually know what happened
javascriptconsole.log(response.status);  // 200, 201, 404, 500, etc.
console.log(response.ok);      // true if status is 200-299
RangeMeaningExample200–299Success200 OK, 201 Created, 204 No Content300–399Redirectrarely matters for API work400–499You made a mistake400 Bad Request, 401 Unauthorized, 404 Not Found500–599The server made a mistake500 Internal Server Error
Critical fact you already learned but it's worth repeating: fetch only goes to catch if the network itself fails completely — DNS failure, no internet, CORS block. A 404 or 500 response is still a "successful" fetch from JavaScript's point of view. That's why you must always check response.ok yourself:
javascriptif (!response.ok) {
  throw new Error(`Request failed: ${response.status}`);
}

7. The full pattern, every time
javascriptasync function callAPI() {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return result;

  } catch (error) {
    console.error("Request failed:", error.message);
  }
}
This exact shape works for GET, POST, PATCH, and DELETE — you just change method, add/remove body, and adjust what you do with the result.

8. How to approach an API you've never seen before
This is the real skill. When you land a job and get handed unfamiliar API docs, follow this order:

Find the base URL — everything else gets attached to this
Find one GET endpoint and call it first — confirm the connection works and study the exact shape of the data that comes back (field names matter — title vs task, id vs _id)
Check if it needs authentication — look for API key, token, or Authorization in the docs
Read what a POST body should look like — docs usually show an example request body
Test in small steps — console.log after every single step rather than writing 20 lines and hoping


9. Common errors and what they actually mean
javascript// "Failed to fetch" / network error
// → wrong URL, no internet, or CORS blocking the request

// "Unexpected token < in JSON"
// → you tried response.json() on an HTML error page, not real JSON
// → usually means the URL is wrong (404 page returned HTML, not JSON)

// 401 Unauthorized
// → missing or invalid Authorization header

// 400 Bad Request  
// → your body is missing required fields, or has the wrong field names

// CORS error in console
// → the SERVER hasn't allowed your origin — nothing you can fix from your code

10. A bad example — every mistake in one place
javascript// ❌ All the classic mistakes together
function getData() {                          // missing async
  const response = fetch(url);                // missing await
  const data = response.json();                // missing await, response isn't ready
  console.log(data);                            // prints a pending Promise
}

// ❌ POST without the right pieces
fetch(url, {
  method: "POST",
  body: { title: "test" }                       // missing JSON.stringify, missing headers
});

Your exercise — test every method on a real, reliable API
Use https://jsonplaceholder.typicode.com — it's built specifically for practicing this and never goes down. Run each of these in your console one at a time, reading the output carefully each time:
javascript// 1. GET — read a list
async function testGet() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos");
  const data = await response.json();
  console.log("GET result:", data[0]);
}
testGet();

// 2. POST — create something
async function testPost() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "Learn fetch", completed: false, userId: 1 })
  });
  const data = await response.json();
  console.log("POST result:", data);
  console.log("Status:", response.status);  // should be 201
}
testPost();

// 3. PATCH — update something
async function testPatch() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed: true })
  });
  const data = await response.json();
  console.log("PATCH result:", data);
}
testPatch();

// 4. DELETE — remove something
async function testDelete() {
  const response = await fetch("https://jsonplaceholder.typicode.com/todos/1", {
    method: "DELETE"
  });
  console.log("DELETE status:", response.status);  // should be 200
}
testDelete();