// ═══════════════════════════════════════════════════
//  CROWN CLASH  v3  –  Fixed cards + Spell panel + Mobile support
// ═══════════════════════════════════════════════════

const ARENA_BASE_W = 320, ARENA_BASE_H = 560;

// ── Background stars ──────────────────────────────
(function initStars() {
  const bg = document.getElementById('stars-bg');
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    const size = Math.random() * 2.5 + 0.5;
    s.style.cssText = `width:${size}px;height:${size}px;top:${Math.random() * 100}%;left:${Math.random() * 100}%;--dur:${2 + Math.random() * 4}s;--delay:${Math.random() * 4}s`;
    frag.appendChild(s);
  }
  bg.appendChild(frag);
})();

// ── Responsive arena scaling ──────────────────────
// Keeps the 320x560 aspect ratio but shrinks to fit the available
// space on small phones / short viewports / landscape orientation.
function fitArenaToViewport() {
  const wrap = document.getElementById('arena-wrap');
  if (!wrap) return;
  const availW = wrap.clientWidth - 8;
  const availH = wrap.clientHeight - 8;
  const scale = Math.min(1, availW / ARENA_BASE_W, availH / ARENA_BASE_H);
  const root = document.documentElement.style;
  root.setProperty('--arena-w', Math.floor(ARENA_BASE_W * scale) + 'px');
  root.setProperty('--arena-h', Math.floor(ARENA_BASE_H * scale) + 'px');
}
window.addEventListener('resize', fitArenaToViewport);
window.addEventListener('orientationchange', () => setTimeout(fitArenaToViewport, 150));

// ── Card definitions (4 fixed troops) ─────────────
const TROOP_CARDS = [
  { id: 'knight', name: 'Knight', emoji: '⚔️', cost: 3, hp: 320, dmg: 85, spd: 1.2, range: 32, atkSpd: 900, type: 'melee' },
  { id: 'archers', name: 'Archers', emoji: '🏹', cost: 3, hp: 140, dmg: 45, spd: 1.0, range: 85, atkSpd: 1100, type: 'ranged', count: 2 },
  { id: 'giant', name: 'Giant', emoji: '🗿', cost: 5, hp: 750, dmg: 110, spd: 0.6, range: 32, atkSpd: 1600, type: 'melee', target: 'tower' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', cost: 5, hp: 210, dmg: 105, spd: 0.9, range: 95, atkSpd: 1900, type: 'splash', aoe: 44 },
];

// ── Spell definitions ──────────────────────────────
const SPELL_DEFS = [
  { id: 'fireball', name: 'Fireball', emoji: '🔥', cost: 4, dmg: 200, aoe: 55, color: 'rgba(255,80,0,.75)', projType: 'fireball' },
  { id: 'lightning', name: 'Lightning', emoji: '⚡', cost: 3, dmg: 280, aoe: 0, color: 'rgba(255,255,80,.9)', projType: 'lightning', chainCount: 3, chainDmg: 0.5 },
  { id: 'freeze', name: 'Freeze', emoji: '❄️', cost: 4, dmg: 0, aoe: 70, color: 'rgba(150,220,255,.6)', projType: 'ice', freezeDur: 2500 },
];

// ── AI card pool (weaker units) ────────────────────
const AI_CARDS = [
  { id: 'goblin', name: 'Goblin', emoji: '👺', cost: 2, hp: 90, dmg: 55, spd: 1.6, range: 25, atkSpd: 750, type: 'melee', count: 3 },
  { id: 'skeleton', name: 'Skeletons', emoji: '💀', cost: 1, hp: 60, dmg: 40, spd: 1.5, range: 25, atkSpd: 700, type: 'melee', count: 3 },
  { id: 'mini', name: 'Mini P.', emoji: '🤖', cost: 4, hp: 370, dmg: 160, spd: 1.0, range: 30, atkSpd: 1700, type: 'melee' },
  { id: 'musket', name: 'Musketeer', emoji: '🔫', cost: 4, hp: 180, dmg: 80, spd: 0.9, range: 90, atkSpd: 1400, type: 'ranged' },
  { id: 'barbarian', name: 'Barbarian', emoji: '🪓', cost: 5, hp: 250, dmg: 90, spd: 1.1, range: 28, atkSpd: 900, type: 'melee', count: 2 },
];

// ── Tower layout ───────────────────────────────────
const TOWER_CFGS = [
  { id: 'e-left', team: 'red', x: 75, y: 80, isKing: false, maxHp: 800 },
  { id: 'e-king', team: 'red', x: 160, y: 48, isKing: true, maxHp: 1400 },
  { id: 'e-right', team: 'red', x: 245, y: 80, isKing: false, maxHp: 800 },
  { id: 'p-left', team: 'blue', x: 75, y: 480, isKing: false, maxHp: 800 },
  { id: 'p-king', team: 'blue', x: 160, y: 512, isKing: true, maxHp: 1400 },
  { id: 'p-right', team: 'blue', x: 245, y: 480, isKing: false, maxHp: 800 },
];

// ── Globals ────────────────────────────────────────
let G = {};
const arena = document.getElementById('arena');
const placementOverlay = document.getElementById('placement-overlay');
const placementHint = document.getElementById('placement-hint');
const elixirFill = document.getElementById('elixir-fill');
const elixirNum = document.getElementById('elixir-num');
const timerEl = document.getElementById('timer');
const cardHand = document.getElementById('card-hand');
const spellPanel = document.getElementById('spell-panel');
const battleLog = document.getElementById('battle-log');

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function showMenu() {
  stopGame();
  showScreen('menu');
}

function buildTowers() {
  const towers = {};
  TOWER_CFGS.forEach(cfg => {
    towers[cfg.id] = {
      ...cfg,
      hp: cfg.maxHp,
      destroyed: false,
      lastShot: 0,
      shotCooldown: 1800,
      dmg: cfg.isKing ? 90 : 65,
      range: cfg.isKing ? 105 : 88,
    };
  });
  return towers;
}

// ── Start / Stop ───────────────────────────────────
function startGame() {
  stopGame();
  G = {
    running: true,
    time: 180,
    elixir: 5,
    elixirMax: 10,
    elixirRate: 1 / 2.8,
    selectedCard: null,
    selectedSpell: null,
    selectedSlot: null,
    isSpellMode: false,
    units: [],
    projectiles: [],
    nextId: 1,
    playerCrowns: 0,
    enemyCrowns: 0,
    elixirSpent: 0,
    unitsDeployed: 0,
    // AI — noticeably weaker & slower
    aiElixir: 3,
    aiElixirRate: 1 / 4.5,
    aiTimer: 5 + Math.random() * 4, // wait before first move
    aiMaxUnits: 4, // cap AI units on field
    lastTime: null,
    raf: null,
    towers: buildTowers(),
    spellCooldowns: { fireball: 0, lightning: 0, freeze: 0 },
  };
  showScreen('game');
  fitArenaToViewport();
  clearArena();
  buildTowerEls();
  buildCardHandUI();
  buildSpellPanelUI();
  updateCrowns();
  buildTowerStatusPanel();
  updateSidePanel();
  battleLog.innerHTML = '';
  addLog('Battle started! 👑', 'gold');
  G.raf = requestAnimationFrame(gameLoop);
}

function stopGame() {
  if (G.raf) {
    cancelAnimationFrame(G.raf);
    G.raf = null;
  }
  if (G) G.running = false;
}

function clearArena() {
  arena.querySelectorAll('.tower,.unit,.projectile,.dmg-num,.spawn-flash,.explosion,.freeze-ring,.lightning-strike')
    .forEach(el => el.remove());
}

// ── Tower elements ─────────────────────────────────
function buildTowerEls() {
  Object.values(G.towers).forEach(t => {
    const el = document.createElement('div');
    el.className = `tower ${t.team}`;
    el.id = `tower-${t.id}`;
    el.style.left = (t.x - 22) + 'px';
    el.style.top = (t.y - 22) + 'px';
    el.innerHTML = `${t.isKing ? '👑' : (t.team === 'blue' ? '🏰' : '🏯')}<div class="tower-hp-bar"><div class="tower-hp-fill" id="thp-${t.id}" style="width:100%"></div></div>`;
    arena.appendChild(el);
  });
}

function updateTowerEl(t) {
  const el = document.getElementById(`tower-${t.id}`);
  if (!el) return;
  const fill = document.getElementById(`thp-${t.id}`);
  if (fill) fill.style.width = Math.max(0, t.hp / t.maxHp * 100) + '%';
  if (t.destroyed) el.classList.add('destroyed');
}

// ── Card hand (fixed 4 troops, always same) ────────
function buildCardHandUI() {
  cardHand.innerHTML = '';
  TROOP_CARDS.forEach((card, i) => {
    const el = document.createElement('div');
    el.className = 'card';
    el.id = `card-slot-${i}`;
    el.innerHTML = `<span class="card-cost">${card.cost}</span><span class="card-emoji">${card.emoji}</span><span class="card-name">${card.name}</span>`;
    el.addEventListener('pointerup', (e) => { e.preventDefault(); selectTroopCard(i); });
    cardHand.appendChild(el);
  });
}

function selectTroopCard(i) {
  const card = TROOP_CARDS[i];
  if (G.elixir < card.cost) { shake(); return; }
  if (G.selectedSlot === i && !G.isSpellMode) { deselectAll(); return; }
  deselectAll();
  G.selectedSlot = i;
  G.selectedCard = card;
  G.isSpellMode = false;
  document.getElementById(`card-slot-${i}`).className = 'card selected';
  placementOverlay.classList.add('active');
  placementHint.textContent = 'Tap your half to place!';
  placementHint.classList.add('show');
  updateCardStates();
}

function updateCardStates() {
  TROOP_CARDS.forEach((card, i) => {
    const el = document.getElementById(`card-slot-${i}`);
    if (!el) return;
    const selected = G.selectedSlot === i && !G.isSpellMode;
    const disabled = G.elixir < card.cost;
    el.className = `card${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`;
  });
  SPELL_DEFS.forEach(sp => {
    const el = document.getElementById(`spell-btn-${sp.id}`);
    if (!el) return;
    const selected = G.isSpellMode && G.selectedSpell?.id === sp.id;
    const disabled = G.elixir < sp.cost || Date.now() < G.spellCooldowns[sp.id];
    el.className = `spell-btn${selected ? ' selected' : ''}${disabled ? ' disabled' : ''}`;
    const overlay = document.getElementById(`scd-${sp.id}`);
    if (overlay) {
      const remaining = Math.ceil((G.spellCooldowns[sp.id] - Date.now()) / 1000);
      overlay.style.display = remaining > 0 ? 'flex' : 'none';
      if (remaining > 0) overlay.textContent = remaining + 's';
    }
  });
}

// ── Spell panel ─────────────────────────────────────
function buildSpellPanelUI() {
  spellPanel.querySelectorAll('.spell-btn').forEach(el => el.remove());
  SPELL_DEFS.forEach(sp => {
    const btn = document.createElement('div');
    btn.className = 'spell-btn';
    btn.id = `spell-btn-${sp.id}`;
    btn.innerHTML = `<span class="s-cost">${sp.cost}</span><span class="s-emoji">${sp.emoji}</span><span class="s-name">${sp.name}</span><div class="spell-cooldown-overlay" id="scd-${sp.id}" style="display:none"></div>`;
    btn.addEventListener('pointerup', (e) => { e.preventDefault(); selectSpell(sp.id); });
    spellPanel.appendChild(btn);
  });
}

function selectSpell(id) {
  const sp = SPELL_DEFS.find(s => s.id === id);
  if (!sp) return;
  if (G.elixir < sp.cost) { shake(); return; }
  if (Date.now() < G.spellCooldowns[id]) { shake(); return; }
  if (G.isSpellMode && G.selectedSpell?.id === id) { deselectAll(); return; }
  deselectAll();
  G.selectedSpell = sp;
  G.isSpellMode = true;
  document.getElementById(`spell-btn-${id}`).className = 'spell-btn selected';
  placementOverlay.classList.add('active');
  placementHint.textContent = 'Tap anywhere to cast!';
  placementHint.classList.add('show');
  const cursor = document.createElement('div');
  cursor.className = 'placement-cursor spell';
  placementOverlay.appendChild(cursor);
  updateCardStates();
}

function deselectAll() {
  G.selectedSlot = null;
  G.selectedCard = null;
  G.selectedSpell = null;
  G.isSpellMode = false;
  placementOverlay.classList.remove('active');
  placementHint.classList.remove('show');
  const cursor = placementOverlay.querySelector('.placement-cursor');
  if (cursor) cursor.remove();
  updateCardStates();
}

// ── Placement overlay events (mouse + touch via Pointer Events) ──
placementOverlay.addEventListener('pointerdown', function (e) {
  const rect = arena.getBoundingClientRect();
  const scaleX = ARENA_BASE_W / rect.width;
  const scaleY = ARENA_BASE_H / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;

  if (G.isSpellMode && G.selectedSpell) {
    castSpell(G.selectedSpell, x, y, 'blue');
    G.elixir -= G.selectedSpell.cost;
    G.elixirSpent += G.selectedSpell.cost;
    G.spellCooldowns[G.selectedSpell.id] = Date.now() + 3000;
    deselectAll();
    updateElixir();
    updateCardStates();
  } else if (G.selectedCard) {
    if (y < ARENA_BASE_H * 0.53) { addLog('Place in your half!', 'bad'); shake(); return; }
    G.elixir -= G.selectedCard.cost;
    G.elixirSpent += G.selectedCard.cost;
    spawnUnit(G.selectedCard, x, y, 'blue');
    G.unitsDeployed++;
    deselectAll();
    updateElixir();
    updateCardStates();
    updateSidePanel();
  }
});

placementOverlay.addEventListener('pointermove', function (e) {
  const rect = arena.getBoundingClientRect();
  const scaleX = ARENA_BASE_W / rect.width;
  const scaleY = ARENA_BASE_H / rect.height;
  const x = (e.clientX - rect.left) * scaleX;
  const y = (e.clientY - rect.top) * scaleY;
  let cursor = placementOverlay.querySelector('.placement-cursor');
  if (!cursor) {
    cursor = document.createElement('div');
    cursor.className = `placement-cursor${G.isSpellMode ? ' spell' : ''}`;
    placementOverlay.appendChild(cursor);
  }
  cursor.style.left = (x / scaleX) + 'px';
  cursor.style.top = (y / scaleY) + 'px';
});

placementOverlay.addEventListener('pointerleave', function () {
  const cursor = placementOverlay.querySelector('.placement-cursor');
  if (cursor) cursor.remove();
});

function shake() {
  arena.style.transform = 'translateX(-4px)';
  setTimeout(() => { arena.style.transform = 'translateX(4px)'; }, 80);
  setTimeout(() => { arena.style.transform = ''; }, 160);
}

// ── Unit spawning ──────────────────────────────────
function spawnUnit(card, x, y, team) {
  const count = card.count || 1;
  for (let c = 0; c < count; c++) {
    const offsetX = (c - (count - 1) / 2) * 18;
    const uid = G.nextId++;
    const unit = {
      id: uid,
      cardId: card.id,
      emoji: card.emoji,
      team,
      x: Math.max(14, Math.min(ARENA_BASE_W - 14, x + offsetX)),
      y: Math.max(50, Math.min(ARENA_BASE_H - 80, y)),
      hp: card.hp,
      maxHp: card.hp,
      dmg: card.dmg,
      spd: card.spd * 25,
      range: card.range,
      atkSpd: card.atkSpd,
      type: card.type,
      target: card.target || 'any',
      aoe: card.aoe || 0,
      lastAtk: 0,
      state: 'march',
      frozen: false,
      frozenUntil: 0,
      el: null,
    };
    const el = document.createElement('div');
    el.className = `unit ${team}`;
    el.id = `unit-${uid}`;
    el.innerHTML = `${card.emoji}<div class="unit-hp-bar"><div class="unit-hp-fill" id="uhp-${uid}" style="width:100%"></div></div>`;
    el.style.left = (unit.x - 14) + 'px';
    el.style.top = (unit.y - 14) + 'px';
    arena.appendChild(el);
    unit.el = el;
    G.units.push(unit);

    const flash = document.createElement('div');
    flash.className = `spawn-flash ${team}`;
    flash.style.left = (unit.x - 20) + 'px';
    flash.style.top = (unit.y - 20) + 'px';
    arena.appendChild(flash);
    setTimeout(() => flash.remove(), 500);
  }
  addLog(`${team === 'blue' ? '🔵' : '🔴'} ${card.name} deployed!`, team === 'blue' ? 'good' : 'bad');
}

// ── Spell casting ──────────────────────────────────
function castSpell(sp, x, y, team) {
  const enemyTeam = team === 'blue' ? 'red' : 'blue';

  if (sp.id === 'fireball') {
    spawnExplosion(x, y, sp.aoe, sp.color);
    G.units.forEach(u => {
      if (u.team === team) return;
      const d = dist2d(u.x, u.y, x, y);
      if (d < sp.aoe) dealDamage(u, sp.dmg * (1 - d / sp.aoe * 0.5));
    });
    Object.values(G.towers).forEach(t => {
      if (t.team === team || t.destroyed) return;
      if (dist2d(t.x, t.y, x, y) < sp.aoe) damageTower(t, sp.dmg * 0.55);
    });
    addLog('🔥 Fireball cast!', 'spell');
  }

  if (sp.id === 'lightning') {
    const targets = G.units
      .filter(u => u.team === enemyTeam)
      .map(u => ({ x: u.x, y: u.y, unit: u }))
      .sort((a, b) => dist2d(a.x, a.y, x, y) - dist2d(b.x, b.y, x, y));
    const hit = targets.slice(0, sp.chainCount);
    hit.forEach((h, i) => {
      const dmg = i === 0 ? sp.dmg : sp.dmg * sp.chainDmg;
      setTimeout(() => {
        showLightningStrike(x, y, h.x, h.y);
        dealDamage(h.unit, dmg);
      }, i * 120);
    });
    if (hit.length < sp.chainCount) {
      const t = getNearestEnemyTower(team);
      if (t) {
        setTimeout(() => {
          showLightningStrike(x, y, t.x, t.y);
          damageTower(t, sp.dmg * 0.4);
        }, hit.length * 120);
      }
    }
    addLog('⚡ Lightning strikes!', 'spell');
  }

  if (sp.id === 'freeze') {
    spawnFreezeRing(x, y, sp.aoe);
    const now = Date.now();
    G.units.forEach(u => {
      if (u.team === team) return;
      if (dist2d(u.x, u.y, x, y) < sp.aoe) {
        u.frozen = true;
        u.frozenUntil = now + sp.freezeDur;
        if (u.el) u.el.classList.add('frozen');
      }
    });
    addLog('❄️ Freeze!', 'spell');
  }
}

function spawnExplosion(x, y, aoe, color) {
  const el = document.createElement('div');
  el.className = 'explosion';
  el.style.left = (x - aoe / 2) + 'px';
  el.style.top = (y - aoe / 2) + 'px';
  el.style.width = aoe + 'px';
  el.style.height = aoe + 'px';
  el.style.background = color;
  arena.appendChild(el);
  setTimeout(() => el.remove(), 600);
}

function spawnFreezeRing(x, y, aoe) {
  const el = document.createElement('div');
  el.className = 'freeze-ring';
  el.style.left = (x - aoe / 2) + 'px';
  el.style.top = (y - aoe / 2) + 'px';
  el.style.width = aoe + 'px';
  el.style.height = aoe + 'px';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 700);
}

function showLightningStrike(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;
  const el = document.createElement('div');
  el.className = 'lightning-strike';
  el.style.left = x1 + 'px';
  el.style.top = y1 + 'px';
  el.style.height = len + 'px';
  el.style.transformOrigin = 'top center';
  el.style.transform = `rotate(${angle + 90}deg)`;
  arena.appendChild(el);
  setTimeout(() => el.remove(), 350);
}

function getNearestEnemyTower(myTeam) {
  const order = myTeam === 'blue' ? ['e-left', 'e-right', 'e-king'] : ['p-left', 'p-right', 'p-king'];
  for (const id of order) {
    const t = G.towers[id];
    if (t && !t.destroyed) return t;
  }
  return null;
}

function dist2d(ax, ay, bx, by) {
  const dx = ax - bx, dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

// ── Game loop ──────────────────────────────────────
function gameLoop(ts) {
  if (!G.running) return;
  const dt = G.lastTime ? (ts - G.lastTime) / 1000 : 0;
  G.lastTime = ts;

  G.time -= dt;
  if (G.time <= 0) { G.time = 0; endGame(null); return; }

  const minutes = Math.floor(G.time / 60), seconds = Math.floor(G.time % 60);
  timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  timerEl.classList.toggle('urgent', G.time <= 30);

  G.elixir = Math.min(G.elixirMax, G.elixir + G.elixirRate * dt);
  G.aiElixir = Math.min(G.elixirMax, G.aiElixir + G.aiElixirRate * dt);
  updateElixir();
  updateCardStates();

  G.aiTimer -= dt;
  if (G.aiTimer <= 0) aiTick();

  updateUnits(ts, dt);
  towerFire(ts);
  updateProjectiles(dt);
  updateSidePanel();
  updateTowerStatusPanel();

  G.raf = requestAnimationFrame(gameLoop);
}

function updateElixir() {
  elixirFill.style.width = (G.elixir / G.elixirMax * 100) + '%';
  elixirNum.textContent = Math.floor(G.elixir);
}

// ── Unit AI & movement ─────────────────────────────
function updateUnits(ts, dt) {
  const now = Date.now();
  const toRemove = [];

  G.units.forEach(unit => {
    if (unit.hp <= 0) { toRemove.push(unit); return; }

    if (unit.frozen && now >= unit.frozenUntil) {
      unit.frozen = false;
      if (unit.el) unit.el.classList.remove('frozen');
    }
    if (unit.frozen) return;

    const target = findTarget(unit);
    if (target) {
      const dx = target.x - unit.x, dy = target.y - unit.y;
      const d = dist2d(unit.x, unit.y, target.x, target.y);
      if (d <= unit.range) {
        unit.state = 'attack';
        if (ts - unit.lastAtk >= unit.atkSpd) {
          unit.lastAtk = ts;
          if (target.maxHp !== undefined && target.isKing !== undefined) {
            damageTower(target, unit.dmg);
            shootProjectile(unit, target);
          } else {
            dealDamage(target, unit.dmg);
            if (unit.type === 'ranged' || unit.type === 'splash') shootProjectile(unit, target);
            if (unit.type === 'splash') {
              G.units.forEach(u => {
                if (u.team === unit.team || u.id === target.id) return;
                if (dist2d(u.x, u.y, target.x, target.y) < (unit.aoe || 44)) dealDamage(u, unit.dmg * 0.6);
              });
            }
          }
        }
      } else {
        unit.state = 'march';
        const spd = unit.spd * dt;
        unit.x += dx / d * spd;
        unit.y += dy / d * spd;
      }
    } else {
      unit.state = 'march';
      const targetY = unit.team === 'blue' ? 55 : ARENA_BASE_H - 55;
      const dy = targetY - unit.y;
      if (Math.abs(dy) > 5) unit.y += Math.sign(dy) * unit.spd * dt;
    }

    unit.x = Math.max(14, Math.min(ARENA_BASE_W - 14, unit.x));
    unit.y = Math.max(50, Math.min(ARENA_BASE_H - 80, unit.y));

    if (unit.el) {
      unit.el.style.left = (unit.x - 14) + 'px';
      unit.el.style.top = (unit.y - 14) + 'px';
      const fill = document.getElementById(`uhp-${unit.id}`);
      if (fill) fill.style.width = Math.max(0, unit.hp / unit.maxHp * 100) + '%';
    }
  });

  toRemove.forEach(u => removeUnit(u));
}

function findTarget(unit) {
  const enemyTeam = unit.team === 'blue' ? 'red' : 'blue';
  if (unit.target !== 'tower') {
    let best = null, bestDist = Infinity;
    G.units.forEach(u => {
      if (u.team !== enemyTeam || u.hp <= 0) return;
      const d = dist2d(u.x, u.y, unit.x, unit.y);
      if (d < bestDist) { bestDist = d; best = u; }
    });
    if (best && bestDist < 130) return best;
  }
  const order = unit.team === 'blue' ? ['e-left', 'e-right', 'e-king'] : ['p-left', 'p-right', 'p-king'];
  for (const id of order) {
    const t = G.towers[id];
    if (!t || t.destroyed) continue;
    if (t.isKing) {
      const sidesDead = order.filter(i => !G.towers[i]?.isKing).every(i => G.towers[i]?.destroyed);
      if (!sidesDead) continue;
    }
    return t;
  }
  return null;
}

function dealDamage(unit, dmg) {
  if (!unit || unit.hp <= 0) return;
  unit.hp -= dmg;
  showDmgNum(unit.x, unit.y, Math.round(dmg), unit.team);
  if (unit.hp <= 0) unit.hp = 0;
}

function removeUnit(unit) {
  const i = G.units.indexOf(unit);
  if (i >= 0) G.units.splice(i, 1);
  if (unit.el) unit.el.remove();
}

function damageTower(tower, dmg) {
  if (!tower || tower.destroyed) return;
  tower.hp -= dmg;
  showDmgNum(tower.x, tower.y, Math.round(dmg), tower.team);
  updateTowerEl(tower);
  if (tower.hp <= 0) { tower.hp = 0; destroyTower(tower); }
}

function destroyTower(tower) {
  tower.destroyed = true;
  updateTowerEl(tower);
  addLog(tower.team === 'red' ? '👑 Crown!' : '💀 Tower lost!', tower.team === 'red' ? 'gold' : 'bad');
  if (tower.team === 'red') {
    G.playerCrowns++;
    updateCrowns();
    if (G.playerCrowns >= 3) { endGame('blue'); return; }
  } else {
    G.enemyCrowns++;
    updateCrowns();
    if (G.enemyCrowns >= 3) { endGame('red'); return; }
  }
}

// ── Tower fire ─────────────────────────────────────
function towerFire(ts) {
  Object.values(G.towers).forEach(tower => {
    if (tower.destroyed) return;
    if (ts - tower.lastShot < tower.shotCooldown) return;
    const enemyTeam = tower.team === 'blue' ? 'red' : 'blue';
    let target = null, bestDist = tower.range;
    G.units.forEach(u => {
      if (u.team !== enemyTeam) return;
      const d = dist2d(u.x, u.y, tower.x, tower.y);
      if (d < bestDist) { bestDist = d; target = u; }
    });
    if (target) {
      tower.lastShot = ts;
      dealDamage(target, tower.dmg);
      shootProjectile({ x: tower.x, y: tower.y, type: 'ranged' }, target);
    }
  });
}

// ── Projectiles ────────────────────────────────────
function shootProjectile(from, to) {
  const proj = {
    id: G.nextId++,
    x: from.x,
    y: from.y,
    tx: to.x,
    ty: to.y,
    spd: 280,
    type: from.type === 'ranged' ? 'arrow' : from.type === 'splash' ? 'fireball' : 'arrow',
    done: false,
  };
  const el = document.createElement('div');
  el.className = `projectile ${proj.type}`;
  el.style.left = proj.x + 'px';
  el.style.top = proj.y + 'px';
  arena.appendChild(el);
  proj.el = el;
  G.projectiles.push(proj);
}

function updateProjectiles(dt) {
  const toRemove = [];
  G.projectiles.forEach(p => {
    const dx = p.tx - p.x, dy = p.ty - p.y, d = dist2d(p.x, p.y, p.tx, p.ty);
    if (d < 5) { toRemove.push(p); return; }
    const spd = p.spd * dt;
    p.x += dx / d * Math.min(spd, d);
    p.y += dy / d * Math.min(spd, d);
    if (p.el) { p.el.style.left = p.x + 'px'; p.el.style.top = p.y + 'px'; }
  });
  toRemove.forEach(p => {
    if (p.el) p.el.remove();
    G.projectiles.splice(G.projectiles.indexOf(p), 1);
  });
}

// ── Damage floaters ────────────────────────────────
function showDmgNum(x, y, dmg, team) {
  const el = document.createElement('div');
  el.className = 'dmg-num';
  el.textContent = dmg;
  el.style.left = (x - 10 + Math.random() * 10 - 5) + 'px';
  el.style.top = (y - 10) + 'px';
  el.style.color = team === 'blue' ? '#ff6655' : '#6ab8ff';
  arena.appendChild(el);
  setTimeout(() => el.remove(), 900);
}

// ── Crowns ─────────────────────────────────────────
function updateCrowns() {
  ['player-crowns', 'enemy-crowns'].forEach((id, teamIdx) => {
    const row = document.getElementById(id);
    row.innerHTML = '';
    const count = teamIdx === 0 ? G.playerCrowns : G.enemyCrowns;
    for (let i = 0; i < 3; i++) {
      const span = document.createElement('span');
      span.className = `crown-icon${i < count ? ' earned' : ''}`;
      span.textContent = '👑';
      row.appendChild(span);
    }
  });
}

// ── Side panel ─────────────────────────────────────
function buildTowerStatusPanel() {
  const wrap = document.getElementById('tower-status-wrap');
  wrap.innerHTML = '';
  const order = ['p-king', 'p-left', 'p-right', 'e-king', 'e-left', 'e-right'];
  const labels = {
    'p-king': '👑 King', 'p-left': '🏰 Left', 'p-right': '🏰 Right',
    'e-king': '👑 E.King', 'e-left': '🏯 E.Left', 'e-right': '🏯 E.Right',
  };
  order.forEach(id => {
    const t = G.towers[id];
    const row = document.createElement('div');
    row.className = 'ts-row';
    row.innerHTML = `<span style="font-size:11px;color:var(--text-dim);min-width:60px">${labels[id]}</span><div class="ts-bar-wrap"><div class="ts-bar ${t.team}" id="spthp-${id}" style="width:100%"></div></div><span class="ts-label" id="sptxt-${id}">${t.hp}</span>`;
    wrap.appendChild(row);
  });
}

function updateTowerStatusPanel() {
  ['p-king', 'p-left', 'p-right', 'e-king', 'e-left', 'e-right'].forEach(id => {
    const t = G.towers[id];
    const bar = document.getElementById(`spthp-${id}`);
    const txt = document.getElementById(`sptxt-${id}`);
    if (bar) bar.style.width = Math.max(0, t.hp / t.maxHp * 100) + '%';
    if (txt) txt.textContent = t.destroyed ? '💀' : Math.max(0, Math.round(t.hp));
  });
}

function updateSidePanel() {
  const crownsEl = document.getElementById('sp-crowns');
  if (crownsEl) crownsEl.textContent = `${G.playerCrowns} – ${G.enemyCrowns}`;
  const unitsEl = document.getElementById('sp-units');
  if (unitsEl) {
    const playerUnits = G.units.filter(u => u.team === 'blue').length;
    const enemyUnits = G.units.filter(u => u.team === 'red').length;
    unitsEl.textContent = `${playerUnits} / ${enemyUnits}`;
  }
  const elixirEl = document.getElementById('sp-elixir');
  if (elixirEl) elixirEl.textContent = G.elixirSpent;
}

// ── Battle log ─────────────────────────────────────
function addLog(msg, cls = '') {
  const el = document.createElement('div');
  el.className = `log-entry ${cls}`;
  el.textContent = msg;
  battleLog.prepend(el);
  while (battleLog.children.length > 20) battleLog.lastChild.remove();
}

// ── AI (nerfed) ────────────────────────────────────
function aiTick() {
  const aliveAI = G.units.filter(u => u.team === 'red').length;
  if (aliveAI >= G.aiMaxUnits) { G.aiTimer = 2 + Math.random() * 2; return; }

  const affordable = AI_CARDS.filter(c => G.aiElixir >= c.cost);
  if (!affordable.length) { G.aiTimer = 1.5 + Math.random() * 2.5; return; }

  // Weighted random: prefer cheaper cards (less aggression)
  const sorted = [...affordable].sort((a, b) => a.cost - b.cost);
  const idx = Math.random() < 0.65
    ? Math.floor(Math.random() * Math.ceil(sorted.length / 2))
    : Math.floor(Math.random() * sorted.length);
  const card = sorted[idx];

  G.aiElixir -= card.cost;

  const laneXs = [70, 160, 250];
  const laneX = laneXs[Math.floor(Math.random() * laneXs.length)];
  const y = 75 + Math.random() * 175;
  spawnUnit(card, laneX + (Math.random() * 24 - 12), y, 'red');

  // AI base delay: 5–9s, slightly faster in the last 30s
  G.aiTimer = 5 + Math.random() * 4;
  if (G.time < 30) G.aiTimer *= 0.65;
}

// ── End game ───────────────────────────────────────
function endGame(winner) {
  stopGame();
  if (!winner) {
    if (G.playerCrowns > G.enemyCrowns) winner = 'blue';
    else if (G.enemyCrowns > G.playerCrowns) winner = 'red';
    else winner = 'draw';
  }

  let title, subtitle;
  if (winner === 'blue') { title = '🏆 Victory!'; subtitle = 'The enemy has been crushed'; }
  else if (winner === 'red') { title = '💀 Defeat!'; subtitle = 'Your kingdom fell'; }
  else { title = '🤝 Draw!'; subtitle = 'An equal battle ends'; }

  const titleEl = document.getElementById('go-title');
  titleEl.textContent = title;
  titleEl.className = `go-title ${winner === 'blue' ? 'win' : 'lose'}`;
  document.getElementById('go-sub').textContent = subtitle;
  document.getElementById('go-crowns').textContent = `${G.playerCrowns} – ${G.enemyCrowns}`;
  document.getElementById('go-elixir').textContent = G.elixirSpent;
  document.getElementById('go-units').textContent = G.unitsDeployed;
  setTimeout(() => showScreen('gameover'), 800);
}