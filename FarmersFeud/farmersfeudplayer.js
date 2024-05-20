const { ArgumentError } = require('lib/world/errors');

const RED = "red";
const BLUE = "blue";
const COLORS_PAIRS = {
    [RED]: BLUE,
    [BLUE]: RED
};
const DISTANCE_THRESHOLD = 0.1;
const RAINSLOW_UPDATETIME = 0.1;

(class FarmArenaPlayerAPI extends Component {
    attach(thang) {
        super.attach(thang);
        thang.addTrackedProperties(['score', 'number'], ['teamPower', 'number']);
        thang.keepTrackedProperty('score');
        thang.keepTrackedProperty('teamPower');
        // Object.defineProperty(thang, 'time', {
        //     get: function () {
        //         return this.world.age;
        //     },
        // });
        thang._unblock = thang.unblock;
        thang.unblock = null;
        thang._block = thang.block;
        thang.block = null;
        thang.wait = this._wait.bind(thang);
        thang.build = this._build.bind(thang);
        thang.move = this._move.bind(thang);
        
        thang.getEnemyHero = this._getEnemyHero.bind(thang)
        thang.whatAtPlace = this._whatAtPlace.bind(thang);
        thang.whatAt = this._whatAtPlace.bind(thang);
        thang.whatAtRowCol = this._whatAtRowCol.bind(thang);
        thang.getParameters = this._getParameters.bind(thang);
        thang.distance = this._distance.bind(thang);
        thang.mistCooldown = 0;
        thang.rainCooldown = 0;
        thang.mist = this._mist.bind(thang);
        thang.rain = this._rain.bind(thang);
        thang.getWorkerPlace = this._getWorkerPlace.bind(thang);
        thang.findMists = this._findMists.bind(thang);
        thang.findRains = this._findRains.bind(thang);
        thang.findBoosts = this._findBoosts.bind(thang);
        thang.clear = this._clear.bind(thang);
        thang.isReady = this._isReady.bind(thang);
        // thang.wait = this._wait.bind(thang);
    }
    _getWorkerPlace(){
        let columnNum = this._ref.getColumnByX(this.worker.pos.x);
        let rowNum = this._ref.getRowByY(this.worker.pos.y);
        if (this._ref.heroBlue._aetherAPIOwnMethodsAllowed) {
            columnNum = this._ref.parameters.field.columns - 1 - columnNum;
            rowNum = this._ref.parameters.field.rows - 1 - rowNum;
        }
        return String.fromCharCode(columnNum + 'A'.charCodeAt(0)) + rowNum.toString();
    }
    _getEnemyHero() {
        if (this.color == "red") {
            return this.world.getThangByID("Hero Placeholder 1");
        } else {
            return this.world.getThangByID("Hero Placeholder");
        }
    }

	_findBoosts() {
		var boosts = [];
		let boostsField = this._ref.boostsField;
		for(let b_ROW of boostsField){
            for(let b_COL of b_ROW){
                if(b_COL === null || b_COL.caught){continue;}
                boosts.push(b_COL.user);
            }
			
		}
        return boosts;
	}

    _isReady(ability) {
        if (!ability) {
            return false;
        }
        ability = ability.toLowerCase();
        if (ability == "mist" && this.mistCooldown > this.time) {
            return false;
        }else if(ability == "rain" && this.rainCooldown > this.time){
            return false;
        }
        return true;

    }
    _wait(duration){
        this.blockUntil = this.time + duration;
        return this.blockPlayer();
    }
    _build(what, where) {
        if (this.blocked) {
            return;
        }
        what = what.toLowerCase();
        const buildParameeters = this._ref.parameters.build[what];
        if (!buildParameeters) {
            throw new ArgumentError(`Unknown building type: ${what}`);
        }
        const { row, col } = this.getRowCol(where);
        this.targetBuilding = {
            type: what,
            row,
            col
        };
        return this.blockPlayer();
    }
    _move(where){
        if(this.blocked){
            return;
        }
        const { row, col } = this.getRowCol(where);
        this.targetMovePlace = {
            row,col
        };
        return this.blockPlayer();
    }
    _distance(where) {
        let { row, col } = this.getRowCol(where);
        let { x, y } = this.getXY(row, col)
        return (this.worker.distanceTo({ x, y }))
    }

    _clear(where) {
        if (this.blocked) {
            return;
        }
        const { row, col } = this.getRowCol(where);
        this.targetClearing = { row, col };
        return this.blockPlayer();
    }


    _whatAtPlace(where) {
        let { row, col } = this.getRowCol(where);
        return this._ref.whatAt(row, col);
    }

    _whatAtRowCol(row, col) {
        return this._ref.whatAt(row, col);
    }

    _getParameters(type) {
        let params = this._ref.parameters.build[type];
        if (!params) {
            throw new ArgumentError(`Unknown type: ${type}`);
        }
        let copyParams = Object.assign({}, params);
        copyParams.type = type;
        return copyParams;
    }
    _rain(column){
        column = column.toUpperCase();
        if(typeof column !== 'string' || column.length !== 1){
            throw new ArgumentError(`Invalid column: ${column}`)
        }
        let parameters = this._ref.parameters.rain;
        let col = column.charCodeAt(0) - 'A'.charCodeAt(0);
        if (col < 0 || col >= this._ref.parameters.field.columns) {
            throw new ArgumentError(`Invalid column: ${column}`);
        }
        if(this.blocked){
            return;
        }
        this.blockUntil = this.time + this.world.dt;
        if(this.rainCooldown > this.time){
            return this.blockPlayer();
        }
        if(this.color == BLUE){
            col = this._ref.parameters.field.columns - 1 - col;
        }
        this.rainCooldown = this.time + parameters.cooldown;
        this._ref.addRain(this, col);
        return this.blockPlayer();
    }

    _mist(what, row) {
        what = what.toLowerCase();
        let parameters = this._ref.parameters.mists[what];
        if (!parameters) {
            throw new ArgumentError(`Unknown mist type: ${what}`);
        }
        if (!_.isNumber(row) || row < 0 || row >= this._ref.parameters.field.rows) {
            throw new ArgumentError(`Invalid row: ${row}`);
        }
        if (this.blocked) {
            return;
        }
        this.blockUntil = this.time + this.world.dt;
        if (this.mistCooldown > this.time) {
            return this.blockPlayer();
        }
        row = Math.floor(row);
        if (this.color == BLUE) {
            row = this._ref.parameters.field.rows - 1 - row;
        }
        this.mistCooldown = this.time + parameters.cooldown;
        this._ref.addMist(this, what, row);
        return this.blockPlayer();
    }

    _findMists() {
        let mists = this._ref.getMists(this);
        if (this.color == BLUE) {
            mists.forEach(mist => {
                mist.row = this._ref.parameters.field.rows - 1 - mist.row;
            });
        }
        mists.sort((a,b) => a.row - b.row) //ensures consistent behaviour towards mists by sorting them in ascending order on both teams
        return mists;
    }
    _findRains() {
        let rains = this._ref.getRains(this);
        if (this.color == BLUE) {
            rains.forEach(rain => {
                rain.column = this._ref.parameters.field.columns - 1 - rain.column;
            });
        }
        rains.sort((a,b) => a.column - b.column) //ensures consistent behaviour towards rains by sorting them in ascending order on both teams
        rains.forEach((x) => x.column = String.fromCharCode(x.column + 'A'.charCodeAt(0)));
        return rains;
    }
    

    // Location is a string like "A0" or "C12"
    // The first character is the column, the second is the row
    // Returns an object with the properties "row" and "col"
    getXY(row, col) {
        return this._ref.getCellCenter(row, col);
    }
    getRowCol(location) {
        if (typeof location !== 'string' || location.length !== 2) {
            throw new ArgumentError(`Invalid location: ${location}`);
        }
        location = location.toUpperCase();
        let col = location.charCodeAt(0) - 'A'.charCodeAt(0);
        let row = parseInt(location[1]);
        if (col < 0 || col >= this._ref.parameters.field.columns || row < 0 || row >= this._ref.parameters.field.rows ||isNaN(row) ) {
            throw new ArgumentError(`Invalid location: ${location}`);
        }
        // mirror rows and colums for team blue
        if (this.color === BLUE) {
            col = this._ref.parameters.field.columns - 1 - col;
            row = this._ref.parameters.field.rows - 1 - row;
        }
        return { row, col };
    }
    

    blockPlayer() {
        this.blocked = tru e;
        return this._block();
    }

    unblockPlayer() {
        this.blocked = false;
        return this._unblock();
    }

    update() {
        let crX = this._ref.getColumnByX(this.worker.pos.x)
        if(this._ref.rains[crX]){
            this.worker.effects = this.worker.effects.filter(e => e.name != 'isSlowed');
            this.worker.addEffect({name: 'slow', duration: RAINSLOW_UPDATETIME, revertsProportionally: true, setTo: true, targetProperty: 'isSlowed'});
            let hasBoost = this._ref.parameters.boosts;
            let rainSpeedFactor = this._ref.parameters.rain.slowFactor;
            if(hasBoost && this.worker.currentBoost == "water"){
                rainSpeedFactor = this._ref.parameters.boosts.water.rainSpeedFactor;
            }
            this.worker.addEffect({name: 'slow', duration: RAINSLOW_UPDATETIME, revertsProportionally: true, factor: rainSpeedFactor, targetProperty: 'maxSpeed'});
        }//robots walk slower in the rain
        if(this.targetMovePlace){
            const { row, col } = this.targetMovePlace;
            if (this._ref.allowedZone(this, row, col) === false) {
                this.targetMovePlace = null;
                return this.unblockPlayer();
            }
            const { x, y } = this._ref.getCellCenter(row, col);
            if (this.worker.distanceTo({ x, y }) < DISTANCE_THRESHOLD) {
                this.targetMovePlace = null;
                return this.unblockPlayer();
            }
            this.worker.move ({ x, y })
        }
        if (this.targetBuilding) {
            const { row, col, type } = this.targetBuilding;
            if (this._ref.allowedZone(this, row, col) === false) {
                this.targetBuilding = null;
                return this.unblockPlayer();
            }
            const whatInCell = this._ref.field[row][col];
            if (whatInCell) {
                this.targetBuilding = null;
                return this.unblockPlayer();
            }
            const { x, y } = this._ref.getCellCenter(row, col);
            if (this.worker.distanceTo({ x, y }) < DISTANCE_THRESHOLD) {
                this._ref.startBuilding(this, whatInCell ? whatInCell.type : type, row, col, whatInCell ? type : null);
                this.targetBuilding = null;
                this.blockUntil = this.time + this._ref.getBuildTime(type);
                return;
            }

            this.worker.move({ x, y });

        }
        if (this.targetClearing) {
            const { row, col } = this.targetClearing;
            if (this._ref.allowedZone(this, row, col) === false) {
                this.targetClearing = null;
                return this.unblockPlayer();
            }
            const whatInCell = this._ref.field[row][col];
            if (!whatInCell || whatInCell.type == 'river' || whatInCell.type == "construction" || (this._ref.parameters.obstacles && Object.keys(this._ref.parameters.obstacles).includes(whatInCell.type))) {
                this.targetClearing = null;
                return this.unblockPlayer();
            }
            const { x, y } = this._ref.getCellCenter(row, col);
            if (this.worker.distanceTo({ x, y }) < DISTANCE_THRESHOLD) {
                this._ref.startClearing(this, row, col, whatInCell);
                this.targetClearing = null;
                this.blockUntil = this.time + this._ref.getClearTime(whatInCell);
                return;
            }

            this.worker.move({ x, y });
        }

        if (this.blockUntil && this.time >= this.blockUntil) {
            this.blockUntil = null;
            return this.unblockPlayer();
        }
    }

});