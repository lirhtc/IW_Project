/*:
 * @plugindesc For RPG Maker MV. Overwrite the pre-existed functions 
 * @author RH&R Studio
 *
 * @param None
 * @desc Blank
 * @default 0
 *
 * @help
 * ======================================================================
 * Core plugin for RH&R Game 
 * ======================================================================
 */

DataManager.createGameObjects = function() {
    $gameTemp          = new Game_Temp();
    $gameSystem        = new Game_System();
    $gameScreen        = new Game_Screen();
    $gameTimer         = new Game_Timer();
    $gameMessage       = new Game_Message();
    $gameSwitches      = new Game_Switches();
    $gameVariables     = new Game_Variables();
    $gameSelfSwitches  = new Game_SelfSwitches();
    $gameActors        = new Game_Actors();
	$IW_gameActors     = new IW_Game_Actors();
    $gameParty         = new Game_Party();
	$serverActors      = new Server_Actors();
	$serverParty       = new Server_Party();
	$clientActors      = new Client_Actors();
	$clientParty       = new Client_Party();
    $IW_gameParty      = new IW_Game_Party();
    $gameTroop         = new Game_Troop();
    $gameMap           = new Game_Map();
    $gamePlayer        = new Game_Player();
	$gameConsole       = new consoleCenter();
    $gameMission       = {'missionVisibility':''};
};

DataManager._databaseFiles = [{
		name: '$dataActors',
		src: 'Actors.json'
	}, {
		name: '$dataClasses',
		src: 'Classes.json'
	}, {
		name: '$dataSkills',
		src: 'Skills.json'
	}, {
		name: '$dataItems',
		src: 'Items.json'
	}, {
		name: '$dataWeapons',
		src: 'Weapons.json'
	}, {
		name: '$dataArmors',
		src: 'Armors.json'
	}, {
		name: '$dataEnemies',
		src: 'Enemies.json'
	}, {
		name: '$dataTroops',
		src: 'Troops.json'
	}, {
		name: '$dataStates',
		src: 'States.json'
	}, {
		name: '$dataAnimations',
		src: 'Animations.json'
	}, {
		name: '$dataTilesets',
		src: 'Tilesets.json'
	}, {
		name: '$dataCommonEvents',
		src: 'CommonEvents.json'
	}, {
		name: '$dataRLWeapons',
		src: 'RL_Weapons.json'
	}, {
		name: '$RLmodels',
		src: 'RL_model.json'
	}, {
		name: '$IWdataActors',
		src: 'RL_actors.json'
	}, {
		name: '$IWdataSkills',
		src: 'RL_skills.json'
	}, {
		name: '$dataIWSkillSeeds',
		src: 'RL_SkillSeeds.json'
	}, {
		name: '$RL_systemSettings',
		src: 'RL_systemSettings.json'
	},{
		name: '$dataIWItems',
		src: 'IW_Items.json'
	},{
		name: '$dataSystem',
		src: 'System.json'
	}, {
		name: '$dataMapInfos',
		src: 'MapInfos.json'
	}
];
Game_Actors.prototype.actor = function(actorId) {
    if ($dataActors[actorId]) {
        if (!this._data[actorId]) {
            this._data[actorId] = new Game_Actor(actorId);
        }
        if (!this._RL_data[actorId]) {
            this._RL_data[actorId] = new IW_Game_Actor(actorId);
        }
        return this._data[actorId];
    }
    return null;
};
Game_Actors.prototype.initialize = function() {
    this._data = [];
    this._RL_data = [];
};
Game_Interpreter.prototype.command1111 = function() {
    var value = this.operateValue(this._params[1], this._params[2], this._params[3]);
    $IW_gameParty.gainItem($dataRLWeapons[this._params[0]], value, this._params[4], false);
	$IW_gameParty.gainItem($dataIWItems[1], value, this._params[4], true);	
    return true;
};
Scene_Menu.prototype.onPersonalOk = function() {
    switch (this._commandWindow.currentSymbol()) {
    case 'skill':
        SceneManager.push(IW_Scene_Skill);
        break;
    case 'equip':
        SceneManager.push(IW_Scene_Equip);
        break;
    case 'status':
        SceneManager.push(Scene_Status);
        break;
    }
};
Game_Party.prototype.initialize = function() {
    Game_Unit.prototype.initialize.call(this);
    this._gold = 0;
    this._steps = 0;
    this._lastItem = new Game_Item();
    this._menuActorId = 0;
    this._targetActorId = 0;
    this._actors = [];
    this._RL_actors = [];
    this.initAllItems();
};
Game_Party.prototype.setupStartingMembers = function() {
    this._actors = [];
    $dataSystem.partyMembers.forEach(function(actorId) {
        if ($gameActors.actor(actorId)) {
            this._actors.push(actorId);
        }
        if ($gameActors.actor(actorId)) {
            this._RL_actors.push(actorId);
        }
    }, this);
};
Spriteset_Battle.prototype.createEnemies = function() {
    var enemies = $gameTroop.members();
    var sprites = [];
    for (var i = 0; i < enemies.length; i++) {
        sprites[i] = new Sprite_Enemy(enemies[i]);
    }
    sprites.sort(this.compareEnemySprite.bind(this));
	sprites = this.rescaleByFormation(sprites);
    for (var j = 0; j < sprites.length; j++) {
        this._battleField.addChild(sprites[j]);
    }
    this._enemySprites = sprites;
};
Spriteset_Battle.prototype.rescaleByFormation = function(enemySprites) {
	enemySprites.forEach(function (e,i,A) {
		var id = e._enemy.formation.id;
		var scale = $RL_systemSettings.formation[id].scaleFactor;
		A[i].scale._x = scale.x;
		A[i].scale._y = scale.y;
	});
    return enemySprites;
};
/* Spriteset_Battle.prototype.formationPosition = function(formationId, positionId, h, d) {
    var h = Graphics.height;
    var d = Graphics.width;
    enemySprites.forEach(function (e,i,A)
	{
	A[i] = 
	},this);	
}; */
/**
 * push an element into array without overlap
 *
 * @method Array.prototype.advanPush
 * @return null
 */

Array.prototype.advanPush = function (object, keyArray) {
    if (Array.isArray(keyArray)) {
        var length = this.length - 1;
        for (var i = length; i >= 0; i--) {
            var check = true;
            for (var j = 0; j < keyArray.length; j++) {
                if (keyArray[j]in this[i] && keyArray[j]in object) {
                    check = check && (this[i][keyArray[j]] === object[keyArray[j]]);
                } else {
                    check = false;
                }
            }
            if (check) {
                this.splice(i, 1);
            }
        }
    } else {
        this.push(object);
    }
};

/**
 * Sum two Array and returns another array with same length
 *
 * @method Array.prototype.plus
 * @return {Array} An new array with length of first array
 */
Array.prototype.plus = function (array) {
    if (this.length == 0 || array.length == 0) {
        return this;
    }
    return this.map(function (m, i, v) {
        if (i < array.length) {
            return m + this[i];
        } else {
            return m;
        }
    }, array);

};

/**
 * multiplay an value to each element in an array
 *
 * @method Array.prototype.multi
 * @return {Array} An new array with result element
 */
Array.prototype.multi = function (a) {
    if (typeof a == "number") {
        return this.map(function (m, i, v) {
            return m * a;
        });
    } else {
        return this;
    }
};

var DeepCopy = function (sorce) {
	var result = {};
	for (var key in sorce) {
		if (Array.isArray(sorce[key])) {
			result[key] = sorce[key].slice(0);
		} else {
			result[key] = (typeof sorce[key] === 'object') ? DeepCopy(sorce[key]) : sorce[key];
		}
	}
	return result;
};