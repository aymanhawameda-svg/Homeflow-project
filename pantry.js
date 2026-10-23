const produkte = JSON.parse(localStorage.getItem("produkte")) || [
  {
    name: "Mangoeis",
    image: "images/mango eis.jpg",
    restlaufzeit: 120,
    menge: "1 Liter",
    kategorie: "Gefrierfach",
    badgeClass: "badge-outline badge-success",
  },
  {
    name: "Eier",
    image: "images/eier.jpg",
    restlaufzeit: 15,
    menge: "10 Stück",
    kategorie: "Kühlschrank",
    badgeClass: "badge-outline",
  },
  {
    name: "Tomaten",
    image: "images/tomaten.jpg",
    restlaufzeit: 4,
    menge: "1 kg",
    kategorie: "Kühlschrank",
    badgeClass: "badge-outline badge-warning",
  },
  {
    name: "Salat",
    image: "images/salat.jpg",
    restlaufzeit: 2,
    menge: "1 Stück",
    kategorie: "Kühlschrank",
    badgeClass: "badge-outline badge-warning",
  },
  {
    name: "Käse",
    image: "images/käse.jpg",
    restlaufzeit: 14,
    menge: "250 g",
    kategorie: "Kühlschrank",
    badgeClass: "badge-outline",
  },
  {
    name: "Orangen",
    image: "images/orangen.jpg",
    restlaufzeit: 10,
    menge: "1 kg",
    kategorie: "Kühlschrank",
    badgeClass: "badge-outline",
  },
  {
    name: "Nudeln",
    image: "images/nudelln.jpg",
    restlaufzeit: 365,
    menge: "500 g",
    kategorie: "Vorrat",
    badgeClass: "badge-outline",
  },
  {
    name: "Reis",
    image: "images/rice.jpg",
    restlaufzeit: 365,
    menge: "1 kg",
    kategorie: "Vorrat",
    badgeClass: "badge-outline",
  },
  {
    name: "Milch",
    image: "images/milch.jpg",
    restlaufzeit: 5,
    menge: "1 Liter",
    kategorie: "Kühlschrank",
    badgeClass: "badge-outline",
  },
  {
    name: "Walnüsse",
    image: "images/walnüsse.jpg",
    restlaufzeit: 90,
    menge: "500 g",
    kategorie: "Vorrat",
    badgeClass: "badge-outline",
  },
  {
    name: "Pizza",
    image: "images/pizza.jpg",
    restlaufzeit: 60,
    menge: "1 Stück",
    kategorie: "Gefrierfach",
    badgeClass: "badge-outline",
  },
];


const container = document.querySelector("#produkteContainer");
const open_add = document.querySelector("#open-add");
const produkt_form = document.querySelector("#produktForm");

const produktNameInput = document.querySelector("#produktName");
const produktMengeInput = document.querySelector("#produktMenge");
const produktKategorieInput = document.querySelector("#produktKategorie");

const kalender = document.querySelector("#calendar");
const kalenderButton = document.querySelector("#cally1");
const datumInput = document.querySelector("#produktDatum");

const filterButtons = document.querySelectorAll(".pantry-filter");

let aktiveKategorie = "Alle";


function speichereProdukte() {
  localStorage.setItem("produkte", JSON.stringify(produkte));
}


function berechneRestlaufzeit(datum) {
  if (!datum) return null;

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const ablaufdatum = new Date(datum + "T00:00:00");
  ablaufdatum.setHours(0, 0, 0, 0);

  return Math.round((ablaufdatum - heute) / 86400000);
}

function resttage(produkt) {
  if (produkt.ablaufdatum) {
    return berechneRestlaufzeit(produkt.ablaufdatum);
  }

  return produkt.restlaufzeit;
}


function zeigeProdukte() {
  const liste =
    aktiveKategorie === "Alle"
      ? [...produkte]
      : produkte.filter((produkt) => produkt.kategorie === aktiveKategorie);

  liste.sort((a, b) => resttage(a) - resttage(b));

  container.innerHTML = "";

  liste.forEach((produkt) => {
    const restlaufzeit = resttage(produkt);

    const restlaufzeitText =
      restlaufzeit < 0
        ? "Abgelaufen"
        : `${restlaufzeit} ${restlaufzeit === 1 ? "Tag" : "Tage"}`;

    const karte = document.createElement("article");
    karte.className = "card bg-base-100 shadow-md border border-base-200";

    karte.innerHTML = `
      <figure class="px-3 pt-3">
        <img class="h-30 w-full object-contain rounded-xl" />
      </figure>

      <div class="card-body p-4 gap-2">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <h2 class="card-title text-base"></h2>

          <span class="badge badge-outline restlaufzeit-badge"></span>
        </div>

        <div class="produkt-actions">
          <span class="badge badge-outline menge-badge"></span>

          <div class="produkt-buttons">
            <button
              type="button"
              class="btn btn-ghost btn-xs edit-menge-btn"
              aria-label="Menge bearbeiten"
              title="Menge bearbeiten"
            >
              🖊️
            </button>

            <button
              type="button"
              class="btn btn-ghost btn-xs delete-produkt-btn"
              aria-label="Produkt löschen"
              title="Produkt löschen"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    `;

    const bild = karte.querySelector("img");
    const titel = karte.querySelector(".card-title");
    const badge = karte.querySelector(".restlaufzeit-badge");
    const mengeBadge = karte.querySelector(".menge-badge");
    const editButton = karte.querySelector(".edit-menge-btn");
    const deleteButton = karte.querySelector(".delete-produkt-btn");

    titel.textContent = produkt.name;
    mengeBadge.textContent = `Menge: ${produkt.menge}`;
    badge.textContent = restlaufzeitText;

    bild.alt = produkt.name;

    if (produkt.image) {
      bild.src = produkt.image;
    } else {
      bild.hidden = true;
    }

    if (restlaufzeit <= 2) {
      badge.classList.add("danger");
    } else if (restlaufzeit <= 6) {
      badge.classList.add("warning");
    } else {
      badge.classList.add("ok");
    }

    container.appendChild(karte);

    
    editButton.addEventListener("click", () => {
      editButton.disabled = true;

      const input = document.createElement("input");
      input.type = "text";
      input.value = produkt.menge;
      input.maxLength = 40;
      input.className = "input input-bordered input-sm";
      input.style.width = "110px";
      input.style.minWidth = "0";
      input.style.backgroundColor = "#ffffff";
      input.style.color = "#222222";
      input.style.border = "1px solid #999999";
      input.setAttribute("aria-label", "Menge");

      mengeBadge.replaceWith(input);

      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.textContent = "✓";
      saveButton.className = "btn btn-success btn-xs";
      saveButton.setAttribute("aria-label", "Speichern");

      input.after(saveButton);
      input.focus();
      input.select();

      function speichern() {
        const neueMenge = input.value.trim();

        if (!neueMenge) {
          input.focus();
          return;
        }

        produkt.menge = neueMenge;

        speichereProdukte();
        zeigeProdukte();
      }

      saveButton.addEventListener("click", speichern);

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          speichern();
        }

        if (event.key === "Escape") {
          zeigeProdukte();
        }
      });
    });

    
    deleteButton.addEventListener("click", () => {
      const index = produkte.indexOf(produkt);

      if (index !== -1) {
        produkte.splice(index, 1);
      }

      speichereProdukte();
      zeigeProdukte();
    });
  });
}


open_add.addEventListener("click", () => {
  produkt_form.classList.toggle("hidden");
});


if (kalender && kalenderButton && datumInput) {
  kalender.addEventListener("change", () => {
    if (!kalender.value) return;

    datumInput.value = kalender.value;
    kalenderButton.textContent = kalender.value;
  });
}


function produktDetails(name) {
  if (name.includes("walnüsse") || name.includes("walnuss")) {
    return ["500 g", "images/walnüsse.jpg"];
  }

  if (name.includes("pizza")) {
    return ["1 Stück", "images/pizza.jpg"];
  }

  if (name.includes("milch")) {
    return ["1 Liter", "images/milch.jpg"];
  }

  if (name.includes("orange")) {
    return ["1 kg", "images/orangen.jpg"];
  }

  if (name.includes("eier")) {
    return ["10 Stück", "images/eier.jpg"];
  }

  if (name.includes("käse")) {
    return ["250 g", "images/käse.jpg"];
  }

  if (name.includes("nudeln")) {
    return ["500 g", "images/nudelln.jpg"];
  }

  if (name.includes("reis")) {
    return ["1 kg", "images/rice.jpg"];
  }

  if (name.includes("tomaten")) {
    return ["1 kg", "images/tomaten.jpg"];
  }

  if (name.includes("salat")) {
    return ["1 Stück", "images/salat.jpg"];
  }

  if (name.includes("mangoeis")) {
    return ["1 Liter", "images/mango eis.jpg"];
  }

  return ["1 Stück", ""];
}

produktNameInput.addEventListener("input", () => {
  const name = produktNameInput.value.toLowerCase();

  produktMengeInput.value = produktDetails(name)[0];
});


function produktHinzufuegen() {
  const name = produktNameInput.value.trim();
  const menge = produktMengeInput.value.trim();
  const datum = datumInput.value;
  const kategorie = produktKategorieInput.value;

  if (!name || !menge) {
    alert("Bitte Name und Menge eingeben!");
    return;
  }

  if (!kategorie) {
    alert("Bitte Kategorie auswählen!");
    return;
  }

  if (!datum) {
    alert("Bitte Ablaufdatum auswählen!");
    return;
  }

  produkte.push({
    name: name,
    image: produktDetails(name.toLowerCase())[1],
    ablaufdatum: datum,
    restlaufzeit: berechneRestlaufzeit(datum),
    menge: menge,
    badgeClass: "badge-outline",
    kategorie: kategorie,
  });

  speichereProdukte();
  zeigeProdukte();

  produkt_form.reset();
  datumInput.value = "";

  if (kalender) {
    kalender.value = "";
  }

  kalenderButton.textContent = "Ablaufdatum";
  produkt_form.classList.add("hidden");
}

document
  .querySelector("#produktHinzufuegen")
  .addEventListener("click", produktHinzufuegen);

produkt_form.addEventListener("submit", (event) => {
  event.preventDefault();
  produktHinzufuegen();
});


filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => {
      btn.classList.toggle("active", btn === button);
    });

    aktiveKategorie = button.textContent.trim();

    zeigeProdukte();
  });
});


speichereProdukte();
zeigeProdukte();
