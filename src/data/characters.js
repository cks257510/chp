export const CHARACTER_LIST = [
  {
    id: 'luffy',
    name: '루피',
    englishName: 'Luffy',
    image: 'assets/skins/Luffy.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '고무고무', image: 'assets/skills/GumGum.png', description: '전방으로 길게 뻗는 충격파를 발사합니다.' },
    ultimate: { name: '고무고무', image: 'assets/skills/GumGum.png', description: '고무고무 연타가 터지며 큰 피해를 줍니다.' },
    baseStats: { attack: 94, hp: 1020, gauge: 100 },
    shopPrice: 2600,
    rarity: '희귀'
  },
  {
    id: 'zoro',
    name: '조로',
    englishName: 'Zoro',
    image: 'assets/skins/Zoro.png',
    role: '근접',
    classType: 'control',
    attackType: 'melee',
    skill1: { name: '호랑이 사냥', image: 'assets/skills/TigerHunt.png', description: '검기를 크게 그리며 전진합니다.' },
    ultimate: { name: '호랑이 사냥', image: 'assets/skills/TigerHunt.png', description: '넓은 범위에 호랑이 사냥을 난사합니다.' },
    baseStats: { attack: 106, hp: 1100, gauge: 100 },
    shopPrice: 2900,
    rarity: '희귀'
  },
  {
    id: 'sanji',
    name: '상디',
    englishName: 'Sanji',
    image: 'assets/skins/Sanji.png',
    role: '근접',
    classType: 'control',
    attackType: 'melee',
    skill1: { name: '디아블 킥', image: 'assets/skills/Forearm.png', description: '빠른 연속 킥을 가합니다.' },
    ultimate: { name: '연속 킥', image: 'assets/skills/Forearm.png', description: '적을 쫓아가며 연속 킥을 날립니다.' },
    baseStats: { attack: 101, hp: 1080, gauge: 100 },
    shopPrice: 2800,
    rarity: '희귀'
  },
  {
    id: 'blitzcrank',
    name: '블리츠크랭크',
    englishName: 'Blitzcrank',
    image: 'assets/skins/Blitzcrank.png',
    role: '원거리',
    classType: 'auto',
    attackType: 'projectile',
    skill1: { name: '그랩', image: 'assets/skills/Grab.png', description: '그랩으로 적을 끌어옵니다.' },
    ultimate: { name: '그랩', image: 'assets/skills/Grab.png', description: '난사되는 그랩이 적을 강하게 휘감습니다.' },
    baseStats: { attack: 90, hp: 1160, gauge: 100 },
    shopPrice: 2500,
    rarity: '희귀'
  },
  {
    id: 'choijun',
    name: '최준',
    englishName: 'ChoiJun',
    image: 'assets/skins/ChoiJun.png',
    role: '근접',
    classType: 'control',
    attackType: 'melee',
    skill1: { name: '근성 러시', image: 'assets/skills/Forearm.png', description: '근성으로 밀어붙이며 연속 타격합니다.' },
    ultimate: { name: '근성 폭발', image: 'assets/skills/Forearm.png', description: '짧은 시간 공격력이 크게 상승합니다.' },
    baseStats: { attack: 98, hp: 1120, gauge: 100 },
    shopPrice: 2400,
    rarity: '일반'
  },
  {
    id: 'yoonsung',
    name: '윤성',
    englishName: 'YoonSung',
    image: 'assets/skins/YoonSung.png',
    role: '근접',
    classType: 'auto',
    attackType: 'melee',
    skill1: { name: '팔뚝', image: 'assets/skills/Forearm.png', description: '팔뚝 일격으로 적을 밀어냅니다.' },
    ultimate: { name: '팔뚝', image: 'assets/skills/Forearm.png', description: '강한 일격이 연속으로 발동됩니다.' },
    baseStats: { attack: 100, hp: 1140, gauge: 100 },
    shopPrice: 2500,
    rarity: '일반'
  },
  {
    id: 'zed',
    name: '제드',
    englishName: 'Zed',
    image: 'assets/skins/Zed.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '표창', image: 'assets/skills/Shuriken.png', description: '표창을 던져 적을 공격합니다.' },
    ultimate: { name: '표창', image: 'assets/skills/Shuriken.png', description: '표창 난사가 무작위로 날아다닙니다.' },
    baseStats: { attack: 105, hp: 1000, gauge: 100 },
    shopPrice: 3000,
    rarity: '에픽'
  },
  {
    id: 'taric',
    name: '타릭',
    englishName: 'Taric',
    image: 'assets/skins/Taric.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '타릭기절', image: 'assets/skills/TaricStun.png', description: '보석 광선으로 기절을 유발합니다.' },
    ultimate: { name: '타릭기절', image: 'assets/skills/TaricStun.png', description: '기절 광선이 적을 연속 타격합니다.' },
    baseStats: { attack: 92, hp: 1180, gauge: 100 },
    shopPrice: 2700,
    rarity: '희귀'
  },
  {
    id: 'batohtani',
    name: '빠따는 오타니',
    englishName: 'BatOhtani',
    image: 'assets/skins/BatOhtani.png',
    role: '원거리',
    classType: 'auto',
    attackType: 'projectile',
    skill1: { name: '빠따', image: 'assets/skills/Bat.png', description: '빠따 스윙으로 궤적 피해를 줍니다.' },
    ultimate: { name: '빠따', image: 'assets/skills/Bat.png', description: '5초간 빠따가 원형으로 회전하며 적을 타격합니다.' },
    baseStats: { attack: 108, hp: 1040, gauge: 100 },
    shopPrice: 3400,
    rarity: '에픽'
  },
  {
    id: 'ngannou',
    name: '은가누',
    englishName: 'Ngannou',
    image: 'assets/skins/Ngannou.png',
    role: '근접',
    classType: 'auto',
    attackType: 'melee',
    skill1: { name: '헤비펀치', image: 'assets/skills/Forearm.png', description: '강한 헤비펀치로 돌진합니다.' },
    ultimate: { name: '파워 러시', image: 'assets/skills/Forearm.png', description: '파워 러시가 자동으로 이어집니다.' },
    baseStats: { attack: 112, hp: 1200, gauge: 100 },
    shopPrice: 3600,
    rarity: '에픽'
  },
  {
    id: 'duolingo',
    name: '듀오링고',
    englishName: 'Duolingo',
    image: 'assets/skins/Duolingo.png',
    role: '원거리',
    classType: 'auto',
    attackType: 'projectile',
    skill1: { name: '알림 폭격', image: 'assets/skills/Grab.png', description: '도망갈 수 없는 추적 공격.' },
    ultimate: { name: '집요한 추적', image: 'assets/skills/Grab.png', description: '집요한 추적체가 적을 따라갑니다.' },
    baseStats: { attack: 88, hp: 1220, gauge: 100 },
    shopPrice: 2300,
    rarity: '일반'
  },
  {
    id: 'spiderman',
    name: '스파이더맨',
    englishName: 'SpiderMan',
    image: 'assets/skins/SpiderMan.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '거미줄', image: 'assets/skills/SpiderWeb.png', description: '거미줄을 발사해 적을 묶습니다.' },
    ultimate: { name: '거미줄', image: 'assets/skills/SpiderWeb.png', description: '거미줄 폭격이 적을 제압합니다.' },
    baseStats: { attack: 97, hp: 1070, gauge: 100 },
    shopPrice: 3100,
    rarity: '에픽'
  },
  {
    id: 'hulk',
    name: '헐크',
    englishName: 'Hulk',
    image: 'assets/skins/Hulk.png',
    role: '근접',
    classType: 'auto',
    attackType: 'melee',
    skill1: { name: '분노 강타', image: 'assets/skills/Forearm.png', description: '거대한 주먹으로 강하게 내리칩니다.' },
    ultimate: { name: '헐크 스매시', image: 'assets/skills/Forearm.png', description: '짧은 시간 광역 강타를 반복합니다.' },
    baseStats: { attack: 114, hp: 1300, gauge: 100 },
    shopPrice: 3800,
    rarity: '전설'
  },
  {
    id: 'hashirama',
    name: '하시라마',
    englishName: 'Hashirama',
    image: 'assets/skins/Hashirama.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '목둔 창', image: 'assets/skills/ThousandHands.png', description: '목둔 창을 무작위로 날립니다.' },
    ultimate: { name: '천수관음', image: 'assets/skills/ThousandHands.png', description: '천수관음 이미지가 무작위로 날아다니며 큰 피해를 줍니다.' },
    baseStats: { attack: 120, hp: 1200, gauge: 100 },
    shopPrice: 4200,
    rarity: '전설'
  },
  {
    id: 'madara',
    name: '마다라',
    englishName: 'Madara',
    image: 'assets/skins/Madara.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '화염탄', image: 'assets/skills/Susanoo.png', description: '강한 화염탄을 발사합니다.' },
    ultimate: { name: '스사노오', image: 'assets/skills/Susanoo.png', description: '스사노오 이미지가 무작위로 날아다니며 큰 피해를 줍니다.' },
    baseStats: { attack: 122, hp: 1180, gauge: 100 },
    shopPrice: 4300,
    rarity: '전설'
  },
  {
    id: 'kakashi',
    name: '카카시',
    englishName: 'Kakashi',
    image: 'assets/skins/Kakashi.png',
    role: '원거리',
    classType: 'control',
    attackType: 'projectile',
    skill1: { name: '뇌절', image: 'assets/skills/Chidori.png', description: '뇌절 돌진으로 적에게 접근합니다.' },
    ultimate: { name: '뇌절', image: 'assets/skills/Chidori.png', description: '뇌절이 연속 발동하며 적을 추격합니다.' },
    baseStats: { attack: 109, hp: 1090, gauge: 100 },
    shopPrice: 3350,
    rarity: '에픽'
  }
];

export const CHARACTER_MAP = Object.fromEntries(CHARACTER_LIST.map((character) => [character.id, character]));

export const RANK_TIERS = ['브론즈', '실버', '골드', '플레티넘', '다이아'];

export const getRandomCharacterId = (excludeIds = []) => {
  const available = CHARACTER_LIST.filter((character) => !excludeIds.includes(character.id));
  const list = available.length ? available : CHARACTER_LIST;
  return list[Math.floor(Math.random() * list.length)].id;
};

export const getTierFromPoints = (points = 0) => {
  const tierIndex = Math.min(RANK_TIERS.length - 1, Math.floor(Math.max(points, 0) / 50));
  return RANK_TIERS[tierIndex];
};
