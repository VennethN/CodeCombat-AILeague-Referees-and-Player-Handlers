const { ArgumentError } = require('lib/world/errors');

const FARM = 'farm';
const BARRACKS = 'barracks';
const SUMMON = 'summon';
const HASTE = 'haste';
const RAGE = 'rage';
const SHOCKWAVE = 'shockwave';
const FREEZE = 'freeze';

const RED = "red";
const BLUE = "blue";
const COLORS_PAIRS = {
    [RED]: BLUE,
    [BLUE]: RED
};
const INITIAL_TARGETING = 'close';
const LIGHTNING_BOLT = 'lbolt';
const ICE_LOCK = 'icelock';
const ICE_LOCK_OFFSET_Y = -5;

const SPAWN = 'spawn';
const RANGER = 'ranger';
const MAGE = 'mage';
// dictionary of spawn event name to the champoin type
const SPAWN_EVENT_TO_CHAMPION = {
    [`${SPAWN}-${RANGER}`]: RANGER,
    [`${SPAWN}-${MAGE}`]: MAGE
};


(class FrozenFortressPlayer extends Component {
    attach(thang) {
        super.attach(thang);
        thang.towers = {};
        thang.addTrackedProperties(['score', 'number'], ['teamPower', 'number']);
        thang.keepTrackedProperty('score');
        thang.keepTrackedProperty('teamPower');
        thang.score = 0;
        if (thang.id == 'Hero Placeholder') {
            thang.color = RED;
        } else {
            thang.color = BLUE;
        }


        Object.defineProperty(thang, 'mana', {
            get: function () {
                return this._mana;
            },
        });
        thang._mana = thang._mana || 0;
        thang._manaIncome = thang._manaIncome || 1;

        thang.getEnemyHero = this._getEnemyHero.bind(thang);
        thang._getEnemyHero = this._getEnemyHero.bind(thang);
        thang._ref = this.world.getThangByID("Referee");
        thang._unblock = thang.unblock;
        thang.unblock = null;
        thang._block = thang.block;
        thang.block = null;
        thang.addActions({ name: 'casting', cooldown: 999 }, { name: 'summoning', cooldown: 999 }, { name: 'waiting', cooldown: 900 });
        thang.movementSystem = this.world.getSystem('Movement');
        thang.specialReadyTimes = {};
        Object.defineProperty(thang, "availableTowerTypes", {
            get: function () {
                return Object.keys(this._ref.parameters.towers);
            }
        });

        Object.defineProperty(thang, "monsterTypes", {
            get: function () {
                return Object.keys(this._ref.monsterParameters);
            }
        });

        thang.findEnemies = this._findEnemies.bind(thang);
        thang.findNearestEnemy = this._findNearestEnemy.bind(thang);
        thang.origOn = thang.on;
        thang.on = this._on.bind(thang);


        thang.sell = this._sell.bind(thang);
        thang.getTowerAt = this._getTowerAt.bind(thang);
        thang.ability = this._ability.bind(thang);
        thang.findOpponentEnemies = this._findOpponentEnemies.bind(thang);
        thang.findNearestOpponentEnemy = this._findNearestOpponentEnemy.bind(thang)
        thang._summon = this._summon.bind(thang);
        thang._freeze = this._freeze.bind(thang);
        thang._shockwave = this._shockwave.bind(thang);
        thang._haste = this._haste.bind(thang);
        thang._rage = this._rage.bind(thang);
        thang.setTargeting = this._setTargeting.bind(thang);
        thang.build = this._build.bind(thang);
        thang.wait = this._wait.bind(thang);
        thang.waitUntil = this._waitUntil.bind(thang);
        thang.towerCounter = 1;
        thang.usedChampionSpots = {}
        thang.futureChampionSpots = {}
    }



    _getEnemyHero() {
        if (this.color == "red") {
            return this.world.getThangByID("Hero Placeholder 1");
        } else {
            return this.world.getThangByID("Hero Placeholder");
        }
    }
    _ability(abilityName, args) {
        const params = this._ref.parameters.abilities[abilityName];
        if (!params) {
            throw new ArgumentError('Unknown ability, please use "summon", "freeze", "rage", "haste", or "shockwave"');
        }
        abilityName = abilityName.toLowerCase()
        if (abilityName === SUMMON) {
            return this._summon(args, params);
        }
        if (abilityName == FREEZE) {
            return this._freeze(args, params);
        }
        if (abilityName == SHOCKWAVE) {
            return this._shockwave(params);
        }
        if (abilityName == HASTE) {
            return this._haste(args, params);
        }
        if (abilityName == RAGE) {
            return this._rage(args, params);
        }
        throw new ArgumentError('Unknown ability, please use "summon", "freeze","haste", or "shockwave"');
    }
    _summon(power, params) {
        if (this.isBusy) return false;
        if (!Number.isInteger(power)) {
            power = 10;
        }
        if (power < 10 || this._mana < power) {
            return;
        }

        this._mana -= power;
        this.score += power;
        this._ref.spawnLaneWave(COLORS_PAIRS[this.color], power, this.team);
        return this.wait(this.world.dt);
    }
    _haste(target, params) {
        if (this.isBusy) return false;
        if (!target || !target.hasEffects) throw new ArgumentError('Cannot apply haste to provided target!');
        let powerRequired = Math.round(target.health / params.hpPerMana);
        if(typeof target.isBoss !== "undefined" && target.isBoss){
            powerRequired *= this._ref.parameters.game["bossAbilityManaCoef"];
        }
        if (this._mana < powerRequired) {
            return;
        }
        else {
            this._mana -= powerRequired;
            let relevantEffects = target.effects.filter(e => e.name == 'haste');
            if (relevantEffects && relevantEffects.length) {
                relevantEffects.forEach(e => e.timeSinceStart = 0);
            }
            else {
                target.addEffect({ name: 'haste', duration: params.duration, revertsProportionally: true, setTo: true, targetProperty: 'isHaste' });
                target.addEffect({ name: 'haste', duration: params.duration, revertsProportionally: true, factor: params.speedMult, targetProperty: 'maxSpeed' });
            }
        }
        return this.wait(this.world.dt);
    }

    _rage(target, params) {
        if (this.isBusy) return false;
        if (!target || !target.hasEffects) throw new ArgumentError('Cannot apply rage to provided target!');
        let powerRequired = Math.round(target.health / params.hpPerMana);
        if(typeof target.isBoss !== "undefined" && target.isBoss){
            powerRequired *= this._ref.parameters.game["bossAbilityManaCoef"];
        }
        if (this._mana < powerRequired) {
            return;
        } else {
            this._mana -= powerRequired;
            let relevantEffects = target.effects.filter(e => e.name == 'fire');
            if (relevantEffects && relevantEffects.length) {
                relevantEffects.forEach(e => e.timeSinceStart = 0);
            } else {
                target.addEffect({ name: 'fire', duration: params.duration, revertsProportionally: true, setTo: true, targetProperty: 'isRage' });
                target.addEffect({ name: 'fire', duration: params.duration, revertsProportionally: true, factor: params.attackMult, targetProperty: 'attackDamage' });
            }
        }
        return this.wait(this.world.dt);

    }

    _freeze(target, params) {
        if (this.isBusy) return false;
        if (!target || !target.hasEffects) throw new ArgumentError('Cannot apply freeze to provided target!');
        let powerRequired = Math.round(target.health / params.hpPerMana);
        if(typeof target.isBoss !== "undefined" && target.isBoss){
            powerRequired *= this._ref.parameters.game["bossAbilityManaCoef"];
        }
        if (this._mana < powerRequired) {
            return;
        } else {
            this._mana -= powerRequired;
            let relevantEffects = target.effects.filter(e => e.name == 'freeze');
            if (relevantEffects && relevantEffects.length) {
                relevantEffects.forEach(e => e.timeSinceStart = 0);
            }
            else {
                let finalSlowMult = typeof target.slowEffectMult == "undefined" ?  params.slowMult : 1 - (1-params.slowMult) *target.slowEffectMult;
                target.addEffect({ name: 'freeze', duration: params.duration, revertsProportionally: true, setTo: true, targetProperty: 'isSlowed' });
                target.addEffect({ name: 'freeze', duration: params.duration, revertsProportionally: true, factor: finalSlowMult, targetProperty: 'maxSpeed' });
            }
        }
        return this.wait(this.world.dt);
    }
    _shockwave(params) {
        if (this.isBusy) return false;
        const attackRangeSquared = 50 * 50;
        
        let thangs = [];
        for (let thang of this._ref.monsters[this.color]) {
            if (!thang.exists || thang.dead || thang.team == this.team) continue;
            if (this.color == RED ? thang.pos.y > 50 : thang.pos.y < 50) continue;
            if (this.distanceSquared(thang) > attackRangeSquared) continue;
            thangs.push(thang);
        }
        thangs.sort((thang1, thang2) => this.distanceSquared(thang1) - this.distanceSquared(thang2));
        let totalManaUsed = 0;
        for (const thang of thangs) {
            if(typeof thang.isBoss !== "undefined" && thang.isBoss){continue;}
            const powerRequired = Math.round(thang.health / params.hpPerMana);
            if (this._mana < powerRequired) {
                break;
            }
            this._mana -= powerRequired;
            totalManaUsed += powerRequired;
            const dir = thang.pos.copy().subtract(this.pos).normalize();
            dir.z = params.zForceConstant;
            dir.y *= params.yForceCoef;
            dir.x *= params.xForceCoef;
            thang.velocity = Vector(0, 0, 0);
            thang.velocity.add(dir, true);
        }
        if(totalManaUsed == 0){return this.wait(this.world.dt)}
        const ring = this._ref.instabuild("ice-ring", this.pos.x, this.pos.y, `ice-ring`);
        ring.setScale(50 / 5);
        ring.lifespan = 0.5;

        return this.wait(this.world.dt);
    }

    _getTowerAt(place) {
        if (_.isString(place)) {
            place = place.toLowerCase();
        }
        if (!place || !this.towerSpots[place]) {
            throw new ArgumentError('Place should be a letter from "A" to "H"');
        }
        const tower = this.towers[place];
        return tower;
    }

    _findEnemies() {
        return this._ref.monsters[this.color].filter(m => m.exists && m.health > 0);
    }

    _findNearestEnemy() {
        return this.findNearest(this.findEnemies());
    }

    _findOpponentEnemies() {
        return this.getEnemyHero().findEnemies();
    }
    _findNearestOpponentEnemy() {
        return this.getEnemyHero().findNearestEnemy();
    }

    _sell(place) {
        if (this.isBusy) return;
        if (_.isString(place)) {
            place = place.toLowerCase();
        }
        if (!place || !this.towerSpots[place]) {
            throw new ArgumentError('Place should be a letter from "A" to "H"');
        }
        const location = this.towerSpots[place];
        const tower = this.towers[place];
        if (!tower) {
            throw new ArgumentError(`No tower at the place ${place} to sell.`);
        }
        if (tower.isFrozen) {
            this.unblockTime = this.world.age + this.world.dt;
            return this._block();
        }
        const params = this._ref.parameters.towers[tower.type];

        let manaValue = params.cost * tower.level * (1 + tower.level) / 2;
        if (tower.type !== FARM && tower.type !== BARRACKS) {
            manaValue /= 2;
        }

        const peasant = this.world.getThangByID(`${this.color}-peasant`);
        peasant.setPosition({
            x: location.x - 5,
            y: location.y - 5,
        });
        peasant.setAction('build');

        this._mana += manaValue;
        tower.levelLabel.clearSpeech();
        tower.setExists(false);
        if (tower.levelLabel) {
            tower.levelLabel.setExists(false);
        }
        this.towers[place] = null;
        this.unblockTime = this.world.age + this.world.dt;
        return this._block();
    }

    _wait(duration, nextMethod) {
        this.isBusy = true;
        this.intention = 'waiting';
        this.unblockTime = this.world.age + duration;
        this.nextMethod = nextMethod;
        if (!nextMethod) {
            this.setAction('waiting');
            this.act();
        }
        return this._block();
    }
    _waitUntil(mana, nextMethod) {
        this.isBusy = true;
        this.intention = 'waiting-until';
        this.unblockMana = mana;
        this.unblockTime = 9001;
        this.nextMethod = nextMethod;
        if (!nextMethod) {
            this.setAction('waiting');
            this.act();
        }
        return this._block();
    }
    unblockHero() {
        this.unblockTime = null;
        this.isBusy = null;
        this.intention = null;
        this.setAction('idle');
        this.actionHeats.all = 0;

        const peasant = this.world.getThangByID(`${this.color}-peasant`);
        peasant.setPosition({
            x: this.pos.x,
            y: this.pos.y+12,
        });
        peasant.setAction('idle');

        if (this.lastTower) {
            let tower = this.lastTower;
            this.lastTower = null;
            this.waitingToUnblockReturnValue = tower;
            return this._unblock(tower);
        } else {
            return this._unblock();
        }
    }
    update() {
        let manaIncome = Math.round(this.world.age * this._ref.parameters.game.timeManaCoef)
        const farms = Object.values(this.towers).filter(e => e && e.type == FARM && !e.isParalyzed);
        for (let farm of farms) {
            manaIncome += farm.manaIncome;
        }
        this._mana += manaIncome;
        const manaOrb = this.world.getThangByID(`${this.color}-mana`);
        manaOrb.clearSpeech();
        manaOrb.sayWithDuration(90000, Math.floor(this._mana));

        if (this.intention == 'waiting-until') {
            if (this.mana >= this.unblockMana) {
                if (this.nextMethod) {
                    this[this.nextMethod].bind(this)();
                }
                this.nextMethod = null;
                return this.unblockHero();
            }
            return;
        }
        if (this.isBusy && this.world.age < this.unblockTime) {
            return;
        }
        if (this.intention == 'waiting') {
            if (this.nextMethod) {
                this[this.nextMethod].bind(this)();
            }
            this.nextMethod = null;
            return this.unblockHero();
        }
        this.unblockHero();
    }
    _build(towerType, place) {
        if (this.isBusy) return;
        if (_.isString(place)) {
            place = place.toLowerCase();
        }
        if (!place || !this.towerSpots[place]) {
            throw new ArgumentError('Place should be a letter from "A" to "H"');
        }
        if (_.isString(towerType)) {
            towerType = towerType.toLowerCase();
        }
        if (!towerType || !this._ref.parameters.towers[towerType]) {
            throw new ArgumentError('The wrong tower\'s type for the building. Check docs to find available tower types.');
        }
        const params = this._ref.parameters.towers[towerType];

        const location = this.towerSpots[place];
        const tower = this.towers[place];

        const peasant = this.world.getThangByID(`${this.color}-peasant`);
        peasant.setPosition({
            x: location.x - 5,
            y: location.y - 5,
        });

        this.isBusy = true;
        this.buildingTile = { x: location.x, y: location.y };
        this.buildingType = towerType;
        this.symbol = place;
        this.intention = 'building';
        this.setAction('summoning');
        this.act();

        let expectedCost = params.cost;
        if (tower) {
            expectedCost *= (tower.level + 1);
        }
        if (tower && tower.isFrozen) {
            this.unblockTime = this.world.age + this.world.dt;
            peasant.setAction('idle');
            return this._block();
        }
        peasant.setAction('build');
        if (this.mana < expectedCost) {
            return this.waitUntil(expectedCost, 'performBuildTower');
        }
        
        this.unblockTime = this.world.age + this.world.dt;
        this.performBuildTower();
        return this._block();
    }

    setTowerLevel(tower, level) {
        const params = this._ref.parameters.towers[tower.type];

        if (!tower.levelLabel) {
            tower.levelLabel = this._ref.createLevelLabel(tower);
        }
        tower.levelLabel.clearSpeech();
        tower.levelLabel.sayWithDuration(90000, level);

        tower.level = level;

        tower.upgradeCost = params.cost * (level + 1);
        if (tower.type == FARM) {
            tower.manaIncome = params.manaPerLevel * level;
        }else if(typeof params.championAttackPerLevel !== "undefined"){
            tower.addChampionAttacks = {}
            for(let [key,val] of Object.entries(params.championAttackPerLevel)){
                tower.addChampionAttacks[key] = val * level;
            }
        }
        if (params.scales) {
            // damage => Linear scaling
            // range => range + range * 1-e^(-(0.25)level); asymptotically approaches double range (but the speed of growth slows significantly after ~10 levels)
            tower.attackRange = params.attackRange + params.attackRange * (1 - Math.pow(Math.E, -1 * 0.25 * (level - 1)));
            tower.attackRangeSquared = tower.attackRange * tower.attackRange;
            tower.attackDamage = params.attackDamage * level;
            
            tower.actions['attack'].cooldown = params.attackCooldown;
            if (params.specialFactor) {
                tower.specialFactor = params.specialFactor;
            }
            if (params.specialDuration) {
                tower.specialDuration = params.specialDuration;
            }
        }
    }


    performBuildTower() {
        const params = this._ref.parameters.towers[this.buildingType];
        const place = this.symbol;
        const tower = this.towers[place];
        if (tower) {
            this._mana -= params.cost * (tower.level + 1);
            this.setTowerLevel(tower, tower.level + 1);
            return tower;
        }

        let { x, y } = this.buildingTile;
        this.setTargetPos(new Vector(x, y), 'buildXY');
        this.toBuild = this.buildables[`${this.buildingType}`] || this.buildables[`${this.buildingType}-tower`];

        const newTower = this.performBuild(`${this.color}-${this.buildingType}`);

        newTower.combat = this.world.getSystem("Combat");
        if (_.isFunction(newTower.attack)) {
            newTower.chooseAction = this.towerChooseAction.bind(this, newTower);
        }
        if (this.buildingType == "ice") {
            newTower.performAttack = this.iceTowerPerformAttack.bind(this, newTower);
        }
        newTower.team = this.team;
        newTower.color = this.color;

        newTower.addTrackedProperties(['type', 'string']);
        newTower.keepTrackedProperty('type');

        newTower.type = this.buildingType;
        newTower.targetingType = INITIAL_TARGETING;
        this.performSetTargeting(newTower, INITIAL_TARGETING);
        newTower.place = place;
        newTower.isTower = true;
        newTower.isFrozen = false;
        newTower.isParalyzed =false;

        newTower.isAttackable = false;
        newTower.updateRegistration();

        newTower.addTrackedProperties(['level', 'number']);
        newTower.keepTrackedProperty('level');
        this.setTowerLevel(newTower, 1);

        this._mana -= params.cost;
        this.lastTower = newTower;
        this.towers[place] = newTower;
        return newTower;
    }

    towerChooseAction(tower) {
        if (tower.dead) return;
        if (tower.isParalyzed) return;
        tower.targetAction(tower);
    }

    iceTowerPerformAttack(tower, target) {
        if (tower.dead) return;
        if(tower.isParalyzed){return;}
        if (tower.distanceSquared(target) > tower.attackRangeSquared) {
            tower.specificAttackTarget = null;
            return;
        }
        const ring = this._ref.instabuild("ice-ring", tower.pos.x, tower.pos.y, `ice-ring`);

        ring.setScale(tower.attackRange / 5);
        ring.lifespan = 0.5;

        for (let thang of this._ref.monsters[tower.color]) {
            if (!thang.exists || thang.dead || thang.team == tower.team) continue;
            if (tower.distanceSquared(thang) > tower.attackRangeSquared) continue;
            thang.takeDamage(tower.attackDamage, tower);
            if (!thang.hasEffects) continue;
            // remove all slow effects
            thang.effects.filter(e => e.name == 'slow').forEach(e => e.timeSinceStart = 9001);
            thang.updateEffects();
            // thang.addEffect({name: 'slow', duration: tower.specialDuration, reverts: true, setTo: true, targetProperty: 'isSlowed'});
            let finalSlowMult = typeof thang.slowEffectMult == "undefined" ?  tower.specialFactor : 1 - (1-tower.specialFactor) *thang.slowEffectMult;
            thang.addEffect({ name: 'slow', duration: tower.specialDuration, revertsProportionally: true, factor:  finalSlowMult, targetProperty: 'maxSpeed' });
        }
    }

    _on(eventName, callback) {
        if (!this.validEventTypes.includes(eventName)) {
            throw new ArgumentError(`Invalid event type: ${eventName}. Should be one of ${this.validEventTypes.join(', ')}`);
        }
        if (!_.isFunction(callback)) {
            throw new ArgumentError(`Invalid callback: ${callback}. Should be a function`);
        }
        let champion = this.champions[SPAWN_EVENT_TO_CHAMPION[eventName]];
        champion.on(SPAWN, callback);
        champion.trigger(SPAWN, { champion });
        champion.spawnTriggered = true;
    }


    setupChampionAPI(champion, place) {
        champion.place = place;
        champion.color = this.color;
        champion.team = this.team;
        champion.moveTo = this.championMoveTo.bind(this, champion);
        champion.appendMethod('update', this.championUpdate.bind(this, champion));
        champion._block = champion.block;
        champion._unblock = champion.unblock;
        champion.say = () => {};
        champion.sayWithDuration = () => {};
        champion.sayWithouthBlocking = () => {};
        // Hacks with blocking system as no time to do it properly
        // Combat system messes with blocking system, so we need to override it
        champion.block = () => {};
        champion.unblock = () => {};
        champion.realBlock = (duration) => {
            champion.blockedTime = this.world.age + (duration || this.world.dt);
            // console.log('unblock', champion, ' at ', this.world.age, " for ", duration || this.world.dt, " seconds");
            champion.isBusy = true;
            return champion._block();
        };
        champion.realUnblock = () => {
            // console.log('unblock', champion, ' at ', this.world.age);
            champion.isBusy = false;
            champion.target = null;
            champion.actionHeats.all = 0;
            return champion._unblock();
        };
        champion._attack = champion.attack;
        champion.attack = (target) => {
            if (champion.isBusy) {
                return;
            }
            if (!target || target.dead || !target.pos || !target.exists || champion.distanceSquared(target) > champion.attackRangeSquared) {
                return champion.realBlock();
            }
            champion._attack(target);
            return champion.realBlock(champion.actions.attack.cooldown);
        };
        champion.isReady = () => {
            return champion.specialCooldownTimer !== null && champion.specialCooldownTimer <= this.world.age
        }
        champion.findEnemies = () => {
            return this.findEnemies().filter(e => champion.distanceSquared(e) <= champion.attackRangeSquared);
        };
        champion.findNearestEnemy = () => {
            const enemies = champion.findEnemies();
            return champion.findNearest(enemies);
        };
        champion.specialCooldownTimer = 0;
        champion.special = this.championSpecial.bind(this, champion);
        champion._hero.usedChampionSpots[champion.type] = place;
    }


    championUpdate(champion) {
        if (champion.blockedTime && champion.blockedTime <= this.world.age) {
            champion.blockedTime = null;
            if (champion.futurePos) {
                champion.pos.x = champion.futurePos.x;
                champion.pos.y = champion.futurePos.y;
                champion.futurePos = null;
                champion.place = champion.futurePlace;
                champion._hero.usedChampionSpots[champion.type] = champion.futurePlace;
                champion._hero.futureChampionSpots[champion.type] = null;
                champion.futurePlace = null;
                champion.keepTrackedProperty('pos');
            }
            if (champion.intentionFunction) {
                champion.intentionFunction();
                champion.intentionFunction = null;
            }
            return champion.realUnblock();
        }
    }

    championMoveTo(champion, place) {
        if (champion.isBusy) {
            return;
        }
        if (_.isString(place)) {
            place = place.toLowerCase();
        }
        if (!place || !this.towerSpots[place]) {
            throw new ArgumentError('Place should be a letter from "A" to "H"');
        }
        if(Object.values(champion._hero.usedChampionSpots).includes(place) || Object.values(champion._hero.futureChampionSpots).includes(place)){
            return;
        }
        const location = this.towerSpots[place];
        const CHAMPION_X_OFFSET = 8;
        champion.futurePos = new Vector(location.x + CHAMPION_X_OFFSET, location.y);
        champion.futurePlace = place;
        champion._hero.futureChampionSpots[champion.type] = champion.futurePlace;
        return champion.realBlock(champion.moveToCooldown);
    }

    championSpecial(champion) {
        // const sParams = guard.specialParams;
        if (champion.specialCooldownTimer && champion.specialCooldownTimer > this.world.age) {
            return champion.realBlock();
        }
        champion.specialCooldownTimer = this.world.age + champion.specialSpecificCooldown;
        champion.intentionFunction = this[`championSpecial_${champion.specialName}`].bind(this, champion);
        return champion.realBlock(champion.specialCooldown);
    }

    addFreezeEffect(champion,tower) {
        tower.effects.filter(e => e.name == 'freeze').forEach(e => e.timeSinceStart = 9001);
        tower.updateEffects();
        tower.addEffect({ name: 'freeze', duration: champion.specialDuration, reverts: true, setTo: true, targetProperty: 'isFrozen' });
        tower.addEffect({ name: 'freeze', duration: champion.specialDuration, revertsProportionally: true, factor: champion.specialFactor || 0, targetProperty: 'attackDamage' });
        tower.addEffect({ name: 'freeze', duration: champion.specialDuration, revertsProportionally: true, factor: champion.specialFactor || 0, targetProperty: 'manaIncome' });
    }
    addParalyzeEffect(champion,tower){
        tower.effects.filter(e => e.name == 'paralyze').forEach(e => e.timeSinceStart = 9001);
        tower.updateEffects();
        tower.addEffect({ name: 'paralyze', duration: champion.specialDuration, reverts: true, setTo: true, targetProperty: 'isParalyzed' });
        tower.addEffect({ name: 'paralyze', duration: champion.specialDuration, revertsProportionally: true, factor: 0, targetProperty: 'manaIncome' });
    }

    championSpecial_shot(champion) {
        const targetPlace = champion.place;
        const targetPos = this._getEnemyHero().towerSpots[targetPlace];
        const targetTower = this._getEnemyHero().towers[targetPlace];
        this._ref.instabuild(LIGHTNING_BOLT, targetPos.x, targetPos.y);
        
        if (!targetTower) {
            return;
        }
        //targetTower.effects.filter(e => e.name == 'paralyze').forEach(e => e.timeSinceStart = 9001);
        //targetTower.updateEffects();
        //targetTower.addEffect({ name: 'paralyze', duration: champion.specialDuration, reverts: true, setTo: true, targetProperty: 'isParalyzed' });
        //this.addFreezeEffect(targetTower);
        this.addParalyzeEffect(champion,targetTower);
        this.addFreezeEffect(champion,targetTower);
        
        
        let lock = this._ref.instabuild(ICE_LOCK, targetTower.pos.x, targetTower.pos.y + ICE_LOCK_OFFSET_Y);
        lock.lifespan = champion.specialDuration;
    }

    championSpecial_snow(champion) {
        const targetPlace = champion.place;
        champion.specialRangeSquared = champion.specialRange * champion.specialRange;
        const targetPos = this._getEnemyHero().towerSpots[targetPlace];
        for (let tower of Object.values(this._getEnemyHero().towers)) {
            if(!tower){continue;}
            if (tower.distanceSquared(targetPos) <= champion.specialRangeSquared) {
                //this.addFreezeEffect(tower);
                this.addFreezeEffect(champion,tower);
                let lock = this._ref.instabuild(ICE_LOCK, tower.pos.x, tower.pos.y + ICE_LOCK_OFFSET_Y);
                lock.lifespan = champion.specialDuration;
            }
        }
    }
    
    _setTargeting(tower, targetType) {
        if (!tower.isTower) {
            throw new ArgumentError('The `tower` argument should be an actual tower.');
        }
        if (tower.color != this.color) {
            throw new ArgumentError('You can set targeting for your towers only.');
        }
        if (!['left', 'right', 'close', 'weak', 'strong', 'fast'].includes(targetType)) {
            throw new ArgumentError("The targetting type should be one of: 'left', 'right', 'close', 'weak', 'strong', 'fast'.");
        }
        this.performSetTargeting(tower, targetType);
    }
    
    performSetTargeting(tower, targetType) {
        if(!tower.attack){return;}
        if (targetType == 'close') {
            tower.targetAction = this.tower_attackNearest.bind(this, tower);
        }
        else if (targetType == 'left'){
            tower.targetAction = this.tower_attackLeft.bind(this, tower);
        }
        else if (targetType == 'right'){
            tower.targetAction = this.tower_attackRight.bind(this, tower);
        }
        else if (targetType == 'weak') {
            tower.targetAction = this.tower_attackWeak.bind(this, tower);
        }
        else if (targetType == 'strong') {
            tower.targetAction = this.tower_attackStrong.bind(this, tower);
        }
        else if (targetType == 'fast') {
            tower.targetAction = this.tower_attackFast.bind(this,tower);
        }
        tower.targetingType = targetType;
    }
    
    tower_attackNearest(tower) {
        if(tower.isParalyzed){return false;}
        let closest = null;
        let mind = Infinity;
        let d = 0;
        for (let m of this._ref.monsters[this.color]) {
            d = tower.distanceSquared( m);
            if (d <= tower.attackRangeSquared && d < mind) {
                closest = m;
                mind = d;
            }
        }
        return closest && tower.attack(closest);
    }
    
    tower_attackLeft(tower) {
        if(tower.isParalyzed){return false;}
        let leftest = null;
        let minX = Infinity;
        let d = 0;
        for (let m of this._ref.monsters[this.color]) {
            d = tower.distanceSquared(m);
            if (d > tower.attackRangeSquared) continue;
            if (m.pos.x > minX) continue;
            if (m.pos.x == minX && d > m.lastD) continue;
            minX = m.pos.x;
            leftest = m;
            m.lasdD = d;
        }
        return leftest && tower.attack(leftest);
    }
    
    tower_attackRight(tower) {
        if(tower.isParalyzed){return false;}
        let rightest = null;
        let maxX = -Infinity;
        let d = 0;
        for (let m of this._ref.monsters[this.color]) {
            d = tower.distanceSquared(m);
            if (d > tower.attackRangeSquared) continue;
            if (m.pos.x < maxX) continue;
            if (m.pos.x == maxX && d > m.lastD) continue;
            maxX = m.pos.x;
            rightest = m;
            m.lasdD = d;
        }
        return rightest && tower.attack(rightest);
    }
    
    tower_attackWeak(tower) {
        if(tower.isParalyzed){return false;}
        let weakest = null;
        let minH = Infinity;
        let d = 0;
        for (let m of this._ref.monsters[this.color]) {
            d = tower.distanceSquared( m);
            if (d > tower.attackRangeSquared) continue;
            if (m.health > minH) continue;
            if (m.health == minH && d > m.lastD) continue;
            minH = m.health;
            weakest = m;
            m.lasdD = d;
        }
        return weakest && tower.attack(weakest);
    }
    
    tower_attackStrong(tower) {
        if(tower.isParalyzed){return false;}
        let strongest = null;
        let maxH = -Infinity;
        let d = 0;
        for (let m of this._ref.monsters[this.color]) {
            d = tower.distanceSquared(m);
            if (d > tower.attackRangeSquared) continue;
            if (m.health < maxH) continue;
            if (m.health == maxH && d > m.lastD) continue;
            maxH = m.health;
            strongest = m;
            m.lasdD = d;
        }
        return strongest && tower.attack(strongest);
    }
    
    tower_attackFast(tower) {
        if(tower.isParalyzed){return false;}
        let fastest = null;
        let maxS = -Infinity;
        let d = 0;
        for (let m of this._ref.monsters[this.color]) {
            d = tower.distanceSquared(m);
            if (d > tower.attackRangeSquared) continue;
            if (m.maxSpeed < maxS) continue;
            if (m.maxSpeed == maxS && d > m.lastD) continue;
            maxS = m.maxSpeed;
            fastest = m;
            m.lasdD = d;
        }
        return fastest && tower.attack(fastest);
    }

    guardIsReady(guard, name, ...args) {
        const sParams = guard.specialParams[name];
        if (!sParams) {
            return false;
        }
        if (guard.specialCooldowns[name] && guard.specialCooldowns[name] > this.world.age) {
            return false;
        }
        return true;
    }
});

