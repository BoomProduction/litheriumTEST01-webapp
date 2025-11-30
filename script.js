// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();


// ===== ХРАНИЛИЩЕ КАРТОЧЕК =====
let cards = JSON.parse(localStorage.getItem("cards") || "[]");

function saveCards() {
    localStorage.setItem("cards", JSON.stringify(cards));
}

function renderCards() {
    const cardList = document.getElementById("card-list");
    cardList.innerHTML = "";

    if (cards.length === 0) {
        cardList.innerHTML = "<p>Пока нет карточек. Добавь первую!</p>";
        return;
    }

    cards.forEach((card, index) => {
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `<b>${card.front}</b><br>${card.back}`;
        cardList.appendChild(div);
    });
}

renderCards();
