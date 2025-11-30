// Инициализируем Telegram WebApp
let tg = window.Telegram.WebApp;
tg.expand(); // Раскрываем WebApp на весь экран

// Получаем данные пользователя из Telegram
let user = tg.initDataUnsafe?.user;
console.log("Пользователь:", user);

// Пример обработки кнопки
document.getElementById('getData').addEventListener('click', () => {
    document.getElementById('data').innerHTML = `<p>Привет, ${user?.first_name || 'друг'}! Вот твои слова...</p>`;
});

// Кнопка "Назад" или "Закрыть"
tg.BackButton.show();
tg.BackButton.onClick(() => {
    tg.close();
});