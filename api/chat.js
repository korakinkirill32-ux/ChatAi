export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    const { message } = req.body;
    if (!message) {
        return res.status(400).json({ error: 'Нет сообщения' });
    }

    const CLIENT_ID = '01a0348e-011f-7c46-bdad-0bf3d2848f4d';    // ЗАМЕНИТЕ!
    const SECRET_KEY = 'MDFhMDM0OGUtMDExZi03YzQ2LWJkYWQtMGJmM2QyODQ4ZjRkOmVlYmM3MGE5LTkyZGItNDY4MS1hOGVkLTc5MjVkNmI5NTJhMw==';  // ЗАМЕНИТЕ!
    const SCOPE = 'GIGACHAT_API_PERS';

    try {
        const auth = Buffer.from(`${CLIENT_ID}:${SECRET_KEY}`).toString('base64');
        const tokenRes = await fetch('https://ngw.devices.sberbank.ru:9443/api/v2/oauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
                'RqUID': crypto.randomUUID()
            },
            body: new URLSearchParams({ scope: SCOPE })
        });

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        const response = await fetch('https://gigachat.devices.sberbank.ru/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
                model: 'GigaChat',
                messages: [{ role: 'user', content: message }],
                temperature: 0.7,
                max_tokens: 1000
            })
        });

        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content || '❌ Ответ не получен';

        res.status(200).json({ reply });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
