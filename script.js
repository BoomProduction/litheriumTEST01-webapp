// Инициализация Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand();
tg.enableClosingConfirmation();

// Основное состояние приложения
let state = {
    decks: [],
    currentDeckId: null,
    currentSession: null,
    stats: {
        totalLearned: 0,
        learnedToday: 0,
        lastStudyDate: null
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    showScreen('menuScreen');
});

// Управление экранами
function showScreen(screenName) {
    // Скрыть все экраны
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Показать нужный экран
    document.getElementById(screenName).classList.add('active');
    
    // Специальные действия для экранов
    if (screenName === 'decksScreen') {
        renderDecksList();
    } else if (screenName === 'statsScreen') {
        updateStats();
    }
}

// Рендер списка колод
function renderDecksList() {
    const decksList = document.getElementById('decksList');
    decksList.innerHTML = '';

    if (state.decks.length === 0) {
        decksList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--secondary-color);">
                <div style="font-size: 48px; margin-bottom: 16px;">📚</div>
                <p>У вас пока нет колод</p>
                <p style="font-size: 14px; margin-top: 8px;">Создайте первую колоду чтобы начать учить слова</p>
            </div>
        `;
        return;
    }

    state.decks.forEach(deck => {
        const deckElement = document.createElement('div');
        deckElement.className = 'deck-item';
        deckElement.onclick = () => openDeck(deck.id);
        
        deckElement.innerHTML = `
            <div class="deck-info">
                <h3>${deck.name}</h3>
                <p>${deck.description || 'Без описания'}</p>
            </div>
            <div class="deck-stats">
                ${deck.cards.length} карточек
            </div>
        `;
        
        decksList.appendChild(deckElement);
    });
}

// Открытие колоды
function openDeck(deckId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck) return;

    state.currentDeckId = deckId;
    document.getElementById('deckTitle').textContent = deck.name;
    renderCardsList();
    showScreen('cardsScreen');
}

// Рендер списка карточек
function renderCardsList() {
    const cardsList = document.getElementById('cardsList');
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    
    if (!deck) return;
    
    cardsList.innerHTML = '';

    if (deck.cards.length === 0) {
        cardsList.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--secondary-color);">
                <div style="font-size: 48px; margin-bottom: 16px;">🃏</div>
                <p>В этой колоде пока нет карточек</p>
                <p style="font-size: 14px; margin-top: 8px;">Добавьте первую карточку чтобы начать обучение</p>
            </div>
        `;
        return;
    }

    deck.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        
        cardElement.innerHTML = `
            <div class="card-content">
                <div class="front">${card.front}</div>
                <div class="back">${card.back}</div>
            </div>
        `;
        
        cardsList.appendChild(cardElement);
    });
}

// Управление колодами
function showAddDeckForm() {
    document.getElementById('addDeckForm').classList.remove('hidden');
    document.getElementById('newDeckName').focus();
}

function hideAddDeckForm() {
    document.getElementById('addDeckForm').classList.add('hidden');
    document.getElementById('newDeckName').value = '';
    document.getElementById('newDeckDescription').value = '';
}

function createNewDeck() {
    const name = document.getElementById('newDeckName').value.trim();
    const description = document.getElementById('newDeckDescription').value.trim();
    
    if (!name) {
        alert('Введите название колоды');
        return;
    }
    
    const newDeck = {
        id: Date.now().toString(),
        name: name,
        description: description,
        cards: [],
        createdAt: new Date().toISOString()
    };
    
    state.decks.push(newDeck);
    saveData();
    hideAddDeckForm();
    renderDecksList();
}

// Управление карточками
function showAddCardForm() {
    document.getElementById('addCardForm').classList.remove('hidden');
    document.getElementById('newCardFront').focus();
}

function hideAddCardForm() {
    document.getElementById('addCardForm').classList.add('hidden');
    document.getElementById('newCardFront').value = '';
    document.getElementById('newCardBack').value = '';
}

function createNewCard() {
    const front = document.getElementById('newCardFront').value.trim();
    const back = document.getElementById('newCardBack').value.trim();
    
    if (!front || !back) {
        alert('Заполните обе стороны карточки');
        return;
    }
    
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    if (!deck) return;
    
    const newCard = {
        id: Date.now().toString(),
        front: front,
        back: back,
        createdAt: new Date().toISOString(),
        known: false
    };
    
    deck.cards.push(newCard);
    saveData();
    hideAddCardForm();
    renderCardsList();
}

// Обучение
function startLearning() {
    // Находим первую непустую колоду
    const deckWithCards = state.decks.find(deck => deck.cards.length > 0);
    
    if (!deckWithCards) {
        alert('Сначала создайте колоду с карточками!');
        showScreen('decksScreen');
        return;
    }
    
    state.currentDeckId = deckWithCards.id;
    state.currentSession = {
        deckId: deckWithCards.id,
        currentCardIndex: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        cards: [...deckWithCards.cards].sort(() => Math.random() - 0.5) // Перемешиваем карточки
    };
    
    showScreen('learnScreen');
    showNextCard();
}

function showNextCard() {
    const session = state.currentSession;
    if (!session || session.currentCardIndex >= session.cards.length) {
        finishSession();
        return;
    }
    
    const currentCard = session.cards[session.currentCardIndex];
    document.getElementById('cardFront').innerHTML = `<h3>${currentCard.front}</h3>`;
    document.getElementById('cardBack').innerHTML = `<h3>${currentCard.back}</h3>`;
    document.getElementById('learnCard').classList.remove('flipped');
    
    // Обновляем прогресс
    const progress = (session.currentCardIndex / session.cards.length) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = 
        `${session.currentCardIndex + 1}/${session.cards.length}`;
}

function flipCard() {
    document.getElementById('learnCard').classList.toggle('flipped');
}

function answerCard(isCorrect) {
    const session = state.currentSession;
    if (!session) return;
    
    if (isCorrect) {
        session.correctAnswers++;
        state.stats.learnedToday++;
    } else {
        session.wrongAnswers++;
    }
    
    session.currentCardIndex++;
    showNextCard();
}

function finishSession() {
    document.getElementById('sessionComplete').classList.remove('hidden');
    document.querySelector('.learn-controls').classList.add('hidden');
    
    state.stats.totalLearned += state.currentSession.correctAnswers;
    state.stats.lastStudyDate = new Date().toISOString();
    saveData();
}

// Статистика
function updateStats() {
    const totalCards = state.decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('totalDecks').textContent = state.decks.length;
    document.getElementById('learnedToday').textContent = state.stats.learnedToday;
    
    // Обновляем последние действия
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';
    
    // Добавляем создание колод
    state.decks.slice(-3).reverse().forEach(deck => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `Создана колода "${deck.name}"`;
        activityList.appendChild(activityItem);
    });
    
    if (state.stats.lastStudyDate) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `Изучено ${state.stats.learnedToday} слов сегодня`;
        activityList.appendChild(activityItem);
    }
}

// Сохранение и загрузка данных
function saveData() {
    const data = {
        decks: state.decks,
        stats: state.stats
    };
    localStorage.setItem('litherium_data', JSON.stringify(data));
}

function loadData() {
    const saved = localStorage.getItem('litherium_data');
    if (saved) {
        const data = JSON.parse(saved);
        state.decks = data.decks || [];
        state.stats = data.stats || { totalLearned: 0, learnedToday: 0, lastStudyDate: null };
    }
    
    // Сбрасываем счетчик изученных сегодня если это новый день
    const today = new Date().toDateString();
    if (state.stats.lastStudyDate && new Date(state.stats.lastStudyDate).toDateString() !== today) {
        state.stats.learnedToday = 0;
    }
}

// Инициализация демо-данных при первом запуске
function initDemoData() {
    if (state.decks.length === 0) {
        const demoDeck = {
            id: 'demo',
            name: 'Английские слова',
            description: 'Базовые слова для начала',
            cards: [
                { id: '1', front: 'Hello', back: 'Привет', known: false },
                { id: '2', front: 'Goodbye', back: 'До свидания', known: false },
                { id: '3', front: 'Thank you', back: 'Спасибо', known: false },
                { id: '4', front: 'Please', back: 'Пожалуйста', known: false }
            ],
            createdAt: new Date().toISOString()
        };
        state.decks.push(demoDeck);
        saveData();
    }
}

// Инициализируем демо-данные при первом запуске
initDemoData();
