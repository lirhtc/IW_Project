//--------------------------------------------------------------git
// BattleManager
//
// The static class that manages battle progress.

function BattleManager() {
    throw new Error('This is a static class');
}

BattleManager.setup = function(troopId, canEscape, canLose) {
    this.initMembers();
    this._canEscape = canEscape;
    this._canLose = canLose;
    $gameTroop.setup(troopId);
    $gameScreen.onBattleStart();
    this.makeEscapeRatio();
};

BattleManager.initMembers = function() {
    this._phase = 'init';
    this._canEscape = false;
    this._canLose = false;
    this._battleTest = false;
    this._eventCallback = null;
    this._preemptive = false;
    this._surprise = false;
    this._actorIndex = -1;
    this._actionForcedBattler = null;
    this._mapBgm = null;
    this._mapBgs = null;
    this._action = null;
    this._spriteset = null;
    this._escapeRatio = 0;
    this._escaped = false;
    this._rewards = {};
	this.animationArray = {};
	this.newMotionArray = [];
};

BattleManager.isBattleTest = function() {
    return this._battleTest;
};

BattleManager.setBattleTest = function(battleTest) {
    this._battleTest = battleTest;
};

BattleManager.setEventCallback = function(callback) {
    this._eventCallback = callback;
};

BattleManager.makeEnemyMove = function() {
	this.enemyActions = []
	$gameTroop._enemies.forEach(function (enemy,i){
		this.enemyActions.push(
		{
		"caster": '<enemy>'+i,
		"target": '<actor>0',//+i%4,
		"skillId" : 1
		})
	}.bind(this));
};
BattleManager.processActionArray = function(actionArray) {
	actionArray.forEach(function(action){
		this.processOneAction(action);
	}.bind(this));
	this.makeEnemyMove();
	this.enemyActions.forEach(function(action){
		this.processOneAction(action);
	}.bind(this));
	this.returnAnimation();
	SceneManager._scene.processManager.newTurn();
};

BattleManager.processOneAction = function (action) {
	var skill = this.findSkill(action);
	var skillSeeds = this.breakSkill(skill);
	var caster = this.getCaster(action);
	var target = this.getTarget(action);
	if (!target.available()) {
		target = this.reChoseTarget(action);
	}
	// need to be done :buff clearing
	// this.callBeforeMoveHandler (target,caster,skillSeeds);
	// befoe the skillseeds is applied, animaiton should be made if the skill need to move the caster
	if (caster.available()) {
		this.animationArray[action.caster] = this.animationArray[action.caster] || [];
		var targetPosition = this.findAttackPosition(caster, target, action);
		var originalPosition = this.findOriginalPosition(caster, target, action);
		//
		
		this.animationArray[action.caster].push({
			"move": {
				"x": targetPosition[0],
				"y": targetPosition[1],
				"speed": 30
			}
		});
		var newMotion = {
			"object": action.caster,
			"type": "move",
			"x": targetPosition[0],
			"y": targetPosition[1],
			"speed": 30,
			"sequence": true
		};
		this.newMotionArray.push(newMotion);
		this.applySeeds(target, caster, skillSeeds);
		var newMotion = {
			"object": action.caster,
			"type": "move",
			"x": originalPosition[0],
			"y": originalPosition[1],
			"speed": 30,
			"sequence": true
		};
		this.newMotionArray.push(newMotion);
		this.animationArray[action.caster].push({
			"move": {
				"x": originalPosition[0],
				"y": originalPosition[1],
				"speed": 30
			}
		});
	}
};

BattleManager.findSkill = function(action) {
    var caster = this.getCaster(action);
	return caster.findSkill(action.skillId);
};

BattleManager.findOriginalPosition = function(caster,target,action) {
	var casterSpirte = caster.isEnemy() ? SceneManager._scene.enemySprites[action.caster.replace('<enemy>','')] : SceneManager._scene.actorSprites[action.caster.replace('<actor>','')];
	return [casterSpirte.x,casterSpirte.y];
};

BattleManager.findAttackPosition = function(caster,target,action) {
	var targetDetail = this.findDisplayObjectDetails(target);
	var casterDetail = this.findDisplayObjectDetails(caster);
	if (casterDetail.x < targetDetail.x) {
		return [targetDetail.x - 20 - 0.5 * casterDetail.width - 0.5 * targetDetail.width, targetDetail.y];
	} else {
		return [targetDetail.x + 20 + 0.5 * casterDetail.width + 0.5 * targetDetail.width, targetDetail.y]
	}
};

BattleManager.findDisplayObjectDetails = function(player) {
	if (player.isEnemy()){
		return {
			"x" : player._screenX,
			"y" : player._screenY,
			"width" : 120,
			"height" : 120
		};
	} else {
		return {
			"x" : 600 + player.actorId() * 32,
			"y" : 280 + player.actorId() * 48,
			"width" : 64,
			"height" : 64
		};
	}
};

BattleManager.breakSkill = function(skill) {
    var seeds = [];
	if (skill != null){
		var seedNum = skill.skillSeeds.length;
		for (var i =0; i<seedNum; i++){
			var seed = JSON.parse(JSON.stringify($dataIWSkillSeeds[skill.skillSeeds[i]]))
			if (!!skill.seedsParameters[i]){
				var modifyParameter = JSON.parse(JSON.stringify(skill.seedsParameters[i]));
				this.applyProperty(seed, modifyParameter);
			}
			seeds.push(seed);
		}
	}
	return seeds;
};


BattleManager.applyProperty = function (original, property) {
	for (var key in property) {
		if (typeof property[key] == 'object' && typeof original[key] == 'object') {
			this.applyProperty(original[key], property[key]);
		} else {
			var temp = original[key];
			original[key] = property[key];
			property[key] = temp;
		}
	}
};

BattleManager.applySeeds = function (target,caster,skillSeeds) {
	var seedsNum = skillSeeds.length;
	for (var i=0; i<seedsNum; i++){
		if (skillSeeds[i].effectType == 'damage'){
			this.applyDamageSeed (target,caster,skillSeeds[i]);
		}
	}
};

BattleManager.applyDamageSeed = function (target,caster,skillSeed) {
	this.callBeforeMakeDamageHandler (target,caster,skillSeed);
	var key = skillSeed.targetParameter;
	var expression = skillSeed.expression;
	var flags = expression.match(/[A-Z]{1}\.[A-Z]{3}/g);
	var num = flags.length;
	for (var i=0; i<num; i++){
		var player = (flags[i][0] == 'T') ? target : caster;
		var keyValue = player.getValue (flags[i].substr(2,3));
		expression = expression.replace (flags[i],keyValue);
	}
	var damageValue = eval (expression);
	if (damageValue <=0) {damageValue=1;}
	var targetDie = this.takeDamage (caster,target,key, damageValue);
	var animationKey  = {
		"type" : "damage",
		"key" : key,
		"value": damageValue,
		"baseRow": 0
	};
	this.extractAnimationFromSeed(target,caster,skillSeed,animationKey);
	if (targetDie){
		this.makeTargetDie(caster,target,target.isEnemy());
	}
	if (this.processCheck()){
		
	}
};

BattleManager.makeTargetDie = function (caster,target,dieOut) {
	var nameTabCaster = this.getNameTab (caster);
	var nameTabTarget = this.getNameTab (target);
	//target.active = false;
	if (caster != target){
		var link = {
			"link":{
				"delay":0,
				"target": nameTabTarget,
				"die": {"dieOut":dieOut
			}}}
		var newMotion = {
				"object": nameTabTarget,
				"type": 'die',
				"dieOut": true,
				"delay": 0,
				"sequence": true
			};
		this.newMotionArray.push(newMotion);
	}
};

BattleManager.extractAnimationFromSeed = function (target,caster,skillSeed,animationKey) {
	var nameTabCaster = this.getNameTab (caster);
	var nameTabTarget = this.getNameTab (target);
	this.animationArray[nameTabCaster] = this.animationArray[nameTabCaster] ||[];
	for (var i=0; i<skillSeed.animation.length;i++ ){
		var motion = JSON.parse(JSON.stringify(skillSeed.animation[i]))
		if (!!motion.motion){
			var newMotion = {
				"object": nameTabCaster,
				"type": 'motion',
				"motion": motion.motion,
				"sequence": true
			};
			this.newMotionArray.push(newMotion);
		}
		if (!!motion.animation){
			motion.animation.target = motion.animation.target =='target'? nameTabTarget : nameTabCaster;
			var newMotion = {
				"object": nameTabCaster,
				"type": 'animation',
				"sequence": true
			};
			Object.assign(newMotion, motion.animation);
			this.newMotionArray.push(newMotion);
		}
		if (!!motion.link && animationKey.type == 'damage'){
			var newMotion = {
				"object": nameTabTarget,
				"type": "damage",
				"value": animationKey.value,
				"baseRow": animationKey.baseRow,
				"key":　animationKey.key,
				"sequence": false
			};
			this.newMotionArray.push(newMotion);
			var newMotion = {
				"object": nameTabTarget,
				"type": "motion",
				"motion": "damage",
				"sequence": false
			};
			this.newMotionArray.push(newMotion);
			
		}
	}
};

BattleManager.linkAnimationProcess = function (link, target, caster, animationKey) {
	var nameTabCaster = this.getNameTab (caster);
	var nameTabTarget = this.getNameTab (target);
	link.target = link.target =='target'? nameTabTarget : nameTabCaster;
	if (animationKey.type == 'damage'){
		link.damage = {
			'value': animationKey.value,
			'baseRow': 0
		}
	}
	return link;
};

BattleManager.getNameTab = function (player) {
	var nameTab = player.isEnemy() ? '<enemy>' : '<actor>';
	var numTab = player.isEnemy() ? (player.formation.position - 1) : (player._parameters.actorId - 1);
	return nameTab+numTab;
};

BattleManager.takeDamage = function (caster,target,key, damageValue) {
	target.takeDamage(key, damageValue);
	if (target.getValue('CHP')<=0 ){
		return true;
	}
	return false;
};

BattleManager.endTest = function () {
	var enemyDieOut = !$gameTroop.members().some(function (enemy) {
			return enemy.getValue('CHP') > 0;
		});
	if (enemyDieOut) {
		return {
			"result": "win",
			"end": true
		};
	}
	var partyDieOut = !$serverParty.members().some(function (actor) {
			return actor.getValue('CHP') > 0;
		});
	if (partyDieOut) {
		return {
			"result": "lose",
			"end": true
		};
	}
	return {
		"end": false
	};
};

BattleManager.callBeforeMakeDamageHandler = function (target,caster,skillSeeds) {
	/*
	*/
};

BattleManager.processCheck = function () {
	var endCheck = this.endTest();
	if (endCheck.end && endCheck.result == "win"){
		this.newMotionArray.push(
		{
			"type": "victory"
		});
		return true;
	}
	if (endCheck.end && endCheck.result == "lose"){
		this.newMotionArray.push(
		{
			"type": "defeat"
		});
		return true;
	}
	return false;
};

BattleManager.processAttack = function(action) {
    /*var casterCheck = action.castBy.hasOwnProperty('_enemyId');
	var targetCheck = action.target.hasOwnProperty('_enemyId');
	var hitPoint = casterCheck ? action.castBy.atk : action.castBy._parameters.result.advan[0];
	var defPoint = targetCheck ? action.target.def : action.target._parameters.result.advan[2];
	var result = Math.max (hitPoint - defPoint, 0);
	if (targetCheck){
		action.target._hp -= Math.min (result,action.target._hp);
		if (action.target._hp<=0) {}
	} else {
		var hp = action.target._parameters.result.advan[4];
		action.target._parameters.result.advan[4] -= Math.max (hp,result);
	}
	return this.generateAnimation(action);*/
	var caster = this.getCaster(action);
	var target = this.getTarget(action);
	if (!target.available()){
		target = this.reChoseTarget(action);
	}
	if (caster.available()){
		var attackPoint = this.getAttackPoint(caster);
		var defPoint = this.getDefPoint (target);
		var targetPosition = this.getPosition(target);
		var motion = {
			"object":action.caster,
			"type":"move",
			"name":"default",
			"parameter":[targetPosition.x-50,targetPosition.y]
		};
		this.animationArray.push(motion);
		this.applyDamage (caster,target,attackPoint,defPoint,action);
		var originPosition = this.getPosition(caster);
		// below should in this.applyDamage
		motion = {
			"object":action.caster,
			"type":"attack",
			"name":{"timescale":2},
			"parameter":[originPosition.x,originPosition.y]
		};
		this.animationArray.push(motion);
		motion = {
			"object":action.caster,
			"type":"idle",
			"name":"flag",
			"parameter":[2]
		};
		this.animationArray.push(motion);
		motion = {
			"object":action.caster,
			"type":"move",
			"name":"delay10",
			"parameter":[originPosition.x,originPosition.y]
		};
		this.animationArray.push(motion);
	}
	
};

BattleManager.getCaster = function(action) {
    var actorTeamCheck = action.caster.indexOf('actor')>0;
	var index = action.caster.match(/\d+/);
	if (actorTeamCheck){
		// caster is actor
		return $gameActors._RL_data[parseInt(index[0])+1];
	} else {
		return $gameTroop.members()[parseInt(index[0])];
	}
};

BattleManager.getPosition = function(target) {
    if (target.isEnemy()){	
		var spine = SceneManager._scene.enemySpine[target.spineIndex];
		return {"x":spine.x,"y":spine.y};
	} else {
		var sprite = SceneManager._scene.actorSprites[target.spriteIndex];
		return {"x":sprite.x,"y":sprite.y};
	}	
};

BattleManager.getDisplayObject = function(player) {
    var actorTeamCheck = action.caster.indexOf('actor')>0;
	var index = parseInt(action.caster.match(/\d+/)[0]);
	if (actorTeamCheck){
		return SceneManager._scene.actorSprites[index];
	} else {
		return index;
	}
};

BattleManager.returnAnimation = function() {
    var manager = SceneManager._scene.processManager;
	manager.processAnimationArray(this.animationArray, this.newMotionArray);
};

BattleManager.processMoveAnimation = function(motion) {
    var actorTeamCheck = motion.object.indexOf('actor')>0;
	var index = parseInt(motion.object.match(/\d+/)[0]);
	if (actorTeamCheck){
		// caster is actor

	} else {
		var x = motion.parameter[0];
		var y = motion.parameter[1];
		SceneManager._scene.spineBattle.moveTo (index,x,y);
	}
};

BattleManager.processMotion = function(motion) {
    var actorTeamCheck = motion.object.indexOf('actor')>0;
	var index = parseInt(motion.object.match(/\d+/)[0]);
	if (actorTeamCheck){
		// caster is actor

	} else {
		var flag = motion.parameter[0];
		var spine = SceneManager._scene.enemySpine[index];
		spine.state.addAnimation (0,'idle',true,0,flag);
	}
};

BattleManager.getTarget = function(action) {
    var actorTeamCheck = action.target.indexOf('actor')>0;
	var index = parseInt(action.target.match(/\d+/)[0]);
	if (actorTeamCheck){
		// caster is actor
		return $serverActors.actor(index+1);
	} else {
		return $gameTroop.members()[index];
	}
};

BattleManager.reChoseTarget = function(action) {
    var actorTeamCheck = action.target.indexOf('actor')>=0;
	if (actorTeamCheck){
		var avaliableIndexArray = [];
		$serverActors._data.forEach(function (actor,index){
			if (actor && actor.available()){
				avaliableIndexArray.push(index)
			}
		});
		var index = Math.floor(Math.random()*avaliableIndexArray.length);
		// caster is actor
		return $serverActors.actor(avaliableIndexArray[index]);
	} else {
		/*var num = $gameTroop.members().length;
		index = this.generateRandom (0,num,index);
		return $gameTroop.members()[index];*/
		var avaliableIndexArray = [];
		$gameTroop.members().forEach(function (enemy,index){
			if (enemy && enemy.available()){
				avaliableIndexArray.push(index)
			}
		});
		var index = Math.floor(Math.random()*avaliableIndexArray.length);
		// caster is actor
		return $gameTroop.members()[avaliableIndexArray[index]];
	}
};

BattleManager.generateRandom = function(min,max,avoidIndex) {
    var index = Math.floor (Math.random()*(max-min) + min);
	while (index == avoidIndex){
		index = Math.floor (Math.random()*(max-min) + min)
	}
	return index;
};

BattleManager.refineAttackPoint = function(player,attackPoint) {
    return attackPoint;
};

BattleManager.refineDefPoint = function(player,defPoint) {
    return defPoint;
};

BattleManager.applyDamage = function (caster,target,attackPoint,defPoint,action){
   target.takeDamage (attackPoint,action);
   this.refreshStatus();
};

BattleManager.generateAttack = function(action) {
    var casterCheck = action.castBy.hasOwnProperty('_enemyId');
	var targetCheck = action.target.hasOwnProperty('_enemyId');
	if (casterCheck) {
		var targetX;
	} else{
		var targetX 
	}
};

BattleManager.findPosition = function(target) {
    var check = target.hasOwnProperty('spine');
	if (check){
		return [target._screenX,target._screenY];
	}
};

BattleManager.processStatus = function() {
    $gameTroop._enemies.forEach(function (enemy,i,a){
		if (enemy._hp <=0) {
			var scene = SceneManager._scene;
			scene._spriteset._enemyTeam.enemies[i].visible = false;
		}});
};

BattleManager.setSpriteset = function(spriteset) {
    this._spriteset = spriteset;
};

BattleManager.onEncounter = function() {
    this._preemptive = (Math.random() < this.ratePreemptive());
    this._surprise = (Math.random() < this.rateSurprise() && !this._preemptive);
};

BattleManager.ratePreemptive = function() {
    return $gameParty.ratePreemptive($gameTroop.agility());
};

BattleManager.rateSurprise = function() {
    return $gameParty.rateSurprise($gameTroop.agility());
};

BattleManager.saveBgmAndBgs = function() {
    this._mapBgm = AudioManager.saveBgm();
    this._mapBgs = AudioManager.saveBgs();
};

BattleManager.playBattleBgm = function() {
    AudioManager.playBgm($gameSystem.battleBgm());
    AudioManager.stopBgs();
};

BattleManager.playVictoryMe = function() {
    AudioManager.playMe($gameSystem.victoryMe());
};

BattleManager.playDefeatMe = function() {
    AudioManager.playMe($gameSystem.defeatMe());
};

BattleManager.replayBgmAndBgs = function() {
    if (this._mapBgm) {
        AudioManager.replayBgm(this._mapBgm);
    } else {
        AudioManager.stopBgm();
    }
    if (this._mapBgs) {
        AudioManager.replayBgs(this._mapBgs);
    }
};

BattleManager.makeEscapeRatio = function() {
    this._escapeRatio = 0.5 * $gameParty.agility() / $gameTroop.agility();
};

BattleManager.update = function() {
    if (!this.isBusy() && !this.updateEvent()) {
        switch (this._phase) {
        case 'start':
            this.startInput();
            break;
        case 'turn':
            this.updateTurn();
            break;
        case 'action':
            this.updateAction();
            break;
        case 'turnEnd':
            this.updateTurnEnd();
            break;
        case 'battleEnd':
            this.updateBattleEnd();
            break;
        }
    }
};

BattleManager.updateEvent = function() {
    switch (this._phase) {
        case 'start':
        case 'turn':
        case 'turnEnd':
            if (this.isActionForced()) {
                this.processForcedAction();
                return true;
            } else {
                return this.updateEventMain();
            }
    }
    return this.checkAbort2();
};

BattleManager.updateEventMain = function() {
    $gameTroop.updateInterpreter();
    $gameParty.requestMotionRefresh();
    if ($gameTroop.isEventRunning() || this.checkBattleEnd()) {
        return true;
    }
    $gameTroop.setupBattleEvent();
    if ($gameTroop.isEventRunning() || SceneManager.isSceneChanging()) {
        return true;
    }
    return false;
};

BattleManager.isBusy = function() {
    return ($gameMessage.isBusy() || this._spriteset.isBusy() ||
            this._logWindow.isBusy());
};

BattleManager.isInputting = function() {
    return this._phase === 'input';
};

BattleManager.isInTurn = function() {
    return this._phase === 'turn';
};

BattleManager.isTurnEnd = function() {
    return this._phase === 'turnEnd';
};

BattleManager.isAborting = function() {
    return this._phase === 'aborting';
};

BattleManager.isBattleEnd = function() {
    return this._phase === 'battleEnd';
};

BattleManager.canEscape = function() {
    return this._canEscape;
};

BattleManager.canLose = function() {
    return this._canLose;
};

BattleManager.isEscaped = function() {
    return this._escaped;
};

BattleManager.actor = function() {
    return this._actorIndex >= 0 ? $gameParty.members()[this._actorIndex] : null;
};

BattleManager.clearActor = function() {
    this.changeActor(-1, '');
};

BattleManager.changeActor = function(newActorIndex, lastActorActionState) {
    var lastActor = this.actor();
    this._actorIndex = newActorIndex;
    var newActor = this.actor();
    if (lastActor) {
        lastActor.setActionState(lastActorActionState);
    }
    if (newActor) {
        newActor.setActionState('inputting');
    }
};

BattleManager.startBattle = function() {
    this._phase = 'start';
    $gameSystem.onBattleStart();
	$serverParty.onBattleStart();
    $gameParty.onBattleStart();
    $gameTroop.onBattleStart();
    this.displayStartMessages();
};

BattleManager.displayStartMessages = function() {
    $gameTroop.enemyNames().forEach(function(name) {
        $gameMessage.add(TextManager.emerge.format(name));
    });
    if (this._preemptive) {
        $gameMessage.add(TextManager.preemptive.format($gameParty.name()));
    } else if (this._surprise) {
        $gameMessage.add(TextManager.surprise.format($gameParty.name()));
    }
};

BattleManager.startInput = function() {
    this._phase = 'input';
    $gameParty.makeActions();
    $gameTroop.makeActions();
    this.clearActor();
    if (this._surprise || !$gameParty.canInput()) {
        this.startTurn();
    }
};

BattleManager.inputtingAction = function() {
    return this.actor() ? this.actor().inputtingAction() : null;
};

BattleManager.selectNextCommand = function() {
    do {
        if (!this.actor() || !this.actor().selectNextCommand()) {
            this.changeActor(this._actorIndex + 1, 'waiting');
            if (this._actorIndex >= $gameParty.size()) {
                this.startTurn();
                break;
            }
        }
    } while (!this.actor().canInput());
};

BattleManager.selectPreviousCommand = function() {
    do {
        if (!this.actor() || !this.actor().selectPreviousCommand()) {
            this.changeActor(this._actorIndex - 1, 'undecided');
            if (this._actorIndex < 0) {
                return;
            }
        }
    } while (!this.actor().canInput());
};

BattleManager.refreshStatus = function() {
    $IW_gameParty.refreshStatus();
	$gameTroop.refreshStatus();
};

BattleManager.startTurn = function() {
    this._phase = 'turn';
    this.clearActor();
    $gameTroop.increaseTurn();
    this.makeActionOrders();
    $gameParty.requestMotionRefresh();
    this._logWindow.startTurn();
};

BattleManager.updateTurn = function() {
    $gameParty.requestMotionRefresh();
    if (!this._subject) {
        this._subject = this.getNextSubject();
    }
    if (this._subject) {
        this.processTurn();
    } else {
        this.endTurn();
    }
};

BattleManager.processTurn = function() {
    var subject = this._subject;
    var action = subject.currentAction();
    if (action) {
        action.prepare();
        if (action.isValid()) {
            this.startAction();
        }
        subject.removeCurrentAction();
    } else {
        subject.onAllActionsEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(subject);
        this._logWindow.displayCurrentState(subject);
        this._logWindow.displayRegeneration(subject);
        this._subject = this.getNextSubject();
    }
};

BattleManager.endTurn = function() {
    this._phase = 'turnEnd';
    this._preemptive = false;
    this._surprise = false;
    this.allBattleMembers().forEach(function(battler) {
        battler.onTurnEnd();
        this.refreshStatus();
        this._logWindow.displayAutoAffectedStatus(battler);
        this._logWindow.displayRegeneration(battler);
    }, this);
};

BattleManager.updateTurnEnd = function() {
    this.startInput();
};

BattleManager.getNextSubject = function() {
    for (;;) {
        var battler = this._actionBattlers.shift();
        if (!battler) {
            return null;
        }
        if (battler.isBattleMember() && battler.isAlive()) {
            return battler;
        }
    }
};

BattleManager.allBattleMembers = function() {
    return $gameParty.members().concat($gameTroop.members());
};

BattleManager.makeActionOrders = function() {
    var battlers = [];
    if (!this._surprise) {
        battlers = battlers.concat($gameParty.members());
    }
    if (!this._preemptive) {
        battlers = battlers.concat($gameTroop.members());
    }
    battlers.forEach(function(battler) {
        battler.makeSpeed();
    });
    battlers.sort(function(a, b) {
        return b.speed() - a.speed();
    });
    this._actionBattlers = battlers;
};

BattleManager.startAction = function() {
    var subject = this._subject;
    var action = subject.currentAction();
    var targets = action.makeTargets();
    this._phase = 'action';
    this._action = action;
    this._targets = targets;
    subject.useItem(action.item());
    this._action.applyGlobal();
    this.refreshStatus();
    this._logWindow.startAction(subject, action, targets);
};

BattleManager.updateAction = function() {
    var target = this._targets.shift();
    if (target) {
        this.invokeAction(this._subject, target);
    } else {
        this.endAction();
    }
};

BattleManager.endAction = function() {
    this._logWindow.endAction(this._subject);
    this._phase = 'turn';
};

BattleManager.invokeAction = function(subject, target) {
    this._logWindow.push('pushBaseLine');
    if (Math.random() < this._action.itemCnt(target)) {
        this.invokeCounterAttack(subject, target);
    } else if (Math.random() < this._action.itemMrf(target)) {
        this.invokeMagicReflection(subject, target);
    } else {
        this.invokeNormalAction(subject, target);
    }
    subject.setLastTarget(target);
    this._logWindow.push('popBaseLine');
    this.refreshStatus();
};

BattleManager.invokeNormalAction = function(subject, target) {
    var realTarget = this.applySubstitute(target);
    this._action.apply(realTarget);
    this._logWindow.displayActionResults(subject, realTarget);
};

BattleManager.invokeCounterAttack = function(subject, target) {
    var action = new Game_Action(target);
    action.setAttack();
    action.apply(subject);
    this._logWindow.displayCounter(target);
    this._logWindow.displayActionResults(target, subject);
};

BattleManager.invokeMagicReflection = function(subject, target) {
	this._action._reflectionTarget = target;
    this._logWindow.displayReflection(target);
    this._action.apply(subject);
    this._logWindow.displayActionResults(target, subject);
};

BattleManager.applySubstitute = function(target) {
    if (this.checkSubstitute(target)) {
        var substitute = target.friendsUnit().substituteBattler();
        if (substitute && target !== substitute) {
            this._logWindow.displaySubstitute(substitute, target);
            return substitute;
        }
    }
    return target;
};

BattleManager.checkSubstitute = function(target) {
    return target.isDying() && !this._action.isCertainHit();
};

BattleManager.isActionForced = function() {
    return !!this._actionForcedBattler;
};

BattleManager.forceAction = function(battler) {
    this._actionForcedBattler = battler;
    var index = this._actionBattlers.indexOf(battler);
    if (index >= 0) {
        this._actionBattlers.splice(index, 1);
    }
};

BattleManager.processForcedAction = function() {
    if (this._actionForcedBattler) {
        this._subject = this._actionForcedBattler;
        this._actionForcedBattler = null;
        this.startAction();
        this._subject.removeCurrentAction();
    }
};

BattleManager.abort = function() {
    this._phase = 'aborting';
};

BattleManager.checkBattleEnd = function() {
    if (this._phase) {
        if (this.checkAbort()) {
            return true;
        } else if ($serverParty.isAllDead()) {
            this.processDefeat();
            return true;
        } else if ($gameTroop.isAllDead()) {
            this.processVictory();
            return true;
        }
    }
    return false;
};

BattleManager.checkAbort = function() {
    if ($gameParty.isEmpty() || this.isAborting()) {
        this.processAbort();
        return true;
    }
    return false;
};

BattleManager.checkAbort2 = function() {
    if ($gameParty.isEmpty() || this.isAborting()) {
        SoundManager.playEscape();
        this._escaped = true;
        this.processAbort();
    }
    return false;
};

BattleManager.processVictory = function() {
	/*
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    this.playVictoryMe();
    this.replayBgmAndBgs();
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);*/
	this.displayVictoryMessage();
};

BattleManager.processEscape = function() {
    $gameParty.performEscape();
    SoundManager.playEscape();
    var success = this._preemptive ? true : (Math.random() < this._escapeRatio);
    if (success) {
        this.displayEscapeSuccessMessage();
        this._escaped = true;
        this.processAbort();
    } else {
        this.displayEscapeFailureMessage();
        this._escapeRatio += 0.1;
        $gameParty.clearActions();
        this.startTurn();
    }
    return success;
};

BattleManager.processAbort = function() {
    $gameParty.removeBattleStates();
    this.replayBgmAndBgs();
    this.endBattle(1);
};

BattleManager.processDefeat = function() {
    this.displayDefeatMessage();
    this.playDefeatMe();
    if (this._canLose) {
        this.replayBgmAndBgs();
    } else {
        AudioManager.stopBgm();
    }
    this.endBattle(2);
};

BattleManager.endBattle = function(result) {
    this._phase = 'battleEnd';
    if (this._eventCallback) {
        this._eventCallback(result);
    }
    if (result === 0) {
        $gameSystem.onBattleWin();
    } else if (this._escaped) {
        $gameSystem.onBattleEscape();
    }
};

BattleManager.updateBattleEnd = function() {
    if (this.isBattleTest()) {
        AudioManager.stopBgm();
        SceneManager.exit();
    } else if (!this._escaped && $gameParty.isAllDead()) {
        if (this._canLose) {
            $gameParty.reviveBattleMembers();
            SceneManager.pop();
        } else {
            SceneManager.goto(Scene_Gameover);
        }
    } else {
        SceneManager.pop();
    }
    this._phase = null;
};

BattleManager.makeRewards = function() {
    this._rewards = {};
    this._rewards.gold = $gameTroop.goldTotal();
    this._rewards.exp = $gameTroop.expTotal();
    this._rewards.items = $gameTroop.makeDropItems();
};

BattleManager.displayVictoryMessage = function() {
    $gameMessage.add(TextManager.victory.format($gameParty.name()));
};

BattleManager.displayDefeatMessage = function() {
    $gameMessage.add(TextManager.defeat.format($gameParty.name()));
};

BattleManager.displayEscapeSuccessMessage = function() {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
};

BattleManager.displayEscapeFailureMessage = function() {
    $gameMessage.add(TextManager.escapeStart.format($gameParty.name()));
    $gameMessage.add('\\.' + TextManager.escapeFailure);
};

BattleManager.displayRewards = function() {
    this.displayExp();
    this.displayGold();
    this.displayDropItems();
};

BattleManager.displayExp = function() {
    var exp = this._rewards.exp;
    if (exp > 0) {
        var text = TextManager.obtainExp.format(exp, TextManager.exp);
        $gameMessage.add('\\.' + text);
    }
};

BattleManager.displayGold = function() {
    var gold = this._rewards.gold;
    if (gold > 0) {
        $gameMessage.add('\\.' + TextManager.obtainGold.format(gold));
    }
};

BattleManager.displayDropItems = function() {
    var items = this._rewards.items;
    if (items.length > 0) {
        $gameMessage.newPage();
        items.forEach(function(item) {
            $gameMessage.add(TextManager.obtainItem.format(item.name));
        });
    }
};

BattleManager.gainRewards = function() {
    this.gainExp();
    this.gainGold();
    this.gainDropItems();
};

BattleManager.gainExp = function() {
    var exp = this._rewards.exp;
    $gameParty.allMembers().forEach(function(actor) {
        actor.gainExp(exp);
    });
};

BattleManager.gainGold = function() {
    $gameParty.gainGold(this._rewards.gold);
};

BattleManager.gainDropItems = function() {
    var items = this._rewards.items;
    items.forEach(function(item) {
        $gameParty.gainItem(item, 1);
    });
};