/*:
 * @plugindesc 为RPG Maker MV 
 * @author 小优【66RPG：rpg-sheep】【百度贴吧：优加星爱兔子】
 *
 * @param backgroundcolor
 * @desc 决定推送背景颜色（rgba）
 * @default rgba(2, 200, 2, 0.4)
 *
 * @help
 * ======================================================================
 * Toast 推送消息
 * $gameTemp.toast(text,color);
 * ======================================================================
 */

// ======================================================================
// * Scene_Base
// ======================================================================
Scene_Base.prototype.IW_adwanSellection_old_updateChildren = Scene_Base.prototype.updateChildren;
Scene_Base.prototype.updateChildren = function() {
    this.IW_adwanSellection_old_updateChildren();
    $gameTemp.updateSelect();
};
// ======================================================================
// * IW_adwanSellection
// ======================================================================
function IW_adwanSellection() {this.initialize.apply(this, arguments);}
IW_adwanSellection.prototype.initialize = function(x, y, width, height, color) {
	this._Sprite = new Sprite();
	this._Sprite.y = y;
	this._Sprite.x = x;
    this._Sprite.bitmap = new Bitmap(width, height);
    this.time = 0;
    this.movey = 0;
    this.anitation = -10;
	var colorm = PluginManager.parameters('advansellection')['backgroundcolor'];
	
    this._Sprite.bitmap.fillRect(0, 0, width, 2, colorm);
    this._Sprite.bitmap.fillRect(0, 0, 2, height, colorm);
    this._Sprite.bitmap.fillRect(width-2, 2, 2, height-2, colorm);
    this._Sprite.bitmap.fillRect(2, height-2, width-2, 2, colorm);
	SceneManager._scene.addChild(this._Sprite);
};
IW_adwanSellection.prototype.up = function() {
	this.movey += 36;
};
IW_adwanSellection.prototype.update = function() {
	if(this._Sprite.alpha >= 250){
		this.anitation = -10;
	}
	if(this._Sprite.alpha <= 100){
		this.anitation = 10;
	}
	this._Sprite.alpha += this.anitation; 
};
IW_adwanSellection.prototype.finish = function() {
	return false;
};
// ======================================================================
// * Game_Temp
// ======================================================================
Game_Temp.prototype.IW_adwanSellection_old_initialize = Game_Temp.prototype.initialize;
Game_Temp.prototype.initialize = function() {
    this.IW_adwanSellection_old_initialize();
    this._selectionList = [];
};
Game_Temp.prototype.ad_select = function(x, y, width, height, color) {
    this._selectionList.push(new IW_adwanSellection(x,y,width,height, color));
};
Game_Temp.prototype.updateSelect = function() {
    for(var i = 0;i < this._selectionList.length;i++){
		this._selectionList[i].update();
		if(this._selectionList[i].finish()){
			this._selectionList.splice(i,1);
			i--;
		}
	}
};
Game_Temp.prototype.move = function(index, keys, values) {
    if (this._selectionList.length>index){
    	for (var i=0; i<keys.length; i++){
    		if (keys[i] != undefined && values[i] != undefined)
    	      this._selectionList[index]._Sprite[keys[i]] = values[i];
    }
    }
};