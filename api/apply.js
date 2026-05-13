/**
 * Vercel Serverless Function: /api/apply
 * Получает данные формы заявки и пересылает в Telegram.
 *
 * Настройка:
 * 1. В Vercel Dashboard → Settings → Environment Variables добавьте:
 *    TG_BOT_TOKEN  — токен вашего бота (получить у @BotFather)
 *    TG_CHAT_ID    — chat_id куда слать сообщения (можно узнать через @userinfobot)
 * 2. Задеплойте проект — функция появится автоматически по пути /api/apply
 */

export default async function handler(req, res) {
  // CORS для локальной разработки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
  const TG_CHAT_ID   = process.env.TG_CHAT_ID;

  if (!TG_BOT_TOKEN || !TG_CHAT_ID) {
    console.error('Missing TG_BOT_TOKEN or TG_CHAT_ID env vars');
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  const d = req.body || {};

  const esc = (s) => String(s || '—').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]));

  const text = [
    '🎬 <b>Новая заявка — ТОКЕН: ФИЛЬМ</b>',
    '',
    `👤 <b>Имя:</b> ${esc(d.name)}`,
    `📞 <b>Телефон:</b> ${esc(d.phone)}`,
    `📧 <b>E-mail:</b> ${esc(d.email)}`,
    `💬 <b>Telegram/контакт:</b> ${esc(d.contact)}`,
    '',
    `🎥 <b>Фильм:</b> ${esc(d.film)}`,
    `⏱ <b>Хронометраж:</b> ${esc(d.duration)} мин`,
    `🏷 <b>Статус:</b> ${esc(d.status)}`,
    '',
    `📝 <b>Синопсис:</b> ${esc(d.synopsis)}`,
    `🤖 <b>ИИ-инструменты:</b> ${esc(d.ai_tools)}`,
    `🔗 <b>Ссылка на фильм:</b> ${esc(d.link)}`,
    '',
    `🕐 <b>Время заявки:</b> ${esc(d._timestamp)}`,
  ].join('\n');

  try {
    const tgRes = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TG_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    const tgData = await tgRes.json();
    if (!tgData.ok) {
      console.error('Telegram error:', tgData);
      return res.status(500).json({ error: 'Telegram error', detail: tgData.description });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Fetch error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
