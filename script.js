document.addEventListener("DOMContentLoaded", () => {

    const tg = window.Telegram.WebApp;
    tg.expand();

    let cards = JSON.parse(localStorage.getItem("cards") || "[]");

    function saveCards() {
        localStorage.setItem("cards", JSON.stringify(cards));
    }

    function renderCards() {
        const cardList = document.getElementById("card-list");
        cardList.innerHTML = "";

        if (cards.length === 0) {
            cardList.innerHTML = "<p>Пока нет карточек.</p>";
            return;
        }

        cards.forEach((card) => {
            const div = document.createElement("div");
            div.className = "card";
            div.innerHTML = `<b>${card.front}</b><br>${card.back}`;
            cardList.appendChild(div);
        });
    }

    renderCards();

    // === МОДАЛЬНОЕ ОКНО ===
    const modal = document.getElementById("modal");
    const addCardBtn = document.getElementById("add-card-btn");
    const saveBtn = document.getElementById("save-btn");
    const closeBtn = document.getElementById("close-modal");

    addCardBtn.onclick = () => {
        modal.style.display = "block";
    };

    closeBtn.onclick = () => {
        modal.style.display = "none";
    };
    saveBtn.onclick = () => {
        const front = document.getElementById("front-input").value.trim();
        const back = document.getElementById("back-input").value.trim();

        if (!front || !back) {
            alert("Заполните оба поля");
            return;
        }

        cards.push({ front, back });
        saveCards();
        renderCards();

        modal.style.display = "none";
    };

    // === ТРЕНИРОВКА ===
    document.getElementById("train-btn").onclick = () => {
        if (cards.length === 0) {
            alert("Нет карточек!");
            return;
        }

        const card = cards[Math.floor(Math.random() * cards.length)];

        tg.showPopup({
            title: "Тренировка",
            message: Переведи:\n${card.front},
            buttons: [
                { id: "answer", type: "default", text: "Показать ответ" },
                { id: "close", type: "cancel", text: "Закрыть" }
            ]
        }, (id) => {
            if (id === "answer") {
                tg.showAlert(`Ответ: ${card.back}`);
            }
        });
    };

});
