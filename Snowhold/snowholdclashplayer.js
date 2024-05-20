const {ArgumentError} = require('lib/world/errors');

const MIN_X = 0;
const MAX_X = 100;
const MIN_Y = 0;
const MAX_Y = 80;

(class StormSiegePlayer extends Component {
    // constructor (config) {
    //     super(config);
    // }
    
    attach(thang) {
        super.attach(thang);
        if (thang.id == 'Hero Placeholder') {
            thang.color = 'red';
        }
        else {
            thang.color = 'blue';
        }
        thang.commander = thang;
        thang._unblock = thang.unblock;
        thang.unblock = null;
        thang.validEventTypes = ['spawn-spirit'];
        thang.spiritSpawnPlace = 'A'
        thang.addActions({name: 'casting', cooldown: 9}, {name: 'summoning', cooldown: 9});
    }
    
    summonThang(summonName, xPos, yPos){
        const unitParams = this._ref.parameters.unitParameters[summonName];
        this.buildXY(summonName, xPos, yPos);
        const thang = this.performBuild(`${this.color}-${summonName}`);
        thang.attackDamage = unitParams.attackDamage;
        thang.actions.attack.cooldown = unitParams.attackCooldown;
        thang.attackCooldown = unitParams.attackCooldown;
        thang.attackRange = unitParams.attackRange;
        thang.maxHealth = unitParams.maxHealth;
        thang.health = unitParams.maxHealth;
        thang.maxSpeed = unitParams.maxSpeed;
        thang.keepTrackedProperty('maxSpeed');
        thang.keepTrackedProperty('maxHealth');
        thang.keepTrackedProperty('health');
        thang.keepTrackedProperty('attackDamage');
        thang.keepTrackedProperty('attackRange');
        thang.opponent = this.opponent;
        thang.chooseAction = this.unit_chooseAction.bind(thang);
        thang.visualRange = this._ref.unitVisualRange || 30;
        thang.visualRangeSquared = thang.visualRange * thang.visualRange;
        thang.color = this.color;
        thang.startsPeaceful = true;
        thang.hero1 = this.world.getThangByID('Hero Placeholder');
        thang.hero2 = this.world.getThangByID('Hero Placeholder 1');
        thang.appendMethod('takeDamage', function(damage, attacker) {
            if(attacker.isSpirit){
                this.aggro = attacker;
            }
        });
        Object.defineProperty(thang, 'y', {
                get: function() {
                    return this.pos.y;
                }
            });
        Object.defineProperty(thang, 'x', {
                get: function() {
                    if (this.hero2._aetherAPIOwnMethodsAllowed) {
                        return MAX_X - this.pos.x;
                    }
                    return this.pos.x;
                }
            });
        return thang;
    }
    
    performSummonThang() {
        if (this.dead) {
            return;
        }
        return this.summonThang(this.summoningThang, this.summoningPos.x, this.summoningPos.y)
    }
    
    esper_summon(thangType, xOrSymb, y) {
        let summonable = this._ref.summonableUnits.includes(thangType)
        if (!summonable) {
            throw new ArgumentError('The wrong unit\'s type for the summoning. Check docs to find available unit types.');
        }
        const unitParams = this._ref.parameters.unitParameters[thangType];
        let x = xOrSymb;
        if (y == null) {
            const p = this._ref.getPointCoordinates(xOrSymb, this);
            if (!p) {
                throw new ArgumentError('The unknown point name. Use letter from A to D.');
            }
            x = p.x;
            y = p.y;
        }
        if (this.color == 'blue') {
            x = MAX_X - x;
        }
        if (!this._ref.canSummon(this, x, y)) {
            this.sayWithoutBlocking(`Can\'t summon at {${x}, ${y}}`);
            return;
        }
        this.isBusy = true;
        this.summoningThang = thangType;
        this.summoningPos = {x, y};
        this.intention = 'summon';
        this.setAction('summoning');
        this.act();
        this.unblockTime = this.world.age + unitParams.cost;
        return this.block();
    }
    
    esper_canSummonAt(x, y) {
        if (x == null || y == null || !_.isNumber(x) || !_.isNumber(y)) {
            throw new ArgumentError('X and Y coordinates should be numbers.');
        }
        if (this.color == 'blue') {
            x = MAX_X - x;
        }
        return this._ref.canSummon(this, x, y);
    }
    
    esper_findEnemies() {
        return this.world.thangs.filter(th => th.exists && th.health && th.health > 0 && th.team != this.team && th.x !== undefined && th.pos.x >= MIN_X && th.pos.x <= MAX_X && th.pos.y >= MIN_Y && th.pos.y <= MAX_Y);
    }
    
    esper_findFriends() {
        return this.world.thangs.filter(th => th.exists && th.health && th.health > 0 && th.team == this.team && th != this);
    }
    
    esper_findNearestFriend() {
        return this.findNearest(this.esper_findFriends());
    }
    
    esper_findNearestEnemy() {
        return this.findNearest(this.esper_findEnemies());
    }

    esper_cast(spellName, x, y) {
        const spellParams = this._ref.parameters.spellParameters[spellName];
        if (!spellParams) {
            throw new ArgumentError('The wrong spell\'s name. Check docs to find available spells.');
        }
        if (x == null || y == null || !_.isNumber(x) || !_.isNumber(y)) {
            throw new ArgumentError('X and Y coordinates should be numbers.');
        }
        if (this.isBusy) {
            return;
        }
        if (this.color == 'blue') {
            x = MAX_X - x;
        }
        this.isBusy = true;
        this.intention = 'casting';
        this.unblockTime = this.world.age + spellParams.cost;
        this[`cast_${spellName}`](spellParams, x, y);
        this.setAction('casting');
        this.act();
        return this.block();
    }
    
    esper_getUnitParameters(unitType) {
        let unitParams;
        if (unitType == 'tower') {
            unitParams = this._ref.parameters.towerParameters;
        }
        else {
            unitParams = this._ref.parameters.unitParameters[unitType];
        }
        
        if (!unitParams) {
            throw new ArgumentError('The wrong unit\'s type. Check docs to find available unit types or hero.availableUnits.');
        }
        return {
            attackDamage: unitParams.attackDamage,
            attackRange: unitParams.attackRange,
            attackCooldown: unitParams.attackCooldown,
            maxHealth: unitParams.maxHealth,
            maxSpeed: unitParams.maxSpeed || 0,
            cost: unitParams.cost || 0,
            type: unitType
        };
    }
    esper_findMySpirits() {
        return this.world.thangs.filter((s) => s.exists && s.type == 'spirit' && s.color == this.color);
    }
    
    esper_findEnemySpirits() {
        return this.world.thangs.filter((s) => s.exists && s.type == 'spirit' && s.color != this.color);
    }

    cast_lightning(params, x, y) {
        const pos = new Vector(x, y);
        const affected = this.world.thangs.filter(th => th.exists && th.health 
            && th.health > 0 && th.team != this.team 
            && th.type != 'tower' && th.type != 'base'
            && th.distance(pos) <= params.range);
        const strongest = _.max(affected, (th) => th.health);
        if (strongest && strongest.health) {
            x = strongest.pos.x;
            y = strongest.pos.y;
            strongest.takeDamage(params.damage, this);
            if (strongest.hasEffects && ( typeof strongest.isCrystallized === "undefined" || strongest.isCrystallized === false)) {
                strongest.effects = strongest.effects.filter(e => e.name != 'confuse');
                const effects = [
                    {name: 'confuse', duration: params.duration, reverts: true, setTo: true, targetProperty: 'isFrozen'},
                    {name: 'confuse', duration: params.duration, reverts: true, setTo: this.stunnedChooseAction.bind(strongest), targetProperty: 'chooseAction'},
                    {name: 'confuse', duration: params.duration, reverts: true, setTo: this.world.age + params.duration, targetProperty: 'blockedTime'}
                    
                ];
                const spiritEffects = [
                    {name: 'confuse', duration: params.duration, reverts: true, setTo: true, targetProperty: 'isFrozen'},
                    {name: 'confuse', duration: params.duration, reverts: true, factor: 0, targetProperty: 'maxSpeed'},
                    {name: 'confuse', duration: params.duration, reverts: true, setTo: this.world.age + params.duration, targetProperty: 'blockedTime'}
                    
                    ];
                strongest.brake();
                if (strongest.type == "spirit"){
                spiritEffects.forEach(e => {
                    strongest.addEffect(e)
                    
                });
                }else{
                effects.forEach(e => {
                    strongest.addEffect(e)
                    
                });   
                }
            }
        }
        this.buildXY('lightning', x, y);
        this.performBuild();
    }

    esper_setSpiritSpawn(placeSymbol)
    {
        const p = this._ref.getPointCoordinates(placeSymbol, this);
            if (!p) {
                throw new ArgumentError('The unknown point name. Use letter from A to D.');
            }
        this.spiritSpawnPlace = placeSymbol;
    }
    esper_getSpiritSpecialParameters(specialName)
    {
        const params = this._ref.parameters.spiritParameters.specialParams[specialName];
        if (!params) {
            throw new ArgumentError('The wrong special\'s name. Check docs to find available spirit special powers.');
        }
        let returnObj = {}
        for (let paramName of Object.keys(params)) {
            returnObj[paramName] = params[paramName];
        }
        return returnObj
    }
    esper_getSpiritParameters()
    {
        let spiritParams = this._ref.parameters.spiritParameters
        return {
            maxHealth : spiritParams.maxHealth,
            attackRange : spiritParams.attackRange,
            maxSpeed : spiritParams.maxSpeed,
            speed : spiritParams.maxSpeed,
            attackCooldown : spiritParams.attackCooldown,
            attackDamage : spiritParams.attackDamage,
            respawnTime : spiritParams.respawnTime
        }
        
    }
    stunnedChooseAction() {
        this.setAction("idle");
        this.intent = null;
        this.brake();
        return;
    }
    
    handleHeroTowersSummon(){
        if(!this._ref){return;}
        let towerParams = this._ref.parameters.towerParameters
        if(this.heroTowerSummonTimer > 0){
            this.heroTowerSummonTimer -= this._ref.world.dt;
            return;
        }
        this.heroTowerSummonTimer = towerParams.spawnTime
        let spawnOffsetX = towerParams.spawnOffset.x * (this.color == "red" ? 1 : -1)
        let spawnOffsetY = towerParams.spawnOffset.y * (this.color == "red" ? 1 : -1)
        for(let tower of this._ref.heroTowers[this.color]){
            if (tower == null || tower.health <= 0){continue;}
            this.summonThang(towerParams.spawnType, tower.pos.x + spawnOffsetX, tower.pos.y + spawnOffsetY)
        }
    }
    
    cast_fireball(params, x, y) {
        const pos = new Vector(x, y);
        this.tower.throwDamage = params.damage;
        this.tower.throwPos(pos);
        this.tower.performThrow();
        this.tower.lastMissileThrown.blastRadius = params.range;
        this.tower.lastMissileThrown._hero = this;
        this.tower.lastMissileThrown.flightTime = 1;
        this.tower.lastMissileThrown.launch(this.tower, 'throw');
        this.tower.lastMissileThrown.appendMethod('explode', function() {
            const X = parseFloat(this.pos.x.toFixed(2));
            const Y = parseFloat(this.pos.y.toFixed(2));
            const radius = parseFloat(this.blastRadius.toFixed(2));
            const color = '#FFA500';
            const args = [X, Y, radius, color, 0, 0];
            this._hero.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
            
        });
    }
    
    cast_heal(params, x, y) {
        const pos = new Vector(x, y);
        const X = parseFloat(x.toFixed(2));
        const Y = parseFloat(y.toFixed(2));
        const radius = parseFloat(params.range.toFixed(2));
        const color = '#00FF00';
        const args = [X, Y, radius, color, 0, 0];
        this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
        for (const th of this.world.thangs) {
            if (th.exists && th.health && th.health > 0 && th.color == this.color && th.distanceTo(pos) <= params.range) {
                // debugger
                th.addEffect({name: 'heal', duration: 0.5, reverts: true, setTo: true, targetProperty: 'beingHealed'});
                let healAmount = params.damage;
                if(th.type == "tower" || th.type == "base") {
                    healAmount *= params.tower_heal_factor
                }
                th.health = Math.min(th.maxHealth, th.health + healAmount);
                th.keepTrackedProperty('health');
            }
        }
    }
    
    unblockHero() {
        this.unblockTime = null;
        this.isBusy = null;
        this.intention = null;
        this.setAction('idle');
        this.actionHeats.all = 0;
        return this._unblock();
    }
    
    unit_chooseAction() {
        if (this.aggro && this.aggro.health > 0){
            this.attack(this.aggro)
            return
        }
        let enemies = this.findEnemies();
        if (this.color == 'blue' && this.pos.x < 50) {
            enemies = enemies.filter(e => e.pos.x < this.pos.x);
        }
        if (this.color == 'red' && this.pos.x > 50) {
            enemies = enemies.filter(e => e.pos.x > this.pos.x);
        }
        const en = this.findNearest(enemies) || this.opponent;
        
        if (en && en.health > 0) {
            this.attack(en);
        }
    }
    
    update() {
        this.handleHeroTowersSummon()
        if (this.isBusy && this.world.age < this.unblockTime) {
            return;
        }
        if (this.intention == 'summon') {
            this.performSummonThang();
            this.unblockHero();
        }
        if (this.intention == 'casting') {
            this.unblockHero();
        }
    }
    heroSpawnSpirit(){
        return this.spawnSpirit(this.spiritSpawnPlace);
    }
    spawnSpirit(place) {
        if (this.dead) {
            return;
        }
        const params = this._ref.parameters.spiritParameters;
        let {x, y} = this._ref.getPointCoordinates(place, this);
        // x -= 5;
        if (this.color == 'blue') {
            x = MAX_X - x;
        }
        // debugger
        this.buildXY('spirit', x, y);
        const spirit = this.performBuild(`${this.color}-spirit`);
        spirit.commander = null;
        spirit.owner = this;
        spirit.sayWithoutBlocking = () => {};
        spirit.homePos = {x, y};
        // colossus.type = colossusType;
        spirit.actionsShouldBlock = true;
        spirit.attackDamage = params.attackDamage;
        spirit.actions.attack.cooldown = params.attackCooldown;
        spirit.attackCooldown = params.attackCooldown;
        spirit.attackRange = params.attackRange;
        spirit.maxHealth = params.maxHealth;
        spirit.health = params.maxHealth;
        spirit._ref = this._ref;
        // spirit.healthReplenishRate = params.healthReplenishRate || 0;
        spirit.maxSpeed = params.maxSpeed;
        spirit.keepTrackedProperty('maxSpeed');
        spirit.keepTrackedProperty('maxHealth');
        spirit.keepTrackedProperty('health');
        spirit.keepTrackedProperty('attackDamage');
        spirit.keepTrackedProperty('attackRange');
        spirit.type = 'spirit';
        spirit.hero1 = this.world.getThangByID('Hero Placeholder');
        spirit.hero2 = this.world.getThangByID('Hero Placeholder 1');
        Object.defineProperty(spirit, 'y', {
            get: function() {
                return this.pos.y;
            }
        });
        Object.defineProperty(spirit, 'x', {
                get: function() {
                    if (this.hero2._aetherAPIOwnMethodsAllowed) {
                        return MAX_X - this.pos.x;
                    }
                    return this.pos.x;
                }
            });
        if (this.color == 'blue') {
            spirit.rotation = Math.PI;
            spirit.keepTrackedProperty('rotation');
        }
        spirit.color = this.color;
        spirit.appendMethod('die', this.spiritDie.bind(this, spirit));
        this.triggerSpawnSpiritEvent(spirit, place);
        
        this.spirit = spirit;
        this.setupSpiritAPI(spirit, place, params);
        spirit._takeDamage = spirit.takeDamage;
        // const rangedAttackRatio = params.rangedAttackRatio || 1;
        spirit.takeDamage = (damage, attacker, momentum=null) => {
            let damageMult = 1;
            if(spirit.isCrystallized){
                damageMult = spirit.crystallizedDamageMult;
            }
            spirit._takeDamage(damage * damageMult, attacker, momentum);
        };
        spirit.initialize();
        return spirit;
        
    }

    triggerSpawnSpiritEvent(spirit, place) {
        const eName = `spawn-spirit`;
        if (this.eventHandlers[eName] && this.eventHandlers[eName][0]) {
            spirit.on('spawn', this.eventHandlers[eName][0]);
            spirit.trigger('spawn', {spirit, place});
            spirit.spawnTriggered = true;
        }
    }
    
    setupSpiritAPI(spirit, place, params) {
        spirit.place = place;
        spirit.isSpirit = true;
        spirit.color = this.color;
        spirit.moveToward = function(x, y) {
            if(!this._ref.canMoveTo(x,y)){
                this.sayWithoutBlocking(`Can\'t move to {${x}, ${y}}`);
                return;
            }
            if (this.color == 'blue') {
                x = MAX_X - x;
            }
            return this.move(new Vector(x, y));
        };
        spirit.moveTowards = function(x, y) {
            if(!this._ref.canMoveTo(x,y)){
                this.sayWithoutBlocking(`Can\'t move to {${x}, ${y}}`);
                return ;
            }
            if (this.color == 'blue') {
                x = MAX_X - x;
            }
            return this.move(new Vector(x, y));
        };
        spirit.findEnemies = function() {
            return this.world.thangs.filter(th => th.exists && th.health && th.health > 0 && th.team != this.team && th.x !== undefined && th.pos.x >= MIN_X && th.pos.x <= MAX_X && th.pos.y >= MIN_Y && th.pos.y <= MAX_Y);
        };
        spirit.findNearestEnemy = function() {
            return this.findNearest(this.findEnemies());
        };
        spirit._moveXY = spirit.moveXY;
        spirit.moveTo = function(x, y) {
            if(!this._ref.canMoveTo(x,y)){
                this.sayWithoutBlocking(`Can\'t move to {${x}, ${y}}`);
                return ;
            }
            if (this.color == 'blue') {
                x = MAX_X - x;
            }
            return this._moveXY(x, y);
        };
        spirit.specialCooldowns = {};
        for (let sname of Object.keys(params.specialParams)) {
            spirit.specialCooldowns[sname] = 0;
            spirit.addActions({name: sname, cooldown: params.specialParams[sname].cooldown});
        }
        spirit.specialParams = params.specialParams;
        spirit.special = this.spiritSpecial.bind(this, spirit);
        spirit.isReady = this.spiritIsReady.bind(this, spirit);
        spirit.appendMethod('update', this.spiritUpdate.bind(this, spirit));
    }
    
    spiritUpdate(spirit) {
        if (spirit.blockedTime && spirit.blockedTime <= this.world.age) {
            spirit.blockedTime = null;
            return spirit.unblock();
        }
    }
    
    spiritDie(spirit) {
        let eColor = spirit.color == 'red' ? 'blue' : 'red';
        // this._ref.addMana(eColor, colossus.cost);
        this._ref.setTimeout(() => {
            spirit.setExists(false);
            this.heroSpawnSpirit();
        }, this._ref.parameters.spiritParameters.respawnTime || 2);
    }
    
    spiritSpecial(spirit, name, ...args) {
        const sParams = spirit.specialParams[name];
        if (!sParams) {
            // TODO
            throw Error('TODO Wrong special name');
        }
        if (spirit.specialCooldowns[name] && spirit.specialCooldowns[name] > this.world.age) {
            spirit.blockedTime = this.world.age + this.world.dt;
            return spirit.block();
        }
        if (spirit.health <= 0) {
            return spirit.block();
        }
        spirit.specialCooldowns[name] = this.world.age + sParams.specificCooldown;
        
        spirit.blockedTime = this.world.age + sParams.cooldown;
        this[`spiritSpecial_${name}`](spirit, sParams, ...args);
        return spirit.block();
    }
    
    spiritIsReady(spirit, name, ...args) {
        const sParams = spirit.specialParams[name];
        if (!sParams) {
            return false;
        }
        if (spirit.specialCooldowns[name] && spirit.specialCooldowns[name] > this.world.age) {
            return false;
        }
        return true;
    }

    spiritSpecial_blaze(spirit, params){
                const args = [
            parseFloat(spirit.pos.x.toFixed(2)),
            parseFloat(spirit.pos.y.toFixed(2)),
            parseFloat(params.range.toFixed(2)),
            '#FF0000', 0, Math.PI * 2];
                    this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
                    spirit.setAction('trick');
        for (let m of spirit.findEnemies()) {
            if (spirit.distance(m) <= params.range) {
                let blazeDamage = spirit.health
                if(m.type == "tower" || m.type == "base")
                {
                    blazeDamage *= params.towerDamageMult;
                }else{
                    blazeDamage *= params.damageMult;
                }
                if (blazeDamage < 0)
                {
                    blazeDamage = 0
                }
                m.takeDamage(blazeDamage, spirit);
            }
        }
        this._ref.setTimeout(() => {
            spirit.takeDamage(9999, spirit);
        }, params.cooldown);
    }

    spiritSpecial_flare(spirit, params, target)
        {
            // const args = [
            //     parseFloat(spirit.pos.x.toFixed(2)),
            //     parseFloat(sp irit.pos.y.toFixed(2)),
            //     parseFloat(params.range.toFixed(2)),
            //     '#FF0000', 0, Math.PI * 2];
            //             this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
            if(target.color == spirit.color){return;}
            if(spirit.distance(target) > params.range){
                return;
            }
            let flareDamage = spirit.health
            if(target.type == "tower" || target.type == "base")
            {
                flareDamage *= params.towerDamageMult;
            }else{
                flareDamage *= params.damageMult;
            }
            if(flareDamage < 0){
                flareDamage = 0;
            }
            target.takeDamage(flareDamage, spirit);
            spirit.setAction('trick');
            this._ref.instabuild(`ice-ring-wave`,target.pos.x,target.pos.y,`ice-ring-wave`);
            this._ref.setTimeout(() => {
                spirit.takeDamage(9999, spirit);
            }, params.cooldown);
        }
    
    spiritSpecial_haste(spirit, params) {
        spirit.effects = spirit.effects.filter((e) => e.name != 'haste');
        spirit.addEffect({name: 'haste', duration: params.duration, reverts: true, factor: params.factor, targetProperty: 'maxSpeed'});
    }

    spiritSpecial_crystallize(spirit, params) {
        const args = [
            parseFloat(spirit.pos.x.toFixed(2)),
            parseFloat(spirit.pos.y.toFixed(2)),
            parseFloat(params.range.toFixed(2)),
            '#0000FF', 0, Math.PI * 2];
        this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
        spirit.setAction('trick');
        for (let m of spirit.findEnemies()) {
            if (m.type != "base" && spirit.distance(m) <= params.range) {
                m.aggro = spirit;
                m.attack(spirit);
            }
        }
        spirit.crystallizedDamageMult = params.damageMult;
        spirit.isCrystallized = true
        spirit.effects = spirit.effects.filter(e => e.name != 'crystalize');
                const effects = [
                    {name: 'crystalize', duration: params.duration, reverts: true, setTo: true, targetProperty: 'isFrozen'},
                    {name: 'crystalize', duration: params.duration, reverts: true, setTo: this.stunnedChooseAction.bind(spirit), targetProperty: 'chooseAction'}
                ];
                spirit.brake();
                effects.forEach(e => spirit.addEffect(e));
                this._ref.setTimeout(() => {
                    spirit.isCrystallized = false;
                }, params.duration);
        this.buildXY('ice-crystal', spirit.pos.x, spirit.pos.y);

        let crystal = this.performBuild('ice-crystal');
        crystal.lifespan = params.duration;
    }
    // guardSpecial_roar(guard, params) {
    //     const args = [
    //         parseFloat(guard.pos.x.toFixed(2)),
    //         parseFloat(guard.pos.y.toFixed(2)),
    //         parseFloat(params.range.toFixed(2)),
    //         '#5AFF00', 0, Math.PI * 2];
    //     this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
    //     guard.setAction('roar');
    //     for (let m of this._ref.monsters) {
    //         if (guard.distance(m) <= params.range) {
    //             m.aggro = guard;
    //             m.attack(guard);
    //         }
    //     }            
    // }
    
    // guardSpecial_hide(guard, params) {
    //     guard.setAlpha(0.3);
    //     guard.setAction('idle');
    //     for (let m of this._ref.monsters) {
    //         if (m.aggro == guard) {
    //             m.aggro = null;
    //             m.chooseAction();
    //         }
    //     }
    //     this._ref.setTimeout(() => guard.setAlpha(1), params.cooldown);
    // }
    
    // guardSpecial_home(guard, params) {
    //     guard.setAction('idle');
    //     guard.setTarget(null);
    //     guard.intent = null;
    //     guard.pos.x = guard.homePos.x;
    //     guard.pos.y = guard.homePos.y;
    //     guard.keepTrackedProperty('pos');
    //     // this._ref.setTimeout(() => guard.setAlpha(1), params.cooldown);
    // }
    

});