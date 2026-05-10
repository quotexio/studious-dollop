const TelegramBot = require('node-telegram-bot-api');
const token = process.env.BOT_TOKEN; // Fly.io Secrets থেকে আসবে
const bot = new TelegramBot(token, {polling: true});

bot.onText(/\/start/, (msg) => {
    const opts = {
        reply_markup: {
            keyboard: [
                [{ text: "📞 আমার ফোন ও আইডি", request_contact: true }],
                [{ text: "🔍 অন্য আইডি খুঁজুন", request_user: { request_id: 1 } }]
            ],
            resize_keyboard: true
        },
        parse_mode: "Markdown"
    };
    bot.sendMessage(msg.chat.id, "🚀 **বট সচল আছে!**\n\nনিচের বাটনগুলো ব্যবহার করুন বা Username পাঠান।", opts);
});

bot.on('contact', (msg) => {
    let res = `✅ **আপনার তথ্য:**\n🆔 আইডি: \`${msg.contact.user_id}\`\n📞 ফোন: \`${msg.contact.phone_number}\`\n👤 নাম: ${msg.contact.first_name}`;
    bot.sendMessage(msg.chat.id, res, {parse_mode: "Markdown"});
});

bot.on('message', async (msg) => {
    if (msg.text && !msg.text.startsWith('/') && !msg.contact) {
        try {
            const data = await bot.getChat(msg.text);
            let dc = data.photo ? "Available" : "অজানা";
            let res = `🔍 **তথ্য পাওয়া গেছে:**\n🆔 আইডি: \`${data.id}\`\n👤 নাম: ${data.first_name}\n🌍 DC: ${dc}\n\n🛡 @qxabir`;
            bot.sendMessage(msg.chat.id, res, {parse_mode: "Markdown"});
        } catch (e) {
            bot.sendMessage(msg.chat.id, "❌ আইডি পাওয়া যায়নি।");
        }
    }
});
