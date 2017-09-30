
function Sprite_EnemyT() {
	this.initialize.apply(this, arguments);
}

Sprite_EnemyT.prototype = Object.create(Sprite_Base.prototype);
Sprite_EnemyT.prototype.constructor = Sprite_EnemyT;

Sprite_EnemyT.MOTIONS = {
	walk: {
		index: 0,
		loop: true
	},
	wait: {
		index: 1,
		loop: true
	},
	attack: {
		index: 2,
		loop: false
	},
	dead: {
		index: 3,
		loop: false
	}
};

Sprite_EnemyT.prototype.initialize = function (enemy) {
	Sprite_Base.prototype.initialize.call(this);
	this.initMembers(enemy);
};

Sprite_EnemyT.prototype.initMembers = function (enemy) {
	this._battlerName = '';
	this._enemy = enemy;
	this._motion = Sprite_EnemyT.MOTIONS['wait'];
	this._motionCount = 0;
	this._motionFinished = false;
	this.moveCount = 0;
	this._pattern = 0;
	this.active = true;
	this.selected = false;
	this.selectedShadowAlphaDelta = -0.05;
	this.scale._x = -1;
	this.actions = [];
	this.linkArray = [];
	this.loadBitmap(enemy);
	this.setupPosition(enemy);
	this.anchor.x = 0.5;
    this.anchor.y = 1;
};

Sprite_EnemyT.prototype.loadBitmap = function (enemy) {
	var name = $dataEnemies[enemy._enemyId].name;
	this.bitmap = ImageManager.loadSvEnemy(name);
};

Sprite_EnemyT.prototype.setupPosition = function (enemy) {
	this.x = enemy._screenX
	this.y = enemy._screenY;
	this.targetX = enemy._screenX;
	this.targetY = enemy._screenY;
};

Sprite_EnemyT.prototype.select = function () {
	this.selected = true;
};

Sprite_EnemyT.prototype.deselect = function () {
	this.selected = false;
	this.alpha = 1;
};

Sprite_EnemyT.prototype.updateSelect = function () {
	 if (this.selected){
		if (this.alpha<=0.5){this.selectedShadowAlphaDelta = +0.05;}
		if (this.alpha>=1){this.selectedShadowAlphaDelta = -0.05;}
		this.alpha += this.selectedShadowAlphaDelta;
	}
};

Sprite_EnemyT.prototype.update = function () {
	Sprite_Base.prototype.update.call(this);
	this.updateSelect();
	this.updateFrame();
	this.updateMotion();
	this.updateMove();
	this.updateLink();
	this.updateFadeOut();
};

Sprite_EnemyT.prototype.updateFadeOut = function () {
	if (this.fadeOut && this.fadeOutDelay>0){
		this.fadeOutDelay--;
	}
	if (this.fadeOut && this.fadeOutDelay == 0 && this.alpha >= 0 ){
		this.alpha -= 0.05;
	}
	if (this.fadeOut && this.alpha <= 0){
		this.fadeOut = false;
	}
};

Sprite_EnemyT.prototype.isFree = function () {
	var free = !this.isAnimationPlaying() && this._motionFinished && (this.moveCount <=0);// && !this.fadeOut;	
	return free;
};

Sprite_EnemyT.prototype.updateNextAction = function () {
	if (this.isFree()) {
		var nextAction = this.actions.shift();
		if (!!nextAction) {
			if (!!nextAction.motion) {
				console.log(nextAction);
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
			}		
			if (!!nextAction.die) {
				this.dieAnimation(nextAction.die.dieOut);
			}
		} else if (this._enemy.available()){		
			this.startMotion('wait');
		}
	}
};

Sprite_EnemyT.prototype.dieAnimation = function (dieOut) {
	this.startMotion('dead');
	if (dieOut){
		this.startFadeOut(40);
	}
};

Sprite_EnemyT.prototype.startFadeOut = function (delay) {
	this.fadeOut = true;
	this.fadeOutDelay = delay || 0;
};

Sprite_EnemyT.prototype.updateLink = function () {
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

Sprite_EnemyT.prototype.startMotion = function (motionType) {
	var newMotion = Sprite_EnemyT.MOTIONS[motionType];
	if (newMotion == undefined) {newMotion = Sprite_EnemyT.MOTIONS['wait'];}
	if (this._motion !== newMotion) {
		this._motion = newMotion;
		this._motionCount = 0;
		this._pattern = 0;
		if (!this._motion.loop && motionType != 'dead'){this._motionFinished = false;};		
	}
};

Sprite_EnemyT.prototype.moveTo = function (x,y,speed) {
	this.targetX = x;
	this.targetY = y;
	this.moveCount = speed;
};

Sprite_EnemyT.prototype.updateMove = function () {
	if (this.x != this.targetX || this.y != this.targetY){
		if (this.moveCount > 0){
			var deltaX = (this.targetX - this.x)/this.moveCount;
			var deltaY = (this.targetY - this.y)/this.moveCount;
			this.x += deltaX;
			this.y += deltaY;
			this.moveCount--;
		} else {
			this.x = this.targetX;
			this.y = this.targetY;
		}
	}
	if (this.moveCount<=0){
		this.updateNextAction();
	}
};

Sprite_EnemyT.prototype.updateFrame = function () {
	var bitmap = this.bitmap;
	if (bitmap) {
		var motionIndex = this._motion ? this._motion.index : 0;
		var pattern = this._pattern < 4 ? this._pattern : 1;
		var cw = 120;
		var ch = 120;
		var cx = (pattern)*120;
		var cy = motionIndex*120;
		this.setFrame(cx , cy , cw, ch);
	}
};

Sprite_EnemyT.prototype.updateMotion = function () {
	this.updateMotionCount();
};

Sprite_EnemyT.prototype.updateMotionCount = function () {
	if (this._motion && ++this._motionCount >= this.motionSpeed()) {
		if (this._motion.loop) {
			if (this._pattern>=3){this._motionFinished = true;}
			this._pattern = (this._pattern + 1) % 4;
		} else if (this._pattern < 3) {
			this._pattern++;
		} else {
			this.refreshMotion();
			this._motionFinished = true;
			this.updateNextAction();
		}
		this._motionCount = 0;
	}
};

Sprite_EnemyT.prototype.motionSpeed = function () {
	return 9;
};

Sprite_EnemyT.prototype.refreshMotion = function () {
	
};

Sprite_EnemyT.prototype.startEntryMotion = function () {
	if (this._actor && this._actor.canMove()) {
		this.startMotion('walk');
		this.startMove(0, 0, 30);
	} else if (!this.isMoving()) {
		this.refreshMotion();
		this.startMove(0, 0, 0);
	}
};

Sprite_EnemyT.prototype.updateAnimationSprites = function() {
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

Sprite_EnemyT.prototype.startAnimation = function(animation, mirror, delay, target) {
    var sprite = new Sprite_Animation();
	sprite.callback = this.updateNextAction.bind(this);
	this._effectTarget = this.getTarget(target);
    sprite.setup(this._effectTarget, animation, mirror, delay);
    this.parent.addChild(sprite);
    this._animationSprites.push(sprite);
};

Sprite_EnemyT.prototype.getTarget = function(target) {
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

Sprite_EnemyT.prototype.setupDamagePop = function (damage) {
	var value = damage.value;
	var sprite = new Sprite_Damage();
	sprite.scale._x = this.scale._x;
	sprite.x = 0 ;
	sprite.y = -this.height+20;
	sprite.createDigits(damage.baseRow, damage.value);
	this.addChild(sprite);
};
Sprite_EnemyT.prototype.attack = function(actorIndex) {
    var originalX = this.x;
	var originalY = this.y;
	var actorSprite = SceneManager._scene.actorSprites[actorIndex];
	if (this.scale._x < 0){
		var targetX = actorSprite.x - 20;
	} else {
		var targetX = actorSprite.x - 20 - this.width;
	}	
	var targetY = actorSprite.y + actorSprite.height - this.height;
	this.actions.push ({
		"move": {
			"x":targetX,
			"y":targetY,
			"speed":60
		}
	});
	this.actions.push ({
		"motion": "attack",
		"animation": {
			"index":6,
			"mirror":false,
			"delay":20,
			"target":'<actor>' + actorIndex
		},
		"link" : {
			"target": '<actor>' + actorIndex,
			"delay": 20,
			"motion":"damage"
		}
	});
	this.actions.push ({
		"move": {
			"x":originalX,
			"y":originalY,
			"speed":60
		}
	});
};