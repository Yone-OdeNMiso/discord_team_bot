const {token, playerRoleName, adminRoleName} = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const {GatewayIntentBits, Partials} = require('discord.js');
const {
    Client,
    Collection,
    GatewayIntentBits: {
        Guilds,
        GuildMessages,
        MessageContent,
        GuildMessageReactions,
        GuildMembers
    },
    Partials: {
        Message,
        Channel,
        Reaction
    }
} = require("discord.js");
// import { Client, GatewayIntentBits } from "discord.js";
// const { Guilds, GuildMessages, MessageContent } = GatewayIntentBits;
const options = {
    intents: [Guilds, GuildMessages, MessageContent, GuildMessageReactions, GuildMembers],
    partials: [Message, Channel, Reaction],
};
const client = new Client(options);

client.once('ready', () => {
    console.log(`${client.user.tag} Ready`);
});

const prefix = '!';
let checkinMessageId = null;
let isCheckin = false;

/*リアクション周り*/
client.on('messageReactionAdd', async (reaction, user) => {
    if (user.bot) {
        return
    }
    const message = reaction.message

    /*チェックイン中かつチェックイン用メッセージの場合*/
    if (isCheckin && message.id === checkinMessageId) {
        const member = message.guild.members.resolve(user)
        if (reaction.emoji.name === '✅') {
            const playerRole = message.guild.roles.cache.find(role => role.name === playerRoleName);
            if (playerRole) {
                await member.roles.add(playerRole);
            } else {
                const data = new Date().toLocaleString('ja-JP',) +
                    ' ロールが見つかりません' +
                    ' [Command:manocsロール追加, User:' + user.username + ' #' + user.discriminator + ']';
                fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                    if (err) throw err;
                    console.error(data);
                })
            }
        }
    }
});

/*メッセージ周り*/
client.on('messageCreate', async message => {
    if (message.author.bot) {
        return;
    }
    if (!message.content.startsWith(prefix)) return
    /*コマンドと引数を取得*/
    const [command, ...args] = message.content.slice(prefix.length).split(/\s+/)

    /*管理者ロール*/
    const adminRole = message.guild.roles.cache.find(role => role.name === adminRoleName);

    /*メッセージを送った人*/
    const member = message.guild.members.resolve(message.author)

    async function isNotAdmin(message) {
        if (!member.roles.cache.has(adminRole.id)) {
            await message.delete();
            const data = new Date().toLocaleString('ja-JP',) +
                ' 管理者権限がありません' +
                ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']';
            fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                if (err) throw err;
                console.error(data);
            })
            return 1;
        }
    }

    /*チェックインスタート*/
    if (command === 'cstart') {
        /*管理者権限がない場合エラー*/
        if (await isNotAdmin(message)) {
            return;
        }

        /*チェックイン中の場合エラー*/
        if (isCheckin) {
            await message.delete();
            const data = new Date().toLocaleString('ja-JP',) +
                ' チェックインは既に開始しています' +
                ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
            fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                if (err) throw err;
                console.error(data);
            })
            return;
        }
        /*チェックイン開始メッセージ*/
        const sent = await message.channel.send(
            'チェックインを開始しました！\n' +
            '下記スタンプの✅を押すだけでチェックイン完了！'
        );
        checkinMessageId = sent.id;
        isCheckin = true;
        await sent.react('✅')
        await message.delete();
        const data = new Date().toLocaleString('ja-JP',) +
            ' チェックインを開始しました' +
            ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
        fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
            if (err) throw err;
            console.log(data);
        })
    }

    /*チェックインクローズ*/
    if (command === 'cclose') {
        /*管理者権限を持っていない場合エラー*/
        if (await isNotAdmin(message)) {
            return;
        }
        /*チェックイン中じゃない場合エラー*/
        if (!isCheckin) {
            await message.delete();
            const data = new Date().toLocaleString('ja-JP',) +
                ' チェックインが開始していません' +
                ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
            fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                if (err) throw err;
                console.error(data);
            })
            return;
        }
        /*引数が1以上の数値じゃない場合エラー*/
        let numOfTeamMembers = Number(args[0]);
        if (Number.isNaN(numOfTeamMembers) || numOfTeamMembers < 1) {
            await message.delete();
            const data = new Date().toLocaleString('ja-JP',) +
                ' 引数が間違っています' +
                ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
            fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                if (err) throw err;
                console.error(data);
            })
            return;
        }
        isCheckin = false;
        const playerRole = message.guild.roles.cache.find(role => role.name === playerRoleName);
        if (!playerRole) {
            const data = new Date().toLocaleString('ja-JP',) +
                ' ロールが見つかりません' +
                ' [Command:チェックイン, User:' + user.username + ' #' + user.discriminator + ']';
            fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                if (err) throw err;
                console.error(data);
            })
        }
        /*参加者メンバーのIDを取得*/
        let memberIds = [];
        await message.guild.members.fetch().then(members => {
            members.forEach(function (member) {
                if (member.roles.cache.has(playerRole.id)) {
                    console.log(member.user.id);
                    memberIds.push(member.user.id)
                }
            })
        });

        /*参加者メンバーのIDをシャッフル*/
        for (let i = memberIds.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1));
            let tmp = memberIds[i];
            memberIds[i] = memberIds[j];
            memberIds[j] = tmp;
        }

        /*チームを振り分け*/
        let teamAIds = [];
        let teamBIds = [];
        let numOfMembers = memberIds.length < numOfTeamMembers * 2 ? memberIds.length : numOfTeamMembers * 2
        if (numOfMembers % 2 === 1) {
            numOfMembers--;
        }
        for (let i = 0; i < numOfMembers; i++) {
            if (i % 2 === 0) {
                teamAIds.push(memberIds[i]);
            } else {
                teamBIds.push(memberIds[i]);
            }
        }

        await message.channel.send(
            'チェックインを終了しました。'
        );

        /*振り分けた結果をチャットで通知*/
        let sendMessage = 'チーム振り分けの結果\n' +
            'チームAのメンバーは\n';
        teamAIds.forEach(function (id) {
            sendMessage += '<@' + id + '>\n'
        })
        sendMessage += 'チームBのメンバーは\n'
        teamBIds.forEach(function (id) {
            sendMessage += '<@' + id + '>\n'
        })
        sendMessage += 'となりました。\n'
        await message.channel.send(sendMessage)

        await message.delete();
        const data = new Date().toLocaleString('ja-JP',) +
            ' チェックインを終了しました' +
            ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
        fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
            if (err) throw err;
            console.log(data);
        })
    }

    /*ロールリセット*/
    if (command === 'rreset') {
        /*管理者権限を持っていない場合エラー*/
        if (await isNotAdmin(message)) {
            return;
        }
        /*チェックイン中の場合エラー*/
        if (isCheckin) {
            await message.delete();
            const data = new Date().toLocaleString('ja-JP',) +
                ' チェックイン中です' +
                '[Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
            fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
                if (err) throw err;
                console.error(data);
            })
            return;
        }
        const playerRole = message.guild.roles.cache.find(role => role.name === playerRoleName);

        message.guild.members.fetch().then(members => {
            members.forEach(function (member) {
                if (member.roles.cache.has(playerRole.id)) {
                    member.roles.remove(playerRole.id)
                }
            })
        });
        await message.delete();
        const data = new Date().toLocaleString('ja-JP',) +
            ' ロールをリセットしました' +
            ' [Command:' + command + ', User:' + message.author.username + ' #' + message.author.discriminator + ']'
        fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
            if (err) throw err;
            console.log(data);
        })
    }
});


//Discordへの接続
client.login(token);

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`${filePath} に必要な "data" か "execute" がありません。`);
    }
}

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`${interaction.commandName} が見つかりません。`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'エラーが発生しました。', ephemeral: true});
    }
});
