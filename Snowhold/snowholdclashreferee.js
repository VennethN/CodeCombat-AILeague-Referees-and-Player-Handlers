const STEP = 10;
const RED_X0 = 15;
const Y0 = 5;
const Y1 = 80;
const RED_X1 = 40;
const BLUE_X0 = 65;
const BLUE_X1 = 90;
const BLACK_X0 = 45;
const BLACK_X1 = 60;

const SUDDEN_DEATH_START = 90;
const SUDDEN_DEATH_END = 178;
const SUDDEN_DEATH_TOWER_END = 138;
const NUMBER_OF_OBSTACLES = 4

const FRAMES_BEFORE_SPIRIT_SPAWN = 10;

({  
    setUpLevel(){
        this.setupTiles();
        this.setupHeroes();
        this.summonAreas = {
            'red': ['leftBase', 'leftUp', 'leftDown', 'leftMiddle'],
            'blue': ['rightBase', 'rightUp', 'rightDown', 'rightMiddle'],
        };
        this.towerLeftUp = this.world.getThangByID('Red Tower Up');
        this.towerLeftDown = this.world.getThangByID('Red Tower Down');
        this.towerLeftMiddle = this.world.getThangByID('Red Tower Middle');
        this.towerRightUp = this.world.getThangByID('Blue Tower Up');
        this.towerRightDown = this.world.getThangByID('Blue Tower Down');
        this.towerRightMiddle = this.world.getThangByID('Blue Tower Middle');
        
        this.heroTowers = {}
        this.heroTowers['red'] = [this.towerLeftUp,this.towerLeftDown,this.towerLeftMiddle]
        this.heroTowers['blue'] = [this.towerRightUp,this.towerRightDown,this.towerRightMiddle]
        this.obstacles = []
        for (let i = 1;i<=NUMBER_OF_OBSTACLES;i++)
        {
            this.obstacles.push(this.world.getThangByID(`Obstacle ${i}`))
        }
        console.log(this.obstacles)
        
        this.hero2.tower = this.world.getThangByID('blue fake');
        if (this.DEBUG_MODE) {
            this.hero.esper_enemyDebug = (fn) => {
                this.hero2.didTriggerSpawnEvent = true;
                this.hero2.on('spawn', fn);
            };
        }
        for (const rect of Object.values((this.rectangles))) {
            rect.left = rect.x - rect.width / 2;
            rect.right = rect.x + rect.width / 2;
            rect.bottom = rect.y - rect.height / 2;
            rect.top = rect.y + rect.height / 2;
        }
    }, 
    
    setupHeroes() {
        this.heroes = [this.hero, this.hero2];
        this.hero.opponent = this.hero2;
        this.hero2.opponent = this.hero;
        this.hero.enemyColor = 'blue';
        this.hero2.enemyColor = 'red';
        for (const h of this.heroes) {
            h._ref = this;
            h.heroTowerSummonTimer = this.parameters.towerParameters.spawnTime
            h.tower = this.world.getThangByID(`${h.color} fake`);
            h.tower.addActions({name: 'throw'});
            h.tower._performThrow = h.tower.performThrow;
            h.tower.performThrow = () => {
                h.tower._performThrow();
                h.tower.setAction('idle');
            };
            h.hero2 = this.hero2;
            h.tower.performThrownAttack = (target, damageRatio=1, momentum=null) => {
                if (target.type != 'tower' && target.type != 'base' && target.takeDamage) {
                    target.takeDamage(h.tower.throwDamage, h);
                }
            };

            // Object.defineProperty(h, 'action', {
            //     get: function() {
            //         return this.intention || 'idle';
            //     }
            // });
            Object.defineProperty(h, 'availableUnits',{
               get: function() {
                   return this._ref.summonableUnits;
               }
            });
            Object.defineProperty(h, 'y', {
                get: function() {
                    return this.pos.y;
                }
            });
            Object.defineProperty(h, 'x', {
                get: function() {
                    if (this.hero2._aetherAPIOwnMethodsAllowed) {
                        return 100 - this.pos.x;
                    }
                    return this.pos.x;
                }
            });
            h._die = h.die;
            h.die = this.heroDie.bind(this, h);
        }
        
    },

    setupTiles() {
        this.tiles = [];
        this.marks = [];
        for (let x = RED_X0; x < RED_X1; x += STEP) {
            for (let y = Y0; y < Y1; y += STEP) {
                this.tiles.push(this.instabuild('tile-red', x, y, 'tile-red'));
            }
        }
        for (let x = BLACK_X0; x < BLACK_X1; x += STEP) {
            for (let y of [15, 40, 65]) {
                this.tiles.push(this.instabuild('tile-black', x, y, 'tile-black'));
            }
        }
        for (let x = BLUE_X0; x < BLUE_X1; x += STEP) {
            for (let y = Y0; y < Y1; y += STEP) {
                this.tiles.push(this.instabuild('tile-blue', x, y, 'tile-blue'));
            }
        }
        
        for (const p of Object.values(this.points)) {
            const mark = this.instabuild(p.x < 40 ? 'red-mark' : 'blue-mark', p.x, p.y);
            this.marks.push(mark);
        }
        this.tiles.forEach(t => {
            t.alpha = 0.4;
            t.keepTrackedProperty('alpha');
        });
    },
    
    getPointCoordinates(symb, hero) {
        const point = this.points[symb];
        return point;
    },
    
    rectContainsPoint(rect, x, y) {
        return rect.left <= x && x <= rect.right && y <= rect.top && y >= rect.bottom;
    },
    
    canSummon(hero, x, y) {
        const p = new Vector(x, y);
        const rects = this.summonAreas[hero.color];
        for (const rectKey of rects) {
            if (this.rectContainsPoint(this.rectangles[rectKey], p.x, p.y)) {
                return true;
            }
        }
        return false;
    },

    onFirstFrame(){
        for (const hero of this.heroes) {
            hero.health = this.parameters.baseParameters.maxHealth;
            hero.maxHealth = hero.health;
            hero.keepTrackedProperty('health');
            hero.keepTrackedProperty('maxHealth');
        }
        for (const th of this.world.thangs) {
            if (th.health && th.pos.y < 0) {
                th.setExists(false);
            }
        }
        const towerParams = this.parameters.towerParameters;
        this.towers = [];
        for (const t of this.world.thangs) {
            if (t.type == 'tower') {
                t.attackDamage = towerParams.attackDamage;
                t.actions.attack.cooldown = towerParams.attackCooldown;
                t.attackRange = towerParams.attackRange;
                t.maxHealth = towerParams.maxHealth;
                t.health = towerParams.maxHealth;
                t.keepTrackedProperty('health');
                t.keepTrackedProperty('maxHealth');
                t.keepTrackedProperty('attackDamage');
                t.keepTrackedProperty('attackRange');
                //t.on('defeat', this.onTowerDeath.bind(this));
                this.towers.push(t);
                t.color = t.team == 'humans' ? 'red' : 'blue';
                t.isMovable = false;
                t.updateRegistration();
                t._performAttack = t.performAttack;
                t.performAttack = (targetOrPos) => {
                    const res = t._performAttack(targetOrPos);
                    t.lastMissileShot.pos.z = 6;
                    t.lastMissileShot.targetPos.z = 6;
                    t.keepTrackedProperty('pos');
                    return res;
                }
                t.hero2 = this.hero2;
                Object.defineProperty(t, 'y', {
                    get: function() {
                        return this.pos.y;
                    }
                });
                Object.defineProperty(t, 'x', {
                    get: function() {
                        if (this.hero2._aetherAPIOwnMethodsAllowed) {
                            return 100 - this.pos.x;
                        }
                        return this.pos.x;
                    }
                });
            }
        }
        this.suddenDeathRate = this.world.dt * this.hero.health / (SUDDEN_DEATH_END - SUDDEN_DEATH_START);
        this.suddenDeathTowerRate = this.world.dt * towerParams.maxHealth / (SUDDEN_DEATH_TOWER_END - SUDDEN_DEATH_START);
        this.setTimeout(() => {
            let spiritRed = this.hero.heroSpawnSpirit();
            let spiritBlue = this.hero2.heroSpawnSpirit();
        }, this.world.dt*FRAMES_BEFORE_SPIRIT_SPAWN)
        // }, this.world.dt);
        // this.setTimeout(() => {
        //     const ai = this.world.getSystem('AI');
        //     ai._onObstaclesChanged = ai.onObstaclesChanged
        //     ai.onObstaclesChanged = () => {}
        //     for (let th of this.world.thangs) {
        //         if (th.id.includes('Obstacle') && !th.stateless) {
        //             th.setExists(false);
        //         }
        //     }
        // }, 0.1);
    },
    
    onTowerDeath(e) {
        this.world.getSystem('AI').onObstaclesChanged();
        const tower = e.target;
        if (tower == this.towerRightUp) {
            this.recolorTiles(this.rectangles.rightUp, 'purple');
            this.recolorTiles(this.rectangles.bridgeUp, this.towerLeftUp.dead ? 'purple' : 'red');
            this.summonAreas.red.push('bridgeUp');
            this.summonAreas.red.push('rightUp');
        }
        if (tower == this.towerRightDown) {
            this.recolorTiles(this.rectangles.rightDown, 'purple');
            this.recolorTiles(this.rectangles.bridgeDown, this.towerLeftDown.dead ? 'purple' : 'red');
            this.summonAreas.red.push('bridgeDown');
            this.summonAreas.red.push('rightDown');
        }
        if (tower == this.towerRightMiddle) {
            this.recolorTiles(this.rectangles.rightMiddle, 'purple');
            this.recolorTiles(this.rectangles.bridgeMiddle, this.towerLeftDown.dead ? 'purple' : 'red');
            this.summonAreas.red.push('bridgeMiddle');
            this.summonAreas.red.push('rightMiddle');
        }
        if (tower == this.towerLeftUp) {
            this.recolorTiles(this.rectangles.leftUp, 'purple');
            this.recolorTiles(this.rectangles.bridgeUp, this.towerRightUp.dead ? 'purple' : 'blue');
            this.summonAreas.blue.push('bridgeUp');
            this.summonAreas.blue.push('leftUp');
        }
        if (tower == this.towerLeftDown) {
            this.recolorTiles(this.rectangles.leftDown, 'purple');
            this.recolorTiles(this.rectangles.bridgeDown, this.towerRightDown.dead ? 'purple' : 'blue');
            this.summonAreas.blue.push('bridgeDown');
            this.summonAreas.blue.push('leftDown');
        }
        if (tower == this.towerLeftMiddle) {
            this.recolorTiles(this.rectangles.leftMiddle, 'purple');
            this.recolorTiles(this.rectangles.bridgeMiddle, this.towerRightUp.dead ? 'purple' : 'blue');
            this.summonAreas.blue.push('bridgeMiddle');
            this.summonAreas.blue.push('leftMiddle');
        }
        // if (!this.towerRightUpAndRightDownDead && this.towerRightUp.dead && this.towerRightDown.dead) {
        //     this.towerRightUpAndRightDownDead = true;
        //     this.recolorTiles(this.rectangles.rightMiddle, 'purple');
        //     this.summonAreas.red.push('rightMiddle');
        // }
        // if (!this.towerLeftUpAndLeftDownDead && this.towerLeftUp.dead && this.towerLeftDown.dead) {
        //     this.towerLeftUpAndLeftDownDead = true;
        //     this.recolorTiles(this.rectangles.leftMiddle, 'purple');
        //     this.summonAreas.blue.push('leftMiddle');
        // }
    },
    
    recolorTiles(rect, toColor) {
        const newTiles = [];
        for (let tile of this.tiles) {
            if (rect.containsPoint(tile.pos)) {
                tile.setExists(false);
                newTiles.push(this.instabuild(`tile-${toColor}`, tile.pos.x, tile.pos.y));
            }
            for (let m of this.marks) {
                if (rect.containsPoint(m.pos)) {
                    m.setExists(false);
                    this.instabuild(`${toColor}-mark`, m.pos.x, m.pos.y);
                }
            }
        }
        this.tiles = [...this.tiles.filter(t => t.exists), ...newTiles];
    },

    suddenDeath() {
        this.suddenDeathInAction = true;
        for (const hero of [this.hero, this.hero2]) {
            let hasTower = (this.towers.filter(t => t.color == hero.color)).length >= 0
            for (const tower of this.towers.filter(t => t.color == hero.color)) {
                tower.addEffect(
                    {name: 'fire',
                     duration: 900, 
                     reverts: false,
                     addend: -this.suddenDeathTowerRate ,
                     targetProperty: 'health', 
                     repeatsEvery: this.world.dt}
                );
            }
            hero.addEffect(
                {name: 'fire',
                 duration: 900, 
                 reverts: false,
                 addend: -this.suddenDeathRate, 
                 targetProperty: 'health', 
                 repeatsEvery: this.world.dt}
            );
        }
    },
    suddenDeathTower() {
        this.towerSuddenDeath = true;
        for (const hero of [this.hero, this.hero2]) {
            for (const tower of this.towers.filter(t => t.color == hero.color)) {
                tower.effectts = [];
                tower.effectNames = [];
                tower.updateRegistration()
                tower.addEffect(
                    {name: 'fire',
                     duration: 900, 
                     reverts: false,
                     addend: -this.suddenDeathTowerRate * 5 ,
                     targetProperty: 'health', 
                     repeatsEvery: this.world.dt}
                );
            }
        }
    },
    
    clearEffects(h) {
        h.effects = [];
        h.effectNames = [];
        h.keepTrackedProperty('effectNames');
        h.updateRegistration();
    },

    clearUnits(h) {
        for (const un of this.world.thangs.filter(t => t.exists && t.die && !t.dead && t.team == h.team)) {
            un.die();
        }
    },

    resolveTie()
    {
        if(this.hero.health > this.hero2.health)
        {
            this.winGame(this.hero);
            return
        }else if(this.hero.health < this.hero2.health)
        {
            this.winGame(this.hero2);
            return
        }
        const flip = this.world.rand.randf() > 0.5;
        if(flip) 
        {
            this.winGame(this.hero);
            return
        }else{
            this.winGame(this.hero2);
            return
        }
    },

    winGame(hero) {
        this.world.setGoalState(`${hero.color}-win`, 'success');
        this.world.setGoalState(`${hero.enemyColor}-win`, 'failure');
        this.gameEnd = true;
        if (hero.color === 'blue') {
            this.blueWin = true;
            this.clearEffects(this.hero2);
            this.clearUnits(this.hero);
            this.hero.health = 0;
            this.hero.realDead = true;
            this.hero.keepTrackedProperty('health');
        }
        if (hero.color === 'red') {
            this.redWin = true;
            this.clearEffects(this.hero);
            this.clearUnits(this.hero2);
            this.hero2.health = 0;
            this.hero2.realDead = true;
            this.hero2.keepTrackedProperty('health');
        }
    },
    
    heroDie(h) {
        if (h.realDead) {
            return h._die();
        }
    },
    rectContainsPoint(rect, x, y) {
        return (rect.x - rect.width / 2) <= x && x <= (rect.x + rect.width / 2) && y <= (rect.y + rect.height / 2) && y >= (rect.y - rect.height / 2);
    },
    canMoveTo(x, y) {
        const p = new Vector(x, y);
        for (const tile of this.obstacles) {
            if (this.rectContainsPoint(tile.getShape(), p.x, p.y)) {
                return false;
            }
        }
        return true;
    },

    chooseAction() {
        if (this.gameEnd) {
            if (this.blueWin) {
                this.hero2.health = Math.max(1, this.hero2.health);
                this.hero2.keepTrackedProperty('health');
                this.hero2.setAction('idle');
            }
            if (this.redWin) {
                this.hero.health = Math.max(1, this.hero.health);
                this.hero.keepTrackedProperty('health');
                this.hero.setAction('idle');
            }
            return; 
        };
        if (this.world.age >= this.parameters.baseParameters.gameMaxTime && !this.gameEnd)
        {
            this.resolveTie();
            return;
        }
        if (this.hero.health <= 0 && this.hero2.health <= 0) {
            const flip = this.world.rand.randf() > 0.5;
            if (flip) {
                this.hero.health = 1;
                this.hero.keepTrackedProperty('health');
            }
            else {
                this.hero2.health = 1;
                this.hero2.keepTrackedProperty('health');
            }
        }
        if (this.hero.health <= 0) {
            this.winGame(this.hero2);
        }
        else if (this.hero2.health <= 0) {
            this.winGame(this.hero);
        }
        if (!this.suddenDeathInAction && this.world.age >= SUDDEN_DEATH_START) {
            this.suddenDeath();
        }
        if (!this.towerSuddenDeath && this.world.age >= SUDDEN_DEATH_TOWER_END){
            this.suddenDeathTower();
        }
    }
});