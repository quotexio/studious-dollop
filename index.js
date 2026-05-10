// ১. প্রয়োজনীয় মডিউল ইমপোর্ট করা
const http = require('http');
const TelegramBot = require('node-telegram-bot-api');

// ২. Fly.io-র জন্য ডামি সার্ভার (এটি সবার উপরে থাকবে যাতে টাইমআউট এরর না আসে)
const port = process.env.PORT || 8080;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Bot is running safely!\n');
}).listen(port, () => {
    console.log(`Web server is listening on port ${port}`);
});

// ৩. টেলিগ্রাম বটের টোকেন এবং সেটিংস
const token = process.env.BOT_TOKEN; 
if (!token) {
    console.error("Error: BOT_TOKEN is missing in environment variables!");
    process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// ৪. স্টার্ট কমান্ডের লজিক
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

// ৫. নিজের ফোন নম্বর শেয়ার করলে যা হবে
bot.on('contact', (msg) => {
    let res = `✅ **আপনার তথ্য:**\n` +
              `----------------------\n` +
              `🆔 আইডি: \`${msg.contact.user_id}\`\n` +
              `📞 ফোন: \`${msg.contact.phone_number}\`\n` +
              `👤 নাম: ${msg.contact.first_name}`;
    bot.sendMessage(msg.chat.id, res, { parse_mode: "Markdown" });
});

// ৬. ইউজার শেয়ার বা মেসেজ পাঠালে যা হবে
bot.on('message', async (msg) => {
    // যদি মেসেজটি কমান্ড না হয় এবং কন্টাক্ট না হয়
    if (msg.text && !msg.text.startsWith('/') && !msg.contact) {
        try {
            const data = await bot.getChat(msg.text);
            let dc = (data.photo && data.photo.dc_id) ? data.photo.dc_id : "Unknown";
            let name = data.first_name + (data.last_name ? " " + data.last_name : "");
            
            let res = `🔍 **তথ্য পাওয়া গেছে:**\n` +
                      `----------------------\n` +
                      `🆔 আইডি: \`${data.id}\`\n` +
                      `👤 নাম: ${name}\n` +
                      `🌍 DC: ${dc}\n\n` +
                      `🛡 @qxabir`;
            
            bot.sendMessage(msg.chat.id, res, { parse_mode: "Markdown" });
        } catch (e) {
            bot.sendMessage(msg.chat.id, "❌ ইউজার বা আইডি পাওয়া যায়নি। সঠিক তথ্য দিন।");
        }
    }
});

// ৭. বাটন থেকে ইউজার শেয়ার হলে তা ট্রিগার করা
bot.on('user_shared', (msg) => {
    if (msg.user_shared && msg.user_shared.user_id) {
        // শেয়ার করা আইডি দিয়ে মেসেজ লজিক ট্রিগার করা
        bot.emit('message', { chat: msg.chat, text: msg.user_shared.user_id.toString() });
    }
});
