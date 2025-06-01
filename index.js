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

  // 능력치 설정
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
    if (total <= -3) resultText = '개같이실패';
    else if (total <= -1) resultText = '와장창';
    else if (total === 0) resultText = '엉성함';
    else if (total === 1) resultText = '약간의 실수';
    else if (total === 2) resultText = '무난함';
    else if (total === 3) resultText = '나이스!';
    else if (total <= 5) resultText = '굿쟙!';
    else resultText = '대성공!!';

    message.channel.send(
      `🎲 ${label} 판정 결과\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${data[statKey]}\n<<결과: ${total}>>\n${resultText}`
    );
  }

  // 판정 명령어
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

  // 단순 랜덤 메뉴
  if (message.content === '!메뉴') {
    const menuList = ["김치찌개", "초밥", "파스타", "치킨", "불고기", "된장찌개", "비빔밥", "라멘", "한우 스테이크", "랍스터 파스타", "초밥 정식", "장어덮밥", "매운탕", "연어뱃살돈부리", "육회비빔밥", "통새우와퍼", "등촌샤브칼국수", "하트가그려진오므라이스", "오이시쿠나레모에큥오믈렛", "서브웨이BLT샌드위치90cm", "채끝살짜파구리", "토핑5만원요아정", "추가금10만원마라탕"];
    const randomMenu = menuList[Math.floor(Math.random() * menuList.length)];
    message.channel.send(`🍽️ 오늘의 추천 메뉴는 ${randomMenu} 입니다!`);
    return;
  }

  // 간섭판정 기반 랜덤 메뉴
  if (message.content === '!랜덤메뉴') {
    if (!characterData[userId]) {
      message.channel.send('❗ 먼저 `!등록 캐릭터이름`으로 캐릭터를 등록해주세요.');
      return;
    }

    const interfere = characterData[userId].interfere ?? 0;
    const dice = () => Math.floor(Math.random() * 3) - 1;
    const rolls = [dice(), dice(), dice(), dice()];
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + interfere;

    const goodMenu = ["한우 스테이크", "랍스터 파스타", "초밥 정식", "장어덮밥", "매운탕", "연어뱃살돈부리", "육회비빔밥", "통새우와퍼", "등촌샤브칼국수", "하트가그려진오므라이스", "오이시쿠나레모에큥오믈렛", "서브웨이BLT샌드위치90cm", "채끝살짜파구리", "토핑5만원요아정", "추가금10만원마라탕"];
    const badMenu = ["치킨 목뼈", "불은 라면", "거지밥", "개밥", "편의점 도시락", "짬밥", "군대리아", "황천의뒤틀린■■튀김", "+9강 청동주괴맛탕", "심해의부패된멀록초밥", "거인포자튀김", "역병의구울살점피자", "신선한얼린녹은아이스크림", "강화된두꺼운가죽핫케이크", "콜리의망한오믈렛렛"];

    const selectedMenu = total >= 2
      ? goodMenu[Math.floor(Math.random() * goodMenu.length)]
      : badMenu[Math.floor(Math.random() * badMenu.length)];

    let resultText = '';
    if (total <= -3) resultText = '😵';
    else if (total <= -1) resultText = '😖';
    else if (total === 0) resultText = '😐';
    else if (total === 1) resultText = '🙂';
    else if (total === 2) resultText = '😋';
    else resultText = '🤩';

    message.channel.send(
      `🎲 랜덤메뉴 결과\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${interfere}\n<<결과: ${total}>>\n${resultText}\n🍱 오늘의 메뉴는: ${selectedMenu}`
    );
    return;
  }
});

// 로그인
client.login(token);
