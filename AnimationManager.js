function AnimationManager() {
	throw new Error('This is a static class');
}
AnimationManager.initialize = function () {
	this._animationPlaying = false;
	this.globalTimeScale = 1;
	this.animationArray = [];
	this.currentMotion = null;
};

AnimationManager.applyProperty = function (original, property) {
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
AnimationManager.isBusy = function () {
	return this._animationPlaying;
};
AnimationManager.update = function () {
	if (!this.isBusy() && this.animationArray.length>0){
		this.processNextAnimation();
	};
	if (this.isBusy()){
		this.processCurrentAnimation();
		this.peekNextAnimation();		
	};	
};
AnimationManager.processCurrentAnimation = function () {
	if (this._type == 'move'){
		this.processMove();
	}
	if (this._type == 'spine'){
		this.processSpine();
	}
};
AnimationManager.processNextAnimation = function () {
	var motion = this.animationArray.shift();
	this.currentMotion = motion;
	this._type = motion.type;
	this._animationPlaying = true;
};
AnimationManager.peekNextAnimation = function () {
	if (this.animationArray.length>0){
		var nextMotion = this.animationArray[0];
		if (nextMotion.method == 'set'){
			this.processNextAnimation();
		}
	}
};
AnimationManager.processMove = function () {
	if (this._type == 'move' && this.currentMotion.remainCount >= 0){
		var motion = this.currentMotion;
		var displayObject = this.getDisplayObject(motion);
		var steps = motion.remainCount;
		var deltaX = (motion.targetPosition[0]-displayObject.x)/steps;
		var deltaY = (motion.targetPosition[1]-displayObject.y)/steps;
		displayObject.x += deltaX;
		displayObject.y += deltaY;
		this.currentMotion.remainCount--;
		if (this.currentMotion.remainCount<=0){
			this.clearCurrentMotion();
		}
	}
};
AnimationManager.processSpine = function () {
	/*var spine = {
		type: spine
		settings:[{state.timescale:3}]
		loop: false
		delay:0
		start: false
	}*/
	if (!this.currentMotion.start){
		var motion = this.currentMotion;
		var spine = this.getDisplayObject(motion);
		spine.state.addListener({
			complete: function(entry){
				if (entry.animation.name == motion.name){
					motion.settings.forEach(
						function(setting){
							this.applyProperty(spine,setting);
						}.bind(this));
					spine.state.clearListeners();
					this._animationPlaying = false;
				}
			}.bind(this),
			start: function (entry){
				if (entry.animation.name == motion.name){
					motion.settings.forEach(
						function(setting){
							this.applyProperty(spine,setting);
						}.bind(this));
				}
			}.bind(this)
		});		
		spine.state.setAnimation(0,motion.name,motion.loop);
		this.currentMotion.start = true;
	}
};
AnimationManager.clearCurrentMotion = function () {
	this._type = null;
	this.currentMotion = null;
	this._animationPlaying = false;
};

AnimationManager.getDisplayObject = function (motion) {
	var enemyCheck = motion.object.indexOf('enemy')>0;
	var index = parseInt(motion.object.replace(/[^0-9]/g,""));
	if (enemyCheck){
		return SceneManager._scene.enemySpine[index];
	} else {
		return SceneManager._scene.actorSprites[index];
	}
};
AnimationManager.testAnimation = function (){
	this.go = 1;
	var spine = SceneManager._scene.enemySpine[1];
	spine.state.addListener ({
		complete:function(entry){
			this.go++;
			if (entry.animation.name == 'die'){
			spine.state.timeScale = 1;
			console.log('finished');
				console.log('go' + this.go);
			spine.state.clearListeners();}
	}.bind(this),
		start: function (entry){
			console.log('start' + entry.animation.name);
			spine.state.timeScale = 3;
			console.log('go' + this.go);
		}.bind(this)});
	spine.state.setAnimation(0,'die',false,0);
	
	spine.state.addAnimation(0,'idle',true,0);
	
	
};