const Vector = require('lib/world/vector');

const RED = "red";
const BLUE = "blue";
const COLORS = [RED, BLUE];


const COLOR_PAIRS = {
    [RED]: BLUE,
    [BLUE]: RED
};

const LANE_Y = {
    [RED]: 17.75,
    [BLUE]: 65.75
};
const MONSTER_SPAWN_X = 130;

const MONSTER_ATTACK_COOLDOWN = 1;
const MONSTER_ATTACK_RANGE = 5;
const MONSTER_MASS = 50;

const BARRACKS = 'barracks';

const NEUTRAL_TEAM = 'neutral';

const TOWER_LELEL_OFFSET = new Vector(3.5, -3.5);
const SPAWN_MONSTER_OFFSET_RANGE = 10;
({
    setUpLevel() {
        this.heroes = {
            [RED]: this.heroRed,
            [BLUE]: this.heroBlue
        };
        this.monsters = {
            [RED]: [],
            [BLUE]: []
        };
        this.hero2 = this.heroes[BLUE];
        for (let h of Object.values(this.heroes)) {
            this.setupHero(h);
        }
        this.monsterParameters = this.parameters.monsters;
        this.valueToMonster = [];
        for (let [key, params] of Object.entries(this.monsterParameters)) {
            this.valueToMonster.push([params.value, key]);
        }
        this.valueToMonster.sort((a, b) => b[0] - a[0]);

    },

    setupHero(hero) {
        hero._ref = this;
        hero.health = this.parameters.hero.maxHealth;
        hero.maxHealth = this.parameters.hero.maxHealth;
        hero._mana = this.parameters.hero.initMana;
        hero._manaIncome = this.parameters.hero.manaIncome;
        hero.keepTrackedProperty('health');
        hero.keepTrackedProperty('maxHealth');
        hero.enemyColor = COLOR_PAIRS[hero.color];
    },

    onFirstFrame() {
        this.spawnWaves();
        this.setInterval(this.spawnWaves.bind(this), 1);
        // clear out the bottom of the map
        this.world.thangs.filter(t => t.team && t.pos.y < 0).forEach(t => t.setExists(false));
    },

    clearMonsters() {
        for (let thang of this.world.getSystem("Combat").corpses) {
            if (thang.team !== 'neutral' || !thang.enemyTeam) continue;
            if (!thang.exists) continue;

            if (thang.scaleFactor <= 0) {
                thang.setExists(false);
                continue;
            }
            thang.scaleFactor -= 0.1;
            thang.keepTrackedProperty('scaleFactor');
        }
        for (let color of COLORS) {
            this.monsters[color] = this.monsters[color].filter(m => m.exists && m.health > 0);
            if (this.gameEnd) {
                this.monsters[color].forEach(m => {
                    // m.setExists(false);
                    m.setTarget(null);
                    m.setAction('idle');
                    m.brake();
                    m.chooseAction = () => { };
                });
            }
        }
    },

    keepHeroAlive(hero) {
        hero.health = Math.max(1, hero.health);
        hero.keepTrackedProperty('health');
        // this.hero2.setAction('idle');
    },

    winGame(hero) {
        this.world.setGoalState(`${hero.color}-win`, 'success');
        this.world.setGoalState(`${hero.enemyColor}-win`, 'failure');
        this.gameEnd = true;
        if (hero.color === 'blue') {
            this.blueWin = true;
        }
        if (hero.color === 'red') {
            this.redWin = true;
        }
        this.keepHeroAlive(hero);
        for (let h of Object.values(this.heroes)) {
            h.takeDamage = () => { };
        }
    },

    resolveTie() {
        if (this.heroRed.health > this.heroBlue.health) {
            this.winGame(this.heroRed);
        }
        else if (this.heroRed.health < this.heroBlue.health) {
            this.winGame(this.heroBlue);
        }
        else if (this.heroRed.teamPower < this.heroBlue.teamPower) {
            this.winGame(this.heroBlue);
        }
        else if (this.heroRed.teamPower > this.heroBlue.teamPower) {
            this.winGame(this.heroRed);
        }
        else if (this.world.rand.randf() < 0.5) {
            this.winGame(this.heroRed);
        }
        else {
            this.winGame(this.heroBlue);
        }
    },

    update() {
        // print(this.world.age, this.heroRed.health, this.heroBlue.health, this.gameEnd);
        this.clearMonsters();
        if (this.gameEnd) return;
        for (let hero of Object.values(this.heroes)) {
            hero.teamPower = hero.score;
            hero.keepTrackedProperty('teamPower');
        }
    },

    chooseAction() {

        if (this.gameEnd) {
            if (this.blueWin) {
                this.keepHeroAlive(this.heroBlue);
            }
            if (this.redWin) {
                this.keepHeroAlive(this.heroRed);
            }
            return;
        }
        if (this.heroBlue.health <= 0 && this.heroRed.health <= 0) {
            return this.resolveTie();
        }
        else if (this.heroRed.health <= 0) {
            return this.winGame(this.heroBlue);
        }
        else if (this.heroBlue.health <= 0) {
            return this.winGame(this.heroRed);
        }
        if ((this.world.age >= this.parameters.game.maxTime)) {
            this.resolveTie();
        }
    },
    getTile(x, y, who) {
    },

    spawnMonster(color, name, params, behavior, offset, team = NEUTRAL_TEAM) {
        if (this.gameEnd) return;
        let x = MONSTER_SPAWN_X;
        let y = LANE_Y[color];
        const monster = this.instabuild(name, x, y + offset, null, null, team);
        monster.team = NEUTRAL_TEAM;
        monster.superteam = NEUTRAL_TEAM;
        monster.commander = this;
        monster.startsPeaceful = true;
        monster.health = monster.maxHealth = params.health;
        monster.keepTrackedProperty('health');
        monster.keepTrackedProperty('maxHealth');
        monster.chooseAction = behavior.bind(monster);
        monster.actions['attack'].cooldown = MONSTER_ATTACK_COOLDOWN;
        monster.attackDamage = params.damage;
        monster.maxSpeed = params.speed || 15;
        Object.defineProperty(monster, 'speed', {
            get: function () { return monster.maxSpeed }
        });
        monster.attackRange = params.attackRange || MONSTER_ATTACK_RANGE;
        monster.mass = MONSTER_MASS;
        monster.enemyTeam = COLOR_PAIRS[color]
        monster.enemy = this.heroes[color];
        monster.disabledSuicide = true;
        this.monsters[color].push(monster);
        return monster;
    },

    getBudgetedMonster(budget) {
        for (let [value, monster] of this.valueToMonster) {
            if (value <= budget) return [value, monster];
            // if (MONSTER_VALUES[i][1] <= budget) return MONSTER_VALUES[i];
        }
        return [0, null];
    },

    spawnLaneWave(side, budget, fromTeam) {
        let monsterArray = [];
        while (budget >= 10) {
            const [value, monsterType] = this.getBudgetedMonster(budget);
            if (!monsterType) break;
            budget -= value;
            monsterArray.push(monsterType);
        }
        for (let monsterType of monsterArray) {
            // const monsterKey = monsterArray[i];
            const monsterTemplate = this.parameters.monsters[monsterType];
            let offset = SPAWN_MONSTER_OFFSET_RANGE * this.world.rand.randf() - SPAWN_MONSTER_OFFSET_RANGE / 2;
            this.spawnMonster(side, monsterType, monsterTemplate, this.monster_chooseAction, offset, fromTeam);
        }
    },
    spawnWaves() {
        // 130, 17.75
        // 130, 65.75

        // Power scales by 10hp per second (then scales exponentially after 30 seconds)
        // +10 hp per barracks x barracks level
        let wavePower = this.world.age * 10;
        if (this.world.age >= 30) {
            wavePower += ((this.world.age - 30) * (this.world.age - 30)) * 6;
        }

        for (let h of Object.values(this.heroes)) {
            let laneWavePower = wavePower;
            const barracks = Object.values(h.towers).filter(e => e && e.type == BARRACKS);
            for (let barrack of barracks) {
                laneWavePower += barrack.level * 10;
            }
            h.score += laneWavePower;
            this.spawnLaneWave(COLOR_PAIRS[h.color], laneWavePower);
        }
    },

    createLevelLabel(tower) {
        if (!tower) return;
        let pos = tower.pos.copy().add(TOWER_LELEL_OFFSET);
        return this.instabuild('label', pos.x, pos.y);
    },

    monster_chooseAction() {
        if (this.commander.gameEnd || this.markedDead || (this.stunTime && this.stunTime >= this.world.age)) {
            this.setTarget(null);
            this.setTargetPos(null);
            this.setAction('idle');
            this.brake();
            return;
        }
        if (this.target != this.enemy || this.action == "idle") {
            this.attack(this.enemy);
        }
    },
});