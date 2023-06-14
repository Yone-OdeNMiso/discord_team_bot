## 動作環境
- Discord.js v14
- Nodejs v16~

## 設定ファイル

    cp config.json_original config.json
　

    {  
      "clientId": "DiscordBotのClientID",  
      "token": "DiscordBotのToken",  
      "guildId": "開発用のサーバーID(本番では不要)",  
      "playerRoleName": "参加者のロール名(一意であること)",  
      "adminRoleName": "管理者のロール名(一意であること)"
    }

## インストール
    npm install

    以下が入る
    npm install discord.js
    npm install @discordjs/builders  
    npm install @discordjs/rest
    npm install discord-api-types
    npm install pm2

## コマンドの登録
    node deploy-commands.js

## Botの起動(一時的)
    node index.js

## Botの起動(恒久的)
    pm2 start index.js
    pm2 save

