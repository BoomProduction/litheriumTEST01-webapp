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
    },
    settings: {
        language: 'ru'
    }
};

// Тексты для разных языков
const translations = {
    ru: {
        // Главное меню
        mainFunctions: "Основные функции",
        settings: "Настройки",
        aboutAuthor: "Об авторе",
        
        // Основные функции
        myDecks: "Мои колоды",
        learnWords: "Учить слова",
        statistics: "Статистика",
        
        // Настройки
        settingsDescription: "Вы перешли к настройкам. Выберите вам подходящий пункт:",
        interfaceLanguage: "Язык интерфейса",
        choosePreferredLanguage: "Выберите предпочитаемый язык",
        clearData: "Очистить данные",
        clearDataDescription: "Удалить все колоды и статистику",
        resetProgress: "Сбросить прогресс",
        resetProgressDescription: "Обнулить статистику обучения",
        clear: "Очистить",
        reset: "Сбросить",
        
        // Обучение
        startLearning: "Начать обучение",
        know: "Знаю",
        tryAgain: "Еще раз",
        sessionCompleted: "Сессия завершена!",
        correct: "Правильно",
        needReview: "Нужно повторить",
        success: "Успех",
        backToMenu: "В меню",
        repeat: "Повторить",
        anotherDeck: "Другая колода",
        
        // Статистика
        totalCards: "Всего карточек",
        decks: "Колод",
        learnedToday: "Изучено сегодня",
        recentActivity: "Последние действия",
        
        // Колоды
        createFirstDeck: "Создайте первую колоду чтобы начать учить слова",
        noCards: "В этой колоде пока нет карточек",
        addFirstCard: "Добавьте первую карточку чтобы начать обучение",
        deckName: "Название колоды",
        description: "Описание (необязательно)",
        create: "Создать",
        cancel: "Отмена",
        wordQuestion: "Слово/Вопрос",
        translationAnswer: "Перевод/Ответ",
        add: "Добавить",
        edit: "Изменить",
        delete: "Удалить"
    },
    en: {
        // Main menu
        mainFunctions: "Main Functions",
        settings: "Settings",
        aboutAuthor: "About Author",
        
        // Main functions
        myDecks: "My Decks",
        learnWords: "Learn Words",
        statistics: "Statistics",
        
        // Settings
        settingsDescription: "You have entered the settings. Choose the appropriate option:",
        interfaceLanguage: "Interface Language",
        choosePreferredLanguage: "Choose preferred language",
        clearData: "Clear Data",
        clearDataDescription: "Delete all decks and statistics",
        resetProgress: "Reset Progress",
        resetProgressDescription: "Reset learning statistics",
        clear: "Clear",
        reset: "Reset",
        
        // Learning
        startLearning: "Start Learning",
        know: "Know",
        tryAgain: "Try Again",
        sessionCompleted: "Session Completed!",
        correct: "Correct",
        needReview: "Need Review",
        success: "Success",
        backToMenu: "Back to Menu",
        repeat: "Repeat",
        anotherDeck: "Another Deck",
        
        // Statistics
        totalCards: "Total Cards",
        decks: "Decks",
        learnedToday: "Learned Today",
        recentActivity: "Recent Activity",
        
        // Decks
        createFirstDeck: "Create your first deck to start learning words",
        noCards: "There are no cards in this deck yet",
        addFirstCard: "Add your first card to start learning",
        deckName: "Deck Name",
        description: "Description (optional)",
        create: "Create",
        cancel: "Cancel",
        wordQuestion: "Word/Question",
        translationAnswer: "Translation/Answer",
        add: "Add",
        edit: "Edit",
        delete: "Delete"
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    updateStats();
    showScreen('menuScreen');
    initDemoData();
    applyLanguage();
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
    } else if (screenName === 'settingsScreen') {
        updateSettingsDisplay();
    }
}

// Применение языка
function applyLanguage() {
    const lang = state.settings.language;
    const t = translations[lang];
    
    // Обновляем тексты в реальном времени
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (t[key]) {
            element.textContent = t[key];
        }
    });
    
    // Обновляем placeholder'ы
    const deckNameInput = document.getElementById('newDeckName');
    const deckDescInput = document.getElementById('newDeckDescription');
    const cardFrontInput = document.getElementById('newCardFront');
    const cardBackInput = document.getElementById('newCardBack');
    
    if (deckNameInput) deckNameInput.placeholder = t.deckName;
    if (deckDescInput) deckDescInput.placeholder = t.description;
    if (cardFrontInput) cardFrontInput.placeholder = t.wordQuestion;
    if (cardBackInput) cardBackInput.placeholder = t.translationAnswer;
}

function changeLanguage(lang) {
    state.settings.language = lang;
    saveData();
    applyLanguage();
    
    // Показываем уведомление о смене языка
    alert(lang === 'ru' ? 'Язык изменен на русский' : 'Language changed to English');
}

function updateSettingsDisplay() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = state.settings.language;
    }
}

// Функции для настроек
function clearAllData() {
    if (confirm(state.settings.language === 'ru' ? 
        'Вы уверены? Это удалит все колоды и статистику.' : 
        'Are you sure? This will delete all decks and statistics.')) {
        
        state.decks = [];
        state.stats = {
            totalLearned: 0,
            learnedToday: 0,
            lastStudyDate: null,
            sessionsCompleted: 0
        };
        saveData();
        updateStats();
        
        alert(state.settings.language === 'ru' ? 
            'Все данные очищены' : 
            'All data has been cleared');
    }
}

function resetProgress() {
    if (confirm(state.settings.language === 'ru' ? 
        'Вы уверены? Это обнулит всю статистику обучения.' : 
        'Are you sure? This will reset all learning statistics.')) {
        
        state.stats = {
            totalLearned: 0,
            learnedToday: 0,
            lastStudyDate: null,
            sessionsCompleted: 0
        };
        saveData();
        updateStats();
        
        alert(state.settings.language === 'ru' ? 
            'Прогресс сброшен' : 
            'Progress has been reset');
    }
}

// Рендер списка колод
function renderDecksList() {
    const decksList = document.getElementById('decksList');
    decksList.innerHTML = '';

    if (state.decks.length === 0) {
        const t = translations[state.settings.language];
        decksList.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">📚</div>
                <p>${state.settings.language === 'ru' ? 'У вас пока нет колод' : 'You have no decks yet'}</p>
                <p style="font-size: 14px; margin-top: 8px;">${t.createFirstDeck}</p>
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
                <p>${deck.description || (state.settings.language === 'ru' ? 'Без описания' : 'No description')}</p>
            </div>
            <div class="deck-stats">
                ${deck.cards.length} ${state.settings.language === 'ru' ? 'карточек' : 'cards'}
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
        const t = translations[state.settings.language];
        cardsList.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">🃏</div>
                <p>${t.noCards}</p>
                <p style="font-size: 14px; margin-top: 8px;">${t.addFirstCard}</p>
            </div>
        `;
        return;
    }

    deck.cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        
        const t = translations[state.settings.language];
        
        cardElement.innerHTML = `
            <div class="card-content">
                <div class="front">${escapeHtml(card.front)}</div>
                <div class="back">${escapeHtml(card.back)}</div>
                <div class="card-actions">
                    <button class="btn-edit" onclick="event.stopPropagation(); editCard('${card.id}')">✏️ ${t.edit}</button>
                    <button class="btn-delete" onclick="event.stopPropagation(); deleteCard('${card.id}')">🗑️ ${t.delete}</button>
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
    
    const t = translations[state.settings.language];
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>${t.edit}</h3>
            <input type="text" id="editCardFront" value="${escapeHtml(card.front)}" placeholder="${t.wordQuestion}" maxlength="50">
            <input type="text" id="editCardBack" value="${escapeHtml(card.back)}" placeholder="${t.translationAnswer}" maxlength="50">
            <div class="form-actions">
                <button class="secondary" onclick="closeModal()">${t.cancel}</button>
                <button class="primary" onclick="saveCardEdit('${cardId}')">${state.settings.language === 'ru' ? 'Сохранить' : 'Save'}</button>
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
        alert(state.settings.language === 'ru' ? 'Заполните обе стороны карточки' : 'Fill both sides of the card');
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
    const t = translations[state.settings.language];
    if (!confirm(state.settings.language === 'ru' ? 'Удалить эту карточку?' : 'Delete this card?')) return;
    
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
        alert(state.settings.language === 'ru' ? 'Введите название колоды' : 'Enter deck name');
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
        alert(state.settings.language === 'ru' ? 'Заполните обе стороны карточки' : 'Fill both sides of the card');
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
        const t = translations[state.settings.language];
        deckSelection.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">📚</div>
                <p>${state.settings.language === 'ru' ? 'Нет колод с карточками' : 'No decks with cards'}</p>
                <p style="font-size: 14px; margin-top: 8px; margin-bottom: 16px;">${t.createFirstDeck}</p>
                <div class="session-actions">
                    <button class="secondary" onclick="showScreen('mainFunctionsScreen')">${t.backToMenu}</button>
                    <button class="primary" onclick="showScreen('decksScreen')">${t.create}</button>
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
                <p>${deck.cards.length} ${state.settings.language === 'ru' ? 'карточек' : 'cards'}</p>
                <small>${deck.description || ''}</small>
            </div>
        `;
    });
    
    const t = translations[state.settings.language];
    
    deckSelection.innerHTML = `
        <h3 style="text-align: center; margin-bottom: 20px;">🎯 ${state.settings.language === 'ru' ? 'Выберите колоду для изучения' : 'Choose a deck to study'}</h3>
        <div class="learn-options">
            ${optionsHtml}
        </div>
        <div class="session-actions">
            <button class="secondary" onclick="showScreen('mainFunctionsScreen')">← ${t.backToMenu}</button>
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
    const t = translations[state.settings.language];
    
    document.getElementById('sessionComplete').innerHTML = `
        <h2>🎉 ${t.sessionCompleted}</h2>
        <div class="session-stats">
            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value correct">${session.correctAnswers}</div>
                    <div class="stat-label">${t.correct}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value wrong">${session.wrongAnswers}</div>
                    <div class="stat-label">${t.needReview}</div>
                </div>
            </div>
            <div class="stat-row">
                <div class="stat-item">
                    <div class="stat-value">${Math.round((session.correctAnswers / session.cards.length) * 100)}%</div>
                    <div class="stat-label">${t.success}</div>
                </div>
            </div>
        </div>
        <div class="session-actions">
            <button class="secondary" onclick="showScreen('mainFunctionsScreen')">${t.backToMenu}</button>
            <button class="primary" onclick="restartSession()">🔄 ${t.repeat}</button>
            <button class="primary" onclick="showDeckSelection()">📚 ${t.anotherDeck}</button>
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
    const t = translations[state.settings.language];
    
    document.getElementById('totalCards').textContent = totalCards;
    document.getElementById('totalDecks').textContent = state.decks.length;
    document.getElementById('learnedToday').textContent = state.stats.learnedToday;
    
    // Обновляем заголовки статистики
    const statLabels = document.querySelectorAll('.stat-label');
    if (statLabels[0]) statLabels[0].textContent = t.totalCards;
    if (statLabels[1]) statLabels[1].textContent = t.decks;
    if (statLabels[2]) statLabels[2].textContent = t.learnedToday;
    
    const recentActivityTitle = document.querySelector('.recent-activity h3');
    if (recentActivityTitle) recentActivityTitle.textContent = t.recentActivity;
    
    updateRecentActivity();
}

function updateRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    activityList.innerHTML = '';
    
    if (state.stats.studyHistory.length === 0) {
        const t = translations[state.settings.language];
        activityList.innerHTML = `
            <div class="no-decks-message">
                <div class="icon">📊</div>
                <p>${state.settings.language === 'ru' ? 'Пока нет истории изучения' : 'No study history yet'}</p>
                <p style="font-size: 14px; margin-top: 8px;">${state.settings.language === 'ru' ? 'Начните учить слова чтобы увидеть статистику' : 'Start learning words to see statistics'}</p>
            </div>
        `;
        return;
    }
    
    state.decks.slice(-3).reverse().forEach(deck => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `${state.settings.language === 'ru' ? 'Создана колода' : 'Created deck'} "${deck.name}"`;
        activityList.appendChild(activityItem);
    });
    
    if (state.stats.lastStudyDate) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `${state.settings.language === 'ru' ? 'Изучено' : 'Learned'} ${state.stats.learnedToday} ${state.settings.language === 'ru' ? 'слов сегодня' : 'words today'}`;
        activityList.appendChild(activityItem);
    }
    
    if (state.stats.sessionsCompleted) {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.textContent = `${state.settings.language === 'ru' ? 'Завершено сессий' : 'Sessions completed'}: ${state.stats.sessionsCompleted}`;
        activityList.appendChild(activityItem);
    }
}

// Сохранение и загрузка данных
function saveData() {
    const data = {
        decks: state.decks,
        stats: state.stats,
        settings: state.settings
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
        state.settings = data.settings || { language: 'ru' };
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
            name: state.settings.language === 'ru' ? 'Английские слова' : 'English Words',
            description: state.settings.language === 'ru' ? 'Базовые слова для начала' : 'Basic words to start with',
            cards: [
                { id: '1', front: 'Hello', back: state.settings.language === 'ru' ? 'Привет' : 'Hi', known: false },
                { id: '2', front: 'Goodbye', back: state.settings.language === 'ru' ? 'До свидания' : 'Goodbye', known: false },
                { id: '3', front: 'Thank you', back: state.settings.language === 'ru' ? 'Спасибо' : 'Thanks', known: false },
                { id: '4', front: 'Please', back: state.settings.language === 'ru' ? 'Пожалуйста' : 'Please', known: false }
            ],
            createdAt: new Date().toISOString()
        };
        state.decks.push(demoDeck);
        saveData();
    }
}
