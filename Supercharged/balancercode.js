// This code is for the level Balancer

var version = <%= varVersion %>;

var unitChoice = <%= varUnitChoice %>;
var unitChoice2 = <%= varUnitChoice2 %>;

var unitPath = <%= varUnitPath %>;

if (unitChoice2 == "")
{
    unitChoice2 = unitChoice;
}

function collectorHandler(data) {
    var collector = data.collector;
    while(true)
    {
        if(collector.item) {
            collector.bring();
        }else{
            var item = collector.findNearestItem();
            if(item) {
                collector.pick(item);
            }
        }
    }
}

function fireballHandler() {
    if(hero.mana < 3){
        return;}
    var currentUnits = hero.findEnemyUnits()
    if(currentUnits.length === 0){
        return;
    }
    var bestUnitPair = [null,-1]
    for(let un of currentUnits) {
        let curScore = 0
        for(let unNear of currentUnits) {
            if(un == unNear){
                continue;
                }
            let unSc = un.distanceTo(unNear)
            if(10 - unSc < 0){continue;}
            curScore += 10-unSc
        }
        if(curScore >bestUnitPair[1])
        {
            bestUnitPair = [un, curScore]
            }
    }
    if(bestUnitPair.length === 0){
        return}
    if(bestUnitPair[0] === null)
    {return;}
    if(bestUnitPair[1] == -1){
        return}
    hero.cast("fireball",bestUnitPair[0].x,bestUnitPair[0].y)
}

function healHandler() {
    if(hero.mana < 3){
        return;}
    var currentUnits = hero.findMyUnits()
    if(currentUnits.length === 0){
        return;
    }
    var bestUnitPair = [null,-1]
    for(let un of currentUnits) {
        if (un.health == un.maxHealth){
            continue;
        }
        let curScore = un.maxHealth - un.health
        if(curScore > bestUnitPair[1]) {
            bestUnitPair = [un, curScore]
        }
    }
    if(bestUnitPair.length === 0){
        return}
    if(bestUnitPair[0] === null)
    {return;}
    if(bestUnitPair[1] == -1){
        return}
    hero.cast("healball",bestUnitPair[0].x,bestUnitPair[0].y)
}

function hasteHandler() {
    if(hero.mana < 3){
        return;}
    var currentUnits = hero.findMyUnits()
    if(currentUnits.length === 0){
        return;
    }
    var bestUnitPair = [null,-1]
    for(let un of currentUnits) {
        let curScore = un.x
        if(curScore > bestUnitPair[1]) {
            bestUnitPair = [un, curScore]
        }
    }
    if(bestUnitPair.length === 0){
        return}
    if(bestUnitPair[0] === null)
    {return;}
    if(bestUnitPair[1] == -1){
        return}
    hero.cast("hasteball",bestUnitPair[0].x,bestUnitPair[0].y)
}

var spellHandlerChoice = <%= varSpellHandlerChoice %>;

hero.on("spawn-collector", collectorHandler);
hero.spawnCollector();
hero.spawnCollector();

let iter = 0

let unitCosts ={
    "robot-soldier":5,
    "robot-spider":7,
    "robot-golem":15,
    "robot-turret":8,
    "robot-tower":12,
    "robobomb":10,
}

while (true) {
    if(iter%2==0)
    {
        if(hero.energy > unitCosts[unitChoice]){
            hero.summonUnit(unitChoice, unitPath);
            iter+=1;
        }
    }else{
        if(hero.energy > unitCosts[unitChoice2]){
            hero.summonUnit(unitChoice2, unitPath);
            iter+=1;
        }
    }
    // hero.cast("hasteball", 10, 50);
    if(hero.findMyCollectors().length < 3) {
        hero.spawnCollector();
    }
    spellHandlerChoice()
    // Summon other types of units and cast more spells! You could also adjust the existing code
    
}
