console.log("Hello");

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

function save_to_localStorage() {
  localStorage.setItem("shopping_basket", JSON.stringify(shopping_basket));
}

const shopping_items = document.querySelector("#shopping-items");

function shopping_card(items) {
  shopping_items.innerHTML = "";

  items.forEach((item) => {
    const card_item = document.createElement("li");
    card_item.classList.add("shopping-item");
    card_item.classList.toggle("is-bought", item.bought);

    const input_card = document.createElement("input");
    input_card.type = "checkbox";
    input_card.classList.add("product-check");
    input_card.checked = item.bought;
    input_card.setAttribute("aria-label", `Mark ${item.name} as bought`);

    const title = document.createElement("h2");
    title.classList.add("product-name");
    title.innerText = item.name;

    const btn_delete = document.createElement("button");
    btn_delete.innerText = "🗑️";
    btn_delete.classList.add("delete-btn");
    btn_delete.setAttribute("aria-label", "Löschen");

    const btn_edit = document.createElement("button");
    btn_edit.innerText = "🖊️";
    btn_edit.classList.add("delete-btn");
    btn_edit.setAttribute("aria-label", "Bearbeiten");
    btn_edit.classList.add("edit-btn");

    const quantity = document.createElement("p");
    quantity.classList.add("product-quantity");
    quantity.innerText = item.quantity;

    btn_edit.addEventListener("click", () => {
      const input = document.createElement("input");
      input.value = item.quantity;
      input.classList.add("edit-quantity-input");

      quantity.replaceWith(input);
      input.focus();

      const btn_save = document.createElement("button");
      btn_save.innerText = "✓";
      btn_save.classList.add("save-btn");
      btn_save.setAttribute("aria-label", "Speichern");

      input.after(btn_save);

      btn_save.addEventListener("click", () => {
        if (input.value.trim() !== "") {
          item.quantity = input.value.trim();
        }
        save_to_localStorage();
        shopping_card(shopping_basket);
      });
    });

    const category = document.createElement("p");
    category.classList.add("product-category");
    category.innerText = item.category;

    const product_info = document.createElement("div");
    product_info.classList.add("product-info");

    shopping_items.appendChild(card_item);
    card_item.appendChild(input_card);
    card_item.appendChild(product_info);

    product_info.appendChild(title);
    product_info.appendChild(quantity);
    product_info.appendChild(category);
    product_info.appendChild(btn_delete);
    product_info.appendChild(btn_edit);

    input_card.addEventListener("change", () => {
      item.bought = input_card.checked;

      save_to_localStorage();

      shopping_basket.sort((a, b) => {
        return Number(a.bought) - Number(b.bought);
      });

      shopping_card(items);
    });

    btn_delete.addEventListener("click", () => {
      shopping_basket = shopping_basket.filter((product) => {
        return product.id !== item.id;
      });

      save_to_localStorage();

      shopping_card(shopping_basket);
    });
  });
  update_progress();
}

function update_progress() {
  const total_items = shopping_basket.length;

  const bought_items = shopping_basket.filter((item) => item.bought).length;

  const progress =
    total_items === 0 ? 0 : Math.round((bought_items / total_items) * 100);

  const progress_bar = document.querySelector("#progress-track");
  const progress_fill = document.querySelector("#progress-fill");

  if (progress_bar && progress_fill) {
    progress_fill.style.width = `${progress}%`;
    progress_bar.setAttribute("aria-valuenow", progress);
  }
  const progress_label = document.querySelector("#progress-label");
  if (progress_label) {
    progress_label.innerText = `${progress}%`;
  }

  const progress_summary = document.querySelector("#progress-summary");
  if (progress_summary) {
    progress_summary.innerText = `${bought_items} von ${total_items} Artikeln erledigt`;
  }

  const item_count = document.querySelector("#item-count");
  if (item_count) {
    item_count.innerText = `${total_items - bought_items} Artikel noch zu kaufen`;
  }
}

shopping_card(shopping_basket);

const groceries_btn = document.querySelector(".groceries-btn");
const household_btn = document.querySelector(".household-btn");
const care_btn = document.querySelector(".care-btn");

household_btn.addEventListener("click", () => {
  const filtered_household = shopping_basket.filter((item) => {
    return item.category === "household";
  });

  shopping_card(filtered_household);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  household_btn.classList.add("active");
});

groceries_btn.addEventListener("click", () => {
  const filtered_groceries = shopping_basket.filter((item) => {
    return item.category === "groceries";
  });

  shopping_card(filtered_groceries);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  groceries_btn.classList.add("active");
});

care_btn.addEventListener("click", () => {
  const filtered_care = shopping_basket.filter((item) => {
    return item.category === "personal-care";
  });

  shopping_card(filtered_care);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  care_btn.classList.add("active");
});

const all_btn = document.querySelector(".all-btn");

all_btn.addEventListener("click", () => {
  shopping_card(shopping_basket);

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  all_btn.classList.add("active");
});

const open_add_btn = document.querySelector("#open-add");
const add_form = document.querySelector("#add-form");
const item_name = document.querySelector("#item-name");

item_name.addEventListener("input", () => {
  const name = item_name.value.toLowerCase();

  if (name.includes("kartoffel")) {
    item_quantity.value = "1 kg";
  } else if (name.includes("joghurt")) {
    item_quantity.value = "1 Liter";
  } else if (name.includes("glasreiniger") || name.includes("shampoo")) {
    item_quantity.value = "1 Flasche";
  } else if (name.includes("seife")) {
    item_quantity.value = "1 Stück";
  } else if (
    name.includes("saft") ||
    name.includes("coca-cola") ||
    name.includes("cola")
  ) {
    item_quantity.value = "1 Flasche";
  } else if (name.includes("creme")) {
    item_quantity.value = "1 Stück";
  } else {
    item_quantity.value = "1 Stück";
  }
});

const item_quantity = document.querySelector("#item-quantity");
const item_category = document.querySelector("#item-category");

open_add_btn.addEventListener("click", () => {
  add_form.classList.toggle("hidden");
});

add_form.addEventListener("submit", (event) => {
  event.preventDefault();

  const product_name = item_name.value.trim().toLowerCase();

  let emoji = "🛒";
  let todo_name = item_name.value.trim();
  let quantity = item_quantity.value;

  if (product_name.includes("kartoffel")) {
    emoji = "🥔";
    todo_name = "Kartoffeln";
    quantity = "1 kg";
  } else if (product_name.includes("joghurt")) {
    emoji = "🥛";
    todo_name = "Joghurt";
    quantity = "1 Liter";
  } else if (product_name.includes("glasreiniger")) {
    emoji = "🧽";
    todo_name = "Glasreiniger";
    quantity = "1 Flasche";
  } else if (product_name.includes("shampoo")) {
    emoji = "🧴";
    todo_name = "Shampoo";
    quantity = "1 Flasche";
  } else if (product_name.includes("seife")) {
    emoji = "🧼";
    todo_name = "Seife";
    quantity = "1 Stück";
  } else if (product_name.includes("saft")) {
    emoji = "🧃";
    todo_name = "Saft";
    quantity = "1 Flasche";
  } else if (
    product_name.includes("coca-cola") ||
    product_name.includes("cola")
  ) {
    emoji = "🥤";
    todo_name = "Coca-Cola";
    quantity = "1 Flasche";
  } else if (product_name.includes("creme")) {
    emoji = "🧴";
    todo_name = "Creme";
    quantity = "1 Stück";
  }

  const new_item = {
    id: Date.now(),
    name: `${emoji} ${todo_name}`,
    quantity: quantity,
    category: item_category.value,
    bought: false,
  };

  shopping_basket.push(new_item);
  save_to_localStorage();

  shopping_card(shopping_basket);

  add_form.reset();
  add_form.classList.add("hidden");
});
