const {ArgumentError} = require('lib/world/errors');

const RED = 'red';
const BLUE = 'blue';
const SUMMON = 'summon';
const SPELL = 'casting';
const IDLE = 'idle';

const DOUBLE_GRAVITY_FORCE_MULT = 2;

(class FierceForcesPlayer extends Component {
    attach(thang) {
        super.attach(thang);
        if (thang.id == 'Hero Placeholder') {
            thang.color = RED;
            thang.opColor = BLUE;
        }
        else {
            thang.color = BLUE;
            thang.opColor = RED;
        }
        // For the direct control of
        thang._unblock = thang.unblock;
        thang.unblock = null;
        thang._block = thang.block;
        thang.block = null;
        // Player API
        // thang.summon = this.summon;
        thang.cast = this._cast.bind(thang);
        thang.summon = this._summon.bind(thang);
        thang.wait = this._wait.bind(thang);
        thang.findUnits = this._findUnits.bind(thang, null);
        thang.findMyUnits = this._findUnits.bind(thang, thang.color);
        thang.findEnemyUnits = this._findUnits.bind(thang, thang.opColor);
        thang.orig_distanceTo = thang.distanceTo.bind(thang);
        thang.distanceTo = this._distanceTo.bind(thang, thang);
        thang._distanceTo = this._distanceTo;
        thang.findByType = this._findByType.bind(thang);
        thang.findForces = this._findForces.bind(thang);
        thang.findBoulders = this._findBoulders.bind(thang);
        thang.getGravityMode = this._getGravityMode.bind(thang);
        thang.getUpcomingGravityMode = this._getUpcomingGravityMode.bind(thang);
        thang.backmostUnits = {};
        // Utility fields
        thang.isHero = true;
        thang.units = [];
        thang.unitCounter = 0;
        thang.score = 0;
        thang.abilityReadyTimes = {};
        thang.addActions({name: 'attack', cooldown: 1}, {name: SPELL, cooldown: 1}, {name: 'waiting', cooldown: 900});
        
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

    getLaneString()
    {
        let concatString = ""
        for(let i = 0; i < this._ref.laneY.length; i++)
        {
            concatString += i;
            if(i != this._ref.laneY.length - 1)
            {
                concatString += ", ";
            }
        }
        return concatString;
    }
    
    // Player methods
    _summon(unitType, lane) {
        if (this.isBusy) { return }
        if (_.isNaN(lane) || !this._ref.laneY[lane] || typeof(lane) != "number") {
            let concatString = this.getLaneString();
            throw new ArgumentError(`Wrong lane number, lane needs to be either ${concatString}`);
        }
        const params = this._ref.unitParameters[unitType];
        if (!params) {
            throw new ArgumentError(`Wrong unit type ${unitType}. Check the docs to find available unit types.`);
        }
        const unitsByType = this.units.filter(u => u.type == unitType && !u.isOut && !u.dead);
        let level = -1;
        for (let i = 0; i <= this._ref.unitMaxLevel; i++) {
            if (!unitsByType.filter(u => u.level == i).length) {
                level = i;
                break;
            }
        }
        if (level == -1) {
            this.unblockTime = this.world.age + this.world.dt;
            this.intention = IDLE;
            return this._block();
        }
        this.intention = SUMMON;
        this.isBusy = true;
        this.unblockTime = this.world.age + (params.cost || this._ref.defaultUnitCost);
        this.summonUnitData = {};
        this.summonUnitData.type = unitType;
        this.summonUnitData.lane = lane;
        this.summonUnitData.pos = this._ref.points[`${this.color}${lane}`];
        this.summonUnitData.params = params;
        this.summonUnitData.level = level;
        return this._block();
    }

    _cast(abilityName,...args){
        if (this.isBusy) { return }
        const params = this._ref.abilityParameters[abilityName];
        if (!params) {
            throw new ArgumentError(`Wrong ability name \`${abilityName}\`. Check the docs to find available ability names.`);
        }
        if (!this.movementSystem) {
            this.movementSystem = this.world.getSystem('Movement');
        }
        // if (isNaN(x) || !y || isNaN(y)) {
        //     throw new ArgumentError('The special requires coordinates `x` and `y` which should be numbers.');
        // }
        // if (this.color == 'blue') {
        //     x = 120 - x;
        // }
        if (this.abilityReadyTimes[abilityName] && this.abilityReadyTimes[abilityName] > this.world.age) {
            this.unblockTime = this.world.age + this.world.dt
            this.intention = IDLE;
            return this._block()
        }
        this.intention = SPELL;
        this.isBusy = true;
        this.unblockTime = this.world.age + params.cooldown;
        this.abilityReadyTimes[abilityName] = this.world.age + params.specificCooldown;
        this[`ability_${abilityName}`](params, ...args);
        return this._block();
    }
    ability_haste(params, lane) {
        if (!this._ref.laneY[lane]) {
            throw new ArgumentError('The special requires a lane to cast the special in, between lane 0, 1, or 2.');
        return;}
        for (let u of this.units) {
            if (!u.isOut && !u.dead && u.lane == lane) {
                
                if (u.hasEffect('slow')) {
                    u.effects.forEach((e) => {
                        if (e.name == 'slow') {
                            e.timeSinceStart = 9999;
                        }
                    });
                    u.updateEffects();
                }
                else {
                    u.effects = u.effects.filter((e) => e.name != 'haste');
                    u.addEffect({
                        name: 'haste',
                        duration: params.duration,
                        reverts: true,
                        factor: params.ratio,
                        targetProperty: 'maxSpeed'});
                }
            }
        }
        this._ref.createWind(lane, this.color);
    }

    // ability_ignite(lane, params) {
    //     if (!this._ref.laneY[lane]) {
    //         let concatString = this.getLaneString();
    //         throw new ArgumentError(`The special requires a lane to cast the special in, between lane ${concatString}`);
    //     return;}
    //     this._ref.igniteBoulder(lane)
    // }

    ability_push(params, lane, xPos) {
        if (!this._ref.laneY[lane]) {
            let concatString = this.getLaneString();
            throw new ArgumentError(`The special requires a lane to cast the special in, between lane ${concatString}`);
            return;}
        if(xPos == null){
            throw new ArgumentError('The special requires coordinate `x` which should be number.');
            return;}
        if (xPos < this._ref.minX || xPos > this._ref.maxX) {return;}
        if(this.color == BLUE){xPos = this._ref.maxX - xPos;}
        let f = this._ref.instabuild('push-effect', xPos, this._ref.laneY[lane]);
        let forceN = params.force
        if(this._ref.gravityMode == "zero"){
            forceN = -forceN;
        }else if(this._ref.gravityMode == "double"){
            forceN *= DOUBLE_GRAVITY_FORCE_MULT;
        }
        f.force = forceN;
        f.lifespan = params.duration;
        f.isForce = true
        f.range = params.range;
        f.type = 'push';
        f.setScaleX(params.range / 6);
        f.setScaleY(0.5 * params.range / 6);
        this.movementSystem.addMagneticField({
            force: forceN,
            radius: params.range,
            pos: Vector(xPos, this._ref.laneY[lane]),
            attenuates: false,
            duration: params.duration,
            source: this
            });
        
    }
    ability_pull(params, lane, xPos) {
        if (!this._ref.laneY[lane]) { 
            let concatString = this.getLaneString();
            throw new ArgumentError(`The special requires a lane to cast the special in, between lane ${concatString}`);
            return;}
        if(xPos == null){
            throw new ArgumentError('The special requires coordinate `x` which should be number.');
            return;}
        if (xPos < this._ref.minX || xPos > this._ref.maxX) {return;}
        if(this.color == BLUE){xPos = this._ref.maxX - xPos;}
        let f = this._ref.instabuild('pull-effect', xPos, this._ref.laneY[lane]);
        let forceN = params.force
        if(this._ref.gravityMode == "zero"){
            forceN = -forceN;
        }else if(this._ref.gravityMode == "double"){
            forceN *= DOUBLE_GRAVITY_FORCE_MULT;
        }
        f.force = forceN;
        f.lifespan = params.duration;
        f.isForce = true
        f.range = params.range;
        f.type = 'pull';
        f.setScaleX(params.range / 6);
        f.setScaleY(0.5 * params.range / 6);
        this.movementSystem.addMagneticField({
            force: forceN,
            radius: params.range,
            pos: Vector(xPos, this._ref.laneY[lane]),
            attenuates: false,
            duration: params.duration,
            source: this
            });
        
    }
    ability_burst(params, lane, xPos) {
        if (!this._ref.laneY[lane]) { 
            let concatString = this.getLaneString();
            throw new ArgumentError(`The special requires a lane to cast the special in, between lane ${concatString}`);
            return;}
        if(xPos == null){
            throw new ArgumentError('The special requires coordinate `x` which should be number.');
            return;}
        if (xPos < this._ref.minX || xPos > this._ref.maxX) {return;}
        if(this.color == BLUE){xPos = this._ref.maxX - xPos;}
        let f = this._ref.instabuild('burst-effect', xPos, this._ref.laneY[lane]);
        let forceN = params.force
        if(this._ref.gravityMode == "zero"){
            forceN = -forceN;
        }else if(this._ref.gravityMode == "double"){
            forceN *= DOUBLE_GRAVITY_FORCE_MULT;
        }
        f.force = forceN;
        f.lifespan = params.duration;
        f.isForce = true
        f.range = params.range;
        f.type = 'burst';
        f.setScaleX(params.range / 6);
        f.setScaleY(0.5 * params.range / 6);
        this.movementSystem.addMagneticField({
            force: forceN,
            radius: params.range,
            pos: Vector(xPos, this._ref.laneY[lane]),
            attenuates: false,
            duration: params.duration,
            source: this
            });
        
    }
    ability_switchUnits(params, unit1, unit2)
    {
        if(unit1 == null || unit2 == null || unit1 == undefined || unit2 == undefined || unit1 == unit2)
        {
            throw new ArgumentError('The special requires two units to switch between.');
            return;
        }
        if(!unit1.isUnit || !unit2.isUnit)
        {
            return;
        }
        if(unit1.dead || unit2.dead)
        {
            return;
        }
        if(unit1.color != this.color || unit2.color != this.color)
        {
            return;
        }
        unit1.swapWith = unit2;
        unit2.swapWith = unit1;
    }

    _findItems() {
        const items = this.world.thangs.filter((th) => th.exists && th.isCollectable && !th.caught);
        return items;
    }

    _findForces() {
        const forces = this.world.thangs.filter((th) => th.exists && th.isForce);
        return forces;
    }

    _findBoulders(lane) {
        var boulders = this.world.thangs.filter((th) => th.exists && th.isBoulder);
        if (lane){
            boulders = boulders.filter((th) => th.lane == lane);
        }
        return boulders;
    }

    _getGravityMode() {
        return this._ref.gravityMode;
    }
    
    _getUpcomingGravityMode() {
        return this._ref.upcomingGravityMode;
    }

    esper_isReady(abilityName) {
        if (!abilityName) {
            return false; 
        }
        if (this.abilityReadyTimes[abilityName] && this.abilityReadyTimes[abilityName] > this.world.age) {
            return false;
        }
        return true;
    }
    
    _findUnits(color, lane) {
        let evaluateUnit = (u) =>{
            let colorCheck = (!color || color === null || typeof color === "undefined" || u.color === color);
            let laneCheck = (!lane || lane === null || typeof lane === 'undefined' || u.lane === lane);
            return !u.isOut && u.exists && !u.dead && colorCheck && laneCheck
        }
        let result = this._ref.units.filter(evaluateUnit);
        return result;
    }
    
    _distanceTo(fromThang, toThang) {
        if (!toThang || !toThang.pos) {
            throw new ArgumentError(`The \`distanceTo\` argument should be a unit or a hero or a game object with position.`);
        }
        // if (fromThang.ishero) {
        //     fromThang = this._ref.points[fromThang.color];
        // }
        // if (toThang.ishero) {
        //     toThang = this._ref.baskets[toThang.color];
        // }
        return fromThang.orig_distanceTo(toThang);
    }
    
    _findByType(unitType) {
        return this._ref.units.filter((u) => !u.isOut && !u.dead && u.exists && u.type == unitType);
    }
    
    performSummon() {
        let posCandidate = this.summonUnitData.pos;
        let unitLane = this.summonUnitData.lane;
        let backmostPos = this.backmostUnits[unitLane] && this.backmostUnits[unitLane].health > 0 ? this.backmostUnits[unitLane].pos : null;
        if(backmostPos)
        {
            if( backmostPos.x < this._ref.minX || backmostPos.x > this._ref.maxX) // Out of bounds
            {
                return
            }
            let redCheck = this.color == RED && posCandidate.x > backmostPos.x;
            let blueCheck = this.color == BLUE && posCandidate.x < backmostPos.x;
            if(redCheck)
            {
                posCandidate = Vector(backmostPos.x - 1, posCandidate.y);
            }else if(blueCheck)
            {
                posCandidate = Vector(backmostPos.x + 1, posCandidate.y);
            }
        }

        this.unitCounter += 1;
        const pos = posCandidate;
        const unitType = this.summonUnitData.type;
        const unitID = `${this.color}-${unitType}-${this.unitCounter}`;
        this.buildables[unitType].ids = [unitID];
        this.arenaBuildXY(unitType, pos.x, pos.y);
        const unit = this.performBuild(`${this.color}-${unitType}`);
        unit.setRotation(this.color == RED ? 0 : Math.PI);
        unit.type = unitType;
        unit.lane = unitLane;
        unit.enemy = this.enemy;
        unit.level = this.summonUnitData.level;
        unit.nextUnit = this.backmostUnits[unit.lane] && this.backmostUnits[unit.lane].health > 0 ? this.backmostUnits[unit.lane] : null;
        if (unit.nextUnit !== null)
        {
            unit.nextUnit.previousUnit = unit;
        }
        unit.previousUnit = null;
        this.backmostUnits[unit.lane] = unit;
        this.setupUnit(unit, this.summonUnitData.params, this._ref.unitCoefs[unit.level]);
        
        unit.setScale(unit.scaleFactor * this._ref.unitScale[unit.level]);
        
        this._ref.units.push(unit);
        this.units.push(unit);
    }
    
    setupUnit(unit, params, coef) {
        unit.maxSpeed = params.speed * coef;
        Object.defineProperty(unit, 'speed', {
            get: function() { return this.maxSpeed; }
        });
        unit.health = params.health * coef;
        unit.maxHealth = params.health * coef;
        //unit.mass = unit.health;
        unit.keepTrackedProperty('health');
        unit.keepTrackedProperty('maxHealth');
        unit.attackDamage = 0;
        Object.defineProperty(unit, 'damage', {
            get: function() { return this.attackDamage; }
        });
        unit.actions.attack.cooldown = 1;
        unit.actions.attack.specificCooldown = 99;
        unit.color = this.color;
        unit.commander = this;
        unit.isUnit = true;
        unit.cost = params.cost;
        // unit.attackRange = params.range;
        // unit.attackRangeSquared = params.range * params.range;
        unit.mass = params.mass;
        unit.route = this._ref.routes[unit.lane].slice();
        if (this.color == BLUE) { unit.route.reverse() }
        unit.route.shift();
        // unit.basketPos = unit.route[unit.route.length - 1];
        unit.chooseAction = this.unit_chooseAction.bind(this, unit);
        // unit.findNearestOpponent = this.unit_findNearestEnemy.bind(this, unit);
        // unit.findNearestFriend = this.unit_findNearestFriend(this, unit);
        unit.orig_distanceTo = this.distanceTo.bind(unit);
        unit.distanceTo = this._distanceTo.bind(this, unit);
        unit.appendMethod('setExists', (state) => {
            if (!state && unit.hasSticked) {
                unit.hasSticked.setExists(false);
                if(this.backmostUnits[unit.lane] == unit)
                {
                    this.backmostUnits[unit.lane] = unit.nextUnit || null;
                }
                if(unit.previousUnit !== null)
                {
                    unit.previousUnit.nextUnit = unit.nextUnit || null;
                }
                if(unit.nextUnit !== null)
                {
                    unit.nextUnit.previousUnit = unit.previousUnit || null;
                }
                }
        });
    }
    
    arenaBuildXY(toBuild, x, y) { 
        this.setTargetPos(new Vector(x, y), 'buildXY');
        this.toBuild = this.buildables[toBuild];
    }
    
    unit_findNearestEnemy(unit) {
        let nearest = null;
        let minDistSq = Infinity;
        let distSq = null;
        for (let en of unit.enemy.units) {
            if (en.isOut || en.lane != unit.lane) { continue }
            if (unit.color == RED && unit.pos.x > en.pos.x) { continue }
            if (unit.color == BLUE && unit.pos.x < en.pos.x) { continue }
            distSq = unit.distanceSquared(en);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = en;
            }
        }
        return nearest;
    }

    unit_findNearestFriend(unit) {
        let nearest = null;
        let minDistSq = Infinity;
        let distSq = null;
        for (let en of unit.friends) {
            if (en.id == unit.id){ continue }
            if (en.isOut || en.lane != unit.lane) { continue }
            if (unit.color == RED && unit.pos.x < en.pos.x) { continue }
            if (unit.color == BLUE && unit.pos.x > en.pos.x) { continue }
            distSq = unit.distanceSquared(en);
            if (distSq < minDistSq) {
                minDistSq = distSq;
                nearest = en;
            }
        }
        return nearest;
    }
    
    unit_chooseAction(unit) {
        if (unit.dead || unit.isOut) {
            return;
        }
        if (this._ref.gameWon) {
            if (this._ref.gameWon == unit.color) {
                unit.setTargetPos(null);
                unit.actions.attack.cooldown = 0.5;
                unit.setAction("attack");
                unit.act();
            }
            else {
                unit.die();
            }
            return;
        }
        if (!unit.targetPos && unit.route && unit.route.length) {
            let pos;
            if (unit.nextTargetPos && unit.distance(unit.nextTargetPos) > 1) {
                pos = unit.nextTargetPos;
            }
            else {
                pos = unit.route.shift();
            }
            if (pos) {
                unit.moveXY(pos.x, pos.y);
                unit.nextTargetPos = unit.targetPos;
            }
            
        }
        if(!unit.targetPos && unit.nextTargetPos)
        {
            unit.moveXY(unit.nextTargetPos.x, unit.nextTargetPos.y);
        }
    }
    
    unblockHero() {
        this.unblockTime = null;
        this.isBusy = null;
        this.intention = null;
        this.summonUnitData = null;
        this.setAction('idle');
        this.actionHeats.all = 0;
        return this._unblock();
    }
    
    update() {
        if (this.isBusy && this.unblockTime && this.unblockTime > this.world.age) {
            return;
        }
        if (this.intention == 'waiting' && this.nextMethod) {
            this[this.nextMethod].bind(this)();
            this.nextMethod = null;
        }
        if (this.intention == SUMMON) {
            this.performSummon();
            return this.unblockHero();
        }
        if (this.intention) {
            return this.unblockHero();
        }
    }
});