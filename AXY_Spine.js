//=============================================================================
// XueYu Plugins - Spine
// AXY_Spine.js
// Version: 1.01
// License: BSD
//=============================================================================
 /*:
 * @plugindesc v1.01 This plugin show Spine.
 * @author XueYu Plugins
 *
 * @param X
 * @desc The x position of spine. this is a eval param, so you can use Variables.
 * @default Graphics.width/2
 *
 * @param Y
 * @desc The y position of spine. this is a eval param, so you can use Variables.
 * @default Graphics.height/2
 *
 * @param scalex
 * @desc The scale x of spine.
 * @default 1
 *
 * @param scaley
 * @desc The scale y of spine.
 * @default 1
 *
 * @param path
 * @desc The Spine file you save.
 * @default spine/data/
 *
 * @help
 * Introduction
 * This plugin support rmmv show Spine.
 * Easy to use and powerful. Dependent on AXY_Toast.js
 * 
 * Example:
 * show:
 * AXY_Spine.show({filename:'spineboy', action:'walk'});
 * AXY_Spine.show({filename:'url=spine/data/spineboy.json', action:'jump'});
 * all args with default:
 * AXY_Spine.show({x:400, y:600, action:'walk', filename:'spineboy',scalex:0.5,scaley:0.5});
 *
 * changelog
 * 1.01 2017.1.20
 * remove default action, you must specify the action.
 * 1.00 2017.1.19
 * first release.
 */

// Imported
var Imported = Imported || {};
Imported.AXY_Spine = true;

// Parameter Variables
var AXY = AXY || {};
AXY.Spine = AXY.Spine || {};

AXY.Spine.Parameters = PluginManager.parameters('AXY_Spine');
AXY.Spine.Param = AXY.Spine.Param || {};

// 
//AXY.Spine.Param.action = String(AXY.Spine.Parameters['action']);
AXY.Spine.Param.X = String(AXY.Spine.Parameters['X']);
AXY.Spine.Param.Y = String(AXY.Spine.Parameters['Y']);
AXY.Spine.Param.scalex = parseFloat(AXY.Spine.Parameters['scalex']);
AXY.Spine.Param.scaley = parseFloat(AXY.Spine.Parameters['scaley']);
//AXY.Spine.Param.opacity = parseFloat(AXY.Spine.Parameters['opacity']);
//AXY.Spine.Param.zIndex = parseInt(AXY.Spine.Parameters['zIndex']);
//AXY.Spine.Param.delay = parseInt(AXY.Spine.Parameters['delay']);
AXY.Spine.Param.path = String(AXY.Spine.Parameters['path']);

//main
//Spine
AXY_Spine = {
	show: function (num) {
		//console.log(arguments[3]);
		var AXYSpineArgs 	=	 arguments[0] ? arguments[0] : {};
		var filename 	=	 AXYSpineArgs['filename'] ? AXYSpineArgs['filename'] : "";
		//var delay	 	=	 AXYSpineArgs['delay'] ? AXYSpineArgs['delay'] : AXY.Spine.Param.delay;
		//var id			=	 AXYSpineArgs['id'] ? AXYSpineArgs['id'] : 1;
		var x			=	 AXYSpineArgs['x'] != undefined ? eval(AXYSpineArgs['x']) : eval(AXY.Spine.Param.X);
		var y			=	 AXYSpineArgs['y'] != undefined ? eval(AXYSpineArgs['y']) : eval(AXY.Spine.Param.Y);
		var scalex		=	 AXYSpineArgs['scalex'] ? AXYSpineArgs['scalex'] : AXY.Spine.Param.scalex;
		var scaley		=	 AXYSpineArgs['scaley'] ? AXYSpineArgs['scaley'] : AXY.Spine.Param.scaley;
		//var opacity		=	 AXYSpineArgs['opacity'] ? AXYSpineArgs['opacity'] : AXY.Spine.Param.opacity;
		var action		=	 AXYSpineArgs['action'] ? AXYSpineArgs['action'] : "";
		
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