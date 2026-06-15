import { APP_CONFIG } from '../config.js';
import { CHARACTER_LIST, CHARACTER_MAP } from '../data/characters.js';
import { MISSIONS } from '../data/missions.js';
import { enrichPlayer, buildLeaderboardRows, getMissionProgress, getEnhancementCost, getEnhancementRate } from '../services/gameService.js';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

const avatarMarkup = (character, initials = '??', size = '') => {
  const text = initials.slice(0, 2).toUpperCase();
  return `
    <div class="avatar-token ${size}">
      ${character?.image ? `<img src="${character.image}" alt="${escapeHtml(character?.name || text)}" onerror="this.remove()" />` : ''}
      <span class="avatar-fallback">${escapeHtml(text)}</span>
    </div>
  `;
};

const badge = (text, extraClass = '') => `<span class="pill ${extraClass}">${escapeHtml(text)}</span>`;

const statCard = (label, value) => `
  <div class="stat-card">
    <div class="stat-label">${escapeHtml(label)}</div>
    <div class="stat-value">${escapeHtml(value)}</div>
  </div>
`;

const authIntro = `
  <div class="brand-wrap">
    <span class="brand-chip">HTML + Firebase + Cloudflare 구조 준비용 1차 빌드</span>
    <h1 class="brand-title">${APP_CONFIG.gameName}</h1>
    <p class="brand-sub">검은색 베이스의 깔끔한 로비, 플레이어 2개 생성/삭제, 상점/스쿼드/미션/랭킹/친선방 뼈대를 포함한 GitHub Pages용 1차 버전입니다.</p>
  </div>
`;

const renderFirstScreen = () => `
  <div class="center-shell">
    <div class="auth-card card">
      ${authIntro}
      <div class="stack">
        <button class="btn primary block" data-action="go-login">로그인</button>
        <button class="btn secondary block" data-action="go-signup">회원가입</button>
        <p class="inline-note">회원가입은 이메일과 비밀번호만으로 가능합니다.</p>
      </div>
    </div>
  </div>
`;

const renderAuthForm = (mode = 'login', state) => {
  const isLogin = mode === 'login';
  const error = state.authError ? `<div class="pill" style="background: rgba(245,79,102,.14); color:#ffd5de; border-color: rgba(245,79,102,.24)">${escapeHtml(state.authError)}</div>` : '';
  return `
  <div class="center-shell">
    <div class="auth-card card">
      ${authIntro}
      ${error}
      <div class="stack" style="margin-top:12px;">
        <div class="input-group">
          <label class="label">이메일</label>
          <input id="auth-email" class="text-input" type="email" placeholder="example@email.com" value="${escapeHtml(state.form.email || '')}" />
        </div>
        <div class="input-group">
          <label class="label">비밀번호</label>
          <input id="auth-password" class="text-input" type="password" placeholder="비밀번호 입력" value="${escapeHtml(state.form.password || '')}" />
        </div>
        <button class="btn primary block" data-action="submit-auth" data-mode="${mode}">${isLogin ? '로그인' : '회원가입'}</button>
        <button class="btn secondary block" data-action="goto-first">뒤로가기</button>
        <p class="inline-note">${isLogin ? '계정이 없다면 회원가입 후 로그인하세요.' : '회원가입 후 바로 로그인 상태로 전환됩니다.'}</p>
      </div>
    </div>
  </div>`;
};

const renderPlayerCard = (player) => {
  const enriched = enrichPlayer(player);
  return `
  <div class="player-card card">
    <div class="title-row">
      <div class="tag-row">
        ${badge(enriched.title, 'green')}
        ${badge(`골드 ${enriched.gold}`, 'gold')}
      </div>
      <button class="btn danger small" data-action="open-delete-player" data-player-id="${enriched.id}">삭제</button>
    </div>
    <div class="profile-head">
      ${avatarMarkup(enriched.activeCharacter, enriched.logoText, 'lg')}
      <div>
        <h3 class="profile-name">${escapeHtml(enriched.nickname)}</h3>
        <p class="profile-sub">컨트롤 ${escapeHtml(enriched.tierControl)} / 오토 ${escapeHtml(enriched.tierAuto)}</p>
      </div>
    </div>
    <div class="tag-row">
      ${badge(`보유 캐릭터 ${Object.keys(enriched.ownedCharacters || {}).length}명`)}
      ${badge(`활성 캐릭터 ${enriched.activeCharacter?.name || '-'}`)}
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(2,minmax(0,1fr));">
      ${statCard('킬', enriched.stats?.kills || 0)}
      ${statCard('데미지', enriched.stats?.damage || 0)}
    </div>
    <div class="row">
      <button class="btn primary" data-action="select-player" data-player-id="${enriched.id}">선택</button>
    </div>
  </div>`;
};

const renderPlayerSelect = (state) => {
  const players = Object.values(state.players || {});
  return `
  <div class="page-shell">
    <div class="title-row" style="margin: 16px 0 20px;">
      <div>
        <h1 class="page-title">플레이어 선택</h1>
        <p class="page-desc">본캐/부캐 개념으로 플레이어를 최대 2개까지 생성할 수 있습니다.</p>
      </div>
      <button class="btn secondary" data-action="logout">로그아웃</button>
    </div>
    <div class="grid-2">
      ${players.map(renderPlayerCard).join('')}
      ${players.length < APP_CONFIG.maxPlayersPerAccount ? `
      <div class="player-card empty card">
        <div>
          <h3 class="page-title" style="font-size: 24px;">새 플레이어 생성</h3>
          <p class="page-desc">닉네임만 입력하면 바로 생성됩니다.</p>
        </div>
        <div class="stack" style="width:100%; max-width:300px;">
          <input id="new-player-name" class="text-input" maxlength="${APP_CONFIG.nicknameMax}" placeholder="닉네임 입력 (${APP_CONFIG.nicknameMin}~${APP_CONFIG.nicknameMax}글자)" />
          <button class="btn primary block" data-action="create-player">플레이어 생성</button>
        </div>
      </div>` : ''}
    </div>
  </div>`;
};

const renderPrepScreen = (state) => `
  <div class="page-shell">
    <div class="hero-grid">
      <div class="card content-panel">
        <div class="title-row">
          <div>
            <h1 class="page-title">준비 화면</h1>
            <p class="page-desc">리소스를 미리 캐시하고 로비로 이동할 수 있습니다.</p>
          </div>
          <button class="btn secondary" data-action="back-player-select">플레이어 선택</button>
        </div>
        <div class="stack" style="margin-top:20px; max-width:420px;">
          <button class="btn primary block" data-action="go-lobby">게임 시작</button>
          <button class="btn secondary block" data-action="download-resources">리소스다운로드(wifi환경)</button>
          ${state.resourceStatus ? `<div class="resource-status">${state.resourceLoading ? '<span class="spinner"></span>' : '✅'} <span>${escapeHtml(state.resourceStatus)}</span></div>` : ''}
        </div>
      </div>
      <div class="card content-panel">
        <h2 class="feature-title">선택된 플레이어</h2>
        <div style="margin-top:18px;">
          ${renderPlayerCard(state.activePlayer)}
        </div>
      </div>
    </div>
  </div>
`;

const renderSummaryCards = (player) => `
  <div class="stat-grid" style="margin-top:16px;">
    ${statCard('보유 캐릭터', Object.keys(player.ownedCharacters || {}).length)}
    ${statCard('컨트롤 포인트', player.stats?.rankedPointsControl || 0)}
    ${statCard('오토 포인트', player.stats?.rankedPointsAuto || 0)}
    ${statCard('누적 골드', player.gold || 0)}
  </div>
`;

const mainTab = (player) => `
  <div class="stack">
    <div class="feature-card highlight">
      <div>
        <h2 class="feature-title">메인 대시보드</h2>
        <p class="feature-meta">기본 흐름은 메인 화면부터 시작합니다. 컨트롤모드, 오토모드, 랭킹, 미션으로 빠르게 이동할 수 있습니다.</p>
      </div>
      ${renderSummaryCards(player)}
    </div>
    <div class="grid-2">
      <button class="feature-card btn secondary" data-action="open-screen" data-screen="controlHub">
        <div>
          <h3 class="feature-title">컨트롤모드</h3>
          <p class="feature-meta">1대1 경쟁전, 친선방 개설/입장, 전투 프리뷰.</p>
        </div>
        <div class="tag-row">${badge(`현재 티어 ${player.tierControl}`, 'green')}</div>
      </button>
      <button class="feature-card btn secondary" data-action="open-screen" data-screen="autoHub">
        <div>
          <h3 class="feature-title">오토모드</h3>
          <p class="feature-meta">2대2 경쟁전, 던전, 상대 프로필 도전, 친선방.</p>
        </div>
        <div class="tag-row">${badge(`현재 티어 ${player.tierAuto}`, 'green')}</div>
      </button>
      <button class="feature-card btn secondary" data-action="open-screen" data-screen="rankings">
        <div>
          <h3 class="feature-title">랭킹</h3>
          <p class="feature-meta">Kill / Damage / Tank / Tier 랭킹을 보기 좋게 정리합니다.</p>
        </div>
        <div class="tag-row">${badge('글로벌 프로필 기반')}</div>
      </button>
      <button class="feature-card btn secondary" data-action="open-screen" data-screen="missions">
        <div>
          <h3 class="feature-title">미션</h3>
          <p class="feature-meta">업적, 칭호, 보상 골드를 관리합니다.</p>
        </div>
        <div class="tag-row">${badge('칭호 자동 갱신')}</div>
      </button>
    </div>
  </div>
`;

const craftTab = () => `
  <div class="stack">
    <div class="feature-card highlight">
      <div>
        <h2 class="feature-title">제작소</h2>
        <p class="feature-meta">1차 버전에서는 제작소 뼈대만 구성했습니다. 차후 아이템/재료 시스템을 여기에 확장하면 됩니다.</p>
      </div>
      <div class="grid-3">
        <div class="feature-card"><h3 class="feature-title">캐릭터 조각</h3><p class="feature-meta">나중에 조각 합성 기능 추가 예정</p></div>
        <div class="feature-card"><h3 class="feature-title">강화 재료</h3><p class="feature-meta">강화 보호권, 재시도권 확장 가능</p></div>
        <div class="feature-card"><h3 class="feature-title">희귀 칭호</h3><p class="feature-meta">특수 업적/기간제 이벤트 칭호 슬롯</p></div>
      </div>
    </div>
  </div>
`;

const shopTab = (player) => {
  const unowned = CHARACTER_LIST.filter((character) => !player.ownedCharacters?.[character.id]);
  return `
  <div class="stack">
    <div class="feature-card highlight">
      <div class="title-row">
        <div>
          <h2 class="feature-title">상점</h2>
          <p class="feature-meta">캐릭터팩 500골드 / 캐릭터 직접 구매 가능</p>
        </div>
        <div class="tag-row">${badge(`보유 골드 ${player.gold}`, 'gold')}</div>
      </div>
      <div class="row" style="margin-top:16px;">
        <button class="btn primary" data-action="buy-pack">캐릭터팩 구매 / 개봉</button>
      </div>
    </div>
    <div class="feature-card">
      <h3 class="feature-title">직접 구매 캐릭터</h3>
      <p class="feature-meta">이미 보유한 캐릭터는 구매할 수 없습니다.</p>
      <div class="character-grid" style="margin-top:16px;">
        ${unowned.map((character) => `
          <div class="character-card">
            <div class="character-head">
              ${avatarMarkup(character, character.englishName.slice(0,2))}
              <div>
                <h4 class="character-name">${escapeHtml(character.name)}</h4>
                <p class="character-sub">${escapeHtml(character.role)} · ${escapeHtml(character.rarity)}</p>
              </div>
            </div>
            <div class="tag-row">
              ${badge(`${character.shopPrice}G`, 'gold')}
              ${badge(character.ultimate.name)}
            </div>
            <button class="btn secondary" data-action="buy-character" data-character-id="${character.id}">구매</button>
          </div>
        `).join('') || `<div class="empty-state">모든 캐릭터를 이미 보유하고 있습니다.</div>`}
      </div>
    </div>
  </div>`;
};

const squadTab = (player) => {
  const owned = player.ownedCharacterObjects || [];
  return `
  <div class="stack">
    <div class="feature-card highlight">
      <div class="title-row">
        <div>
          <h2 class="feature-title">스쿼드</h2>
          <p class="feature-meta">컨트롤 캐릭터, 오토 스쿼드(2인), 강화, 캐릭터 정보를 관리합니다.</p>
        </div>
        <div class="tag-row">${badge(`활성 캐릭터 ${player.activeCharacter?.name || '-'}`, 'green')}</div>
      </div>
    </div>
    <div class="character-grid">
      ${owned.map((character) => {
        const enhancement = character.ownership?.enhancement || 0;
        return `
        <div class="character-card ${player.activeCharacterId === character.id ? 'selected' : ''}">
          <div class="character-head">
            ${avatarMarkup(character, character.englishName?.slice(0, 2) || character.id.slice(0, 2))}
            <div>
              <h4 class="character-name">${escapeHtml(character.name)}</h4>
              <p class="character-sub">${escapeHtml(character.role)} · 강화 +${enhancement}</p>
            </div>
          </div>
          <div class="tag-row">
            ${badge(`ATK ${character.baseStats?.attack || 0}`)}
            ${badge(`HP ${character.baseStats?.hp || 0}`)}
          </div>
          <div class="skill-list">
            <div class="skill-chip"><div class="skill-icon">${character.skill1?.image ? `<img src="${character.skill1.image}" alt="" onerror="this.remove()" />` : ''}</div><div><strong>${escapeHtml(character.skill1?.name || '-')}</strong><div class="inline-note">${escapeHtml(character.skill1?.description || '')}</div></div></div>
            <div class="skill-chip"><div class="skill-icon">${character.ultimate?.image ? `<img src="${character.ultimate.image}" alt="" onerror="this.remove()" />` : ''}</div><div><strong>${escapeHtml(character.ultimate?.name || '-')}</strong><div class="inline-note">${escapeHtml(character.ultimate?.description || '')}</div></div></div>
          </div>
          <div class="row">
            <button class="btn primary small" data-action="set-active-character" data-character-id="${character.id}">컨트롤 대표</button>
            <button class="btn secondary small" data-action="toggle-auto-squad" data-character-id="${character.id}">${(player.autoSquad || []).includes(character.id) ? '오토 스쿼드 해제' : '오토 스쿼드 추가'}</button>
          </div>
          <div class="stack">
            <div class="inline-note">강화 비용 ${getEnhancementCost(enhancement)}G / 성공률 ${getEnhancementRate(enhancement)}%</div>
            <button class="btn warning small" data-action="enhance-character" data-character-id="${character.id}">강화 시도</button>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
};

const itemsTab = (player) => `
  <div class="stack">
    <div class="feature-card highlight">
      <h2 class="feature-title">아이템</h2>
      <p class="feature-meta">1차 버전에서는 아이템 인벤토리 뼈대와 기본 수치 확인만 제공합니다.</p>
      <div class="stat-grid" style="margin-top:16px;">
        ${statCard('캐릭터팩', player.inventory?.characterPacks || 0)}
        ${statCard('강화 재료', player.inventory?.boostStones || 0)}
        ${statCard('칭호 쿠폰', player.inventory?.titleCoupons || 0)}
        ${statCard('임시 버프', 0)}
      </div>
    </div>
  </div>
`;

const controlHub = (player) => `
  <div class="stack">
    <div class="feature-card highlight">
      <div class="title-row">
        <div>
          <h2 class="feature-title">컨트롤모드</h2>
          <p class="feature-meta">1대1 구조, 3분 제한, 마지막 체력이 많은 캐릭터가 승리하는 규칙을 기반으로 한 1차 시뮬레이션/방 시스템입니다.</p>
        </div>
        <div class="tag-row">${badge(`티어 ${player.tierControl}`, 'green')}</div>
      </div>
      <div class="row" style="margin-top:16px;">
        <button class="btn primary" data-action="simulate-ranked" data-mode="control">경쟁전 AI 매치</button>
        <button class="btn secondary" data-action="open-screen" data-screen="controlRooms">친선방 보기</button>
        <button class="btn ghost" data-action="open-battle-preview" data-mode="control">전투 UI 프리뷰</button>
      </div>
    </div>
  </div>
`;

const autoHub = (player) => `
  <div class="stack">
    <div class="feature-card highlight">
      <div class="title-row">
        <div>
          <h2 class="feature-title">오토모드</h2>
          <p class="feature-meta">2대2 구조, 자동 스킬/궁극기, 유도 투사체, 던전과 도전 기능이 포함됩니다.</p>
        </div>
        <div class="tag-row">${badge(`티어 ${player.tierAuto}`, 'green')}</div>
      </div>
      <div class="row" style="margin-top:16px; flex-wrap:wrap;">
        <button class="btn primary" data-action="simulate-ranked" data-mode="auto">경쟁전 AI 매치</button>
        <button class="btn secondary" data-action="simulate-challenge">상대 프로필 도전 (5G)</button>
        <button class="btn secondary" data-action="simulate-dungeon">던전 도전</button>
        <button class="btn ghost" data-action="open-screen" data-screen="autoRooms">친선방 보기</button>
        <button class="btn ghost" data-action="open-battle-preview" data-mode="auto">전투 UI 프리뷰</button>
      </div>
      ${player.borrowCharacterAvailable && player.borrowedCharacterId ? `<div class="pill green" style="margin-top:14px;">대여 가능 캐릭터: ${escapeHtml(CHARACTER_MAP[player.borrowedCharacterId]?.name || '-')}</div>` : ''}
    </div>
  </div>
`;

const roomScreen = (state, mode = 'control') => {
  const rooms = Object.values(state.rooms || {}).filter((room) => room.mode === mode);
  const player = enrichPlayer(state.activePlayer);
  return `
  <div class="stack">
    <div class="feature-card highlight">
      <div class="title-row">
        <div>
          <h2 class="feature-title">${mode === 'control' ? '컨트롤모드' : '오토모드'} PvP 경기방</h2>
          <p class="feature-meta">경기당 골드를 걸 수 있는 친선방입니다. 1차 버전에서는 방 생성/입장/준비 상태 저장까지 구현됩니다.</p>
        </div>
        <button class="btn secondary" data-action="create-room" data-mode="${mode}">방 생성</button>
      </div>
      <div class="inline-note" style="margin-top:12px;">내 기본 배팅금: ${mode === 'control' ? player.meta?.controlWagerDefault || 10 : player.meta?.autoWagerDefault || 10}G</div>
    </div>
    <div class="feature-card">
      <h3 class="feature-title">현재 방 목록</h3>
      <div class="stack" style="margin-top:16px;">
        ${rooms.length ? rooms.map((room) => `
          <div class="character-card">
            <div class="title-row">
              <div>
                <h4 class="character-name">${escapeHtml(room.hostNickname)}의 방</h4>
                <p class="character-sub">상태 ${escapeHtml(room.status)} · 배팅 ${room.wager}G</p>
              </div>
              <div class="tag-row">
                ${badge(mode === 'control' ? '1대1' : '2대2')}
                ${badge(room.status)}
              </div>
            </div>
            <div class="row">
              <button class="btn primary small" data-action="join-room" data-room-id="${room.id}">입장</button>
              ${room.hostUid === state.user?.uid ? `<button class="btn danger small" data-action="delete-room" data-room-id="${room.id}">삭제</button>` : ''}
            </div>
          </div>
        `).join('') : `<div class="empty-state">아직 생성된 방이 없습니다.</div>`}
      </div>
    </div>
  </div>`;
};

const rankingsScreen = (state) => {
  const rows = buildLeaderboardRows(Object.values(state.publicProfiles || {}));
  const sections = [
    { key: 'kills', label: 'Kill 랭킹', valueLabel: '킬' },
    { key: 'damage', label: '데미지 랭킹', valueLabel: '데미지' },
    { key: 'tank', label: '탱커 랭킹', valueLabel: '최대 생존' },
    { key: 'tier', label: '티어 랭킹', valueLabel: '티어 점수' },
  ];
  return `
  <div class="stack">
    ${sections.map((section) => `
      <div class="feature-card">
        <div class="title-row">
          <div>
            <h2 class="feature-title">${section.label}</h2>
            <p class="feature-meta">저장된 publicProfiles 데이터를 기반으로 정렬합니다.</p>
          </div>
        </div>
        <table class="table" style="margin-top:12px;">
          <thead><tr><th>#</th><th>닉네임</th><th>칭호</th><th>${section.valueLabel}</th></tr></thead>
          <tbody>
            ${(rows[section.key] || []).slice(0, 10).map((row, index) => `
              <tr>
                <td><span class="rank-num">${index + 1}</span></td>
                <td>${escapeHtml(row.nickname || '-')}</td>
                <td>${escapeHtml(row.title || '-')}</td>
                <td>${section.key === 'tier' ? `${row.controlTier}/${row.autoTier}` : escapeHtml(row[section.key])}</td>
              </tr>
            `).join('') || '<tr><td colspan="4">아직 누적 데이터가 없습니다.</td></tr>'}
          </tbody>
        </table>
      </div>
    `).join('')}
  </div>`;
};

const missionsScreen = (player) => `
  <div class="stack">
    <div class="feature-card highlight">
      <h2 class="feature-title">미션 / 업적 / 칭호</h2>
      <p class="feature-meta">보상 수령 시 골드를 지급하고, 칭호가 변경됩니다.</p>
    </div>
    <div class="character-grid">
      ${MISSIONS.map((mission) => {
        const progress = getMissionProgress(player, mission);
        const claimed = !!player.missionsClaimed?.[mission.id];
        const percent = Math.min(100, Math.floor((progress / mission.target) * 100));
        return `
          <div class="character-card ${claimed ? 'selected' : ''}">
            <div>
              <h3 class="character-name">${escapeHtml(mission.name)}</h3>
              <p class="character-sub">${escapeHtml(mission.description)}</p>
            </div>
            <div class="progress"><span style="width:${percent}%"></span></div>
            <div class="title-row">
              <div class="inline-note">${progress} / ${mission.target}</div>
              <div class="tag-row">${badge(`${mission.rewardGold}G`, 'gold')}${badge(mission.rewardTitle)}</div>
            </div>
            <button class="btn ${claimed ? 'secondary' : 'primary'}" ${claimed ? 'disabled' : ''} data-action="claim-mission" data-mission-id="${mission.id}">${claimed ? '수령 완료' : '보상 수령'}</button>
          </div>
        `;
      }).join('')}
    </div>
  </div>`;

const renderDevPanel = (player) => `
  <div class="feature-card">
    <div class="title-row">
      <div>
        <h3 class="feature-title">개발자 모드</h3>
        <p class="feature-meta">2359 인증 후 활성화됩니다. 모든 수치를 임시로 조절하고 기능을 빠르게 점검할 수 있습니다.</p>
      </div>
      ${player.devModeEnabled ? '<span class="pill green">활성화</span>' : '<span class="pill">비활성화</span>'}
    </div>
    <div class="row" style="margin-top:16px;">
      ${player.devModeEnabled ? `<button class="btn danger" data-action="disable-dev-mode">개발자모드 비활성화</button>` : `<button class="btn primary" data-action="open-dev-auth">개발자모드 버튼</button>`}
    </div>
    ${player.devModeEnabled ? `
      <div class="dev-grid" style="margin-top:16px;">
        <button class="btn secondary" data-action="dev-adjust" data-field="gold" data-value="5000">골드 +5000</button>
        <button class="btn secondary" data-action="dev-adjust" data-field="rankedPointsControl" data-value="50">컨트롤 포인트 +50</button>
        <button class="btn secondary" data-action="dev-adjust" data-field="rankedPointsAuto" data-value="50">오토 포인트 +50</button>
        <button class="btn secondary" data-action="dev-adjust" data-field="kills" data-value="20">킬 +20</button>
        <button class="btn secondary" data-action="dev-adjust" data-field="damage" data-value="5000">데미지 +5000</button>
        <button class="btn secondary" data-action="dev-adjust" data-field="survivalTime" data-value="180">탱커기록 180초</button>
        <button class="btn secondary" data-action="dev-unlock-all">캐릭터 전부 해금</button>
        <button class="btn secondary" data-action="dev-pack">캐릭터팩 테스트</button>
        <button class="btn secondary" data-action="dev-reset-points">랭크 포인트 초기화</button>
      </div>` : ''}
  </div>
`;

const renderLobby = (state) => {
  const player = enrichPlayer(state.activePlayer);
  const tab = state.lobbyTab || 'main';
  const tabContent = {
    main: mainTab(player),
    craft: craftTab(player),
    shop: shopTab(player),
    squad: squadTab(player),
    items: itemsTab(player),
    controlHub: controlHub(player),
    autoHub: autoHub(player),
    controlRooms: roomScreen(state, 'control'),
    autoRooms: roomScreen(state, 'auto'),
    rankings: rankingsScreen(state),
    missions: missionsScreen(player),
  }[tab] || mainTab(player);

  return `
  <div class="page-shell">
    <div class="topbar">
      <div class="profile-panel panel" style="flex:1;">
        <div class="profile-head">
          ${avatarMarkup(player.activeCharacter, player.logoText, 'lg')}
          <div>
            <div class="tag-row">${badge(player.title, 'green')} ${badge(player.tierControl)} ${badge(player.tierAuto)}</div>
            <h2 class="profile-name">${escapeHtml(player.nickname)}</h2>
            <p class="profile-sub">좌측 상단 로고 / 칭호 / 닉네임 구조</p>
          </div>
        </div>
      </div>
      <div class="gold-panel panel">
        <div class="stat-label">보유 골드</div>
        <div class="gold-value">${player.gold.toLocaleString()} G</div>
      </div>
    </div>
    <div class="lobby-layout">
      <aside class="side-nav">
        <div class="panel">
          <div class="nav-list">
            <button class="nav-btn ${tab === 'craft' ? 'active' : ''}" data-action="set-lobby-tab" data-tab="craft">제작소</button>
            <button class="nav-btn ${tab === 'shop' ? 'active' : ''}" data-action="set-lobby-tab" data-tab="shop">상점</button>
            <button class="nav-btn ${tab === 'main' ? 'active' : ''}" data-action="set-lobby-tab" data-tab="main">메인</button>
            <button class="nav-btn ${tab === 'squad' ? 'active' : ''}" data-action="set-lobby-tab" data-tab="squad">스쿼드</button>
            <button class="nav-btn ${tab === 'items' ? 'active' : ''}" data-action="set-lobby-tab" data-tab="items">아이템</button>
          </div>
        </div>
        <div class="panel stack">
          ${renderDevPanel(player)}
          <button class="btn secondary" data-action="logout">로그아웃</button>
        </div>
      </aside>
      <main class="panel content-panel">${tabContent}</main>
    </div>
  </div>`;
};

const renderDeleteModal = (playerId) => `
  <div class="modal-overlay" data-close-modal="true">
    <div class="modal" onclick="event.stopPropagation()">
      <h3 class="modal-title">플레이어 삭제</h3>
      <p class="modal-body">해당 플레이어만 삭제됩니다. 계정 자체는 삭제되지 않습니다. 계정 비밀번호를 입력하세요.</p>
      <div class="stack" style="margin-top:16px;">
        <input id="delete-player-password" class="text-input" type="password" placeholder="계정 비밀번호 입력" />
        <div class="row">
          <button class="btn danger" data-action="confirm-delete-player" data-player-id="${playerId}">삭제 확인</button>
          <button class="btn secondary" data-action="close-modal">취소</button>
        </div>
      </div>
    </div>
  </div>`;

const renderDevAuthModal = () => `
  <div class="modal-overlay" data-close-modal="true">
    <div class="modal" onclick="event.stopPropagation()">
      <h3 class="modal-title">개발자모드 인증</h3>
      <p class="modal-body">개발자 모드를 활성화하려면 숫자 코드 2359를 입력하세요.</p>
      <div class="stack" style="margin-top:16px;">
        <input id="dev-pin" class="text-input" type="password" placeholder="2359 입력" />
        <div class="row">
          <button class="btn primary" data-action="confirm-dev-mode">활성화</button>
          <button class="btn secondary" data-action="close-modal">취소</button>
        </div>
      </div>
    </div>
  </div>`;

const renderCreateRoomModal = (mode) => `
  <div class="modal-overlay" data-close-modal="true">
    <div class="modal" onclick="event.stopPropagation()">
      <h3 class="modal-title">${mode === 'control' ? '컨트롤' : '오토'} 경기방 생성</h3>
      <p class="modal-body">경기당 골드 배팅 금액을 설정할 수 있습니다. 1차 버전에서는 준비/시작 전 단계까지 저장됩니다.</p>
      <div class="stack" style="margin-top:16px;">
        <input id="room-wager" class="text-input" type="number" min="0" step="1" value="10" placeholder="배팅 골드" />
        <div class="row">
          <button class="btn primary" data-action="confirm-create-room" data-mode="${mode}">방 생성</button>
          <button class="btn secondary" data-action="close-modal">취소</button>
        </div>
      </div>
    </div>
  </div>`;

const renderPackModal = (character) => `
  <div class="modal-overlay" data-close-modal="true">
    <div class="modal" onclick="event.stopPropagation()">
      <h3 class="modal-title">캐릭터팩 개봉</h3>
      <div class="pack-stage">
        <div class="pack-box">PACK</div>
        <p class="modal-body">캐릭터팩이 열리며 랜덤 캐릭터를 획득했습니다.</p>
        <div class="pack-reveal">
          ${avatarMarkup(character, character.englishName.slice(0,2), 'lg')}
          <h3 style="margin:14px 0 6px;">${escapeHtml(character.name)}</h3>
          <div class="tag-row" style="justify-content:center;">${badge(character.rarity, 'green')} ${badge(character.ultimate.name)}</div>
        </div>
      </div>
      <div class="row" style="margin-top:18px; justify-content:center;">
        <button class="btn primary" data-action="close-modal">확인</button>
      </div>
    </div>
  </div>`;

const renderBattlePreview = (player, mode = 'control') => {
  const activeChar = player.activeCharacter;
  const enemyChar = CHARACTER_LIST.find((item) => item.id !== activeChar?.id) || CHARACTER_LIST[0];
  const friendExtra = mode === 'auto' ? CHARACTER_MAP[player.autoSquad?.[1]] || activeChar : null;
  return `
  <div class="arena-shell">
    <div class="arena-field">
      <div class="arena-token friend" style="left:12%; top:46%;">${activeChar?.image ? `<img src="${activeChar.image}" alt="" onerror="this.remove()" />` : ''}<span class="avatar-fallback">${escapeHtml(activeChar?.englishName?.slice(0,2) || 'ME')}</span></div>
      ${mode === 'auto' && friendExtra ? `<div class="arena-token friend" style="left:26%; top:60%;">${friendExtra?.image ? `<img src="${friendExtra.image}" alt="" onerror="this.remove()" />` : ''}<span class="avatar-fallback">${escapeHtml(friendExtra?.englishName?.slice(0,2) || 'M2')}</span></div>` : ''}
      <div class="arena-token enemy" style="right:12%; top:40%; left:auto;">${enemyChar?.image ? `<img src="${enemyChar.image}" alt="" onerror="this.remove()" />` : ''}<span class="avatar-fallback">${escapeHtml(enemyChar?.englishName?.slice(0,2) || 'EN')}</span></div>
      ${mode === 'auto' ? `<div class="arena-token enemy" style="right:26%; top:56%; left:auto;">${CHARACTER_LIST[2]?.image ? `<img src="${CHARACTER_LIST[2].image}" alt="" onerror="this.remove()" />` : ''}<span class="avatar-fallback">${escapeHtml(CHARACTER_LIST[2]?.englishName?.slice(0,2) || 'E2')}</span></div>` : ''}
    </div>
    <div class="arena-hud">
      <div class="hud-grid">
        <div class="hud-card">
          <strong>${escapeHtml(activeChar?.name || '-')}
          </strong>
          <div class="inline-note" style="color:#444;">레벨 1 · 내 캐릭터</div>
          <div class="hp-bar" style="margin-top:10px;"><span style="width:78%"></span></div>
          <div class="title-row" style="margin-top:6px;"><span>HP</span><span>780 / 1000</span></div>
          <div class="skill-gauge" style="margin-top:10px;"><span style="width:40%"></span></div>
          <div class="title-row" style="margin-top:6px;"><span>스킬게이지</span><span>40%</span></div>
        </div>
        <div class="hud-card">
          <strong>${escapeHtml(enemyChar?.name || '-')}</strong>
          <div class="inline-note" style="color:#444;">레벨 1 · 상대 캐릭터</div>
          <div class="hp-bar" style="margin-top:10px;"><span style="width:62%"></span></div>
          <div class="title-row" style="margin-top:6px;"><span>HP</span><span>620 / 1000</span></div>
          <div class="skill-gauge" style="margin-top:10px;"><span style="width:70%"></span></div>
          <div class="title-row" style="margin-top:6px;"><span>스킬게이지</span><span>70%</span></div>
        </div>
      </div>
      <div class="battle-actions">
        <button class="btn primary" data-action="close-battle-preview">로비로 돌아가기</button>
      </div>
    </div>
  </div>`;
};

export const render = (state) => {
  switch (state.screen) {
    case 'login': return renderAuthForm('login', state);
    case 'signup': return renderAuthForm('signup', state);
    case 'playerSelect': return renderPlayerSelect(state);
    case 'prep': return renderPrepScreen(state);
    case 'lobby': return renderLobby(state);
    case 'battlePreview': return renderBattlePreview(enrichPlayer(state.activePlayer), state.previewMode || 'control');
    case 'loading':
      return `<div class="center-shell"><div class="auth-card card"><div class="stack" style="align-items:center; text-align:center;">${authIntro}<div class="spinner" style="width:36px;height:36px;border-width:3px;"></div><p class="page-desc">불러오는 중...</p></div></div></div>`;
    default: return renderFirstScreen();
  }
};

export const renderModal = (modal) => {
  if (!modal) return '';
  if (modal.type === 'deletePlayer') return renderDeleteModal(modal.playerId);
  if (modal.type === 'devAuth') return renderDevAuthModal();
  if (modal.type === 'createRoom') return renderCreateRoomModal(modal.mode);
  if (modal.type === 'packResult') return renderPackModal(modal.character);
  return '';
};
