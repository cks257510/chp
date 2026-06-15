export const APP_CONFIG = {
  gameName: 'Character PVP',
  defaultGold: 0,
  defaultTitle: '신입',
  nicknameMin: 2,
  nicknameMax: 15,
  devPin: '2359',
  packPrice: 500,
  rankedRewardGold: 50,
  challengeCost: 5,
  challengeReward: 6,
  dungeonReward: 50,
  maxPlayersPerAccount: 2,
  controlTimeLimitSeconds: 180,
  maxEnhancement: 10,
};

const baseConfig = {
  apiKey: 'AIzaSyAFHR-EgQ2zIIFTFQCHV3QzL3f2wh0U6Lc',
  authDomain: 'character1.firebaseapp.com',
  projectId: 'character1',
  storageBucket: 'character1.firebasestorage.app',
  messagingSenderId: '318457976976',
  appId: '1:318457976976:web:9e45fe2844fafff36ce015',
};

export const firebaseConfig = {
  ...baseConfig,
  databaseURL: baseConfig.databaseURL || `https://${baseConfig.projectId}-default-rtdb.firebaseio.com`,
};

export const PUBLIC_PATHS = {
  users: 'users',
  publicProfiles: 'publicProfiles',
  rooms: 'friendlyRooms',
};
