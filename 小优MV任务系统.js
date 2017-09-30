/*:
 * @plugindesc 为RPG Maker MV新增任务系统。版本：V6.4.3
 * @author 小优【66RPG：rpg-sheep】【百度贴吧：优加星爱兔子】
 *
 * @param windowmode
 * @desc 决定任务窗口位置（1=左置，2=右置）
 * @default 1
 *
 * @param windowcolor
 * @desc 决定任务窗口颜色（rgba）
 * @default rgba(0, 0, 0, 0.4)
 *
 * @help 
 * ======================================================================
 * 小优的任务系统采用全新逻辑方案，与传统任务系统相比，你可以做出任何效果！
 * ======================================================================
 * 在脚本中输入以下内容来操作任务系统：
 * ----------------------------------------------------------------------
 * 新增任务：
 * $gameParty.addmission(id,name,description,childs,reward,color,autocomplete);
 * id(string):可以任意填写，是你识别任务的唯一参数，注意最好不要重复。
 * name(string):可以任意填写，是显示的任务名称。
 * description(string):可以任意填写，是显示的任务介绍。
 * childs(array):任务要点列表，以[child,child,...]的格式填写，在下一条目有介绍。
 * reward(array):完成奖励，以[['EXP',数量],['MONEY',数量],['ITEM',数量],['ARMOR',数量],['WEAPON',数量],...]的格式填写。
 * color(string):任务颜色，填'#xxxxxx'的十六进制格式，填null默认为白色。
 * autocomplete(boolean):是否自动完成任务，自动完成的意思就是达成条件后无需NPC触发。
 * ----------------------------------------------------------------------
 * 为某个任务新增要点：
 * $gameParty.addmissionchild(id,child);
 * id(string):任务ID。
 * child(array):要点，以[id,name,maxnumber,readnumber,autocomplete,completed]的格式填写。
 *     id(string):可以任意填写，是你识别要点的唯一参数，同一任务中注意最好不要重复。
 *     name(string):可以任意填写，是显示的要点名称。
 *     maxnumber(int):大于0！达到这个数本要点将会被判定为达成。
 *     readnumber(int/string):
 *         如果填int:需要你手动改变，可以做类似“摘三朵花”之类的任务。
 *         如果填string:变量名称，会自动监测那个变量，可以做类似“生命达到1000”之类的任务。
 *     autocomplete(boolean):是否自动完成本条件，自动完成的意思就是达成要点后无需NPC触发。
 *     completed(boolean):初始状态是否完成，一般填false。
 * ----------------------------------------------------------------------
 * 为某个任务的某个要点中的readnumber+1：
 * $gameParty.upratemissionchild(id,childid);
 * id(string):任务ID。
 * childid(string):要点ID。
 * ----------------------------------------------------------------------
 * 指定某个任务的某个要点中的readnumber：
 * $gameParty.setratemissionchild(id,childid,num);
 * id(string):任务ID。
 * childid(string):要点ID。
 * num(int):值。
 * ----------------------------------------------------------------------
 * 检测任务要点是否完成：
 * $gameParty.ismissionchildcompleted(id,childid);
 * id(string):任务ID。
 * childid(string):要点ID。
 * 这个方法会检测要点是否完成，并返回一个布尔值。所以这个方法我的建议是放
 * 在条件分歧的脚本一栏里。
 * ----------------------------------------------------------------------
 * 强制完成任务要点：
 * $gameParty.completemissionchild(id,childid);
 * id(string):任务ID。
 * childid(string):要点ID。
 * ----------------------------------------------------------------------
 * 手动完成任务要点：
 * $gameParty.donemissionchild(id,childid);
 * id(string):任务ID。
 * childid(string):要点ID。
 * 这条与上面那个不一样之处在于：
 *     1、这个方法会检测是否满足达成要点的条件，并返回是否完成的布尔值。
 *     2、如果不满足条件，还是不会完成。
 * 所以这个方法我的建议是放在条件分歧的脚本一栏里。
 * ----------------------------------------------------------------------
 * 删除任务要点：
 * $gameParty.delmissionchild(id,childid);
 * id(string):任务ID。
 * childid(string):要点ID。
 * ----------------------------------------------------------------------
 * 检测任务是否完成：
 * $gameParty.ismissioncompleted(id);
 * id(string):任务ID。
 * 这个方法会检测任务是否完成，并返回一个布尔值。所以这个方法我的建议是放
 * 在条件分歧的脚本一栏里。
 * ----------------------------------------------------------------------
 * 强制完成任务：
 * $gameParty.completemission(id);
 * id(string):任务ID。
 * ----------------------------------------------------------------------
 * 手动完成任务：
 * $gameParty.donemission(id);
 * id(string):任务ID。
 * 与上一条的差别同前。
 * ----------------------------------------------------------------------
 * 删除任务：
 * $gameParty.delmission(id);
 * id(string):任务ID。
 * ----------------------------------------------------------------------
 * NPC头上任务描绘的语法：在事件注释里输入：
 * <NPC:name,color,xadd,yadd>
 * name:可以任意填写，但不能包含英文逗号，是显示的NPC名称，不可缺省。
 * color:NPC名称颜色，填'#xxxxxx'的十六进制格式，不区分大小写，不可缺省。
 * xadd:可以填负号和0-9，X坐标偏移量，不可缺省。
 * yadd:可以填负号和0-9，X坐标偏移量，不可缺省。
 * <ICO:id,xadd,yadd>
 * id:图标ID，不可缺省。
 * xadd:可以填负号和0-9，X坐标偏移量，不可缺省。
 * yadd:可以填负号和0-9，X坐标偏移量，不可缺省。
 * <MIS:mission,child,color,xadd,yadd>
 * mission:任务ID，不可缺省。
 * child:子任务ID，若缺省，则代表追踪主任务状态，否则代表追踪子任务。
 * color:渲染颜色，填'#xxxxxx'的十六进制格式，不区分大小写，不可缺省。
 * xadd:可以填负号和0-9，X坐标偏移量，不可缺省。
 * yadd:可以填负号和0-9，X坐标偏移量，不可缺省。
 * ----------------------------------------------------------------------
 * Toast 推送消息
 * $gameTemp.toast(text,color);
 * ======================================================================
 * 实用小技巧Q&A：
 * ----------------------------------------------------------------------
 * Q：小优你的配置太麻烦了，你会不会出类似JSON的数据库？
 * A：抱歉不会。因为JSON数据库有他的局限性：不可动态改变。小优的很多功能
 * 都是动态改变的，虽然说如果你不使用动态改变的功能，可以这么干，但万一
 * 你用了就会混乱，所以……如果你一定需要数据库，请自行配置。
 * ----------------------------------------------------------------------
 * Q：能不能简单介绍一下你的任务系统？
 * A：小优的任务系统需要你记住以下四个关键词：主任务、要点、达成、完成。
 *    主任务：为addmission添加的任务，完成它能获得reward奖励。
 *    要点：可以理解为子任务，完成一个要点并不能获得reward中的奖励。
 *    达成：指达到了完成的条件，但并不等同于完成。举个例子：有一个任务“摘
 * 花”，其中一个要点是“摘三朵花并送给凯伦”。你摘了三朵花后，任务即为达成，
 * 但是你需要找凯伦，这个要点才能被完成。当然具体怎么设置归你管。
 *    完成：已经完成的任务或要点无法改变状态。此任务或要点被锁定。
 *    注意：必须先达成才能完成;任务的达成条件是全部要点被完成。当然有个
 * 强制完成的操作，可以跳过达成这一步。
 * ----------------------------------------------------------------------
 * Q：我想做一个任务“摘花”，摘三朵花后自动完成摘三朵花要点，怎么破？
 * A：将摘三朵花要点的autocomplete设置为true，即可在达成该要点时自动完成。
 * ----------------------------------------------------------------------
 * Q：我想做一个任务“修炼”，要求是玩家血量和MP都大于100，之后找一个NPC，
 * 但是我不希望血量曾经达到100就锁定这个要点，怎么破？
 * A：将玩家血量、MP要点的autocomplete设置为false，就不会自动锁定。
 * ----------------------------------------------------------------------
 * Q：怎么判断某个任务是否完成啊！NPC要根据是否完成做出回答啊!
 * A：你用事件的条件分歧第4页中的脚本栏：
 *        若：脚本：$gameParty.iscompleted(id)
 *           文字：哈哈，恭喜！
 *        其他
 *           文字：快点去完成！
 *        结束
 *    若你想做特殊效果，这个判断不仅返回是否完成，还会顺便自动完成，就把
 * $gameParty.iscompleted(id)换成$gameParty.donemission(id)。
 * ======================================================================
 */
 
//是否开启地图窗口（可在游戏内使用脚本WINODWOPEN_MISSION = true/false动态更改）
var WINODWOPEN_MISSION = true;
// ======================================================================
// * Window_XY_Mission
// ======================================================================
function Window_XY_Mission() {this.initialize.apply(this, arguments);}
Window_XY_Mission.prototype = Object.create(Window_Base.prototype);
Window_XY_Mission.prototype.constructor = Window_XY_Mission;
Window_XY_Mission.prototype.initialize = function() {
    Window_Base.prototype.initialize.call(this, (Number(PluginManager.parameters('小优MV任务系统')['windowmode']) === 2 ? Graphics.boxWidth - this.windowWidth() : 0), Graphics.boxHeight/2, this.windowWidth(), this.windowHeight());
    this.opacity = 0;
	this.line = 0;
	this.padd = 1;
    this.refresh();
};
Window_XY_Mission.prototype.standardFontSize = function() {return 18;};
Window_XY_Mission.prototype.standardPadding = function() {return 0;};
Window_XY_Mission.prototype.textPadding = function() {return 10;};
Window_XY_Mission.prototype.windowWidth = function() {return 300;};
Window_XY_Mission.prototype.windowHeight = function() {return 300};
Window_XY_Mission.prototype.update = function() {
	Window_Base.prototype.update.call(this);
	this.refresh();
};
Window_XY_Mission.prototype.refresh = function() {
    this.contents.clear();
    var width = this.contentsWidth();
	var missionlist = $gameParty.getucmission().reverse();
	var height = this.standardFontSize()*$gameParty.getmissiondrawline() + (1 + missionlist.length)*this.textPadding();
	this.line = 0;
	this.padd = 0;
	if(missionlist.length > 0){this.drawBackground(width, height);}
	for(var i = 0;i < missionlist.length;i++){
		var childinfos = [];
		for(var b = 0;b < missionlist[i].childs.length;b++){
		    childinfos.push([missionlist[i].childs[b][1],missionlist[i].getchildratebyindex(b),missionlist[i].childs[b][6]]);	
	    }
		this.drawMission(width,missionlist[i].name,missionlist[i].description,childinfos,missionlist[i].color);
		this.padd ++;
	}
};
Window_XY_Mission.prototype.drawBackground = function(width, height) {
	this.contents.context.fillStyle = (PluginManager.parameters('小优MV任务系统')['windowcolor']||'rgba(0, 0, 0, 0.4)');
    this.contents.context.fillRect(0, 0, width, height);
};
Window_XY_Mission.prototype.drawMission = function(width,name,description,childinfos,color) {
	this.contents.textColor = color;
    this.drawText(name, this.textPadding(), this.standardFontSize()*this.line + this.textPadding()*this.padd, width ,'left');
	this.contents.textColor = '#ffffff';
	this.line ++;
	this.contents.fontSize -= 2;
	for(var i = 0;i < childinfos.length;i++){
		this.contents.textColor = (childinfos[i][2] ? '#999999' : '#ffffff');
		this.drawText('▪ ' + childinfos[i][0], this.textPadding()*3, this.standardFontSize()*this.line + this.textPadding()*this.padd, width, 'left');
        this.drawText(childinfos[i][1], 0, this.standardFontSize()*this.line + this.textPadding()*this.padd, width - this.textPadding(), 'right');
		this.contents.textColor = '#ffffff';
		this.line ++;
	}
	this.contents.fontSize += 2;
};
// ======================================================================
// * Scene_Map
// ======================================================================
Scene_Map.prototype.XY_Mission_old_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
Scene_Map.prototype.createDisplayObjects = function() {
	this.XY_Mission_old_createDisplayObjects();
	this.XY_createMissionWindow();
};
Scene_Map.prototype.XY_createMissionWindow = function() {
    this._XY_MissionWindow = new Window_XY_Mission();
    this.addWindow(this._XY_MissionWindow);
};
Scene_Map.prototype.XY_Mission_old_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    this.XY_Mission_old_update();
    if($gameMap._interpreter.isRunning()||!WINODWOPEN_MISSION){
        this._XY_MissionWindow.close();
    }else{
        this._XY_MissionWindow.open();  
    }
};
// ======================================================================
// * XY_Mission*/
// ======================================================================
function XY_Mission() {this.initialize.apply(this, arguments);}
XY_Mission.prototype.initialize = function(id,name,description,childs,reward,color,autocomplete) {
    this.id = id;
    this.name = name;
    this.description = description;
	//Child[id,name,maxnumber,readnumber,autocomplete,completed]
    this.childs = childs;
    this.reward = reward;
	this.color = (color ? color : '#FFFFFF');
    this.autocomplete = (autocomplete ? autocomplete : false);
	this.completed = false;
	$gameTemp.toast('你接取了任务 “' + this.name + '”', this.color);
};

//添加任务要点
XY_Mission.prototype.addchild = function(child){
    this.childs.push(child);
};
//根据id寻找任务要点
XY_Mission.prototype.findchildindexbyid = function(id){
    for(var i = 0;i < this.childs.length;i++){
        if(this.childs[i][0] === id){
            return i;
        }
    }
	return null;
};
//获取任务要点完成度（仅绘图用）
XY_Mission.prototype.getchildratebyid = function(id){
	if(this.findchildindexbyid(id)!==null){
	    return this.getchildratebyindex(this.findchildindexbyid(id));
    }
	return false;
};
XY_Mission.prototype.getchildratebyindex = function(index){
    if(index >= 0 && index < this.childs.length){
		return ((this.childs[index][3]<=0||this.childs[index][3]>0) ? this.childs[index][3] : eval(this.childs[index][3])) + "/" + this.childs[index][2];
    }
	return false;
};
//增加一点任务要点完成度
XY_Mission.prototype.upchildratebyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
		this.upchildratebyindex(this.findchildindexbyid(id));
    }
};
XY_Mission.prototype.upchildratebyindex = function(index){
    if(index >= 0 && index < this.childs.length){
		if(this.childs[index][3]<=0||this.childs[index][3]>0){
			this.childs[index][3]++;
			if (this.childs[index][3]>=this.childs[index][2]){this.childs[index][6]=true;}
			$gameTemp.toast(this.childs[index][1] + '（' + this.getchildratebyindex(index) + '）', this.color);
		}
    }
};
//设置任务要点完成度
XY_Mission.prototype.setchildratebyid = function(id,num){
 	if(this.findchildindexbyid(id)!==null){
	    this.setchildratebyindex(this.findchildindexbyid(id),num);
    }
};
XY_Mission.prototype.setchildratebyindex = function(index,num){
    if(index >= 0 && index < this.childs.length){
		if(this.childs[index][3]<=0||this.childs[index][3]>0){
			this.childs[index][3] = num;
			if (this.childs[index][3]>=this.childs[index][2]){this.childs[index][6]=true;}
			$gameTemp.toast(this.childs[index][1] + '（' + this.getchildratebyindex(index) + '）', this.color);
		}
    }
};
//移除任务要点
XY_Mission.prototype.removechildbyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    this.removechildbyindex(this.findchildindexbyid(id));
    }
};
XY_Mission.prototype.removechildbyindex = function(index){
    if(index >= 0 && index < this.childs.length){
	    this.childs.splice(index,1);
    }
};
//强制完成任务要点
XY_Mission.prototype.completechildbyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    this.completechildbyindex(this.findchildindexbyid(id));
    }
};
XY_Mission.prototype.completechildbyindex = function(index){
    if(index >= 0 && index < this.childs.length && !this.childs[index][5]){
		$gameTemp.toast('完成任务要点 “' + this.childs[index][1] + '” ！', this.color);
		this.childs[index][5] = true;
    }
};
//获取任务要点是否达成
XY_Mission.prototype.ischildcompletebyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    return this.ischildcompletebyindex(this.findchildindexbyid(id));
    }
	return false;
};
XY_Mission.prototype.ischildcompletebyindex = function(index){
    if(index >= 0 && index < this.childs.length){
		return this.childs[index][6];
    }
	return false;
};


/*XY_Mission.prototype.ischildcompletebyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    return this.ischildcompletebyindex(this.findchildindexbyid(id));
    }
	return false;
};
XY_Mission.prototype.ischildcompletebyindex = function(index){
    if(index >= 0 && index < this.childs.length){
		return (((this.childs[index][3]<=0||this.childs[index][3]>0) ? this.childs[index][3] : eval(this.childs[index][3])) >= this.childs[index][2]);
    }
	return false;
};*/
//获取任务要点是否完成
XY_Mission.prototype.ischildcompletedbyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    return this.ischildcompletedbyindex(this.findchildindexbyid(id));
    }
	return false;
};
XY_Mission.prototype.ischildcompletedbyindex = function(index){
    if(index >= 0 && index < this.childs.length){
		return this.childs[index][5];
    }
	return false;
};
//手动完成任务要点
XY_Mission.prototype.donechildbyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    return this.donechildbyindex(this.findchildindexbyid(id));
    }
	return false;
};
XY_Mission.prototype.donechildbyindex = function(index){
    if(index >= 0 && index < this.childs.length){
	    if(this.ischildcompletebyindex(index)){this.completechildbyindex(index);}
	    return this.ischildcompletedbyindex(index);
    }
	return false;
};
//自动完成任务要点
XY_Mission.prototype.testchildbyid = function(id){
 	if(this.findchildindexbyid(id)!==null){
	    this.testchildbyindex(this.findchildindexbyid(id));
    }
};
XY_Mission.prototype.testchildbyindex = function(index){
    if(index >= 0 && index < this.childs.length){
	    if(this.ischildcompletebyindex(index) && this.childs[index][4]){$gameTemp.toast('被自动完成');this.completechildbyindex(index);}
    }
};
//自动完成全部任务要点
XY_Mission.prototype.testallchild = function(){
	for(var i = 0;i < this.childs.length;i++){
		this.testchildbyindex(i);
    }
};
//强制完成任务
XY_Mission.prototype.complete = function(){
	if(!this.completed){
	    $gameTemp.toast('完成任务 “' + this.name + '” !', this.color);
		this.getreward();
	    this.completed = true;
	}
};
//获取任务是否达成
XY_Mission.prototype.iscomplete = function(){
    var isco = true;
    for(var i = 0;i < this.childs.length;i++){
        if(!this.ischildcompletebyindex(i)){
            isco = false;
        }
    }
    return isco;
};
//获取任务是否完成
XY_Mission.prototype.iscompleted = function(){
    return this.completed;
};
//手动完成任务
XY_Mission.prototype.done = function(){
    if(this.iscomplete()){this.complete();}
	return this.iscompleted();
};
//自动完成任务
XY_Mission.prototype.test = function(){
	if((this.iscomplete()) && (this.autocomplete)){this.complete();}
};
//自动完成任务并且自动完成任务要点
XY_Mission.prototype.testall = function(){
    this.testallchild();
	this.test();
};
//获取奖励
XY_Mission.prototype.getreward = function(){
    for(var i = 0;i < this.reward.length;i++){
        if(this.reward[i][0] === 'EXP'){
            $gameParty.members().forEach(function(actor) {
                actor.changeExp(actor.currentExp() + this.reward[i][1], true);
            }.bind(this));
        }else if(this.reward[i][0] === 'MONEY'){
            $gameParty.gainGold(this.reward[i][1]);
        }else if(this.reward[i][0] === 'VAR'){
            eval(this.reward[i][1] + '+=' + this.reward[i][2]);
        }else if(this.reward[i][0] === 'ITEM'){
            $gameParty.gainItem($dataItems[this.reward[i][1]], this.reward[i][2]);
        }else if(this.reward[i][0] === 'WEAPON'){
            $gameParty.gainItem($dataWeapons[this.reward[i][1]], this.reward[i][2]);
        }else if(this.reward[i][0] === 'ARMOR'){
            $gameParty.gainItem($dataArmors[this.reward[i][1]], this.reward[i][2]);
        }
    }
};
// ======================================================================
// * Game_Party
// ======================================================================
Game_Party.prototype.XY_Mission_old_initialize = Game_Party.prototype.initialize;
Game_Party.prototype.initialize = function() {
    this.XY_Mission_old_initialize();
    this._missionlist = [];
};
//添加任务
Game_Party.prototype.addmission = function(id,name,description,childs,reward,color,autocomplete) {
    this._missionlist.push(new XY_Mission(id,name,description,childs,reward,color,autocomplete));
};
//添加要点
Game_Party.prototype.addmissionchild = function(id,child) {
	if(this.findmissionindexbyid(id)!==null){
         this._missionlist[this.findmissionindexbyid(id)].addchild(child);
	}
};
//根据id寻找任务
Game_Party.prototype.findmissionindexbyid = function(id){
    for(var i = 0;i < this._missionlist.length;i++){
        if(this._missionlist[i].id === id){
            return i;
        }
    }
	return null;
};
//删除任务
Game_Party.prototype.delmission = function(id) {
	if(this.findmissionindexbyid(id)!==null){
        this._missionlist.splice(this.findmissionindexbyid(id),1);
	}
};
//删除任务要点
Game_Party.prototype.delmissionchild = function(id,childid) {
	if(this.findmissionindexbyid(id)!==null){
        this._missionlist[this.findmissionindexbyid(id)].removechildbyid(childid);
	}
};
//刷新所有
Game_Party.prototype.testallmission = function(){
    for(var i = 0;i < this._missionlist.length;i++){
        this._missionlist[i].testall();
    }
};
//任务是否包含要点
Game_Party.prototype.ismissionchildexist = function(id,childid){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].findchildindexbyid(childid) !== null;
	}
	return false;
};
//任务要点是否达成
Game_Party.prototype.ismissionchildcomplete = function(id,childid){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].ischildcompletebyid(childid);
	}
	return false;
};
//任务要点是否完成
Game_Party.prototype.ismissionchildcompleted = function(id,childid){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].ischildcompletedbyid(childid);
	}
	return false;
};
//任务是否达成
Game_Party.prototype.ismissioncomplete = function(id){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].iscomplete();
	}
	return false;
};
//任务是否完成
Game_Party.prototype.ismissioncompleted = function(id){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].iscompleted();
	}
	return false;
};
//增加一点任务要点完成度
Game_Party.prototype.upratemissionchild = function(id,childid){
    if(this.findmissionindexbyid(id)!==null){
        this._missionlist[this.findmissionindexbyid(id)].upchildratebyid(childid);
	}
};
//设置任务要点完成度
Game_Party.prototype.setratemissionchild = function(id,childid,num){
    if(this.findmissionindexbyid(id)!==null){
        this._missionlist[this.findmissionindexbyid(id)].setchildratebyid(childid,num);
	}
};
//强制完成任务要点
Game_Party.prototype.completemissionchild = function(id,childid){
    if(this.findmissionindexbyid(id)!==null){
        this._missionlist[this.findmissionindexbyid(id)].completechildbyid(childid);
	}
};
//手动完成任务要点
Game_Party.prototype.donemissionchild = function(id,childid){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].donechildbyid(childid);
	}
	return false;
};
//强制完成任务
Game_Party.prototype.completemission = function(id){
    if(this.findmissionindexbyid(id)!==null){
        this._missionlist[this.findmissionindexbyid(id)].complete();
	}
};
//手动完成任务
Game_Party.prototype.donemission = function(id){
    if(this.findmissionindexbyid(id)!==null){
        return this._missionlist[this.findmissionindexbyid(id)].done();
	}
	return false;
};
//获取所有任务
Game_Party.prototype.getallmission = function(){
    return this._missionlist;
};
//获取所有未完成任务
Game_Party.prototype.getucmission = function(){
	var allmission = [];
	for(var i = 0;i < this._missionlist.length;i++){
		if(!this._missionlist[i].iscompleted()){
			allmission.push(this._missionlist[i]);
		}
	}
    return allmission;
};
//获取所有已完成任务
Game_Party.prototype.getcmission = function(){
	var allmission = [];
	for(var i = 0;i < this._missionlist.length;i++){
		if(this._missionlist[i].iscompleted()){
			allmission.push(this._missionlist[i]);
		}
	}
    return allmission;
};
//获取绘图行数
Game_Party.prototype.getmissiondrawline = function(){
	var templine = 0;
	var tempmission = this.getallmission();
	templine += tempmission.length;
	for(var i = 0;i < tempmission.length;i++){
		if(tempmission[i].description !== ''){
			templine++;
		}
		templine += tempmission[i].childs.length;
	}
	return templine;
};
Game_Party.prototype.misExistance = function(id){
	if ($gameMission.missionVisibility.indexOf(id)!=-1){
		return $gameMission.missionVisibility.indexOf(id);
	}
	else
	{
		return null;
	}
};
//  任务可见性检验
Game_Party.prototype.misVisible = function(id){
	if ($gameMission.missionVisibility.indexOf(id)!=-1){
		var position = $gameMission.missionVisibility.indexOf(id);
		return $gameMission.missionVisibility[position+id.length+1];
	}
	else
	{
		return false;
	}
};
// ======================================================================
// * Sprite_Character
// ======================================================================
Sprite_Character.prototype.XY_Mission_old_initialize = Sprite_Character.prototype.initialize;
Sprite_Character.prototype.initialize = function(character) {
    this.XY_Mission_old_initialize(character);
    if (character instanceof Game_Event) {
        var datas = character.event().note.match(/\<NPC:[^,]*,#[0-9a-f]{6},[-0-9]*,[-0-9]*\>/i);
        if (datas !== null) {
			datas = datas[0].slice(5,datas[0].length-1).split(',');
            this.drawNPC(datas[0].toString(),datas[1].toString(),parseInt(datas[2]),parseInt(datas[3]));
        };
        datas = character.event().note.match(/\<ICO:[0-9]*,[-0-9]*,[-0-9]*\>/i);
        if (datas !== null) {
			datas = datas[0].slice(5,datas[0].length-1).split(',');
            this.drawIco(parseInt(datas[0]),parseInt(datas[1]),parseInt(datas[2]));			    
        };
	    datas = character.event().note.match(/\<MIS:[^,]*,[^,]*,#[0-9a-f]{6},[-0-9]*,[-0-9]*\>/ig);
        if (datas !== null) {
			for(var i = 0;i < datas.length;i++){
			    var data = datas[i].slice(5,datas[i].length-1).split(',');
				var mission = data[0].toString();
				var child = data[1].toString();
				var havmis = $gameParty.findmissionindexbyid(mission)!==null;
				var miscop = $gameParty.ismissioncomplete(mission);
				var miscod = $gameParty.ismissioncompleted(mission);
				var havchi = $gameParty.ismissionchildexist(mission,child);
				var chicop = $gameParty.ismissionchildcomplete(mission,child);
				var chicod = $gameParty.ismissionchildcompleted(mission,child);
				var misExis = $gameParty.misExistance(mission);
				var misVisi = $gameParty.misVisible(mission);
	            if((child===''&&(!havmis||(havmis&&!miscop&&!miscod)||(havmis&&miscop&&!miscod)))||(child!==''&&!miscod&&((havchi&&!chicop&&!chicod)||(havchi&&chicop&&!chicod)))){
                    this.drawMis(mission,child,'#A4A4A4'.toString(),parseInt(data[3]),parseInt(data[4]));
					break;
					$gameTemp.toast('Go');
	            }else if(i === datas.length - 1){
					this.drawMisempty(parseInt(data[3]),parseInt(data[4]));
					break;
				}
			}
        };
    };
};
Sprite_Character.prototype.drawNPC = function(name,color,xadd,yadd) {
    this._NPCname = new Sprite();
    this._NPCname.bitmap = new Bitmap(100, 20);
    this._NPCname.bitmap.fontSize = 18;
    this._NPCname.bitmap.textColor = color;
    this._NPCname.bitmap.drawText(name, 0, 0, 100, 20, 'center');
    this._NPCname.anchor.x = 0.5;
    this._NPCname.anchor.y = 1;
    this._NPCname.x = xadd;
    this._NPCname.y = yadd;
    this.addChild(this._NPCname);
}
Sprite_Character.prototype.drawIco = function(iconIndex,xadd,yadd) {
    this._NPCico = new Sprite();
    this._NPCico.bitmap = new Bitmap(32, 32);
    var icos = ImageManager.loadSystem('IconSet');
    var pw = Window_Base._iconWidth;
    var ph = Window_Base._iconHeight;
    var sx = iconIndex % 16 * pw;
    var sy = Math.floor(iconIndex / 16) * ph;
    this._NPCico.bitmap.blt(icos, sx, sy, pw, ph, 0, 0);
    this._NPCico.anchor.x = 0.5;
    this._NPCico.anchor.y = 1;
    this._NPCico.x = xadd;
    this._NPCico.y = yadd;
    this.addChild(this._NPCico);
}
Sprite_Character.prototype.drawMis = function(mission,child,color,xadd,yadd) {
	var havmis = $gameParty.findmissionindexbyid(mission)!==null;
	var miscop = $gameParty.ismissioncomplete(mission);
	var miscod = $gameParty.ismissioncompleted(mission);
	var havchi = $gameParty.ismissionchildexist(mission,child);
	var chicop = $gameParty.ismissionchildcomplete(mission,child);
	var chicod = $gameParty.ismissionchildcompleted(mission,child);
	this._NPCmis = new Sprite();
    this._NPCmis.bitmap = new Bitmap(32, 32);
    this._NPCmis.bitmap.fontSize = 32;
    this._NPCmis.bitmap.textColor = ((havmis&&!miscop&&!miscod)||(havchi&&!chicop&&!chicod) ? '#999999' : color);
    this._NPCmis.bitmap.drawText((!havmis ? '？' : '！'), 0, 0, 32, 32, 'center');
    this._NPCmis.anchor.x = 0.5;
    this._NPCmis.anchor.y = 1;
    this._NPCmis.x = xadd;
    this._NPCmis.y = yadd;
    this.addChild(this._NPCmis);
};
Sprite_Character.prototype.drawMisempty = function(xadd,yadd) {
	this._NPCmis = new Sprite();
    this._NPCmis.bitmap = new Bitmap(32, 32);
    this._NPCmis.bitmap.fontSize = 32;
    this._NPCmis.anchor.x = 0.5;
    this._NPCmis.anchor.y = 1;
    this._NPCmis.x = xadd;
    this._NPCmis.y = yadd;
    this.addChild(this._NPCmis);
};
Sprite_Character.prototype.XY_Mission_update = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
    this.XY_Mission_update();
	if(this._NPCmis){
        this.updatemis();
	}
};
Sprite_Character.prototype.updatemis = function() {
	this._NPCmis.bitmap.clear();
    var datas = this._character.event().note.match(/\<MIS:[^,]*,[^,]*,#[0-9a-f]{6},[-0-9]*,[-0-9]*\>/ig);
    if (datas !== null) {
	    for(var i = 0;i < datas.length;i++){
			var data = datas[i].slice(5,datas[i].length-1).split(',');
			var mission = data[0].toString();
			var child = Number(data[1]);
			var havmis = $gameParty.findmissionindexbyid(mission)!==null;
			var miscop = $gameParty.ismissioncomplete(mission);
			var miscod = $gameParty.ismissioncompleted(mission);
			var misExis = $gameParty.misExistance(mission);
			var misVisi = $gameParty.misVisible(mission);
			if (misVisi && !havmis && (child===1 || child ===3) ){ //任务可见，但是没接
			    this._NPCmis.bitmap.textColor = data[2].toString();
                this._NPCmis.bitmap.drawText('！', 0, 0, 32, 32, 'center');
			    this._NPCmis.x = parseInt(data[3]);
                this._NPCmis.y = parseInt(data[4]);
					break;
			};
			if (havmis && !miscop&& (child===2 || child ===3) ){ //有任务，没做完
				this._NPCmis.bitmap.textColor = '#A4A4A4';
                this._NPCmis.bitmap.drawText('？', 0, 0, 32, 32, 'center');
			    this._NPCmis.x = parseInt(data[3]);
                this._NPCmis.y = parseInt(data[4]);
					break;
			};
			if (havmis && miscop && !miscod&& (child===2 || child ===3) ){ //有任务，做完了，没交呢
				this._NPCmis.bitmap.textColor = data[2].toString();
                this._NPCmis.bitmap.drawText('？', 0, 0, 32, 32, 'center');
			    this._NPCmis.x = parseInt(data[3]);
                this._NPCmis.y = parseInt(data[4]);
					break;
			};
			/*
	        if((child===''&&(!havmis||(havmis&&!miscop&&!miscod)||(havmis&&miscop&&!miscod)))||(child!==''&&!miscod&&((havchi&&!chicop&&!chicod)||(havchi&&chicop&&!chicod)))){
				this._NPCmis.bitmap.textColor = ((havmis&&!miscop&&!miscod)||(havchi&&!chicop&&!chicod) ? '#999999' : data[2].toString());
                this._NPCmis.bitmap.drawText('@#', 0, 0, 32, 32, 'center');
			    this._NPCmis.x = parseInt(data[3]);
                this._NPCmis.y = parseInt(data[4]);
				break;
	        }*/
		};
    };
};
// ======================================================================
// * Scene_Base
// ======================================================================
Scene_Base.prototype.XY_Mission_old_updateChildren = Scene_Base.prototype.updateChildren;
Scene_Base.prototype.updateChildren = function() {
    this.XY_Mission_old_updateChildren();
    $gameParty.testallmission();
};
// ======================================================================
// * Scene_XY_Mission
// ======================================================================
function Scene_XY_Mission() {this.initialize.apply(this, arguments);}
Scene_XY_Mission.prototype = Object.create(Scene_MenuBase.prototype);
Scene_XY_Mission.prototype.constructor = Scene_XY_Mission;
Scene_XY_Mission.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
};
Scene_XY_Mission.prototype.create = function() {
	Scene_MenuBase.prototype.create.call(this);
	this.createHelpWindow();
	this.createItemWindow();
};
Scene_XY_Mission.prototype.createHelpWindow = function() {
    this._helpWindow = new XY_Mission_Window_Help(200, 0, Graphics.boxWidth - 200, Graphics.boxHeight);
    this.addWindow(this._helpWindow);
};
Scene_XY_Mission.prototype.createItemWindow = function() {
    this._itemWindow = new XY_Mission_Window_ItemList(0, 0, 200, Graphics.boxHeight);
    this._itemWindow.setHelpWindow(this._helpWindow);
    this._itemWindow.setHandler('cancel', this.popScene.bind(this));
    this.addWindow(this._itemWindow);
	this._itemWindow.refresh();
	this._itemWindow.activate();
	this._itemWindow.selectLast();
};
// ======================================================================
// * XY_Mission_Window_ItemList
// ======================================================================
function XY_Mission_Window_ItemList() {this.initialize.apply(this, arguments);}
XY_Mission_Window_ItemList.prototype = Object.create(Window_Selectable.prototype);
XY_Mission_Window_ItemList.prototype.constructor = XY_Mission_Window_ItemList;
XY_Mission_Window_ItemList.prototype.initialize = function(x, y, width, height) {
    Window_Selectable.prototype.initialize.call(this, x, y, width, height);
    this._data = [];
};
XY_Mission_Window_ItemList.prototype.standardFontSize = function() {return 18;};
XY_Mission_Window_ItemList.prototype.maxCols = function() {return 1;};
XY_Mission_Window_ItemList.prototype.maxItems = function() {return this._data ? this._data.length : 1;};
XY_Mission_Window_ItemList.prototype.item = function() {
    var index = this.index();
    return this._data && index >= 0 ? this._data[index] : null;
};
XY_Mission_Window_ItemList.prototype.makeItemList = function() {
	this._data = $gameParty.getucmission().reverse().concat($gameParty.getcmission().reverse());
};
XY_Mission_Window_ItemList.prototype.selectLast = function() {this.select(0);};
XY_Mission_Window_ItemList.prototype.drawItem = function(index) {
    var item = this._data[index];
    if (item) {
        var rect = this.itemRect(index);
        rect.width -= this.textPadding();
        this.changePaintOpacity(!item.completed);
		this.contents.textColor = item.color;
        this.drawText(item.name, rect.x + 10, rect.y, rect.width - 20);
        this.changePaintOpacity(1);
    }
};
XY_Mission_Window_ItemList.prototype.updateHelp = function() {this.setHelpWindowItem(this.item());};
XY_Mission_Window_ItemList.prototype.refresh = function() {
    this.makeItemList();
    this.createContents();
    this.drawAllItems();
};
// ======================================================================
// * XY_Mission_Window_Help
// ======================================================================
function XY_Mission_Window_Help() {this.initialize.apply(this, arguments);}
XY_Mission_Window_Help.prototype = Object.create(Window_Base.prototype);
XY_Mission_Window_Help.prototype.constructor = XY_Mission_Window_Help;
XY_Mission_Window_Help.prototype.initialize = function(x, y, width, height) {
    Window_Base.prototype.initialize.call(this, x, y, width, height);
	this._item = null;
};
XY_Mission_Window_Help.prototype.standardPadding = function() {return 12;};
XY_Mission_Window_Help.prototype.standardFontSize = function() {return 18;};
XY_Mission_Window_Help.prototype.setItem = function(item) {
    if (this._item !== item) {
	    this._item = item;
	    this.refresh();
	}
};
XY_Mission_Window_Help.prototype.processNormalCharacter = function(textState) {
    var c = textState.text[textState.index];
    var w = this.textWidth(c);
	if (this.width - 2 * this.standardPadding() - textState.x >= w){
        this.contents.drawText(c, textState.x, textState.y, w * 2, textState.height);
		textState.index++;
        textState.x += w;
    }else{
        this.processNewLine(textState);
		textState.index--;
        this.processNormalCharacter(textState);
	}
};
XY_Mission_Window_Help.prototype.refresh = function() {
    this.contents.clear();
	var item = this._item;
	if(item){
		var y = 0;
		this.contents.textColor = item.color;
		this.contents.paintOpacity = item.completed ? this.translucentOpacity() : 255;
	    this.drawText(item.name + (item.completed ? '（已完成）' : ''), 6, y, this.width - 2*this.standardPadding() - 6, 'center');
		y += 36;
		this.contents.paintOpacity = 255;
		this.contents.textColor = '#ffffff';
		
        this.drawTextEx(item.description, 6, y);
		
		y = this.height/5*2 - 10;
		
		for(var i = 0;i < item.childs.length;i++){
		    this.contents.textColor = (item.childs[i][5] ? '#999999' : '#ffffff');
		    this.drawText('▪ ' + item.childs[i][1], 6, y, this.width - 2*this.standardPadding() - 6, 'left');
            this.drawText(item.getchildratebyindex(i), 6, y, this.width - 2*this.standardPadding() - 8, 'right');
		    this.contents.textColor = '#ffffff';
		    y += this.standardFontSize() + this.textPadding();
	    }
		
		y = this.height/5*4 - 5;
		this.drawText('任务奖励：', 6, y, this.width - 2*this.standardPadding() - 6, 'left');
		y += this.standardFontSize()+this.textPadding() + 3;
		
		var drawints = ['0 ' + TextManager.expA, '0' + TextManager.currencyUnit];
		for(var i = 0;i < item.reward.length;i++){
            if(item.reward[i][0] === 'EXP'){
				drawints[0] = item.reward[i][1] + ' ' + TextManager.expA;
            }else if(item.reward[i][0] === 'MONEY'){
                drawints[1] = item.reward[i][1] + TextManager.currencyUnit;
            }else if(item.reward[i][0] === 'ITEM'){
                drawints.splice(2,0,$dataItems[item.reward[i][1]].name + '*' + item.reward[i][2]);
            }else if(item.reward[i][0] === 'WEAPON'){
                drawints.splice(2,0,$dataWeapons[item.reward[i][1]].name + '*' + item.reward[i][2]);
            }else if(item.reward[i][0] === 'ARMOR'){
                drawints.splice(2,0,$dataArmors[item.reward[i][1]].name + '*' + item.reward[i][2]);
            }
        }
		
		var ssl = '';
		for(var i = 0;i < 2;i++){
            ssl += drawints[i];
			if(i < 1){ssl += '    ';}
        }
		this.drawText(ssl, 8, y, this.width - 2*this.standardPadding() - 6, 'left');
		y += this.standardFontSize()+this.textPadding();

		ssl = '';
		for(var i = 2;i < drawints.length;i++){
            ssl += drawints[i];
			if(i < drawints.length - 1){ssl += '    ';}
        }
		this.drawText(ssl, 8, y, this.width - 2*this.standardPadding() - 6, 'left');
	}
};
// ======================================================================
// * Scene_Menu
// ======================================================================
Scene_Menu.prototype.XY_old_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
Scene_Menu.prototype.createCommandWindow = function() {
	this.XY_old_createCommandWindow();
    this._commandWindow.setHandler('mission',   this.command_XY_Mission.bind(this));
};
Scene_Menu.prototype.command_XY_Mission = function() {
    SceneManager.push(Scene_XY_Mission);
};
// ======================================================================
// * Window_MenuCommand
// ======================================================================
Window_MenuCommand.prototype.XY_old_addOriginalCommands = Window_MenuCommand.prototype.addOriginalCommands;
Window_MenuCommand.prototype.addOriginalCommands = function() {
	this.XY_old_addOriginalCommands();
	this.addCommand('任务', 'mission', this.areMainCommandsEnabled());
};
