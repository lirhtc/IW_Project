
function Spine_Battle() {
    this.initialize.apply(this, arguments);
}

Spine_Battle.prototype.constructor = Spine_Battle;


Spine_Battle.prototype.initialize = function() {
	this.stepMoveSpeed = 200;
	this.createEnemies();
	//this.createActor();
};

Spine_Battle.prototype.createEnemies = function() {
	var enemies = $gameTroop.members();
	var scene = SceneManager._scene;
	for (var i = 0; i < enemies.length; i++) {
		if (!!enemies[i].spine){
			var id = i;
			var fileName = enemies[i].spine.animation;
			var flipX = enemies[i].spine.flipX;
			var flipY = enemies[i].spine.flipY;
			var scaleX = enemies[i].spine.scaleX;
			var scaleY = enemies[i].spine.scaleY;
			var animationName = "<"+id+">"+fileName;
			var x = enemies[i]._screenX;
			var y = enemies[i]._screenY;
			this.loadEnemy(i,animationName,fileName,x,y,scaleX,scaleY,flipX, flipY);
		}
	}
};

Spine_Battle.prototype.loadEnemy = function(enemyIndex, animationName,fileName,x,y,scaleX,scaleY,flipX, flipY) {
	var path = $RL_systemSettings.spineDataPath;
	PIXI.loader.add(animationName,path + fileName + '.json')
	.load(function (loader, resources){
			var animation = new PIXI.spine.Spine(resources[animationName].spineData);
			var container = SceneManager._scene.SpineContainer
			animation.active = true;
			animation.x = x;
			animation.y = y;
			animation.scale.x = scaleX;
			animation.scale.y = scaleY;
			animation.skeleton.flipX = flipX;
			animation.skeleton.flipY = flipY;
			animation.state.setAnimation(0,'idle',true);
			container.addChild(animation);		
			SceneManager._scene.enemySpine.push(animation);
            var index = SceneManager._scene.enemySpine.length-1;
			$gameTroop.members()[enemyIndex].spineIndex = index;
	});
};

Spine_Battle.prototype.enemyDieOutByIndex = function(index) {
	if (index < SceneManager._scene.enemySpine.length){
		var spine = SceneManager._scene.enemySpine[index];
		spine.state.setAnimation(0,'die',false);
		spine.fadeOutSpeed = 0.5;
		spine.fadeOut = true;		
	}
};

Spine_Battle.prototype.moveTo = function(index, x, y, speed) {
	if (index < SceneManager._scene.enemySpine.length){
		var speed = speed || 60;
		var spine = SceneManager._scene.enemySpine[index];
		spine.moveTo (x,y,speed);
		spine.state.stepMoveMode = true;
	}
};
/*
Spine_Battle.prototype.attack = function(index, x, y) {
	if (index < SceneManager._scene.enemySpine.length){
		var spine = SceneManager._scene.enemySpine[index];
		var actionCallback = (function (){
			return this.animationSeries(index,[],null);
		}.bind(this));
		this.stepMoveTo(index,x,y,actionCallback);
	}
};*/

Spine_Battle.prototype.attack = function(index,x,y) {
	if (index < SceneManager._scene.enemySpine.length){
		var spine = SceneManager._scene.enemySpine[index];
		this.stepMoveTo (index, x, y);
		spine.state.addAnimation(0,'skill_attack',true,0);
	}
};



