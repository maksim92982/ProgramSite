export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Разрешаем только POST запросы
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body = await req.json();
    const { name, phone, email, siteType, message, timestamp } = body;

    // Валидация
    if (!name || !phone || !siteType || !message) {
      return new Response(
        JSON.stringify({ error: 'Заполните все обязательные поля' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Формируем сообщение для отправки
    const emailContent = `
Новая заявка с сайта!

 Информация о клиенте:
Имя: ${name}
Телефон: ${phone}
Email: ${email || 'Не указан'}

💼 Тип сайта: ${siteType}

📝 Описание задачи:
${message}

⏰ Время получения: ${timestamp}
    `.trim();

    // Отправка на email (используем mailto для простоты)
    // Для production лучше использовать nodemailer или сервис типа Resend
    const mailtoLink = `mailto:ma89spb@gmail.com?subject=${encodeURIComponent('Новая заявка с сайта')}&body=${encodeURIComponent(emailContent)}`;
    
    // Отправка уведомления в Telegram (опционально)
    // Для этого нужно создать бота в @BotFather и получить токен
    // const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    // const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    // if (telegramToken && telegramChatId) {
    //   await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       chat_id: telegramChatId,
    //       text: emailContent
    //     })
    //   });
    // }

    // Логирование (для отладки)
    console.log('New lead:', { name, phone, email, siteType, message });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Заявка успешно отправлена',
        mailtoLink 
      }),
      { 
        status: 200, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        } 
      }
    );
  } catch (error) {
    console.error('Error processing form:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        } 
      }
    );
  }
}

// Обработка OPTIONS запроса (CORS preflight)
export async function OPTIONS(req) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

