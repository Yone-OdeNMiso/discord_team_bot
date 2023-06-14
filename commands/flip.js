const {SlashCommandBuilder} = require('discord.js');
const fs = require("node:fs");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('flip')
        .setDescription('選択権を割り当てるコインフリップを行います'),
    async execute(interaction) {
        interaction.channel.send(interaction.user.toString() + 'さんからコインフリップを受け付けました。');
        if (Math.floor(Math.random() * 2)) {
            interaction.channel.send(
                '結果：表\n' +
                interaction.user.toString() + 'さんのチームは「先行」「後攻」を選んでください。'
            );
        } else {
            interaction.channel.send(
                '結果：裏\n' +
                '退散相手のチームは「先行」「後攻」を選んでください。'
            );
        }
        const data = new Date().toLocaleString('ja-JP',) +
            ' コインフリップを行いました' +
            ' [Command:manotoss, User:' + interaction.user.username + ' #' + interaction.user.discriminator + ']'
        fs.writeFile("logs/bot.log", data + '\n', {flag: 'a'}, (err) => {
            if (err) throw err;
            console.log(data);
        })
        interaction.reply({content:'コインフリップを行います',ephemeral: true});
    },
};
