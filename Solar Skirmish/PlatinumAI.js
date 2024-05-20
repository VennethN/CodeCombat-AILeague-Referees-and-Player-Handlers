
const SHADOW_WIDTH = 10
const STEP = 4
const opponent = hero.opponent
let lastHeroDirection = "right"
let lastDirection = null
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
        if(thangContainsThang(SHADOW_WIDTH,SHADOW_WIDTH,shadow, x, y))
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
    return 80
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
    // print(absDeltaX)
    // if(absDeltaX > absDeltaY)
    // {
    //     // we shoot horizontally here
    //     if(deltaX > 0)
    //     {
    //         print("shoot right")
    //        turnHero("right")
    //     }else{
    //         print("shoot left")
    //         turnHero("left")
        
    //     }
    // }else{
    //     // we shoot vertically here
    //     if(deltaY > 0)
    //     {
    //         print("shoot up")
    //        turnHero("up")
    //     }else{
    //         print("shoot down")
    //         turnHero("down")
    //     }
    // }
    hero.ability('waterGun')
    // turnHero(originalDirection)
    
}
function shockTrap()
{
    hero.ability("shockTrap")
}

function getMoveScore()
{

    //Todo, put grading here


    return 20


}

function doMove()
{
    let opponentX = opponent.x;
    let opponentY = opponent.y;

    let items = hero.findItems()
    //sort item by nearest
    items.sort((a,b) => {
        let aDistance = Math.abs(a.x - hero.x) + Math.abs(a.y - hero.y)
        let bDistance = Math.abs(b.x - hero.x) + Math.abs(b.y - hero.y)
        return aDistance - bDistance
    })
    let nearestItem = null;
    for(let i =0;i<items.length;i++)
    {
        let item = items[i]
        if(shadowDamaged(item.x,item.y))
        {
            continue;
        }
        nearestItem = item;
        break;
    }
    if(!nearestItem || nearestItem == null)
    {
        return;
    }

    let heroModulusX = hero.x - hero.x%STEP;
    let heroModulusY = hero.y - hero.y%STEP;

    let itemModulusX = nearestItem.x - nearestItem.x%STEP;
    let itemModulusY = nearestItem.y - nearestItem.y%STEP;
    let heroX = hero.x;
    let heroY = hero.y;
    let deltaX = nearestItem.x - heroX;
    let deltaY = nearestItem.y - heroY;
    let absDeltaX = Math.abs(deltaX)
    let absDeltaY = Math.abs(deltaY)
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

    let moveScore = getMoveScore();
    if(moveScore > maxScore)
    {
        maxScore = moveScore;
        doAction = "move"
    }

    let shockTrapScore = getShockTrapScore();
    if(shockTrapScore > maxScore)
    {
        maxScore = shockTrapScore;
        doAction = "shockTrap";
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
