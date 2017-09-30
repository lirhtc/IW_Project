//-----------------------------------------------------------------------------
// IW_Game_Enemy
//
// The game object class for an enemy.

function IW_Game_Enemy() {
    this.initialize.apply(this, arguments);
}

IW_Game_Enemy.prototype = Object.create(Game_Battler.prototype);
IW_Game_Enemy.prototype.constructor = IW_Game_Enemy;

IW_Game_Enemy.prototype.initialize = function(enemyId, x, y) {
    Game_Battler.prototype.initialize.call(this);
    this.setup(enemyId, x, y);
};

IW_Game_Enemy.prototype.initMembers = function() {
    Game_Battler.prototype.initMembers.call(this);
    this._enemyId = 0;
    this._letter = '';
    this._plural = false;
    this._screenX = 0;
    this._screenY = 0;
};

IW_Game_Enemy.prototype.setup = function(enemyId, x, y) {
    this._enemyId = enemyId;
    this._screenX = x;
    this._screenY = y;
    this.recoverAll();
	this._parameter = {
		"result":{"advan":[]}
	};
	if ($dataEnemies[enemyId].spine) {
		this.spine = $dataEnemies[enemyId].spine;
		}
	var enemy = $dataEnemies[enemyId];
	var numParameters = $RL_systemSettings.parametersAdvanDisplayName.length;
	for (var i=0;i<numParameters;i++){
		this._parameter.result.advan[i]=0;
	}
	/* The parameter of an enemy is
	 * HP, MP, MAT, MDE, MDA (magic damager), MRE(magic resistance)
	 * melee Hit rate, speed
	 *
	 */
	 this.dropItems = enemy.dropItems;
};

IW_Game_Enemy.prototype.getDropItems = function() {
	var length = this.dropItems.length;
	var drop = [];
    for (var i=0; i<length; i++){
		var itemInfor = this.this.dropItems[i];
		if (itemInfor.kind > 0 && Math.random()> 1/ itemInfor.denominator){
			drop.push(this.getDrop(itemInfor.kind, itemInfor.dataId));
		}
	}
};

IW_Game_Enemy.prototype.getDrop = function(kind, dataId) {
    switch (kind){
		case 1:
			return this.getItem(dataId);
		case 2:
			return this.getWeapon(dataId);
		case 3:
			return this.getArmor(dataId);
	}
	return null;
};

IW_Game_Enemy.prototype.getItem = function(id) {
    var tempItem = $dataItems[id];
	if (tempItem.id == id){ return tempItem;}
	var numItems = $dataItems.length;
	for (var i = 0; i<numItems; i++){
		if ($dataItems[id].id == id){
			return $dataItems[id];
		}
	}
};

IW_Game_Enemy.prototype.isEnemy = function() {
    return true;
};

IW_Game_Enemy.prototype.isActor = function() {
    return false;
};

IW_Game_Enemy.prototype.friendsUnit = function() {
    return $gameTroop;
};

IW_Game_Enemy.prototype.opponentsUnit = function() {
    return $gameParty;
};

IW_Game_Enemy.prototype.index = function() {
    return $gameTroop.members().indexOf(this);
};

IW_Game_Enemy.prototype.isBattleMember = function() {
    return this.index() >= 0;
};

IW_Game_Enemy.prototype.enemyId = function() {
    return this._enemyId;
};

IW_Game_Enemy.prototype.enemy = function() {
    return $dataEnemies[this._enemyId];
};

IW_Game_Enemy.prototype.traitObjects = function() {
    return Game_Battler.prototype.traitObjects.call(this).concat(this.enemy());
};

IW_Game_Enemy.prototype.paramBase = function(paramId) {
    return this.enemy().params[paramId];
};

IW_Game_Enemy.prototype.exp = function() {
    return this.enemy().exp;
};

IW_Game_Enemy.prototype.gold = function() {
    return this.enemy().gold;
};

IW_Game_Enemy.prototype.makeDropItems = function() {
    return this.enemy().dropItems.reduce(function(r, di) {
        if (di.kind > 0 && Math.random() * di.denominator < this.dropItemRate()) {
            return r.concat(this.itemObject(di.kind, di.dataId));
        } else {
            return r;
        }
    }.bind(this), []);
};

IW_Game_Enemy.prototype.dropItemRate = function() {
    return $gameParty.hasDropItemDouble() ? 2 : 1;
};

IW_Game_Enemy.prototype.itemObject = function(kind, dataId) {
    if (kind === 1) {
        return $dataItems[dataId];
    } else if (kind === 2) {
        return $dataWeapons[dataId];
    } else if (kind === 3) {
        return $dataArmors[dataId];
    } else {
        return null;
    }
};

IW_Game_Enemy.prototype.isSpriteVisible = function() {
    return true;
};

IW_Game_Enemy.prototype.screenX = function() {
    return this._screenX;
};

IW_Game_Enemy.prototype.screenY = function() {
    return this._screenY;
};

IW_Game_Enemy.prototype.battlerName = function() {
    return this.enemy().battlerName;
};

IW_Game_Enemy.prototype.battlerHue = function() {
    return this.enemy().battlerHue;
};

IW_Game_Enemy.prototype.originalName = function() {
    return this.enemy().name;
};

IW_Game_Enemy.prototype.name = function() {
    return this.originalName() + (this._plural ? this._letter : '');
};

IW_Game_Enemy.prototype.isLetterEmpty = function() {
    return this._letter === '';
};

IW_Game_Enemy.prototype.setLetter = function(letter) {
    this._letter = letter;
};

IW_Game_Enemy.prototype.setPlural = function(plural) {
    this._plural = plural;
};

IW_Game_Enemy.prototype.performActionStart = function(action) {
    Game_Battler.prototype.performActionStart.call(this, action);
    this.requestEffect('whiten');
};

IW_Game_Enemy.prototype.performAction = function(action) {
    Game_Battler.prototype.performAction.call(this, action);
};

IW_Game_Enemy.prototype.performActionEnd = function() {
    Game_Battler.prototype.performActionEnd.call(this);
};

IW_Game_Enemy.prototype.performDamage = function() {
    Game_Battler.prototype.performDamage.call(this);
    SoundManager.playEnemyDamage();
    this.requestEffect('blink');
};

IW_Game_Enemy.prototype.performCollapse = function() {
    Game_Battler.prototype.performCollapse.call(this);
    switch (this.collapseType()) {
    case 0:
        this.requestEffect('collapse');
        SoundManager.playEnemyCollapse();
        break;
    case 1:
        this.requestEffect('bossCollapse');
        SoundManager.playBossCollapse1();
        break;
    case 2:
        this.requestEffect('instantCollapse');
        break;
    }
};

IW_Game_Enemy.prototype.transform = function(enemyId) {
    var name = this.originalName();
    this._enemyId = enemyId;
    if (this.originalName() !== name) {
        this._letter = '';
        this._plural = false;
    }
    this.refresh();
    if (this.numActions() > 0) {
        this.makeActions();
    }
};

IW_Game_Enemy.prototype.meetsCondition = function(action) {
    var param1 = action.conditionParam1;
    var param2 = action.conditionParam2;
    switch (action.conditionType) {
    case 1:
        return this.meetsTurnCondition(param1, param2);
    case 2:
        return this.meetsHpCondition(param1, param2);
    case 3:
        return this.meetsMpCondition(param1, param2);
    case 4:
        return this.meetsStateCondition(param1);
    case 5:
        return this.meetsPartyLevelCondition(param1);
    case 6:
        return this.meetsSwitchCondition(param1);
    default:
        return true;
    }
};

IW_Game_Enemy.prototype.meetsTurnCondition = function(param1, param2) {
    var n = $gameTroop.turnCount();
    if (param2 === 0) {
        return n === param1;
    } else {
        return n > 0 && n >= param1 && n % param2 === param1 % param2;
    }
};

IW_Game_Enemy.prototype.meetsHpCondition = function(param1, param2) {
    return this.hpRate() >= param1 && this.hpRate() <= param2;
};

IW_Game_Enemy.prototype.meetsMpCondition = function(param1, param2) {
    return this.mpRate() >= param1 && this.mpRate() <= param2;
};

IW_Game_Enemy.prototype.meetsStateCondition = function(param) {
    return this.isStateAffected(param);
};

IW_Game_Enemy.prototype.meetsPartyLevelCondition = function(param) {
    return $gameParty.highestLevel() >= param;
};

IW_Game_Enemy.prototype.meetsSwitchCondition = function(param) {
    return $gameSwitches.value(param);
};

IW_Game_Enemy.prototype.isActionValid = function(action) {
    return this.meetsCondition(action) && this.canUse($dataSkills[action.skillId]);
};

IW_Game_Enemy.prototype.selectAction = function(actionList, ratingZero) {
    var sum = actionList.reduce(function(r, a) {
        return r + a.rating - ratingZero;
    }, 0);
    if (sum > 0) {
        var value = Math.randomInt(sum);
        for (var i = 0; i < actionList.length; i++) {
            var action = actionList[i];
            value -= action.rating - ratingZero;
            if (value < 0) {
                return action;
            }
        }
    } else {
        return null;
    }
};

IW_Game_Enemy.prototype.selectAllActions = function(actionList) {
    var ratingMax = Math.max.apply(null, actionList.map(function(a) {
        return a.rating;
    }));
    var ratingZero = ratingMax - 3;
    actionList = actionList.filter(function(a) {
        return a.rating > ratingZero;
    });
    for (var i = 0; i < this.numActions(); i++) {
        this.action(i).setEnemyAction(this.selectAction(actionList, ratingZero));
    }
};

IW_Game_Enemy.prototype.makeActions = function() {
    Game_Battler.prototype.makeActions.call(this);
    if (this.numActions() > 0) {
        var actionList = this.enemy().actions.filter(function(a) {
            return this.isActionValid(a);
        }, this);
        if (actionList.length > 0) {
            this.selectAllActions(actionList);
        }
    }
    this.setActionState('waiting');
};

IW_Game_Enemy.prototype.takeDamage = function(key, damage) {
    // need to be finished
	var value = this.getValue(key) - damage;
	this.setValue(key, value);
};

IW_Game_Enemy.prototype.available = function() {
    return this._hp>0;
};

IW_Game_Enemy.prototype.getValue = function(key) {
    switch (key){
		case "DEF":
			return this.def;
			break;
		case "MAT":
			return this.mat;
			break;
		case "CHP":
			return this._hp;
			break;
	}
};

IW_Game_Enemy.prototype.setValue = function(key, value) {
    switch (key){
		case "DEF":
			this.def = value;
			break;
		case "MAT":
			this.mat = value;
			break;
		case "CHP":
			this._hp = value;
			break;
	}
};

IW_Game_Enemy.prototype.findSkill = function(id) {
    return $IWdataSkills[id];
};

IW_Game_Enemy.prototype.isAlive = function() {
    return this.getValue('CHP')>0;
};