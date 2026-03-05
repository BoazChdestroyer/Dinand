# Combat Platformer

Een 2D side-scrolling platformer gebouwd met vanilla JavaScript en HTML5 Canvas.

## Spelen

Open `index.html` in een browser, of serveer de map met een eenvoudige HTTP-server:

```bash
# met Python
python -m http.server 8000

# met Node.js (npx)
npx serve .
```

## Besturing

| Toets | Actie |
|---|---|
| ←→ / A D | Lopen |
| ↑ / W / SPACE | Springen |
| ↓ / S | Bukken (val door platforms) |
| X / J | Aanvallen |
| Q / , | Vorig wapen |
| E / . | Volgend wapen |
| ESC / P | Pauze |

## Wapens

- **Zwaard** - Altijd beschikbaar, melee
- **Zweep** - Unlock in level 1, langere range, sneller
- **Machinegeweer** - Unlock in level 2, snelvuur (munitie nodig)
- **Shotgun** - Unlock in level 4, breed schot (munitie nodig)
- **Granaat** - Unlock in level 7, area of effect (munitie nodig)

## Vijanden

- **Walker** - Loopt heen en weer (vanaf level 1)
- **Jumper** - Springt richting speler (vanaf level 3)
- **Flyer** - Vliegt richting speler (vanaf level 6)
- **Turret** - Schiet kogels (vanaf level 10)
- **Brute** - Groot, veel HP (vanaf level 15)

## Eigen Levels Maken

Levels worden geladen via de `LEVEL_DEFS` array in `js/level.js`, of automatisch gegenereerd. Bekijk `levels/level-format.json` voor de volledige documentatie van het formaat.

Een level is een object met:
- `tiles`: 2D array met tile-nummers (0=leeg, 1=grond, 2=baksteen, 3=steen, 4=platform, 5=spikes)
- `spawn`: [kolom, rij] startpositie
- `finish`: [kolom, rij] positie van de finish-vlag
- `enemies`: Array van [kolom, rij, type]
- `collectibles`: Array van [kolom, rij, type]
- `bgColor`: achtergrondkleur

## Projectstructuur

```
game/
├── index.html          # Entry point
├── js/
│   ├── constants.js    # Game constanten en enums
│   ├── utils.js        # Helper functies
│   ├── input.js        # Keyboard input manager
│   ├── camera.js       # Camera (volgt speler, screen shake)
│   ├── particles.js    # Particle effects
│   ├── weapons.js      # Weapon, Projectile, MeleeAttack classes
│   ├── player.js       # Player class
│   ├── enemies.js      # Enemy class met 5 types
│   ├── collectibles.js # Coins, health, ammo, wapen pickups
│   ├── level.js        # Level class + procedurele generator
│   ├── hud.js          # Heads-up display
│   ├── menu.js         # Menu systeem + highscores
│   ├── game.js         # Game class (state manager)
│   └── main.js         # Bootstrap
└── levels/
    └── level-format.json  # Documentatie level-formaat
```
