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
        lastStudyDate: null,
        sessionsCompleted: 0
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    showScreen('menuScreen');
    initDemoData();
});

// Управление экранами
function showScreen(screenName) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(screenName).classList.add('active');
    
    // Специальные действия для экранов
    if (screenName === 'decksScreen') {
        renderDecksList();
    } else if (screenName === 'statsScreen') {
        updateStats();
    } else if (screenName === 'learnScreen') {
        showDeckSelection();
    }
}

// Рендер списка колод
function renderDecksList() {
    const decksList = document.getElementById('decksList');
    decksList.innerHTML = '';

    if (state.decks.length === 0) {
        decksList.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">📚</div>
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

// Рендер списка карточек с кнопками редактирования
function renderCardsList() {
    const cardsList = document.getElementById('cardsList');
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    
    if (!deck) return;
    
    cardsList.innerHTML = '';

    if (deck.cards.length === 0) {
        cardsList.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">🃏</div>
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
                <div class="front">${escapeHtml(card.front)}</div>
                <div class="back">${escapeHtml(card.back)}</div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="event.stopPropagation(); editCard('${card.id}')">✏️ Изменить</button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteCard('${card.id}')">🗑️ Удалить</button>
                </div>
            </div>
        `;
        
        cardsList.appendChild(cardElement);
    });
}

// Экранирование HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Редактирование карточки
function editCard(cardId) {
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    const card = deck.cards.find(c => c.id === cardId);
    
    if (!card) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Редактировать карточку</h3>
            <input type="text" id="editCardFront" value="${escapeHtml(card.front)}" placeholder="Слово/Вопрос" maxlength="50">
            <input type="text" id="editCardBack" value="${escapeHtml(card.back)}" placeholder="Перевод/Ответ" maxlength="50">
            <div class="form-actions">
                <button class="secondary" onclick="closeModal()">Отмена</button>
                <button class="primary" onclick="saveCardEdit('${cardId}')">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.getElementById('editCardFront').focus();
}

function saveCardEdit(cardId) {
    const front = document.getElementById('editCardFront').value.trim();
    const back = document.getElementById('editCardBack').value.trim();
    
    if (!front || !back) {
        alert('Заполните обе стороны карточки');
        return;
    }
    
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    const card = deck.cards.find(c => c.id === cardId);
    
    if (card) {
        card.front = front;
        card.back = back;
        saveData();
        renderCardsList();
    }
    
    closeModal();
}

function deleteCard(cardId) {
    if (!confirm('Удалить эту карточку?')) return;
    
    const deck = state.decks.find(d => d.id === state.currentDeckId);
    deck.cards = deck.cards.filter(c => c.id !== cardId);
    saveData();
    renderCardsList();
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
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

// Обучение - выбор колоды
function showDeckSelection() {
    const learnScreen = document.getElementById('learnScreen');
    
    // Скрываем элементы обучения
    document.querySelector('.learn-header').classList.add('hidden');
    document.querySelector('.card-container').classList.add('hidden');
    document.querySelector('.learn-controls').classList.add('hidden');
    document.getElementById('sessionComplete').classList.add('hidden');
    
    // Удаляем старый выбор колоды если есть
    const oldDeckSelection = document.querySelector('.deck-selection');
    if (oldDeckSelection) {
        oldDeckSelection.remove();
    }
    
    // Создаем новый выбор колоды
    const deckSelection = document.createElement('div');
    deckSelection.className = 'deck-selection';
    learnScreen.insertBefore(deckSelection, learnScreen.firstChild);
    
    const nonEmptyDecks = state.decks.filter(deck => deck.cards.length > 0);
    
    if (nonEmptyDecks.length === 0) {
        deckSelection.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">📚</div>
                <p>Нет колод с карточками</p>
                <p style="font-size: 14px; margin-top: 8px; margin-bottom: 16px;">Сначала создайте колоду и добавьте карточки</p>
                <div class="session-actions">
                    <button class="secondary" onclick="showScreen('menuScreen')">В меню</button>
                    <button class="primary" onclick="showScreen('decksScreen')">Создать колоду</button>
                </div>
            </div>
        `;
        return;
    }
    
    let optionsHtml = '';
    nonEmptyDecks.forEach(deck => {
        optionsHtml += `
            <div class="option-button" onclick="startDeckLearning('${deck.id}')">
                <h4>${deck.name}</h4>
                <p>${deck.cards.length} карточек</p>
                <small>${deck.description || ''}</small>
            </div>
        `;
    });
    
    deckSelection.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 20px;">🎯 Выберите колоду для изучения</h3>
        <div class="learn-options">
            ${optionsHtml}
        </div>
        <div class="session-actions">
            <button class="secondary" onclick="showScreen('menuScreen')">← В меню</button>
        </div>
    `;
}

function startDeckLearning(deckId) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck || deck.cards.length === 0) return;
    
    state.currentDeckId = deckId;
    state.currentSession = {
        deckId: deckId,
        currentCardIndex: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        cards: [...deck.cards].sort(() => Math.random() - 0.5)
    };
    
    // Удаляем выбор колоды
    const deckSelection = document.querySelector('.deck-selection');
    if (deckSelection) {
        deckSelection.remove();
    }
    
    // Показываем элементы обучения
    document.querySelector('.learn-header').classList.remove('hidden');
    document.querySelector('.card-container').classList.remove('hidden');
    document.querySelector('.learn-controls').classList.remove('hidden');
    
    showNextCard();
}

function showNextCard() {
    const session = state.currentSession;
    if (!session || session.currentCardIndex >= session.cards.length) {
        finishSession();
        return;
    }
    
    const currentCard = session.cards[session.currentCardIndex];
    document.getElementById('cardFront').innerHTML = `<h3>${escapeHtml(currentCard.front)}</h3>`;
    document.getElementById('cardBack').innerHTML = `<h3>${escapeHtml(currentCard.back)}</h3>`;
    
    // Сбрасываем переворот карточки
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
    const session = state.currentSession;
    
    document.getElementById('sessionComplete').classList.remove('hidden');
    document.querySelector('.learn-controls').classList.add('hidden');
    
    // Обновляем статистику
    state.stats.totalLearned += session.correctAnswers;
    state.stats.sessionsCompleted = (state.stats.sessionsCompleted || 0) + 1;
    state.stats.lastStudyDate = new Date().toISOString();
    
    // Показываем статистику сессии
    document.getElementById('sessionComplete').innerHTML = `
        <h2>🎉 Сессия завершена!</h2>
        <div class="session-stats">
            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value correct">${session.correctAnswers}</div>
                    <div class="stat-label">Правильно</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value wrong">${session.wrongAnswers}</div>
                    <div class="stat-label">Нужно повторить</div>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value">${Math.round((session.correctAnswers / session.cards.length) * 100)}%</div>
                    <div class="stat-label">Успех</div>
                </div>
            </div>
        </div>
        <div class="session-actions">
            <button class="secondary" onclick="showScreen('menuScreen')">В меню</button>
            <button class="primary" onclick="restartSession()">🔄 Повторить</button>
            <button class="primary" onclick="showDeckSelection()">📚 Другая колода</button>
        </div>
    `;
    
    saveData();
}

function restartSession() {
    if (!state.currentSession) return;
    
    // Сбрасываем сессию с теми же карточками
    state.currentSession.currentCardIndex = 0;
    state.currentSession.correctAnswers = 0;
    state.currentSession.wrongAnswers = 0;
    state.currentSession.cards = [...state.currentSession.cards].sort(() => Math.random() - 0.5);
    
    document.getElementById('sessionComplete').classList.add('hidden');
    document.querySelector('.learn-controls').classList.remove('hidden');
    
    showNextCard();
}

// Статистика
function updateStats() {
    const totalCards = state.decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('totalDecks').textContent = state.decks.length;
    document.getElementById('learnedToday').textContent = state.stats.learnedToday;
    
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
    
    if (state.stats.sessionsCompleted) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `Завершено сессий: ${state.stats.sessionsCompleted}`;
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
        state.stats = data.stats || { 
            totalLearned: 0, 
            learnedToday: 0, 
            lastStudyDate: null,
            sessionsCompleted: 0
        };
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
