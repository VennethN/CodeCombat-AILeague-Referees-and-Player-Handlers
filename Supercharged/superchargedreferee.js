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
const GRID_Y = [25, 75]
const GRID_CELL_WIDTH = 10;
const GRID_CELL_HEIGHT = 10;
const GRID_IN_ROW = 4;
const GRID_IN_COLUMN = 6;
const CHIPS_ON_CELL = 3;
const CHIP_R = 3;
const CHIP_DIFF = Math.PI * 2 / CHIPS_ON_CELL;
const CELLS = 16;
const MAX_PATH_LENGTH = 10;

const HERO_ATTACK_COOLDOWN = 1;
const HERO_ATTACK_RANGE = 18;
const HERO_ATTACK_DAMAGE = 10;

const MAX_GROW_VALUE = 5;
const MAX_GROW_TIME = 120;
const GROW_RATE_PER_SECOND = (MAX_GROW_VALUE - 1) / MAX_GROW_TIME;
let GROW_RATE;
const REGROW_TIME = 30;


const HERO_HEALTH = 1500;
const SUDDEN_DEATH_START = 120;
const SUDDEN_DEATH_HP_PER_SECOND = HERO_HEALTH / (180 - SUDDEN_DEATH_START);
const SUDDEN_DEATH_UNIT_HP_PER_SECOND = 200 / (180 - SUDDEN_DEATH_START);

const MAX_COLLECTORS = 4;
const SPAWN_COOLDOWNS = [3, 5, 12, 20, 27, 36, 45, 54, 60];
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
const COLLECTOR_TAKE_DAMAGE = 6;

const START_MANA = 1;

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

const MAX_UNITS = 10;

const ENERGY_REGEN = 0.1;
const MANA_REGEN = 0.1;

const SPAWNABLE_UNITS = [ROBOT_SOLDIER, ROBOT_TURRET, ROBOT_SPIDER, ROBOT_GOLEM, ROBOBOMB, ROBOT_YETI, ROBOT_TOWER];

const CONTROL_POITNS = {
    ["A"]:{
        x:32,
        y:70,
    },
    ["B"]:{
        x:32,
        y:30,
    },
    ["C"]:{
        x:46.5,
        y:50,
    },
    ["D"]:{
        x:60,
        y:70,
    },
    ["E"]:{
        x:60,
        y:30,
    },
    ["F"]:{
        x:74.5,
        y:50,
    },
    ["G"]:{
        x:88,
        y:70,
    },
    ["H"]:{
        x:88,
        y:30,
    },
}

const DEFENDER_UNITS = [
    {
        type: ARCHER,
        x: 20,
        y: 72,
    },
    {
        type: ARCHER,
        x: 20,
        y: 28,
    },
    {
        type: KNIGHT,
        x: 25,
        y: 37,
    },
    {
        type: KNIGHT,
        x: 25,
        y: 63,
    },
    {
        type: ARCHER,
        x: 30,
        y: 72,
    },
    {
        type: ARCHER,
        x: 30,
        y: 28,
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
        maxHealth: 80,
        attackDamage: 25,
        maxSpeed: 8,
        cost: 5,
        attackCooldown: 1,
        spawnTime: .2,
        attackRange: 2,
        canTargetCollectors: false,
        scale: 0.5,
        visionRange: 15,
        summonable: true,
    },
    [ROBOT_TURRET]:{
        type: ROBOT_TURRET,
        maxHealth: 50,
        attackDamage: 15,
        maxSpeed: 7,
        cost: 6,
        attackCooldown: 1,
        spawnTime: .3,
        attackRange: 15,
        canTargetCollectors: true,
        scale: 0.4,
        visionRange: 15,
        summonable: true,
    },
    [ROBOT_SPIDER]:{
        type: ROBOT_SPIDER,
        maxHealth: 70,
        attackDamage: 40,
        maxSpeed: 10,
        cost: 7,
        attackCooldown: 1,
        spawnTime: .5,
        attackRange: 2,
        canTargetCollectors: false,
        scale: 0.8,
        visionRange: 15,
        summonable: true,
    },
    [ROBOT_GOLEM]:{
        type: ROBOT_GOLEM,
        maxHealth: 300,
        attackDamage: 35,
        maxSpeed: 4,
        cost: 14,
        attackCooldown: 1.8,
        canTargetCollectors: false,
        spawnTime: 3,
        attackRange: 2,
        visionRange: 15,
        summonable: true,
    },
    [ROBOBOMB]:{
        type: ROBOBOMB,
        maxHealth: 80,
        attackDamage: 100,
        maxSpeed: 10.5,
        cost: 9,
        visionRange:15,
        attackCooldown: 4,
        canTargetCollectors: false,
        spawnTime: 1,
        attackRange: 1,
        blastRadius: 5,
        summonable: true,
    },
    [ROBOT_TOWER]:{
        type: ROBOT_TOWER,
        maxHealth: 120,
        attackDamage: 40,
        maxSpeed: 6,
        cost: 12,
        attackCooldown: 1,
        canTargetCollectors: true,
        spawnTime: 2,
        attackRange: 15,
        visionRange: 15,
        scale: 0.6,
        summonable: true,
    }
    // [ROBOT_YETI]:{
    //     type: ROBOT_YETI,
    //     maxHealth: 300,
    //     attackDamage: 10,
    //     maxSpeed: 5,
    //     cost: 30,
    //     attackCooldown: 5,
    //     canTargetCollectors: false,
    //     spawnTime: 5,
    //     attackRange: 5,
    //     summonable: true,
    // },
    // [ARCHER]:{
    //     type: ARCHER,
    //     maxHealth: 75,
    //     attackDamage: 15,
    //     maxSpeed: 5,
    //     cost: 2,
    //     attackCooldown: 1,
    //     canTargetCollectors: false,
    //     spawnTime: 1,
    //     attackRange: 15,
    //     scale: 0.5,
    //     visionRange : 30,
    //     summonable: false,
    // },
    // [KNIGHT]:{
    //     type: KNIGHT,
    //     maxHealth: 225,
    //     attackDamage: 15,
    //     maxSpeed: 7,
    //     cost: 3,
    //     attackCooldown: 1.5,
    //     canTargetCollectors: false,
    //     spawnTime: 2,
    //     attackRange: 5,
    //     scale: 0.7,
    //     visionRange: 30,
    //     summonable: false,
    // }
}
const SPELLS = {
    [FIREBALL]: {
        name: FIREBALL,
        cost: 3,
        cooldown: 3,
        castTime: .1,
        blastRadius: 8,
        damage: 40,
        flightTime: 1,
        maxCastX: 999,
    },
    [HEALBALL]: {
        name: HEALBALL,
        cost: 3,
        cooldown: 3,
        castTime: .1,
        blastRadius: 6,
        heal: 40,
        flightTime: 1,
    },
    [HASTEBALL]: {
        name: HASTEBALL,
        cost: 3,
        cooldown: 3,
        castTime: .1,
        blastRadius: 10,
        factor: 2,
        flightTime: 1,
        duration: 3,
    },
};

({

    initLetters()
    {
        for(let [key,value] of Object.entries(CONTROL_POITNS))
        {
            var pedestal = this.instabuild("control-point-pedestal",value.x,value.y);
            var letter = this.instabuild('letter-'+key,value.x,value.y);
            letter.scaleFactor = 0.2;
            letter.keepTrackedProperty('scaleFactor');


        }
    },
    setUpLevel() {
        this.chips = [];
        this.chipsToRegrow = [];          
        this.fruitCounter = 0;
        this.printUnitStats();
        this.printSpellStats();
        this.setupHeroes();
        this.buildNewGrid();
        this.initLetters();
        // this.spawnDefenders(); Previous arena stuff
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
                Object.defineProperty(un, 'speed', {get: () => un.maxSpeed});
                un.actions.attack.cooldown = UNITS[unit.type].attackCooldown;
                un.attackCooldown = UNITS[unit.type].attackCooldown;
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
        // const rod = this.world.getThangByID('Rod');
        // Object.defineProperty(rod, 'color', {get: () => RED});
        // const blo = this.world.getThangByID('Blo');
        // Object.defineProperty(blo, 'color', {get: () => BLUE});
        // rod.color_ = RED; 
        // blo.color_ = BLUE;
        this.redHero.collectors_ = [];
        this.blueHero.collectors_ = [];
        this.redHero.validEventTypes = ["spawn-collector"];
        this.blueHero.validEventTypes = ["spawn-collector"];
        for (let h of this.heroes) {
            h.addActions({name: 'casting', cooldown: 1}, {name: 'building', cooldown: 1}, {name: 'summoning', cooldown: 1}, {name: 'waiting', cooldown: 1});
            h.mana_ = {}; // TODO
            for (const m of MANA_TYPES) {
                h.mana_[m] = START_MANA;
            }
            
            h.totalMana_ = START_MANA * 2;
            h.health = HERO_HEALTH;
            h.maxHealth = HERO_HEALTH;
            h.keepTrackedProperty('health');
            h.keepTrackedProperty('maxHealth');
            this.setHeroAPI(h);
        }
    },
    findItems_() {
        return this.chips.slice().filter(c => c.exists && !c.parent && !c.delivered);
    },
    findNearestItem_(un)
    {
      return un.findNearest(this.findItems_());
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
        h.heroTurret = this.world.getThangByID(`${h.color_}-turret`);
        h.heroTurret.type = 'heroTurret'
        h.heroTurret.spells = []
        h.heroTurret.attackable = false
        h.heroTurret.color = h.color_;
        h.heroTurret.maxHealth = 99999
        h.heroTurret.health = 99999
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
        h.attackRange = 999
        h.heroTurret.attackDamage = HERO_ATTACK_DAMAGE;
        h.heroTurret.attackRange = HERO_ATTACK_RANGE;
        h.heroTurret.commander = true
        h.heroTurret.actions.attack.cooldown = HERO_ATTACK_COOLDOWN;
        h.heroTurret.startsPeaceful = true
        h.wait = (x) =>{
            if (!_.isNumber(x) || x < 0) {
                throw new Error('You should provide a positive number of seconds to wait for.');
            }
            h.actions.waiting.cooldown = x;
            h.isBusy_ = true;
            h.intent_ = 'waiting';
            h.setAction('waiting');
            h.act();
            return h.block();

        }
        h.findEnemyCollectors = this.findCollectors_.bind(this, h, h.opponent);
        h.findMyCollectors = this.findCollectors_.bind(this, h, h);
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
        this.chips = this.chips.filter(c => c.exists);
        this.chipsToRegrow = this.chipsToRegrow.filter(c => !c.done);
        if (this.gameEnd) { return }
        
        for (let h of this.heroes) {

            let oppositeTotalMana = this.colorToHero[INVERT_COLOR[h.color_]].totalMana_
            this.actCollectors(h);
            this.actHero(h);
            this.checkTemps(h);
            h.teamPower = h.totalMana_
            if(Math.abs(oppositeTotalMana - h.totalMana_) < 1 && h.totalMana_ > oppositeTotalMana){
                h.teamPower+=1;
            }
            h.teamPower = Math.ceil(h.teamPower)
            h.keepTrackedProperty('teamPower');
            if(!h.eventHandlers['spawn-collector'])
            {
                h.collectors_.forEach(this['defaultAct_collector'].bind(this, h));
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
            if (h.action == 'summoning' && h.canAct()) {
                this.performSummoning(h);
                h.unblock();
            }
            if (h.action == 'waiting' && h.canAct())
            {
                this.heroToIdle(h);
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
        if (full) {
            if (h.shield_) {
                h.shield_.setExists(false);
                h.shield_ = null;
            }
            for (const collector of h.collectors_) {
                collector.die();
            }
            for (const unit of h.units_) {
                unit.die();
            }
            h.heroTurret.die();
        }
    },

    unit_robot_chooseAction(){
        if(this.dead || !this.exists){return;}
        let enemies = this.hero.opponent.units_;
        let collectors = this.hero.opponent.collectors_;
        if (this.canTargetCollectors)
        {
            enemies = [...enemies,...collectors]
        }
        const en = this.findNearest(enemies)
        let dist = en ? this.distanceTo(en) : 999
        if (en && dist <= (this.visionRange) &&  en.health > 0) {
            this.attack(en);
        }else{
            let controlPath = this.controlPath
            if (controlPath === null)
            {
                this.attack(this.hero.opponent)
                return
            }
            let controlPathIndex = this.controlPathIndex
            if (controlPathIndex === null || controlPathIndex === undefined)
            {
                controlPathIndex = 0
                this.controlPathIndex = controlPathIndex
            }
            let controlPoint = {...CONTROL_POITNS[controlPath[controlPathIndex]]};
            if (controlPoint === null || controlPoint === undefined || controlPathIndex >= controlPath.length)
            {
                this.controlPathIndex = null
                this.controlPath = null
                this.attack(this.hero.opponent)
                return
            }
            if (this.color_ == BLUE)
            {
                controlPoint.x = MAX_X - controlPoint.x
                controlPoint.y = MAX_Y - controlPoint.y
            }
            let distToControl = ((controlPoint.x-this.pos.x)*(controlPoint.x-this.pos.x)+(controlPoint.y-this.pos.y)*(controlPoint.y-this.pos.y))
            if(distToControl < 1)
            {
                controlPathIndex += 1
                this.controlPathIndex = controlPathIndex
            }
            this.moveXY(controlPoint.x,controlPoint.y)
        }
    },

    unit_defender_chooseAction() {
        if(this.dead || !this.exists){return;}
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

    actHero(h)
    {
        if (h.dead || h.health <= 0) { return }
        if (!h.heroTurret || !h.heroTurret.exists)
        {
            return;
        }
        let targetAble =[...h.opponent.units_, ...h.opponent.collectors_]
        let target = h.getNearest(targetAble);
        let bCheck = target && !target.dead && target.health > 0 && h.distanceTo(target) <= h.attackRange
        if (bCheck) {
            h.heroTurret.attack(target);
        }else{
            h.heroTurret.setAction('idle')
        }
    },

    actCollectors(h) {
        if (this.world.age === 0) { return }
        for (const collector of h.collectors_.slice()) {
            if (!collector.exists || collector.dead) {
                h.collectors_ = h.collectors_.filter(c => !c.dead);
                continue;
            }
        }
        //     const item = collector.peekItem();
        //     if (item) {
        //         const spos = SPAWN_POINTS[collector.color_];
        //         if (collector.distanceSquared(spos) <= DROP_DISTANCE_SQ) {
        //             collector.dropItem(spos);
        //             item.delivered = true;
        //             item.lifespan = this.world.dt * 2;
        //             h.mana_[item.manaType_] += Math.round(10 * item.value_) / 10;
        //             h.totalMana_ += Math.round(10 * item.value_) / 10;
        //             h.keepTrackedProperty(item.manaType_);
        //             collector.health -= 1;
        //             collector.keepTrackedProperty('health');
        //             if (collector.health <= 0) {
        //                 collector.die();
        //                 h.collectors_ = h.collectors_.filter(c => !c.dead);
        //             }
        //         }
        //         else {
        //             collector.move(spos);
        //         }
        //     }
        //     else if (collector.targetedChip) {
        //         const tChip = collector.targetedChip;
        //         if (tChip.parent) {
        //             collector.targetedChip = null;
        //             collector.brake();
        //             collector.setTargetPos(null);
        //             continue;
        //         }
        //         if (collector.distanceSquared(tChip.pos) <= PICK_DISTANCE_SQ) {
        //             collector.pickUpItem(tChip);
        //             collector.targetedChip = null;
        //             this.chipsToRegrow.push({pos: tChip.pos.copy(), mana: tChip.manaType_, remainedTime: REGROW_TIME});
        //         }
        //         else {
        //             collector.move(tChip.pos);
        //         }
        //     }
        //     else {
        //         let choice = null;
        //         let availableChips = this.chips.filter(c => c.exists && !c.parent && !c.delivered && !c[`targeted${h.color_}`]);
        //         let nChip;
        //         if (_.isFunction(h.chooseItem)) {
        //             try{
        //                 choice = h.chooseItem(collector);
        //             } catch(e){
        //                 console.log(e);
        //             }
        //         }
        //         if (_.isString(choice) && MANA_TYPES.includes(choice)) {
        //             nChip = collector.getNearest(availableChips.filter(c => c.manaType_ == choice));
        //         }else if(availableChips.includes(choice) && choice.exists){
        //             nChip = choice;
        //         }
        //         else if (_.isArray(choice) && choice.length >= 1 && _.isNumber(choice[0]) && _.isNumber(choice[1])) {
        //             const v = Vector(choice[0], choice[1]);
        //             if (h.color_ == BLUE)
        //             {
        //                 v.x = MAX_X - v.x;
        //                 v.y = MAX_Y - v.y;
        //             }
        //             nChip = this._getNearest(v, availableChips);
        //         }
        //         else if (choice && choice.x && choice.y && _.isNumber(choice.x) && _.isNumber(choice.y)) {
        //             const v = Vector(choice.x, choice.y);
        //             if (h.color_ == BLUE)
        //             {
        //                 v.x = MAX_X - v.x;
        //                 v.y = MAX_Y - v.y;
        //             }
        //             nChip = this._getNearest(v, availableChips);
        //         }
        //         else {
        //             nChip = collector.getNearest(availableChips);
        //         }
        //         if (!nChip) { continue;}
        //         nChip[`targeted${collector.color_}`] = true;
        //         collector.targetedChip = nChip;
        //     }
        // }
    },

    damageHero(m, h) {
        h.takeDamage(m.damage_);
        m.setExists(false);
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
        let zPos = new Vector(sp.x, sp.y, 6);
        collector.pos = zPos;
        collector.color_ = h.color_;
        Object.defineProperty(collector, 'color', {get: () => collector.color_});
        collector.maxHealth = COLLECTOR_LIFE;
        collector.health = COLLECTOR_LIFE;
        Object.defineProperty(collector, 'speed', {get: function() {
            return this.maxSpeed;
        }});
        collector.keepTrackedProperty('health');
        collector.keepTrackedProperty('maxHealth');
        collector.type = "collector"
        collector.findItems = this.findItems_.bind(this);
        collector.bring = this.collectorDrop_.bind(this, collector);
        collector.pick = this.collectorPick_.bind(this, collector);
        h.collectors_.push(collector);
        // collector.id = `collector-${collectorCount}`;
        collector.alpha = 1
        collector.keepTrackedProperty('alpha');
        collector.actionsShouldBlock = true;
        collector.appendMethod('die', () => {
            if (collector.containerStack) {
                collector.containerStack.forEach(f => f.setExists(false));
            }
        });
        Object.defineProperty(collector, 'item', {
            get: function() {
                return this.peekItem();
            }
        });
        collector._doDropItem = collector.doDropItem;
        collector.findNearestItem = this.findNearestItem_.bind(this, collector);
        collector.moveTowards = function(x, y) {
            if (this.color == 'blue') {
                x = MAX_X - x;
                y = MAX_Y - y;
            }
            return this.move(new Vector(x, y));
        };
        collector.hookOnDoPickUp = (item) => {
            this.addToRegrow(item);
        };
        collector._takeDamage = collector.takeDamage;
        // const rangedAttackRatio = params.rangedAttackRatio || 1;
        collector.takeDamage = (damage, attacker, momentum=null) => {
            collector._takeDamage(COLLECTOR_TAKE_DAMAGE, attacker, momentum);
        };
        collector.doDropItem = () => {
            let spos = SPAWN_POINTS[collector.color_];
            const item = collector.peekItem();
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
            return collector._doDropItem();
        }
        if(h.eventHandlers['spawn-collector'] && h.eventHandlers['spawn-collector'][0])
        {
            collector.on('spawn', h.eventHandlers['spawn-collector'][0]);
            collector.trigger('spawn', {collector, id: collector.id});
        }
        console.log(collector.alpha)
        this.heroToIdle(h);
    },
    collectorPick_ (un, item) {
        if (un.type !== 'collector') {
            return false;
        }
        if (!item || !item.isCarryable) {
            throw new ArgumentError(`Your collector cannot take `, item)
        }
        return un.pickUpItem(item);
    },
    collectorDrop_(un) {
        spos = SPAWN_POINTS[un.color_];
        return un.dropItem(spos);
    },
    defaultAct_collector(h, un) {
        if (un.item && un.intent != 'dropItem') {
            un.bring();
        }
        if (!un.item) {
            const fruit = un.findNearestItem();
            if (fruit) {
                un.pick(fruit);
            }
        }
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
        Object.defineProperty(unit, 'speed', {get: () => unit.maxSpeed});
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
        unit.canTargetCollectors = unitData.canTargetCollectors
        if (h.summoningPath)
        {
            unit.controlPath = h.summoningPath
        }else{
            unit.controlPath = "ACEFG"
        }
        unit.findsPaths = false;
        if(unit.type == ROBOBOMB){
            unit.performAttack = (target) => {
                
                let oppEnemies = unit.findEnemies();
                for (const enemy of oppEnemies) {
                    if (enemy.type == "collector" || enemy.type == "heroTurret")
                    {
                        continue;
                    }
                    if(enemy.distance(unit) <=  unitData.blastRadius){
                        enemy.takeDamage(unit.attackDamage);
                    }
                }
                const X = parseFloat(unit.pos.x.toFixed(2));
                const Y = parseFloat(unit.pos.y.toFixed(2));
                const radius = parseFloat((unitData.blastRadius-.5).toFixed(2));
                const color = '#FF0000';
                const args = [X, Y, radius, color, 0, 0];
                h.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
                unit.health -= 9999
            };
        }
        h.units_.push(unit);
        this.heroToIdle(h);
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
    addToRegrow(tChip) {
        this.chipsToRegrow.push({pos: tChip.pos.copy(), mana: tChip.manaType_, remainedTime: REGROW_TIME});
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

    summonUnit_(h, unitType, unitPath) {
        if (h.isBusy_) {
            return;
        }
        if (unitPath){
            if (unitPath.length > MAX_PATH_LENGTH)
            {
                throw new Error(`The path should not be longer than ${MAX_PATH_LENGTH} characters`);
            }
            if (!unitPath.match(/^[A-H]+$/))
            {
                throw new Error(`The path should only contain characters from A to H`);
            }
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
        if (h.units_.length >= MAX_UNITS) {
            return;
        }
        h.mana_[ENERGY] -= unitData.cost;
        h.actions.summoning.cooldown = unitData.spawnTime;
        h.isSummoning_ = unitType;
        if (unitPath) {
            h.summoningPath = unitPath;
        }else{
            h.summoningPath = null;
        }
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

    printUnitStats()
    {
        totalSt = ""
        for(let unit of Object.keys(UNITS))
        {
            totalSt+=`\`${unit}\`\n------------\n`
            for (let key in UNITS[unit]) {
                if(key == "scale")
                {
                    continue;
                }
                let displayKey = key
                if (displayKey == "maxSpeed"){
                    displayKey = "speed"
                }
                totalSt+= `    ${displayKey}: ${UNITS[unit][key]}\n`;
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