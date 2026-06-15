import { APP_CONFIG } from './config.js';
import { CHARACTER_LIST, getRandomCharacterId } from './data/characters.js';
import { render, renderModal } from './ui/render.js';
import {
  initFirebase,
  isFirebaseReady,
  watchAuth,
  signUpWithEmail,
  signInWithEmail,
  signOutUser,
  bootstrapAfterLogin,
  createPlayer as createPlayerRemote,
  setActivePlayerId,
  updatePlayer as updatePlayerRemote,
  deletePlayer as deletePlayerRemote,
  watchRooms,
  createRoom as createRoomRemote,
  updateRoom as updateRoomRemote,
  removeRoom as removeRoomRemote,
  watchPublicProfiles,
  getFriendlyAuthErrorMessage,
} from './services/firebaseService.js';
import {
  clone,
  enrichPlayer,
  openCharacterPack,
  buyCharacter,
  enhanceCharacter,
  simulateRankedMatch,
  simulateProfileChallenge,
  simulateDungeon,
  claimMission,
  buildRoom,
  grantCharacter,
} from './services/gameService.js';

const appRoot = document.getElementById('app');
const modalRoot = document.getElementById('modal-root');
const toastRoot = document.getElementById('toast-root');

const state = {
  screen: 'loading',
  user: null,
  userMeta: null,
  players: {},
  activePlayer: null,
  authError: '',
  form: { email: '', password: '' },
  modal: null,
  lobbyTab: 'main',
  rooms: {},
  publicProfiles: {},
  resourceStatus: '',
  resourceLoading: false,
  previewMode: 'control',
};

let unwatchRooms = null;
let unwatchProfiles = null;
let renderScheduled = false;

const scheduleRender = () => {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    appRoot.innerHTML = render(state);
    modalRoot.innerHTML = renderModal(state.modal);
  });
};

const showToast = (message, type = 'info') => {
  const wrap = toastRoot.querySelector('.toast-wrap') || (() => {
    const el = document.createElement('div');
    el.className = 'toast-wrap';
    toastRoot.appendChild(el);
    return el;
  })();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3400);
};

const setState = (patch) => {
  Object.assign(state, patch);
  scheduleRender();
};

const setScreen = (screen) => setState({ screen, authError: '' });
const closeModal = () => setState({ modal: null });

const requirePlayer = () => {
  if (!state.activePlayer) {
    showToast('활성 플레이어를 먼저 선택하세요.', 'error');
    return false;
  }
  return true;
};

const persistActivePlayer = async () => {
  if (!state.user || !state.activePlayer) return;
  const saved = await updatePlayerRemote(state.user.uid, state.activePlayer);
  state.players[saved.id] = saved;
  state.activePlayer = saved;
  scheduleRender();
};

const mutateActivePlayer = async (mutator, successMessage = '') => {
  if (!requirePlayer()) return;
  const draft = clone(state.activePlayer);
  const result = await mutator(draft);
  state.activePlayer = draft;
  state.players[draft.id] = draft;
  await persistActivePlayer();
  if (successMessage) showToast(successMessage, 'success');
  return result;
};

const startRealtimeWatchers = () => {
  if (unwatchRooms) unwatchRooms();
  if (unwatchProfiles) unwatchProfiles();
  unwatchRooms = watchRooms((rooms) => {
    state.rooms = rooms || {};
    scheduleRender();
  });
  unwatchProfiles = watchPublicProfiles((profiles) => {
    state.publicProfiles = profiles || {};
    scheduleRender();
  });
};

const bootstrapUser = async (user) => {
  const { meta, players } = await bootstrapAfterLogin(user);
  state.user = user;
  state.userMeta = meta || null;
  state.players = players || {};
  state.activePlayer = meta?.activePlayerId ? players?.[meta.activePlayerId] || null : Object.values(players || {})[0] || null;
  state.lobbyTab = state.activePlayer?.meta?.lastViewedTab || 'main';
  startRealtimeWatchers();
  setScreen(state.activePlayer ? 'prep' : 'playerSelect');
};

const registerServiceWorker = async () => {
  if (!('serviceWorker' in navigator)) throw new Error('이 브라우저는 Service Worker를 지원하지 않습니다.');
  state.resourceLoading = true;
  state.resourceStatus = '리소스 다운로드를 준비하는 중입니다...';
  scheduleRender();
  await navigator.serviceWorker.register('./service-worker.js');
  const assetUrls = [
    './assets/skins/',
    './assets/skills/',
  ];
  await Promise.all(assetUrls.map((url) => fetch(url, { method: 'GET' }).catch(() => null)));
  state.resourceLoading = false;
  state.resourceStatus = '앱 셸과 주요 리소스 캐시가 준비되었습니다.';
  scheduleRender();
};

const handleAuthSubmit = async (mode) => {
  const email = document.getElementById('auth-email')?.value?.trim();
  const password = document.getElementById('auth-password')?.value;
  state.form = { email, password };
  if (!email || !password) {
    setState({ authError: '이메일과 비밀번호를 모두 입력해주세요.' });
    return;
  }
  try {
    if (mode === 'signup') await signUpWithEmail(email, password);
    else await signInWithEmail(email, password);
    state.authError = '';
  } catch (error) {
    setState({ authError: getFriendlyAuthErrorMessage(error) });
  }
};

const handleCreatePlayer = async () => {
  const input = document.getElementById('new-player-name');
  const nickname = input?.value?.trim();
  if (!nickname || nickname.length < APP_CONFIG.nicknameMin || nickname.length > APP_CONFIG.nicknameMax) {
    showToast(`닉네임은 ${APP_CONFIG.nicknameMin}~${APP_CONFIG.nicknameMax}글자로 입력해주세요.`, 'error');
    return;
  }
  try {
    const player = await createPlayerRemote(state.user.uid, nickname);
    state.players[player.id] = player;
    state.activePlayer = player;
    await setActivePlayerId(state.user.uid, player.id);
    showToast('플레이어가 생성되었습니다.', 'success');
    setScreen('prep');
  } catch (error) {
    showToast(error.message || '플레이어 생성 중 오류가 발생했습니다.', 'error');
  }
};

const handleSelectPlayer = async (playerId) => {
  const player = state.players[playerId];
  if (!player) return;
  state.activePlayer = player;
  await setActivePlayerId(state.user.uid, playerId);
  showToast(`${player.nickname} 플레이어를 선택했습니다.`, 'success');
  setScreen('prep');
};

const handleDeletePlayer = async (playerId) => {
  const password = document.getElementById('delete-player-password')?.value || '';
  if (!password) {
    showToast('비밀번호를 입력해주세요.', 'error');
    return;
  }
  try {
    await deletePlayerRemote({ uid: state.user.uid, playerId, email: state.user.email, password });
    delete state.players[playerId];
    const nextPlayer = Object.values(state.players)[0] || null;
    state.activePlayer = nextPlayer;
    closeModal();
    showToast('플레이어가 삭제되었습니다.', 'success');
    setScreen(nextPlayer ? 'playerSelect' : 'playerSelect');
  } catch (error) {
    showToast(getFriendlyAuthErrorMessage(error), 'error');
  }
};

const openDevMode = async () => {
  const pin = document.getElementById('dev-pin')?.value?.trim();
  if (pin !== APP_CONFIG.devPin) {
    showToast('인증 코드가 올바르지 않습니다.', 'error');
    return;
  }
  await mutateActivePlayer((player) => {
    player.devModeEnabled = true;
  }, '개발자 모드가 활성화되었습니다.');
  closeModal();
};

const disableDevMode = async () => {
  await mutateActivePlayer((player) => {
    player.devModeEnabled = false;
  }, '개발자 모드를 비활성화했습니다.');
};

const handleDevAdjust = async (field, value) => {
  if (!state.activePlayer?.devModeEnabled) return;
  await mutateActivePlayer((player) => {
    if (field === 'gold') player.gold += Number(value);
    else player.stats[field] = (player.stats[field] || 0) + Number(value);
  }, `${field} 값이 조정되었습니다.`);
};

const handleDevUnlockAll = async () => {
  if (!state.activePlayer?.devModeEnabled) return;
  await mutateActivePlayer((player) => {
    CHARACTER_LIST.forEach((character) => grantCharacter(player, character.id));
  }, '모든 캐릭터가 해금되었습니다.');
};

const handleDevResetPoints = async () => {
  await mutateActivePlayer((player) => {
    player.stats.rankedPointsControl = 0;
    player.stats.rankedPointsAuto = 0;
  }, '랭크 포인트를 초기화했습니다.');
};

const handleBuyPack = async () => {
  let packResult;
  await mutateActivePlayer((player) => {
    packResult = openCharacterPack(player);
    if (!packResult.ok) throw new Error(packResult.reason);
  });
  setState({ modal: { type: 'packResult', character: packResult.character } });
  showToast(`${packResult.character.name} 획득!`, 'success');
};

const handleBuyCharacter = async (characterId) => {
  await mutateActivePlayer((player) => {
    const result = buyCharacter(player, characterId);
    if (!result.ok) throw new Error(result.reason);
  }, '캐릭터를 구매했습니다.');
};

const handleSetActiveCharacter = async (characterId) => {
  await mutateActivePlayer((player) => {
    if (!player.ownedCharacters?.[characterId]) throw new Error('보유하지 않은 캐릭터입니다.');
    player.activeCharacterId = characterId;
  }, '컨트롤 대표 캐릭터를 변경했습니다.');
};

const handleToggleAutoSquad = async (characterId) => {
  await mutateActivePlayer((player) => {
    player.autoSquad = player.autoSquad || [];
    if (player.autoSquad.includes(characterId)) {
      player.autoSquad = player.autoSquad.filter((id) => id !== characterId);
    } else if (player.autoSquad.length < 2) {
      player.autoSquad.push(characterId);
    } else {
      throw new Error('오토 스쿼드는 최대 2명까지 설정할 수 있습니다.');
    }
  }, '오토 스쿼드를 수정했습니다.');
};

const handleEnhanceCharacter = async (characterId) => {
  let result;
  await mutateActivePlayer((player) => {
    result = enhanceCharacter(player, characterId);
    if (!result.ok) throw new Error(result.reason);
  });
  showToast(result.success ? `강화 성공! 현재 +${result.enhancement}` : `강화 실패... (성공률 ${result.rate}%)`, result.success ? 'success' : 'error');
};

const handleSimulateRanked = async (mode) => {
  let result;
  await mutateActivePlayer((player) => {
    result = simulateRankedMatch(player, mode);
  });
  showToast(`${mode === 'control' ? '컨트롤' : '오토'} 경쟁전 ${result.win ? '승리' : '패배'} · 포인트 ${result.pointsDelta > 0 ? '+' : ''}${result.pointsDelta}`, result.win ? 'success' : 'error');
  state.lobbyTab = mode === 'control' ? 'controlHub' : 'autoHub';
  scheduleRender();
};

const handleSimulateChallenge = async () => {
  let result;
  await mutateActivePlayer((player) => {
    result = simulateProfileChallenge(player);
    if (!result.ok) throw new Error(result.reason);
  });
  showToast(result.win ? `도전 승리! ${result.rewardGold}골드를 받았습니다.` : '도전에 패배했습니다.', result.win ? 'success' : 'error');
};

const handleSimulateDungeon = async () => {
  let result;
  await mutateActivePlayer((player) => {
    result = simulateDungeon(player);
    if (!result.ok) throw new Error(result.reason);
  });
  showToast(result.win ? `던전 클리어! ${result.rewardGold}골드 획득` : '던전에서 패배했습니다.', result.win ? 'success' : 'error');
};

const handleClaimMission = async (missionId) => {
  await mutateActivePlayer((player) => {
    const result = claimMission(player, missionId);
    if (!result.ok) throw new Error(result.reason);
  }, '미션 보상을 수령했습니다.');
};

const handleCreateRoom = async (mode) => {
  const wager = Number(document.getElementById('room-wager')?.value || 0);
  const room = buildRoom({
    hostUid: state.user.uid,
    hostPlayerId: state.activePlayer.id,
    hostNickname: state.activePlayer.nickname,
    mode,
    wager,
  });
  await createRoomRemote(room);
  closeModal();
  showToast('경기방이 생성되었습니다.', 'success');
  state.lobbyTab = mode === 'control' ? 'controlRooms' : 'autoRooms';
  scheduleRender();
};

const handleJoinRoom = async (roomId) => {
  const room = state.rooms?.[roomId];
  if (!room) return showToast('방 정보를 찾을 수 없습니다.', 'error');
  if (room.hostUid === state.user.uid) return showToast('내가 만든 방입니다.', 'info');
  if (room.guestUid) return showToast('이미 게스트가 입장한 방입니다.', 'error');
  await updateRoomRemote(roomId, {
    guestUid: state.user.uid,
    guestPlayerId: state.activePlayer.id,
    guestNickname: state.activePlayer.nickname,
    status: '준비중',
  });
  showToast('방에 입장했습니다.', 'success');
};

const handleDeleteRoom = async (roomId) => {
  await removeRoomRemote(roomId);
  showToast('방이 삭제되었습니다.', 'success');
};

const handleDownloadResources = async () => {
  try {
    await registerServiceWorker();
    showToast('리소스 캐시가 준비되었습니다.', 'success');
  } catch (error) {
    state.resourceLoading = false;
    state.resourceStatus = error.message || '리소스 다운로드에 실패했습니다.';
    scheduleRender();
    showToast(state.resourceStatus, 'error');
  }
};

const handleLogout = async () => {
  await signOutUser();
  state.user = null;
  state.userMeta = null;
  state.players = {};
  state.activePlayer = null;
  state.rooms = {};
  state.publicProfiles = {};
  if (unwatchRooms) unwatchRooms();
  if (unwatchProfiles) unwatchProfiles();
  setScreen('first');
};

const handleOpenBattlePreview = (mode) => {
  state.previewMode = mode;
  setScreen('battlePreview');
};

const actionHandlers = {
  'go-login': () => setScreen('login'),
  'go-signup': () => setScreen('signup'),
  'goto-first': () => setScreen('first'),
  'submit-auth': ({ dataset }) => handleAuthSubmit(dataset.mode),
  'logout': () => handleLogout(),
  'create-player': () => handleCreatePlayer(),
  'select-player': ({ dataset }) => handleSelectPlayer(dataset.playerId),
  'back-player-select': () => setScreen('playerSelect'),
  'go-lobby': () => setScreen('lobby'),
  'download-resources': () => handleDownloadResources(),
  'set-lobby-tab': ({ dataset }) => { state.lobbyTab = dataset.tab; state.activePlayer.meta.lastViewedTab = dataset.tab; persistActivePlayer(); scheduleRender(); },
  'open-screen': ({ dataset }) => { state.lobbyTab = dataset.screen; state.activePlayer.meta.lastViewedTab = dataset.screen; persistActivePlayer(); scheduleRender(); },
  'open-delete-player': ({ dataset }) => setState({ modal: { type: 'deletePlayer', playerId: dataset.playerId } }),
  'confirm-delete-player': ({ dataset }) => handleDeletePlayer(dataset.playerId),
  'close-modal': () => closeModal(),
  'open-dev-auth': () => setState({ modal: { type: 'devAuth' } }),
  'confirm-dev-mode': () => openDevMode(),
  'disable-dev-mode': () => disableDevMode(),
  'dev-adjust': ({ dataset }) => handleDevAdjust(dataset.field, dataset.value),
  'dev-unlock-all': () => handleDevUnlockAll(),
  'dev-pack': () => handleBuyPack(),
  'dev-reset-points': () => handleDevResetPoints(),
  'buy-pack': () => handleBuyPack(),
  'buy-character': ({ dataset }) => handleBuyCharacter(dataset.characterId),
  'set-active-character': ({ dataset }) => handleSetActiveCharacter(dataset.characterId),
  'toggle-auto-squad': ({ dataset }) => handleToggleAutoSquad(dataset.characterId),
  'enhance-character': ({ dataset }) => handleEnhanceCharacter(dataset.characterId),
  'simulate-ranked': ({ dataset }) => handleSimulateRanked(dataset.mode),
  'simulate-challenge': () => handleSimulateChallenge(),
  'simulate-dungeon': () => handleSimulateDungeon(),
  'claim-mission': ({ dataset }) => handleClaimMission(dataset.missionId),
  'create-room': ({ dataset }) => setState({ modal: { type: 'createRoom', mode: dataset.mode } }),
  'confirm-create-room': ({ dataset }) => handleCreateRoom(dataset.mode),
  'join-room': ({ dataset }) => handleJoinRoom(dataset.roomId),
  'delete-room': ({ dataset }) => handleDeleteRoom(dataset.roomId),
  'open-battle-preview': ({ dataset }) => handleOpenBattlePreview(dataset.mode),
  'close-battle-preview': () => setScreen('lobby'),
};

window.addEventListener('click', async (event) => {
  const target = event.target.closest('[data-action], [data-close-modal]');
  if (!target) return;
  if (target.dataset.closeModal !== undefined) {
    closeModal();
    return;
  }
  const action = target.dataset.action;
  const handler = actionHandlers[action];
  if (!handler) return;
  try {
    await handler(target);
  } catch (error) {
    console.error(error);
    showToast(error.message || '작업 처리 중 오류가 발생했습니다.', 'error');
  }
});

const boot = async () => {
  setScreen('loading');
  const init = initFirebase();
  if (!init.firebaseReady || !isFirebaseReady()) {
    appRoot.innerHTML = `<div class="center-shell"><div class="auth-card card"><h2>Firebase 초기화 실패</h2><p class="page-desc">config 또는 Realtime Database 설정을 확인해주세요.</p></div></div>`;
    return;
  }
  watchAuth(async (user) => {
    try {
      if (user) await bootstrapUser(user);
      else setScreen('first');
    } catch (error) {
      console.error(error);
      showToast(error.message || '계정 정보를 불러오는 중 오류가 발생했습니다.', 'error');
      setScreen('first');
    }
  });
};

boot();
