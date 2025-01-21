const COHORT = "2410-FTB-ET-WEB-AM";
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}/events`;

// state
const state = {
  parties: [],
}

// update state with events from API
async function getParties() {
  try {
    const response = await fetch(API_URL);
    const json = await response.json();
    state.parties = json.data;
  } catch (error) {
    console.error(error);
  }
}

// add new party via API and rerender
async function addParty(party) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(party),
    });
    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message);
    }
    state.parties.push(json.data);
    renderParties();
  } catch (error) {
    console.error("Error adding party:", error);
    alert("An error occurred while adding the party. Please try again.");
  }
}

// delete a party and rerender
async function deleteParty(partyId) {
  try {
    const response = await fetch(`${API_URL}/${partyId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Party could not be deleted.');
    }
    state.parties = state.parties.filter((party) => party.id !== partyId);
    renderParties();
  } catch (error) {
    console.log(error);
    alert("Failed to delete party: " + error);
  }
}

// render parties from state
function renderParties() {
  const partyList = document.querySelector("#parties");
  if (!state.parties.length) {
    partyList.innerHTML = "<li>No parties found.</li>";
    return;
  }
  const partyCards = state.parties.map((party) => {
    const formattedDate = new Date(party.date).toLocaleString("en-us", {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const card = document.createElement("li");
    card.innerHTML = `
    <h2>${party.name}</h2>
    <p>${party.description}</p>
    <p>${formattedDate}</p>
    <p>${party.location}</p>
    `;

    // add delete button to cards
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete Party';
    deleteButton.addEventListener('click', () => deleteParty(party.id));
    card.append(deleteButton);
    return card;
  });
  partyList.replaceChildren(...partyCards);
}

// sync state with API and rerender
async function render() {
  console.log("Fetching parties...");
  await getParties();
  console.log("Parties from API:", state.parties);
  renderParties();
}

// initial render
render();

// add party with form data when form is submitted
const form = document.querySelector("form");
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const party = {
    name: form.partyName.value,
    description: form.description.value,
    date: form.date.value ? new Date(form.date.value).toISOString() : null, // convert to ISO format
    location: form.location.value,
  };

  if (!party.name || !party.date || !party.location) {
    alert("Please fill out all required fields.");
    return;
  };

  const newParty = await addParty(party);
  if (newParty) {
    state.parties.push(newParty);
    renderParties();
  }
  // reset input field
  form.reset();
});