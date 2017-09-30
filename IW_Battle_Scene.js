//-----------------------------------------------------------------------------
// Scene_Battle
//
// The scene class of the battle screen.

function Scene_Battle() {
    this.initialize.apply(this, arguments);
}

Scene_Battle.prototype = Object.create(Scene_Base.prototype);
Scene_Battle.prototype.constructor = Scene_Battle;

Scene_Battle.prototype.initialize = function() {
    Scene_Base.prototype.initialize.call(this);
	this.actorSelectTurn = true;
	this.actorSprites = [];
	//AnimationManager.initialize();
};

Scene_Battle.prototype.create = function() {
    Scene_Base.prototype.create.call(this);
    this.createDisplayObjects();
	this.processManager = new Battle_ProcessManager();
	this.processManager.reSelectActor();
};

Scene_Battle.prototype.start = function() {
    Scene_Base.prototype.start.call(this);
    this.startFadeIn(this.fadeSpeed(), false);
    BattleManager.playBattleBgm();
    BattleManager.startBattle();
};

Scene_Battle.prototype.update = function() {
	//AnimationManager.update();
    var active = this.isActive();
    $gameTimer.update(active);
    $gameScreen.update();
	this.updateEnemyTeam();
    if (active && !this.isBusy()) {
        this.updateBattleProcess();
		this.processManager.update();
    }
    Scene_Base.prototype.update.call(this);

};

Scene_Battle.prototype.updateEnemyTeam = function() {
    if (this._spriteset._enemyTeam) {
		this._spriteset._enemyTeam.update();
	}
};

Scene_Battle.prototype.updateBattleProcess = function() {
    if (!this.isAnyInputWindowActive() || BattleManager.isAborting() ||
            BattleManager.isBattleEnd()) {
        BattleManager.update();
        this.changeInputWindow();
    }
};

Scene_Battle.prototype.allActorMoved = function() {
	// tested if all actors have taken actions
    var allMoved = !($gameActors._RL_data.some(function(e)
	{ return !e._battleStatus.endTurn}));
	return allMoved;	
};

Scene_Battle.prototype.onActorSelect = function() {
	this._spriteset._actorSprites[this.selectedActorIndex].deselect();
	this._spriteset._actorSprites[this.selectedActorIndex].alpha = 0.5;
	this.actorSelectTurn = false;
	this._buttonSprite.activate();
};
Scene_Battle.prototype.isAnyInputWindowActive = function() {
    /*return (this._partyCommandWindow.active ||
            this._actorCommandWindow.active ||
            this._skillWindow.active ||
            this._itemWindow.active ||
            this._actorWindow.active ||
            this._enemyWindow.active);*/
			return true;
};

Scene_Battle.prototype.changeInputWindow = function() {
    if (BattleManager.isInputting()) {
        if (BattleManager.actor()) {
            this.startActorCommandSelection();
        } else {
            this.startPartyCommandSelection();
        }
    } else {
        this.endCommandSelection();
    }
};

Scene_Battle.prototype.stop = function() {
    Scene_Base.prototype.stop.call(this);
    if (this.needsSlowFadeOut()) {
        this.startFadeOut(this.slowFadeSpeed(), false);
    } else {
        this.startFadeOut(this.fadeSpeed(), false);
    }
   // this._statusWindow.close();
   //this._partyCommandWindow.close();
    //this._actorCommandWindow.close();
};

Scene_Battle.prototype.terminate = function() {
    Scene_Base.prototype.terminate.call(this);
    $gameParty.onBattleEnd();
    $gameTroop.onBattleEnd();
    AudioManager.stopMe();
};

Scene_Battle.prototype.needsSlowFadeOut = function() {
    return (SceneManager.isNextScene(Scene_Title) ||
            SceneManager.isNextScene(Scene_Gameover));
};

Scene_Battle.prototype.createDisplayObjects = function() {
    this.createSpriteset();
    this.createWindowLayer();
	this.createButtons();
    this.createAllWindows();
	//this.initialSpineObjects();
	this.createAllHandlers();	
    //BattleManager.setLogWindow(this._logWindow);
    //BattleManager.setStatusWindow(this._statusWindow);
    BattleManager.setSpriteset(this._spriteset);
    //this._logWindow.setSpriteset(this._spriteset);
};

Scene_Battle.prototype.initialSpineObjects = function() {
	this.SpineContainer = new PIXI.Container();
	this.addChild(this.SpineContainer);
	this.enemySpine = [];
	this.actorSpine = [];
	this.enemySkillSpine = [];
	this.actorSkillSpine = [];
	this.addChild(this.SpineContainer);
	this.spineBattle = new Spine_Battle();
};

Scene_Battle.prototype.createButtons = function() {
	//this._buttonSprite.setHandler('ok',  this.commandButtonOk.bind(this));
	//this._buttonSprite.setHandler('cancel',  this.commandButtoncancel.bind(this));
};

Scene_Battle.prototype.createSpriteset = function() {
    this._spriteset = new Spriteset_Battle();
    this.addChild(this._spriteset);
};

Scene_Battle.prototype.createAllHandlers = function() {
    //this._spriteset._enemyTeam.setHandler('ok',  this.enemySelected.bind(this));
	//this._spriteset._enemyTeam.setHandler('cancel',  this.enemySelecteCancel.bind(this));
	
};

Scene_Battle.prototype.createAllWindows = function() {
    this.createMessageWindow();
};


Scene_Battle.prototype.createMessageWindow = function() {
    this._messageWindow = new IW_MessageWindow();
    this.addWindow(this._messageWindow);
};

Scene_Battle.prototype.commandButtonOk = function() {
    if (this._buttonSprite.index == 0){
		this._buttonSprite.active = false;
		this.selectEnemy('attack','physics');
	} else if (this._buttonSprite.index == 1){
		this.selectMagic();
	}
};

Scene_Battle.prototype.selectEnemy = function(actionKey,skill) {
	this.actionKey = actionKey;
	this.actionSkill = skill;
	this.processManager.enemySelectionTurn();
};

Scene_Battle.prototype.commandButtoncancel = function() {
    this._buttonSprite.deactivate();
	this.processManager.reSelectActor();
};

Scene_Battle.prototype.commandEscape = function() {
    BattleManager.processEscape();
    this.changeInputWindow();
};

Scene_Battle.prototype.startActorCommandSelection = function() {
    this._statusWindow.select(BattleManager.actor().index());
    this._partyCommandWindow.close();
    this._actorCommandWindow.setup(BattleManager.actor());
};

Scene_Battle.prototype.commandAttack = function() {
    BattleManager.inputtingAction().setAttack();
    this.selectEnemySelection();
};

Scene_Battle.prototype.commandSkill = function() {
    this._skillWindow.setActor(BattleManager.actor());
    this._skillWindow.setStypeId(this._actorCommandWindow.currentExt());
    this._skillWindow.refresh();
    this._skillWindow.show();
    this._skillWindow.activate();
};

Scene_Battle.prototype.commandGuard = function() {
    BattleManager.inputtingAction().setGuard();
    this.selectNextCommand();
};

Scene_Battle.prototype.commandItem = function() {
    this._itemWindow.refresh();
    this._itemWindow.show();
    this._itemWindow.activate();
};

Scene_Battle.prototype.selectNextCommand = function() {
    BattleManager.selectNextCommand();
    this.changeInputWindow();
};

Scene_Battle.prototype.selectPreviousCommand = function() {
    BattleManager.selectPreviousCommand();
    this.changeInputWindow();
};

Scene_Battle.prototype.selectActorSelection = function() {
    this._actorWindow.refresh();
    this._actorWindow.show();
    this._actorWindow.activate();
};

Scene_Battle.prototype.onActorOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._actorWindow.index());
    this._actorWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
    this.selectNextCommand();
};

Scene_Battle.prototype.onActorCancel = function() {
    this._actorWindow.hide();
    switch (this._actorCommandWindow.currentSymbol()) {
    case 'skill':
        this._skillWindow.show();
        this._skillWindow.activate();
        break;
    case 'item':
        this._itemWindow.show();
        this._itemWindow.activate();
        break;
    }
};

Scene_Battle.prototype.selectEnemySelection = function() {
    this._enemyWindow.refresh();
    this._enemyWindow.show();
    this._enemyWindow.select(0);
    this._enemyWindow.activate();
};

Scene_Battle.prototype.enemySelected = function() {
	var actor = $gameActors._RL_data[this.selectedActorIndex+1];
	var enemies = $gameTroop._enemies[this._spriteset._enemyTeam.index];
    actor._battleStatus.endTurn = true;
	var actionString = {
		"castBy": actor,
		"target": enemies,
		"actionKey" : this.actionKey,
		"skill" : this.actionSkill
	};
	this._spriteset._enemyTeam.deactivate();
	this._buttonSprite.deactivate();
	BattleManager._actionArray.push(actionString);	
	if (this.allActorMoved()){
		BattleManager.makeAnemyMove();
		BattleManager._phase = 'turn';
		this._spriteset._actorSprites[this.selectedActorIndex].deselect();
		this._messageWindow.add('Turn Started !!!');
		BattleManager.processActionArray();
	} else {
		this._spriteset._enemyTeam.deactivate();
		this.actorSelectTurn = true;
		this._buttonSprite.deactivate();
		var numActors = $gameParty.members().length;
	    var tryIndex = (this.selectedActorIndex+1+numActors)% numActors;
		this.selectActor (tryIndex,+1);
	}
};

Scene_Battle.prototype.enemySelecteCancel = function() {
	this.actionKey = null;
	this.actionSkill = null;
	this._spriteset._enemyTeam.deactivate();
	this._buttonSprite.activate();
};


Scene_Battle.prototype.onEnemyOk = function() {
    var action = BattleManager.inputtingAction();
    action.setTarget(this._enemyWindow.enemyIndex());
    this._enemyWindow.hide();
    this._skillWindow.hide();
    this._itemWindow.hide();
    this.selectNextCommand();
};

Scene_Battle.prototype.onEnemyCancel = function() {
    this._enemyWindow.hide();
    switch (this._actorCommandWindow.currentSymbol()) {
    case 'attack':
        this._actorCommandWindow.activate();
        break;
    case 'skill':
        this._skillWindow.show();
        this._skillWindow.activate();
        break;
    case 'item':
        this._itemWindow.show();
        this._itemWindow.activate();
        break;
    }
};

Scene_Battle.prototype.onSkillOk = function() {
    var skill = this._skillWindow.item();
    var action = BattleManager.inputtingAction();
    action.setSkill(skill.id);
    BattleManager.actor().setLastBattleSkill(skill);
    this.onSelectAction();
};

Scene_Battle.prototype.onSkillCancel = function() {
    this._skillWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_Battle.prototype.onItemOk = function() {
    var item = this._itemWindow.item();
    var action = BattleManager.inputtingAction();
    action.setItem(item.id);
    $gameParty.setLastItem(item);
    this.onSelectAction();
};

Scene_Battle.prototype.onItemCancel = function() {
    this._itemWindow.hide();
    this._actorCommandWindow.activate();
};

Scene_Battle.prototype.onSelectAction = function() {
    var action = BattleManager.inputtingAction();
    this._skillWindow.hide();
    this._itemWindow.hide();
    if (!action.needsSelection()) {
        this.selectNextCommand();
    } else if (action.isForOpponent()) {
        this.selectEnemySelection();
    } else {
        this.selectActorSelection();
    }
};

Scene_Battle.prototype.endCommandSelection = function() {
    this._partyCommandWindow.close();
    this._actorCommandWindow.close();
    this._statusWindow.deselect();
};

Scene_Battle.prototype.blurAllSprites = function() {
    var blurFilter = new PIXI.filters.BlurFilter();
	blurFilter.blur = 5;
	this.children.forEach(function(sprite){
		sprite.filters = [blurFilter];
	})
};


//-----------------------------------------------------------------------------
// Sprite_Actor
//
// The sprite for displaying an actor.

function Sprite_Actor() {
    this.initialize.apply(this, arguments);
}

Sprite_Actor.prototype = Object.create(Sprite_Battler.prototype);
Sprite_Actor.prototype.constructor = Sprite_Actor;

Sprite_Actor.MOTIONS = {
    walk:     { index: 0,  loop: true  },
    wait:     { index: 1,  loop: true  },
    chant:    { index: 2,  loop: true  },
    guard:    { index: 3,  loop: true  },
    damage:   { index: 4,  loop: false },
    evade:    { index: 5,  loop: false },
    thrust:   { index: 6,  loop: false },
    swing:    { index: 7,  loop: false },
    missile:  { index: 8,  loop: false },
    skill:    { index: 9,  loop: false },
    spell:    { index: 10, loop: false },
    item:     { index: 11, loop: false },
    escape:   { index: 12, loop: true  },
    victory:  { index: 13, loop: true  },
    dying:    { index: 14, loop: true  },
    abnormal: { index: 15, loop: true  },
    sleep:    { index: 16, loop: true  },
    dead:     { index: 17, loop: true  }
};

Sprite_Actor.prototype.initialize = function(battler) {
    Sprite_Battler.prototype.initialize.call(this, battler);
    this.moveToStartPosition();
	this.selected = false;
	this.selectedShadowAlphaDelta = 0.05;
	this.active = true;
};

Sprite_Actor.prototype.initMembers = function() {
    Sprite_Battler.prototype.initMembers.call(this);
    this._battlerName = '';
    this._motion = null;
    this._motionCount = 0;
    this._pattern = 0;
	this.actions = [];
	this._motionFinished = false;
	this.linkArray = [];
    this.createShadowSprite();
    this.createWeaponSprite();
    this.createMainSprite();
    this.createStateSprite();
	this.creatHpBar();
	this.formation = {};
};

Sprite_Actor.prototype.creatHpBar = function() {
    this.hpBar = new Sprite_HpBar();
	this.hpBar.x = this.x;
	this.hpBar.y = -this._mainSprite.height;
	this.addChild(this.hpBar);
};

Sprite_Actor.prototype.createMainSprite = function() {
    this._mainSprite = new Sprite_Base();
    this._mainSprite.anchor.x = 0.5;
    this._mainSprite.anchor.y = 1;
    this.addChild(this._mainSprite);
    this._effectTarget = this._mainSprite;
};

Sprite_Actor.prototype.createShadowSprite = function() {
    this._shadowSprite = new Sprite();
    this._shadowSprite.bitmap = ImageManager.loadSystem('Shadow2');
    this._shadowSprite.anchor.x = 0.5;
    this._shadowSprite.anchor.y = 0.5;
    this._shadowSprite.y = -2;
    this.addChild(this._shadowSprite);
};

Sprite_Actor.prototype.createWeaponSprite = function() {
    this._weaponSprite = new Sprite_Weapon();
    this.addChild(this._weaponSprite);
};

Sprite_Actor.prototype.createStateSprite = function() {
    this._stateSprite = new Sprite_StateOverlay();
    this.addChild(this._stateSprite);
};

Sprite_Actor.prototype.setBattler = function(battler) {
    Sprite_Battler.prototype.setBattler.call(this, battler);
    var changed = (battler !== this._actor);
    if (changed) {
		battler.sprite = this;
        this._actor = battler;
        if (battler) {
            this.setActorHome(battler.index());
        }
        this.startEntryMotion();
        this._stateSprite.setup(battler);
    }
};

Sprite_Actor.prototype.moveToStartPosition = function() {
    this.moveTo(300, 0, 0);
};

Sprite_Actor.prototype.setActorHome = function(index) {
    this._homeX = 600 + index * 32;
	this._homeY = 280 + index * 48;
	//this.formation.position = index;
	this.moveTo (this._homeX, this._homeY,0);
};

Sprite_Actor.prototype.update = function() {
    Sprite_Base.prototype.update.call(this);
    this.updateShadow();
    if (this._actor) {
		this.updateBitmap();
        this.updateFrame();
		this.updateMove();
        this.updateMotion();
		this.updateSelectionShadow();
		this.updateLink();
		this.updateHpBar();
		//this.updateFadeOut();
    }
};

Sprite_Actor.prototype.updateFadeOut = function () {
	if (this.fadeOut && this.fadeOutDelay>0){
		this.fadeOutDelay--;
	}
	if (this.fadeOut && this.fadeOutDelay == 0 && this.alpha >= 0 ){
		this.alpha -= 0.05;
	}
	if (this.fadeOut && this.alpha ==0){
		this.fadeOut = false;
	}
};

Sprite_Actor.prototype.updateHpBar = function() {
	this.hpBar.x = 0;
	this.hpBar.y = -this._mainSprite.height;
	var chp = this._actor.getValue('CHP');
	var mhp = this._actor.getValue('MHP')
	this.hpBar.displayHpBar (chp,mhp);
};

Sprite_Actor.prototype.updateShadow = function() {
    this._shadowSprite.visible = !!this._actor;
};

Sprite_Actor.prototype.updateSelectionShadow = function() {
    if (this.selected){
		if (this._mainSprite.alpha<=0.5){this.selectedShadowAlphaDelta = +0.05;}
		if (this._mainSprite.alpha>=1){this.selectedShadowAlphaDelta = -0.05;}
		this._mainSprite.alpha += this.selectedShadowAlphaDelta;
	}
};

Sprite_Actor.prototype.deselect = function() {
    this._mainSprite.alpha = 1;
	this.selected = false;
};

Sprite_Actor.prototype.select = function() {
	this.selected = true;
};

Sprite_Actor.prototype.updateMain = function() {
    Sprite_Battler.prototype.updateMain.call(this);
    if (this._actor.isSpriteVisible() && !this.isMoving()) {
        //this.updateTargetPosition();
    }
};

Sprite_Actor.prototype.setupMotion = function() {
    if (this._actor.isMotionRequested()) {
        this.startMotion(this._actor.motionType());
        this._actor.clearMotion();
    }
};

Sprite_Actor.prototype.setupWeaponAnimation = function() {
    if (this._actor.isWeaponAnimationRequested()) {
        this._weaponSprite.setup(this._actor.weaponImageId());
        this._actor.clearWeaponAnimation();
    }
};

Sprite_Actor.prototype.startMotion = function(motionType) {
	//if (motionType = 'attack') {motionType = 'swing';}
    var newMotion = Sprite_Actor.MOTIONS[motionType];
    if (newMotion && this._motion !== newMotion) {
        this._motion = newMotion;
        this._motionCount = 0;
        this._pattern = 0;
		if (!this._motion.loop){this._motionFinished = false;};
    }
};
/*
Sprite_Actor.prototype.updateTargetPosition = function() {
    if (this._actor.isInputting() || this._actor.isActing()) {
        this.stepForward();
    } else if (this._actor.canMove() && BattleManager.isEscaped()) {
        this.retreat();
    } else if (!this.inHomePosition()) {
        this.stepBack();
    }
};*/

Sprite_Actor.prototype.updateBitmap = function() {
    Sprite_Battler.prototype.updateBitmap.call(this);
    var name = this._actor.battlerName();
    if (this._battlerName !== name) {
        this._battlerName = name;
        this._mainSprite.bitmap = ImageManager.loadSvActor(name);
    }
};

Sprite_Actor.prototype.updateFrame = function() {
    Sprite_Battler.prototype.updateFrame.call(this);
    var bitmap = this._mainSprite.bitmap;
    if (bitmap) {
        var motionIndex = this._motion ? this._motion.index : 0;
        var pattern = this._pattern < 3 ? this._pattern : 1;
        var cw = bitmap.width / 9;
        var ch = bitmap.height / 6;
        var cx = Math.floor(motionIndex / 6) * 3 + pattern;
        var cy = motionIndex % 6;
        this._mainSprite.setFrame(cx * cw, cy * ch, cw, ch);
    }
};

Sprite_Actor.prototype.updateMove = function () {
	var bitmap = this._mainSprite.bitmap;
	if (!bitmap || bitmap.isReady()) {
		if (this.targetX == undefined) {this.targetX = this.x;}
		if (this.targetY == undefined) {this.targetY = this.y;}
		//Sprite_Battler.prototype.updateMove.call(this);
		if (this.x != this.targetX || this.y != this.targetY) {
			if (this.moveCount > 0) {
				var deltaX = (this.targetX - this.x) / this.moveCount;
				var deltaY = (this.targetY - this.y) / this.moveCount;
				this.x += deltaX;
				this.y += deltaY;
				this.moveCount--;
			} else {
				this.x = this.targetX;
				this.y = this.targetY;
			}
		}
		if (this.moveCount <= 0) {
			this.updateNextAction();
		}	
	}
};

Sprite_Actor.prototype.updateMotion = function() {
    this.setupMotion();
    this.setupWeaponAnimation();
    if (this._actor.isMotionRefreshRequested()) {
        this.refreshMotion();
        this._actor.clearMotion();
    }
    this.updateMotionCount();
};

Sprite_Actor.prototype.updateMotionCount = function() {
    if (this._motion && ++this._motionCount >= this.motionSpeed()) {
        if (this._motion.loop) {
			if (this._pattern>=3){this._motionFinished = true;}
            this._pattern = (this._pattern + 1) % 4;
        } else if (this._pattern < 2) {
            this._pattern++;
        } else {
			this._motionFinished = true;
			this.updateNextAction();
            this.refreshMotion();
        }
        this._motionCount = 0;
    }
};

Sprite_Actor.prototype.motionSpeed = function() {
    return 9;
};

Sprite_Actor.prototype.refreshMotion = function() {
    var actor = this._actor;
    var motionGuard = Sprite_Actor.MOTIONS['guard'];
    /*if (actor) {
        if (this._motion === motionGuard && !BattleManager.isInputting()) {
                return;
        }
        var stateMotion = actor.stateMotionIndex();
        if (actor.isInputting() || actor.isActing()) {
            this.startMotion('walk');
        } else if (stateMotion === 3) {
            this.startMotion('dead');
        } else if (stateMotion === 2) {
            this.startMotion('sleep');
        } else if (actor.isChanting()) {
            this.startMotion('chant');
        } else if (actor.isGuard() || actor.isGuardWaiting()) {
            this.startMotion('guard');
        } else if (stateMotion === 1) {
            this.startMotion('abnormal');
        } else if (actor.isDying()) {
            this.startMotion('dying');
        } else if (actor.isUndecided()) {
            this.startMotion('walk');
        } else {
            this.startMotion('wait');
        }
    }*/
	if (actor){
		if (actor.getValue('CHP')<=0){
			this.startMotion('dead');
			return;
		}
		this.startMotion('walk');
	}
};

Sprite_Actor.prototype.startEntryMotion = function() {
    if (this._actor && this._actor.canMove()) {
        this.startMotion('walk');
        this.moveTo(this._homeX, this._homeY, 30);
    } else if (!this.isMoving()) {
        this.refreshMotion();
        this.moveTo(this._homeX, this._homeY, 0);
    }
};

Sprite_Actor.prototype.stepForward = function() {
    this.moveTo(this._homeX-48, this._homeY, 12);
};

Sprite_Actor.prototype.stepBack = function() {
    this.moveTo(this._homeX, this._homeY, 12);
};

Sprite_Actor.prototype.retreat = function() {
    this.moveTo(300, 0, 30);
};

Sprite_Actor.prototype.onMoveEnd = function() {
    Sprite_Battler.prototype.onMoveEnd.call(this);
    if (!BattleManager.isBattleEnd()) {
        this.refreshMotion();
    }
};

Sprite_Actor.prototype.damageOffsetX = function() {
    return -32;
};

Sprite_Actor.prototype.damageOffsetY = function() {
    return 0;
};
Sprite_Actor.prototype.updateAnimationSprites = function() {
    if (this._animationSprites.length > 0) {
        var sprites = this._animationSprites.clone();
        this._animationSprites = [];
        for (var i = 0; i < sprites.length; i++) {
            var sprite = sprites[i];
            if (sprite.isPlaying()) {
                this._animationSprites.push(sprite);
            } else {
				if (typeof sprite.callback == 'function'){
					sprite.callback();
				}
                sprite.remove();
            }
        }
    }
};

Sprite_Actor.prototype.startAnimation = function(animation, mirror, delay, target) {
    var sprite = new Sprite_Animation();
	sprite.callback = this.updateNextAction.bind(this);
	this._effectTarget = this.getTarget(target);
    sprite.setup(this._effectTarget, animation, mirror, delay);
    this.parent.addChild(sprite);
    this._animationSprites.push(sprite);
};
Sprite_Actor.prototype.getTarget = function(target) {
    if (!!target) {
		if (target.indexOf('actor')>= 0){
			var index = parseInt(target.replace('<actor>',''));
			return SceneManager._scene.actorSprites[index];
		}
		if (target.indexOf('enemy')>= 0){
			var index = parseInt(target.replace('<enemy>',''));
			return SceneManager._scene.enemySprites[index];
		}
	}
	return this._effectTarget;
};
Sprite_Actor.prototype.moveTo = function (x,y,speed) {
	this.targetX = x;
	this.targetY = y;
	this.moveCount = speed;
};
Sprite_Actor.prototype.isFree = function () {
	var free = !this.isAnimationPlaying() && this._motionFinished && (this.moveCount <=0);
	
	return free;
};

Sprite_Actor.prototype.updateNextAction = function () {
	if (this.isFree()) {
		var nextAction = this.actions.shift();
		if (!!nextAction) {
			if (!!nextAction.motion) {
				this.startMotion(nextAction.motion);
			}
			if (!!nextAction.move) {
				this.moveTo(nextAction.move.x, nextAction.move.y, nextAction.move.speed);
			}
			if (!!nextAction.animation) {
				var ani = $dataAnimations[nextAction.animation.index];
				this.startAnimation(ani, nextAction.animation.mirror, nextAction.animation.delay, nextAction.animation.target);
			}
			if (!!nextAction.link){
				this.linkArray.push(nextAction.link);
			}
			if (!!nextAction.damage) {
				this.setupDamagePop(nextAction.damage);
				this._actor.takeDamage(nextAction.damage.key, nextAction.damage.value);
			}
			if (!!nextAction.die) {
				this.dieAnimation(nextAction.die.dieOut);
			}			
		}
	}
};

Sprite_Actor.prototype.dieAnimation = function (dieOut) {
	console.log('dead');
	this.startMotion('dead');
	if (dieOut){
		//this.startFadeOut(40);
	}
};

Sprite_Actor.prototype.startFadeOut = function (delay) {
	this.fadeOut = true;
	this.fadeOutDelay = delay || 0;
};

Sprite_Actor.prototype.updateLink = function () {
	var i = 0;
	var num = this.linkArray.length;
	while (i < num) {
		var link = this.linkArray[i];
		if (link.hasOwnProperty('delay')) {
			this.linkArray[i].delay--;
			if (this.linkArray[i].delay <= 0) {
				this.linkArray.splice(i,1);
				var target = this.getTarget(link.target);
				target.actions.push(link);
				num--;
				continue;
			}
			i++;
		}
	};
};

Sprite_Actor.prototype.setupDamagePop = function (damage) {
	var value = damage.value;
	var sprite = new Sprite_Damage();
	sprite.scale._x = this.scale._x;
	sprite.x = this.width/4;
	sprite.y =  - this._mainSprite.height - 20;
	sprite.createDigits(damage.baseRow, damage.value);
	this.addChild(sprite);
};
//-----------------------------------------------------------------------------
// Sprite_Actor
//
// The sprite for displaying an actor.

function Sprite_BattleButton() {
    this.initialize.apply(this, arguments);
}

Sprite_BattleButton.prototype = Object.create(Sprite.prototype);
Sprite_BattleButton.prototype.constructor = Sprite_BattleButton;

Sprite_BattleButton.prototype.initialize = function() {
	Sprite.prototype.initialize.call(this);
	this._handlers = {};
	this.buttonKeys = ['Attack','Defence','Magic'];
	this.index = 0;
	this.scale._x = 0.65;
	this.scale._y = 0.65;
    this.buttonBitmap = ImageManager.loadSystem ('button');
	this.buttonBitmap.addLoadListener (function(){
		this.setupButtons();
		this.select(0);
	}.bind(this));
	this.active = false;
	this.visible = false;
};

Sprite_BattleButton.prototype.setupButtons = function() {
	this.unSelectButtons = new Bitmap(150,67*3);
	this.selectButtons = new Bitmap(150,67*3);
	for (var i=0; i<3; i++){
		this.unSelectButtons.blt (this.buttonBitmap,0,0,150,66,0,i*67);
		this.unSelectButtons.textColor = '#000000';
		this.unSelectButtons.drawText (this.buttonKeys[i],17,9+i*67,116,48,'center');
		this.selectButtons.blt (this.buttonBitmap,0,67,150,66,0,i*67);
		this.selectButtons.textColor = '#000000';
		this.selectButtons.drawText (this.buttonKeys[i],17,9+i*67,116,48,'center');
	}
	this.bitmap = new Bitmap (150,67*3);
	this.bitmap.blt (this.unSelectButtons,0,0,150,67*3,0,0);
};

Sprite_BattleButton.prototype.update = function() {
	Sprite.prototype.update.call(this);
	this.processInput();
};

Sprite_BattleButton.prototype.deactivate = function() {
	this.active = false;
	this.visible = false;
};

Sprite_BattleButton.prototype.activate = function() {
	this.active = true;
	this.visible = true;
	this.select (0);
};

Sprite_BattleButton.prototype.processInput = function() {
	if (this.active && this.visible){
		if(Input.isRepeated('up')){
			this.select((this.index-1+3)%3);
		}
		if(Input.isRepeated('down')){
			this.oldIndex = this.index;
			this.select((this.index+1+3)%3);
		}
		if(Input.isRepeated('ok') && this.okEnable()){
			this._handlers['ok']();
		}
		if(Input.isRepeated('cancel') && this.cancelEnable()){
			this._handlers['cancel']();
		}
	}
};

Sprite_BattleButton.prototype.okEnable = function() {
	return !!this._handlers['ok'];
};
Sprite_BattleButton.prototype.cancelEnable = function() {
	return !!this._handlers['cancel'];
};

Sprite_BattleButton.prototype.select = function(index) {
	var old = this.index;
	this.bitmap.blt (this.unSelectButtons,0,old*67,150,66,0,old*67);
	this.bitmap.blt (this.selectButtons,0,index*67,150,66,0,index*67);
	this.index = index;
};

Sprite_BattleButton.prototype.setHandler = function (symbol, method) {
	this._handlers[symbol] = method;
};
/*Spriteset_Battle
 *
 */
function Spriteset_Battle() {
    this.initialize.apply(this, arguments);
}

Spriteset_Battle.prototype = Object.create(Spriteset_Base.prototype);
Spriteset_Battle.prototype.constructor = Spriteset_Battle;

Spriteset_Battle.prototype.initialize = function() {
    Spriteset_Base.prototype.initialize.call(this);
    this._battlebackLocated = false;
};

Spriteset_Battle.prototype.createLowerLayer = function() {
    Spriteset_Base.prototype.createLowerLayer.call(this);
    this.createBackground();
    this.createBattleField();
    this.createBattleback();
    this.createEnemies();
    this.createActors();
};

Spriteset_Battle.prototype.createBackground = function() {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.bitmap = SceneManager.backgroundBitmap();
    this._baseSprite.addChild(this._backgroundSprite);
};

Spriteset_Battle.prototype.update = function() {
    Spriteset_Base.prototype.update.call(this);
    this.updateActors();
    this.updateBattleback();
};

Spriteset_Battle.prototype.createBattleField = function() {
    var width = Graphics.boxWidth;
    var height = Graphics.boxHeight;
    var x = (Graphics.width - width) / 2;
    var y = (Graphics.height - height) / 2;
    this._battleField = new Sprite();
    this._battleField.setFrame(x, y, width, height);
    this._battleField.x = x;
    this._battleField.y = y;
    this._baseSprite.addChild(this._battleField);
};

Spriteset_Battle.prototype.createBattleback = function() {
    var margin = 32;
    var x = -this._battleField.x - margin;
    var y = -this._battleField.y - margin;
    var width = Graphics.width + margin * 2;
    var height = Graphics.height + margin * 2;
    this._back1Sprite = new TilingSprite();
    this._back2Sprite = new TilingSprite();
    this._back1Sprite.bitmap = this.battleback1Bitmap();
    this._back2Sprite.bitmap = this.battleback2Bitmap();
    this._back1Sprite.move(x, y, width, height);
    this._back2Sprite.move(x, y, width, height);
    this._battleField.addChild(this._back1Sprite);
    this._battleField.addChild(this._back2Sprite);
};

Spriteset_Battle.prototype.updateBattleback = function() {
    if (!this._battlebackLocated) {
        this.locateBattleback();
        this._battlebackLocated = true;
    }
};

Spriteset_Battle.prototype.locateBattleback = function() {
    var width = this._battleField.width;
    var height = this._battleField.height;
    var sprite1 = this._back1Sprite;
    var sprite2 = this._back2Sprite;
    sprite1.origin.x = sprite1.x + (sprite1.bitmap.width - width) / 2;
    sprite2.origin.x = sprite1.y + (sprite2.bitmap.width - width) / 2;
    if ($gameSystem.isSideView()) {
        sprite1.origin.y = sprite1.x + sprite1.bitmap.height - height;
        sprite2.origin.y = sprite1.y + sprite2.bitmap.height - height;
    }
};

Spriteset_Battle.prototype.battleback1Bitmap = function() {
    return ImageManager.loadBattleback1(this.battleback1Name());
};

Spriteset_Battle.prototype.battleback2Bitmap = function() {
    return ImageManager.loadBattleback2(this.battleback2Name());
};

Spriteset_Battle.prototype.battleback1Name = function() {
    if (BattleManager.isBattleTest()) {
        return $dataSystem.battleback1Name;
    } else if ($gameMap.battleback1Name()) {
        return $gameMap.battleback1Name();
    } else if ($gameMap.isOverworld()) {
        return this.overworldBattleback1Name();
    } else {
        return '';
    }
};

Spriteset_Battle.prototype.battleback2Name = function() {
    if (BattleManager.isBattleTest()) {
        return $dataSystem.battleback2Name;
    } else if ($gameMap.battleback2Name()) {
        return $gameMap.battleback2Name();
    } else if ($gameMap.isOverworld()) {
        return this.overworldBattleback2Name();
    } else {
        return '';
    }
};

Spriteset_Battle.prototype.overworldBattleback1Name = function() {
    if ($gamePlayer.isInVehicle()) {
        return this.shipBattleback1Name();
    } else {
        return this.normalBattleback1Name();
    }
};

Spriteset_Battle.prototype.overworldBattleback2Name = function() {
    if ($gamePlayer.isInVehicle()) {
        return this.shipBattleback2Name();
    } else {
        return this.normalBattleback2Name();
    }
};

Spriteset_Battle.prototype.normalBattleback1Name = function() {
    return (this.terrainBattleback1Name(this.autotileType(1)) ||
            this.terrainBattleback1Name(this.autotileType(0)) ||
            this.defaultBattleback1Name());
};

Spriteset_Battle.prototype.normalBattleback2Name = function() {
    return (this.terrainBattleback2Name(this.autotileType(1)) ||
            this.terrainBattleback2Name(this.autotileType(0)) ||
            this.defaultBattleback2Name());
};

Spriteset_Battle.prototype.terrainBattleback1Name = function(type) {
    switch (type) {
    case 24: case 25:
        return 'Wasteland';
    case 26: case 27:
        return 'DirtField';
    case 32: case 33:
        return 'Desert';
    case 34:
        return 'Lava1';
    case 35:
        return 'Lava2';
    case 40: case 41:
        return 'Snowfield';
    case 42:
        return 'Clouds';
    case 4: case 5:
        return 'PoisonSwamp';
    default:
        return null;
    }
};

Spriteset_Battle.prototype.terrainBattleback2Name = function(type) {
    switch (type) {
    case 20: case 21:
        return 'Forest';
    case 22: case 30: case 38:
        return 'Cliff';
    case 24: case 25: case 26: case 27:
        return 'Wasteland';
    case 32: case 33:
        return 'Desert';
    case 34: case 35:
        return 'Lava';
    case 40: case 41:
        return 'Snowfield';
    case 42:
        return 'Clouds';
    case 4: case 5:
        return 'PoisonSwamp';
    }
};

Spriteset_Battle.prototype.defaultBattleback1Name = function() {
    return 'Grassland';
};

Spriteset_Battle.prototype.defaultBattleback2Name = function() {
    return 'Grassland';
};

Spriteset_Battle.prototype.shipBattleback1Name = function() {
    return 'Ship';
};

Spriteset_Battle.prototype.shipBattleback2Name = function() {
    return 'Ship';
};

Spriteset_Battle.prototype.autotileType = function(z) {
    return $gameMap.autotileType($gamePlayer.x, $gamePlayer.y, z);
};

Spriteset_Battle.prototype.createEnemies = function() {
    var enemies = $gameTroop.members();
    var sprites = [];
    for (var i = 0; i < enemies.length; i++) {
		//if (!enemies[i].spine){
			sprites[i] = new Sprite_EnemyT(enemies[i]);
		//}
		//else
		//{
			//this._enemyTeam.add(enemies[i]);
		//}
    }
    sprites.sort(this.compareEnemySprite.bind(this));
    for (var j = 0; j < sprites.length; j++) {
        this._battleField.addChild(sprites[j]);
    }
    this._enemySprites = sprites;
	SceneManager._scene.enemySprites = sprites;
};

Spriteset_Battle.prototype.compareEnemySprite = function(a, b) {
    if (a.y !== b.y) {
        return a.y - b.y;
    } else {
        return b.spriteId - a.spriteId;
    }
};

Spriteset_Battle.prototype.createActors = function() {
    this._actorSprites = [];
	var scene = SceneManager._scene;
    for (var i = 0; i < $gameParty.maxBattleMembers(); i++) {
        this._actorSprites[i] = new Sprite_Actor();
		scene.actorSprites.push(this._actorSprites[i]);
        this._battleField.addChild(this._actorSprites[i]);
    }
};

Spriteset_Battle.prototype.updateActors = function() {
    //var members = $IW_gameParty.members();
    for (var i = 0; i < this._actorSprites.length; i++) {
		var actor = $clientActors.actor(i+1);
		if (!!actor){
			actor.spriteIndex = i; 
		}
		
        this._actorSprites[i].setBattler(actor);
    }
};

Spriteset_Battle.prototype.battlerSprites = function() {
    return this._enemySprites.concat(this._actorSprites);
};

Spriteset_Battle.prototype.isAnimationPlaying = function() {
    return this.battlerSprites().some(function(sprite) {
        return sprite.isAnimationPlaying();
    });
};

Spriteset_Battle.prototype.isEffecting = function() {
    return this.battlerSprites().some(function(sprite) {
        return sprite.isEffecting();
    });
};

Spriteset_Battle.prototype.isAnyoneMoving = function() {
    return this.battlerSprites().some(function(sprite) {
        return sprite.isMoving();
    });
};

Spriteset_Battle.prototype.isBusy = function() {
    return this.isAnimationPlaying() || this.isAnyoneMoving();
};