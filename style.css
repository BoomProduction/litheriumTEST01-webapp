:root {
    --tg-theme-bg-color: #ffffff;
    --tg-theme-text-color: #000000;
    --tg-theme-button-color: #50a8eb;
    --tg-theme-button-text-color: #ffffff;
    --primary-color: #50a8eb;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    --border-radius: 12px;
    --shadow: 0 2px 10px rgba(0,0,0,0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: var(--tg-theme-bg-color, #f8f9fa);
    color: var(--tg-theme-text-color, #212529);
    line-height: 1.5;
}

.app {
    max-width: 100%;
    min-height: 100vh;
    padding: 16px;
}

/* Экраны */
.screen {
    display: none;
}

.screen.active {
    display: block;
    animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

/* Заголовки */
.header {
    text-align: center;
    margin-bottom: 30px;
}

.header h1 {
    font-size: 28px;
    margin-bottom: 8px;
    color: var(--primary-color);
}

.header p {
    color: var(--secondary-color);
    font-size: 16px;
}

.screen-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #e9ecef;
}

.screen-header h2 {
    font-size: 20px;
    text-align: center;
    flex: 1;
}

/* Кнопки */
button {
    background: none;
    border: none;
    padding: 10px 16px;
    border-radius: var(--border-radius);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
}

.back-btn {
    color: var(--secondary-color);
    font-size: 16px;
}

.add-btn {
    background: var(--primary-color);
    color: white;
    font-size: 20px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
}

.primary {
    background: var(--primary-color);
    color: white;
}

.btn-correct {
    background: var(--success-color);
    color: white;
    flex: 1;
    margin-left: 8px;
}

.btn-wrong {
    background: var(--danger-color);
    color: white;
    flex: 1;
    margin-right: 8px;
}

/* Меню карточки */
.menu-cards {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.menu-card {
    background: white;
    padding: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    cursor: pointer;
    transition: transform 0.2s ease;
}

.menu-card:hover {
    transform: translateY(-2px);
}

.menu-icon {
    font-size: 32px;
    margin-bottom: 12px;
}

.menu-card h3 {
    font-size: 18px;
    margin-bottom: 8px;
}

.menu-card p {
    color: var(--secondary-color);
    font-size: 14px;
}

/* Списки */
.decks-list, .cards-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.deck-item, .card-item {
    background: white;
    padding: 16px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    cursor: pointer;
}

.deck-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.deck-info h3 {
    font-size: 16px;
    margin-bottom: 4px;
}

.deck-info p {
    color: var(--secondary-color);
    font-size: 14px;
}

.deck-stats {
    text-align: right;
    color: var(--secondary-color);
    font-size: 14px;
}

.card-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.card-content {
    flex: 1;
}

.card-content .front {
    font-weight: 600;
    margin-bottom: 4px;
}

.card-content .back {
    color: var(--secondary-color);
    font-size: 14px;
}

/* Формы */
.add-form {
    background: white;
    padding: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    margin-top: 20px;
}

.add-form.hidden {
    display: none;
}

input, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: var(--border-radius);
    margin-bottom: 12px;
    font-size: 16px;
    font-family: inherit;
}

textarea {
    resize: vertical;
    min-height: 60px;
}

.form-actions {
    display: flex;
    gap: 12px;
}

.form-actions button {
    flex: 1;
}

/* Обучение */
.learn-header {
    margin-bottom: 30px;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background: #e9ecef;
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
}

.progress-fill {
    height: 100%;
    background: var(--primary-color);
    width: 0%;
    transition: width 0.3s ease;
}

.progress-text {
    text-align: center;
    color: var(--secondary-color);
    font-size: 14px;
}

.card-container {
    perspective: 1000px;
    margin-bottom: 30px;
}

.card {
    width: 100%;
    height: 200px;
    position: relative;
    transform-style: preserve-3d;
    transition: transform 0.6s ease;
    cursor: pointer;
}

.card.flipped {
    transform: rotateY(180deg);
}

.card-front, .card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    background: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    text-align: center;
}

.card-back {
    transform: rotateY(180deg);
    background: #f8f9fa;
}

.card h3 {
    font-size: 24px;
    word-break: break-word;
}

.learn-controls {
    display: flex;
    gap: 12px;
}

.session-complete {
    text-align: center;
    padding: 40px 20px;
}

.session-complete h2 {
    margin-bottom: 12px;
    color: var(--success-color);
}

.session-complete button {
    margin: 8px;
}

/* Статистика */
.stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 30px;
}

.stat-card {
    background: white;
    padding: 20px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    text-align: center;
}

.stat-number {
    font-size: 24px;
    font-weight: bold;
    color: var(--primary-color);
    margin-bottom: 8px;
}

.stat-label {
    color: var(--secondary-color);
    font-size: 12px;
}

.recent-activity h3 {
    margin-bottom: 16px;
    font-size: 18px;
}

.activity-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.activity-item {
    background: white;
    padding: 12px 16px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow);
    font-size: 14px;
}

/* Утилиты */
.hidden {
    display: none !important;
}
