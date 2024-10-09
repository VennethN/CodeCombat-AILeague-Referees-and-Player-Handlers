const {ArgumentError} = require('lib/world/errors');
const Vector = require('lib/world/vector');

const RED = 'red';
const BLUE = 'blue';

const FIRE = 'fire';
const WATER = 'water';
const EARTH = 'earth';
const ENERGY = 'energy';
const MANA = 'mana';
const MANA_TYPES = [ENERGY,MANA];

const MIDDLE_X = 60;

// element - [weakVSt, strongVS]
const SPELL_PAIRS = {
    [FIRE]: [WATER, EARTH],
    [WATER]: [EARTH, FIRE],
    [EARTH]: [FIRE, WATER],
};

const COLOR_TO_TEAM = {
    [RED]: 'humans',
    [BLUE]: 'ogres'
}
const INVERT_COLOR = {
    [RED]: BLUE,
    [BLUE]: RED
}

const MAX_X = 120;
const MAX_Y = 100;

// Mana fruits
const GRID_X0 = 16;
const GRID_Y0 = 12;
const GRID_Y = [33, 67]
const GRID_CELL_WIDTH = 10;
const GRID_CELL_HEIGHT = 10;
const GRID_IN_ROW = 4;
const GRID_IN_COLUMN = 6;
const CHIPS_ON_CELL = 3;
const CHIP_R = 3;
const CHIP_DIFF = Math.PI * 2 / CHIPS_ON_CELL;
const CELLS = 16;

const MAX_GROW_VALUE = 5;
const MAX_GROW_TIME = 120;
const GROW_RATE_PER_SECOND = (MAX_GROW_VALUE - 1) / MAX_GROW_TIME;
let GROW_RATE;
const REGROW_TIME = 30;


const HERO_HEALTH = 1500;
const SUDDEN_DEATH_START = 120;
const SUDDEN_DEATH_HP_PER_SECOND = HERO_HEALTH / (180 - SUDDEN_DEATH_START);
const SUDDEN_DEATH_UNIT_HP_PER_SECOND = 200 / (180 - SUDDEN_DEATH_START);

const MAX_COLLECTORS = 8;
const SPAWN_COOLDOWNS = [1, 3, 9, 18, 27, 36, 45, 54, 60];
const SPAWN_POINTS = {
    [RED]: Vector(15, 50),
    [BLUE]: Vector(105, 50)
};
const SPAWN_TEMP_POINTS = {
    [RED]: Vector(5, 42),
    [BLUE]: Vector(115, 42)
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
const SPELL_DISTANCE = 110 - 10;
const SPELL_Z = {
    [RED]: 7,
    [BLUE]: 5
};

const START_MANA = 1;
const NAME_ARROW = 'arrow';
const NAME_BEAM = 'beam';
const NAME_BALL = 'ball';
const NAME_SHIELD = 'shield';
const NAME_ULTRA = 'ultra';
const NAME_ULTRA_FIRE = 'burn';
const NAME_ULTRA_WATER = 'refresh';
const NAME_ULTRA_EARTH = 'grow';

const ROBOT_SOLDIER = 'robot-soldier';
const ROBOT_TURRET = 'robot-turret';
const ROBOT_GOLEM = 'robot-golem';
const ROBOT_SPIDER = 'robot-spider';
const ROBOBOMB = 'robobomb';
const ROBOT_YETI = 'robot-yeti';
const ROBOT_TOWER = 'robot-tower';

const FIREBALL = "fireball"
const HEALBALL = "healball"
const HASTEBALL = "hasteball"

const KNIGHT = 'knight';
const ARCHER = 'archer';

const ENERGY_REGEN = 0.1;
const MANA_REGEN = 0.1;

const SPAWNABLE_UNITS = [ROBOT_SOLDIER, ROBOT_TURRET, ROBOT_SPIDER, ROBOT_GOLEM, ROBOBOMB, ROBOT_YETI, ROBOT_TOWER];

const DEFENDER_UNITS = [
    {
        type: ARCHER,
        x: 20,
        y: 60,
    },
    {
        type: KNIGHT,
        x: 25,
        y: 50,
    },
    {
        type: ARCHER,
        x: 20,
        y: 40,
    },
    {
        type: ARCHER,
        x: 30,
        y: 60,
    },
    {
        type: ARCHER,
        x: 30,
        y: 40,
    },
    // {
    //     type: ARCHER,
    //     x: 14,
    //     y: 68,
    // },    {
    //     type: ARCHER,
    //     x: 14,
    //     y: 32,
    // },
]

const UNITS = {
    [ROBOT_SOLDIER]:{
        type: ROBOT_SOLDIER,
        maxHealth: 60,
        attackDamage: 25,
        maxSpeed: 7,
        cost: 2,
        attackCooldown: 1,
        spawnTime: .2,
        attackRange: 5,
        scale: 0.5,
        visionRange: 30,
        summonable: true,
    },
    [ROBOT_TURRET]:{
        type: ROBOT_TURRET,
        maxHealth: 40,
        attackDamage: 30,
        maxSpeed: 5,
        cost: 4,
        attackCooldown: 2.5,
        spawnTime: .5,
        attackRange: 15,
        scale: 0.4,
        visionRange: 30,
        summonable: true,
    },
    [ROBOT_SPIDER]:{
        type: ROBOT_SPIDER,
        maxHealth: 100,
        attackDamage: 35,
        maxSpeed: 10,
        cost: 3,
        attackCooldown: 1,
        spawnTime: .5,
        attackRange: 5,
        scale: 0.8,
        visionRange: 30,
        summonable: true,
    },
    [ROBOT_GOLEM]:{
        type: ROBOT_GOLEM,
        maxHealth: 400,
        attackDamage: 30,
        maxSpeed: 3,
        cost: 10,
        attackCooldown: 2,
        spawnTime: 3,
        attackRange: 5,
        visionRange: 30,
        summonable: true,
    },
    [ROBOBOMB]:{
        type: ROBOBOMB,
        maxHealth: 55,
        attackDamage: 100,
        maxSpeed: 10,
        cost: 2,
        visionRange:10,
        attackCooldown: 4,
        spawnTime: 1,
        attackRange: 5,
        blastRadius: 5,
        summonable: true,
    },
    [ROBOT_TOWER]:{
        type: ROBOT_TOWER,
        maxHealth: 200,
        attackDamage: 50,
        maxSpeed: 4,
        cost: 5,
        attackCooldown: 2,
        spawnTime: 2,
        attackRange: 15,
        visionRange: 30,
        scale: 0.6,
        summonable: true,
    },
    [ROBOT_YETI]:{
        type: ROBOT_YETI,
        maxHealth: 300,
        attackDamage: 10,
        maxSpeed: 5,
        cost: 30,
        attackCooldown: 5,
        spawnTime: 5,
        attackRange: 5,
        summonable: true,
    },
    [ARCHER]:{
        type: ARCHER,
        maxHealth: 75,
        attackDamage: 15,
        maxSpeed: 5,
        cost: 2,
        attackCooldown: 1,
        spawnTime: 1,
        attackRange: 15,
        scale: 0.5,
        visionRange : 30,
        summonable: false,
    },
    [KNIGHT]:{
        type: KNIGHT,
        maxHealth: 225,
        attackDamage: 15,
        maxSpeed: 7,
        cost: 3,
        attackCooldown: 1.5,
        spawnTime: 2,
        attackRange: 5,
        scale: 0.7,
        visionRange: 30,
        summonable: false,
    }
}
const SPELLS = {
    [FIREBALL]: {
        name: FIREBALL,
        cost: 2,
        cooldown: 3,
        castTime: .1,
        blastRadius: 8,
        damage: 40,
        flightTime: 1,
        maxCastX: MIDDLE_X,
    },
    [HEALBALL]: {
        name: HEALBALL,
        cost: 3,
        cooldown: 3,
        castTime: .1,
        blastRadius: 6,
        heal: 25,
        flightTime: 1,
    },
    [HASTEBALL]: {
        name: HASTEBALL,
        cost: 4,
        cooldown: 3,
        castTime: .1,
        blastRadius: 8,
        factor: 2,
        flightTime: 1,
        duration: 2,
    },
};

({
    setUpLevel() {
        this.chips = [];
        this.chipsToRegrow = [];          
        this.missiles = [];
        this.fruitCounter = 0;
        //this.printUnitStats();
        //this.printSpellStats();
        this.setupHeroes();
        this.buildNewGrid();
        this.spawnDefenders();
        this.setInterval(this.regenEnergy.bind(this), 1);

        for(let h of this.heroes){
            h.addTrackedProperties(['score', 'number'], ['teamPower', 'number']);
        }
        
        GROW_RATE = GROW_RATE_PER_SECOND * this.world.dt;
        // this._getNearest = this.__getNearest;
    },

    spawnDefenders(){
        for(h of this.heroes){
            for(unit of DEFENDER_UNITS){
                let xPos = unit.x;
                let yPos = unit.y;
                if (h.color_ == BLUE){
                    xPos = MAX_X - unit.x;
                    yPos = MAX_Y - unit.y;
                }
                let un = this.instabuild(`${h.color}-${unit.type}`, xPos,yPos);
                if (h.color == BLUE)
                {
                    un.rotation = Math.PI;
                    un.startRotation = Math.PI;
                    un.keepTrackedProperty('rotation');
                }else{
                    un.startRotation = 0;
                }
                un.type = unit.type;
                un.color_ = h.color_;
                un.maxHealth = UNITS[unit.type].maxHealth;
                un.health = UNITS[unit.type].maxHealth;
                un.attackDamage = UNITS[unit.type].attackDamage;
                un.maxSpeed = UNITS[unit.type].maxSpeed;
                un.actions.attack.cooldown = UNITS[unit.type].attackCooldown;
                un.opponent = this.colorToHero[INVERT_COLOR[h.color_]];
                un.chooseAction = this.unit_defender_chooseAction.bind(un);
                un.attackRange =UNITS[unit.type].attackRange;
                un.visionRange = UNITS[unit.type].visionRange;
                un.startX =xPos
                un.startY =yPos
                un.type = unit.type;
                un.isDefender = true
                h.units_.push(un);
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
            manaCells.push(manaTypes[0]);
        }
        for (let i = 0; i < 9; i++) {
            manaCells = this.world.rand.shuffle(manaCells);
        }
        let counter = 0;
        for (let r = 0; r < GRID_IN_COLUMN; r++) {
            if(r >= 1 && r < 5 ){continue;}
            for (let c = 0; c < GRID_IN_ROW; c++) {
                
                const t = manaCells[counter];
                let pos = Vector(GRID_X0 + GRID_CELL_WIDTH / 2 + GRID_CELL_WIDTH * c,
                                 GRID_Y0 + GRID_CELL_HEIGHT / 2 + GRID_CELL_HEIGHT * r);
                if (Object.values(SPAWN_POINTS).some(sp => sp.distance(pos) <= 5)) { continue; }
                counter++;
                const angle = this.world.rand.randf() * Math.PI * 2;
                for (let i = 0; i < 2; i++) {
                    this.instabuild(`${t}-rect`, i ? MAX_X - pos.x : pos.x, pos.y, t);
                    for (let c = 0; c < CHIPS_ON_CELL; c++) {
                        let x, y;
                        if (i) {
                            x = MAX_X - pos.x - Math.cos(-c * CHIP_DIFF - angle) * CHIP_R;
                            y = pos.y - Math.sin(-c * CHIP_DIFF - angle) * CHIP_R;
                        }
                        else {
                            x = pos.x + Math.cos(c * CHIP_DIFF + angle) * CHIP_R;
                            y = pos.y + Math.sin(c * CHIP_DIFF + angle) * CHIP_R;
                        }
                        const chip = this.buildChip(t, x, y);
                        if (i) {
                            chip.rotation = Math.PI;
                            chip.keepTrackedProperty('rotation');
                        }
                    }
                }
            }
        }
    },

    buildNewGrid(){
        for (const m of MANA_TYPES) {
            this.buildables[`${m}-rect`].ids = [];
            for (let i = 0; i < GRID_IN_COLUMN * GRID_IN_ROW; i++) {
                this.buildables[`${m}-rect`].ids.push(`${m}-rect-${i}`);
            }
        }
        const manaTypes = this.world.rand.shuffle(MANA_TYPES);
        let manaCells = [];
        for (let i = 0; i < CELLS; i++) {
            manaCells.push(manaTypes[i%2]);
        }
        for (let i = 0; i < 9; i++) {
            manaCells = this.world.rand.shuffle(manaCells);
        }
        let counter = 0;
        for (const yValue of GRID_Y) {
            // if(r >= 1 && r < 5 ){continue;}
            for (let c = 0; c < GRID_IN_ROW; c++) {
                
                const t = manaTypes[counter%2];
                let pos = Vector(GRID_X0 + GRID_CELL_WIDTH / 2 + GRID_CELL_WIDTH * c,
                    yValue);
                if (Object.values(SPAWN_POINTS).some(sp => sp.distance(pos) <= 5)) { continue; }
                counter++;
                const angle = this.world.rand.randf() * Math.PI * 2;
                for (let i = 0; i < 2; i++) {
                    this.instabuild(`${t}-rect`, i ? 120 - pos.x : pos.x, pos.y, t);
                    for (let c = 0; c < CHIPS_ON_CELL; c++) {
                        let x, y;
                        if (i) {
                            x = MAX_X - pos.x - Math.cos(-c * CHIP_DIFF - angle) * CHIP_R;
                            y = pos.y - Math.sin(-c * CHIP_DIFF - angle) * CHIP_R;
                        }
                        else {
                            x = pos.x + Math.cos(c * CHIP_DIFF + angle) * CHIP_R;
                            y = pos.y + Math.sin(c * CHIP_DIFF + angle) * CHIP_R;
                        }
                        const chip = this.buildChip(t, x, y);
                        if (i) {
                            // chip.rotation = Math.PI;
                            chip.keepTrackedProperty('rotation');
                        }
                    }
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
        chip.type = t;
        chip.addTrackedProperties(['mana', 'string'], ['value', 'number']);
        chip.keepTrackedProperty('mana');
        
        this.chips.push(chip);
        return chip;
    },

    setupHeroes() {
        this.redHero = this.hero;
        this.blueHero = this.hero2;
        this.colorToHero = {
            [RED]: this.redHero,
            [BLUE]: this.blueHero
        }
        this.heroes = [this.hero, this.hero2];
        this.colorToHero = {
            [RED]: this.redHero,
            [BLUE]: this.blueHero
        }
        this.redHero.color_ = RED;
        this.blueHero.color_ = BLUE;
        this.redHero.opponent = this.blueHero;
        this.blueHero.opponent = this.redHero;
        const rod = this.world.getThangByID('Rod');
        Object.defineProperty(rod, 'color', {get: () => RED});
        const blo = this.world.getThangByID('Blo');
        Object.defineProperty(blo, 'color', {get: () => BLUE});
        rod.color_ = RED;
        blo.color_ = BLUE;
        this.redHero.collectors_ = [this.world.getThangByID('Rod')];
        this.blueHero.collectors_ = [this.world.getThangByID('Blo')];
        for (let h of this.heroes) {
            h.addActions({name: 'casting', cooldown: 1}, {name: 'building', cooldown: 1}, {name: 'summoning', cooldown: 1});
            h.mana_ = {}; // TODO
            for (const m of MANA_TYPES) {
                h.mana_[m] = START_MANA;
            }
            
            h.totalMana_ = START_MANA * 3;
            h.health = HERO_HEALTH;
            h.maxHealth = HERO_HEALTH;
            h.keepTrackedProperty('health');
            h.keepTrackedProperty('maxHealth');
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
        h.summonUnit = this.summonUnit_.bind(this, h);
        h.cast = this.cast_.bind(this, h);
        for (const m of MANA_TYPES) {
            Object.defineProperty(h, m, {get: function() {
                return this.mana_[m];
            }});
            h.addTrackedProperties([m, 'number']);
            h.keepTrackedProperty(m);
        }
        h.findItems = () => {
            return this.chips.slice().filter(c => c.exists && !c.parent);
        }
        h.findUnits = () => {
            return h.units_.slice();
        }
        h.findMyUnits = () => {
            return h.units_.filter(u => u.exists && u.color_ == h.color_);
        }
        h.findEnemyUnits = () => {
            return h.opponent.units_.filter(u => u.exists && u.color_ != h.color_);
        }

        Object.defineProperty(h, 'spellNames', {
            get: () => Object.keys(SPELLS),
            set: (_) => {
                throw new Error('You can\'t set `spellNames` property.')
            }
        });
        Object.defineProperty(h, 'unitTypes', {
            get: () => Object.keys(UNITS),
            set: (_) => {
                throw new Error('You can\'t set `unitTypes` property.')
            }
        });
        Object.defineProperty(h, 'color', {get: () => h.color_});
        h.opponent = this.colorToHero[INVERT_COLOR[h.color_]];
        h.getSpellData = this.getSpellData_.bind(this, h);
        h.getUnitData = this.getUnitData_.bind(this, h);
        h.getTotalMana = this.getTotalMana_.bind(this, h);
        h.findEnemyCollectors = this.findCollectors_.bind(this, h, h.opponent);
        h.findMyCollectors = this.findCollectors_.bind(this, h, h);
        h.findMyMissiles = this.findMissiles_.bind(this, h, h);
        h.findEnemyMissiles = this.findMissiles_.bind(this, h, h.opponent);
        h.getEnemyHero = () => h.opponent;
        h.canCast = this.canCast_.bind(this, h);
        h.getActiveShield = () => h.shield_;
        h.getUltraShield = () => h.ultraShield_;
        // h.collectors_ = [];
        h.units_ = [];
        h.defenders_ = [];
        h.spellCooldowns = {
            [FIREBALL] : 0,
            [HEALBALL] : 0,
            [HASTEBALL] : 0,
        };
    },


    chooseAction() {
        this.checkWin();
        this.missiles = this.missiles.filter(m => m.exists);
        this.chips = this.chips.filter(c => c.exists);
        this.chipsToRegrow = this.chipsToRegrow.filter(c => !c.done);
        if (this.gameEnd) { return }
        
        for (let h of this.heroes) {

            let oppositeTotalMana = this.colorToHero[INVERT_COLOR[h.color_]].totalMana_
            this.actCollectors(h);
            this.checkTemps(h);
            h.teamPower = h.totalMana_
            if(Math.abs(oppositeTotalMana - h.totalMana_) < 1 && h.totalMana_ > oppositeTotalMana){
                h.teamPower+=1;
            }
            h.teamPower = Math.ceil(h.teamPower)
            h.keepTrackedProperty('teamPower');

            this.updateManaPanel(h);
            if (h.action == 'building' && h.canAct()) {
                this.performSpawnCollector(h);
                h.unblock();
            }
            if (h.action == 'casting' && h.canAct()) {
                this.performCasting(h);
                h.unblock();
            }
            if (h.action == 'summoning' && h.canAct()) {
                this.performSummoning(h);
                h.unblock();
            }
            if (this.world.age >= SUDDEN_DEATH_START && !h.suddenDeathStarted) {
                h.suddenDeathStarted = true;
                h.addEffect({name:'fire', duration: 999, reverts: false, addend: -SUDDEN_DEATH_HP_PER_SECOND * this.world.dt, repeatsEvery: this.world.dt, targetProperty: 'health' });
                h.keepTrackedProperty('health');
                for (let u of h.units_) {
                    if (!u.isDefender){continue}
                    u.addEffect({name:'fire', duration: 999, reverts: false, addend: -SUDDEN_DEATH_UNIT_HP_PER_SECOND * this.world.dt, repeatsEvery: this.world.dt,  targetProperty: 'health' });
                    u.keepTrackedProperty('health');
                }
            }
        }
        this.growChips();
        for (let h of this.heroes) {
            h.units_ = h.units_.filter(u => (u.exists && !u.dead));
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
        if (h.tempUnit_){
            if (h.tempUnit_.remainingTime > 0) {
                let unitData = UNITS[h.isSummoning_];
                h.tempUnit_.remainingTime -= this.world.dt;
                h.tempUnit_.scaleFactor = unitData["scale"] * (1 - h.tempUnit_.remainingTime / h.tempUnit_.time);
                h.tempUnit_.keepTrackedProperty('scaleFactor');
                h.tempUnit_.keepTrackedProperty('alpha');
            }
            else {
                h.tempUnit_.setExists(false);
                h.tempUnit_ = null
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
                let totalManaLeftRed = this.redHero.mana + this.redHero.energy
                let totalManaLeftBlue = this.blueHero.mana + this.blueHero.energy
                if(totalManaLeftRed > totalManaLeftBlue){
                    this.redHero.totalMana_ += 1;
                }else if(totalManaLeftRed < totalManaLeftBlue){
                    this.blueHero.totalMana_ += 1;
                }else{
                    if (this.world.rand.randf() >= 0.5) {
                        this.redHero.totalMana_ += 1;
                    }
                    else {
                        this.blueHero.totalMana_ += 1;
                    }
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
            return
        }
        if (this.redHero.health <= 0) {
            this.setGoalState('blue-win', 'success');
            this.setGoalState('red-win', 'failure');
            this.clearHero(this.blueHero, false);
            this.clearHero(this.redHero, true);
            this.gameEnd = true;
            return
        }
    },

    clearHero(h, full=true) {
        for (const ms of this.missiles) {
            if (h.color_ == ms.color_) {
                ms.setExists(false);
            }
        }
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

    unit_robot_chooseAction(){
        let enemies = this.hero.opponent.units_;
        const en = this.findNearest(enemies)
        let dist = en ? this.distanceTo(en) : 999
        if (en && dist <= (this.visionRange) &&  en.health > 0) {
            this.attack(en);
        }else{
            this.attack(this.hero.opponent)
        }
    },

    unit_defender_chooseAction() {
        let enemies = this.findEnemies();
        
        const en = this.findNearest(enemies)
        let enDistToStart = en ? ((this.startX-en.pos.x)*(this.startX-en.pos.x)+(this.startY-en.pos.y)*(this.startY-en.pos.y)) : 999
        if (en && this.distanceTo(en) <= this.visionRange && enDistToStart <= (this.visionRange*this.visionRange) &&  en.health > 0) {
            this.attack(en);
        }else{
            let distToStart =((this.startX-this.pos.x)*(this.startX-this.pos.x)+(this.startY-this.pos.y)*(this.startY-this.pos.y))

            if(distToStart < 4)
            {
                this.setAction('idle')
                this.rotation = this.startRotation
            }else{
                this.moveXY(this.startX,this.startY);
            }
        }
    },

    actCollectors(h) {
        if (this.world.age === 0) { return }
        for (const collector of h.collectors_.slice()) {
            if (!collector.exists || collector.dead) {
                h.collectors_ = h.collectors_.filter(c => !c.dead);
                continue;
            }
            const item = collector.peekItem();
            if (item) {
                const spos = SPAWN_POINTS[collector.color_];
                if (collector.distanceSquared(spos) <= DROP_DISTANCE_SQ) {
                    collector.dropItem(spos);
                    item.delivered = true;
                    item.lifespan = this.world.dt * 2;
                    h.mana_[item.manaType_] += Math.round(10 * item.value_) / 10;
                    h.totalMana_ += Math.round(10 * item.value_) / 10;
                    h.keepTrackedProperty(item.manaType_);
                    collector.health -= 1;
                    collector.keepTrackedProperty('health');
                    if (collector.health <= 0) {
                        collector.die();
                        h.collectors_ = h.collectors_.filter(c => !c.dead);
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
                    continue;
                }
                if (collector.distanceSquared(tChip.pos) <= PICK_DISTANCE_SQ) {
                    collector.pickUpItem(tChip);
                    collector.targetedChip = null;
                    this.chipsToRegrow.push({pos: tChip.pos.copy(), mana: tChip.manaType_, remainedTime: REGROW_TIME});
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
                    nChip = collector.getNearest(availableChips.filter(c => c.manaType_ == choice));
                }else if(availableChips.includes(choice) && choice.exists){
                    nChip = choice;
                }
                else if (_.isArray(choice) && choice.length >= 1 && _.isNumber(choice[0]) && _.isNumber(choice[1])) {
                    const v = Vector(choice[0], choice[1]);
                    if (h.color_ == BLUE)
                    {
                        v.x = MAX_X - v.x;
                        v.y = MAX_Y - v.y;
                    }
                    nChip = this._getNearest(v, availableChips);
                }
                else if (choice && choice.x && choice.y && _.isNumber(choice.x) && _.isNumber(choice.y)) {
                    const v = Vector(choice.x, choice.y);
                    if (h.color_ == BLUE)
                    {
                        v.x = MAX_X - v.x;
                        v.y = MAX_Y - v.y;
                    }
                    nChip = this._getNearest(v, availableChips);
                }
                else {
                    nChip = collector.getNearest(availableChips);
                }
                if (!nChip) { continue;}
                nChip[`targeted${collector.color_}`] = true;
                collector.targetedChip = nChip;
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
        for (const ch of this.chips) {
            if (!ch.exists || ch.parent || ch.delivered || ch.value_ >= MAX_GROW_VALUE) { continue }
            ch.value_ += growRates[+(ch.pos.x > MIDDLE_X)];
            ch.scaleFactor = ((ch.value_ - 1) / MAX_GROW_VALUE) * 1.4 + .6;
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
        const collector = this.instabuild(`${h.color_}-collector`, sp.x, sp.y, `${h.color_}-collector`);
        collector.color_ = h.color_;
        Object.defineProperty(collector, 'color', {get: () => collector.color_});
        collector.maxHealth = COLLECTOR_LIFE;
        collector.health = COLLECTOR_LIFE;
        Object.defineProperty(collector, 'speed', {get: function() {
            return this.maxSpeed;
        }});
        collector.keepTrackedProperty('health');
        collector.keepTrackedProperty('maxHealth');
        h.collectors_.push(collector);
        this.heroToIdle(h);
    },

    performCasting(h) {

        const spellData = SPELLS[h.isCasting_];
        const spellName = h.isCasting_;
        this[`cast_${spellName}`](h, ...h.spellArgs);
        this.heroToIdle(h);
    },

    cast_fireball(h, x, y)
    {
        const spellData  = SPELLS[FIREBALL];
        x = Math.min(spellData.maxCastX, x);
        if(h.color_ == BLUE)
        {
            x = MAX_X - x;
            y = MAX_Y - y;
        }
        h.targetPos = new Vector(x, y)
        const fireball = this.instabuild(`fireball-spell`, x, y);
        //const rock = this.ref.instabuild(this.rockAsset || 'rock', throwPos.x, throwPos.y);
        fireball.color = h.color_;
        fireball.targetPos = h.targetPos;
        // const dist = h.distance(throwPos);
        fireball.flightTime = spellData.flightTime
        fireball.lifespan = 1
        fireball.blastRadius = spellData.blastRadius;
        fireball.damage = spellData.damage
        // blob.maxSpeed = this.ref.blobSpeed || 10;
        fireball.launch(h);
        h.targetPos = null;
        fireball.hero_ = h
        fireball.explode = () => {
            fireball.setExists(false);
            const X = parseFloat(fireball.pos.x.toFixed(2));
            const Y = parseFloat(fireball.pos.y.toFixed(2));
            const radius = parseFloat(fireball.blastRadius.toFixed(2));
            const color = '#FFA500';
            const args = [X, Y, radius, color, 0, 0];
            h.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
            let damageable = [...h.opponent.collectors_.slice(), ...h.opponent.units_.slice()];
            for (const dmgAble of damageable) {
                if(!dmgAble.exists || dmgAble.dead){continue;}
                
                if(dmgAble.distance(fireball) <= fireball.blastRadius){
                    dmgAble.takeDamage(fireball.damage);
                }
            }
        };
    },
    cast_healball(h, x, y)
    {
        const spellData  = SPELLS[HEALBALL];
        x = Math.min(MIDDLE_X, x);
        if(h.color_ == BLUE)
        {
            x = MAX_X - x;
            y = MAX_Y - y;
        }
        h.targetPos = new Vector(x, y)
        const healball = this.instabuild(`healball-spell`, x, y);
        //const rock = this.ref.instabuild(this.rockAsset || 'rock', throwPos.x, throwPos.y);
        healball.color = h.color_;
        healball.targetPos = h.targetPos;
        healball.heal = spellData.heal
        // const dist = h.distance(throwPos);
        healball.flightTime = spellData.flightTime
        healball.lifespan = 1
        healball.blastRadius = spellData.blastRadius;
        // blob.maxSpeed = this.ref.blobSpeed || 10;
        healball.launch(h);
        h.targetPos = null;
        healball.hero_ = h
        healball.explode = () => {
            healball.setExists(false);
            const X = parseFloat(healball.pos.x.toFixed(2));
            const Y = parseFloat(healball.pos.y.toFixed(2));
            const radius = parseFloat(healball.blastRadius.toFixed(2));
            const color = '#32A852';
            const args = [X, Y, radius, color, 0, 0];
            h.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
            let healAble =  h.units_.slice();
            for (const healedUnit of healAble) {
                if(!healedUnit.exists || healedUnit.dead){continue;}
                if(healedUnit.distance(healball) > healball.blastRadius){continue}
                healedUnit.addEffect({name: 'heal', duration: 0.5, reverts: true, setTo: true, targetProperty: 'beingHealed'});
                healedUnit.health = Math.min(healedUnit.maxHealth, healedUnit.health + healball.heal);
                healedUnit.keepTrackedProperty('health');
            }
        };
    },
    cast_hasteball(h, x, y)
    {
        const spellData  = SPELLS[HASTEBALL];
        x = Math.min(MIDDLE_X, x);
        if(h.color_ == BLUE)
        {
            x = MAX_X - x;
            y = MAX_Y - y;
        }
        h.targetPos = new Vector(x, y)
        const hasteball = this.instabuild(`hasteball-spell`, x, y);
        //const rock = this.ref.instabuild(this.rockAsset || 'rock', throwPos.x, throwPos.y);
        hasteball.color = h.color_;
        hasteball.targetPos = h.targetPos;
        hasteball.heal = spellData.heal
        // const dist = h.distance(throwPos);
        hasteball.flightTime = spellData.flightTime
        hasteball.lifespan = 1
        hasteball.blastRadius = spellData.blastRadius;
        // blob.maxSpeed = this.ref.blobSpeed || 10;
        hasteball.launch(h);
        h.targetPos = null;
        hasteball.hero_ = h
        hasteball.explode = () => {
            hasteball.setExists(false);
            const X = parseFloat(hasteball.pos.x.toFixed(2));
            const Y = parseFloat(hasteball.pos.y.toFixed(2));
            const radius = parseFloat(hasteball.blastRadius.toFixed(2));
            const color = '#00FFFF';
            const args = [X, Y, radius, color, 0, 0];
            h.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
            let hasteAble =  [...h.collectors_.slice(), ...h.units_.slice()];
            for (const hastedUnit of hasteAble) {
                if(!hastedUnit.exists || hastedUnit.dead){continue;}
                if(hastedUnit.distance(hasteball) > hasteball.blastRadius){continue}
                hastedUnit.addEffect({name: 'haste', duration: spellData.duration, reverts: true, factor: spellData.factor, targetProperty: 'maxSpeed'});
                hastedUnit.keepTrackedProperty('maxSpeed');
            }
        };
    },

    regenEnergy() {
        for(let hero of this.heroes){
            hero.mana_[ENERGY] += ENERGY_REGEN;
            hero.mana_[MANA] += MANA_REGEN;
        }
    },

    performSummoning(h) {
        const unitData = UNITS[h.isSummoning_];
        h.buildXY(h.isSummoning_, SPAWN_POINTS[h.color_].x, SPAWN_POINTS[h.color_].y);
        const unit = h.performBuild(`${h.color_}-${h.isSummoning_}`);
        unit.color_ = h.color_;
        unit.maxHealth = unit.health = unitData.maxHealth;
        unit.attackDamage = unitData.attackDamage;
        unit.maxSpeed = unitData.maxSpeed;
        unit.actions.attack.cooldown = unitData.attackCooldown;
        unit.attackRange = unitData.attackRange;
        unit.cost = unitData.cost;
        unit.type = h.isSummoning_;
        unit.visionRange = unitData.visionRange;
        unit.chooseAction = this.unit_robot_chooseAction.bind(unit);
        unit.hero = h;
        unit.startsPeaceful = false;
        unit.spawnTime = unitData.spawnTime;
        unit.addTrackedProperties(['health', 'number'], ['maxHealth', 'number']);
        unit.keepTrackedProperty('health');
        unit.keepTrackedProperty('maxHealth');
        unit.startsPeaceful = false
        if(unit.type == ROBOBOMB){
            unit.attackRange = unitData.blastRadius/1.5;
            unit.performAttack = (target) => {
                
                let oppEnemies = unit.findEnemies();
                for (const enemy of oppEnemies) {
                    if(enemy.distance(unit) <=  unitData.blastRadius){
                        enemy.takeDamage(unit.attackDamage);
                    }
                }
                const X = parseFloat(unit.pos.x.toFixed(2));
                const Y = parseFloat(unit.pos.y.toFixed(2));
                const radius = parseFloat(unitData.blastRadius.toFixed(2));
                const color = '#FF0000';
                const args = [X, Y, radius, color, 0, 0];
                h.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
                unit.health = -999
            };
        }
        h.units_.push(unit);
        this.heroToIdle(h);
    },

    setupMissileAPI(h, ms) {
        Object.defineProperty(ms, 'color', {get: () => ms.color_});
        Object.defineProperty(ms, 'mana', {get: () => ms.manaType_});
    },

    performFireUltra(h, sd) {
        for (const collector of h.opponent.collectors_.slice()) {
            if (!collector.exists || collector.health <= 0) { continue }
            collector.health -= sd.power;
            collector.addEffect({name: 'fire', duration: sd.duration, reverts: true, setTo: true, targetProperty: 'underFire'});
            if (collector.health <= 0) {
                collector.die();
                collector.lifespan = 0.5;
                if (collector.targetedChip) {
                    collector.targetedChip[`targeted${collector.color_}`] = null;
                }
                const item = collector.peekItem();
                if (item) {
                    item.setExists(false);
                }
            }
        }
        h.opponent.collectors_ = h.opponent.collectors_.filter(c => !c.dead);
    },

    performWaterUltra(h, sd) {
        for (const collector of h.collectors_.slice()) {
            if (!collector.exists || collector.health <= 0) { continue }
            collector.health += sd.power;
            collector.health = Math.min(collector.health, collector.maxHealth);
            collector.addEffect({name: 'heal', duration: sd.duration, reverts: true, setTo: true, targetProperty: 'underHeal'});
        }
    },

    performEarthUltra(h, sd) {
        h.growRate_ = sd.power;
        h.growRateTime_ = this.world.age + sd.duration;
        this.world.getThangByID(`${h.color_}-glow`).setExists(true);
        // const spos = SHIELD_ULTRA_POS[h.color_];
        // if (h.ultraShield_) {
        //     h.ultraShield_.setExists(false);
        // }
        // h.ultraShield_ = this.instabuild(`${EARTH}-${NAME_ULTRA}`, spos.x, spos.y);
        // h.ultraShield_.manaType_ = sd.mana;
        // Object.defineProperty(h.ultraShield_, 'mana', {get: function() {
        //     return this.manaType_;
        // }});
        // h.ultraShield_.addTrackedProperties(['mana', 'string']);
        // h.ultraShield_.keepTrackedProperty('mana');
        // h.ultraShield_.color_ = h.color_;
        // h.ultraShield_.maxHealth = h.ultraShield_.health = sd.power;
        // h.ultraShield_.keepTrackedProperty('health');
        // h.ultraShield_.keepTrackedProperty('maxHealth');
        // h.ultraShield_.isShield_ = true;
        // this.world.getSystem('AI').onObstaclesChanged();
    },

    _getNearest(vect, thangs) {
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


    
    spawnCollector_(h) {
        if (h.collectors_.length >= MAX_COLLECTORS) {
            return false;
        }
        if (h.isBusy_) { return };
        h.actions.building.cooldown = SPAWN_COOLDOWNS[h.collectors_.length];
        h.isBuilding_ = true;
        h.isBusy_ = true;
        h.intent_ = 'building';
        h.setAction('building');
        h.act();
        const sp = SPAWN_TEMP_POINTS[h.color_];
        h.tempCollector_ = this.instabuild(`${h.color_}-collector`, sp.x, sp.y, `${h.color_}-collector`);
        h.tempCollector_.alpha = 0.5;
        h.tempCollector_.keepTrackedProperty('alpha');
        h.tempCollector_.scaleFactor = 0.0001;
        h.tempCollector_.keepTrackedProperty('scaleFactor');
        h.tempCollector_.time = h.actions.building.cooldown;
        h.tempCollector_.remainingTime = h.actions.building.cooldown;
        h.tempCollector_.isAttackable = false;
        h.tempCollector_.collisionCategory = "none"
        return h.block();
    },
    summonUnit_(h, unitType) {
        if (h.isBusy_) {
            return;
        }
        const unitData = UNITS[unitType];
        if (!unitData) {
            throw new Error(`${unitType} is not a valid unit type`);
        }
        if (!unitData.summonable) {
            throw new Error(`${unitType} is not a summonable unit`);
        }
        if (unitData.cost > h.mana_[ENERGY]) {
            return;
        }
        h.mana_[ENERGY] -= unitData.cost;
        h.actions.summoning.cooldown = unitData.spawnTime;
        h.isSummoning_ = unitType;
        h.isBusy_ = true;
        h.intent_ = 'summoning';
        h.setAction('summoning');
        h.act();
        const sp = SPAWN_TEMP_POINTS[h.color_];
        h.tempUnit_ = this.instabuild(`${unitType}`, sp.x, sp.y, `${h.color}_${unitType}`);
        h.tempUnit_.team = h.team,
        // h.tempUnit_.pos.z = TEMP_UNIT_Z;
        h.tempUnit_.color_ = h.color_;
        h.tempUnit_.setAction('idle');
        h.tempUnit_.startsPeaceful = true;
        h.tempUnit_.isAttackable = false;
        h.tempUnit_.keepTrackedProperty('pos');
        h.tempUnit_.alpha = 0.5;
        h.tempUnit_.keepTrackedProperty('alpha');
        h.tempUnit_.scaleFactor = 0.0001;
        h.tempUnit_.keepTrackedProperty('scaleFactor');
        h.tempUnit_.time = unitData.spawnTime;
        h.tempUnit_.remainingTime = unitData.spawnTime;
        h.tempUnit_.scaleCoef = unitData.cost / TEMP_COST_TO_SCALE;
        h.tempUnit_.rotation = h.color_ == RED ? 0 : Math.PI;
        h.tempUnit_.collisionCategory = "none"
        return h.block();
    },
    canCast_(h, spellName) {
        const spellData = SPELLS[spellName];
        if (h.spellCooldowns[spellName] == null) {
            throw new Error(`There is not a spell named ${spellName}.`);
        }
        if(spellData.cost > h.mana_[MANA]){
            return false;
        }
        return h.spellCooldowns[spellName] <= this.world.age;
    },
    checkArgs(spellName, args) {
        if(spellName == FIREBALL || spellName == HEALBALL || spellName == HASTEBALL)
        {
            if(args.length <= 1){
                throw new Error(`You need to provide x and y for the ${spellName} spell.`);
            }
            let x = args[0];
            let y = args[1];
            if(typeof(x) != "number" || typeof(y) != "number"){
                throw new Error(`The x and y arguments should be numbers.`);
            }
            // if(x > MIDDLE_X)
            // {
            //     return false;
            // }
            return true
           
        }
    },
    cast_(h, spellName, ...args) {
        if (h.isBusy_) {
            return;
        }
        const spellData = SPELLS[spellName];
        if (!spellData) {
            throw new Error(`cast NO SPELL ${spellName}`);
        }
        if (!h.canCast(spellName)) {
            return;
        }
        if (!this.checkArgs(spellName, args)) {
            return;
        }
        if (spellData.cost > h.mana_[MANA]) {
            return;
        }
        h.mana_[MANA] -= spellData.cost;
        h.isCasting_ = spellName;
        h.isBusy_ = true;
        h.actions.casting.cooldown = spellData.castTime
        h.intent_ = 'casting';
        h.setAction('casting');
        h.act();
        h.spellCooldowns[spellName] = this.world.age + spellData.cooldown;
        h.spellArgs = args;
        h.tempSpell_ = this.instabuild(`${MANA}-chip`, h.pos.x, h.pos.y);
        h.tempSpell_.pos.z = TEMP_SPELL_Z;
        h.tempSpell_.keepTrackedProperty('pos');
        h.tempSpell_.alpha = 0.5;
        h.tempSpell_.keepTrackedProperty('alpha');
        h.tempSpell_.scaleFactor = 0.0001;
        h.tempSpell_.keepTrackedProperty('scaleFactor');
        h.tempSpell_.time = spellData.castTime;
        h.tempSpell_.remainingTime = spellData.castTime;
        h.tempSpell_.scaleCoef = 1
        return h.block();
    },

    castOld_(h, spellName) {
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
        const unitData = UNITS[unitType];
        if (!unitData) {
            throw new Error(`getUnitData NO UNIT ${unitType}`);
        }
        const newData = {}
        for (const key in unitData) {
            newData[key] = unitData[key];
        }
        return newData
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

    findMissiles_(h, whom) {
        return this.missiles.filter(m => m.color_ == whom.color_ && m.exists);
    },

    printUnitStats()
    {
        totalSt = ""
        for(let unit of Object.keys(UNITS))
        {
            totalSt+=`\`${unit}\`\n------------\n`
            for (let key in UNITS[unit]) {
                totalSt+= `    ${key}: ${UNITS[unit][key]}\n`;
            }
        }
        console.log(totalSt);
    },

    printSpellStats()
    {
        totalSt = ""
        for(let spell of Object.keys(SPELLS))
        {
            
            totalSt+=`\`${spell}\`\n------------\n`
            for (let key in SPELLS[spell]) {
                totalSt+= `    ${key}: ${SPELLS[spell][key]}\n`;
            }
        }
        console.log(totalSt);
    }

    // canCast_(h, spellName) {
    //     if (h.isBusy_) {
    //         return false;
    //     }
    //     const spellData = SPELLS[spellName];
    //     if (!spellData) {
    //         throw new Error(`canCast NO SPELL ${spellName}`);
    //     }
    //     return h.mana_[spellData.mana] >= spellData.cost;
    // }
})