const TelegramBot = require('node-telegram-bot-api');
const express = require('express')
const cors = require('cors')

const token = '5648263836:AAFiXI0CHD-BxOkTUc_2b_VYO0KQbHONRnc'
const webAppUrl = 'https://frabjous-flan-87530c.netlify.app'

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json())
app.use(cors())

const parseJsonData = (data) => {
    if (!data) return null
    try {
        return JSON.parse(data)
    } catch (e) {
        console.log(e)
    }
    return null
}

const onMessageCallback = async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text


    const startKeyboard = {
        reply_markup: {
            keyboard: [
                [{text: 'Заполнить форму', web_app: {url: webAppUrl + "/form"}}]
            ]
        }
    }

    const data = parseJsonData(msg?.web_app_data?.data)

    if (data) {
        await bot.sendMessage(chatId, 'Спасибо за обратную связь')
        await bot.sendMessage(chatId, `Ваша страна: ${data?.country}`)
        await bot.sendMessage(chatId, `Ваш город: ${data?.city}`)
        setTimeout(async ()=>{ await bot.sendMessage(chatId, `Всю информацию вы получите в этом чате`)}, 3000)
    }

    const startInlineKeyboard = {
        reply_markup: {
            inline_keyboard: [
                [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
            ]
        }
    }


    const commands = {
        '/start': async () => {
            await bot.sendMessage(chatId, 'Ниже появится кнопа, заполни форму ', startKeyboard)
            await bot.sendMessage(chatId, 'Заходи в наш интернет магазин ', startInlineKeyboard)
        },
        '/line': async () => await bot.sendMessage(chatId, 'Ниже появится кнопа, заполни форму ', startInlineKeyboard),
        'echo': async (text) => {
            if(text) await bot.sendMessage(chatId, 'echo: ' + text)
        },

        run(key) {
            (this[key] || this['echo'])(text)
        }
    }

    commands.run(text)
}


bot.on('message', onMessageCallback);

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))



