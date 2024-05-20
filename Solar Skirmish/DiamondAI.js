
const SHADOW_WIDTH = 10
const SHADOW_HEIGHT = 8
const STEP = 4
const opponent = hero.opponent
let lastHeroDirection = "right"
let lastDirection = null

let SHOCK_TRAP = "shockTrap"
let WATER_GUN = "waterGun"
let closedShapeArray = []

const MOVE_DIRECTION = {
    "right":hero.moveRight,
    "left":hero.moveLeft,
    "top":hero.moveUp,
    "bottom":hero.moveDown
}
function thangContainsThang(width,height, shadObj, x, y) {
    let thangWidth = width
    let thangHeight = height
    let halfThangWidth = thangWidth / 2;
    let halfThangHeight = thangHeight / 2;
    let left = shadObj.x - halfThangWidth;
    let right = shadObj.x + halfThangWidth;
    let top = shadObj.y + halfThangHeight;
    let bottom = shadObj.y - halfThangHeight;
    return left <= x && x <=  right && y <= top && y >= bottom;
}

function shadowDamaged(x,y)
{
    let shadows = hero.findShadows()
    for(let i =0;i<shadows.length;i++)
    {
        let shadow = shadows[i]
        if(thangContainsThang(SHADOW_WIDTH,SHADOW_HEIGHT,shadow, x, y))
        {
            return true
        }
    }
    return false
}

function getWaterGunScore()
{
    if (!hero.isReady("waterGun"))
    {
        return -1;
    }
    let deltaX = opponent.x - hero.x;
    let deltaY = opponent.y - hero.y;
    if(Math.abs(deltaX) < 1 && Math.abs(deltaY) > 15 ||
        Math.abs(deltaY) < 1 && Math.abs(deltaX) > 15)
    {
        return 100;
    }
    return 0;
}

function getShockTrapScore()
{
    if(!hero.isReady("shockTrap"))
    {
        return -1;
    }
    let dist = get2DDistance(hero.x,hero.y,opponent.x,opponent.y)
    if(shadowDamaged(hero.x,hero.y))
    {
        return 9999;
    }
    if(dist < 5)
    {
        return 1000
    }
    if(dist > 50)
    {
        return 200
    }
    
    return 0
}

function get2DDistance(x1,y1,x2,y2)
{
    return Math.sqrt(Math.pow(x1-x2,2) + Math.pow(y1-y2,2))
}
function waterGun()
{
    let opponentX = opponent.x;
    let opponentY = opponent.y;
    let heroX = hero.x;
    let heroY = hero.y;
    let deltaX = opponentX - heroX;
    let deltaY = opponentY - heroY;
    let absDeltaX = Math.abs(deltaX)
    let absDeltaY = Math.abs(deltaY)
    let originalDirection = hero.direction  
    if(absDeltaX > absDeltaY)
    {
        // we shoot horizontally here
        if(deltaX > 0)
        {
           turnHero("right")
        }else{
            turnHero("left")
        
        }
    }else{
        // we shoot vertically here
        if(deltaY > 0)
        {
           turnHero("up")
        }else{
            turnHero("down")
        }
    }
    hero.ability('waterGun')
    turnHero(originalDirection)
    
}
function shockTrap()
{
    hero.ability("shockTrap")
}

function getMoveScore()
{
    return hero.health


}
// function updateClosedShapeArray()
// {
//     closedShapeArray = hero.getSolarMap()
//     let surroundedRedArray = Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1))
//     let surroundedBlueArray = Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1))
//     for(let h of this.heroes)
//     {
//         if(!h.currentCell){
//             continue
//         }
//         let relevantColor = h.color == RED ? 1 : -1;
//         for(let i = h.currentCell.row - 1; i <= h.currentCell.row + 1; i++)
//         {
//             for(let j = h.currentCell.col - 1; j <= h.currentCell.col + 1; j++)
//             {
//                 if(i <= 0 || i >= this.maxRows - 1 || j <= 0 || j >= this.maxCols - 1){
//                     continue;
//                 }
//                 if(this.solarMap[i][j] == (relevantColor)){
//                     continue;
//                 }
//                 let isSurrounded = this.isSurroundedBy(i,j,relevantColor, h.color == RED ? surroundedRedArray : surroundedBlueArray)
//                 if(isSurrounded){
//                     this.fillSolarCell(i,j,relevantColor, Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1)));
//                 }
//             }
//         }
//     }    
    
// }
// function countFillScore(r, c, sign, surroundedArray) {
//     let queue = [[r, c]];
//     let isSurrounded = true;
//     let visited = Array.from({ length: this.maxRows + 1 }, () => Array(this.maxCols + 1).fill(-1))

//     while(queue.length > 0) {
//         let [r, c] = queue.shift();
//         if(visited[r][c] !== -1){
//             continue
//         }
//         visited[r][c] = true;

//         if ((c == 0 || c == this.maxCols - 1 || r == 0 || r == this.maxRows - 1) && this.solarMap[r][c] != sign) {
//             isSurrounded = false;
//             break;
//         }

//         if (this.solarMap[r][c] == sign) {
//             continue;
//         }

//         [[r-1, c], [r+1, c], [r, c-1], [r, c+1]].forEach(([nr, nc]) => {
//             if (nr >= 0 && nr < this.maxRows && nc >= 0 && nc < this.maxCols && visited[nr][nc] === -1) {
//                 queue.push([nr, nc]);
//             }
//         });
//     }

//     return isSurrounded;
// }
// function fillSolarCell(r, c, sign, visited){
//     if(r <= 0 || r >= this.maxRows || c <= 0 || c >= this.maxCols || visited[r][c] == true || this.solarMap[r][c] == sign) {
//         return;
//     }
//     this.createSolarCell(r, c, sign == 1 ? RED : BLUE);
//     visited[r][c] = true;
//     this.fillSolarCell(r-1,c,sign, visited);
//     this.fillSolarCell(r+1,c,sign, visited);
//     this.fillSolarCell(r,c-1,sign, visited);
//     this.fillSolarCell(r,c+1,sign, visited);
// }

function getBestItem()
{
    let items = hero.findItems()
    //sort item by nearest
    items.sort((a,b) => {
        let aDistance = Math.abs(a.x - hero.x) + Math.abs(a.y - hero.y)
        let bDistance = Math.abs(b.x - hero.x) + Math.abs(b.y - hero.y)
        return aDistance - bDistance
    })
    let bestItem = null;
    let bestItemScore = 0;
    
    for(let i =0;i<items.length;i++)
    {
        let item = items[i]
        let gradeItem = gradeItem(item)
        if(shadowDamaged(item.x,item.y))
        {
            gradeItem /= 5

        }
        gradeItem *= Math.max(0.1,1 - get2DDistance(hero.x,hero.y,item.x,item.y)*0.1)
        if(gradeItem > bestItemScore)
        {
            bestItem = item;
            bestItemScore = gradeItem
        }
    }
    return bestItem
}
let ITEM_TO_TYPES = {
    "speed-battery": 125,
    "heal-battery": 100,
    "solar-battery": 50
}
function gradeItem(item)
{
    let itemScore = ITEM_TO_TYPES[item.type]
    if((hero.health < 30 || hero.health - opponent.health < -10) && item.type == "heal-battery")
    {
        itemScore += 200
    }
    if(hero.score - opponent.score < -500 && hero.health > 50 && item.type == "solar-battery")
    {
        itemScore += 100
    }
    return itemScore
}

let DIR_TO_VECTOR = {
    "right":{x:1,y:0},
    "left":{x:-1,y:0},
    "up":{x:0,y:1},
    "down":{x:0,y:-1}

}
let DIR_TO_VECTOR_STEP = {
    "right":{x:STEP,y:0},
    "left":{x:-STEP,y:0},
    "up":{x:0,y:STEP},
    "down":{x:0,y:-STEP}

}
function doMove()
{
    let opponentX = opponent.x;
    let opponentY = opponent.y;

    let bestItem = getBestItem();
    
    if(!bestItem || bestItem == null)
    {
        return;
    }

    let heroModulusX = hero.x - hero.x%STEP;
    let heroModulusY = hero.y - hero.y%STEP;

    let itemModulusX = bestItem.x - bestItem.x%STEP;
    let itemModulusY = bestItem.y - bestItem.y%STEP;
    let heroX = hero.x;
    let heroY = hero.y;
    let deltaX = bestItem.x - heroX;
    let deltaY = bestItem.y - heroY;
    let absDeltaX = Math.abs(deltaX)
    let absDeltaY = Math.abs(deltaY)
    let heroPos = {x:hero.x,y:hero.y}
    if(absDeltaX > absDeltaY)
    {
        if(heroModulusX < itemModulusX)
        {
            turnHero("right")
            hero.moveForward();
        }else if(heroModulusX > itemModulusX)
        {
            turnHero("left")
            hero.moveForward();
        }
    }else{
        if(heroModulusY > itemModulusY)
        {
            turnHero("down")
            hero.moveForward();
        }else if(heroModulusY < itemModulusY){
            turnHero("up")
            hero.moveForward();
        }
    }

}

function turnHero(dir)
{
    if(dir == lastHeroDirection)
    {
        return;
    }

    hero.turn(dir)
    lastHeroDirection = dir;
}

function gradeMove()
{
    let doAction = "";
    let maxScore = 0;

    let waterGunScore = getWaterGunScore();
    if(waterGunScore > maxScore)
    {
        maxScore = waterGunScore;
        doAction = "waterGun";
    }

    let shockTrapScore = getShockTrapScore();
    if(shockTrapScore > maxScore)
    {
        maxScore = shockTrapScore;
        doAction = "shockTrap";
    }

    let moveScore = getMoveScore();
    if(moveScore > maxScore)
    {
        maxScore = moveScore;
        doAction = "move"
    }

    switch(doAction)
    {
        case "waterGun":
            waterGun()
            break;
        case "shockTrap":
            shockTrap();
            break;
        case "move":
            doMove();
            break;
        default:
            break;
    
    }

}

function moveTurtle(direction)
{
    
}

while(true)
{
    gradeMove()
}
