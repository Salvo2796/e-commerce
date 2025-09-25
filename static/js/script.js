let products = [];  // variabile globale

// FETCH DATI
fetch("products.json")
  .then(response => response.json())
  .then(data => {
    products = data;  // salva globalmente
    renderCategories(products);
    renderProducts(products);
    aggiornaCarrelloUI();
  })
  .catch(err => console.error("Errore nel caricamento JSON:", err));

// ====== FUNZIONI LOCALSTORAGE ======
function loadCart() {
  return JSON.parse(localStorage.getItem("carrello")) || [];
}

function saveCart(cart) {
  localStorage.setItem("carrello", JSON.stringify(cart));
}

function loadFavs() {
  return JSON.parse(localStorage.getItem("favoriti")) || [];
}

function saveFavs(favs) {
  localStorage.setItem("favoriti", JSON.stringify(favs));
}

// ====== VARIABILI GLOBALI ======
let carrello = loadCart();
let preferiti = loadFavs();

// ====== RENDER CATEGORIE ======
function renderCategories(products) {
  const categories = [...new Set(products.map(p => p.category))];
  const form = document.getElementById("categories-form");
  form.innerHTML = "";

  // "Tutti"
  const allInput = document.createElement("input");
  allInput.type = "radio";
  allInput.name = "category";
  allInput.id = "cat-all";
  allInput.value = "all";
  allInput.checked = true;

  const allLabel = document.createElement("label");
  allLabel.htmlFor = "cat-all";
  allLabel.textContent = "Tutti";

  form.appendChild(allInput);
  form.appendChild(allLabel);
  form.appendChild(document.createElement("br"));

  allInput.addEventListener("change", () => renderProducts(products));

  // Categorie
  categories.forEach((cat, i) => {
    const id = `cat-${i}`;

    const input = document.createElement("input");
    input.type = "radio";
    input.name = "category";
    input.id = id;
    input.value = cat;

    const label = document.createElement("label");
    label.htmlFor = id;
    label.textContent = cat;

    form.appendChild(input);
    form.appendChild(label);
    form.appendChild(document.createElement("br"));

    input.addEventListener("change", () => {
      const filtered = products.filter(p => p.category === cat);
      renderProducts(filtered);
    });
  });
}

// ====== BARRA DI RICERCA PER TITOLO ======
const searchInput = document.getElementById("search");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  let filtered = products.filter(p => p.title.toLowerCase().includes(query));

  renderProducts(filtered);
});


// ====== RENDER PRODOTTI ======
function renderProducts(products) {
  const container = document.getElementById("prodotti");
  container.innerHTML = "";

  products.forEach((p) => {
    const div = document.createElement("div");
    div.className = "prodotto";

    const title = document.createElement("h2");
    title.textContent = p.title;

    const imgMain = document.createElement("img");
    imgMain.src = p.images[0] || "";
    imgMain.alt = p.title;

    const price = document.createElement("p");
    price.textContent = `${p.price} €`;

    const rating = document.createElement("p");
    rating.textContent = `Rating: ${p.rating}`;

    // DETTAGLI
    const divDetails = document.createElement("div");
    divDetails.className = "prodotto-dettagli";
    divDetails.style.display = "none";

    const description = document.createElement("p");
    description.textContent = p.description;
    divDetails.appendChild(description);

    // immagini extra con slider
    if (p.images.length > 1) {
      let currentIndex = 1;
      const imgExtra = document.createElement("img");
      imgExtra.src = p.images[currentIndex];
      imgExtra.alt = p.title;
      divDetails.appendChild(imgExtra);

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "Prev";
      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next";

      prevBtn.addEventListener("click", () => {
        currentIndex--;
        if (currentIndex < 1) currentIndex = p.images.length - 1;
        imgExtra.src = p.images[currentIndex];
      });

      nextBtn.addEventListener("click", () => {
        currentIndex++;
        if (currentIndex >= p.images.length) currentIndex = 1;
        imgExtra.src = p.images[currentIndex];
      });

      divDetails.appendChild(prevBtn);
      divDetails.appendChild(nextBtn);
    }

    // Bottone dettagli
    const btnDettagli = document.createElement("button");
    btnDettagli.textContent = "Dettagli";
    btnDettagli.addEventListener("click", () => {
      divDetails.style.display =
        divDetails.style.display === "none" ? "block" : "none";
    });

    // Bottone preferiti
    const btnFav = document.createElement("button");
    btnFav.textContent = preferiti.some(f => f.title === p.title) ? "❤️" : "🤍";
    btnFav.addEventListener("click", () => {
      if (preferiti.some(f => f.title === p.title)) {  //se il prodotto è gia tra i preferiti (true)
        preferiti = preferiti.filter(f => f.title !== p.title); //lo escludo
        btnFav.textContent = "🤍";
      } else {
        preferiti.push({ title: p.title, price: p.price }); //se non è tra i preferiti lo inserisco (false)
        btnFav.textContent = "❤️";
      }
      saveFavs(preferiti);
    });

    // Bottone carrello
    const btnCarrello = document.createElement("button");
    btnCarrello.textContent = "Aggiungi al carrello";
    btnCarrello.addEventListener("click", () => {
      const exists = carrello.find(item => item.title === p.title);
      if (exists) {
        exists.qty++;
      } else {
        carrello.push({ title: p.title, price: p.price, qty: 1 });
      }
      saveCart(carrello);
      aggiornaCarrelloUI();
    });

    div.appendChild(title);
    div.appendChild(imgMain);
    div.appendChild(price);
    div.appendChild(rating);
    div.appendChild(btnDettagli);
    div.appendChild(divDetails);
    div.appendChild(btnFav);
    div.appendChild(btnCarrello);

    container.appendChild(div);
  });
}

// ====== RENDER CARRELLO ======
function aggiornaCarrelloUI() {
  const ul = document.getElementById("lista-carrello");
  ul.innerHTML = "";

  carrello.forEach(item => {
    const li = document.createElement("li");
    li.dataset.title = item.title;
    li.dataset.price = item.price;
    li.textContent = `${item.title} - ${item.price} €`;

    const counter = document.createElement("input");
    counter.type = "number";
    counter.value = item.qty;
    counter.min = 1;

    counter.addEventListener("input", () => {
      item.qty = parseInt(counter.value);
      saveCart(carrello);
      aggiornaTotale();
    });

    const btnRemove = document.createElement("button");
    btnRemove.textContent = "Rimuovi";
    btnRemove.addEventListener("click", () => {
      carrello = carrello.filter(p => p.title !== item.title);
      saveCart(carrello);
      aggiornaCarrelloUI();
    });

    li.appendChild(counter);
    li.appendChild(btnRemove);
    ul.appendChild(li);
  });

  aggiornaTotale();
}

function aggiornaTotale() {
  const totalEl = document.getElementById("carrello-totale");
  const totale = carrello.reduce((sum, p) => sum + p.price * p.qty, 0);
  totalEl.textContent = `Totale: ${totale.toFixed(2)} €`;
}

// ====== VALIDAZIONE PAGAMENTO ======
const form = document.getElementById("payment-form");
const errorMsg = document.getElementById("error-msg");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const card = document.getElementById("card").value.trim();
  const cvv = document.getElementById("cvv").value.trim();

  errorMsg.textContent = "";

  if (nome.length < 3) {
    errorMsg.textContent = "Il nome deve contenere almeno 3 caratteri.";
    return;
  }
  if (!/^\d{16}$/.test(card)) {
    errorMsg.textContent = "Il numero della carta deve contenere esattamente 16 cifre.";
    return;
  }
  if (!/^\d{3}$/.test(cvv)) {
    errorMsg.textContent = "Il CVV deve contenere esattamente 3 cifre.";
    return;
  }

  alert("Pagamento effettuato con successo!");
  form.reset();
  localStorage.removeItem(CART_KEY); // svuota carrello dopo pagamento
  carrello = [];
  aggiornaCarrelloUI();
});

