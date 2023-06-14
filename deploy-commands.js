const {REST, Routes} = require('discord.js');
const {clientId, guildId, token} = require('./config.json');
const fs = require('node:fs');

const commands = [];
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

/*commandsディレクトリ以下のjsファイルを1つずつ読み込む*/
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
}

const rest = new REST({version: '10'}).setToken(token);

/*読み込んだファイル分だけBotにアプリケーションコマンドとして登録する*/
(async () => {
    try {
        console.log(`${commands.length} 個のアプリケーションコマンドを登録します。`);

        const data = await rest.put(
            /*Botへの登録用*/
            // Routes.applicationCommands(clientId),
            /*サーバーへの登録(開発用)*/
            Routes.applicationGuildCommands(clientId, guildId),
            {body: commands},
        );

        console.log(`${data.length} 個のアプリケーションコマンドを登録しました。`);
    } catch (error) {
        console.error(error);
    }
})();
