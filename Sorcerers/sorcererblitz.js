const {ArgumentError} = require('lib/world/errors');
const Vector = require('lib/world/vector');

const RED = 'red';
const BLUE = 'blue';

const FIRE = 'fire';
const WATER = 'water';
const EARTH = 'earth';
const MANA_TYPES = [FIRE, WATER, EARTH];

const MIDDLE_X = 50;

// element - [weakVSt, strongVS]
const SPELL_PAIRS = {
    [FIRE]: [WATER, EARTH],
    [WATER]: [EARTH, FIRE],
    [EARTH]: [FIRE, WATER],
};

// Mana fruits
const GRID_X0 = 40;
const GRID_Y0 = 12;
const GRID_CELL_WIDTH = 10;
const GRID_CELL_HEIGHT = 10;
const GRID_IN_ROW = 1;
const GRID_IN_COLUMN = 6;
const CHIPS_ON_CELL = 3;
const CHIP_R = 3;
const CHIP_DIFF = Math.PI * 2 / CHIPS_ON_CELL;
const CELLS = 6;
const CORNER_TILES = [
  Vector(15, 17),
  Vector(15, 67),
];

const MAX_GROW_VALUE = 3;
const MAX_GROW_TIME = 60;
const GROW_RATE_PER_SECOND = (MAX_GROW_VALUE - 1) / MAX_GROW_TIME;
let GROW_RATE;
const BASE_REGROW_TIME = 6;
const BASE_REGROW_COEF = 0.5;



const HERO_HEALTH = 1000;
const SUDDEN_DEATH_START = 120;
const SUDDEN_DEATH_HP_PER_SECOND = HERO_HEALTH / (180 - SUDDEN_DEATH_START);

const MAX_UNITS = 8; // units and collectors
const MAX_COLLECTORS = 8;
const SPAWN_COOLDOWN_BASE = 1.4;
const SPAWN_COOLDOWNS = Array(20).fill(0).map((n, i) => Math.floor(1 + Math.pow(1.5, i)));
const SPAWN_POINTS = {
    [RED]: Vector(15, 42),
    [BLUE]: Vector(85, 42)
};
const SPAWN_TEMP_POINTS = {
    [RED]: Vector(12, 42),
    [BLUE]: Vector(87, 42)
};
const TEMP_SPELL_Z = 14;
const TEMP_COST_TO_SCALE = 2;

const DROP_DISTANCE_SQ = 9;
const PICK_DISTANCE_SQ = 4;
const COLLECTOR_LIFE = 20;


const SPELL_POINTS = {
    [RED]: Vector(13, 42),
    [BLUE]: Vector(87, 42)
};
const SPELL_TARGET = {
    [BLUE]: Vector(0, 42),
    [RED]: Vector(100, 42)
};
const SPELL_HERO_HIT_X = {
    [RED]: 8,
    [BLUE]: 92
};
const SPELL_WALL_HIT_X = {
    [RED]: 14,
    [BLUE]: 86
};
const SPELL_ULTRA_SHIELD_HIT_XS = {
    [RED]: [17, 23],
    [BLUE]: [77, 83]
};
const SHIELD_POS = {
    [RED]: Vector(11, 42),
    [BLUE]: Vector(89, 42)
};
const SHIELD_ULTRA_POS = {
    [RED]: Vector(20, 42),
    [BLUE]: Vector(80, 42)
};
const SPELL_DISTANCE = 90 - 10;
const SPELL_Z = {
    [RED]: 7,
    [BLUE]: 5
};

const NAME_VZONE0 = 'vzone0';
const NAME_VZONE1 = 'vzone1';
const NAME_VZONE2 = 'vzone2';
const NAME_COLLECTOR = 'collector';


const COLLECTOR_DATA = {
    speed: 6,
    health: 10
};

const NAME_RUNNER = 'runner';
const NAME_THIEF = 'thief';
const NAME_POPPER = 'popper';
const NAME_MERGER = 'merger';
const NAME_GROWER = 'grower';
const NAME_CLONE = 'clone';

const AVAILABLE_UNITS = [NAME_THIEF, NAME_RUNNER, NAME_POPPER, NAME_MERGER, NAME_GROWER, NAME_CLONE];
const UNITS_CAN_PICK = [NAME_RUNNER, NAME_MERGER, NAME_GROWER, NAME_CLONE];
const UNIT_DATA = {
    [NAME_THIEF]: {
        mana: 'fire',
        cost: 4,
        healthPart: 1,
        speed: 14,
        special: 'steal',
        default: 'stealAndBring',
        specialRange: 5,
        specialCost: 0.5
    },
    [NAME_POPPER]: {
        mana: 'fire',
        cost: 3,
        speed: 12,
        healthPart: 1,
        default: 'charge',
        special: 'explode',
        moveHealth: 0.25,
        specialDamage: 9,
        specialRadius: 10,
        specialRadiusSq: 100
    },
    [NAME_RUNNER]: {
        mana: 'water',
        cost: 4,
        speed: 10,
        healthPart: 0.75,
        default: 'collect',
        special: 'accelerate',
        specialCoef: 1.5, // Speed increase ration
        specialDuration: 2,
        specialCooldown: 10,
        specialCost: 1
    },

    [NAME_CLONE]: {
        mana: 'water',
        cost: 4,
        speed: 7,
        default: 'collect',
        special: 'none',
        healthPart: 0.25
    },
    [NAME_MERGER]: {
        mana: 'earth',
        cost: 4,
        speed: 7,
        healthPart: 2,
        special: 'merge',
        default: 'collectTwice',
        specialCooldown: 3,
        specialRadius: 10,
        specialCoefSame: 0.7,
        specialCoefDiff: 0.5,
        specialCost: 1
    },
    [NAME_GROWER]: {
        mana: 'earth',
        cost: 3,
        speed: 7,
        healthPart: 2,
        default: 'grow',
        special: 'grow',
        specialCooldown: 6,
        specialRadius: 10,
        specialCoef: 5,
        specialDuration: 5,
        specialCost: 1
    }
};

const CORPSE_TIME = 5;
const START_MANA = 10;
const NAME_ARROW = 'arrow';
const NAME_BEAM = 'beam';
const NAME_BALL = 'ball';
const NAME_SHIELD = 'shield';
const NAME_ULTRA = 'ultra';
const NAME_ULTRA_FIRE = 'burn';
const NAME_ULTRA_WATER = 'refresh';
const NAME_ULTRA_EARTH = 'grow';
const SPELLS = {
    [`${FIRE}-${NAME_ARROW}`]: {
        mana: FIRE, // mana type
        cost: 4, // how much mana need
        cooldown: 1, // how long to cast
        duration: 1, // flight time
        power: 25    // damage
    },
    [`${WATER}-${NAME_ARROW}`]: {
        mana: WATER,
        cost: 4,
        cooldown: 1,
        duration: 1,
        power: 25
    },
    [`${EARTH}-${NAME_ARROW}`]: {
        mana: EARTH,
        cost: 4,
        cooldown: 1,
        duration: 1,
        power: 25
    },
    [`${FIRE}-${NAME_BEAM}`]: {
        mana: FIRE,
        cost: 8,
        cooldown: 2,
        duration: 2,
        power: 75
    },
    [`${WATER}-${NAME_BEAM}`]: {
        mana: WATER,
        cost: 8,
        cooldown: 2,
        duration: 2,
        power: 75
    },
    [`${EARTH}-${NAME_BEAM}`]: {
        mana: EARTH,
        cost: 8,
        cooldown: 2,
        duration: 2,
        power: 75
    },
    [`${FIRE}-${NAME_BALL}`]: {
        mana: FIRE,
        cost: 16,
        cooldown: 3,
        duration: 4,
        power: 200
    },
    [`${WATER}-${NAME_BALL}`]: {
        mana: WATER,
        cost: 16,
        cooldown: 3,
        duration: 4,
        power: 200
    },
    [`${EARTH}-${NAME_BALL}`]: {
        mana: EARTH,
        cost: 16,
        cooldown: 3,
        duration: 4,
        power: 200
    },
    [`${FIRE}-${NAME_SHIELD}`]: {
        mana: FIRE,
        cost: 4,
        cooldown: 1
    },
    [`${WATER}-${NAME_SHIELD}`]: {
        mana: WATER,
        cost: 4,
        cooldown: 1
    },
    [`${EARTH}-${NAME_SHIELD}`]: {
        mana: EARTH,
        cost: 4,
        cooldown: 1
    },
    [`${FIRE}-${NAME_ULTRA_FIRE}`]: {
        mana: FIRE,
        cost: 12,
        cooldown: 5, // visual mark duration (cosmetic only)
        power: 5, 
        duration: 1.5 // cosmetic
    },
    [`${WATER}-${NAME_ULTRA_WATER}`]: {
        mana: WATER,
        cost: 12,
        cooldown: 5,
        power: 10,
        duration: 1.5 // visual mark duration (cosmetic only)
    },
    [`${EARTH}-${NAME_ULTRA_EARTH}`]: {
        mana: EARTH,
        cost: 12,
        power: 1.5,
        duration: 5,
        cooldown: 2
        // power: 3,
        // cooldown: 5
    },
};

({
    setUpLevel() {
        this.chips = [];
        this.chipsToRegrow = [];
        this.missiles = [];
        this.fruitCounter = 0;
        this.distanceCache = {};
        this.pathSystem = this.world.getSystem('AI');
        this.allUnits = [];
        this.growPoints = [];
        this.setupHeroes();
        this.buildGrid();
        GROW_RATE = GROW_RATE_PER_SECOND * this.world.dt;
        this.warmDistanceCache();
    },

    onFirstFrame() {
        for (const th of this.world.thangs) {
            if (th.pos.y < 0) {
                th.setExists(false);
            }
        }
    },

    buildGrid() {
        for (const m of MANA_TYPES) {
            this.buildables[`${m}-rect`].ids = [];
            for (let i = 0; i < GRID_IN_COLUMN * GRID_IN_ROW; i++) {
                this.buildables[`${m}-rect`].ids.push(`${m}-rect-${i}`);
            }
        }
        const manaTypes = this.world.rand.shuffle(MANA_TYPES);
        let manaCells = [];
        for (let i = 0; i < CELLS; i++) {
            manaCells.push(manaTypes[i%3]);
        }
        let counter = 0;
        for (let r = 0; r < GRID_IN_COLUMN; r++) {
            for (let c = 0; c < GRID_IN_ROW; c++) {
                const t = manaCells[counter];
                let pos = Vector(GRID_X0 + GRID_CELL_WIDTH / 2 + GRID_CELL_WIDTH * c,
                                 GRID_Y0 + GRID_CELL_HEIGHT / 2 + GRID_CELL_HEIGHT * r);
                // if (Object.values(SPAWN_POINTS).some(sp => sp.distance(pos) <= 5)) { continue; }
                counter++;
                this.buildMirroredTrioChips([t, t, t], pos, t);
            }
        }
        for (const p of CORNER_TILES) {
          this.buildMirroredTrioChips(manaTypes, p, null);
        }
    },

    buildMirroredTrioChips(mTypes, pos, tileType) {
      const angle = this.world.rand.randf() * Math.PI * 2;
      for (let i = 0; i < 2; i++) {
          if (tileType) {
            this.instabuild(`${tileType}-rect`, i ? 100 - pos.x : pos.x, pos.y, tileType);
          }
          for (let c = 0; c < CHIPS_ON_CELL; c++) {
              const mType = mTypes[c];
              let x, y;
              if (i) {
                  x = 100 - pos.x - Math.cos(-c * CHIP_DIFF - angle) * CHIP_R;
                  y = pos.y - Math.sin(-c * CHIP_DIFF - angle) * CHIP_R;
              }
              else {
                  x = pos.x + Math.cos(c * CHIP_DIFF + angle) * CHIP_R;
                  y = pos.y + Math.sin(c * CHIP_DIFF + angle) * CHIP_R;
              }
              const chip = this.buildChip(mType, x, y);
              if (i) {
                  chip.rotation = Math.PI;
                  chip.keepTrackedProperty('rotation');
              }
          }
      }
    },

    buildChip(t, x, y) {
        const fName = `${t}-chip`;
        if (!this.buildables[fName].ids) {
            this.buildables[fName].ids = [];
        }
        this.buildables[fName].ids.push(`Mana ${t} Fruit ${this.fruitCounter}`);
        this.fruitCounter++;
        const chip = this.instabuild(fName, x, y, t + 'chip');
        chip.manaType_ = t;
        chip.value_ = 1;
        Object.defineProperty(chip, 'mana', {get: function() {
            return this.manaType_;
        }});
        Object.defineProperty(chip, 'value', {get: function() {
            return this.value_;
        }});
        chip.addTrackedProperties(['mana', 'string'], ['value', 'number']);
        chip.keepTrackedProperty('mana');
        this.chips.push(chip);
        // this.setZones(chip);
        return chip;
    },

    setupHeroes() {
        this.redHero = this.hero;
        this.blueHero = this.hero2;
        this.redHero.anchor_ = this.world.getThangByID('rmark');
        this.blueHero.anchor_ = this.world.getThangByID('bmark');
        this.heroes = [this.hero, this.hero2];
        this.redHero.color_ = RED;
        this.blueHero.color_ = BLUE;
        this.redHero.opponent = this.blueHero;
        this.blueHero.opponent = this.redHero;
        this.redHero.collectors_ = [];
        this.blueHero.collectors_ = [];
        for (let h of this.heroes) {
            h.collectorCounter_ = 0;
            this.performSpawnCollector(h);
            h.addActions({name: 'casting', cooldown: 1}, {name: 'building', cooldown: 1});
            h.mana_ = {}; // TODO
            for (const m of MANA_TYPES) {
                h.mana_[m] = START_MANA;
            }
            h.units_ = [];
            h.totalMana_ = START_MANA * 3;
            h.health = HERO_HEALTH;
            h.maxHealth = HERO_HEALTH;
            h.keepTrackedProperty('health');
            h.keepTrackedProperty('maxHealth');
            h.validEventTypes = AVAILABLE_UNITS.map(u => `spawn-${u}`);
            this.setHeroAPI(h);
        }
    },

    setHeroAPI(h) {
        const aether = this.world.userCodeMap[h.id] && this.world.userCodeMap[h.id].plan;
        if (aether) {
            const esperEngine = aether.esperEngine;
            if (esperEngine) {
                esperEngine.options.foreignObjectMode = 'smart';
                esperEngine.options.bookmarkInvocationMode = "loop";
            }
        }
        Object.defineProperty(h, 'color', {
            get: () => h.color_,
            set: (_) => {
                throw new Error('You can\'t set color.')
            }
        });
        Object.defineProperty(h, 'collectors', {
            get: () => h.collectors_.slice(),
            set: (_) => {
                throw new Error('You can\'t set collector list.')
            }
        });
        Object.defineProperty(h, 'shield', {
            get: () => h.shield_,
            set: (_) => {
                throw new Error('You can\'t set `shield` property.')
            }
        });
        h.spawnCollector = this.spawnCollector_.bind(this, h);
        h.cast = this.cast_.bind(this, h);
        for (const m of MANA_TYPES) {
            Object.defineProperty(h, m, {get: function() {
                return this.mana_[m];
            }});
            h.addTrackedProperties([m, 'number']);
            h.keepTrackedProperty(m);
        }
        h.findFruits = this.findFruits_.bind(this);
        Object.defineProperty(h, 'spellNames', {
            get: () => Object.keys(SPELLS),
            set: (_) => {
                throw new Error('You can\'t set `spellNames` property.')
            }
        });
        Object.defineProperty(h, 'unitTypes', {
            get: () => Object.keys(UNIT_DATA),
            set: (_) => {
                throw new Error('You can\'t set `spellNames` property.')
            }
        });
        Object.defineProperty(h, 'nextSpawnDuration', {
            get: () => this.getNextSpawnTime_(h),
            set: (_) => {
                throw new Error('You can\'t set `nextSpawnDuration` property.')
            }
        });
        h.getSpellData = this.getSpellData_.bind(this, h);
        h.getUnitData = this.getUnitData_.bind(this, h);
        h.getTotalMana = this.getTotalMana_.bind(this, h);
        h.findEnemyCollectors = this.findCollectors_.bind(this, h, h.opponent);
        h.findMyCollectors = this.findCollectors_.bind(this, h, h);
        h.findFriends = this.findFriends_.bind(this, h);
        h.findEnemies = this.findEnemies_.bind(this, h);
        h.getEnemyHero = () => h.opponent;
        h.findEnemyHero = () => h.opponent;
        h.distanceTo = this.pathDistance.bind(this, h.anchor_);
        h.canCast = this.canCast_.bind(this, h);
        h.getActiveShield = () => h.shield_;
        h.getUltraShield = () => h.ultraShield_;
        h.transform = this.transform_.bind(this, h);
        h.findMyMissiles = this.findMissiles_.bind(this, h, h);
        h.findEnemyMissiles = this.findMissiles_.bind(this, h, h.opponent);
        
    },


    chooseAction() {
        this.checkWin();
        this.checkCorpses();
        this.allUnits = this.allUnits.filter(u => u.exists && !u.dead);
        this.missiles = this.missiles.filter(m => m.exists);
        this.chips = this.chips.filter(c => c.exists);
        this.chipsToRegrow = this.chipsToRegrow.filter(c => !c.done);
        if (this.gameEnd) { return }
        for (let h of this.heroes) {
            h.units_ = h.units_.filter(u => u.exists && !u.dead);
            this.actCollectors(h);
            this.checkUnits(h);
            this.checkTemps(h);
            for (const unitType of AVAILABLE_UNITS) {
                if (h.eventHandlers[`spawn-${unitType}`] && h.eventHandlers[`spawn-${unitType}`][0]) {
                    continue;
                }
                const defaultName = UNIT_DATA[unitType].default;
                if (this[`defaultAct_${defaultName}`]) {
                    h.units_.filter(u => u.type == unitType).forEach(this[`defaultAct_${defaultName}`].bind(this, h));
                }
            }

            this.updateManaPanel(h);
            if (h.action == 'building' && h.canAct()) {
                this.performSpawnCollector(h);
                h.unblock();
            }
            if (h.action == 'casting' && h.canAct()) {
                this.performCasting(h);
                h.unblock();
            }
            if (this.world.age >= SUDDEN_DEATH_START) {
                h.health -= SUDDEN_DEATH_HP_PER_SECOND * this.world.dt;
                h.keepTrackedProperty('health');
            }
        }
        this.checkMissiles();
        this.growChips();
        
    },

    checkCorpses() {
        for (const th of this.world.thangs) {
            if (th.exists && th.maxHealth && th.lifespan && th.health <= 0 && th.lifespan > CORPSE_TIME) {
                th.lifespan = CORPSE_TIME;
            }
        }
    },

    checkUnits(h) {
        for (const un of h.units_) {
            if (un.type == NAME_POPPER && un.action == 'move') {
                un.takeDamage(un.params_.moveHealth);
            }
            if (un.type == NAME_MERGER && un.containerStack.length > 1) {
                const upFruit = un.containerStack[1];
                if (upFruit.mana == un.containerStack[0].mana) {
                    un.containerStack[0].value_ += upFruit.value * un.params_.specialCoefSame;
                }
                else {
                    un.containerStack[0].value_ += upFruit.value * un.params_.specialCoefDiff;
                }
                un.containerStack[0].scaleFactor = (un.containerStack[0].value - 1) / MAX_GROW_VALUE + 1;
                un.containerStack[0].keepTrackedProperty('scaleFactor');
                upFruit.setExists(false);
                un.containerStack.pop();
                un.takeDamage(un.params_.specialCost);
                un.specialReadyTime = this.world.age + un.params_.specialCooldown;
            }
            if (un.type == NAME_GROWER && un.specialActTime) {

                if (un.specialActTime <= this.world.age) {
                    un.specialActTime = null;
                    this.growPoints = this.growPoints.filter(g => g.owner != un);
                    un.unblock();
                }
                else {
                    const aura = [parseFloat(un.pos.x.toFixed(2)), parseFloat(un.pos.y.toFixed(2)), parseFloat(un.params_.specialRadius.toFixed(2)), "rgba(0,255,0,0.1)"];
                    un.addCurrentEvent(`aoe-${JSON.stringify(aura)}`);
                }
            }
        }
    },

    checkTemps(h) {
        if (h.tempCollector_) {
            if (h.tempCollector_.remainingTime > 0) {
                h.tempCollector_.remainingTime -= this.world.dt;
                h.tempCollector_.scaleFactor = 1 - h.tempCollector_.remainingTime / h.tempCollector_.time;
                // h.tempCollector_.scaleFactor = h.tempCollector_.alpha;
                h.tempCollector_.keepTrackedProperty('alpha');
                h.tempCollector_.keepTrackedProperty('scaleFactor');
            }
            else {
                h.tempCollector_.setExists(false);
                h.tempCollector_ = null
            }
        }
        if (h.tempSpell_) {
            if (h.tempSpell_.remainingTime > 0) {
                h.tempSpell_.remainingTime -= this.world.dt;
                h.tempSpell_.scaleFactor = h.tempSpell_.scaleCoef * (1 - h.tempSpell_.remainingTime / h.tempSpell_.time);
                h.tempSpell_.keepTrackedProperty('scaleFactor');
            }
            else {
                h.tempSpell_.setExists(false);
                h.tempSpell_ = null
            }
        }
    },

    updateManaPanel(h) {
        for (const m of MANA_TYPES) {
            const ui = this.world.getThangByID(`${h.color_}-${m}`);
            if (!ui) { continue }
            ui.clearSpeech();
            ui.sayWithDuration(99, h.mana_[m].toFixed(1));
        }
    },

    checkWin() {
        if (this.gameEnd) { return }
        if (this.blueHero.health <= 0 && this.redHero.health <= 0) {
            if (this.blueHero.totalMana_ == this.redHero.totalMana_) {
                if (this.world.rand.randf() >= 0.5) {
                    this.redHero.totalMana_ += 1;
                }
                else {
                    this.blueHero.totalMana_ += 1;
                }
            }
            if (this.redHero.totalMana_ > this.blueHero.totalMana_) {
                this.redHero.health = 1;
                this.redHero.keepTrackedProperty('health');
            }
            else {
                this.blueHero.health = 1;
                this.blueHero.keepTrackedProperty('health');
            }
        }
        if (this.blueHero.health <= 0) {
            this.setGoalState('red-win', 'success');
            this.setGoalState('blue-win', 'failure');
            this.clearHero(this.blueHero, true);
            this.clearHero(this.redHero, false);
            this.gameEnd = true;
        }
        if (this.redHero.health <= 0) {
            this.setGoalState('blue-win', 'success');
            this.setGoalState('red-win', 'failure');
            this.clearHero(this.blueHero, false);
            this.clearHero(this.redHero, true);
            this.gameEnd = true;
        }

    },

    clearHero(h, full=true) {
        for (const ms of this.missiles) {
            if (h.color_ == ms.color_) {
                ms.setExists(false);
            }
        }
        h.collectors_ = h.collectors_.filter(c => c.exists);
        if (full) {
            if (h.shield_) {
                h.shield_.setExists(false);
                h.shield_ = null;
            }
            for (const collector of h.collectors_) {
                collector.die();
            }
        }
    },

    addFruit(h, item) {
        item.delivered = true;
        item.setExists(false);
        h.mana_[item.manaType_] += Math.round(10 * item.value_) / 10;
        h.totalMana_ += item.value_;
        h.keepTrackedProperty(item.manaType_);
                    
    },

    addToRegrow(tChip) {
        const regrowTime = Math.max(BASE_REGROW_TIME + BASE_REGROW_COEF * this.chips.filter(c => c.exists && !c.parent).length, 1);
        this.chipsToRegrow.push({pos: tChip.pos.copy(), mana: tChip.manaType_, remainedTime: regrowTime});
    },

    actCollectors(h) {
        if (this.world.age === 0) { return }
        for (const collector of h.collectors_.slice()) {
            if (!collector.exists || collector.dead) {continue}
            const item = collector.peekItem();
            if (item) {
                const spos = SPAWN_POINTS[collector.color_];
                if (collector.distanceSquared(spos) <= DROP_DISTANCE_SQ) {
                    collector.dropItem(spos);
                    this.addFruit(h, item);
                    collector.health -= 1;
                    collector.keepTrackedProperty('health');
                    if (collector.health <= 0) {
                        collector.die();
                        h.collectors_ = h.collectors_.filter(c => !c.dead);
                        collector.lifespan = 0.5;
                    }
                }
                else {
                    collector.move(spos);
                }
            }
            else if (collector.targetedChip) {
                const tChip = collector.targetedChip;
                if (tChip.parent) {
                    collector.targetedChip = null;
                    collector.brake();
                    collector.setTargetPos(null);
                    collector.setAction('idle');
                    continue;
                }
                if (collector.distanceSquared(tChip.pos) <= PICK_DISTANCE_SQ) {
                    collector.pickUpItem(tChip);
                    collector.targetedChip = null;
                    this.addToRegrow(tChip);
                    
                }
                else {
                    collector.move(tChip.pos);
                }
            }
            else {
                let choice = null;
                let availableChips = this.chips.filter(c => c.exists && !c.parent && !c.delivered && !c[`targeted${h.color_}`]);
                let nChip;
                if (_.isFunction(h.chooseItem)) {
                    choice = h.chooseItem(collector);
                }
                if (_.isString(choice) && MANA_TYPES.includes(choice)) {
                    nChip = this.getNearestByPath(collector, availableChips.filter(c => c.manaType_ == choice));
                }
                else if (_.isArray(choice) && choice.length >= 1 && _.isNumber(choice[0]) && _.isNumber(choice[1])) {
                    const v = Vector(choice[0], choice[1]);
                    nChip = this.getNearest(v, availableChips);
                }
                else {
                    nChip = this.getNearestByPath(collector, availableChips);
                }
                if (!nChip) { continue;}
                nChip[`targeted${collector.color_}`] = true;
                collector.targetedChip = nChip;
            }
            // this.setZones(collector);
        }
        
    },

    setZones(th) {
        for (const zone of Object.keys(this.rectangles)) {
            if (zone[0] == 'v' && this.rectangles[zone].containsPoint(th.pos)) {
                th.vzone = zone;
            }
            if (zone[0] == 'h' && this.rectangles[zone].containsPoint(th.pos)) {
                th.hzone = zone;
            }
        }
    },

    checkMissiles() {
        for (const m of this.missiles) {
            const mFrameDist = m.maxSpeed * this.world.dt;
            if (m.color_ == [RED]) {
                if (m.pos.x >= SPELL_HERO_HIT_X[BLUE]) {
                    this.damageHero(m, this.blueHero);
                }
                else if (this.blueHero.shield_ && m.pos.x >= SPELL_WALL_HIT_X[BLUE] - mFrameDist) {
                    this.damageShield(m, this.blueHero);
                }
                else if (this.blueHero.ultraShield_ && 
                    m.pos.x >= SPELL_ULTRA_SHIELD_HIT_XS[BLUE][0] && m.pos.x <= SPELL_ULTRA_SHIELD_HIT_XS[BLUE][1]) {
                    this.damageUltraShield(m, this.blueHero);
                }
            }
            if (m.color_ == [BLUE]) {
                if (m.pos.x <= SPELL_HERO_HIT_X[RED]) {
                    this.damageHero(m, this.redHero);
                }
                else if (this.redHero.shield_ && m.pos.x <= SPELL_WALL_HIT_X[RED] + mFrameDist) {
                    this.damageShield(m, this.redHero);
                }
                else if (this.redHero.ultraShield_ && 
                    m.pos.x >= SPELL_ULTRA_SHIELD_HIT_XS[RED][0] && m.pos.x <= SPELL_ULTRA_SHIELD_HIT_XS[RED][1]) {
                    this.damageUltraShield(m, this.redHero);
                }
            }
        }
    },

    damageHero(m, h) {
        h.takeDamage(m.damage_);
        m.setExists(false);
    },

    damageShield(m, h) {
        const shield = h.shield_;
        if (m.manaType_ == shield.manaType_) {
            shield.takeDamage(2);
            m.setExists(false);
        }
        else if (SPELL_PAIRS[shield.manaType_][0] == m.manaType_) {
            shield.takeDamage(9999);
        }
        else {
            shield.takeDamage(1);
            m.setExists(false);
        }
        if (shield.health <= 0) {
            shield.setExists(false);
            h.shield_ = null;
        }
        else if (shield.health == 1) {
            shield.alpha = 0.5;
            shield.keepTrackedProperty('alpha');
        }
    },

    damageUltraShield(m, h) {
        const shield = h.ultraShield_;
        shield.takeDamage(1);
        m.setExists(false);
        if (shield.health <= 0) {
            shield.setExists(false);
            h.ultraShield_ = null;
            this.world.getSystem('AI').onObstaclesChanged();
        }
    },

    growChips() {
        const growRates = this.heroes.map(h => (h.growRate_ || 1) * GROW_RATE);
        this.growPoints = this.growPoints.filter(gp => gp.owner && gp.owner.health && gp.owner.health > 0);
        for (const ch of this.chips) {
            if (!ch.exists || ch.parent || ch.delivered || ch.value_ >= MAX_GROW_VALUE) { continue }
            let growDiff = growRates[+(ch.pos.x > MIDDLE_X)];
            for (const growP of this.growPoints) {
                if (ch.distanceSquared(growP) <= growP.radiusSq) {
                    growDiff *= growP.coef;
                }
            }
            ch.value_ += growDiff;
            ch.scaleFactor = (ch.value_ - 1) / MAX_GROW_VALUE + 1;
            ch.keepTrackedProperty('scaleFactor');
            ch.keepTrackedProperty('value');
        }
        for (const chr of this.chipsToRegrow) {
            if (chr.remainedTime <= 0) {
                chr.done = true;
                this.buildChip(chr.mana, chr.pos.x, chr.pos.y);
            }
            else {
                chr.remainedTime -= this.world.dt;// * growRates[+(chr.pos.x > MIDDLE_X)];
            }
        }
        for (const h of this.heroes) {
            if (h.growRateTime_ && h.growRateTime_ <= this.world.age) {
                h.growRateTime_ = null;
                h.growRate_ = null;
                this.world.getThangByID(`${h.color_}-glow`).setExists(false);
            }
        }
    },

    heroToIdle(h) {
        h.isCasting_ = null;
        h.isBuilding_ = false;
        h.isBusy_ = false;
        h.setAction('idle');
    },

    performSpawnCollector(h) {
        const sp = SPAWN_POINTS[h.color_];
        h.collectorCounter_ += 1;
        const fullType = `${h.color_}-collector`;
        this.buildables[fullType].ids = [`${h.color_}${h.collectorCounter_}`];
        const collector = this.instabuild(fullType, sp.x, sp.y, `${h.color_}-collector`);
        this.allUnits = [...this.allUnits, collector];
        collector.color_ = h.color_;
        collector.maxSpeed = COLLECTOR_DATA.speed;
        collector.keepTrackedProperty('maxSpeed');
        collector.maxHealth = COLLECTOR_DATA.health;
        collector.health = collector.maxHealth;
        collector.keepTrackedProperty('health');
        collector.keepTrackedProperty('maxHealth');
        Object.defineProperty(collector, 'item', {
            get: function() {
                return this.peekItem();
            }
        });
        Object.defineProperty(collector, 'color', {
            get: () => collector.color_,
            set: (_) => {
                throw new Error('You can\'t set color.')
            }
        });
        collector.appendMethod('die', () => {
            if (collector.containerStack) {
                collector.containerStack.forEach(f => f.setExists(false));
            }
        });
        
        h.collectors_.push(collector);
        this.heroToIdle(h);
    },

    performCasting(h) {

        const spellData = SPELLS[h.isCasting_];
        const spellName = h.isCasting_;
        if (spellName.includes(NAME_SHIELD)) {
            const spos = SHIELD_POS[h.color_];
            if (h.shield_) {
                h.shield_.setExists(false);
            }
            h.shield_ = this.instabuild(spellName, spos.x, spos.y);
            h.shield_.manaType_ = spellData.mana;
            Object.defineProperty(h.shield_, 'mana', {get: function() {
                return this.manaType_;
            }});
            h.shield_.addTrackedProperties(['mana', 'string']);
            h.shield_.keepTrackedProperty('mana');
            h.shield_.color_ = h.color_;
            h.shield_.isShield_ = true;
        }
        else if (spellName == `${FIRE}-${NAME_ULTRA_FIRE}`) {
            this.performFireUltra(h, spellData);
        }
        else if (spellName == `${WATER}-${NAME_ULTRA_WATER}`) {
            this.performWaterUltra(h, spellData);
        }
        else if (spellName == `${EARTH}-${NAME_ULTRA_EARTH}`) {
            this.performEarthUltra(h, spellData);
        }
        else {
            const spos = SPELL_POINTS[h.color_];
            const tpos = SPELL_TARGET[h.color_];
            const ms = this.instabuild(h.isCasting_, spos.x, spos.y);
            ms.pos.z = SPELL_Z[h.color_];
            ms.keepTrackedProperty('pos');
            ms.color_ = h.color_;
            ms.manaType_ = spellData.mana;
            ms.damage_ = spellData.power;
            ms.moveXY(tpos.x, tpos.y);
            ms.initRotation = ms.rotation;
            ms.maxSpeed = SPELL_DISTANCE / spellData.duration;
            this.setupMissileAPI(h, ms);
            this.missiles.push(ms);
        }
        this.heroToIdle(h);
    },


    setupMissileAPI(h, ms) {
        Object.defineProperty(ms, 'color', {get: () => ms.color_});
        Object.defineProperty(ms, 'mana', {get: () => ms.manaType_});
    },

    performFireUltra(h, sd) {

        for (const unit of this.allUnits) {
            if (!unit.exists || unit.health <= 0 || unit.team == h.team) { continue }
            unit.takeDamage(sd.power);
            console.log(unit, unit.health);
            unit.addEffect({name: 'fire', duration: sd.duration, reverts: true, setTo: true, targetProperty: 'underFire'});
        }
    },

    performWaterUltra(h, sd) {
        for (const unit of this.allUnits) {
            if (!unit.exists || unit.health <= 0 || unit.team != h.team) { continue }
            unit.health += sd.power;
            unit.health = Math.min(unit.health, unit.maxHealth);
            unit.addEffect({name: 'heal', duration: sd.duration, reverts: true, setTo: true, targetProperty: 'underHeal'});
        }
    },

    performEarthUltra(h, sd) {
        h.growRate_ = sd.power;
        h.growRateTime_ = this.world.age + sd.duration;
        this.world.getThangByID(`${h.color_}-glow`).setExists(true);
    },

    getNearest(vect, thangs) {
        let nearestThang = null;
        let nearestDistanceSquared = 9001;
        for (const th of thangs) {
            const distanceSquared = vect.distanceSquared(th.pos);
            if (distanceSquared < nearestDistanceSquared) {
                nearestThang = th;
                nearestDistanceSquared = distanceSquared;
            }
        }
        return nearestThang;
    },

    getNearestByPath(fromThang, thangs) {
        let nearestThang = null;
        let nearestDistance = 9001;
        for (const th of thangs) {
            const distance = this.pathDistance(fromThang, th);
            if (distance < nearestDistance) {
                nearestThang = th;
                nearestDistance = distance;
            }
        }
        return nearestThang;
    },

    // ZONE_PATHS: {
    //     'vzone0-hzone0-vzone0-hzone1': [this.points.p01, this.points.p02],
    //     'vzone0-hzone0-vzone0-hzone2': [this.points.p01, this.points.p04],
    //     'vzone0-hzone0-vzone1-hzone1': [this.points.p01],
    //     'vzone0-hzone0-vzone1-hzone2': [this.points.p01],
    //     'vzone0-hzone0-vzone2-hzone1': [this.points.p01, this.points.p12],
    //     'vzone0-hzone0-vzone2-hzone2': [this.points.p01, this.points.p14], 
    //     'vzone0-hzone1-vzone0-hzone0': [this.points.p02, this.points.p01], 
    //     'vzone0-hzone1-vzone0-hzone2': [this.points.p03, this.points.p04],
    // },
    warmDistanceCache(){
        for (const h of this.heroes) {
            for (const ch of this.chips) {
                this.pathDistance(h.collectors_[0], ch);
            }
        }
    },

    pathDistance(fromTh, toTh) {
        const fs = `${Math.round(fromTh.pos.x)}-${Math.round(fromTh.pos.y)}`;
        const ts = `${Math.round(toTh.pos.x)}-${Math.round(toTh.pos.y)}`;
        if (this.distanceCache[`${fs}-${ts}`]) {
            return this.distanceCache[`${fs}-${ts}`];
        }
        if (this.distanceCache[`${ts}-${fs}`]) {
            return this.distanceCache[`${ts}-${fs}`];
        }
        const path = this.pathSystem.findPath(fromTh.pos, toTh.pos, 1);
        if (path) {
            let sDist = 0;
            let prevPos = fromTh.pos;
            path.push(toTh.pos);
            for (const p of path) {
                sDist += prevPos.distance(p);
                prevPos = p;
            }
            this.distanceCache[`${fs}-${ts}`] = sDist;
            return sDist;
        }
        return Infinity;
    },

    setupUnit(h, unit, unitType) {
        this.allUnits = [...this.allUnits, unit];
        h.units_ = [...h.units_, unit];
        const params = UNIT_DATA[unitType];
        unit.maxSpeed = params.speed;
        unit.keepTrackedProperty('maxSpeed');
        unit._ref = this;
        unit.health = Math.ceil(unit.parent.health * params.healthPart);
        unit.maxHealth = Math.ceil(unit.parent.maxHealth * params.healthPart);
            
        unit.keepTrackedProperty('maxHealth');
        unit.keepTrackedProperty('health');
        unit.actionsShouldBlock = true;
        unit.color_ = h.color_;
        if (unitType == NAME_POPPER) {
            unit.damage = params.specialDamage;
            unit.explosionRadius = params.specialRadius;
        }

        const eName = `spawn-${unitType}`;
        unit.findFruits = this.findFruits_.bind(this);
        unit.findEnemies = this.findEnemies_.bind(this, unit);
        unit.findFriends = this.findFriends_.bind(this, unit);
        unit.findNearestFruit = this.findNearestFruit_.bind(this, unit);
        unit.pick = this.unitPick_.bind(this, unit);
        unit.bring = this.unitDrop_.bind(this, unit);
        unit.findNearest = this.getNearestByPath.bind(this, unit);
        unit.hookOnDoPickUp = (fruit) => {
            this.addToRegrow(fruit);
        };
        Object.defineProperty(unit, 'item', {
            get: function() {
                return this.peekItem();
            }
        });
        Object.defineProperty(unit, 'speed', {
            get: function() {
                return this.maxSpeed;
            }
        });
        Object.defineProperty(unit, 'color', {
            get: () => unit.color_,
            set: (_) => {
                throw new Error('You can\'t set color.')
            }
        });
        unit._doDropItem = unit.doDropItem;
        unit.doDropItem = () => {
            const item = unit.peekItem();
            if (item) {
                this.addFruit(h, item);
                this.setTimeout(() => {
                    unit.takeDamage(1);
                    if (unit.health <= 0) {
                        this.setTimeout(() => unit.setExists(false), this.world.dt * 5);
                    }
                }, this.world.dt);

            }
            return unit._doDropItem();
        }
        unit.isReady = () => {
            if (unit.specialReadyTime && this.world.age < unit.specialReadyTime) {
                return false;
            }
            return true;
        }

        unit.appendMethod('die', () => {
            if (unit.containerStack) {
                unit.containerStack.forEach(f => f.setExists(false));
            }
        });
        unit.params_ = params;
        unit.type = unitType;
        unit.specialReadyTime = 0;
        unit.special = this[`unit_special_${params.special}`].bind(this, unit);
        if (h.eventHandlers[eName] && h.eventHandlers[eName][0]) {
            unit.on('spawn', h.eventHandlers[eName][0]);
            unit.trigger('spawn', {unit, type: unitType});
        }
    },

    findEnemies_(un) {
        return this.allUnits.filter(u => u.exists && !u.dead && u.color_ != un.color_);
    },

    findFriends_(un) {
        return this.allUnits.filter(u => u.exists && !u.dead && u != un && u.color_ == un.color_);
    },

    findFruits_() {
        return this.chips.slice().filter(c => c.exists && !c.parent && !c.delivered);
    },

    findNearestFruit_(un) {
        return this.getNearestByPath(un, this.findFruits_());
    },

    unitPick_ (un, fruit) {
        if (!UNITS_CAN_PICK.includes(un.type)) {
            return false;
        }
        if (!fruit || !fruit.isCarryable) {
            throw new ArgumentError(`Your unit can take only mana fruits`, "pick", "fruit", "object", fruit)
        }
        return un.pickUpItem(fruit);
    },

    unitDrop_(un) {
        spos = SPAWN_POINTS[un.color_];
        return un.dropItem(spos);
    },

    defaultAct_collectTwice(h, un) {
        if (un.item && un.intent != 'dropItem') {
            if (un.isReady('special')) {
                const sfruit = un.findNearestFruit();
                if (sfruit) {
                    un.special(sfruit);
                }
            }
            else {
                un.bring();
            }
        }
        if (!un.item) {
            const fruit = un.findNearestFruit();
            if (fruit) {
                un.pick(fruit);
            }
        }
    },

    unit_special_merge(un, fruit) {
        if (!fruit || !fruit.mana || !fruit.value || !fruit.isCarryable) {
            throw new ArgumentError(`Your unit can merge only mana fruits`, "special", "fruit", "object", fruit)
        }
        if (this.world.age < un.specialReadyTime) {
            return false;
        }
        return un.pickUpItem(fruit);
        // un.specialReadyTime = this.world.age + un.params_.specialCooldown;
    },
    defaultAct_charge(h, un) {
        const enemy = un.findNearestEnemy();
        if (enemy) {
            if (un.distanceSquared(enemy) <= un.params_.specialRadiusSq) {
                un.special();
            }
            else {
                un.move(enemy.pos);
            }
        }
    },
    unit_special_explode(un) {
        un.proximity = true;
    },

    defaultAct_collect(h, un) {
        if (un.item && un.intent != 'dropItem') {
            un.bring();
        }
        if (!un.item) {
            const fruit = un.findNearestFruit();
            if (fruit) {
                un.pick(fruit);
            }
        }
    },

    unit_special_accelerate(un) {
        if (un.specialReadyTime && un.specialReadyTime > this.world.age) {
            un.sayWithoutBlocking('Not ready.');
            return false;
        }
        un.maxSpeed *= un.params_.specialCoef;
        un.effects = un.effects.filter(e => e.name != 'haste')
        un.addEffect({
            name: 'haste',
            duration: un.params_.specialDuration,
            reverts: true, 
            factor: un.params_.specialCoef, 
            targetProperty: 'maxSpeed'
        });
        un.takeDamage(un.params_.specialCost);
        un.specialReadyTime = this.world.age + un.params_.specialCooldown;
    },

    defaultAct_stealAndBring(h, un) {
        if (un.item && un.intent != 'dropItem') {
            un.bring();
        }
        if (!un.item) {
            const nearest = un.findNearest(un.findEnemies().filter(e => e.exists && e.item && e.health > 0));
            if (nearest) {
                if (un.distanceTo(nearest) <= 5) {
                    un.special(nearest);
                }
                else {
                    un.move(nearest.pos);
                }
            }
        }

    },

    unit_special_steal(un, target) {
        if (un.item) {
            un.sayWithoutBlocking('I already have a fruit.');
            return false;
        }
        if (!target || target.health == null) {
            throw new ArgumentError(`You need a target for your thief`, "special", "target", "object", target)
        }
        if (!target.item) {
            un.sayWithoutBlocking('The target carries nothing.');
            return false;
        }
        if (target.health <= 0) {
            un.sayWithoutBlocking('But its dead.');
            return false;
        }
        
        if (un.distance(target) > un.params_.specialRange) {
            un.sayWithoutBlocking('The target is too far.');
            return false;
        }
        const item = target.popItem();
        un.pushItem(item);
        un.takeDamage(un.params_.specialCost);
        return true;
    },

    defaultAct_grow(h, un) {
        if (un.specialActTime && un.specialActTime > this.world.age) {
            return;
        }
        const fruit = un.findNearestFruit();
        if (fruit) {
            if (un.distanceSquared(fruit) > 25) {
                un.move(fruit.pos);
            }
            else if (un.isReady('special')) {
                un.brake();
                un.setAction('idle');
                un.setTargetPos(null);
                un.special();
            }
        }
    },

    unit_special_grow(un) {
        if (un.specialReadyTime && this.world.age < un.specialReadyTime) {
            return false;
        }
        un.specialReadyTime = this.world.age + un.params_.specialCooldown;
        un.specialActTime = this.world.age + un.params_.specialDuration;
        const growPoint = un.pos.copy();
        growPoint.radiusSq = Math.pow(un.params_.specialRadius, 2);
        growPoint.coef = un.params_.specialCoef;
        growPoint.owner = un;
        this.growPoints.push(growPoint);
        un.takeDamage(un.params_.specialCost);
        // const aura = [un.pos.x, un.pos.y, un.params_.specialRadius, "#00FF00", 0, 0];
        // un.addCurrentEvent(`aoe-${JSON.stringify(aura)}`);
        return un.block();
    },

    unit_special_none(un) {
        return false;
    },
    
    spawnCollector_(h) {
        if (h.isBusy_) { return };
        h.actions.building.cooldown = this.getNextSpawnTime_(h);
        h.isBuilding_ = true;
        h.isBusy_ = true;
        h.intent_ = 'building';
        h.setAction('building');
        h.act();
        const sp = SPAWN_TEMP_POINTS[h.color_];
        const fullType = `${h.color_}-collector`;
        h.tempCollector_ = this.instabuild(fullType, sp.x, sp.y, fullType);
        h.tempCollector_.alpha = 0.5;
        h.tempCollector_.keepTrackedProperty('alpha');
        h.tempCollector_.scaleFactor = 0.0001;
        h.tempCollector_.keepTrackedProperty('scaleFactor');
        h.tempCollector_.time = h.actions.building.cooldown;
        h.tempCollector_.remainingTime = h.actions.building.cooldown;
        return h.block();
    },

    getNextSpawnTime_(h) {
        let nUnits = h.collectors_.length;
        for (const u of h.units_) {
            if (u.type == NAME_CLONE) {
                nUnits += 0.5;
            }
            else {
                nUnits += 1;
            }

        }
        return Math.floor(1 + Math.pow(SPAWN_COOLDOWN_BASE, nUnits));
    },

    cast_(h, spellName) {
        if (h.isBusy_) {
            return;
        }
        const spellData = SPELLS[spellName];
        if (!spellData) {
            throw new Error(`cast NO SPELL ${spellName}`);
        }
        if (spellData.cost > h.mana_[spellData.mana]) {
            return;
        }
        h.mana_[spellData.mana] -= spellData.cost;
        h.actions.casting.cooldown = spellData.cooldown;
        h.isCasting_ = spellName;
        h.isBusy_ = true;
        h.intent_ = 'casting';
        h.setAction('casting');
        h.act();
        h.tempSpell_ = this.instabuild(`${spellData.mana}-chip`, h.pos.x, h.pos.y);
        h.tempSpell_.pos.z = TEMP_SPELL_Z;
        h.tempSpell_.keepTrackedProperty('pos');
        h.tempSpell_.alpha = 0.5;
        h.tempSpell_.keepTrackedProperty('alpha');
        h.tempSpell_.scaleFactor = 0.0001;
        h.tempSpell_.keepTrackedProperty('scaleFactor');
        h.tempSpell_.time = h.actions.casting.cooldown;
        h.tempSpell_.remainingTime = h.actions.casting.cooldown;
        h.tempSpell_.scaleCoef = spellData.cost / TEMP_COST_TO_SCALE;
        return h.block();
    },

    getSpellData_(h, spellName) {
        const spellData = SPELLS[spellName];
        if (!spellData) {
            throw new Error(`getSpellData NO SPELL ${spellName}`);
        }
        return {
            name: spellName,
            cost: spellData.cost,
            mana: spellData.mana,
            power: spellData.power,
            duration: spellData.cooldown
        }
    },

    getUnitData_(h, unitType) {
        const unitData = UNIT_DATA[unitType];
        if (unitType == 'collector') {
            return {
                name: unitType,
                cost: 0,
                mana: 0,
                maxSpeed: COLLECTOR_DATA.speed,
                specialRange: 0,
                specialCooldown: 0,
                maxHealth: COLLECTOR_DATA.health
            }
        }
        if (!unitData) {
            throw new ArgumentError(`There are no unit type as ${unitType}`);
        }
        return {
            name: unitType,
            cost: unitData.cost,
            mana: unitData.mana,
            maxSpeed: unitData.speed,
            specialRange: unitData.specialRadius || unitData.specialRange || 0,
            specialCooldown: unitData.specialCooldown || 0,
            maxHealth: unitData.health || 0
        }
    },

    getTotalMana_(h, manaType) {
        if (!manaType) {
            return Object.values(h.mana_).reduce((a, b) => a + b);
        }
        if (!_.isString(manaType) || !MANA_TYPES.includes(manaType)) {
            const available = MANA_TYPES.map(m => `"${m}"`).join(", ");
            throw new ArgumentError(`The mana type should one of \`${available}\``, "getTotalMana", "manaType", "string", manaType)
        }
        return h.mana_[manaType];
    },
    findCollectors_(h, who) {
        return who.collectors_.filter(c => c.exists && !c.dead);
    },
    canCast_(h, spellName) {
        if (h.isBusy_) {
            return false;
        }
        const spellData = SPELLS[spellName];
        if (!spellData) {
            throw new Error(`canCast NO SPELL ${spellName}`);
        }
        return h.mana_[spellData.mana] >= spellData.cost;
    },

    transform_(h, collector, newType) {
        if (h.isBusy_) {
            return false;
        }
        if (!collector || collector.type != NAME_COLLECTOR || !collector.exists || collector.dead) {
            throw new ArgumentError('The transformed unit should be an existing alive collector.', "transform", "collector", "object", collector);
        }
        if (!_.isString(newType) || !AVAILABLE_UNITS.includes(newType)) {
            const available = AVAILABLE_UNITS.map(m => `"${m}"`).join(", ");
            throw new ArgumentError(`The unit type should one of \`${available}\``, "transform", "newType", "string", newType)
        }
        if (collector.team != h.team) {
            throw new ArgumentError(`You can't transform enemy collectors.`, "transform", "newType", "string", newType)
        }
        const unitData = UNIT_DATA[newType];
        if (h.mana_[unitData.mana] < unitData.cost) {
            return false;
        }
        h.mana_[unitData.mana] -= unitData.cost
        collector.setExists(false);
        if (collector.item) {
            collector.item.setExists(false);
        }
        h.collectors_ = h.collectors_.filter(c => c.exists);
        const unit = this.instabuild(`${h.color_}-${newType}`, collector.pos.x, collector.pos.y, `${h.color_}-${newType}`);
        unit.parent = collector;
        this.setupUnit(h, unit, newType);
        if (newType == NAME_CLONE) {
            const cloneX = collector.pos.x + 3 * (h.color_ == 'red' ? -1 : 1);
            const unitClone = this.instabuild(`${h.color_}-${newType}`, cloneX, collector.pos.y, `${h.color_}-${newType}`);
            unitClone.parent = collector;
            this.setupUnit(h, unitClone, newType);
        }
    },

    findMissiles_(h, whom) {
        return this.missiles.filter(m => m.color_ == whom.color_ && m.exists);
    }

})