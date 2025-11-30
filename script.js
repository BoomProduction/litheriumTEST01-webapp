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
        sessionsCompleted: 0,
        totalAnswers: 0,
        correctAnswers: 0,
        studyHistory: []
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
        showStudyMethodSelection();
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
        known: false,
        reviewCount: 0,
        lastReviewed: null
    };
    
    deck.cards.push(newCard);
    saveData();
    hideAddCardForm();
    renderCardsList();
}

// Выбор метода изучения
function showStudyMethodSelection() {
    const learnScreen = document.getElementById('learnScreen');
    
    // Скрываем элементы обучения
    document.querySelector('.learn-header').classList.add('hidden');
    document.querySelector('.card-container').classList.add('hidden');
    document.querySelector('.learn-controls').classList.add('hidden');
    document.getElementById('sessionComplete').classList.add('hidden');
    
    // Удаляем старый выбор если есть
    const oldSelection = document.querySelector('.study-method-selector');
    if (oldSelection) {
        oldSelection.remove();
    }
    
    const nonEmptyDecks = state.decks.filter(deck => deck.cards.length > 0);
    
    if (nonEmptyDecks.length === 0) {
        const methodSelector = document.createElement('div');
        methodSelector.className = 'study-method-selector';
        methodSelector.innerHTML = `
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
        learnScreen.insertBefore(methodSelector, learnScreen.firstChild);
        return;
    }
    
    const methodSelector = document.createElement('div');
    methodSelector.className = 'study-method-selector';
    methodSelector.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 20px;">🎯 Выберите метод изучения</h3>
        <div class="method-options">
            <div class="method-option" onclick="selectStudyMethod('standard')">
                <div class="method-icon">🔁</div>
                <div class="method-title">Стандартный</div>
                <div class="method-description">Все карточки по одному разу в случайном порядке</div>
            </div>
            <div class="method-option" onclick="selectStudyMethod('repeat-unknown')">
                <div class="method-icon">🔄</div>
                <div class="method-title">С повторением неизвестных</div>
                <div class="method-description">Неизвестные слова добавляются в конец для повторения</div>
            </div>
        </div>
        <div class="session-actions" style="margin-top: 20px;">
            <button class="secondary" onclick="showScreen('menuScreen')">← В меню</button>
        </div>
    `;
    
    learnScreen.insertBefore(methodSelector, learnScreen.firstChild);
}

let selectedStudyMethod = 'standard';

function selectStudyMethod(method) {
    selectedStudyMethod = method;
    
    // Убираем выделение со всех методов
    document.querySelectorAll('.method-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    // Добавляем выделение выбранному методу
    event.currentTarget.classList.add('selected');
    
    // Показываем выбор колоды для выбранного метода
    setTimeout(() => showDeckSelection(), 300);
}

// Обучение - выбор колоды
function showDeckSelection() {
    const learnScreen = document.getElementById('learnScreen');
    
    // Удаляем старый выбор колоды если есть
    const oldDeckSelection = document.querySelector('.deck-selection');
    if (oldDeckSelection) {
        oldDeckSelection.remove();
    }
    
    const deckSelection = document.createElement('div');
    deckSelection.className = 'deck-selection';
    learnScreen.insertBefore(deckSelection, learnScreen.firstChild);
    
    const nonEmptyDecks = state.decks.filter(deck => deck.cards.length > 0);
    
    let optionsHtml = '';
    nonEmptyDecks.forEach(deck => {
        optionsHtml += `
            <div class="option-button" onclick="startDeckLearning('${deck.id}', '${selectedStudyMethod}')">
                <h4>${deck.name}</h4>
                <p>${deck.cards.length} карточек</p>
                <small>${deck.description || ''}</small>
            </div>
        `;
    });
    
    deckSelection.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 20px;">📚 Выберите колоду</h3>
        <div class="learn-options">
            ${optionsHtml}
        </div>
        <div class="session-actions">
            <button class="secondary" onclick="showStudyMethodSelection()">← Назад к методам</button>
        </div>
    `;
}

function startDeckLearning(deckId, method) {
    const deck = state.decks.find(d => d.id === deckId);
    if (!deck || deck.cards.length === 0) return;
    
    state.currentDeckId = deckId;
    
    // Создаем сессию в зависимости от выбранного метода
    if (method === 'repeat-unknown') {
        state.currentSession = {
            deckId: deckId,
            currentCardIndex: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            method: 'repeat-unknown',
            cards: [...deck.cards].sort(() => Math.random() - 0.5),
            wrongCards: [], // Карточки, которые нужно повторить
            originalLength: deck.cards.length,
            learnedWords: [],
            reviewWords: [],
            totalCardsInSession: deck.cards.length // Общее количество карточек в сессии
        };
    } else {
        state.currentSession = {
            deckId: deckId,
            currentCardIndex: 0,
            correctAnswers: 0,
            wrongAnswers: 0,
            method: 'standard',
            cards: [...deck.cards].sort(() => Math.random() - 0.5),
            learnedWords: [],
            reviewWords: [],
            totalCardsInSession: deck.cards.length
        };
    }
    
    // Удаляем выбор колоды и метода
    const deckSelection = document.querySelector('.deck-selection');
    const methodSelector = document.querySelector('.study-method-selector');
    if (deckSelection) deckSelection.remove();
    if (methodSelector) methodSelector.remove();
    
    // Показываем элементы обучения
    document.querySelector('.learn-header').classList.remove('hidden');
    document.querySelector('.card-container').classList.remove('hidden');
    document.querySelector('.learn-controls').classList.remove('hidden');
    
    showNextCard();
}

function showNextCard() {
    const session = state.currentSession;
    if (!session) return;
    
    console.log('showNextCard called', {
        currentIndex: session.currentCardIndex,
        cardsLength: session.cards.length,
        wrongCards: session.wrongCards ? session.wrongCards.length : 0,
        method: session.method
    });
    
    // Для метода с повторением: если дошли до конца основных карточек, добавляем неправильные
    if (session.method === 'repeat-unknown' && 
        session.currentCardIndex >= session.cards.length && 
        session.wrongCards && session.wrongCards.length > 0) {
        
        console.log('Adding wrong cards to session', session.wrongCards.length);
        session.cards = session.cards.concat(session.wrongCards);
        session.wrongCards = [];
        // Не сбрасываем currentCardIndex - продолжаем с того места где остановились
    }
    
    // Проверяем, завершена ли сессия
    if (session.currentCardIndex >= session.cards.length) {
        console.log('Session completed, calling finishSession');
        finishSession();
        return;
    }
    
    const currentCard = session.cards[session.currentCardIndex];
    document.getElementById('cardFront').innerHTML = `<h3>${escapeHtml(currentCard.front)}</h3>`;
    document.getElementById('cardBack').innerHTML = `<h3>${escapeHtml(currentCard.back)}</h3>`;
    
    // Сбрасываем переворот карточки
    document.getElementById('learnCard').classList.remove('flipped');
    
    // Обновляем прогресс
    updateProgress(session);
}

function updateProgress(session) {
    let currentPosition, totalCards;
    
    if (session.method === 'repeat-unknown') {
        // Для метода с повторением: текущая позиция = основной индекс + количество пройденных неправильных
        currentPosition = session.currentCardIndex + 1;
        // Общее количество = оригинальные карточки + неправильные карточки
        totalCards = session.originalLength + (session.wrongCards ? session.wrongCards.length : 0);
    } else {
        // Для стандартного метода: просто текущий индекс и общее количество
        currentPosition = session.currentCardIndex + 1;
        totalCards = session.cards.length;
    }
    
    const progress = ((currentPosition - 1) / totalCards) * 100;
    document.getElementById('progressFill').style.width = `${progress}%`;
    document.getElementById('progressText').textContent = `${currentPosition}/${totalCards}`;
    
    console.log('Progress updated', { currentPosition, totalCards, progress });
}

function flipCard() {
    document.getElementById('learnCard').classList.toggle('flipped');
}

function answerCard(isCorrect) {
    const session = state.currentSession;
    if (!session) return;
    
    const currentCard = session.cards[session.currentCardIndex];
    
    console.log('Answer given', { isCorrect, currentCard: currentCard.front });
    
    if (isCorrect) {
        session.correctAnswers++;
        state.stats.learnedToday++;
        
        // Добавляем в изученные слова
        if (!session.learnedWords.find(w => w.id === currentCard.id)) {
            session.learnedWords.push({
                id: currentCard.id,
                front: currentCard.front,
                back: currentCard.back
            });
        }
    } else {
        session.wrongAnswers++;
        
        // Для метода с повторением добавляем карточку в неправильные
        if (session.method === 'repeat-unknown') {
            if (!session.wrongCards.find(w => w.id === currentCard.id)) {
                session.wrongCards.push(currentCard);
                console.log('Added to wrong cards, total wrong:', session.wrongCards.length);
            }
        }
        
        // Добавляем в слова для повторения
        if (!session.reviewWords.find(w => w.id === currentCard.id)) {
            session.reviewWords.push({
                id: currentCard.id,
                front: currentCard.front,
                back: currentCard.back
            });
        }
    }
    
    // Обновляем статистику карточки
    currentCard.reviewCount = (currentCard.reviewCount || 0) + 1;
    currentCard.lastReviewed = new Date().toISOString();
    if (isCorrect) {
        currentCard.known = true;
    }
    
    session.currentCardIndex++;
    console.log('Moving to next card, new index:', session.currentCardIndex);
    
    // Небольшая задержка перед показом следующей карточки
    setTimeout(() => {
        showNextCard();
    }, 300);
}

function finishSession() {
    const session = state.currentSession;
    
    console.log('Finishing session', session);
    
    if (!session) return;
    
    document.getElementById('sessionComplete').classList.remove('hidden');
    document.querySelector('.learn-controls').classList.add('hidden');
    document.querySelector('.learn-header').classList.add('hidden');
    document.querySelector('.card-container').classList.add('hidden');
    
    // Обновляем глобальную статистику
    state.stats.totalLearned += session.correctAnswers;
    state.stats.sessionsCompleted = (state.stats.sessionsCompleted || 0) + 1;
    state.stats.totalAnswers = (state.stats.totalAnswers || 0) + session.correctAnswers + session.wrongAnswers;
    state.stats.correctAnswers = (state.stats.correctAnswers || 0) + session.correctAnswers;
    state.stats.lastStudyDate = new Date().toISOString();
    
    // Добавляем в историю изучения
    state.stats.studyHistory.unshift({
        date: new Date().toISOString(),
        deckId: session.deckId,
        method: session.method,
        correct: session.correctAnswers,
        wrong: session.wrongAnswers,
        total: session.method === 'repeat-unknown' ? session.originalLength : session.cards.length,
        learnedWords: session.learnedWords || [],
        reviewWords: session.reviewWords || []
    });
    
    // Ограничиваем историю последними 10 сессиями
    if (state.stats.studyHistory.length > 10) {
        state.stats.studyHistory = state.stats.studyHistory.slice(0, 10);
    }
    
    // Формируем HTML для завершения сессии
    let sessionHTML = `
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
                    <div class="stat-value">${Math.round((session.correctAnswers / (session.method === 'repeat-unknown' ? session.originalLength : session.cards.length)) * 100)}%</div>
                    <div class="stat-label">Успех</div>
                </div>
            </div>
    `;
    
    // Показываем детали изученных слов
    if (session.learnedWords && session.learnedWords.length > 0) {
        sessionHTML += `
            <div class="session-details">
                <h4>✅ Изученные слова (${session.learnedWords.length})</h4>
                <div class="learned-words-list">
                    ${session.learnedWords.map(word => 
                        `<div class="word-item"><strong>${escapeHtml(word.front)}</strong> - ${escapeHtml(word.back)}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    // Показываем слова для повторения
    if (session.reviewWords && session.reviewWords.length > 0) {
        sessionHTML += `
            <div class="session-details">
                <h4>🔄 Слова для повторения (${session.reviewWords.length})</h4>
                <div class="review-words-details">
                    ${session.reviewWords.map(word => 
                        `<div class="word-item"><strong>${escapeHtml(word.front)}</strong> - ${escapeHtml(word.back)}</div>`
                    ).join('')}
                </div>
            </div>
        `;
    }
    
    sessionHTML += `
        </div>
        <div class="session-actions">
            <button class="secondary" onclick="showScreen('menuScreen')">В меню</button>
            <button class="primary" onclick="restartSession()">🔄 Повторить</button>
            <button class="primary" onclick="showStudyMethodSelection()">📚 Другая колода</button>
        </div>
    `;
    
    document.getElementById('sessionComplete').innerHTML = sessionHTML;
    saveData();
}

function restartSession() {
    if (!state.currentSession) return;
    
    const deck = state.decks.find(d => d.id === state.currentSession.deckId);
    if (!deck) return;
    
    // Перезапускаем сессию с теми же настройками
    startDeckLearning(state.currentSession.deckId, state.currentSession.method);
}

// Статистика
function updateStats() {
    const totalCards = state.decks.reduce((sum, deck) => sum + deck.cards.length, 0);
    const successRate = state.stats.totalAnswers > 0 ? 
        Math.round((state.stats.correctAnswers / state.stats.totalAnswers) * 100) : 0;
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('totalDecks').textContent = state.decks.length;
    document.getElementById('learnedToday').textContent = state.stats.learnedToday;
    document.getElementById('totalLearned').textContent = state.stats.totalLearned;
    document.getElementById('sessionsCompleted').textContent = state.stats.sessionsCompleted;
    document.getElementById('successRate').textContent = successRate + '%';
    
    updateDecksProgress();
    updateRecentActivity();
}

function updateDecksProgress() {
    const decksProgress = document.getElementById('decksProgress');
    decksProgress.innerHTML = '';
    
    state.decks.forEach(deck => {
        const totalCards = deck.cards.length;
        const knownCards = deck.cards.filter(card => card.known).length;
        const progressPercent = totalCards > 0 ? Math.round((knownCards / totalCards) * 100) : 0;
        
        const progressItem = document.createElement('div');
        progressItem.className = 'deck-progress-item';
        progressItem.innerHTML = `
            <div class="deck-progress-header">
                <div class="deck-progress-name">${deck.name}</div>
                <div class="deck-progress-stats">${knownCards}/${totalCards}</div>
            </div>
            <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${progressPercent}%"></div>
            </div>
        `;
        
        decksProgress.appendChild(progressItem);
    });
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';
    
    if (state.stats.studyHistory.length === 0) {
        activityList.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">📊</div>
                <p>Пока нет истории изучения</p>
                <p style="font-size: 14px; margin-top: 8px;">Начните учить слова чтобы увидеть статистику</p>
            </div>
        `;
        return;
    }
    
    state.stats.studyHistory.forEach(session => {
        const deck = state.decks.find(d => d.id === session.deckId);
        const deckName = deck ? deck.name : 'Неизвестная колода';
        const date = new Date(session.date).toLocaleDateString('ru-RU');
        const successRate = Math.round((session.correct / session.total) * 100);
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div style="display: flex; justify-content: between; align-items: start; margin-bottom: 8px;">
                <strong>${deckName}</strong>
                <small style="color: var(--secondary-color);">${date}</small>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--secondary-color);">
                <span>✅ ${session.correct} | ❌ ${session.wrong}</span>
                <span>${successRate}% успеха</span>
            </div>
            <div style="font-size: 11px; color: var(--secondary-color); margin-top: 4px;">
                Метод: ${session.method === 'repeat-unknown' ? 'С повторением' : 'Стандартный'}
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
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
            sessionsCompleted: 0,
            totalAnswers: 0,
            correctAnswers: 0,
            studyHistory: []
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
                { id: '1', front: 'Hello', back: 'Привет', known: false, reviewCount: 0 },
                { id: '2', front: 'Goodbye', back: 'До свидания', known: false, reviewCount: 0 },
                { id: '3', front: 'Thank you', back: 'Спасибо', known: false, reviewCount: 0 },
                { id: '4', front: 'Please', back: 'Пожалуйста', known: false, reviewCount: 0 }
            ],
            createdAt: new Date().toISOString()
        };
        state.decks.push(demoDeck);
        saveData();
    }
}
