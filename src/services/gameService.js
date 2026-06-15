import { APP_CONFIG } from '../config.js';
import { CHARACTER_LIST, CHARACTER_MAP, getRandomCharacterId, getTierFromPoints } from '../data/characters.js';
import { MISSIONS } from '../data/missions.js';

export const nowIso = () => new Date().toISOString();
export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;

export const buildDefaultStats = () => ({
  kills: 0,
  damage: 0,
  survivalTime: 0,
  tankGames: 0,
  rankedWins: 0,
  rankedLosses: 0,
  rankedPointsControl: 0,
  rankedPointsAuto: 0,
  dungeonClears: 0,
  challengeWins: 0,
  totalMatches: 0,
});

export const buildDefaultPlayer = (nickname) => {
  const starter = getRandomCharacterId();
  return {
    id: uid('player'),
    nickname,
    title: APP_CONFIG.defaultTitle,
    logoText: nickname.slice(0, 2).toUpperCase(),
    gold: APP_CONFIG.defaultGold,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    activeCharacterId: starter,
    autoSquad: [starter],
    ownedCharacters: {
      [starter]: { level: 1, enhancement: 0, obtainedAt: nowIso() },
    },
    inventory: {
      characterPacks: 0,
      boostStones: 0,
      titleCoupons: 0,
    },
    items: {},
    missionsClaimed: {},
    devModeEnabled: false,
    dungeonRuns: 0,
    borrowCharacterAvailable: false,
    borrowedCharacterId: null,
    stats: buildDefaultStats(),
    meta: {
      lastViewedTab: 'main',
      controlWagerDefault: 10,
      autoWagerDefault: 10,
    },
  };
};

export const enrichPlayer = (player) => {
  if (!player) return null;
  const controlPoints = player?.stats?.rankedPointsControl || 0;
  const autoPoints = player?.stats?.rankedPointsAuto || 0;
  return {
    ...player,
    tierControl: getTierFromPoints(controlPoints),
    tierAuto: getTierFromPoints(autoPoints),
    activeCharacter: CHARACTER_MAP[player.activeCharacterId],
    autoCharacters: (player.autoSquad || []).map((id) => CHARACTER_MAP[id]).filter(Boolean),
    ownedCharacterObjects: Object.keys(player.ownedCharacters || {}).map((id) => ({
      ...(CHARACTER_MAP[id] || {}),
      ownership: player.ownedCharacters[id],
      id,
    })),
  };
};

export const listUnownedCharacters = (player) => CHARACTER_LIST.filter((character) => !player?.ownedCharacters?.[character.id]);

export const grantCharacter = (player, characterId) => {
  if (!player.ownedCharacters[characterId]) {
    player.ownedCharacters[characterId] = { level: 1, enhancement: 0, obtainedAt: nowIso() };
  }
  if (!player.activeCharacterId) player.activeCharacterId = characterId;
  if (!player.autoSquad?.length) player.autoSquad = [characterId];
  player.updatedAt = nowIso();
  return player;
};

export const openCharacterPack = (player) => {
  if (player.gold < APP_CONFIG.packPrice) {
    return { ok: false, reason: '골드가 부족합니다.' };
  }
  player.gold -= APP_CONFIG.packPrice;
  const unowned = listUnownedCharacters(player);
  const wonCharacter = (unowned.length ? unowned : CHARACTER_LIST)[Math.floor(Math.random() * (unowned.length ? unowned.length : CHARACTER_LIST.length))];
  grantCharacter(player, wonCharacter.id);
  player.updatedAt = nowIso();
  return { ok: true, character: wonCharacter, duplicate: !unowned.length };
};

export const buyCharacter = (player, characterId) => {
  const character = CHARACTER_MAP[characterId];
  if (!character) return { ok: false, reason: '존재하지 않는 캐릭터입니다.' };
  if (player.ownedCharacters[characterId]) return { ok: false, reason: '이미 보유한 캐릭터입니다.' };
  if (player.gold < character.shopPrice) return { ok: false, reason: '골드가 부족합니다.' };
  player.gold -= character.shopPrice;
  grantCharacter(player, characterId);
  return { ok: true, character };
};

export const getEnhancementCost = (currentEnhancement) => 800 + currentEnhancement * 450;
export const getEnhancementRate = (currentEnhancement) => Math.max(15, 100 - currentEnhancement * 9);

export const enhanceCharacter = (player, characterId) => {
  const ownership = player.ownedCharacters?.[characterId];
  if (!ownership) return { ok: false, reason: '보유하지 않은 캐릭터입니다.' };
  if (ownership.enhancement >= APP_CONFIG.maxEnhancement) return { ok: false, reason: '이미 최대 강화입니다.' };
  const cost = getEnhancementCost(ownership.enhancement);
  if (player.gold < cost) return { ok: false, reason: '골드가 부족합니다.' };
  player.gold -= cost;
  const rate = getEnhancementRate(ownership.enhancement);
  const success = Math.random() * 100 <= rate;
  if (success) {
    ownership.enhancement += 1;
  }
  player.updatedAt = nowIso();
  return { ok: true, success, cost, rate, enhancement: ownership.enhancement };
};

export const getCharacterPower = (player, characterId) => {
  const meta = player.ownedCharacters?.[characterId];
  const character = CHARACTER_MAP[characterId];
  if (!character) return 0;
  const level = meta?.level || 1;
  const enhancement = meta?.enhancement || 0;
  return character.baseStats.attack * 1.8 + character.baseStats.hp * 0.12 + level * 10 + enhancement * 35;
};

export const simulateRankedMatch = (player, mode = 'control') => {
  const characterIds = mode === 'control'
    ? [player.activeCharacterId]
    : [...new Set((player.autoSquad || []).slice(0, 2))];
  const teamPower = characterIds.reduce((sum, id) => sum + getCharacterPower(player, id), 0) || 1000;
  const enemyPower = 950 + Math.random() * 650 + (mode === 'auto' ? 250 : 0) + ((mode === 'control' ? player.stats.rankedPointsControl : player.stats.rankedPointsAuto) * 3);
  const variance = 0.85 + Math.random() * 0.3;
  const resultPower = teamPower * variance;
  const win = resultPower >= enemyPower;
  const pointsDelta = win ? randomRange(10, 15) : -randomRange(5, 7);
  const rewardGold = win ? APP_CONFIG.rankedRewardGold : 0;
  const damage = Math.floor(resultPower * (win ? 1.15 : 0.85));
  const kills = win ? (mode === 'auto' ? 2 : 1) : Math.random() > 0.6 ? 1 : 0;
  const survivalTime = win ? randomRange(95, 180) : randomRange(45, 140);

  player.gold += rewardGold;
  player.stats.totalMatches += 1;
  player.stats.damage += damage;
  player.stats.kills += kills;
  player.stats.survivalTime = Math.max(player.stats.survivalTime || 0, survivalTime);

  if (mode === 'control') {
    player.stats.rankedPointsControl = Math.max(0, player.stats.rankedPointsControl + pointsDelta);
  } else {
    player.stats.rankedPointsAuto = Math.max(0, player.stats.rankedPointsAuto + pointsDelta);
  }
  if (win) player.stats.rankedWins += 1;
  else player.stats.rankedLosses += 1;

  player.updatedAt = nowIso();
  return {
    mode,
    win,
    pointsDelta,
    rewardGold,
    kills,
    damage,
    survivalTime,
    nextTier: getTierFromPoints(mode === 'control' ? player.stats.rankedPointsControl : player.stats.rankedPointsAuto),
  };
};

export const simulateProfileChallenge = (player) => {
  if (player.gold < APP_CONFIG.challengeCost) return { ok: false, reason: '도전 골드가 부족합니다.' };
  player.gold -= APP_CONFIG.challengeCost;
  const teamPower = (player.autoSquad || []).slice(0, 2).reduce((sum, id) => sum + getCharacterPower(player, id), 0) || 1000;
  const enemyPower = 1200 + Math.random() * 700;
  const win = teamPower * (0.85 + Math.random() * 0.35) >= enemyPower;
  if (win) {
    player.gold += APP_CONFIG.challengeReward;
    player.stats.challengeWins += 1;
  }
  player.stats.totalMatches += 1;
  player.updatedAt = nowIso();
  return { ok: true, win, rewardGold: win ? APP_CONFIG.challengeReward : 0 };
};

export const simulateDungeon = (player) => {
  const teamIds = [...new Set((player.autoSquad || []).slice(0, 2))];
  const borrowedAvailable = player.borrowCharacterAvailable && player.borrowedCharacterId;
  if (teamIds.length < 2 && !borrowedAvailable) return { ok: false, reason: '오토모드용 캐릭터 2명이 필요합니다.' };
  if (teamIds.length < 2 && borrowedAvailable) teamIds.push(player.borrowedCharacterId);
  player.dungeonRuns += 1;
  const bossPower = 1800 + player.stats.dungeonClears * 110 + Math.random() * 350;
  const teamPower = teamIds.reduce((sum, id) => sum + getCharacterPower(player, id), 0);
  const win = teamPower * (0.88 + Math.random() * 0.28) >= bossPower;
  if (win) {
    player.gold += APP_CONFIG.dungeonReward;
    player.stats.dungeonClears += 1;
  }
  if (player.dungeonRuns % 5 === 0) {
    player.borrowCharacterAvailable = true;
    player.borrowedCharacterId = getRandomCharacterId(Object.keys(player.ownedCharacters || {}));
  }
  player.updatedAt = nowIso();
  return { ok: true, win, rewardGold: win ? APP_CONFIG.dungeonReward : 0, bossPower: Math.round(bossPower), teamIds };
};

export const claimMission = (player, missionId) => {
  const mission = MISSIONS.find((item) => item.id === missionId);
  if (!mission) return { ok: false, reason: '존재하지 않는 미션입니다.' };
  if (player.missionsClaimed?.[missionId]) return { ok: false, reason: '이미 수령했습니다.' };
  const progress = getMissionProgress(player, mission);
  if (progress < mission.target) return { ok: false, reason: '조건을 아직 달성하지 못했습니다.' };
  player.missionsClaimed = player.missionsClaimed || {};
  player.missionsClaimed[missionId] = { claimedAt: nowIso() };
  player.gold += mission.rewardGold;
  if (mission.rewardTitle) player.title = mission.rewardTitle;
  player.updatedAt = nowIso();
  return { ok: true, mission };
};

export const getMissionProgress = (player, mission) => {
  const stats = player.stats || {};
  switch (mission.type) {
    case 'kills': return stats.kills || 0;
    case 'damage': return stats.damage || 0;
    case 'survivalTime': return stats.survivalTime || 0;
    case 'rankedWins': return stats.rankedWins || 0;
    case 'dungeonClears': return stats.dungeonClears || 0;
    default: return 0;
  }
};

export const buildLeaderboardRows = (profiles = []) => {
  const base = profiles.map((item) => ({
    nickname: item.nickname,
    title: item.title,
    controlTier: getTierFromPoints(item.stats?.rankedPointsControl || 0),
    autoTier: getTierFromPoints(item.stats?.rankedPointsAuto || 0),
    kills: item.stats?.kills || 0,
    damage: item.stats?.damage || 0,
    tank: item.stats?.survivalTime || 0,
    tierScore: (item.stats?.rankedPointsControl || 0) + (item.stats?.rankedPointsAuto || 0),
  }));
  return {
    kills: [...base].sort((a, b) => b.kills - a.kills),
    damage: [...base].sort((a, b) => b.damage - a.damage),
    tank: [...base].sort((a, b) => b.tank - a.tank),
    tier: [...base].sort((a, b) => b.tierScore - a.tierScore),
  };
};

export const makePublicProfile = (player) => ({
  nickname: player.nickname,
  title: player.title,
  logoText: player.logoText,
  gold: player.gold,
  activeCharacterId: player.activeCharacterId,
  stats: player.stats || buildDefaultStats(),
  updatedAt: nowIso(),
});

export const buildRoom = ({ hostUid, hostPlayerId, hostNickname, mode, wager = 0 }) => ({
  id: uid('room'),
  mode,
  wager: Number(wager) || 0,
  hostUid,
  hostPlayerId,
  hostNickname,
  guestUid: null,
  guestPlayerId: null,
  guestNickname: null,
  status: '대기중',
  createdAt: nowIso(),
});

export const randomRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const clone = (value) => JSON.parse(JSON.stringify(value));
