//=============================================================================
// RhandR Plugins - Spine
// RR_Spine.js
// Version: 1.00
// License: BSD
//=============================================================================
 /*:
 * @plugindesc v1.00 This plugin show Spine.
 * @author RhandR Studio
 *
 * @param path
 * @desc The Spine file you save.
 * @default spine/data/
 *
 * @help
 * Introduction
 * This plugin support RM MV show Spine.
 * Easy to use and powerful. Dependent on PIXI.js v3 and above
 * 
 * Example:
 * show:
 * AXY_Spine.show({filename:'spineboy', action:'walk'});
 * AXY_Spine.show({filename:'url=spine/data/spineboy.json', action:'jump'});
 * all args with default:
 * AXY_Spine.show({x:400, y:600, action:'walk', filename:'spineboy',scalex:0.5,scaley:0.5});
 *
 * changelog
 * 1.00 new release
 */

// Imported
var Imported = Imported || {};
Imported.RR_Spine = true;

// Parameter Variables
var RR = RR || {};
RR.Spine = RR.Spine || {};

RR.Spine.Parameters = PluginManager.parameters('RR_Spine');
RR.Spine.Param = RR.Spine.Param || {};



//AXY.Spine.Param.opacity = parseFloat(AXY.Spine.Parameters['opacity']);
//AXY.Spine.Param.zIndex = parseInt(AXY.Spine.Parameters['zIndex']);
//AXY.Spine.Param.delay = parseInt(AXY.Spine.Parameters['delay']);
RR.Spine.Param.path = String(AXY.Spine.Parameters['path']);

//main
//Spine
RR_Spine = {
	show: function (num) {
		var spine;
		var scene = SceneManager._scene;
		for(var i=0;i<num; i++){
			var name = 'states_haste' + i.toString();
			console.log(name);
		PIXI.loader.add(name,'spine/data/states_haste.json')
		.load(function (loader, resources){
			var animation = new PIXI.spine.Spine(resources[name].spineData);
			var container = new PIXI.DisplayObjectContainer();
			container.addChild(animation);
			animation.x = Math.floor(Math.random()*800);
			animation.y = Math.floor(Math.random()*400);
			animation.scale.x = 0.5;
			animation.scale.y = 0.5;
			scene.addChild(container);
			animation.state.setAnimationByName(0,'animation2',true,0);
		});
	}

	},
	remove: function () {
		/*var id			=	 arguments[0] ? arguments[0] : 1;
		$('#AXYSpine'+id).stop().animate({"width": "0","height": "0"}, "normal", function() {
			$(this).remove();
		});*/
	},
	removeall: function () {
		/*$('.AXYSpine').stop().animate({"width": "0","height": "0"}, "normal", function() {
			$(this).remove();
		});*/
	}
};

RR_Spine.setAnimation =  function (id, action, fileName, x, y, scaleX, scaleY){
		if (id< this.animations.length){
			this.animations[id].fileName = fileName || "";
			this.animations[id].x = x || Graphics.width / 2;
			this.animations[id].y = y || Graphics.height / 2;
			this.animations[id].scaleX = scaleX || 1;
			this.animations[id].scaleY = scaleY || 1;
			this.animations[id].action = action;
		}
		else 
		{
			this.creatAnimation (action, fileName, x, y, scaleX, scaleY);
		}
};

RR_Spine.creatAnimation =  function (action, fileName, x, y, scaleX, scaleY){
	this.animations = this.animations || [];
	return this.animations.push({
		"fileName" : fileName || "",
		"x" : x || Graphics.width / 2,
		"y" : y || Graphics.height / 2,
		"scaleX" : scaleX || 1,
		"scaleY" : scaleY || 1,
		"action" : action
	})-1;
};

RR_Spine.setupContainer = function(container) {
	container.selected = false;
	container.selectedShadowAlphaDelta = 0.05;
	container.moveSpeed = 100;//defined the movement will finish within certain frames
	container.moveEnable = 0;
	container.moveFactor = {'x':1,'y':1};
	container.update = function ()
	{
		container.updateSelectionShadow();
		container.updatePositionChange();
	};
	
	container.updateSelectionShadow = function() {
		if (container.selected){
			if (container.alpha<=0.3){container.selectedShadowAlphaDelta = +0.05;}
			if (container.alpha>=1){container.selectedShadowAlphaDelta = -0.05;}
			container.alpha += container.selectedShadowAlphaDelta;
		}
	};
	
	container.updatePositionChange = function() {
		if (container.moveEnable){
			container.moveEnable--;
			container.children[0].x += container.moveFactor.x;
			container.children[0].y += container.moveFactor.y;
		}
	};
	
	container.moveTo = function(x,y) {
		x = x || container.children[0].x;
		y = y || container.children[0].y;
		container.targetX = x;
		container.targetY = y;
		container.moveFactor.x = (x-container.children[0].x)/container.moveSpeed;
		container.moveFactor.y = (y-container.children[0].y)/container.moveSpeed;
		container.moveEnable = container.moveSpeed;
	};	
	
	container.deselect = function() {
		container.alpha = 1;
		container.selected = false;
	};
	
	container.select = function() {
	container.selected = true;
	}
	return container;
};

RR_Spine.startAnimation =  function (id,flipX,flipY,Fathercontainer,fatherSpriteSet){
		if (id < this.animations.length)
		{
			var spine;
			var scene = SceneManager._scene;
			var chosedAnimation = this.animations[id];
			var name = chosedAnimation.fileName + id.toString();
			PIXI.loader.add(name,RR.Spine.Param.path + chosedAnimation.fileName + '.json')
			.load(function (loader, resources){
			var animation = new PIXI.spine.Spine(resources[name].spineData);
			var container = this.setupContainer(new PIXI.Container());
			container.name = name;
			container.addChild(animation);		
			animation.x = chosedAnimation.x;
			animation.y = chosedAnimation.y;
			animation.scale.x = chosedAnimation.scaleX;
			animation.scale.y = chosedAnimation.scaleY;
			animation.skeleton.flipX = flipX;
			animation.skeleton.flipY = flipY;
			fatherSpriteSet.push(animation);
			Fathercontainer.push(container);
			scene.addChild(container);
			animation.state.setAnimation(0,chosedAnimation.action,true);
			if (!!name){
				RR_Spine.animationContainers = RR_Spine.animationContainers || {};
				RR_Spine.animationContainers[id] = container;
			}
			}.bind(this));

		}	
};

RR_Spine.fadeOut =  function (id,fadeOutSpeed,callback){
	var container = RR_Spine.animationContainers[id];
	if (!!container){
		container.children[0].old_update = container.children[0].update;
		container.children[0].update = function (dt) {
			container.children[0].old_update(dt);
			// change alpha to 0
			if (container.children[0].alpha>0){
				container.children[0].alpha -= fadeOutSpeed/100;
			}
			else {
				// remove sprite from sence when alpha is 0 or less
				var scene = SceneManager._scene;
				var index = scene.children.indexOf (container);
				if (index>-1){scene.children.splice(index,1);}
				// destroy the resources from PIXI.loader
				for (var i in PIXI.loader.resources){
					if (i.indexOf(container.name)>-1) { 
						delete PIXI.loader.resources[i];
					}
				}			
				if (typeof callback == "function"){callback();}
			}
		}.bind(container.children[0]);
		delete RR_Spine.animationContainers[id];
	}
};

RR_Spine.flipAnimation =  function (id, flipX, flipY){
	if (!!this.animationContainers[id]){
		flipX = flipX || false;
		flipY = flipY || false;
		var spineSprite = this.animationContainers[id].children[0];
		var skeleton = spineSprite.skeleton;
		skeleton.flipX = flipX;
		skeleton.flipY = flipY;	
	}
};

RR_Spine.setAnimation =  function (id, animation, loop){
	loop = loop || true;
	if (!!this.animationContainers[id]){
		var spineSprite = this.animationContainers[id].children[0];
		spineSprite.state.setAnimation(0,animation,loop);
	}
};

/*
RR_Container.prototype.update = function() {
    PIXI.Container.prototype.update.call(this);
	this.updateSelectionShadow();
};

RR_Container.prototype.updateSelectionShadow = function() {
    if (this.selected){
		if (this.alpha<=0.5){this.selectedShadowAlphaDelta = +0.05;}
		if (this.alpha>=1){this.selectedShadowAlphaDelta = -0.05;}
		this.alpha += this.selectedShadowAlphaDelta;
	}
};

RR_Container.prototype.deselect = function() {
    this.alpha = 1;
	this.selected = false;
};

RR_Container.prototype.select = function() {
	this.selected = true;
};*/