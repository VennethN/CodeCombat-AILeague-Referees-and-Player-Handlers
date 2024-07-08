const HEAL_BATTERY = 'heal-battery';
const SPEED_BATTERY = 'speed-battery';
const SOLAR_BATTERY = `solar-battery`;

const RED = 'red';
const BLUE = 'blue';
const COLORS = [RED, BLUE];

const LEFT = 'left';
const RIGHT = 'right';
const DOWN = 'down';
const UP = 'up';

const DIRECTION_DIFFS = {
    [LEFT]: {x: -1, y: 0},
    [RIGHT]: {x: 1, y: 0},
    [DOWN]: {x: 0, y:-1},
    [UP]: {x: 0, y: 1}
};
const DIRECTION_ROTATION = {
    [LEFT]: 0,
    [RIGHT]: Math.PI,
    [DOWN]: Math.PI * 1.5,
    [UP]: Math.PI * 0.5
};


const ITEM_TYPES = [HEAL_BATTERY,SPEED_BATTERY,SOLAR_BATTERY];

({
    setUpLevel() {
        // this.world.mirrorPlayers = true;
        this.heroes = [this.hero, this.hero1];
        this.heroesByColor = {
            [RED]: this.hero,
            [BLUE]: this.hero1
        };
        this.heroes.forEach((h) => {
            h.ref = this;
            h.hookOnHasMoved = this.heroOnHasMoved.bind(this, h);
            let row = Math.floor((h.pos.y) / this.step);
            let col = Math.floor((h.pos.x) / this.step);
            h.prevCell = {row, col};
            h.score = 0;
            h.addTrackedProperties(['score', 'number'], ['teamPower', 'number']);
            h.collectRange = this.heroCollectRange;
            h.collectRangeSquared = this.heroCollectRange * this.heroCollectRange;
            h.maxSpeed = this.heroBaseSpeed;
            h.health = this.heroHealth;
            h.maxHealth = this.heroHealth;
            h.keepTrackedProperty('health');
            h.keepTrackedProperty('maxHealth');
            h.rangeThang = this.getByID(`range-${h.color}`);
            h.rangeThang.setScale(0.17 * this.heroCollectRange);
            h.canCollect = (item) => {
                return !h.dead && h.distanceSquared(item, false) < h.collectRangeSquared;
            };
            Object.defineProperty(h, 'solar', {
                get() {
                    return h.score;
                }
            });
            h.say = () => {};
            h.sayWithDuration = () => {};
            h.sayWithoutBLocking = () => {};
        });
        this.hero.opponent = this.hero1;
        this.hero1.opponent = this.hero;
        this.lavaThangMap = null;
        this.items = [];
        this.portals = [];
        this.solarMap = [];
        this.lavas = [];
        this.shadows = [];
        this.crabs = [];
        this.solarMapThangs = [];
        this.shockTraps = [];
        for (let y = 0; y < this.maxRows; y++) {
            this.solarMap[y] = [];
            this.solarMapThangs[y] = [];
            for (let x = 0; x < this.maxCols; x++) {
                this.solarMap[y][x] = 0;
                // if (y == 0 || y == this.maxRows - 1 || x == 0 || x == this.maxCols - 1) {
                //     this.solarMap[y][x] = 9999;
                // }
                // else {
                //     this.solarMap[y][x] = 0;

                // }
                this.solarMapThangs[y].push(null);
            }
        }
        this.hero.inventory = [];
        this.hero1.inventory = [];
        this.hero.S = "Red clouds above their head...";
        this.hero.addTrackedProperties(['S', 'string']);
        this.hero.keepTrackedProperty('S');
        this.hero1.S = "Blue sky in their dreams...";
        this.hero1.addTrackedProperties(['S', 'string']);
        this.hero1.keepTrackedProperty('S');
    },

    onFirstFrame() {
        this.createItems();
        this.createPortals();
        this.setInterval(this.createItems.bind(this), this.itemInterval);
        this.setInterval(this.reconcileSolarScore.bind(this), this.reconcileSolarInterval);
        this.setInterval(this.createShadows.bind(this), this.shadowInterval);  
        this.setInterval(this.createPortals.bind(this), this.portalInterval);
    },

    createItems() {
        let poss = null;
        for (let i = 0; i < 900; i++) {
            poss = this.findItemPos();
            if (poss) break;
        }
        if (!poss) return;
        let chosenItem = this.world.rand.choice(Object.keys(this.itemData));
        chosenItem = this.itemData[chosenItem];
        for (let i = 0; i < 2; i++) {
            let item = this.instabuild(`${chosenItem.type}-item`, poss[i].x, poss[i].y);
            item.lifespan = typeof chosenItem.lifespan !== "undefined" ? chosenItem.lifespan : this.itemLifespan;
            item.onCollect = this.itemOnCollect.bind(this, item);
            item.type = chosenItem.type;
            this.items.push(item);
            // if (item.type == RED_ITEM && this.hero.contextMM) {
            //     let n = this.world.rand.rand2(1, 9);
            //     n = n.toString();
            //     let m = this.hero.contextMM['r' + n];
            //     // item.hudProperties = item.hudProperties || [];
            //     // item.hudProperties.push('O');
            //     item['_'] = n + ': ' + m;
            //     item.addTrackedProperties(['_', 'string']);
            //     item.keepTrackedProperty('_');
            // }
            
        }
    },
    createPortals()
    {
        let poss = null;
        for (let i = 0; i < 900; i++) {
            poss = this.findPortalPos();
            if (poss) break;
        }
        if (!poss) return;
        // Reset portals
        for (let i = this.portals.length - 1; i >= 0; i--) {
            this.portals[i].setExists(false);
            this.portals.splice(i, 1); 
        }
        let chosenItem = this.world.rand.choice(Object.keys(this.itemData));
        chosenItem = this.itemData[chosenItem];
        for (let i = 0; i < 2; i++) {
            let portal = this.instabuild(`portal`, poss[i].x, poss[i].y);
            portal.lifespan = this.portalLifespan;
            this.portals.push(portal);
            
        }
        this.portals[0].target = this.portals[1];
        this.portals[1].target = this.portals[0];
    },
    createShadows()
    {
        let pos = null;
        for(let i = 0;i < 900; i++)
        {
            pos = this.findShadowPos();
            if (pos) break;
        }
        if(!pos){return;}
        for(let i = 0; i < 2; i++){
            let shadow = this.instabuild('shadow-cloud', pos[i].x, pos[i].y);
            shadow.lifespan = this.shadowLifespan;
            this.shadows.push(shadow);
        }
    },
    findPortalPos()
    {
        let pos = this.pickPointFromRegion(this.rectangles.portal);
        pos = new Vector(Math.round(pos.x), Math.round(pos.y));
        let posM = new Vector(this.maxX - pos.x, this.maxY - pos.y);
        for (let h of this.heroes) {
            for (let p of [pos, posM]) {
                if (h.distanceTo(p) < 20) {
                    return false;
                }
            }
        }
        return [pos, posM];
    },

    findItemPos() {
        let pos = this.pickPointFromRegion(this.rectangles.item);
        pos = new Vector(Math.round(pos.x), Math.round(pos.y));
        let posM = new Vector(this.maxX - pos.x, this.maxY - pos.y);
        for (let h of this.heroes) {
            for (let p of [pos, posM]) {
                if (h.distanceTo(p) < 20) {
                    return false;
                }
            }
        }
        return [pos, posM];
    },
    findShadowPos() {
        let pos = this.pickPointFromRegion(this.rectangles.shadow);
        pos = new Vector(Math.round(pos.x), Math.round(pos.y));
        let posM = new Vector(this.maxX - pos.x, this.maxY - pos.y);
        for (let h of this.heroes) {
            for (let p of [pos, posM]) {
                if (h.distanceTo(p) < 10) {
                    return false;
                }
            }
        }
        return [pos, posM];
    },
    crabOnHasMoved(crab, prevPos, newPos) {
        this.hookHasMoved(crab);
    },

    heroOnHasMoved(h, prevPos, newPos) {
        let hPosX = 2* Math.floor(h.pos.x/2) + 1 
        let hPosY = 2* Math.floor(h.pos.y/2) + 1
        if (hPosX <= 1 || hPosX >= this.maxX - 1 || hPosY <= 1 || hPosY >= this.maxY - 1) {
            h.brake(); 
            h.setTargetPos(null);
            h.setAction('idle');
            h.die();
        }
       this.hookHasMoved(h);    
    },

    hookHasMoved(unit){
        let row, col;
        row = Math.floor((unit.pos.y) / this.step);
        col = Math.floor((unit.pos.x) / this.step);

        unit.currentCell = {row, col};
        if (!unit.prevCell) {
            unit.prevCell = {row, col};
        }
        if (unit.prevCell.row != row || unit.prevCell.col != col) {            
            let [fromRow, toRow] = [unit.prevCell.row, unit.currentCell.row];
            let [fromCol, toCol] = [unit.prevCell.col, unit.currentCell.col];
            if (unit.lastDirection == 'up') {
                for (let r = fromRow; r < toRow; r++) {
                    this.createSolarCell(r % this.maxRows, unit.currentCell.col, unit.color);
                }
            }
            else if (unit.lastDirection == 'down') {
                for (let r = fromRow; r > toRow; r--) {
                    this.createSolarCell((r + this.maxRows) % this.maxRows, unit.currentCell.col, unit.color);
                }
            }
            else if (unit.lastDirection == 'right') {
                for (let c = fromCol; c < toCol; c++) {
                    this.createSolarCell(unit.currentCell.row, c % this.maxCols, unit.color);
                }
            }
            else if (unit.lastDirection == 'left') {
                for (let c = fromCol; c > toCol; c--) {
                    this.createSolarCell(unit.currentCell.row, (c + this.maxCols) % this.maxCols, unit.color);
                }
            }
            // }
            unit.prevCell = {row, col};
        }
    },

    explodeShockBall(shockBall, who)
    {
        let shockThrowInfo = this.special.shockThrow;
        let shockBallPos = shockBall.pos;
        let shockwaveEffect = this.instabuild('shockwave-effect', shockBallPos.x, shockBallPos.y);
        shockwaveEffect.lifespan = 0.5;
        const args = [
        parseFloat(shockBall.pos.x.toFixed(2)),
        parseFloat(shockBall.pos.y.toFixed(2)),
        parseFloat(shockThrowInfo.range.toFixed(2)),
        '#FF0000', 0, Math.PI * 2];
        this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
        for (let h of this.heroes) {
            if (h.color == who.color) {
                continue;
            }
            if(h.distanceTo(shockBall) < shockThrowInfo.range) {
                this.stunTurtle(h, shockThrowInfo.damage, shockThrowInfo.slowDuration, shockThrowInfo.slowFactor);
            }
        }
    },

    explodeBlob(blob, who) {
        const row = Math.floor(blob.pos.y / this.step);
        const col = Math.floor(blob.pos.x / this.step);
        for (let r = row - this.blobExplosionRange; r <= row + this.blobExplosionRange; r++) {
            for (let c = col - this.blobExplosionRange; c <= col + thixs.blobExplosionRange; c++) {
                if (r <= 0 || r >= this.maxRows - 1 || c <= 0 || c >= this.maxCols - 1) return;
                this.createSolarCell(r, c, who.color);
            }
        }
    },

    createSolarCell(row, col, color) {
        if (row <= 0 || row >= this.maxRows - 1 || col <= 0 || col >= this.maxCols - 1) return;
        // if (this.lavaMap[row][col] <= 0) {
        //     // let lava = this.instabuild('lava', col * this.step + this.step / 2, row * this.step + this.step / 2);
        //     lava.row = row;
        //     lava.col = col;
        //     this.lavas.push(lava);
        // }
        if (color == BLUE) {
            if(this.solarMap[row][col] >= 0){
                this.solarMap[row][col] = -1;
            }else{
                this.solarMap[row][col] -= 1;
            
            }
        }
        else {
            if(this.solarMap[row][col] <= 0){
                this.solarMap[row][col] = 1;
            }else{
                this.solarMap[row][col] += 1;
            
            }
        }
    },
    
    reconcileClosedShape()
    {

        for(let h of this.heroes)
        {
            if(!h.currentCell){
                continue
            }
            for(let i = h.currentCell.row - 2; i <= h.currentCell.row + 2; i++)
            {
                for(let j = h.currentCell.col - 2; j <= h.currentCell.col + 2; j++)
                {
                    if(i <= 0 || i >= this.maxRows - 1 || j <= 0 || j >= this.maxCols - 1){
                        continue;
                    }
                    let isSurroundedRed = this.isSurroundedBy(i,j,1)
                    if(isSurroundedRed){
                        this.fillSolarCell(i,j,1, Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1)));
                    }
                    let isSurroundedBlue = this.isSurroundedBy(i,j,-1)
                    if(isSurroundedBlue){
                        this.fillSolarCell(i,j,-1, Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1)));
                    }
                }
            }
        }    
        
    },

    printSolarMap()
    {
        for(let i = 0; i < this.maxRows; i++)
        {
            let row = "";
            for(let j = 0; j < this.maxCols; j++)
            {
                row += this.solarMap[i][j] + " ";
            }
            
        }
    },

    fillSolarCell(r, c, sign, visited){
        let persistCond = sign == 1 ? this.solarMap[r][c] >= 1 : this.solarMap[r][c] <= -1;
        if(r <= 0 || r >= this.maxRows || c <= 0 || c >= this.maxCols || visited[r][c] == true || persistCond) {
            return;
        }
        this.createSolarCell(r, c, sign == 1 ? RED : BLUE);
        visited[r][c] = true;
        this.fillSolarCell(r-1,c,sign, visited);
        this.fillSolarCell(r+1,c,sign, visited);
        this.fillSolarCell(r,c-1,sign, visited);
        this.fillSolarCell(r,c+1,sign, visited);
    },

    isSurroundedBy(r, c, sign) {
        let queue = [[r, c]];
        let isSurrounded = true;
        let visited = Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1))
    
        while(queue.length > 0) {
            let [r, c] = queue.shift();
            if(visited[r][c] !== -1){
                continue
            }
            visited[r][c] = true;
            let solarMapCond = sign == 1 ? this.solarMap[r][c] < 1 : this.solarMap[r][c] > -1;
            if ((c == 0 || c == this.maxCols - 1 || r == 0 || r == this.maxRows - 1) && solarMapCond) {
                isSurrounded = false;
                break;
            }

            let persistCond = sign == 1 ? this.solarMap[r][c] >= 1 : this.solarMap[r][c] <= -1;
    
            if (persistCond) {
                continue;
            }
    
            [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].forEach(([nr, nc]) => {
                if (nr >= 0 && nr < this.maxRows && nc >= 0 && nc < this.maxCols && visited[nr][nc] === -1) {
                    queue.push([nr, nc]);
                }
            });
        }
    
        return isSurrounded;
    },

    itemOnCollectOld(item, hero) {
        if (!this.winner) {
            hero.score += this.itemScore;
        }
        // hero.keepTrackedProperty('score');
        if (item.type == GREEN_ITEM) {
            hero.health = Math.min(hero.health + this.itemHealth, hero.maxHealth);
        }
        if (item.type == BLUE_ITEM) {
            for (let k of Object.keys(hero.abilityCooldowns)) {
                hero.abilityCooldowns[k] = Math.max(hero.abilityCooldowns[k] - this.itemReducingCooldown, 0);
            }
        }
        if (item.type == RED_ITEM) {
            let hasteEffects = hero.effects.filter(e => e.name == 'haste');
            if (hasteEffects && hasteEffects.length) {
                hasteEffects.forEach(e => e.timeSinceStart = 0);
            }
            else {
                hero.addEffect({name: 'haste', duration: this.itemSpeedRatioDuration,
                    revertsProportionally: true, factor: this.itemSpeedRatio, targetProperty: 'maxSpeed'});                            
            }
        }
        hero.rangeThang.effects = hero.rangeThang.effects.filter(e => e.name != 'visible');
        hero.rangeThang.addEffect({name: 'visible', duration: 0.2, reverts: true, setTo: 0.5, targetProperty: 'alpha'});
        hero.rangeThang.updateEffects();
    },

    itemOnCollect(item, hero) {
        if(this.winner){
            return;
        }
        let itemInfo = this.itemData[item.type]
        if (item.type == HEAL_BATTERY) {
            hero.health = Math.min(hero.health + itemInfo.healthAdd, hero.maxHealth);
        }else if(item.type == SPEED_BATTERY){
            let hasteEffects = hero.effects.filter(e => e.name == 'haste');
            if (hasteEffects && hasteEffects.length) {
                hasteEffects.forEach(e => e.timeSinceStart = 0);
            }
            else {
                hero.addEffect({name: 'haste', duration: itemInfo.duration,
                    revertsProportionally: true, factor: itemInfo.speedMult, targetProperty: 'maxSpeed'});                            
            }
        }else if(item.type == SOLAR_BATTERY)
            {
                hero.score += hero.score * itemInfo.solarGain;
            }
        hero.rangeThang.effects = hero.rangeThang.effects.filter(e => e.name != 'visible');
        hero.rangeThang.addEffect({name: 'visible', duration: 0.2, reverts: true, setTo: 0.5, targetProperty: 'alpha'});
        hero.rangeThang.updateEffects();
    },

    checkWinners() {
        if (this.hero.health <= 0 && this.hero1.health >= 0) {
            this.winner = this.hero1;
            this.hero.setAlpha(0.3);
            this.winGoal('blue-win');
            return true;
        }
        else if (this.hero.health >= 0 && this.hero1.health <= 0) {
            this.winner = this.hero;
            this.hero1.setAlpha(0.3);
            this.winGoal('red-win');
            return true;
        }
        if ((this.hero.health <= 0 && this.hero1.health <= 0) || this.world.age > this.maxTime) {
            // for (let h of this.heroes) {
            //     h.score += h.health * this.healthToScoreCoef;
            // }
            if (this.hero.score == this.hero1.score) {
                if (this.world.rand.randf() < 0.5) {
                    this.hero.score += 1;
                }
                else {
                    this.hero1.score += 1;
                }
            }
            if (this.hero.score > this.hero1.score) {
                this.winner = this.hero;
                this.winGoal('red-win');
            }
            else {
                this.winner = this.hero1;
                this.winGoal('blue-win');
            }
        }
        
    },

    rebuildSolarField() {
        const actualSolarMapStr = [];
        for (let i = 0; i < this.maxRows; i++) {
            let row = [];
            for (let j = 0; j < this.maxCols; j++) {
                row.push(this.detectSolarPanelType(i, j));
            }
            actualSolarMapStr.push(row);
        }
        for (let i = 1; i < this.maxRows - 1; i++) {
            for (let j = 1; j < this.maxCols - 1; j++) {
                let shouldBeName = actualSolarMapStr[i][j];
                let shouldBeLevel = Math.abs(this.solarMap[i][j]);
                let currentName = this.solarMapThangs[i][j] && this.solarMapThangs[i][j].name;
                let currentLevel = this.solarMapThangs[i][j] && this.solarMapThangs[i][j].level;
                if (shouldBeName != currentName) {
                    if (this.solarMapThangs[i][j]) {
                        this.solarMapThangs[i][j].label.setExists(false);
                        this.solarMapThangs[i][j].setExists(false);
                        this.solarMapThangs[i][j] = null;
                    }
                    if (shouldBeName) {
                        let solarPanel = this.instabuild(shouldBeName, j * this.step + this.step / 2, i * this.step + this.step / 2 );
                        this.solarMapThangs[i][j] = solarPanel;
                        solarPanel.name = shouldBeName;
                        
                        let panelLabel = this.instabuild(shouldBeName + '-label', j * this.step + this.step / 2, i * this.step + this.step / 2 -2);
                        solarPanel.label = panelLabel;
                        solarPanel.level = shouldBeLevel;
                        solarPanel.label.sayWithDuration(900, shouldBeLevel)
                    }
                }else if(shouldBeLevel != currentLevel && this.solarMapThangs[i][j]){
                    this.solarMapThangs[i][j].label.sayWithDuration(900, Math.abs(shouldBeLevel))
                }
            }
        }
        
    },
    reconcileSolarScore()
    {
        let redScore = 0;
        let blueScore = 0;
        const actualSolarMapStr = [];
        for (let i = 0; i < this.maxRows; i++) {
            for (let j = 0; j < this.maxCols; j++) {
                if(this.solarMap[i][j] > 0){
                    let residue = (this.solarMap[i][j] -1)
                    redScore += residue * this.solarLevelFactor
                    redScore++;
                }else if(this.solarMap[i][j] < 0){
                    let residue = Math.abs(this.solarMap[i][j] +1)
                    blueScore += residue * this.solarLevelFactor
                    blueScore++;
                }
            }
        }
        this.hero.score += redScore * this.reconcileSolarInterval;
        this.hero1.score += blueScore * this.reconcileSolarInterval;
    },

    detectSolarPanelType(r, c)
    {
        if (this.solarMap[r][c] == 0 || r == 0 || r == this.maxRows - 1 || c == 0 || c == this.maxCols - 1) {
            return null;
        }
        const sign = Math.sign(this.solarMap[r][c]);
        let code = null;
        if(sign <= -1){
            code = 'bpanel';
        }else if(sign >= 1)
            {
                code = 'rpanel'
            }
        return code;
    },

    detectLavaType(r, c) {
        if (this.solarMap[r][c] == 0 || r == 0 || r == this.maxRows - 1 || c == 0 || c == this.maxCols - 1) {
            return null;
        }
        const sign = Math.sign(this.solarMap[r][c]);
        let code = "lava";
        if (sign == -1) {
            code = 'blava';
        }
        if (r == this.maxRows - 2 || sign == Math.sign(this.solarMap[r + 1][c])) {
            code += '0';
        }
        else {
            code += '1';
        }

        if (c == this.maxCols - 2 || sign == Math.sign(this.solarMap[r][c + 1])) {
            code += '0';
        }
        else {
            code += '1';
        }
        
        if (r == 1 || sign == Math.sign(this.solarMap[r - 1][c])) {
            code += '0';
        }
        else {
            code += '1';
        }

        
        if (c == 1 || sign == Math.sign(this.solarMap[r][c - 1])) {
            code += '0';
        }
        else {
            code += '1';
        }
        
        return code;
    },

    thangContainsThang(thangRect, x, y) {
        let thangWidth = thangRect.width;
        let thangHeight = thangRect.height;
        let halfThangWidth = thangWidth / 2;
        let halfThangHeight = thangHeight / 2;
        let left = thangRect.pos.x - halfThangWidth;
        let right = thangRect.pos.x + halfThangWidth;
        let top = thangRect.pos.y + halfThangHeight;
        let bottom = thangRect.pos.y - halfThangHeight;
        return left <= x && x <=  right && y <= top && y >= bottom;
    },

    reconcileShadowDamage()
    {
        if(this.winner)
        {
            return;
        }
        for(let h of this.heroes)
        {
            let shadowDamaged = false;
            for(let s  of this.shadows)
            {
                if(this.thangContainsThang(s, h.pos.x, h.pos.y))
                {
                    shadowDamaged = true;
                    h.takeDamage(this.shadowDamage * this.world.dt);
                    break;
                }
            }
            if(!shadowDamaged)
            {
                h.health = Math.min(h.health + this.solarHeal * this.world.dt, h.maxHealth);
            }
        }
    },
    waterBulletUpdate(waterBullet)
    {
        
        if (waterBullet.pos.x < 0 || waterBullet.pos.x >= this.maxCols*this.step ||
            waterBullet.pos.y < 0 || waterBullet.pos.y >= this.maxRows*this.step) {
            waterBullet.setExists(false);
            return;
            }
        let waterGunInfo = this.special.waterGun
        for(let h of this.heroes)
        {
            if(h.color == waterBullet.color){continue}
            if(h.distanceTo(waterBullet) < waterGunInfo.waterHitRadius)
            {
                let timeFactor = 1 * Math.min((this.world.age - waterBullet.createdTime) / waterGunInfo.fullTimeNeeded,1);
                h.takeDamage(waterGunInfo.waterDamage * timeFactor);
                let slowEffects = h.effects.filter(e => e.name == 'waterSlow');
                    if (slowEffects && slowEffects.length) {
                        slowEffects.forEach(e => e.timeSinceStart = 0);
                    }
                    else {
                        h.addEffect({name: 'waterSlow', duration: waterGunInfo.slowDuration * timeFactor,
                            revertsProportionally: true, factor: waterGunInfo.slowFactor, targetProperty: 'maxSpeed'});                            
                    }
                waterBullet.setExists(false);
            }
        }
    },
    reconcileIntents()
    {
        let waterGunInfo = this.special.waterGun
        for(let h of this.heroes)
        {
            if(h.shockTrapIntent)
            {
                h.shockTrapIntent = false;
                let trap = this.instabuild(`${h.color}-shock-trap`, h.pos.x, h.pos.y);
                trap.lifespan = this.special.shockTrap.lifespan;
                trap.color = h.color;
                this.shockTraps.push(trap);
            }
            if(h.waterGunIntent)
            {
                h.waterGunIntent = false;
                const diff = DIRECTION_DIFFS[h.waterGunIntentDirection];
                const waterPos = new Vector(h.pos.x, h.pos.y);
                const waterBullet = this.instabuild(`water-bullet`, waterPos.x, waterPos.y);
                waterBullet.createdTime = this.world.age;
                waterBullet.color = h.color;
                waterBullet.maxSpeed = waterGunInfo.waterSpeed * Math.max(h.maxSpeed/this.heroBaseSpeed,0.8);
                waterBullet.moveXY(waterPos.x + 99 * diff.x, waterPos.y + 99 * diff.y);
                waterBullet.appendMethod('update', this.waterBulletUpdate.bind(this, waterBullet, this));
                waterBullet.creator = h;
                waterBullet.lastDirection = h.waterGunIntentDirection;
                waterBullet.setRotation(DIRECTION_ROTATION[h.waterGunIntentDirection])
            }
            if(h.robotCrabIntent)
            {
                h.robotCrabIntent = false;
                let crabIntentPos = h.robotCrabIntentPos
                let crab = this.instabuild(`${h.color}-crab`, crabIntentPos.x, crabIntentPos.y);
                let crabInfo = this.special.robotCrab;

                crab.maxSpeed = crabInfo.crabSpeed;
                let dir = h.robotCrabIntentDirection
                crab.lastDirection = dir
                crab.direction = dir
                crab.color = h.color;
                crab.team = h.team;
                crab.hookOnHasMoved = this.crabOnHasMoved.bind(this, crab);
                crab.appendMethod('update', this.crabUpdate.bind(this, crab, this));
                crab.moveXY(h.pos.x + DIRECTION_DIFFS[dir].x * 99, h.pos.y + DIRECTION_DIFFS[dir].y * 99);
                crab.ref = this
                crab.param = crabInfo
                this.crabs.push(crab);
            }
        }
    },
    crabUpdate(crab){
        if(crab.dead || !crab.exists){
            
                crab.setExists(false);
                return;
            }
        let hPosX = 2* Math.floor(crab.pos.x/2) + 1 
        let hPosY = 2* Math.floor(crab.pos.y/2) + 1
        let ref = crab.ref
        let crabInfo = crab.param
        let crabDeathDamage = function()
        {
            crab.brake(); 
            crab.setTargetPos(null);
            crab.setAction('idle');
            crab.die();
            const args = [
            parseFloat(crab.pos.x.toFixed(2)),
            parseFloat(crab.pos.y.toFixed(2)),
            parseFloat(crabInfo.deathRange.toFixed(2)),
            '#FF0000', 0, Math.PI * 2];
            ref.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
            for (let h of ref.heroes) {
                if(h.distanceTo(crab) < crabInfo.deathRange && h.color != crab.color)
                {
                    h.takeDamage(crabInfo.deathDamage);
                }
            }
            
            crab.setExists(false);
        }
        if (hPosX <= 1 || hPosX >= ref.maxX - 1 || hPosY <= 1 || hPosY >= ref.maxY - 1) {
           crabDeathDamage()
           return;
        }
        for (let h of ref.heroes) {
            
            if (h.color != crab.color && h.distanceTo(crab) < crabInfo.explodeRange) {
                crabDeathDamage()
                return;
            }
        }
    },

    reconcileShockTrap()
    {
        let shockTrapInfo = this.special.shockTrap;
        for (let t of this.shockTraps) {
            for (let h of this.heroes) {
                if (h.color != t.color && h.distanceTo(t) < shockTrapInfo.activeRange) {
                    let shockwaveEffect = this.instabuild('shockwave-effect', t.pos.x, t.pos.y);
                    shockwaveEffect.lifespan = 0.5;
                    const args = [
                    parseFloat(t.pos.x.toFixed(2)),
                    parseFloat(t.pos.y.toFixed(2)),
                    parseFloat(shockTrapInfo.activeRange.toFixed(2)),
                    '#FF0000', 0, Math.PI * 2];
                    this.addCurrentEvent(`aoe-${JSON.stringify(args)}`);
                    this.stunTurtle(h, shockTrapInfo.damage, shockTrapInfo.slowDuration, shockTrapInfo.slowFactor);
                    t.setExists(false);
                }
            }
        }
    },
    reconcilePortals()
    {
        for(let p of this.portals)
        {
            for(let h of this.heroes)
            {
                if(h.distanceTo(p) < this.portalRange)
                {
                    let hDir = h.lastDirection;
                    let pTargetPos = p.target.pos;
                    let scalarFactor = this.step * this.portalStepTele
                    let dirVector = new Vector(DIRECTION_DIFFS[hDir].x * scalarFactor, DIRECTION_DIFFS[hDir].y * scalarFactor)
                    pTargetPos = new Vector(pTargetPos.x + dirVector.x, pTargetPos.y + dirVector.y);
                    h.action = 'idle'
                    h.pos = pTargetPos;
                }
            }
        }
    
    },

    stunTurtle(h, damage, slowDuration, slowFactor)
    {
        let slowEffects = h.effects.filter(e => e.name == 'slow');
            if (slowEffects && slowEffects.length) {
                slowEffects.forEach(e => e.timeSinceStart = 0);
            }
            else {
                h.addEffect({name: 'slow', duration: slowDuration,
                    revertsProportionally: true, factor: slowFactor, targetProperty: 'maxSpeed'});                            
            }
            let stunEffect = this.instabuild('stun-effect', h.pos.x, h.pos.y);
            stunEffect.lifespan =slowDuration;
            stunEffect.followOffset = new Vector(0,0,9);
            stunEffect.clingTo(h)
            h.takeDamage(damage);
    },


    update() {
        
        for (let h of this.heroes) {
            h.say("")
            h.teamPower = Math.round(h.score);
            // h.teamPower = Math.round(h.teamPower * 100) / 100;
            h.keepTrackedProperty('teamPower');
        }
        if (!this.winner) {
            this.checkWinners();
        }
        this.items = this.items.filter(item => item.exists);
        this.portals = this.portals.filter(portal => portal.exists);
        this.shadows = this.shadows.filter(shadow => shadow.exists);
        this.shockTraps = this.shockTraps.filter(trap => trap.exists);
        this.crabs = this.crabs.filter(crab => crab.exists);
        
        // for (let y = 1; y < this.maxRows - 1; y++) {
        //     for (let x = 1; x < this.maxCols - 1; x++) {
        //         if (this.solarMap[y][x] > 0) {
        //             this.solarMap[y][x] -= this.world.dt;
        //             if (this.lavaMap[y][x] <= 0) {
        //                 this.lavaMap[y][x] = 0;
        //             }
        //         }
        //         if (this.lavaMap[y][x] < 0) {
        //             this.lavaMap[y][x] += this.world.dt;
        //             if (this.lavaMap[y][x] >= 0) {
        //                 this.lavaMap[y][x] = 0;
        //             }
        //         }
        //     }
        // }
        this.reconcileClosedShape();
        this.rebuildSolarField();
        this.reconcileShadowDamage();
        this.reconcileIntents();
        this.reconcileShockTrap();
        this.reconcilePortals();
    }
});