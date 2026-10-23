let shopping_basket = JSON.parse(localStorage.getItem("shopping_basket")) || [
  {
    id: 1,
    name: "🥛 Milch",
    quantity: "1 Liter",
    category: "groceries",
    bought: false,
  },
  {
    id: 2,
    name: "🥚 Eier",
    quantity: "10 Stück",
    category: "groceries",
    bought: false,
  },
  {
    id: 3,
    name: "🧴 Glasreiniger",
    quantity: "1 Flasche",
    category: "household",
    bought: false,
  },
  {
    id: 4,
    name: "🍎 Äpfel",
    quantity: "1 kg",
    category: "groceries",
    bought: false,
  },
  {
    id: 5,
    name: "🪥 Zahnbürste",
    quantity: "1 Stück",
    category: "personal-care",
    bought: false,
  },
  {
    id: 6,
    name: "🍅 Tomaten",
    quantity: "500 g",
    category: "groceries",
    bought: false,
  },
  {
    id: 7,
    name: "🥑 Avocados",
    quantity: "2 Stück",
    category: "groceries",
    bought: false,
  },
  {
    id: 8,
    name: "🍚 Reis",
    quantity: "1 Packung",
    category: "groceries",
    bought: false,
  },
];

const category_names = {
  groceries: "Lebensmittel",
  household: "Putzmittel",
  "personal-care": "Drogerieartikel",
};

function category_value(category) {
  if (category === "Lebensmittel") return "groceries";
  if (category === "Putzmittel") return "household";
  if (category === "Drogerieartikel") return "personal-care";

  return category;
}

shopping_basket.forEach((item) => {
  item.category = category_value(item.category);
});

const shopping_items = document.querySelector("#shopping-items");
const add_form = document.querySelector("#add-form");
const item_name = document.querySelector("#item-name");
const item_quantity = document.querySelector("#item-quantity");
const item_category = document.querySelector("#item-category");

const filter_buttons = document.querySelectorAll(".shopping-card .filter-btn");

let active_filter = "all";

function save_to_localStorage() {
  localStorage.setItem("shopping_basket", JSON.stringify(shopping_basket));
}

save_to_localStorage();

function show_shopping() {
  const items =
    active_filter === "all"
      ? shopping_basket
      : shopping_basket.filter((item) => item.category === active_filter);

  shopping_card(items);
}

function shopping_card(items) {
  shopping_items.innerHTML = "";

  document
    .querySelector("#empty-message")
    .classList.toggle("hidden", shopping_basket.length > 0);

  items.forEach((item) => {
    const card_item = document.createElement("li");
    card_item.classList.add("shopping-item");
    card_item.classList.toggle("is-bought", item.bought);

    const input_card = document.createElement("input");
    input_card.type = "checkbox";
    input_card.classList.add("product-check");
    input_card.checked = item.bought;

    input_card.setAttribute("aria-label", `${item.name} als gekauft markieren`);

    const title = document.createElement("h2");
    title.classList.add("product-name");
    title.textContent = item.name;

    const quantity = document.createElement("p");
    quantity.classList.add("product-quantity");
    quantity.textContent = item.quantity;

    const category = document.createElement("p");
    category.classList.add("product-category");
    category.textContent = category_names[item.category] || item.category;

    const btn_delete = document.createElement("button");
    btn_delete.type = "button";
    btn_delete.textContent = "🗑️";
    btn_delete.classList.add("delete-btn");
    btn_delete.setAttribute("aria-label", "Löschen");

    const btn_edit = document.createElement("button");
    btn_edit.type = "button";
    btn_edit.textContent = "🖊️";
    btn_edit.classList.add("delete-btn", "edit-btn");
    btn_edit.setAttribute("aria-label", "Bearbeiten");

    const product_info = document.createElement("div");
    product_info.classList.add("product-info");

    product_info.append(title, quantity, category, btn_delete, btn_edit);

    card_item.append(input_card, product_info);
    shopping_items.append(card_item);

    input_card.addEventListener("change", () => {
      item.bought = input_card.checked;

      shopping_basket.sort((a, b) => Number(a.bought) - Number(b.bought));

      save_to_localStorage();
      show_shopping();
    });

    btn_delete.addEventListener("click", () => {
      shopping_basket = shopping_basket.filter(
        (product) => product.id !== item.id,
      );

      save_to_localStorage();
      show_shopping();
    });

    btn_edit.addEventListener("click", () => {
      btn_edit.disabled = true;

      const input = document.createElement("input");
      input.type = "text";
      input.value = item.quantity;
      input.maxLength = 40;
      input.classList.add("edit-quantity-input");
      input.setAttribute("aria-label", "Menge");

      quantity.replaceWith(input);

      const btn_save = document.createElement("button");
      btn_save.type = "button";
      btn_save.textContent = "✓";
      btn_save.classList.add("save-btn");
      btn_save.setAttribute("aria-label", "Speichern");

      input.after(btn_save);
      input.focus();
      input.select();

      function save_quantity() {
        const new_quantity = input.value.trim();

        if (!new_quantity) {
          input.focus();
          return;
        }

        item.quantity = new_quantity;

        save_to_localStorage();
        show_shopping();
      }

      btn_save.addEventListener("click", save_quantity);

      input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          save_quantity();
        }

        if (event.key === "Escape") {
          show_shopping();
        }
      });
    });
  });

  update_progress();
}

function update_progress() {
  const total_items = shopping_basket.length;

  const bought_items = shopping_basket.filter((item) => item.bought).length;

  const progress =
    total_items === 0 ? 0 : Math.round((bought_items / total_items) * 100);

  document.querySelector("#progress-fill").style.width = `${progress}%`;

  document
    .querySelector("#progress-track")
    .setAttribute("aria-valuenow", progress);

  document.querySelector("#progress-label").textContent = `${progress}%`;

  document.querySelector("#progress-summary").textContent =
    `${bought_items} von ${total_items} Artikeln erledigt`;

  document.querySelector("#item-count").textContent =
    `${total_items - bought_items} Artikel noch zu kaufen`;
}

filter_buttons.forEach((button) => {
  button.addEventListener("click", () => {
    active_filter = category_value(button.dataset.filter);

    filter_buttons.forEach((btn) => {
      const active = btn === button;

      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", String(active));
    });

    show_shopping();
  });
});

document.querySelector("#open-add").addEventListener("click", () => {
  add_form.classList.toggle("hidden");
});

function product_details(name) {
  if (name.includes("kartoffel")) {
    return ["🥔", "Kartoffeln", "1 kg"];
  }

  if (name.includes("joghurt")) {
    return ["🥛", "Joghurt", "1 Liter"];
  }

  if (name.includes("glasreiniger")) {
    return ["🧽", "Glasreiniger", "1 Flasche"];
  }

  if (name.includes("shampoo")) {
    return ["🧴", "Shampoo", "1 Flasche"];
  }

  if (name.includes("seife")) {
    return ["🧼", "Seife", "1 Stück"];
  }

  if (name.includes("saft")) {
    return ["🧃", "Saft", "1 Flasche"];
  }

  if (name.includes("coca-cola") || name.includes("cola")) {
    return ["🥤", "Coca-Cola", "1 Flasche"];
  }

  if (name.includes("creme")) {
    return ["🧴", "Creme", "1 Stück"];
  }

  return ["🛒", item_name.value.trim(), "1 Stück"];
}

item_name.addEventListener("input", () => {
  item_quantity.value = product_details(item_name.value.toLowerCase())[2];
});

add_form.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!add_form.reportValidity() || !item_name.value.trim()) {
    return;
  }

  const [emoji, name] = product_details(item_name.value.trim().toLowerCase());

  shopping_basket.push({
    id: Date.now(),
    name: `${emoji} ${name}`,
    quantity: item_quantity.value.trim() || "1 Stück",
    category: category_value(item_category.value),
    bought: false,
  });

  save_to_localStorage();
  show_shopping();

  add_form.reset();
  add_form.classList.add("hidden");
});

show_shopping();
