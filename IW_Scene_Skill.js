
//-----------------------------------------------------------------------------
// IW_Scene_Skill
//
// The scene class of the skill screen.

function IW_Scene_Skill() {
    this.initialize.apply(this, arguments);
}

IW_Scene_Skill.prototype = Object.create(Scene_MenuBase.prototype);
IW_Scene_Skill.prototype.constructor = IW_Scene_Skill;

IW_Scene_Skill.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};

IW_Scene_Skill.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
	this.initializeFormatParameters();
   // this.creatActorStatusWindow();
	this.creatSkillTabWindow();
	this.creatSkillHelpWindow();
	this.createSkillFaceWindow();
	this.refreshActor();
	this.setupAllWindow();
};

IW_Scene_Skill.prototype.initializeFormatParameters = function() {
    this.leftPadding = 20;
	this.rightPadding = 20;
	this.topPadding = 20;
	this.bottomPadding = 20;
	this.skillWindowPosition = 
	{ "x" :  this.leftPadding,
	  "width" : Math.floor((Graphics.width-this.rightPadding - this.leftPadding)/2),
	  "height" : Math.floor((Graphics.height-this.topPadding - this.bottomPadding)/5*3)
    };
	this.skillWindowPosition.y = Graphics.height - this.bottomPadding - this.skillWindowPosition.height;
	this.skillHelpWindowPosition = 
	{ "x" :  Math.floor(Graphics.width/2),
	  "y" : this.topPadding,
	  "width" : Math.floor((Graphics.width-this.rightPadding - this.leftPadding)/2),
	  "height" : Math.floor((Graphics.height-this.topPadding - this.bottomPadding))
    };
	this.faceWindowPosition = 
	{ "x" :  this.leftPadding,
	  "y" :  this.topPadding,
	  "width" : this.skillWindowPosition.width,
	  "height" : Graphics.height - this.topPadding - this.bottomPadding - this.skillWindowPosition.height - 40
    };
};

IW_Scene_Skill.prototype.creatSkillTabWindow = function() {
    var x = this.skillWindowPosition.x;
	var y = this.skillWindowPosition.y;
	var width = this.skillWindowPosition.width;
	var height = this.skillWindowPosition.height;
	console.log ("X:"+x+ "       Y:"+y);
	this._skillTabWindow = new IW_Window_TabSkill(x,y,width,height);
	this._skillTabWindow.setHandler('pagedown',     this.changeActorNext.bind(this));
	this._skillTabWindow.setHandler('pageup',       this.changeActorPrevious.bind(this));
	this._skillTabWindow.setHandler('cancel',       this.popScene.bind(this));
	this.addWindow (this._skillTabWindow );
};

IW_Scene_Skill.prototype.creatSkillHelpWindow = function() {
    var wx = this.skillHelpWindowPosition.x;
    var wy = this.skillHelpWindowPosition.y;
    var ww = this.skillHelpWindowPosition.width;
    var wh = this.skillHelpWindowPosition.height;
    this._helpWindow = new IW_Window_SkillHelp(wx, wy, ww, wh);
    this.addWindow(this._helpWindow);
};

IW_Scene_Skill.prototype.createSkillFaceWindow = function() {
    var wx = this.faceWindowPosition.x;
    var wy = this.faceWindowPosition.y;
    var ww = this.faceWindowPosition.width;
    var wh = this.faceWindowPosition.height;
    this._faceWindow = new IW_Window_SkillFace(wx, wy, ww, wh);
    this.addWindow(this._faceWindow);
};

IW_Scene_Skill.prototype.refreshActor = function() {
    var actor = this.actor();
};

IW_Scene_Skill.prototype.user = function() {
    return this.actor();
};

IW_Scene_Skill.prototype.changeActorNext = function () {
	$IW_gameParty.makeMenuActorNext();
	this._skillTabWindow.refresh(); 
	this._faceWindow.refresh(); 
};

IW_Scene_Skill.prototype.changeActorPrevious = function () {
	$IW_gameParty.makeMenuActorPrevious();
	this._skillTabWindow.refresh(); 
	this._faceWindow.refresh(); 
};

IW_Scene_Skill.prototype.setupAllWindow = function() {

};

IW_Scene_Skill.prototype.onItemOk = function() {
    this.actor().setLastMenuSkill(this.item());
    this.determineItem();
};

IW_Scene_Skill.prototype.onItemCancel = function() {
    this._itemWindow.deselect();
    this._skillTypeWindow.activate();
};

IW_Scene_Skill.prototype.playSeForItem = function() {
    SoundManager.playUseSkill();
};

IW_Scene_Skill.prototype.useItem = function() {
    Scene_ItemBase.prototype.useItem.call(this);
    this._statusWindow.refresh();
    this._itemWindow.refresh();
};

IW_Scene_Skill.prototype.onActorChange = function() {
    this.refreshActor();
    this._skillTypeWindow.activate();
};

IW_Scene_Skill.prototype.actor = function () {
	return $IW_gameParty.menuActor();
};

IW_Scene_Skill.prototype.popScene = function() {
	console.log ("1");
    SceneManager.pop();
};