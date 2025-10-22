const TelegramBot = require('node-telegram-bot-api');

// ===== Настройки =====
// Переменные окружения или можно вставить токен напрямую для теста
const TOKEN = process.env.BOT_TOKEN || "8136440725:AAGXTzGcuASyTFB5HfYj3QZQ5c9exoALGkQ";
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID || "-1008136440725";

// Инициализация бота
const bot = new TelegramBot(TOKEN, { polling: true });

// ===== Хранилище временных состояний пользователей =====
const userState = {};

// ===== Команда /start =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  userState[chatId] = { step: 'FIO', data: {} };
  bot.sendMessage(chatId, '👋 Привет! Введите ваше ФИО:');
});

// ===== Обработка всех сообщений =====
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!userState[chatId] || text.startsWith('/start')) return;

  const state = userState[chatId];

  switch (state.step) {
    case 'FIO':
      state.data.fio = text;
      state.step = 'DATE';
      bot.sendMessage(chatId, 'Введите дату (например, 22.10.2025):');
      break;

    case 'DATE':
      state.data.date = text;
      state.step = 'MACHINE';
      bot.sendMessage(chatId, 'Выберите тип станка:\n1️⃣ ЧПУ\n2️⃣ Токарный\n3️⃣ Фрезерный');
      break;

    case 'MACHINE':
      state.data.machine = text;
      state.step = 'Q1';
      bot.sendMessage(chatId, 'Станок работает? (ДА/НЕТ)');
      break;

    case 'Q1':
      state.data.q1 = text;
      state.step = 'Q2';
      bot.sendMessage(chatId, 'Станок откалиброван? (ДА/НЕТ)');
      break;

    case 'Q2':
      state.data.q2 = text;
      state.step = 'Q3';
      bot.sendMessage(chatId, 'Станок нуждается в обслуживании? (ДА/НЕТ)');
      break;

    case 'Q3':
      state.data.q3 = text;
      state.step = 'A1';
      bot.sendMessage(chatId, 'Укажите пробег станка:');
      break;

    case 'A1':
      state.data.a1 = text;
      state.step = 'A2';
      bot.sendMessage(chatId, 'Сколько кнопок работает?');
      break;

    case 'A2':
      state.data.a2 = text;
      state.step = 'A3';
      bot.sendMessage(chatId, 'Сколько см рабочее поле?');
      break;

    case 'A3':
      state.data.a3 = text;

      const d = state.data;

      // Формируем отчёт
      const report = `📋 Отчёт по станку\n\n` +
                     `👤 ФИО: ${d.fio}\n` +
                     `📅 Дата: ${d.date}\n` +
                     `⚙️ Станок: ${d.machine}\n\n` +
                     `1️⃣ Работает: ${d.q1}\n` +
                     `2️⃣ Откалиброван: ${d.q2}\n` +
                     `3️⃣ Обслуживание: ${d.q3}\n\n` +
                     `Пробег: ${d.a1}\n` +
                     `Кнопок работает: ${d.a2}\n` +
                     `Рабочее поле: ${d.a3} см`;

      // Отправляем руководителю
      bot.sendMessage(ADMIN_CHAT_ID, report);

      // Подтверждение сотруднику
      bot.sendMessage(chatId, '✅ Отчёт отправлен руководителю. Спасибо!');

      // Очистка состояния пользователя
      delete userState[chatId];
      break;
  }
});
