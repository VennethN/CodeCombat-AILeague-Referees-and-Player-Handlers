const RED = 'red';
const BLUE = 'blue';
const COLORS_PAIRS = {
    [RED]: BLUE,
    [BLUE]: RED
};

const X0 = 10;
const Y0 = 10;
const X_STEP = 10;
const Y_STEP = 10;
const COLUMNS = 12;
const ROWS = 10;
const COLS = COLUMNS;
const X1 = X0 + X_STEP * COLUMNS;
const Y1 = Y0 + Y_STEP * ROWS;
const LINE_OFFSET = 0.5;
const BOOST_COLLECTRANGESQUARED = this.parameters.game.boostCollectRange * this.parameters.game.boostCollectRange;

const WORKER_NAME = 'robot';
const WORKER_TYPE = `worker`;
const CONSTRUCTION_TYPE = 'construction';

const WHEAT = 'wheat';
const GARDEN = 'garden';
const PATCH = 'patch';

const ROCK = 'rock';
const TREE = 'tree';
const WELL = 'well';

//BOOSTS
const FIRE_BOOST = 'fire';
// const WATER_BOOST = 'water';
const EARTH_BOOST = 'earth';

const RIVER = 'river';
const DEFAULT_RIVER_FACTOR = 2;

const FARM_TYPES = [WHEAT, GARDEN, PATCH];
const OBSTACLE_TYPES = [ROCK, TREE, WELL];

const COLOR_CODES = {
    [RED]: '#ff0000',
    [BLUE]: '#0000ff',
    null: '#000000'
};

const LABEL_OFFSET = {
    x: -0.5,
    y: 2
};

const COLUMNS_ARRAY = "ABCDEFGHIJKL";
const OWN_COLUMNS = 3;
const ALLOWED_COLUMS = COLUMNS - OWN_COLUMNS;


const MIST_ALPHA = 0.3;

const RAIN_ALPHA = 0.6;
const RAINDROP_ALPHA = 0.6;
const RAINDROP_SPAWNMIN = 2;
const RAINDROP_SPAWNMAX = 5;
const RAINDROP_LIFESPAN = 0.5;

const RAIN_HEIGHT = 20;

({
    getColumnByX(x){ //gets column by X value
        for(let i =0;i<COLUMNS;i++){
            if(x < X_STEP * (i+1) + X0){
                return i;
            }
        }
    },
    
    getRowByY(y){
        for(let i=0;i<ROWS;i++){
            if(y <  Y_STEP  * (i+1) +  Y0){
                return  i;
            }
            
        }
    },
    setUpLevel() {
        this.heroes = [this.hero, this.hero1];
        this.heroesByColor = {
            [RED]: this.hero,
            [BLUE]: this.hero1
        };
        this.hero.opponent = this.hero1;
        this.hero1.opponent = this.hero;
        this.heroRed = this.hero;
        this.heroBlue = this.hero1;
        this.mists = [];
        for (let i = 0; i < ROWS; i++) {
            this.mists.push(null);
        }
        this.rains = [];
        for (let i = 0; i < COLUMNS; i++){
            this.rains.push(null);
        }
        this.addingMists = [];
        this.addingRains = [];
        Object.keys(this.heroesByColor).forEach((color) => {
            const hero = this.heroesByColor[color];
            hero._ref = this;
            hero.color = color;
            hero.worker = this.getByID(`${color}-${WORKER_NAME}`);
            hero.worker.maxSpeed = this.parameters.game.workerSpeed;
            hero.worker.type = "worker";
            hero.teamPower = 0;
            hero.score = 0;
            
        });

        this.buildField();
        this.buildEdgeRivers();
        this.buildFences();
        this.buildLetters();
        this.setupObstacles();
    },

    buildField() {
        this.field = [];
        for (let i = 0; i < ROWS; i++) {
            const row = [];
            for (let j = 0; j < COLUMNS; j++) {
                row.push(null);
            }
            this.field.push(row);
        }
        
        this.boostsField = [];
        for (let i = 0; i < ROWS; i++) {
            const row = [];
            for (let j = 0; j < COLUMNS; j++) {
                row.push(null);
            }
            this.boostsField.push(row);
        }
        // "draw" the field with "line" assets
        // First, draw horizontal lines
        for (let i = 0; i <= ROWS; i++) {
            this.instabuild('hline', (X0 + X1) / 2 + LINE_OFFSET, Y0 + Y_STEP * i);
        }
        // Then, draw vertical lines
        for (let i = 0; i <= COLUMNS; i++) {
            this.instabuild('vline', X0 + X_STEP * i, (Y0 + Y1) / 2 - LINE_OFFSET);
        }
        // put ground patches
        for (let i = 0; i < ROWS; i++) {
            for (let j = 0; j < COLUMNS; j++) {
                const { x, y } = this.getCellCenter(i, j);
                this.instabuild('ground', x, y + 0.5);
            }
        }

    },

    buildFences() {
        // build fences after OWN_COLUMNS columns vertically
        let xRed = X0 + X_STEP * OWN_COLUMNS;
        let xBlue = X1 - X_STEP * OWN_COLUMNS;
        for (let i = 0; i < ROWS; i++) {
            let y = Y0 + Y_STEP * (i + 0.5) + 1;
            this.instabuild(`${RED}-fence`, xRed, y);
            this.instabuild(`${BLUE}-fence`, xBlue, y);
        }
    },

    buildEdgeRivers() {
        // build rivers on the edges
        const RX_OFFSET = 5;
        const RY_OFFSET = 5;

        for (let j = 0; j < COLUMNS; j++) {
            let pos = this.getCellCenter(-1, j);
            this.instabuild(`river-x`, pos.x - X_STEP / 2 + RX_OFFSET, pos.y - Y_STEP / 2 + RY_OFFSET);
            // and river-hconnector to the right
            if (j < COLUMNS - 1) {
                this.instabuild(`river-hconnect`, pos.x + X_STEP / 2, pos.y - Y_STEP / 2 + RY_OFFSET);
            }
            pos = this.getCellCenter(ROWS, j);
            this.instabuild(`river-x`, pos.x - X_STEP / 2 + RX_OFFSET, pos.y + Y_STEP / 2 - RY_OFFSET);
            // and river-hconnector to the right
            if (j < COLUMNS - 1) {
                this.instabuild(`river-hconnect`, pos.x + X_STEP / 2, pos.y + Y_STEP / 2 - RY_OFFSET);
            }
        }
    },

    buildLetters() {
        // build letters on the edges
        const LX_OFFSET = 3;
        const LY_OFFSET = 5;
        for (let i = 0; i < ROWS; i++) {
            let label = this.instabuild(`label-letter`, X0 - LX_OFFSET, Y0 + Y_STEP * (i + 0.5));
            label.sayWithDuration(900, i);
            label = this.instabuild(`label-letter`, X1 + LX_OFFSET, Y0 + Y_STEP * (i + 0.5));
            label.sayWithDuration(900, i);
        }
        // build numbers on the edges bottom and top
        for (let j = 0; j < COLUMNS; j++) {
            // letter is A to Z, so we need to add 65 to get the right letter
            let letter = String.fromCharCode(j + 65);
            let label = this.instabuild(`label-letter`, X0 + X_STEP * (j + 0.5), Y0 - LY_OFFSET);
            label.sayWithDuration(900, letter);
            label = this.instabuild(`label-letter`, X0 + X_STEP * (j + 0.5), Y1 + LY_OFFSET);
            label.sayWithDuration(900, letter);
        }
    },

    buildAsset_boost(boostType, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        return this.instabuild(`${boostType}-boost`, x, y);
    },

    onFirstFrame() {
        this.setInterval(this.showIncome.bind(this), 1);
        this.setInterval(this.createBoost.bind(this), this.parameters.game.boostSpawnInterval);
    },

    getCellCenter(row, col) {
        const x = X0 + X_STEP * col + X_STEP / 2;
        const y = Y0 + Y_STEP * row + Y_STEP / 2;
        return { x, y };
    },
    

    getBuildTime(what) {
        return this.parameters.build[what].cost || 1;
    },

    getClearTime(fieldObject) {
        return this.parameters.build[fieldObject.type].clearCost || 1;
    },

    startBuilding(who, what, row, col) {
        const { x, y } = this.getCellCenter(row, col);

        this.constructions = this.constructions || [];
        let construct = this.instabuild(`${CONSTRUCTION_TYPE}-${who.color}`, x, y);
        let boostFactor = 1;
        if(who.worker.currentBoost == EARTH_BOOST){
            boostFactor = this.parameters.boosts.earth.buildTimeFactor;
            this.clearBoosts(who.worker); //TODO: refactor this so its cleared on the next frame instead to sync with the construction (?)
        }
        const cell = {
            future: what,
            when: this.world.age + (this.getBuildTime(what) * boostFactor),
            type: CONSTRUCTION_TYPE,
            row,
            col,
            owner: who,
            color: null,
            assets: [construct],
            isFull: false
        };

        this.setupUserAPI(cell);
        this.clearCell(row, col);
        this.field[row][col] = cell;
        this.constructions.push(cell);

    },

    clearCell(row, col) {
        let cell = this.field[row][col];
        if (cell) {
            cell.assets.forEach(asset => asset.setExists(false));
            if (cell.label) {
                cell.label.setExists(false);
            }
        }
    },

    startClearing(who, row, col, what) {
        const { x, y } = this.getCellCenter(row, col);
        this.constructions = this.constructions || [];
        let construct = this.instabuild(`${CONSTRUCTION_TYPE}-${who.color}`, x, y);
        const cell = {
            future: null,
            when: this.world.age + this.getClearTime(what),
            type: CONSTRUCTION_TYPE,
            row,
            col,
            owner: who,
            color: null,
            assets: [construct],
            isFull: false
        };
        this.setupUserAPI(cell);
        this.clearCell(row, col);
        this.field[row][col] = cell;
        this.constructions.push(cell);
    },
    
    clearBoosts(worker){
        worker.boostDuration = 0;
        worker.boostAsset.setExists(false);
        if(worker.currentBoost == FIRE_BOOST){
            worker.effects = worker.effects.filter(e => e.name != 'fireBoosted');
        }
        worker.currentBoost = null;
    },

    createBoost(mirroredBoost=null) {
        const boostLifespan = this.parameters.game.boostSpawnLifespan;
        let randBoost = this.randRoundNumber(0, Object.keys(this.parameters.boosts).length);
        let currentBoostType = Object.keys(this.parameters.boosts)[randBoost];
        let randRow = this.randRoundNumber(0, ROWS);
        let randCol = this.randRoundNumber(0, COLUMNS);
        let mirrorRow = ROWS - 1 - randRow;
        let mirrorCol = COLUMNS - 1 - randCol;
        while(this.boostsField[randRow][randCol] !== null || this.boostsField[mirrorRow][mirrorCol] !== null ){
            randRow = this.randRoundNumber(0, ROWS);
            randCol = this.randRoundNumber(0, COLUMNS);
            mirrorRow = ROWS - 1 - randRow;
            mirrorCol = COLUMNS - 1 - randCol;
        }
        let boost = this.buildAsset_boost(currentBoostType, randRow, randCol);
        boost.row = randRow;
        boost.col = randCol;
        boost.type = currentBoostType;
        boost.lifespan = boostLifespan;
        boost.isBoost = true;
        boost.caught = false;
        this.setupBoostAPI(boost);
        this.boostsField[boost.row][boost.col] = boost;
        this.createMirorredBoost(boost);
    },
    
    createMirorredBoost(mirroredBoost) {
        let mirrorRow = ROWS - 1 - mirroredBoost.row;
        let mirrorCol = COLUMNS - 1 - mirroredBoost.col;
        let boost = this.buildAsset_boost(mirroredBoost.type, mirrorRow, mirrorCol);
        boost.row = mirrorRow;
        boost.col = mirrorCol;
        boost.type = mirroredBoost.type;
        boost.lifespan = mirroredBoost.lifespan;
        boost.isBoost = true;
        boost.caught = false;
        this.setupBoostAPI(boost);
        this.boostsField[boost.row][boost.col] = boost;
    },

    setupBoostAPI(boost){
        const self = this;
        boost.user = {};
        Object.defineProperty(boost.user, 'row', {
            get() {
                let row = boost.row;
                if (self.heroBlue._aetherAPIOwnMethodsAllowed) {
                    // it means that the blue hero is asking for the location and we need to mirror row and col
                    row = ROWS - 1 - row;
                }
                return row;
            }
        });
        Object.defineProperty(boost.user, 'col', {
            get() {
                let col = boost.col;
                if (self.heroBlue._aetherAPIOwnMethodsAllowed) {
                    // it means that the blue hero is asking for the location and we need to mirror row and col
                    col = COLS - 1 - col;
                }
                return col;
            }
        });
        // place is the representation of the cell in the world as "A1", "B2", "C3" etc
        Object.defineProperty(boost.user, 'place', {
            get() {
                let row = boost.row;
                let col = boost.col;
                if (self.heroBlue._aetherAPIOwnMethodsAllowed) {
                    // it means that the blue hero is asking for the location and we need to mirror row and col
                    row = ROWS - 1 - row;
                    col = COLS - 1 - col;
                }
                return `${String.fromCharCode(65 + col)}${row}`;
            }
        });
        Object.defineProperty(boost.user, 'type', {
            get() {
                return boost.type;
            }
        });
        Object.defineProperty(boost.user, `lifespan`, {
            get() {
                return boost.lifespan;
            }
        });
    },
    checkBoosts() {
        const workers = this.world.thangs.filter((th) => th.exists && th.type == WORKER_TYPE);
        const boosts = this.world.thangs.filter((th) => th.exists && th.isBoost && !th.caught);
        //checks duration
        for (let worker of workers){
            if(!worker.currentBoost || worker.boostDuration <= 0){continue;}
            worker.boostDuration -= this.world.dt;
            if(worker.boostDuration <= 0){
                this.clearBoosts(worker);
            }
        }
        //checks boosts in range
        for (let boost of boosts) {
            let worker = boost.findNearest(workers);
            if (!worker) { continue; }
            if (worker.distanceSquared(boost) <= BOOST_COLLECTRANGESQUARED) {
                boost.caught = true;
                if(worker.currentBoost){
                    this.clearBoosts(worker);
                }
                this.boostWorker(worker, boost.type);
                boost.setExists(false);
            }
        }
        for (let rowCB = 0;rowCB < this.boostsField.length; rowCB++)
        {
            for(let colCB =0;colCB < this.boostsField[rowCB].length; colCB++)
            {
                let itemAtPlace = this.boostsField[rowCB][colCB];
                if(itemAtPlace === null || itemAtPlace.exists || itemAtPlace.lifespan > 0){continue;}
                this.boostsField[rowCB][colCB] = null;
            }
        }
    },

    boostWorker(worker, boostType) {
        const BOOST_Z_OFFSET = 8;
        const BOOST_SPEED_OFFSET = 5;
        let boostParam = this.parameters.boosts[boostType];
        let boostAsset = this.instabuild(`${boostType}_boostEffect`, worker.pos.x, worker.pos.y, BOOST_Z_OFFSET);
        boostAsset.clingTo(worker);
        boostAsset.followOffset = new Vector(0, 0, BOOST_Z_OFFSET);
        worker.boostAsset = boostAsset;
        worker.boostDuration = boostParam.duration;
        worker.currentBoost = boostType;
        if(boostType == "fire"){
            worker.effects = worker.effects.filter(e => e.name != 'fireBoosted');
            worker.addEffect({name: 'speedBoost', duration: boostParam.duration, revertsProportionally: true, setTo: true, targetProperty: 'fireBoosted'});
            worker.addEffect({name: 'speedBoost', duration: boostParam.duration, revertsProportionally: true, factor: boostParam.speedFactor, targetProperty: 'maxSpeed'});
        }
    },


    whatAt(row, col) {
        if (row == null || col == null) {
            return null;
        }
        // eslint-disable-next-line no-undef
        if (!_.isNumber(row) || !_.isNumber(col)) {
            return null;
        }
        if (row < 0 || row >= ROWS || col < 0 || col >= COLUMNS) {
            return null;
        }
        if (this.field[row][col] !== undefined && this.field[row][col] !== null && this.field[row][col].user == undefined){
            return null;
        }
        return this.field[row][col] && this.field[row][col].user;
    },

    // Check if player can build at the given cell
    // Red player can build only on the left side of the field
    // Blue player can build only on the right side of the field
    allowedZone(who, row, col) {
        if (who.color === RED) {
            return col < ALLOWED_COLUMS;
        }
        else {
            return col >= OWN_COLUMNS;
        }
    },

    addMist(who, type, row) {
        this.addingMists = this.addingMists || [];
        let parameters = this.parameters.mists[type];
        this.addingMists.push({ type, row, duration: parameters.duration });
    },
    
    addRain(who, col){
        this.addingRains = this.addingRains || [];
        let parameters = this.parameters.rain;
        this.addingRains.push({ col, duration: parameters.duration });
    },

    update() {
        if (this.checkWinner()) {
            return;
        }
        this.checkConstructions();
        this.checkRivers();
        this.checkMists();
        this.checkRains();
        this.checkBoosts();
        this.processIncomes();

    },

    winGame(color) {
        this.world.setGoalState(`${color}-win`, 'success');
        this.world.setGoalState(`${COLORS_PAIRS[color]}-win`, 'failure');
    },

    checkWinner() {
        if (this.gameOver) {
            return true;
        }
        if (this.world.age < this.parameters.game.duration) {
            return false;
        }
        this.gameOver = true;
        if (this.heroesByColor[RED].score > this.heroesByColor[BLUE].score) {
            this.winGame(RED);
        }
        else if (this.heroesByColor[RED].score < this.heroesByColor[BLUE].score) {
            this.winGame(BLUE);
        }
        else {
            // flip a coin
            const winner = this.world.rand.randf() > 0.5 ? RED : BLUE;
            this.winGame(winner);
        }
        return true;
    },
    
    setupObstacles(){
        let obstacleFieldRef = this.parameters.field.obstacles;
        let safeZoneObstacleAmount = obstacleFieldRef.safeZoneObstacleAmount;
        let neutralZoneObstacleAmount = obstacleFieldRef.neutralZoneObstacleAmount;
        let remainingObstacles = [];
        for (const [obstacleType, obstacleAmount] of Object.entries(obstacleFieldRef.obstacleTypes)) {
            for(let i = 0; i < obstacleAmount; i++){
                remainingObstacles.push(obstacleType);
            }
        }
        // Shuffle the array several times
        for (let i = 0; i < 10; i++) {
            remainingObstacles = this.world.rand.shuffle(remainingObstacles);
        }
        for(let i = 0; i < safeZoneObstacleAmount; i++){
            let randRow = this.world.rand.rand(ROWS);
            let randCol = this.world.rand.rand(OWN_COLUMNS);
            while(this.field[randRow][randCol] !== null){
                randRow = this.world.rand.rand(ROWS);
                randCol = this.world.rand.rand(OWN_COLUMNS);
            }
            let nextObstacle = remainingObstacles.pop();
            this.buildObstacle(nextObstacle, randRow, randCol);
        }
        for(let j =0; j < neutralZoneObstacleAmount; j++){
            let randRow = this.world.rand.rand(ROWS);
            let randCol = this.world.rand.rand2(OWN_COLUMNS, COLUMNS-OWN_COLUMNS);
            while(this.field[randRow][randCol] !== null) {
                randRow = this.world.rand.rand(ROWS);
                randCol = this.world.rand.rand2(OWN_COLUMNS, COLUMNS-OWN_COLUMNS);
            }
            let nextObstacle = remainingObstacles.pop();
            this.buildObstacle(nextObstacle, randRow, randCol);
        }
    },



    buildObstacle(what, row, col){
        let assets = this[`buildAsset_${what}`](row, col);
        let cell = {
            type: what,
            row: row,
            col: col,
            owner: null,
            color: null,
            assets,
            isFull: false,
        };
        this.setupUserAPI(cell);
        this.field[row][col] = cell;

        //mirrors the obstacle
        let mirrorRow = ROWS - 1 - row;
        let mirrorCol = COLUMNS - 1 - col;
        row = mirrorRow;
        col = mirrorCol;

        let assets2 = this[`buildAsset_${what}`](row, col);
        let cell2 = {
            type: what,
            row: row,
            col: col,
            owner: null,
            color: null,
            assets2,
            isFull: false,
        };
        this.setupUserAPI(cell2);
        this.field[row][col] = cell2;
    },

    // for each thing on the field what is in FARM_TYPES we set income based on different factors and neighbours
    processIncomes() {
        const parameters = this.parameters.game;
        this.field.forEach((row, i) => {
            let mist = this.mists[i];
            
            row.forEach((cell, j) => {
                let rain = this.rains[j];
                let mistOn = mist && mist.assets[j];
                if (!cell || !FARM_TYPES.includes(cell.type)) {
                    return;
                }
                const { owner, row, col } = cell;
                const neighbors = this.getNeighbors(row, col);
                let params = this.parameters.build[cell.type];
                let income = params.income || 10;
                let riverNear = false;
                let obstacleParams = this.parameters.obstacles;
                neighbors.forEach((n) => {
                    // if neigbour is an empty cell, increase income in emptyFactor times
                    if (!n || (OBSTACLE_TYPES.includes(n.type) && obstacleParams[n.type].obstacleFactorType == "emptyFactor")) {
                        income *= params.emptyFactor || 1;
                    }
                    // if neighbor is a farm of the same type, increase income in sameTypeFactor times
                    else if ((FARM_TYPES.includes(n.type) && n.type === cell.type) || (OBSTACLE_TYPES.includes(n.type) && obstacleParams[n.type].obstacleFactorType == "sameTypeFactor")) {
                        income *= params.sameTypeFactor || 1;
                    }
                    // if neighbor is a farm of the different type, increase income in differentTypeFactor times
                    else if ((FARM_TYPES.includes(n.type) && n.type !== cell.type) || (OBSTACLE_TYPES.includes(n.type) && obstacleParams[n.type].obstacleFactorType == "differentTypeFactor")) {
                        income *= params.differentTypeFactor || 1;
                    }
                    // if neighbor is a river, increase income in riverFactor times
                    // can be apply only once per cell, so several rivers will not increase income
                    else if (!riverNear && ((n.type === RIVER && n.isFull) || (OBSTACLE_TYPES.includes(n.type) && obstacleParams[n.type].obstacleFactorType == "riverFactor"))) {
                        income *= params.riverFactor || DEFAULT_RIVER_FACTOR;
                        riverNear = true;
                    }


                });
                let baseIncome = income;
                cell.baseIncome = baseIncome;
                if (mistOn) {
                    if (mist.type == 'poison') {
                        income *= riverNear ? this.parameters.build.river.poisonMistRecoverFactor : (parameters.mistPoisonFactor !== undefined ? parameters.mistPoisonFactor : 1);
                    }
                    else if (mist.type == cell.type) {
                        income *= parameters.mistSameTypeFactor || 1;
                    }
                    else if(mist.type != `poison`){
                        income *= parameters.mistDifferentTypeFactor || 1;
                    }
                }else if(rain && !riverNear){
                    let futIncome = (params.riverFactor || DEFAULT_RIVER_FACTOR) * income;
                    let surplusIncome = futIncome - income;
                    income += surplusIncome * this.parameters.rain.riverBonusFactor;
                }
                cell.income = income;

                // Add incomes to owners
                owner.score += income * this.world.dt;
            });
        });
        // for both heroes need to update their power
        this.heroes.forEach((hero) => {
            hero.teamPower = Math.floor(hero.score);
            hero.keepTrackedProperty('teamPower');
        });
    },

    showIncome() {
        this.field.forEach((row) => {
            row.forEach((cell) => {
                if (cell && (cell.income || cell.income == 0)) {
                    cell.label.showText(cell.income.toFixed(1), { color: COLOR_CODES[cell.owner.color] });
                }
            });
        });
    },


    checkConstructions() {
        if (!this.constructions) {
            return;
        }
        this.constructions.forEach((construct) => {
            if (construct.when > this.world.age) {
                return;
            }
            construct.assets.forEach(asset => asset.setExists(false));
            if (!construct.future || construct.future == null) {
                this.field[construct.row][construct.col] = null;
                construct.toClear = true;
                return;
            }
            const { x, y } = this.getCellCenter(construct.row, construct.col);
            let assets = this[`buildAsset_${construct.future}`](construct.owner, construct.row, construct.col);

            const label = this.instabuild('label', x + LABEL_OFFSET.x, y + LABEL_OFFSET.y);

            const cell = {
                type: construct.future,
                row: construct.row,
                col: construct.col,
                owner: construct.owner,
                color: null,
                assets,
                isFull: false,
                label,
            };
            if (FARM_TYPES.includes(cell.type)) {
                cell.income = 0;
                cell.color = construct.owner.color;
            }
            this.setupUserAPI(cell);

            
            this.field[construct.row][construct.col] = cell;
            construct.toClear = true;
        });
        this.constructions = this.constructions.filter((c) => !c.toClear);

    },

    setupUserAPI(cell) {
        const self = this;
        cell.user = {};
        Object.defineProperty(cell.user, 'row', {
            get() {
                let row = cell.row;
                if (self.heroBlue._aetherAPIOwnMethodsAllowed) {
                    // it means that the blue hero is asking for the location and we need to mirror row and col
                    row = ROWS - 1 - row;
                }
                return row;
            }
        });
        Object.defineProperty(cell.user, 'col', {
            get() {
                let col = cell.col;
                if (self.heroBlue._aetherAPIOwnMethodsAllowed) {
                    // it means that the blue hero is asking for the location and we need to mirror row and col
                    col = COLS - 1 - col;
                }
                return col;
            }
        });
        // place is the representation of the cell in the world as "A1", "B2", "C3" etc
        Object.defineProperty(cell.user, 'place', {
            get() {
                let row = cell.row;
                let col = cell.col;
                if (self.heroBlue._aetherAPIOwnMethodsAllowed) {
                    // it means that the blue hero is asking for the location and we need to mirror row and col
                    row = ROWS - 1 - row;
                    col = COLS - 1 - col;
                }
                return `${String.fromCharCode(65 + col)}${row}`;
            }
        });
        Object.defineProperty(cell.user, 'type', {
            get() {
                return cell.type;
            }
        });
        Object.defineProperty(cell.user, 'color', {
            get() {
                return cell.color;
            }
        });
        Object.defineProperty(cell.user, 'income', {
            get() {
                return cell.income;
            }
        });
        Object.defineProperty(cell.user, 'isFull', {
            get() {
                return cell.isFull;
            }
        });
        Object.defineProperty(cell.user, `baseIncome`,{
            get() {
                return cell.baseIncome;
            }
        });
    },

    // if a river asset doesn't have "isFull" property, then its empty
    // If its neighbor has "isFull" property, then we need to rebuild asset and connectors
    checkRivers() {
        // to prevent flow effect we check rivers until at least one river is filled on previous iteration
        
        for (let attempt = 0; attempt < 900; attempt++) {
            let filledFlag = false;
            for (let i = 0; i < ROWS; i++) {
                for (let j = 0; j < COLS; j++) {
                    filledFlag = this.checkRiver(i, j) || filledFlag;
                }
            }
            if (!filledFlag) {
                break;
            }
        }
    },

    checkRiver(row, col) {
        const cell = this.field[row][col];
        if (!cell || cell.type !== 'river' || cell.isFull) {
            return false;
        }
        if (row == 0 || row == ROWS - 1) {
            this.fillRiver(row, col);
            return true;
        }
        // now we check if the neighbor has "isFull" property
        const neighbors = this.getNeighbors(row, col);
        for (let neighbor of neighbors) {
            if (neighbor && neighbor.type === 'river' && neighbor.isFull) {
                this.fillRiver(row, col);
                return true;
            }
        }
        return false;
    },

    fillRiver(row, col) {
        // rebuild the river
        const cell = this.field[row][col];
        cell.assets.forEach((a) => a.setExists(false));
        const assets = this.buildAsset_river(cell.owner, row, col, "river");
        cell.assets = assets;
        cell.isFull = true;
    },

    getNeighbors(row, col) {
        const neighbors = [];
        if (row > 0) {
            neighbors.push(this.field[row - 1][col]);
        }
        if (row < ROWS - 1) {
            neighbors.push(this.field[row + 1][col]);
        }
        if (col > 0) {
            neighbors.push(this.field[row][col - 1]);
        }
        if (col < COLUMNS - 1) {
            neighbors.push(this.field[row][col + 1]);
        }
        return neighbors;
    },
    
    buildAsset_rock(row, col){
        const { x, y } = this.getCellCenter(row, col);
        let assets = [];
        let asset = this.instabuild(`rock_obstacle`, x, y);
        assets.push(asset);
        return assets;
    },
    
    buildAsset_tree(row, col){
        const { x, y } = this.getCellCenter(row, col);
        const TREE_AMOUNT = 5;
        let assets = [];
        for(let i =0; i < TREE_AMOUNT; i++)
        {
            let randOffsetX = this.randNumber(-X_STEP * 0.3, X_STEP * 0.3);
            let randOffsetY = this.randNumber(-Y_STEP * 0.3, Y_STEP * 0.3);
            let asset = this.instabuild(`tree_obstacle`, x + randOffsetX, y + randOffsetY);
            assets.push(asset);
        }
        return assets;
    },
    
    buildAsset_well(row, col){
        const { x, y } = this.getCellCenter(row, col);
        let assets = [];
        let asset = this.instabuild(`well_obstacle`, x, y);
        assets.push(asset);
        return assets;
    },

    buildAsset_water(who, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        let asset = this.instabuild(`water_orb`, x, y);
        return asset;
    },

    buildAsset_earth(who, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        let asset = this.instabuild(`earth_orb`, x, y);
        return asset;
    },

    buildAsset_fire(who, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        let asset = this.instabuild(`fire_orb`, x, y);
        return asset;
    },

    buildAsset_wheat(who, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        const assets = [];
        const WSTEPS = 3;
        const WX_OFFSET = 2;
        const WY_OFFSET = 0.5;
        const WX_STEP = 3;
        const WY_STEP = 3;
        for (let i = 0; i < WSTEPS; i++) {
            for (let j = 0; j < WSTEPS; j++) {
                let asset = this.instabuild(`${who.color}-wheat`,
                    x - X_STEP / 2 + WX_OFFSET + i * WX_STEP,
                    y - Y_STEP / 2 + WY_OFFSET + j * WY_STEP);
                assets.push(asset);
            }

        }
        return assets;
    },

    // 2x2 garden assets on the tile
    buildAsset_garden(who, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        const assets = [];
        const GSTEPS = 2;
        const GX_OFFSET = 2.5;
        const GY_OFFSET = 1.5;
        const GX_STEP = 5;
        const GY_STEP = 5;
        for (let i = 0; i < GSTEPS; i++) {
            for (let j = 0; j < GSTEPS; j++) {
                let asset = this.instabuild(`${who.color}-garden`,
                    x - X_STEP / 2 + GX_OFFSET + i * GX_STEP,
                    y - Y_STEP / 2 + GY_OFFSET + j * GY_STEP);
                assets.push(asset);
            }

        }
        return assets;
    },

    // patches is one asset but still need x and y offsets
    buildAsset_patch(who, row, col) {
        const { x, y } = this.getCellCenter(row, col);
        const PX_OFFSET = 5;
        const PY_OFFSET = 5;
        let asset = this.instabuild(`${who.color}-patch`,
            x - X_STEP / 2 + PX_OFFSET,
            y - Y_STEP / 2 + PY_OFFSET);
        return [asset];
    },

    // river is using tricky logic based on the neighbour river tiles
    // for each river we create "river-x" asset
    // then if there is a river left or right we create "river-hconnecter" asset between them
    // if there is a river above or below we create "river-vconnecter" asset between them
    buildAsset_river(who, row, col, prefix = 'empty') {
        const { x, y } = this.getCellCenter(row, col);
        const RX_OFFSET = 5;
        const RY_OFFSET = 5;
        let assets = [this.instabuild(`${prefix}-x`, x - X_STEP / 2 + RX_OFFSET, y - Y_STEP / 2 + RY_OFFSET)];
        const left = this.field[row][col - 1];
        const right = this.field[row][col + 1];
        const top = this.field[row + 1] && this.field[row + 1][col];
        const bottom = this.field[row - 1] && this.field[row - 1][col];
        if (left && left.type === 'river') {
            assets.push(this.instabuild(`${prefix}-hconnect`, x - X_STEP / 2, y - Y_STEP / 2 + RY_OFFSET));
        }
        if (right && right.type === 'river') {
            assets.push(this.instabuild(`${prefix}-hconnect`, x + X_STEP / 2, y - Y_STEP / 2 + RY_OFFSET));
        }
        if (row == ROWS - 1 || (top && top.type === 'river')) {
            assets.push(this.instabuild(`${prefix}-vconnect`, x - X_STEP / 2 + RX_OFFSET, y + Y_STEP / 2));
        }
        if (row == 0 || (bottom && bottom.type === 'river')) {
            assets.push(this.instabuild(`${prefix}-vconnect`, x - X_STEP / 2 + RX_OFFSET, y - Y_STEP / 2));
        }
        return assets;
    },


    // we ignore who and col here and create prefix-mist asset full row
    buildAsset_mist(who, row, col, prefix = 'poison') {
        const { x, y } = this.getCellCenter(row, 0);
        const assets = [];
        for (let i = 0; i <= COLUMNS-1; i++) {
            if(this.rains[i]){assets.push(null);continue;}
            let asset = this.instabuild(`${prefix}-mist`, x + i * X_STEP, y);
            asset.alpha = MIST_ALPHA;
            assets.push(asset);
        }
        return assets;
    },
    
    buildAsset_rain(who, col){
        const { x, y } = this.getCellCenter(0, col);
        const assets = [];
        for (let i = 0; i <= ROWS-1; i++) {
            let asset = this.instabuild(`rain-cloud`, x, y + i * Y_STEP, RAIN_HEIGHT);
            asset.alpha = RAIN_ALPHA;
            asset.chooseAction = this.rain_rainSplash_chooseAction;
            asset.nextSpawnTimer = this.randNumber(0,RAINDROP_SPAWNMAX); //random initial spawn time
            asset.ref = this;
            asset.randNumber = this.randNumber;
            asset.X_STEP = X_STEP;
            asset.Y_STEP = Y_STEP;
            assets.push(asset);
            if(this.mists[i] && this.mists[i].assets[col]){
                this.mists[i].assets[col].setExists(false);
                this.mists[i].assets[col] = null;
            }
        }
        return assets;
    },
    rain_rainSplash_chooseAction(){
        if(this.nextSpawnTimer > 0){//if its not time to create a new splash yet, decrease the timer and continue the next frame
            this.nextSpawnTimer -= this.world.dt;
            return;
        }
        this.nextSpawnTimer = this.randNumber(RAINDROP_SPAWNMIN,RAINDROP_SPAWNMAX);//random spawn time
        let rainSplash = this.ref.instabuild(`rain-splash`, this.pos.x + this.randNumber(-X_STEP*0.5,X_STEP*0.5),this.pos.y + this.randNumber(-Y_STEP*0.5,Y_STEP*0.5),0);
        rainSplash.alpha = RAINDROP_ALPHA;
        rainSplash.lifespan = RAINDROP_LIFESPAN;
    },

    randNumber(min, max){
        return min + this.world.rand.randf() * (max-min);
    },

    randRoundNumber(min, max){
        return this.world.rand.rand2(min, max);
    },

    getMists() {
        let mistsCopy = this.mists.map((m => {
            if (m) {
                return {
                    duration: m.duration,
                    type: m.type,
                    row: m.row,
                };
            }
            
        }));
        return mistsCopy.filter(m => m);
    },
    
    getRains() {
        let rainsCopy = this.rains.map((r => {
            if (r) {
                return {
                    duration: r.duration,
                    column: r.col,
                };
            }
            
        }));
        return rainsCopy.filter(r => r);
    },
    checkRains(){
        this.rains.forEach((rain, col) =>{
            if (rain) {
                rain.duration -= this.world.dt;
                if (rain.duration <= 0){
                    this.rains[col] = null;
                    rain.assets.forEach((x) => x.setExists(false));
                }
            }
        });
        //
        this.addingRains.forEach((newRain) =>{
            const {col, duration} = newRain;
            for (let i = col - 1; i <= col + 1 ; i++){
                if (i < 0 || i >= COLUMNS) continue;
                if (this.rains[i]) {
                    this.rains[i].duration = duration;
                }else{
                    this.rains[i] ={
                        duration: duration,
                        col : i,
                        assets: this.buildAsset_rain(null, i)
                    };
                }
                
            }
        });
        this.addingRains = [];
    },

    checkMists() {
        // this.mists is an array of mists per rows, each mist is spreading whole row
        // each mist can be types as farms (wheat, garden, patch) or mixed "poison"
        // each mist has a timer and when it reaches 0 it disappears
        // Also we store "assets" to create/change/destroy them
        // first we check timers and destroy mists if needed
        this.mists.forEach((mist, row) => {
            if (mist) {
                mist.duration -= this.world.dt;
                if (mist.duration <= 0) {
                    this.mists[row] = null;
                    mist.assets.forEach(function(a){ 
                        if(a){
                            a.setExists(false);
                        }
                    });
                }
            }
        });
        // then we check if we need to create new mists
        // We check this.addingMits array which is filled by the "addMist" function
        // Each new mist affect 3 rows (up and down)
        this.addingMists.forEach((newMist) => {
            const { row, type, duration } = newMist;
            for (let i = row - 1; i <= row + 1; i++) {
                if (i < 0 || i >= ROWS) continue;
                if (this.mists[i]) {
                    // if there is the same mist type already we just extend the timer
                    if (this.mists[i].type === type) {
                        this.mists[i].duration = duration;
                    }
                    // if there is a different mist type we destroy it and create "poison" mist
                    else {
                        this.mists[i].assets.forEach(function(a){ 
                            if(a){
                                a.setExists(false);
                            }
                        });
                        this.mists[i] = {
                            type: 'poison',
                            duration: duration,
                            row: i,
                            assets: this.buildAsset_mist(null, i, 0, 'poison')
                        };
                    }
                }
                // if there is no mist we create a new one
                else {
                    this.mists[i] = {
                        type: type,
                        duration: duration,
                        row: i,
                        assets: this.buildAsset_mist(null, i, 0, type)
                    };
                }
            }
        });
        this.addingMists = [];

    }


});