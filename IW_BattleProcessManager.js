function Battle_ProcessManager() {
    this.initialize.apply(this, arguments);
}

Battle_ProcessManager.prototype.constructor = Battle_ProcessManager;

Battle_ProcessManager.prototype.initialize = function() {
	Input.clear();
    this._phase = 'actor_select';
	this.index = {
		'actor_select':0,
		'actorActionSelection':0,
		'enemySelect':0
	};
	this.inputEnable = true;
	this.loadBitmap();
	this.createButton();
	this.actionArray = [];
	this.inputDelay = 0;
};

Battle_ProcessManager.prototype.loadBitmap = function() {
	this.loadArrowBitmap();
};

Battle_ProcessManager.prototype.createButton = function() {
	this.button = new Sprite_BattleButton();
	this.button.x = 400;
	this.button.y = 200;
	this.button.anchor.x = 0.5;
	SceneManager._scene.addChild(this.button);
};

Battle_ProcessManager.prototype.newTurn = function() {
	this.index['actor_select'] = 0;
	this.actionArray.length = 0;
	this.waitForNewTurn = true;
};

Battle_ProcessManager.prototype.refreshActorStatus = function() {
	var key = {
		"type": "refresh",
		"name": "actor"
	};
	this.netRequest (key);
};

Battle_ProcessManager.prototype.loadArrowBitmap = function() {
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

Battle_ProcessManager.prototype.refreshArrowPosition = function() {
	var index  = this.index['enemySelect'];
	var enemySprite = SceneManager._scene.enemySprites[index];
	if (!!enemySprite && enemySprite.active && this._phase== 'enemySelect'){
		var x = enemySprite.x;
		var y = Math.floor(enemySprite.y);
		this.arrowSprite.x = x+enemySprite.width*0.25;
		this.arrowSprite.y = y-20;
		this.arrowSprite.visible = true;
		}
};

Battle_ProcessManager.prototype.updateInput = function() {
	if (this.inputDelay >=0) {
		this.inputDelay--;
	}
    if (this.inputEnable && this.inputDelay<=0){
		if (Input.isTriggered('up')){
			this.processUp();
		}
		if (Input.isTriggered('down')){
			this.processDown();
		}
		if (Input.isTriggered('ok')){
			this.processOk();
		}
		if (Input.isTriggered('cancel')){
			this.processCancel();
		} 
	}
};

Battle_ProcessManager.prototype.update = function() {
    if (this.inputEnable){this.updateInput();}
	if (this._phase == 'animation'){this.updateAnimation();}
	if (this.waitForNewTurn && this.isFree() && this.newMotionArray.length == 0){
		this.waitForNewTurn = false;
		this.reSelectActor();
		this.refreshActorStatus();
	}
};

Battle_ProcessManager.prototype.processUp = function() {
    switch (this._phase){
		case "actor_select" :
			this.processActorSelectUp();
			break;
		case "enemySelect" :
			this.processEnemySelectUp();
	}
};

Battle_ProcessManager.prototype.processDown = function() {
    switch (this._phase){
		case "actor_select" :
			this.processActorSelectDown();
			break;
		case "enemySelect" :
			this.processEnemySelectDown();
	}
};

Battle_ProcessManager.prototype.processOk = function() {
    switch (this._phase){
		case "actor_select" :
			this.processActorSelectOk();
			break;
		case "actorActionSelection" :
			this.processActorActionSelectionOk();
			break;
		case "enemySelect":
			this.processEnemySelect();
			break;
		case "victory":
			SceneManager.pop();
			break;
	}
};

Battle_ProcessManager.prototype.processActorSelectUp = function(index) {
	var currentIndex =  this.index["actor_select"];
	SceneManager._scene.actorSprites[currentIndex].deselect();
	if (index == undefined) {index = currentIndex-1;}
	var numActors = SceneManager._scene.actorSprites.length;
	index = (index + numActors) % numActors;
	if (!SceneManager._scene.actorSprites[index].active){
		this.processActorSelectUp(index - 1);
	} else {
		SceneManager._scene.actorSprites[index].select();
		this.index["actor_select"] = index;
	}
};

Battle_ProcessManager.prototype.processActorSelectDown = function(index) {
	var currentIndex =  this.index["actor_select"];
	SceneManager._scene.actorSprites[currentIndex].deselect();
	if (index == undefined) {index = currentIndex+1;}
	var numActors = SceneManager._scene.actorSprites.length;
	index = (index + numActors) % numActors;
	if (!SceneManager._scene.actorSprites[index].active){
		this.processActorSelectDown(index+1);
	} else {
		SceneManager._scene.actorSprites[index].select();
		this.index["actor_select"] = index;
	}
};

Battle_ProcessManager.prototype.reSelectActor = function() {
	var currentIndex =  this.index["actor_select"];
	this.processActorSelectDown(currentIndex);
	this._phase = "actor_select";
};

Battle_ProcessManager.prototype.deselectActor = function() {
	var currentIndex =  this.index["actor_select"];
	var actor = SceneManager._scene.actorSprites[currentIndex];
	actor.selected = false;
	actor._mainSprite.alpha = 1;	
};

Battle_ProcessManager.prototype.pauseSelectActor = function() {
	var currentIndex =  this.index["actor_select"];
	var actor = SceneManager._scene.actorSprites[currentIndex];
	actor.selected = false;
	actor._mainSprite.alpha = 0.5;	
};

Battle_ProcessManager.prototype.processActorSelectOk = function() {
	var activeCheck = SceneManager._scene.actorSprites[this.index["actor_select"]].active;
	if (activeCheck){
		Input.clear();
		this.pauseSelectActor();
		this.button.activate();
		this._phase = 'actorActionSelection';
	}
};

Battle_ProcessManager.prototype.processEnemySelectUp = function(index) {
	var numEnemy = $gameTroop.members().length;
	var currentIndex =  this.index["enemySelect"];
	SceneManager._scene.enemySprites[currentIndex].deselect();
	if (index == undefined) {index = currentIndex-1;}
	index = (index + numEnemy) % numEnemy;
	if (!SceneManager._scene.enemySprites[currentIndex].active){
		this.processEnemySelectUp(index - 1);
	} else {
		SceneManager._scene.enemySprites[index].select();
		this.index["enemySelect"] = index;
		this.refreshArrowPosition();
	}
};

Battle_ProcessManager.prototype.processEnemySelectDown = function(index) {
	var numEnemy = $gameTroop.members().length;
	var currentIndex =  this.index["enemySelect"];
	SceneManager._scene.enemySprites[currentIndex].deselect();
	if (index == undefined) {index = currentIndex+1;}
	index = (index + numEnemy) % numEnemy;
	if (!SceneManager._scene.enemySprites[currentIndex].active){
		this.processEnemySelectDown(index + 1);
	} else {
		SceneManager._scene.enemySprites[index].select();
		this.index["enemySelect"] = index;
		this.refreshArrowPosition();
	}
};

Battle_ProcessManager.prototype.reselectEnemy = function() {
	var currentIndex =  this.index["enemySelect"];
	SceneManager._scene.enemySprites[currentIndex].select();
	this.refreshArrowPosition();
};

Battle_ProcessManager.prototype.deselectEnemy = function() {
	var currentIndex =  this.index["enemySelect"];
	SceneManager._scene.enemySprites[currentIndex].deselect();
};

Battle_ProcessManager.prototype.enemySelectionTurn = function() {
	this._phase = 'enemySelect';
	this.arrowSprite.visible = true;
	this.reselectEnemy();
};

Battle_ProcessManager.prototype.actorSelectTurn = function() {
	this._phase = 'actor_select';
	this.arrowSprite.visible = false;
	this.button.deactivate();
	this.reSelectActor();
};

Battle_ProcessManager.prototype.actorActionTurn = function() {
	this._phase = 'actorActionSelection';
	this.arrowSprite.visible = false;
	this.button.activate();
	this.pauseSelectActor();
	this.deselectEnemy();
};

Battle_ProcessManager.prototype.processCancel = function() {
    switch (this._phase){
		case "actor_select" :
			//this.processActorSelectOk();
			break;
		case "actorActionSelection":
			this.actorSelectTurn();
			break;
		case "enemySelect":
			this.actorActionTurn();
			break;
	}
};

Battle_ProcessManager.prototype.processActorActionSelectionOk = function() {
	if (this.index['actorActionSelection'] == 0){
		this.skillType = 'attack';
		this.skillProperty = 'physics';
		this.button.active = false;
		this.enemySelectionTurn();
	}
};

Battle_ProcessManager.prototype.processEnemySelect = function() {
	var caster = '<actor>' + this.index['actor_select'];
	var target = '<enemy>' + this.index['enemySelect'];
	var action = {
		"caster":caster,
		"target":target,
		"skillId":1
	};
	this.actionArray.push(action);
	var actorIndex = this.index['actor_select'];
	SceneManager._scene.actorSprites[actorIndex].active = false;
	if (this.anyMovableActor()){
		this.actorSelectTurn();
	} else {
		this.processThisTurn();		
	}

};

Battle_ProcessManager.prototype.anyMovableActor = function() {
	return SceneManager._scene.actorSprites.some(
	function(a){
		return a.active;
	});
};

Battle_ProcessManager.prototype.processThisTurn = function() {
	SceneManager._scene.actorSprites.forEach(function(e){
		e.active = true;
		e.alpha = 1;
	});
	this.arrowSprite.visible = false;
	this.button.deactivate();
	this.deselectEnemy();
	this.deselectActor();
	BattleManager.processActionArray(this.actionArray);
	//this.actorSelectTurn();
};
Battle_ProcessManager.prototype.processAnimationArray = function (animationArray,newMotionArray) {
	/*this.animationPlayers = [];
	for (key in animationArray) {
		if (key.indexOf('actor') > 0 || key.indexOf('enemy') > 0 || key.indexOf('process')) {
			this.animationPlayers.push(key);
		}
	}
	this.animationArray = animationArray;
	//console.log(this.animationArray);
	this._phase = "animation";
	this.currentAnimationPlayer = this.animationPlayers.shift();
	if (this.currentAnimationPlayer) {
		var sprite = this.findSprite(this.currentAnimationPlayer);
		sprite.actions = animationArray[this.currentAnimationPlayer];
		delete this.animationArray[this.currentAnimationPlayer];
	}*/
	this._phase = "animation";
	this.newMotionArray = newMotionArray;
};

Battle_ProcessManager.prototype.processVictory = function() {
	this.victoryWindow = new IW_Window_Victory();
	SceneManager._scene.addChild(this.victoryWindow);
};

Battle_ProcessManager.prototype.updateAnimation = function () {
	if (!this.currentMotion){
		this.currentMotion = this.newMotionArray.shift();
	}
	if (this.isFree()){
		if (this.currentMotion.delay && this.currentMotion.delay > 0){
			this.currentMotion.delay -=1;
		}
		if (this.currentMotion.delay <= 0 || !this.currentMotion.delay){
			this.processOneMotion(this.currentMotion);
			this.currentMotion = null;
		}
	} else if (!this.currentMotion.sequence)
	{
		this.processOneMotion(this.currentMotion);
		this.currentMotion = null;
	}
	/*
	if (this.currentAnimationPlayer) {

		var playerSprite = this.findSprite(this.currentAnimationPlayer);
		var currentFinished = playerSprite.isFree() && playerSprite.actions.length == 0;
		if (currentFinished && this.animationPlayers.length == 0) {

			Input.clear();
			this.currentAnimationPlayer = undefined;
		}
		if (currentFinished && this.animationPlayers.length > 0) {
			this.currentAnimationPlayer = this.animationPlayers.shift();
			var sprite = this.findSprite(this.currentAnimationPlayer);
			sprite.actions = this.animationArray[this.currentAnimationPlayer];
			delete this.animationArray[this.currentAnimationPlayer]
		}
	}*/
	
};
Battle_ProcessManager.prototype.findSprite = function(nameTab) {
	if (nameTab){
	if (nameTab.indexOf('<enemy>')>=0){
		var index = nameTab.replace('<enemy>','');
		return SceneManager._scene.enemySprites[index];
	} else {
		var index = nameTab.replace('<actor>','');
		return SceneManager._scene.actorSprites[index];
	}}
	else {return {"actions":[]};}
};

Battle_ProcessManager.prototype.isFree = function() {
	//var free = (this.currentAnimationPlayer == undefined) && (this.animationPlayers.length == 0);
	//return free;
	var free = true;
	SceneManager._scene.enemySprites.forEach(function (e){
		free = free && e.isFree();
	});
	SceneManager._scene.actorSprites.forEach(function (a){
		free = free && a.isFree();
	});
	return free;
};

Battle_ProcessManager.prototype.processOneMotion = function(motion) {
	var sprite = this.findSprite (motion.object);
	var spriteMotion = {};
	switch (motion.type){
		case "move":
			spriteMotion.move = motion;
			break;
		case "animation":
			spriteMotion.animation = motion;
			break;
		case "damage":
			spriteMotion.damage = motion;
			break;
		case "motion":
			spriteMotion.motion = motion.motion;
			break;
		case "die":
			spriteMotion.die = motion;
			break;
		case "victory":
			this.processVictory();
			break;
	}
	sprite.actions.push(spriteMotion);
};

Battle_ProcessManager.prototype.processVictory = function() {
	this._phase = "victory";
	this.victoryWindow = new IW_Window_Victory();
	SceneManager._scene.blurAllSprites();
	SceneManager._scene.addChild(this.victoryWindow);
	this.inputDelay = 60;
};

Battle_ProcessManager.prototype.clearPhase = function() {
	/*this._phase = null;
	this.button.visible = false;
	this.ind0ex = {
		'actor_select':0,
		'actorActionSelection':0,
		'enemySelect':0
	};
	var index = this.index['actor_select'];
	*/
};

Battle_ProcessManager.prototype.netRequest = function(key) {
	switch (key.type){
		case "refresh":
			this.netRequestRefresh(key.name);
			break;
	}
};

Battle_ProcessManager.prototype.netRequestRefresh = function(key) {
	switch (key){
		case "actor":
			this.refreshActorViaNet();
			break;
	}
};

Battle_ProcessManager.prototype.refreshActorViaNet = function() {
	$serverActors._data.forEach(
	function (actor,i){
		if (actor){
			var JSONdata = actor.stringify();
			$clientActors._data[i].parse(JSONdata);
		}
	});
};