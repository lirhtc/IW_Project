// --------- IW project Objects ---------


// IW_Game_Party
//
// The game object class for the party. Information such as gold and items is
// included.

function IW_Game_Party() {
    this.initialize.apply(this, arguments);
}

IW_Game_Party.prototype = Object.create(Game_Unit.prototype);
IW_Game_Party.prototype.constructor = IW_Game_Party;

IW_Game_Party.ABILITY_ENCOUNTER_HALF    = 0;
IW_Game_Party.ABILITY_ENCOUNTER_NONE    = 1;
IW_Game_Party.ABILITY_CANCEL_SURPRISE   = 2;
IW_Game_Party.ABILITY_RAISE_PREEMPTIVE  = 3;
IW_Game_Party.ABILITY_GOLD_DOUBLE       = 4;
IW_Game_Party.ABILITY_DROP_ITEM_DOUBLE  = 5;

IW_Game_Party.prototype.initialize = function() {
    Game_Unit.prototype.initialize.call(this);
    this._gold = 0;
	this._silver = 0;
	this._copper = 0;
    this._steps = 0;	
	this._enableBagSlots = 64;
    this._lastItem = new IW_Game_Item();
    this._menuActorId = 1;
    this._targetActorId = 0;
    this._actors = [];
    this.initAllItems();
	this._occupiedSlots = 0;
	this._textColour = '#ffff00';
	this.initialMembers();
};

IW_Game_Party.prototype.enableBagSlots = function() {
    return this._enableBagSlots;
};
IW_Game_Party.prototype.occupiedSlots = function() {
    return this._occupiedSlots;
};
IW_Game_Party.prototype.allItems = function() {
    return this._items;
};
IW_Game_Party.prototype.initAllItems = function() {
	this._items = [];
	var i = this.enableBagSlots();
	while (i)
	{
		i--;
		this._items[i] = null;
	}
};

IW_Game_Party.prototype.exists = function() {
    return this._actors.length > 0;
};
IW_Game_Party.prototype.initialMembers = function() {
    var member = $IWdataActors.length;
	for (var i = 0; i<member; i++) {
		if (!this._actors.contains (i) && $IWdataActors[i] != null)
		{
			this._actors.push(i);
		}
	}
};
IW_Game_Party.prototype.size = function() {
    return this.members().length;
};

IW_Game_Party.prototype.isEmpty = function() {
    return this.size() === 0;
};

IW_Game_Party.prototype.members = function() {
    return this.inBattle() ? this.battleMembers() : this.allMembers();
};

IW_Game_Party.prototype.allMembers = function() {
    return this._actors.map(function(id) {
        return $clientActors.actor(id);
    });
};

IW_Game_Party.prototype.battleMembers = function() {
    return this.allMembers().slice(0, this.maxBattleMembers()).filter(function(actor) {
        return actor.isAppeared();
    });
};

IW_Game_Party.prototype.maxBattleMembers = function() {
    return 5;
};

IW_Game_Party.prototype.leader = function() {
    return this.battleMembers()[0];
};

IW_Game_Party.prototype.reviveBattleMembers = function() {
    this.battleMembers().forEach(function(actor) {
        if (actor.isDead()) {
            actor.setHp(1);
        }
    });
};

IW_Game_Party.prototype.items = function() {
    var num = this.enableBagSlots();
	var list = [];
    for (var i=0;i<num;i++)
	{
		if ((this._items[i]!=null) && !(this._items[i].basic.weaponcheck || this._items[i].basic.armorcheck))
		{
			list.push(this._items[i]);
		}
	}
	return list;
};

IW_Game_Party.prototype.weapons = function() {
    var num = this.enableBagSlots();
	var list = [];
    for (var i=0;i<num;i++)
	{
		if (this._items[i] && this._items[i].basic.weaponcheck)
		{
			list.push(this._items[i]);
		}
	}
	return list;
};

IW_Game_Party.prototype.armors = function() {
     var num = this.enableBagSlots();
	var list = [];
    for (var i=0;i<num;i++)
	{
		if (this._items[i] && this._items[i].basic.armorcheck)
		{
			list.push(this._items[i]);
		}
	}
	return list;
};

IW_Game_Party.prototype.equipItems = function() {
    return this.weapons().concat(this.armors());
};

IW_Game_Party.prototype.itemContainer = function(item) {
    if (!item) {
        return null;
    } else if (DataManager.isItem(item)) {
        return this._items;
    } else if (DataManager.isWeapon(item)) {
        return this._weapons;
    } else if (DataManager.isArmor(item)) {
        return this._armors;
    } else {
        return null;
    }
};
IW_Game_Party.prototype.setupStartingMembers = function() {
    this._actors = [];
    $dataSystem.partyMembers.forEach(function(actorId) {
		if ($IWdataActors.actor(actorId)) {
            this._actors.push(actorId);
        }
    }, this);
};

IW_Game_Party.prototype.name = function() {
    var numBattleMembers = this.battleMembers().length;
    if (numBattleMembers === 0) {
        return '';
    } else if (numBattleMembers === 1) {
        return this.leader().name();
    } else {
        return TextManager.partyName.format(this.leader().name());
    }
};

IW_Game_Party.prototype.setupBattleTest = function() {
    this.setupBattleTestMembers();
    this.setupBattleTestItems();
};

IW_Game_Party.prototype.setupBattleTestMembers = function() {
    $dataSystem.testBattlers.forEach(function(battler) {
        var actor = $IWdataActors.actor(battler.actorId);
        if (actor) {
            actor.changeLevel(battler.level, false);
            actor.initEquips(battler.equips);
            actor.recoverAll();
            this.addActor(battler.actorId);
        }
    }, this);
};

IW_Game_Party.prototype.setupBattleTestItems = function() {
    $dataItems.forEach(function(item) {
        if (item && item.name.length > 0) {
            this.gainItem(item, this.maxItems(item));
        }
    }, this);
};

IW_Game_Party.prototype.highestLevel = function() {
    return Math.max.apply(null, this.members().map(function(actor) {
        return actor.level;
    }));
};

IW_Game_Party.prototype.addActor = function(actorId) {
    if (!this._actors.contains(actorId)) {
        this._actors.push(actorId);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
    }
};

IW_Game_Party.prototype.removeActor = function(actorId) {
    if (this._actors.contains(actorId)) {
        this._actors.splice(this._actors.indexOf(actorId), 1);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
    }
};

IW_Game_Party.prototype.gold = function() {
    return this._gold;
};

IW_Game_Party.prototype.gainGold = function(amount) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
};

IW_Game_Party.prototype.loseGold = function(amount) {
    this.gainGold(-amount);
};

IW_Game_Party.prototype.maxGold = function() {
    return 99999999;
};

IW_Game_Party.prototype.steps = function() {
    return this._steps;
};

IW_Game_Party.prototype.increaseSteps = function() {
    this._steps++;
};

IW_Game_Party.prototype.numItems = function(item) {
    var container = this.itemContainer(item);
    return container ? container[item.id] || 0 : 0;
};

IW_Game_Party.prototype.maxItems = function(item) {
    return 99;
};

IW_Game_Party.prototype.hasMaxItems = function(item) {
    return this.numItems(item) >= this.maxItems(item);
};

IW_Game_Party.prototype.hasItem = function(item, includeEquip) {
    if (includeEquip === undefined) {
        includeEquip = false;
    }
    if (this.numItems(item) > 0) {
        return true;
    } else if (includeEquip && this.isAnyMemberEquipped(item)) {
        return true;
    } else {
        return false;
    }
};

IW_Game_Party.prototype.isAnyMemberEquipped = function(item) {
    return this.members().some(function(actor) {
        return actor.equips().contains(item);
    });
};

IW_Game_Party.prototype.gainItem = function(item, amount, includeEquip, partialGain) {
	//获取新物品 ：尝试放入，根据结果判断
	if (item != null || item != undefined){
	var tempItemList = this.tryToGain (item, amount);
	// 结果 完全放入或者没有完全放入
	// 完全放入成功
	if (tempItemList.amount === 0)
	{
		this._items = tempItemList.bag.slice(0);
		$gameTemp.toast("成功获得" + item.basic.name + amount + "件" ,this._textColour);
	}
	else if (partialGain)
	{
		//可以部分放入，并且没有完全放入
		this._items = tempItemList.bag.slice(0);
		$gameTemp.toast("成功获得" + item.basic.name + amount - tempItemList.amount+ "件，背包已满" ,this._textColour);
	}
	else
	{
		//没放入
		$gameTemp.toast("背包已满，无法获得物品！" ,this._textColour);
	}   
    $gameMap.requestRefresh();
	}
};
IW_Game_Party.prototype.loseItem = function(item, amount) {
	var index = this._items.indexOf (item);
	if (index>=0)
	{
	    if (this._items[index].basic.num >= amount)
		{
			this._items[index].basic.num -= amount;
			$gameTemp.toast("失去" + item.basic.name + "，共" + amount + "件" ,this._textColour);
		}
	}
	if (this._items[index].basic.num === 0) {this._items[index]=null;}
};
IW_Game_Party.prototype.loseItemIndex = function(item, amount, slotId) {
	var index = this._items.indexOf (item);
	if (index>=0)
	{
	    if (this._items[slotId].basic.num >= amount)
		{
			this._items[slotId].basic.num -= amount;
			$gameTemp.toast("失去" + item.basic.name + "，共" + amount + "件" ,this._textColour);
		}
	}
	if (this._items[slotId].basic.num === 0) {this._items[slotId] = null;}
};
IW_Game_Party.prototype.tryToGain = function(item, amount) {
	//尝试将物品放入
	var item = DeepCopy(item);
    var tempItemList = {};
	//每组最大堆叠
	if (item.basic.hasOwnProperty('stackNum'))
	    {
		var stack = item.basic.stackNum;
		}
		else
		{
		var stack = 1;
		}
	// 循环放入
	var slotsNum = this.enableBagSlots();
	var tempBag = this._items.slice(0);
	for (var i=0; i<slotsNum; i++)
	{
		if (item && tempBag[i] === null)
		{
			var avalibleSlot = stack;
			var numInSlot = avalibleSlot > amount ? amount : avalibleSlot;
			amount -= numInSlot;
			tempBag[i] = item;
			tempBag[i].num = numInSlot;
		}
	    else if (this.sameItem (item,tempBag[i]))	
		{				
			var avalibleSlot = stack-tempBag[i].num;
			var numInSlot = avalibleSlot > amount ? amount : avalibleSlot;
			amount -= numInSlot;
			tempBag[i].num += numInSlot;
			// 如果系统提示获得物品，这里提示
		}
		if (amount === 0) {break;}
	}
	tempItemList.amount = amount;
	tempItemList.bag = tempBag;
	return tempItemList;
};
IW_Game_Party.prototype.sameItem = function(item1, item2) {
    return (item1.basic.id===item2.basic.id) && !(item1.basic.weaponcheck || item2.basic.weaponcheck || item2.basic.armorcheck || item1.basic.armorcheck) && (item1.basic.type === item2.basic.type);
	};

IW_Game_Party.prototype.discardMembersEquip = function(item, amount) {
    var n = amount;
    this.members().forEach(function(actor) {
        while (n > 0 && actor.isEquipped(item)) {
            actor.discardEquip(item);
            n--;
        }
    });
};

IW_Game_Party.prototype.consumeItem = function(item) {
    if (DataManager.isItem(item) && item.consumable) {
        this.loseItem(item, 1);
    }
};

IW_Game_Party.prototype.canUse = function(item) {
    return this.members().some(function(actor) {
        return actor.canUse(item);
    });
};

IW_Game_Party.prototype.canInput = function() {
    return this.members().some(function(actor) {
        return actor.canInput();
    });
};

IW_Game_Party.prototype.isAllDead = function() {
    if (Game_Unit.prototype.isAllDead.call(this)) {
        return this.inBattle() || !this.isEmpty();
    } else {
        return false;
    }
};

IW_Game_Party.prototype.onPlayerWalk = function() {
    this.members().forEach(function(actor) {
        return actor.onPlayerWalk();
    });
};

IW_Game_Party.prototype.menuActor = function() {
    var actor = $IW_gameActors._data[this._menuActorId];
    if (!this.members().contains(actor)) {
        actor = this.members()[0];
    }
    return actor;
};

IW_Game_Party.prototype.setMenuActor = function(actor) {
    this._menuActorId = actor._parameters.actorId;
};

IW_Game_Party.prototype.makeMenuActorNext = function() {
    var index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
        index = (index + 1) % this.members().length;
        this.setMenuActor(this.members()[index]);
    } else {
        this.setMenuActor(this.members()[0]);
    }
};

IW_Game_Party.prototype.makeMenuActorPrevious = function() {
    var index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
        index = index === 0 ? (this.members().length-1) : (index - 1) % this.members().length;
        this.setMenuActor(this.members()[index]);
    } else {
        this.setMenuActor(this.members()[0]);
    }
};

IW_Game_Party.prototype.targetActor = function() {
    var actor = $gameActors.actor(this._targetActorId);
    if (!this.members().contains(actor)) {
        actor = this.members()[0];
    }
    return actor;
};

IW_Game_Party.prototype.setTargetActor = function(actor) {
    this._targetActorId = actor.actorId();
};

IW_Game_Party.prototype.lastItem = function() {
    return this._lastItem.object();
};

IW_Game_Party.prototype.setLastItem = function(item) {
    this._lastItem.setObject(item);
};

IW_Game_Party.prototype.swapOrder = function(index1, index2) {
    var temp = this._actors[index1];
    this._actors[index1] = this._actors[index2];
    this._actors[index2] = temp;
    $gamePlayer.refresh();
};

IW_Game_Party.prototype.charactersForSavefile = function() {
    return this.battleMembers().map(function(actor) {
        return [actor.characterName(), actor.characterIndex()];
    });
};

IW_Game_Party.prototype.facesForSavefile = function() {
    return this.battleMembers().map(function(actor) {
        return [actor.faceName(), actor.faceIndex()];
    });
};

IW_Game_Party.prototype.partyAbility = function(abilityId) {
    return this.battleMembers().some(function(actor) {
        return actor.partyAbility(abilityId);
    });
};

IW_Game_Party.prototype.hasEncounterHalf = function() {
    return this.partyAbility(IW_Game_Party.ABILITY_ENCOUNTER_HALF);
};

IW_Game_Party.prototype.hasEncounterNone = function() {
    return this.partyAbility(IW_Game_Party.ABILITY_ENCOUNTER_NONE);
};

IW_Game_Party.prototype.hasCancelSurprise = function() {
    return this.partyAbility(IW_Game_Party.ABILITY_CANCEL_SURPRISE);
};

IW_Game_Party.prototype.hasRaisePreemptive = function() {
    return this.partyAbility(IW_Game_Party.ABILITY_RAISE_PREEMPTIVE);
};

IW_Game_Party.prototype.hasGoldDouble = function() {
    return this.partyAbility(IW_Game_Party.ABILITY_GOLD_DOUBLE);
};

IW_Game_Party.prototype.hasDropItemDouble = function() {
    return this.partyAbility(IW_Game_Party.ABILITY_DROP_ITEM_DOUBLE);
};

IW_Game_Party.prototype.ratePreemptive = function(troopAgi) {
    var rate = this.agility() >= troopAgi ? 0.05 : 0.03;
    if (this.hasRaisePreemptive()) {
        rate *= 4;
    }
    return rate;
};

IW_Game_Party.prototype.rateSurprise = function(troopAgi) {
    var rate = this.agility() >= troopAgi ? 0.03 : 0.05;
    if (this.hasCancelSurprise()) {
        rate = 0;
    }
    return rate;
};

IW_Game_Party.prototype.performVictory = function() {
    this.members().forEach(function(actor) {
        actor.performVictory();
    });
};

IW_Game_Party.prototype.performEscape = function() {
    this.members().forEach(function(actor) {
        actor.performEscape();
    });
};

IW_Game_Party.prototype.removeBattleStates = function() {
    this.members().forEach(function(actor) {
        actor.removeBattleStates();
    });
};

IW_Game_Party.prototype.requestMotionRefresh = function() {
    this.members().forEach(function(actor) {
        actor.requestMotionRefresh();
    });
};

//判断该角色是否存在队伍中
IW_Game_Party.prototype.containsMember = function(actor) {
	if (actor){
    if (actor.hasOwnProperty('_parameters')){
		return this._actors.indexOf (actor._parameters.actorId) >= 0;
	}
	else return this._actors.indexOf (actor._parameters.actorId) >= 0;
	}
else {return false;}
};

IW_Game_Party.prototype.refreshStatus = function() {
	$gameActors._RL_data.forEach(function(e,i){
		if (e._parameters.result.advan[4] <= 0){
			e._parameters.result.advan[4] = 0;
			SceneManager._scene.actorSprites[i-1].visible = false;
		}
	});
};

//-----------------------------------------------------------------------------
// IW_Game_Item
//
// The game object class for handling skills, items, weapons, and armor. It is
// required because save data should not include the database object itself.

function IW_Game_Item() {
    this.initialize.apply(this, arguments);
}

IW_Game_Item.prototype.initialize = function(item) {
    this._dataClass = '';
    this._itemId = 0;
    if (item) {
        this.setObject(item);
    }
};

IW_Game_Item.prototype.isSkill = function() {
    return this._dataClass === 'skill';
};

IW_Game_Item.prototype.isItem = function() {
    return this._dataClass === 'item';
};

IW_Game_Item.prototype.isUsableItem = function() {
    return this.isSkill() || this.isItem();
};

IW_Game_Item.prototype.isWeapon = function() {
    return this._dataClass === 'weapon';
};

IW_Game_Item.prototype.isArmor = function() {
    return this._dataClass === 'armor';
};

IW_Game_Item.prototype.isEquipItem = function() {
    return this.isWeapon() || this.isArmor();
};

IW_Game_Item.prototype.isNull = function() {
    return this._dataClass === '';
};

IW_Game_Item.prototype.itemId = function() {
    return this._itemId;
};

IW_Game_Item.prototype.object = function() {
    if (this.isSkill()) {
        return $dataSkills[this._itemId];
    } else if (this.isItem()) {
        return $dataItems[this._itemId];
    } else if (this.isWeapon()) {
        return $dataWeapons[this._itemId];
    } else if (this.isArmor()) {
        return $dataArmors[this._itemId];
    } else {
        return null;
    }
};

IW_Game_Item.prototype.setObject = function(item) {
    if (DataManager.isSkill(item)) {
        this._dataClass = 'skill';
    } else if (DataManager.isItem(item)) {
        this._dataClass = 'item';
    } else if (DataManager.isWeapon(item)) {
        this._dataClass = 'weapon';
    } else if (DataManager.isArmor(item)) {
        this._dataClass = 'armor';
    } else {
        this._dataClass = '';
    }
    this._itemId = item ? item.id : 0;
};

IW_Game_Item.prototype.setEquip = function(isWeapon, itemId) {
    this._dataClass = isWeapon ? 'weapon' : 'armor';
    this._itemId = itemId;
};
//-----------------------------------------------------------------------------
// IW_Game_Actors
//
// The wrapper class for an actor array.

function IW_Game_Actors() {
    this.initialize.apply(this, arguments);
};

IW_Game_Actors.prototype.initialize = function() {
    this._data = [];
};

IW_Game_Actors.prototype.actor = function(actorId) {
    if ($IWdataActors[actorId]) {
        if (!this._data[actorId]) {
            this._data[actorId] = new IW_Game_Actors(actorId);
        }
        return this._data[actorId];
    }
    return null;
};
//------------------------------------------------------------------------------
// IW_Select_Cursor
//
// The cursor class used to dispaly a cursor with curtain color 
function IW_Select_Cursor (x,y,width,height,color){
    this.initialize.apply(this, arguments);
}

IW_Select_Cursor.prototype.constructor = IW_Select_Cursor

IW_Select_Cursor.prototype.initialize = function (x,y,width,height,color)
{
    this.sprite = new IW_Sprite_Select(x,y,width,height,color);
    this.index = 0;
    SceneManager._scene.addChild(this.sprite);
};

IW_Select_Cursor.prototype.pause = function ()
{
    this._oldSpeed = this.sprite.speed;
    this.sprite.speed = 0;
    this.sprite.alpha = 1;
};

IW_Select_Cursor.prototype.resume = function ()
{
    if (this._oldSpeed) {this.sprite.speed = this._oldSpeed;}
    else
        {this.sprite.speed = 10;}
};

IW_Select_Cursor.prototype.setIndex = function (index)
{
    this.index = index;
};

IW_Select_Cursor.prototype.hide = function ()
{
    this.sprite.visible = false;
};

IW_Select_Cursor.prototype.show = function ()
{
    this.sprite.visible = true;
};

IW_Select_Cursor.prototype.setCursorPosition = function (x,y)
{
    this.sprite.x = x;
    this.sprite.y = y;
};

IW_Select_Cursor.prototype.setCursorSize = function (width, height)
{
    this.sprite.width = width+2;
    this.sprite.height = height +2;
    this.sprite.drawCursor(width,height);
};

//-----------------------------------------------------------------------------
// IW_EnemyTeam
//
// The wrapper class for an enemy team in battle

function IW_EnemyTeam() {
    this.initialize.apply(this, arguments);
};

IW_EnemyTeam.prototype.initialize = function() {
    this.enemies = [];
	this.index = 0;
	this.active = false;
	this._handlers = {};
	this.loadBitmap();
	console.log('d');
};

IW_EnemyTeam.prototype.loadBitmap = function() {
	this.arrowBitmap = ImageManager.loadSystem('battleArrow');
	this.arrowBitmap.addLoadListener(function(){
		this.arrowSprite = new Sprite();
		this.arrowSprite.scale._x = 0.25;
		this.arrowSprite.scale._y = 0.25;
		this.arrowSprite.visible = false;
		this.arrowSprite.bitmap = this.arrowBitmap;
		this.refreshArrowPosition();
		SceneManager._scene.addChild(this.arrowSprite);
	}.bind(this));
};

IW_EnemyTeam.prototype.add = function(enemy) {
	var spriteContainer = $gameTroop.spriteContainer;
	var x = enemy._screenX;
	var y = enemy._screenY;
	var fileName = enemy.spine.animation;
	var id = RR_Spine.creatAnimation('idle', fileName, x, y, 1, 1);
	RR_Spine.startAnimation(id,enemy.spine.flipX,enemy.spine.flipY,this.enemies,spriteContainer);
};

IW_EnemyTeam.prototype.loadSpine = function(name) {

	PIXI.loader.add(name,RR.Spine.Param.path + chosedAnimation.fileName + '.json')
	var id = RR_Spine.creatAnimation('idle', fileName, x, y, 1, 1);
	RR_Spine.startAnimation(id,enemy.spine.flipX,enemy.spine.flipY,this.enemies,spriteContainer);
};


// test the enemy with index wether is spine (true) or sprite (false)
IW_EnemyTeam.prototype.spineSpriteTest = function(index) {
	if (index <= this.spriteContainer.length){
		return this.spriteContainer[index].hasOwnProperty('skeleton');
	} else {
		return null;
	}
};
// move the enemy to target position with callback after it reachthe position
IW_EnemyTeam.prototype.moveTo = function(index,targetX, targetY, callback) {
	var spineTest = this.spineSpriteTest(index);
	if (spineTest != null && spineTest){
		
	}
};

IW_EnemyTeam.prototype.activate = function() {
	this.active = true;
	this.arrowSprite.visible = true;
};

IW_EnemyTeam.prototype.select = function(index) {
	this.enemies[this.index].deselect();
	this.enemies[index].select();
	this.index = index;
	this.refreshArrowPosition();
};

IW_EnemyTeam.prototype.refreshArrowPosition = function() {
	var index  = this.index;
	if (this.enemies[index]){
		var index = this.index;
		var x = this.enemies[index].children[0].x+50;
		var y = Math.floor(this.enemies[index].children[0].y-100);
		this.arrowSprite.x = x;
		this.arrowSprite.y = y;
		}
};

IW_EnemyTeam.prototype.deselectAll = function() {
	this.enemies[this.index].deselect();
};

IW_EnemyTeam.prototype.deactivate = function() {
	this.deselectAll();
	this.arrowSprite.visible = false;
	this.active = false;
};

IW_EnemyTeam.prototype.update = function() {
	if (this.active){
		this.updateInput();
	}
};

IW_EnemyTeam.prototype.updateInput = function() {
	var numEnemies = this.enemies.length;
	if (Input.isTriggered('up'))
	{
		Input.clear();
		this.select ((this.index-1+numEnemies)% numEnemies)
	}
	if (Input.isTriggered('down'))
	{
		Input.clear();
		this.select((this.index+1+numEnemies)% numEnemies)
	}
	if(Input.isRepeated('ok') && this.okEnable()){
		Input.clear();
		this._handlers['ok']();
		}
	if(Input.isRepeated('cancel') && this.cancelEnable()){
		Input.clear();
		this._handlers['cancel']();
	    }
};

IW_EnemyTeam.prototype.setHandler = function(symbol,method) {
	this._handlers[symbol] = method;
};

IW_EnemyTeam.prototype.okEnable = function() {
	return !!this._handlers['ok'];
};
IW_EnemyTeam.prototype.cancelEnable = function() {
	return !!this._handlers['cancel'];
};

//-----------------------------------------------------------------------------
// Game_Troop
//
// The game object class for a troop and the battle-related data.

function Game_Troop() {
    this.initialize.apply(this, arguments);
}

Game_Troop.prototype = Object.create(Game_Unit.prototype);
Game_Troop.prototype.constructor = Game_Troop;

Game_Troop.LETTER_TABLE_HALF = [
    ' A',' B',' C',' D',' E',' F',' G',' H',' I',' J',' K',' L',' M',
    ' N',' O',' P',' Q',' R',' S',' T',' U',' V',' W',' X',' Y',' Z'
];
Game_Troop.LETTER_TABLE_FULL = [
    'Ａ','Ｂ','Ｃ','Ｄ','Ｅ','Ｆ','Ｇ','Ｈ','Ｉ','Ｊ','Ｋ','Ｌ','Ｍ',
    'Ｎ','Ｏ','Ｐ','Ｑ','Ｒ','Ｓ','Ｔ','Ｕ','Ｖ','Ｗ','Ｘ','Ｙ','Ｚ'
];

Game_Troop.prototype.initialize = function() {
    Game_Unit.prototype.initialize.call(this);
    this._interpreter = new Game_Interpreter();
	this.spriteChildren = [];
    this.clear();
};

Game_Troop.prototype.isEventRunning = function() {
    return this._interpreter.isRunning();
};

Game_Troop.prototype.updateInterpreter = function() {
    this._interpreter.update();
};

Game_Troop.prototype.turnCount = function() {
    return this._turnCount;
};

Game_Troop.prototype.members = function() {
    return this._enemies;
};

Game_Troop.prototype.clear = function() {
    this._interpreter.clear();
    this._troopId = 0;
    this._eventFlags = {};
    this._enemies = [];
    this._turnCount = 0;
    this._namesCount = {};
};

Game_Troop.prototype.troop = function() {
    return $dataTroops[this._troopId];
};

Game_Troop.prototype.setup = function(troopId) {
    this.clear();
    this._troopId = troopId;
    this._enemies = [];
    this.troop().members.forEach(function(member) {
        if ($dataEnemies[member.enemyId]) {
            var enemyId = member.enemyId;
            var x = member.x;
            var y = member.y;
            var enemy = new IW_Game_Enemy(enemyId, x, y);
			enemy.formation = member.formation;
			enemy = this.formationSet(enemy);
            if (member.hidden) {
                enemy.hide();
            }
            this._enemies.push(enemy);
        }
    }, this);
    this.makeUniqueNames();
};

Game_Troop.prototype.formationSet = function(enemy) {
    var h = Graphics.height;
    var w = Graphics.width;
	var systemFormation = $RL_systemSettings.formation[enemy.formation.id];
	var battleField = $RL_systemSettings.battleFiled ;
	var positionId = enemy.formation.position-1;
	enemy._screenX = 50 + Math.floor((battleField.enemySide.x + battleField.enemySide.width*systemFormation.positions.x[positionId])*w);
	enemy._screenY = 50 + Math.floor((battleField.enemySide.y +  battleField.enemySide.height*systemFormation.positions.y[positionId])*h);
    	
	return enemy;
};

Game_Troop.prototype.makeUniqueNames = function() {
    var table = this.letterTable();
    this.members().forEach(function(enemy) {
        if (enemy.isAlive() && enemy.isLetterEmpty()) {
            var name = enemy.originalName();
            var n = this._namesCount[name] || 0;
            enemy.setLetter(table[n % table.length]);
            this._namesCount[name] = n + 1;
        }
    }, this);
    this.members().forEach(function(enemy) {
        var name = enemy.originalName();
        if (this._namesCount[name] >= 2) {
            enemy.setPlural(true);
        }
    }, this);
};

Game_Troop.prototype.letterTable = function() {
    return $gameSystem.isCJK() ? Game_Troop.LETTER_TABLE_FULL :
            Game_Troop.LETTER_TABLE_HALF;
};

Game_Troop.prototype.enemyNames = function() {
    var names = [];
    this.members().forEach(function(enemy) {
        var name = enemy.originalName();
        if (enemy.isAlive() && !names.contains(name)) {
            names.push(name);
        }
    });
    return names;
};

Game_Troop.prototype.meetsConditions = function(page) {
    var c = page.conditions;
    if (!c.turnEnding && !c.turnValid && !c.enemyValid &&
            !c.actorValid && !c.switchValid) {
        return false;  // Conditions not set
    }
    if (c.turnEnding) {
        if (!BattleManager.isTurnEnd()) {
            return false;
        }
    }
    if (c.turnValid) {
        var n = this._turnCount;
        var a = c.turnA;
        var b = c.turnB;
        if ((b === 0 && n !== a)) {
            return false;
        }
        if ((b > 0 && (n < 1 || n < a || n % b !== a % b))) {
            return false;
        }
    }
    if (c.enemyValid) {
        var enemy = $gameTroop.members()[c.enemyIndex];
        if (!enemy || enemy.hpRate() * 100 > c.enemyHp) {
            return false;
        }
    }
    if (c.actorValid) {
        var actor = $gameActors.actor(c.actorId);
        if (!actor || actor.hpRate() * 100 > c.actorHp) {
            return false;
        }
    }
    if (c.switchValid) {
        if (!$gameSwitches.value(c.switchId)) {
            return false;
        }
    }
    return true;
};

Game_Troop.prototype.setupBattleEvent = function() {
    if (!this._interpreter.isRunning()) {
        if (this._interpreter.setupReservedCommonEvent()) {
            return;
        }
        var pages = this.troop().pages;
        for (var i = 0; i < pages.length; i++) {
            var page = pages[i];
            if (this.meetsConditions(page) && !this._eventFlags[i]) {
                this._interpreter.setup(page.list);
                if (page.span <= 1) {
                    this._eventFlags[i] = true;
                }
                break;
            }
        }
    }
};

Game_Troop.prototype.increaseTurn = function() {
    var pages = this.troop().pages;
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        if (page.span === 1) {
            this._eventFlags[i] = false;
        }
    }
    this._turnCount++;
};

Game_Troop.prototype.expTotal = function() {
    return this.deadMembers().reduce(function(r, enemy) {
        return r + enemy.exp();
    }, 0);
};

Game_Troop.prototype.goldTotal = function() {
    return this.deadMembers().reduce(function(r, enemy) {
        return r + enemy.gold();
    }, 0) * this.goldRate();
};

Game_Troop.prototype.goldRate = function() {
    return $gameParty.hasGoldDouble() ? 2 : 1;
};

Game_Troop.prototype.makeDropItems = function() {
    return this.deadMembers().reduce(function(r, enemy) {
        return r.concat(enemy.makeDropItems());
    }, []);
};

Game_Troop.prototype.getPosition = function(index) {
	index = index || 0;
    var enemy = this._enemies[index];
	if (enemy.hasOwnProperty('spine')){
		var enemySpineSprite = SceneManager._scene._spriteset._enemyTeam.enemies[index];
		return {'x':enemySpineSprite.x, 'y': enemySpineSprite.y };
	} else {
		
	}
};

Game_Troop.prototype.setMove = function(index,targetX, targetY) {
	index = index || 0;
    var enemy = this._enemies[index];
	if (enemy.hasOwnProperty('spine')){
		var enemySpineSprite = SceneManager._scene._spriteset._enemyTeam.enemies[index];
		enemySpineSprite.moveTo(targetX, targetY);
	} else {
		
	}
};

Game_Troop.prototype.refreshStatus = function() {
	this._enemies.forEach(function (e,i){
		if (e._hp <= 0){
			e._hp = 0;
			SceneManager._scene.enemySpine[i].visible = false;
		}
	});
};