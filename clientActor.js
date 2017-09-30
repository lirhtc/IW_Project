//-----------------------------------------------------------------------------
// Game_Actor
//
// The game object class for an actor.

function Client_Actor() {
    this.initialize.apply(this, arguments);
}
Client_Actor.prototype.constructor = Client_Actor;
Client_Actor.prototype.initialize = function() {
	this._parameters = {};
	//this.setup();
};

Client_Actor.prototype.setupEmptyActor = function() {
	this.initialActor();
};

Client_Actor.prototype.initMembers = function() {
	this.initialActor();
};


Client_Actor.prototype.setup = function () {
	this.initImages();
	this.initExp(actor);
	this.initSkills();
	this.initialActor();
	this.initEquips();
};
Client_Actor.prototype.initialActor = function () {
	var RL_basicParameters = [];
	var RL_advanParameters = [];
	var basic_num = $RL_systemSettings.parametersBasicDisplayName.length;
	var advan_num = $RL_systemSettings.parametersAdvanDisplayName.length;
	for (var i = 0; i < basic_num; i++) {
		RL_basicParameters.push(0);
	}
	for (var i = 0; i < advan_num; i++) {
		RL_advanParameters.push(0);
	}
	var RL_parameterResult = {
		"basic" : RL_basicParameters,
		"advan" : RL_advanParameters
	};
	this._parameters.original = $IWdataActors[this._parameters.actorId].parameter;
	this._parameters.result = RL_parameterResult;
	this._RL_actions = [];
};
Client_Actor.prototype.actorId = function() {
    return this._parameters.actorId;
};

Client_Actor.prototype.actor = function() {
    return $IWdataActors[this._parameters.actorId];
};
Client_Actor.prototype.name = function() {
    return this._parameters.name;
};

Client_Actor.prototype.setName = function(name) {
    this._parameters.name = name;
};

Client_Actor.prototype.nickname = function() {
    return this._parameters.nickname;
};

Client_Actor.prototype.setNickname = function(nickname) {
    this._parameters.nickname = nickname;
};

Client_Actor.prototype.profile = function() {
    return this._parameters.profile;
};

Client_Actor.prototype.setProfile = function(profile) {
    this._parameters.profile = profile;
};

Client_Actor.prototype.characterName = function() {
    return this._parameters.characterName;
};

Client_Actor.prototype.characterIndex = function() {
    return this._parameters.characterIndex;
};

Client_Actor.prototype.faceName = function() {
    return this._parameters.faceName;
};

Client_Actor.prototype.faceIndex = function() {
    return this._parameters.faceIndex;
};

Client_Actor.prototype.battlerName = function() {
    return this._parameters.battlerName;
};

Client_Actor.prototype.clearStates = function() {
    Game_Battler.prototype.clearStates.call(this);
    this._stateSteps = {};
};

Client_Actor.prototype.eraseState = function(stateId) {
    Game_Battler.prototype.eraseState.call(this, stateId);
    delete this._stateSteps[stateId];
};
//？
Client_Actor.prototype.resetStateCounts = function(stateId) {
    Game_Battler.prototype.resetStateCounts.call(this, stateId);
    this._stateSteps[stateId] = $dataStates[stateId].stepsToRemove;
};

Client_Actor.prototype.expForLevel = function(level) {
    var c = this.currentClass();
    var basis = c.expParams[0];
    var extra = c.expParams[1];
    var acc_a = c.expParams[2];
    var acc_b = c.expParams[3];
    return Math.round(basis*(Math.pow(level-1, 0.9+acc_a/250))*level*
            (level+1)/(6+Math.pow(level,2)/50/acc_b)+(level-1)*extra);
};

Client_Actor.prototype.initExp = function(actor) {
    this._parameters.currentExp = actor.exp;
	this._parameters.totalExp = 0;
};

Client_Actor.prototype.currentExp = function() {
    return this._parameters.currentExp;
};

Client_Actor.prototype.currentLevelExp = function() {
    return this.expForLevel(this._parameters.level);
};

Client_Actor.prototype.nextLevelExp = function() {
    return this.expForLevel(this._parameters.level + 1);
};

Client_Actor.prototype.nextRequiredExp = function() {
    return this.nextLevelExp() - this._parameters.currentExp;
};

Client_Actor.prototype.maxLevel = function() {
    return this.actor().maxLevel;
};

Client_Actor.prototype.isMaxLevel = function() {
    return this._level >= this.maxLevel();
};

Client_Actor.prototype.maxLevel = function() {
    return this.actor().maxLevel;
};

Client_Actor.prototype.isMaxLevel = function() {
    return this._level >= this.maxLevel();
};

//初始化 角色的装备系统
Client_Actor.prototype.initEquips = function () {
	var slotsNum = $RL_systemSettings.totalSlotsNum;
	var RL_EquipsSlots = [];
	var equips = [];
	for (var i = 1; i <= $RL_systemSettings.totalSlotsNum; i++) {
		equips[i] = null;
		RL_EquipsSlots = false;
	}
	for (var i = 1; i <= $RL_systemSettings.enableSlots.length; i++) {
		RL_EquipsSlots[$RL_systemSettings.enableSlots[i]] = true;
	}
	this._RL_equips = {
		"equipSlots" : RL_EquipsSlots,
		"equips" : equips
	};
};

Client_Actor.prototype.initSkills = function() {
    this._RL_skills = [];
    for (var i=0;i<6;i++){
    this._RL_skills.push ($IWdataSkills[1]);
	}
	for (var i=0;i<6;i++){
    this._RL_skills.push ($IWdataSkills[2]);
	}
	for (var i=0;i<6;i++){
    this._RL_skills.push ($IWdataSkills[3]);
	}
	for (var i=0;i<6;i++){
    this._RL_skills.push ($IWdataSkills[4]);
	}
};

Client_Actor.prototype.equipSlots = function() {
    return this._RL_equips.equipSlots;
};

Client_Actor.prototype.equips = function() {
    return this._RL_equips.equips;
};

Client_Actor.prototype.hasWeapon = function(weapon) {
    return (this._RL_equips.equips[1].id == weapon.id) || (this._RL_equips.equips[2].id == weapon.id)
};

Client_Actor.prototype.isEquipChangeOk = function(slotId) {
    return $RL_systemSettings.enableSlots.contains(slotId);
};

Client_Actor.prototype.changeEquip = function(equip, slotId) {
    var canChangeEquip = this.RL_equipLimitCheck(equip);
	if (canChangeEquip){
		var position = $RL_systemSettings.typeMap.indexOf(equip.basic.type);
		var old_equip = this._RL_equips.equips[position];		
		this._RL_equips.equips[position] = equip;
		$clientParty.loseItemIndex(equip,1,slotId);
		$clientParty.gainItem(old_equip,1,0,0);
		this.RL_refresh_patameters();
	}
};

Client_Actor.prototype.forceChangeEquip = function(slotId, item) {
      var canChangeEquip = this.isEquipChangeOk(item.type);
	if (canChangeEquip){
		var currentEquip = this._RL_equips.equips[item.type];
		//？
		this.gainItems(currentEquip);
		this.lostItems(item);
		this.setEquip(item);
		this.refresh();
	}
};

Client_Actor.prototype.discardEquip = function(index) {   
	if (this.isEquipChangeOk(index)){
		var currentEquip = this._RL_equips.equips[index];
		$clientParty.gainItem(currentEquip,1,0,0);
		this._RL_equips.equips[index] = null;
		this.RL_refresh_patameters();
	}
};

Client_Actor.prototype.clearEquipments = function() {
    $RL_systemSettings.enableSlots.map(function (m){
		this.discardEquip(m);
	},this);
};

Client_Actor.prototype.refresh = function() {
    this.RL_refresh_patameters();
};

Client_Actor.prototype.isActor = function() {
    return true;
};

Client_Actor.prototype.isEnemy = function() {
    return false;
};

Client_Actor.prototype.friendsUnit = function() {
    return $clientParty;
};

Client_Actor.prototype.opponentsUnit = function() {
    return $gameTroop;
};

Client_Actor.prototype.index = function() {
    return $clientParty.members().indexOf(this);
};

Client_Actor.prototype.isBattleMember = function() {
    return $clientParty.battleMembers().contains(this);
};

Client_Actor.prototype.isFormationChangeOk = function() {
    return true;
};

Client_Actor.prototype.currentClass = function() {
    return $dataClasses[this._parameters.classId];
};

Client_Actor.prototype.isClass = function(gameClass) {
    return gameClass && this._parameters.classId === gameClass.id;
};

Client_Actor.prototype.skills = function() {
    return this._parameters.skills;
};

Client_Actor.prototype.paramMax = function(paramId) {
    if (paramId === 0) {
        return 9999;    // MHP
    }
    return Game_Battler.prototype.paramMax.call(this, paramId);
};

Client_Actor.prototype.attackAnimationId1 = function() {
    if (this.hasNoWeapons()) {
        return this.bareHandsAnimationId();
    } else {
        var weapons = this.weapons();
        return weapons[0] ? weapons[0].animationId : 0;
    }
};

Client_Actor.prototype.attackAnimationId2 = function() {
    var weapons = this.weapons();
    return weapons[1] ? weapons[1].animationId : 0;
};

Client_Actor.prototype.bareHandsAnimationId = function() {
    return 1;
};

Client_Actor.prototype.levelUp = function() {
    this._parameters.level++;
   /* this.currentClass().learnings.forEach(function(learning) {
        if (learning.level === this._level) {
            this.learnSkill(learning.skillId);
        }
    }, this);*/
};

Client_Actor.prototype.levelDown = function() {
    this._parameters.level--;
};

Client_Actor.prototype.moveFunction = function (move,monster,hero) {
	var order = "";
	var moveSlice = move.match(/[a,b](\.){0}/g);
	for (var i = 0; i < moveSlice.length; i++) {
		var param = moveSlice[i] === "a" ? monster.name : hero.name;
		if (order.length === 0) {			
			order = move.replace(moveSlice[i], param);
		}
		else
		{
			order = order.replace(moveSlice[i], param);
		}
	}
	eval (order);
};
//装备系统的相关函数

Client_Actor.prototype.setEquip = function (equip) {
	var canEquip = this.RL_equipLimitCheck(equip);
	if (canEquip) {
		var position = $RL_systemSettings.typeMap.indexOf(equip.basic.type);
		var old_equip = this._RL_equips.equips[position];		
		this._RL_equips.equips[position] = equip;
		this.RL_refresh_patameters();
		return old_equip;
	}
};
Client_Actor.prototype.RL_refresh_patameters = function () {
	//此函数用于 计算各种属性，
	//先计算基础属性点 -- 然后按照线性加成，叠乘加成的顺序计算
	//后计算参与倍率加成的高级属性 -- 加入基础属性带来的高级属性 -- 然后计算倍率加成 -- 线性，叠乘
	//最后加上不受倍率加成的属性
	//属性是前面为基础属性，后面为高级属性
	var parameter_original = [];
	var parameter_linear = [];
	var parameter_multi = [];
	var parameter_constant = [];
	var result = [];
	var totalNum = $RL_systemSettings.parametersBasicDisplayName.length + $RL_systemSettings.parametersAdvanDisplayName.length;
	//初始化各项参数
	for(var i=0;i<totalNum;i++)
	{
		parameter_original[i] = 0;
		parameter_linear[i] = 1;
		parameter_multi[i] = 1;
		parameter_constant[i] = 0;
		result[i] = 0;
	}
	//用于获取系统定义，从0-3号位置 分别是，基础值，线性，叠乘，固定 加成的trait id
    var system_parameter = $RL_systemSettings.specialTrait;
	// 计算过程，首先计算人物本身属性，然后是技能，然后是装备属性，最后是状态属性

	//******** 人物属性就是加点影响的 **********
	//var basic_parameter_original = this._parameters.original.basic;
	//************* 处理技能加成属性 *************
	for (var i = 0; i < this._RL_skills.length; i++) {
		//开始技能循环
		for (var j = 0; j < this._RL_skills[i].parameters.length; j++) {
			if (this._RL_skills[i].parameters[j].traitId === system_parameter[0]) {
				//如果存在基础值添加
				parameter_original[this._RL_skills[i].parameters[j].dataId-1] +=
				this._RL_skills[i].parameters[j].value;
			}
			if (this._RL_skills[i].parameters[j].traitId === system_parameter[1]) {
				//如果存在基础值线性加成
				parameter_linear[this._RL_skills[i].parameters[j].dataId-1] +=
				this._RL_skills[i].parameters[j].value;
			}
			if (this._RL_skills[i].parameters[j].traitId === system_parameter[2]) {
				//如果存在基础值叠乘加成
				parameter_multi[this._RL_skills[i].parameters[j].dataId-1] *=
				(1+this._RL_skills[i].parameters[j].value);
			}
			if (this._RL_skills[i].parameters[j].traitId === system_parameter[3]) {
				//如果存在基础值叠乘加成
				parameter_constant[this._RL_skills[i].parameters[j].dataId-1] +=
				this._RL_skills[i].parameters[j].value;
			}
		}
	}
	
	// ************* 处理装备属性 *************
	for (var i=0;i<this._RL_equips.equips.length;i++)
	{
		if (this._RL_equips.equips[i]){
		for(var j=0;j<this._RL_equips.equips[i].advan.length;j++)
		{
			parameter_original.forEach(function (element,index,array)
			{
				array[index] = element + this.parameters[index];
			},this._RL_equips.equips[i].advan[j]);
			if (this._RL_equips.equips[i].advan[j].trait_id === system_parameter[0]) {
				//如果存在基础值添加
				parameter_original[this._RL_equips.equips[i].advan[j].trait_dataid-1] +=
				this._RL_equips.equips[i].advan[j].trait_value;
			}
			if (this._RL_equips.equips[i].advan[j].trait_id === system_parameter[1]) {
				//如果存在基础值添加
				parameter_linear[this._RL_equips.equips[i].advan[j].trait_dataid-1] +=
				this._RL_equips.equips[i].advan[j].trait_value;
			}
			if (this._RL_equips.equips[i].advan[j].trait_id === system_parameter[2]) {
				//如果存在基础值添加
				parameter_multi[this._RL_equips.equips[i].advan[j].trait_dataid-1] *=
				this._RL_equips.equips[i].advan[j].trait_value;
			}
			if (this._RL_equips.equips[i].advan[j].trait_id === system_parameter[3]) {
				//如果存在基础值添加
				parameter_constant[this._RL_equips.equips[i].advan[j].trait_dataid-1] +=
				this._RL_equips.equips[i].advan[j].trait_value;
			}
		}
		}
	}
	
	// ************* 处理状态属性：套装，buff，药水 *************
	// 暂且不表 
	// ************* 计算属性最终值 *************
	// 先计算基础属性
	var basic_Ori = parameter_original.slice(0,$RL_systemSettings.parametersBasicDisplayName.length ).map(function (m,i){return m+this[i]},this._parameters.original.basic);	              
	var basic_Lin = parameter_linear.slice(0,$RL_systemSettings.parametersBasicDisplayName.length );
	var basic_Mul = parameter_multi.slice(0,$RL_systemSettings.parametersBasicDisplayName.length );
	var basic_Con = parameter_constant.slice(0,$RL_systemSettings.parametersBasicDisplayName.length );
	var basic = basic_Ori;
	basic.forEach(function (element,index,a){
		a[index] = basic_Lin[index] * element;
	});
	basic.forEach(function (element,index,a){
		a[index] = basic_Mul[index] * element;
	});
	basic.forEach(function (element,index,a){
		a[index] = basic_Con[index] + element;
	});
	this._parameters.result.basic = basic;
    //然后计算高级属性: 基础属性加成+基础高级属性 然后算倍率和固定值
	var advan_ori = this._parameters.original.advan.map(function(m) {return m;});//基础高级属性
	var advan_parameter = [];//用于存放基础值加成
	basic.map(function (num,index){
		advan_parameter = $RL_systemSettings.parameterWeight[index].map(function (v){
			return v*num;
		});
		advan_parameter.map(function (m,i){
			advan_ori[i] += m;
		});		
	});
    advan_ori.forEach(function (m,i,v){
		v[i] = (m+parameter_original[i+basic_Ori.length]) * parameter_linear[i+basic_Ori.length]*parameter_multi[i+basic_Ori.length] + parameter_constant[i+basic_Ori.length];
	});
    this._parameters.result.advan = advan_ori;
};
Client_Actor.prototype.RL_equipLimitCheck = function (equip) {
	// 确定不是null 或者 undefined Object
	var canEquip = true && (equip != null) && (equip != undefined);
	var fouceTrue = false;
	//循环所有限制条件 确定符合每一条限制
	for (var i = 0; i < equip.limit.length; i++) {
		//第一步 先check 基本属性
		for (var j = 0; j < $RL_systemSettings.parametersBasicDisplayName.length; j++) {
			canEquip = canEquip && (equip.limit[i].parameters[j] < 0 ?
					this._parameters.result.basic[j] <= Math.abs(equip.limit[i].parameters[j]) :
					this._parameters.result.basic[j] >= Math.abs(equip.limit[i].parameters[j]));
		}
		canEquip = canEquip && (this._parameters.level >= equip.limit[i].limit_level);
		canEquip = canEquip && !equip.limit[i].unequip;
		fouceTrue = fouceTrue || equip.limit[i].nolimit;
	}
	canEquip = fouceTrue || (canEquip && $RL_systemSettings.enableSlots.contains(equip.basic.type));
	return canEquip;
};
Client_Actor.prototype.RL_enableSlotsName = function () {
	var slotsNum = $RL_systemSettings.totalSlotsNum;
	var enableNames = [];
	var temp_slotsName = "";
	for (var i = 1; i <= slotsNum; i++) {
		temp_slotsName = $RL_systemSettings.enableSlots.contains(i) ? $RL_systemSettings.slotsName[i] : null;
		enableNames.push(temp_slotsName);
	}
	return enableNames;
};
Client_Actor.prototype.RL_isSlotEnable = function (slotIndex) {
	return $RL_systemSettings.enableSlots.contains(slotIndex);
};
Client_Actor.prototype.activeSkills = function () {
	return this._RL_skills.map (function(a){
	if (a.skillType == 1) {return a;}
	});
};
Client_Actor.prototype.constructEquipDescrip = function (equip) {
	var traitLength = equip.advan.length;
	var traitsDes = [];
	for (var i=0; i<traitLength; i++)
	{   
        var traitIdIndex = $RL_systemSettings.specialTrait.indexOf(equip.advan[i].trait_id);
		var tempString = $RL_systemSettings.traitDescription[traitIdIndex];
		tempString = tempString.replace("<n>",$RL_systemSettings.dataName[traitIdIndex][equip.advan[i].trait_dataid]);
		tempString = tempString.replace("<v>",(equip.advan[i].trait_value*(tempString.indexOf("%")>=0 ? 100:1)));
		traitsDes.push(tempString);
	}
	return traitsDes;
};

Client_Actor.prototype.takeDamage = function(key, damage) {
    // need to be finished
	var value = this.getValue(key) - damage;
	this.setValue(key, value);
};

Client_Actor.prototype.available = function() {
    // need to be finished
	return this.getValue('CHP')>0;
};

Client_Actor.prototype.findSkill = function (index) {
	var skill = null;
	var numSkill = this._RL_skills.length;
	for (var i = 0; i<numSkill; i++){
		if (this._RL_skills[i].id == index){
			skill = this._RL_skills[i];
			break;
		}
	}
	return skill;
};
Client_Actor.prototype.getValue = function(key) {
    var index = $RL_systemSettings.parametersShortName.indexOf(key);
	if (index<0){
		return 0;
	}
	if (index<5){
		return this._parameters.result.basic[index];
	} else {
		return this._parameters.result.advan[index-5];
	}
};

Client_Actor.prototype.setValue = function(key, value) {
    var index = $RL_systemSettings.parametersShortName.indexOf(key);
	if (index<0){
		return -1;
	}
	if (index<5){
		this._parameters.result.basic[index] = value;
	} else {
		this._parameters.result.advan[index-5] = value;
	}
};

Client_Actor.prototype.canMove = function() {
    return this.getValue('CHP')>0;
};

Client_Actor.prototype.isSpriteVisible = function() {
    return true;
};
Client_Actor.prototype.isMotionRequested = function() {
    return !!this._motionType;
};
Client_Actor.prototype.motionType = function() {
    return this._motionType;
};
Client_Actor.prototype.clearMotion = function() {
    this._motionType = null;
    this._parameters.motionRefresh = false;
};
Client_Actor.prototype.isWeaponAnimationRequested = function() {
    return this._parameters.weaponImageId > 0;
};
Client_Actor.prototype.weaponImageId = function() {
    return this._parameters.weaponImageId;
};
Client_Actor.prototype.clearWeaponAnimation = function() {
    this._weaponImageId = 0;
};
Client_Actor.prototype.isMotionRefreshRequested = function() {
    return this._parameters.motionRefresh;
};
Client_Actor.prototype.requestMotionRefresh = function() {
    this._parameters.motionRefresh = true;
};
Client_Actor.prototype.stateOverlayIndex = function() {
    var states = this.states();
    if (states.length > 0) {
        return states[0].overlay;
    } else {
        return 0;
    }
};

Client_Actor.prototype.states = function() {
    /*return this._states.map(function(id) {
        return $dataStates[id];
    });*/
	return [];
};
Client_Actor.prototype.stateMotionIndex = function() {
    var states = this.states();
    if (states.length > 0) {
        return states[0].motion;
    } else {
        return 0;
    }
};

Client_Actor.prototype.index = function() {
    return this._parameters.actorId;
};

Client_Actor.prototype.stringify = function() {
    return JSON.stringify(this);
};

Client_Actor.prototype.parse = function(jsonData) {
    Object.assign(this,JSON.parse(jsonData));
};
Client_Actor.prototype.isHidden = function() {
    return this._hidden;
};

Client_Actor.prototype.isAppeared = function() {
    return !this.isHidden();
};
//-----------------------------------------------------------------------------
// Game_Actors
//
// The wrapper class for an actor array.

function Client_Actors() {
    this.initialize.apply(this, arguments);
}

Client_Actors.prototype.initialize = function() {
    this._data = [];
};

Client_Actors.prototype.actor = function(actorId) {
	if (!!this._data[actorId]){
		return this._data[actorId];
	} else {
		return this.requestActorRefresh(actorId);
	}
};

Client_Actors.prototype.requestActorRefresh = function(actorId) {
    var JSONstring = $serverActors.requestRefreshedActor(actorId);
	// initial an empty actor
	this._data[actorId] = new Client_Actor(0);
	if (JSONstring == 'null'){
		this._data[actorId] = null;
	} else {
		this._data[actorId].parse(JSONstring);
	}
	return this._data[actorId];
};
