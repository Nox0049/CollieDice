const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

require("dotenv").config();

const token = process.env.DISCORD_TOKEN;
const characterData = {};


client.once('ready', () => {
  console.log('✅ CollieDice 온라인!');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  // 캐릭터 등록
  if (message.content.startsWith('!등록 ')) {
    const name = message.content.slice(4).trim();
    if (!name) {
      message.channel.send('❗ 사용법: `!등록 캐릭터이름`');
      return;
    }

    characterData[userId] = {
      name,
      skill: 0,
      interfere: 0,
      accept: 0
    };

    message.channel.send(`✅ ${name} 캐릭터가 등록되었습니다!`);
    return;
  }

  // 능력치 설정 함수
  if (/^!숙련\s+\d+$/.test(message.content)) {
    const [, valueStr] = message.content.split(' ');
    const value = parseInt(valueStr);
    if (!characterData[userId]) {
      message.channel.send('❗ 먼저 `!등록 캐릭터이름`으로 캐릭터를 등록해주세요.');
    } else {
      characterData[userId].skill = value;
      message.channel.send(`✅ 숙련 수치가 ${value}으로 설정되었습니다.`);
    }
    return;
  }

  if (/^!간섭\s+\d+$/.test(message.content)) {
    const [, valueStr] = message.content.split(' ');
    const value = parseInt(valueStr);
    if (!characterData[userId]) {
      message.channel.send('❗ 먼저 `!등록 캐릭터이름`으로 캐릭터를 등록해주세요.');
    } else {
      characterData[userId].interfere = value;
      message.channel.send(`✅ 간섭 수치가 ${value}으로 설정되었습니다.`);
    }
    return;
  }

  if (/^!수용\s+\d+$/.test(message.content)) {
    const [, valueStr] = message.content.split(' ');
    const value = parseInt(valueStr);
    if (!characterData[userId]) {
      message.channel.send('❗ 먼저 `!등록 캐릭터이름`으로 캐릭터를 등록해주세요.');
    } else {
      characterData[userId].accept = value;
      message.channel.send(`✅ 수용 수치가 ${value}으로 설정되었습니다.`);
    }
    return;
  }

  // 판정 함수
  function rollDice(statKey, label) {
    if (!characterData[userId]) {
      message.channel.send('❗ 등록된 캐릭터가 없습니다. `!등록 캐릭터이름`으로 먼저 등록해주세요.');
      return;
    }

    const data = characterData[userId];
    const dice = () => Math.floor(Math.random() * 3) - 1;
    const rolls = [dice(), dice(), dice(), dice()];
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + data[statKey];

    let resultText = '';
    if (total <= -4) resultText = '개같이실패';
    else if (total <= -1) resultText = '와장창';
    else if (total === 0) resultText = '엉성함';
    else if (total === 1) resultText = '약간의 실수';
    else if (total === 2) resultText = '무난함';
    else if (total === 3) resultText = '나이스!';
    else if (total <= 6) resultText = '굿쟙!';
    else resultText = '대성공!!';

    message.channel.send(
      `🎲 ${label} 판정 결과\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${data[statKey]}\n<<결과: ${total}>>\n${resultText}`
    );
  }

  // 명령어: 판정 실행
  if (message.content === '!숙련판정') {
    rollDice('skill', '숙련');
    return;
  }

  if (message.content === '!간섭판정') {
    rollDice('interfere', '간섭');
    return;
  }

  if (message.content === '!수용판정') {
    rollDice('accept', '수용');
    return;
  }
});

require('dotenv').config();
client.login(process.env.DISCORD_TOKEN);

