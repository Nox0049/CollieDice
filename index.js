// index.js
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

require("dotenv").config();
const token = process.env.DISCORD_TOKEN;

// character_data.json 불러오기
let characterData = {};
try {
  const data = fs.readFileSync('./character_data.json');
  characterData = JSON.parse(data);
} catch (err) {
  console.error('❗ 캐릭터 데이터 로드 실패:', err);
}

client.once('ready', () => {
  console.log('✅ CollieDice 온라인!');
});

client.on('messageCreate', message => {
  if (message.author.bot) return;
  const userId = message.author.id;

  // 판정 함수
  function rollDice(statKey, label) {
    const userName = Object.keys(characterData).find(name => message.content.includes(name));
    if (!userName || !characterData[userName]) {
      message.channel.send('❗ 캐릭터 이름을 포함해서 메시지를 보내주세요. 예: `콜린 백스터 !숙련판정`');
      return;
    }

    const data = characterData[userName];
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
      `🎲 ${label} 판정 결과 (${userName})\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${data[statKey]}\n<<결과: ${total}>>\n${resultText}`
    );
  }

  // 판정 명령어
  if (message.content.includes('!숙련판정')) {
    rollDice('skill', '숙련');
    return;
  }

  if (message.content.includes('!간섭판정')) {
    rollDice('interfere', '간섭');
    return;
  }

  if (message.content.includes('!수용판정')) {
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
    const userName = Object.keys(characterData).find(name => message.content.includes(name));
    if (!userName || !characterData[userName]) {
      message.channel.send('❗ 캐릭터 이름을 포함해서 메시지를 보내주세요. 예: `콜린 백스터 !랜덤메뉴`');
      return;
    }

    const interfere = characterData[userName].interfere ?? 0;
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
      `🎲 랜덤메뉴 결과 (${userName})\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${interfere}\n<<결과: ${total}>>\n${resultText}\n🍱 오늘의 메뉴는: ${selectedMenu}`
    );
    return;
  }
});

client.login(token);
