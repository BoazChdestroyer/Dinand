const CANVAS_W = 960;
const CANVAS_H = 540;
const TILE = 40;
const GRAVITY = 0.6;
const MAX_FALL = 12;
const PLAYER_SPEED = 4;
const PLAYER_JUMP = -12;
const PLAYER_MAX_HP = 100;
const PLAYER_START_LIVES = 3;
const INVINCIBLE_TIME = 1500;
const TOTAL_LEVELS = 50;

const COLORS = {
    sky:        '#4a90d9',
    ground:     '#8B4513',
    brick:      '#CD853F',
    stone:      '#808080',
    platform:   '#556B2F',
    spike:      '#CC0000',
    player:     '#3366FF',
    playerHurt: '#FF6666',
    coin:       '#FFD700',
    heart:      '#FF3366',
    ammo:       '#00CC66',
    finish:     '#00FF88',
    healthPack: '#FF69B4',
    lifePack:   '#FF1493',
    weaponBox:  '#9932CC',
    bullet:     '#FFFF00',
    grenade:    '#336633',
    explosion:  '#FF4500',
    whipTrail:  '#C0C0C0',
};

const WEAPON_TYPES = {
    SWORD:      'sword',
    WHIP:       'whip',
    MACHINEGUN: 'machinegun',
    SHOTGUN:    'shotgun',
    GRENADE:    'grenade',
};

const ENEMY_TYPES = {
    WALKER:  'walker',
    JUMPER:  'jumper',
    FLYER:   'flyer',
    TURRET:  'turret',
    BRUTE:   'brute',
};

const TILE_TYPES = {
    EMPTY:    0,
    GROUND:   1,
    BRICK:    2,
    STONE:    3,
    PLATFORM: 4,  // one-way platform
    SPIKE:    5,
};

const COLLECTIBLE_TYPES = {
    COIN:       'coin',
    HEART:      'heart',      // restores 25 HP
    LIFE:       'life',       // +1 life
    AMMO_MG:    'ammo_mg',
    AMMO_SG:    'ammo_sg',
    AMMO_GR:    'ammo_gr',
    WEAPON_WHIP:      'weapon_whip',
    WEAPON_MACHINEGUN:'weapon_machinegun',
    WEAPON_SHOTGUN:   'weapon_shotgun',
    WEAPON_GRENADE:   'weapon_grenade',
};

const GAME_STATES = {
    MENU:       'menu',
    PLAYING:    'playing',
    PAUSED:     'paused',
    GAME_OVER:  'gameover',
    LEVEL_CLEAR:'levelclear',
    WIN:        'win',
};
