const Vector = require('lib/world/vector');

const RED = 'red';
const BLUE = 'blue';
const TEAMS = [RED, BLUE];

const MAX_X = 100;
const RECONCILE_X_DELTA = 2;
const RECONCILE_UNCERTAINTY_FACTOR = 4;


({
    setUpLevel () {
        this.heroes = [this.hero, this.hero1];
        this.hero.enemy = this.hero1;
        this.hero1.enemy = this.hero;
        this.hero.opponent = this.hero1;
        this.hero1.opponent = this.hero;
        this.heroFires = {
            [RED]: null,
            [BLUE]: null
        
        };
        this.heroes.forEach((h) => {
            h._ref = this;
            h.health = this.winScore;
            h.maxHealth = this.winScore;
            h.keepTrackedProperty('health');
            h.keepTrackedProperty('maxHealth');
        });
        this.units = [];
        this.boulders = {
            0 : null,
            1 :  null,
            2 : null,
        };
        this.boulderBurnTimes = {
            0: null,
            1: null,
            2: null,

        }
        this.boulderDeathTimes = {
            0: null,
            1: null,
            2: null,
        }
        if (this.DEBUG_MODE) {
            this.hero.esper_enemyDebug = (fn) => {
                this.hero1.didTriggerSpawnEvent = true;
                this.hero1._aetherAPIOwnMethodsAllowed = 1;
                this.hero1.on('spawn', fn);
            };
        }
        // this.scoreUI = {
        //     [RED]: this.getByID(`${RED}-score`),
        //     [BLUE]: this.getByID(`${BLUE}-score`)
        // };
        // this.baskets = {
        //     [RED]: this.getByID(`${RED}-basket`),
        //     [BLUE]: this.getByID(`${BLUE}-basket`)
        // };
        this.createBoulder(0);
        this.createBoulder(1);
        this.createBoulder(2);
        this.unitBumpRangeSquared = this.unitBumpRange * this.unitBumpRange;
        
    },
    onFirstFrame() {
    },

    createBoulder(lane) {
        const pos = this.boulderPoints[lane];
        const boulder = this.instabuild(`fire-boulder`, pos.x, pos.y);
        boulder.type = "boulder";
        boulder.isBoulder = true;
        boulder.lane = lane;
        this.boulders[lane] = boulder;
    },

    
    checkGoals() {
        if (this.world.age > this.maxTime) {
            if (this.hero.health == this.hero1.health) {
                if (this.world.rand.randf() > 0.5) {
                    this.hero.health += 1;
                }
                else {
                    this.hero1.health += 1;
                }
            }
            if (this.hero.health > this.hero1.health) {
                this.winGoal('red-win');
                this.failGoal('blue-win');
                return 'red';
            }
            else if (this.hero1.health > this.hero.health) {
                this.winGoal('blue-win');
                this.failGoal('red-win');
                return 'blue';
            }
        }
        // else if (this.world.age > this.resolveTime) {
        //     if (this.hero.score > this.hero1.score) {
        //         this.winGoal('red-win');
        //         this.failGoal('blue-win');
        //         return 'red';
        //     }
        //     else if (this.hero1.score > this.hero.score) {
        //         this.winGoal('blue-win');
        //         this.failGoal('red-win');
        //         return 'blue';
        //     }
        // }
        else if (this.hero1.health <= 0) {
            this.winGoal('red-win');
            this.failGoal('blue-win');
            return 'red';
        }
        else if (this.hero.health <= 0 ) {
            this.winGoal('blue-win');
            this.failGoal('red-win');
            return 'blue';
        }
        return null;
    },
    
    swapUnits() {
        const m = this.middleY * 2;
        for (let u of this.units) {
            if (!u.markedToSwap) { continue }
            u.lane = u.lane == 1 ? 2 : 1;
            u.pos = Vector(u.pos.x, m - u.pos.y, u.pos.z);
            u.keepTrackedProperty('pos');
            if (u.targetPos) {
                u.targetPos = Vector(u.targetPos.x, m - u.targetPos.y, u.targetPos.z);
            }
            if (u.route) {
                u.route = u.route.map(r => Vector(r.x, m - r.y));
            }
            u.markedToSwap = false;
        }
    },

    createSands(lane) {
        const points = this.sandPoints[lane];
        for (let p of points) {
            let qs = this.instabuild('quicksand', p[0], p[1]);
            qs.lifespan =0.5
        }
    },
    
    createPalm(lane, color) {
        const points = this.palmPoints[lane];
        let sp, ep;
        if (color == RED) {
            sp = points[0];
            ep = points[1];
        }
        else {
            sp = points[1];
            ep = points[0];
        }
        let palm = this.instabuild('palm', sp[0], sp[1]);
        palm.lifespan = (ep[0] - sp[0]) / palm.maxSpeed;
        palm.moveXY(ep[0], ep[1]);
    },
    
    createWind(lane, color) {
        const points = this.palmPoints[lane];
        const sp = points[0];
        const ep = points[1];
        let dir;
        if (color == RED) {
            dir = 0;
        }
        else {
            dir = Math.PI;
        }
        for (let x = sp[0]; x <= ep[0]; x += 10) {
            let wind = this.instabuild('wind', x, sp[1]);
            wind.lifespan = 0.5;
            wind.rotation = dir;
            wind.keepTrackedProperty('rotation');
        }
    },
    
    // updateScore() {
    //     for (let h of this.heroes) {
    //         this.scoreUI[h.color].sayWithDuration(99, h.score);
    //         h.health = this.winScore - h.opponent.score;
    //         h.keepTrackedProperty('health');
    //     }
    // },

    burnBoulder(lane){
        const boulder = this.boulders[lane];
        if (boulder == null) { return }
        this.boulderBurnTimes[lane] = this.world.age;

        const burnParams = this.abilityParameters.burn;
        const BURN_EFFECT_Z_OFFSET = -1;

        let burnAsset = this.instabuild(`boulder-burn-effect`, boulder.pos.x, boulder.pos.y, BURN_EFFECT_Z_OFFSET);
        burnAsset.clingTo(boulder);
        burnAsset.lifespan = burnParams.duration;
        burnAsset.followOffset = new Vector(0, 0, BURN_EFFECT_Z_OFFSET);
    },

    checkBoulderDamage(){
        const boulderParams = this.boulderParams
        const burnAbilityParams = this.abilityParameters.burn
        const distanceBoulderSquared = boulderParams.damageDistance * boulderParams.damageDistance

        for(let h of this.heroes){
            let totalDmg = 0
            for(let b of Object.values(this.boulders))
            {
                const distSq = h.distanceSquared(b)
                if(h.distanceSquared(b) > distanceBoulderSquared){
                    continue
                }
                let dDmg = boulderParams.damagePerSecond * this.world.dt * ((1 - (distSq/distanceBoulderSquared)) * boulderParams.distanceFactor)
                if(this.boulderBurnTimes[b.lane] != null && this.boulderBurnTimes[b.lane]+burnAbilityParams.duration > this.world.age){
                    dDmg *= burnAbilityParams.damageMultiplier
                }
                h.health -= dDmg
                totalDmg += dDmg
            }
            if(totalDmg > 0){
                if(this.heroFires[h.color] == null){
                    this.heroFires[h.color] = this.instabuild('fire-effect', h.pos.x, h.pos.y);
                }
                this.heroFires[h.color].setScale(totalDmg / 5)
            }else{
                if(this.heroFires[h.color] != null){
                    this.heroFires[h.color].setExists(false);
                    this.heroFires[h.color] = null;
                }
            }
        }
    },

    checkBoulderExplode(){
        const boulderParams = this.boulderParams
        const explodeDistanceSquared = this.boulderParams.explodeDistance * this.boulderParams.explodeDistance
        for(let b of Object.values(this.boulders))
        {
            for(let p of Object.entries(this.points)){
                if (!p[0].includes(b.lane)){continue;}
                const point = p[1];
                const key = p[0];
                const redKey = key.includes("red");
                const blueKey = !redKey;
                const mult = redKey ? 1 : -1;
                const truePoint = Vector(point.x + (mult * boulderParams.explodeDistance), point.y, point.z);
                if (b.pos.x > truePoint.x && redKey ) {continue;}
                if (b.pos.x < truePoint.x && blueKey) {continue;}
                b.setExists(false);
                if(redKey)
                {
                    this.hero.takeDamage(boulderParams.explodeDamage,b)
                }
                if(blueKey){
                    this.hero1.takeDamage(boulderParams.explodeDamage,b)
                }
                for(let u of this.units)
                {
                    if(u.lane == b.lane){
                        u.takeDamage(9999,b)
                    }
                }
                                const args = [
                    parseFloat(b.pos.x.toFixed(2)),
                    parseFloat(b.pos.y.toFixed(2)),
                    parseFloat(boulderParams.explodeVisualRange.toFixed(2)),
                    '#FF0000', 0, Math.PI * 2];
                            this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
                this.boulderBurnTimes[b.lane] = null;
                this.createSands(b.lane)
                this.createBoulder(b.lane);
            }
        }
    },
    
    chooseAction() {
        //this.updateScore();
        this.gameWon = this.checkGoals();
        if (this.gameWon) { return }
        this.units = this.units.filter(u => u.exists && !u.dead && !u.isOut);
        for (let h of this.heroes) {
            h.units = h.units.filter(u => u.exists && !u.dead && !u.isOut);
        }
        
        this.swapUnits();
        const boulderParams = this.boulderParams;
        const burnParams = this.abilityParameters.burn;
        const unitDamageRangeSquared = boulderParams.unitDamageRange * boulderParams.unitDamageRange
        const boulders = this.world.thangs.filter((th) => th.exists && th.isBoulder);
        this.forces = this.world.thangs.filter((th) => th.exists && th.isForce);
        for(let boulder of boulders){
            let closestLeft = null;
            let closestRight = null;
            for(let un of this.units.filter((th) => th.exists && th.lane == boulder.lane && !th.dead)){
                if(un.pos.x < boulder.pos.x && (closestLeft == null || un.pos.x > closestLeft.pos.x)){
                    closestLeft = un;
                }
                if(un.pos.x > boulder.pos.x && (closestRight == null || un.pos.x < closestRight.pos.x)){
                    closestRight = un;
                }
            }
            let deltaDmg = boulderParams.unitDamage * this.world.dt;
            if(this.boulderBurnTimes[boulder.lane] != null && this.boulderBurnTimes[boulder.lane]+burnParams.duration > this.world.age){
                deltaDmg *= burnParams.damageMultiplier
            
            }
            if(closestLeft != null && closestLeft.distanceSquared(boulder) < unitDamageRangeSquared){
                closestLeft.addEffect(
                    {name: 'fire',
                     duration: this.world.dt, 
                     reverts: false,
                     addend: -deltaDmg, 
                     targetProperty: 'health', }
                     );
            }
            if(closestRight != null && closestRight.distanceSquared(boulder) < unitDamageRangeSquared){
                closestRight.addEffect(
                    {name: 'fire',
                     duration: this.world.dt, 
                     reverts: false,
                     addend: -deltaDmg, 
                     targetProperty: 'health', }
                     );
                }
        }

        let properY = {
            0:50,
            1:78,
            2:22
        }
        for(let boulder of boulders){
            if(boulder.pos.y != properY[boulder.lane]){
                boulder.pos = Vector(boulder.pos.x,properY[boulder.lane],boulder.pos.z)
            }
        }
        for (let un of this.units) {
            un.say("")
             if(un.pos.y != properY[un.lane]){
                 un.pos = Vector(un.pos.x,properY[un.lane],un.pos.z)
                }
            if (un.nextUnit !== undefined && un.nextUnit !== null && (un.nextUnit.dead === undefined || !un.nextUnit.dead)) //Recheck positioning with next unit
            {
                let redCheck = un.color == RED && (un.nextUnit.pos.x+RECONCILE_UNCERTAINTY_FACTOR) < un.pos.x
                let blueCheck = un.color == BLUE && (un.nextUnit.pos.x-RECONCILE_UNCERTAINTY_FACTOR) > un.pos.x
                if(redCheck){
                    un.pos = Vector(un.nextUnit.pos.x - RECONCILE_X_DELTA, un.pos.y, un.pos.z)
                }else if(blueCheck){
                    un.pos = Vector(un.nextUnit.pos.x + RECONCILE_X_DELTA, un.pos.y, un.pos.z)
                }
            }else if (this.boulders[un.lane] != null){ //Recheck positioning with boulder
                let redCheck = un.color == RED && un.pos.x > this.boulders[un.lane].pos.x
                let blueCheck = un.color == BLUE && un.pos.x < this.boulders[un.lane].pos.x
                if(redCheck){
                    un.pos = Vector(this.boulders[un.lane].pos.x - RECONCILE_X_DELTA, un.pos.y, un.pos.z)
                }else if(blueCheck){
                    un.pos = Vector(this.boulders[un.lane].pos.x + RECONCILE_X_DELTA, un.pos.y, un.pos.z)
                }
            }
            if (un.takenDamage) {
                un.takeDamage(un.takenDamage, un.damageAttacker);
                
                un.takenDamage = 0;
            }
        }
        this.checkBoulderDamage();
        this.checkBoulderExplode();
        
    }
    });