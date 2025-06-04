// CollieDice 리팩토링: 디스코드 ID 기반 캐릭터 자동 인식
const fs = require('fs');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const token = process.env.DISCORD_TOKEN;
const CHARACTER_FILE = 'character_data.json';

// 캐릭터 데이터 불러오기
let characterData = {};
if (fs.existsSync(CHARACTER_FILE)) {
  characterData = JSON.parse(fs.readFileSync(CHARACTER_FILE, 'utf8'));
}

client.once('ready', () => {
  console.log('✅ CollieDice 온라인!');
});

// 주사위 판정 함수
function rollDice(userId, statKey, label, message) {
  const char = characterData[userId];
  if (!char) {
    message.channel.send('❗ 등록된 캐릭터가 없습니다. 관리자에게 문의하세요.');
    return;
  }

  const dice = () => Math.floor(Math.random() * 3) - 1;
  const rolls = [dice(), dice(), dice(), dice()];
  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + char[statKey];

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
    `🎲 ${char.name}의 ${label} 판정 결과\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${char[statKey]}\n<<결과: ${total}>>\n${resultText}`
  );
}

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const userId = message.author.id;

  if (message.content === '!숙련판정') {
    rollDice(userId, 'skill', '숙련', message);
    return;
  }

  if (message.content === '!간섭판정') {
    rollDice(userId, 'interfere', '간섭', message);
    return;
  }

  if (message.content === '!수용판정') {
    rollDice(userId, 'accept', '수용', message);
    return;
  }

  if (message.content === '!메뉴') {
    const menuList = ["김치찌개", "초밥", "파스타", "치킨", "불고기", "된장찌개", "비빔밥", "라멘"];
    const randomMenu = menuList[Math.floor(Math.random() * menuList.length)];
    message.channel.send(`🍽️ 오늘의 추천 메뉴는 ${randomMenu} 입니다!`);
    return;
  }

  if (message.content === '!랜덤메뉴') {
    const char = characterData[userId];
    if (!char) {
      message.channel.send('❗ 등록된 캐릭터가 없습니다. 관리자에게 문의하세요.');
      return;
    }

    const dice = () => Math.floor(Math.random() * 3) - 1;
    const rolls = [dice(), dice(), dice(), dice()];
    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + char.interfere;

    const goodMenu = [
      "한우 스테이크", "랍스터 파스타", "초밥 정식", "장어덮밥", "매운탕",
      "연어뱃살돈부리", "육회비빔밥", "통새우와퍼", "등촌샤브칼국수",
      "하트가그려진오므라이스", "오이시쿠나레모에큥오믈렛", "서브웨이BLT샌드위치90cm",
      "채끝살짜파구리", "토핑5만원요아정", "추가금10만원마라탕"
    ];
    const badMenu = [
      "치킨 목뼈", "불은 라면", "거지밥", "개밥", "편의점 도시락", "짬밥", "군대리아",
      "황천의뒤틀린■■튀김", "+9강 청동주괴맛탕", "심해의부패된멀록초밥", "거인포자튀김",
      "역병의구울살점피자", "신선한얼린녹은아이스크림", "강화된두꺼운가죽핫케이크",
      "콜리의망한오믈렛렛"
    ];

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
      `🎲 ${char.name}의 랜덤메뉴 결과\n${rolls.map((v, i) => `${i + 1}= ${v}`).join(', ')} // 합계: ${sum}\n보정: ${char.interfere}\n<<결과: ${total}>>\n${resultText}\n🍱 오늘의 메뉴는: ${selectedMenu}`
    );
    return;
  }

  // 아무 명령어에도 해당되지 않으면 무시
});
 
client.login(token);
