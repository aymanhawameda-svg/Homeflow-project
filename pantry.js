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

function speichereProdukte() {
  localStorage.setItem("produkte", JSON.stringify(produkte));
}

speichereProdukte();
const container = document.querySelector("#produkteContainer");

function berechneRestlaufzeit(datum) {
  if (!datum) return null;

  const heute = new Date();
  heute.setHours(0, 0, 0, 0);

  const ablaufdatum = new Date(datum + "T00:00:00");
  ablaufdatum.setHours(0, 0, 0, 0);

  return Math.round((ablaufdatum - heute) / (1000 * 60 * 60 * 24));
}

function zeigeProdukte(liste = produkte) {
  liste.sort(
    (a, b) =>
      (a.ablaufdatum ? berechneRestlaufzeit(a.ablaufdatum) : a.restlaufzeit) -
      (b.ablaufdatum ? berechneRestlaufzeit(b.ablaufdatum) : b.restlaufzeit),
  );
  container.innerHTML = "";

  liste.forEach((produkt) => {
    const restlaufzeit = produkt.ablaufdatum
      ? berechneRestlaufzeit(produkt.ablaufdatum)
      : produkt.restlaufzeit;

    const restlaufzeitText =
      restlaufzeit < 0 ? "Abgelaufen" : `${restlaufzeit} Tage`;

    const karte = document.createElement("article");

    karte.className = "card bg-base-100 shadow-md border border-base-200";

    karte.innerHTML = `
      <figure class="px-3 pt-3">
        <img
          src="${produkt.image}"
          alt="${produkt.name}"
          class="h-30 w-full object-contain rounded-xl"
        />
      </figure>

      <div class="card-body p-4 gap-2">

      <div class="flex items-center justify-between gap-45">
        <h2 class="card-title text-base">
          ${produkt.name}
        </h2>

        
          <span class="badge badge-outline  restlaufzeit-badge">
            ${restlaufzeitText}
          </span>

          </div>

          <div class="flex flex-wrap gap-4">

          <div class="flex items-center gap-4 flex-wrap">
            <span class="badge ${produkt.badgeClass} menge-badge">
              Menge: ${produkt.menge}
            </span>

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

    container.appendChild(karte);

    const badge = karte.querySelector(".restlaufzeit-badge");

    if (restlaufzeit <= 2) {
      badge.classList.add("danger");
    } else if (restlaufzeit <= 6) {
      badge.classList.add("warning");
    } else {
      badge.classList.add("ok");
    }

    const mengeBadge = karte.querySelector(".menge-badge");
    const editButton = karte.querySelector(".edit-menge-btn");
    const deleteButton = karte.querySelector(".delete-produkt-btn");

    editButton.addEventListener("click", () => {
      const input = document.createElement("input");

      input.type = "text";
      input.value = produkt.menge;
      input.className = "input input-bordered input-sm";
      input.style.width = "110px";
      input.style.backgroundColor = "#ffffff";
      input.style.color = "#222222";
      input.style.border = "1px solid #999999";

      mengeBadge.replaceWith(input);

      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.textContent = "✓";
      saveButton.className = "btn btn-success btn-xs";
      saveButton.setAttribute("aria-label", "Speichern");

      input.after(saveButton);

      input.focus();
      input.select();

      const speichern = () => {
        const neueMenge = input.value.trim();

        if (neueMenge === "") {
          input.focus();
          return;
        }

        produkt.menge = neueMenge;
        speichereProdukte();
        zeigeProdukte();
      };

      saveButton.addEventListener("click", speichern);

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          speichern();
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

zeigeProdukte();

const open_add = document.querySelector("#open-add");
const produkt_form = document.querySelector("#produktForm");

open_add.addEventListener("click", () => {
  produkt_form.classList.toggle("hidden");
});

// Kalender
const kalender = document.querySelector("#calendar");
const kalenderButton = document.querySelector("#cally1");
const datumInput = document.querySelector("#produktDatum");

if (kalender && kalenderButton && datumInput) {
  kalender.addEventListener("change", () => {
    const datum = kalender.value;

    if (!datum) return;

    kalenderButton.textContent = datum;
    kalenderButton.style.color = "#222";
    datumInput.value = datum;
  });
} else {
  console.error("Fehlendes HTML-Element für den Kalender!");
}

const produktNameInput = document.querySelector("#produktName");
const produktMengeInput = document.querySelector("#produktMenge");
const produktKategorieInput = document.querySelector("#produktKategorie");

produktNameInput.addEventListener("input", () => {
  const name = produktNameInput.value.toLowerCase();

  if (name.includes("walnüsse") || name.includes("walnuss")) {
    produktMengeInput.value = "500 g";
  } else if (name.includes("pizza")) {
    produktMengeInput.value = "1 Stück";
  } else if (name.includes("milch")) {
    produktMengeInput.value = "1 Liter";
  } else if (name.includes("orangen") || name.includes("orange")) {
    produktMengeInput.value = "1 kg";
  } else if (name.includes("eier")) {
    produktMengeInput.value = "10 Stück";
  } else if (name.includes("käse")) {
    produktMengeInput.value = "250 g";
  } else if (name.includes("nudeln")) {
    produktMengeInput.value = "500 g";
  } else if (name.includes("reis")) {
    produktMengeInput.value = "1 kg";
  } else if (name.includes("tomaten")) {
    produktMengeInput.value = "1 kg";
  } else if (name.includes("salat")) {
    produktMengeInput.value = "1 Stück";
  } else if (name.includes("mangoeis")) {
    produktMengeInput.value = "1 Liter";
  } else {
    produktMengeInput.value = "1 Stück";
  }
});

document.querySelector("#produktHinzufuegen").addEventListener("click", () => {
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

  const nameKlein = name.toLowerCase();
  let image = "";

  if (nameKlein.includes("walnuss")) {
    image = "images/walnüsse.jpg";
  } else if (nameKlein.includes("pizza")) {
    image = "images/pizza.jpg";
  } else if (nameKlein.includes("milch")) {
    image = "images/milch.jpg";
  } else if (nameKlein.includes("orange")) {
    image = "images/orangen.jpg";
  } else if (nameKlein.includes("eier")) {
    image = "images/eier.jpg";
  } else if (nameKlein.includes("käse")) {
    image = "images/käse.jpg";
  } else if (nameKlein.includes("nudeln")) {
    image = "images/nudelln.jpg";
  } else if (nameKlein.includes("reis")) {
    image = "images/rice.jpg";
  } else if (nameKlein.includes("tomaten")) {
    image = "images/tomaten.jpg";
  } else if (nameKlein.includes("salat")) {
    image = "images/salat.jpg";
  } else if (nameKlein.includes("mangoeis")) {
    image = "images/mango eis.jpg";
  }

  produkte.push({
    name: name,
    image: image,
    ablaufdatum: datum,
    restlaufzeit: berechneRestlaufzeit(datum),
    menge: menge,
    badgeClass: "badge-outline",
    kategorie: kategorie,
  });
  speichereProdukte();

  const aktiverFilter = document.querySelector(".filter-btn.active");
  const kategorieFilter = aktiverFilter
    ? aktiverFilter.textContent.trim()
    : "Alle";

  if (kategorieFilter === "Alle") {
    zeigeProdukte();
  } else {
    zeigeProdukte(
      produkte.filter((produkt) => produkt.kategorie === kategorieFilter),
    );
  }

  produkt_form.reset();
  datumInput.value = "";
  kalender.value = "";
  kalenderButton.textContent = "Ablaufdatum";
  kalenderButton.style.color = "";
  produkt_form.classList.add("hidden");
});

const filterButtons = document.querySelectorAll(".filter-btn");

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const kategorie = button.textContent.trim();

    if (kategorie === "Alle") {
      zeigeProdukte();
    } else {
      const gefilterteProdukte = produkte.filter(
        (produkt) => produkt.kategorie === kategorie,
      );

      zeigeProdukte(gefilterteProdukte);
    }
  });
});
