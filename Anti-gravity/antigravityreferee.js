const Vector = require('lib/world/vector');

const RED = 'red';
const BLUE = 'blue';
const TEAMS = [RED, BLUE];

const MAX_X = 120;
const RECONCILE_X_DELTA = 2;
const RECONCILE_UNCERTAINTY_FACTOR = 4;
const GRAVITY_MODES = ["normal","zero","double"];

({
    setUpLevel () {
        this.heroes = [this.hero, this.hero1];
        this.hero.enemy = this.hero1;
        this.hero1.enemy = this.hero;
        this.hero.opponent = this.hero1;
        this.hero1.opponent = this.hero;
        this.gravityBall = this.instabuild('gravity-ball-normal', 60, 90);
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
        this.gravityMode = "normal";
        this.changeUpcomingGravityMode();
        this.units = [];
        this.boulders = {
            0 : null,
            1 :  null,
            2 : null,
            3 : null,
        };
        this.boulderDeathTimes = {
            0: null,
            1: null,
            2: null,
            3: null,
        }
        if (this.DEBUG_MODE) {
            this.hero.esper_enemyDebug = (fn) => {
                this.hero1.didTriggerSpawnEvent = true;
                this.hero1._aetherAPIOwnMethodsAllowed = 1;
                this.hero1.on('spawn', fn);
            };
        }
        this.world.gravity = this.gravityValues["normal"]
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
        this.createBoulder(3);
    },
    onFirstFrame() {
        this.setInterval(this.changeGravityMode.bind(this), this.changeGravityModeInterval);
    },

    createBoulder(lane) {
        const pos = this.boulderPoints[lane];
        const boulder = this.instabuild(`fire-boulder`, pos.x, pos.y);
        boulder.type = "boulder";
        boulder.isBoulder = true;
        boulder.lane = lane;
        boulder.isIgnited = false;
        boulder.isExplosive = false;
        Object.defineProperty(boulder, 'currentSpeed', {
            get(){
                return Math.abs(boulder.velocity.x);
            }
        }); 
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

    changeUpcomingGravityMode(){
        let randomGravityMode = Math.floor(this.world.rand.randf() * GRAVITY_MODES.length)
        while(GRAVITY_MODES[randomGravityMode] == this.gravityMode){
            randomGravityMode = Math.floor(this.world.rand.randf() * GRAVITY_MODES.length)
        }
        this.upcomingGravityMode = GRAVITY_MODES[randomGravityMode]
    },


    changeGravityMode(){
        this.gravityMode = this.upcomingGravityMode
        this.changeUpcomingGravityMode();
        // var GRAVITY_BALL_COLOR = {}
        // GRAVITY_BALL_COLOR[false] = {
        //     ["hue"]: 0.65,
        //     ["saturation"]: 0.5,
        //     ["lightness"]: 0.5,
        // }
        // GRAVITY_BALL_COLOR[true] = {
        //     ["hue"]: 0.85,
        //     ["saturation"]: 0.5,
        //     ["lightness"]: 0.5,
        // }
        let ballStrings = {
            "normal": "gravity-ball-normal",
            "zero": "gravity-ball-zero",
            "double": "gravity-ball-double"
        }
        this.world.gravity = this.gravityValues[this.gravityMode]
        this.gravityBall.setExists(false)

        this.gravityBall = this.instabuild(ballStrings[this.gravityMode], 60, 90);
        // this.gravityBall.colors.team = GRAVITY_BALL_COLOR[this.gravityReversed]
        //for(let u of this.forces){
        //    u.force = -u.force
        //}
        let effectStrings = {
            "normal": "gravity-normal-effect",
            "zero": "gravity-zero-effect",
            "double": "gravity-double-effect"
        }
        let revEffect = this.instabuild(effectStrings[this.gravityMode], 60, 90);
        revEffect.lifespan = 0.4

    },

    igniteBoulder(lane, duration){
        const boulder = this.boulders[lane];
        if (boulder == null) { return }
        
        boulder.isIgnited = true
        this.setTimeout(()=>{
            if(boulder == null || !boulder.exists){return;}
            boulder.isIgnited = false
            
        },duration)
        
        const IGNITE_EFFECT_Z_OFFSET = -1;

        let igniteAsset = this.instabuild(`boulder-ignite-effect`, boulder.pos.x, boulder.pos.y, IGNITE_EFFECT_Z_OFFSET);
        igniteAsset.clingTo(boulder);
        igniteAsset.lifespan = duration;
        igniteAsset.followOffset = new Vector(0, 0, IGNITE_EFFECT_Z_OFFSET);
        boulder.igniteAsset = igniteAsset;
    },

    explosiveBoulder(lane, duration){
        const boulder = this.boulders[lane];
        if (boulder == null) { return }
        
        boulder.isExplosive = true
        this.setTimeout(()=>{
            if(boulder == null || !boulder.exists){return;}
            boulder.isExplosive = false
            
        },duration)
        
        const EXPLOSIVE_EFFECT_Z_OFFSET = -1;

        let explosiveAsset = this.instabuild(`boulder-explosive-effect`, boulder.pos.x, boulder.pos.y, EXPLOSIVE_EFFECT_Z_OFFSET);
        explosiveAsset.clingTo(boulder);
        explosiveAsset.lifespan = duration;
        explosiveAsset.followOffset = new Vector(0, 0, EXPLOSIVE_EFFECT_Z_OFFSET);
        boulder.explosiveAsset = explosiveAsset;
    },

    checkBoulderDamage(){
        const boulderParams = this.boulderParams
        const igniteAbilityParams = this.igniteParameters
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
                if(b.isIgnited){
                    dDmg *= igniteAbilityParams.damageMultiplier
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
                if (!b.exists){continue;}
                const point = p[1];
                const key = p[0];
                const redKey = key.includes("red");
                const blueKey = !redKey;
                const mult = redKey ? 1 : -1;
                const truePoint = Vector(point.x + (mult * boulderParams.explodeDistance), point.y, point.z);
                if (b.pos.x > truePoint.x && redKey ) {continue;}
                if (b.pos.x < truePoint.x && blueKey) {continue;}

                // If the boulder currently has status effects
                if(b.igniteAsset)
                {
                    b.igniteAsset.setExists(false);
                    b.igniteAsset = null;
                }
                if(b.explosiveAsset)
                {
                    b.explosiveAsset.setExists(false);
                    b.explosiveAsset = null;
                }

                b.setExists(false);

                // Handle explode damage, taking account of explosive multiplier
                let explodeDamage = boulderParams.explodeDamage;
                if(b.isExplosive){
                    explodeDamage *= this.explosiveParameters.explodeMultiplier
                }

                //Check which base to damage
                if(redKey)
                {
                    this.hero.takeDamage(explodeDamage,b)
                }
                else if(blueKey){
                    this.hero1.takeDamage(explodeDamage,b)
                }

                for(let u of this.units)
                {
                    if(u.lane == b.lane){
                        u.takeDamage(9999,b)
                    }
                }

                let explosionColor = b.isExplosive ? '#FFC900' : '#FF0000';
                                const args = [
                    parseFloat(b.pos.x.toFixed(2)),
                    parseFloat(b.pos.y.toFixed(2)),
                    parseFloat(boulderParams.explodeVisualRange.toFixed(2)),
                    `${explosionColor}`, 0, Math.PI * 2];
                            this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
                this.createSands(b.lane);
                this.setTimeout(()=>{
                    this.createBoulder(b.lane)
                    let igniteChance = this.world.rand.randf()
                    if(igniteChance <= this.igniteParameters.chance)
                    {
                        this.igniteBoulder(b.lane,this.igniteParameters.duration)
                    }
                    let explosiveChance = this.world.rand.randf()
                    if(explosiveChance <= this.explosiveParameters.chance)
                    {
                        this.explosiveBoulder(b.lane,this.explosiveParameters.duration)
                    }
                },boulderParams.respawnTime)
            }
        }
    },
    checkUnitSwaps(){
        for (let u of this.units){
            if(u.dead || !u.exists){continue;}
            if (!u.swapWith || u.swapWith == null){continue;}

            if(u.swapWith.swapWith != u){continue;}
            if(u.swapWith.dead ||!u.swapWith.exists){continue;}
            let backmostUnits = u.commander.backmostUnits
            for(let i =0;i<=3;i++)
            {
                if(backmostUnits[i] == u.swapWith){
                    backmostUnits[i] = u
                }else if(backmostUnits[i] == u){
                    backmostUnits[i] = u.swapWith
                }
            }

            let tempPos = u.pos.copy();
            u.pos = u.swapWith.pos.copy();
            u.swapWith.pos = tempPos;
            u.keepTrackedProperty('pos');
            u.swapWith.keepTrackedProperty('pos');

            let tempNext = u.nextUnit;
            u.nextUnit = u.swapWith.nextUnit;
            u.swapWith.nextUnit = tempNext;

            if(u.nextUnit != null){
                u.nextUnit.previousUnit = u;
            }
            if(u.swapWith.nextUnit != null){
                u.swapWith.nextUnit.previousUnit = u.swapWith;
            }

            let tempPrev = u.previousUnit;
            u.previousUnit = u.swapWith.previousUnit;
            u.swapWith.previousUnit = tempPrev;

            if(u.previousUnit != null){
                u.previousUnit.nextUnit = u;
            }
            if(u.swapWith.previousUnit != null){
                u.swapWith.previousUnit.nextUnit = u.swapWith;
            }
            let tempLane = u.lane;
            u.lane = u.swapWith.lane;
            u.swapWith.lane = tempLane;
            let tempRoute = u.route.map(r => Vector(r.x,r.y));
            u.route = u.swapWith.route.map(r=>Vector(r.x,r.y));
            u.swapWith.route = tempRoute;

            let tempTargetPos = u.targetPos ? u.targetPos.copy() : null;
            u.targetPos = u.swapWith.targetPos ? u.swapWith.targetPos.copy() : null;
            u.swapWith.targetPos = tempTargetPos;

            let tempNextTargetPos = u.nextTargetPos ? u.nextTargetPos.copy() : null;
            u.nextTargetPos = u.swapWith.nextTargetPos ? u.swapWith.nextTargetPos.copy() : null;
            u.swapWith.nextTargetPos = tempNextTargetPos;

            u.swapWith.swapWith = null;
            u.swapWith = null;
        

        }
    },
        // swapUnits() {
    //     const m = this.middleY * 2;
    //     for (let u of this.units) {
    //         if (!u.markedToSwap) { continue }
    //         u.lane = u.lane == 1 ? 2 : 1;
    //         u.pos = Vector(u.pos.x, m - u.pos.y, u.pos.z);
    //         u.keepTrackedProperty('pos');
    //         if (u.targetPos) {
    //             u.targetPos = Vector(u.targetPos.x, m - u.targetPos.y, u.targetPos.z);
    //         }
    //         if (u.route) {
    //             u.route = u.route.map(r => Vector(r.x, m - r.y));
    //         }
    //         u.markedToSwap = false;
    //     }
    // },

    
    chooseAction() {
        //this.updateScore();
        this.gameWon = this.checkGoals();
        if (this.gameWon) { return }
        this.units = this.units.filter(u => u.exists && !u.dead && !u.isOut);
        for (let h of this.heroes) {
            h.units = h.units.filter(u => u.exists && !u.dead && !u.isOut);
        }

        this.checkUnitSwaps()
        
        const boulderParams = this.boulderParams;
        const igniteParams = this.igniteParameters;
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
            if(boulder.isIgnited){
                deltaDmg *= igniteParams.damageMultiplier
            
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
            0:78,
            1:60,
            2:40,
            3:22
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