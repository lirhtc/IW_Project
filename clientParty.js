
//-----------------------------------------------------------------------------
// Client_Party
//
// The game object class for the party. Information such as gold and items is
// included.

function Client_Party() {
    this.initialize.apply(this, arguments);
}

Client_Party.prototype = Object.create(Game_Unit.prototype);
Client_Party.prototype.constructor = Client_Party;

Client_Party.ABILITY_ENCOUNTER_HALF    = 0;
Client_Party.ABILITY_ENCOUNTER_NONE    = 1;
Client_Party.ABILITY_CANCEL_SURPRISE   = 2;
Client_Party.ABILITY_RAISE_PREEMPTIVE  = 3;
Client_Party.ABILITY_GOLD_DOUBLE       = 4;
Client_Party.ABILITY_DROP_ITEM_DOUBLE  = 5;

Client_Party.prototype.initialize = function() {
    Game_Unit.prototype.initialize.call(this);
    this._gold = 0;
    this._steps = 0;
    this._lastItem = new Game_Item();
    this._menuActorId = 0;
    this._targetActorId = 0;
    this._actors = [];
    this.initAllItems();
};

Client_Party.prototype.initAllItems = function() {
    this._items = {};
    this._weapons = {};
    this._armors = {};
};

Client_Party.prototype.exists = function() {
    return this._actors.length > 0;
};

Client_Party.prototype.size = function() {
    return this.members().length;
};

Client_Party.prototype.isEmpty = function() {
    return this.size() === 0;
};

Client_Party.prototype.members = function() {
    return this.inBattle() ? this.battleMembers() : this.allMembers();
};

Client_Party.prototype.allMembers = function() {
    return this._actors.map(function(id) {
        return $gameActors.actor(id);
    });
};

Client_Party.prototype.battleMembers = function() {
    return this.allMembers().slice(0, this.maxBattleMembers()).filter(function(actor) {
        return actor.isAppeared();
    });
};

Client_Party.prototype.maxBattleMembers = function() {
    return 4;
};

Client_Party.prototype.leader = function() {
    return this.battleMembers()[0];
};

Client_Party.prototype.reviveBattleMembers = function() {
    this.battleMembers().forEach(function(actor) {
        if (actor.isDead()) {
            actor.setHp(1);
        }
    });
};

Client_Party.prototype.items = function() {
    var list = [];
    for (var id in this._items) {
        list.push($dataItems[id]);
    }
    return list;
};

Client_Party.prototype.weapons = function() {
    var list = [];
    for (var id in this._weapons) {
        list.push($dataWeapons[id]);
    }
    return list;
};

Client_Party.prototype.armors = function() {
    var list = [];
    for (var id in this._armors) {
        list.push($dataArmors[id]);
    }
    return list;
};

Client_Party.prototype.equipItems = function() {
    return this.weapons().concat(this.armors());
};

Client_Party.prototype.allItems = function() {
    return this.items().concat(this.equipItems());
};

Client_Party.prototype.itemContainer = function(item) {
    if (!item) {
        return null;
    } else if (DataManager.isItem(item)) {
        return this._items;
    } else if (DataManager.isWeapon(item)) {
        return this._weapons;
    } else if (DataManager.isArmor(item)) {
        return this._armors;
    } else {
        return null;
    }
};

Client_Party.prototype.setupStartingMembers = function() {
    this._actors = [];
    $dataSystem.partyMembers.forEach(function(actorId) {
        if ($gameActors.actor(actorId)) {
            this._actors.push(actorId);
        }
    }, this);
};

Client_Party.prototype.name = function() {
    var numBattleMembers = this.battleMembers().length;
    if (numBattleMembers === 0) {
        return '';
    } else if (numBattleMembers === 1) {
        return this.leader().name();
    } else {
        return TextManager.partyName.format(this.leader().name());
    }
};

Client_Party.prototype.setupBattleTest = function() {
    this.setupBattleTestMembers();
    this.setupBattleTestItems();
};

Client_Party.prototype.setupBattleTestMembers = function() {
    $dataSystem.testBattlers.forEach(function(battler) {
        var actor = $gameActors.actor(battler.actorId);
        if (actor) {
            actor.changeLevel(battler.level, false);
            actor.initEquips(battler.equips);
            actor.recoverAll();
            this.addActor(battler.actorId);
        }
    }, this);
};

Client_Party.prototype.setupBattleTestItems = function() {
    $dataItems.forEach(function(item) {
        if (item && item.name.length > 0) {
            this.gainItem(item, this.maxItems(item));
        }
    }, this);
};

Client_Party.prototype.highestLevel = function() {
    return Math.max.apply(null, this.members().map(function(actor) {
        return actor.level;
    }));
};

Client_Party.prototype.addActor = function(actorId) {
    if (!this._actors.contains(actorId)) {
        this._actors.push(actorId);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
    }
};

Client_Party.prototype.removeActor = function(actorId) {
    if (this._actors.contains(actorId)) {
        this._actors.splice(this._actors.indexOf(actorId), 1);
        $gamePlayer.refresh();
        $gameMap.requestRefresh();
    }
};

Client_Party.prototype.gold = function() {
    return this._gold;
};

Client_Party.prototype.gainGold = function(amount) {
    this._gold = (this._gold + amount).clamp(0, this.maxGold());
};

Client_Party.prototype.loseGold = function(amount) {
    this.gainGold(-amount);
};

Client_Party.prototype.maxGold = function() {
    return 99999999;
};

Client_Party.prototype.steps = function() {
    return this._steps;
};

Client_Party.prototype.increaseSteps = function() {
    this._steps++;
};

Client_Party.prototype.numItems = function(item) {
    var container = this.itemContainer(item);
    return container ? container[item.id] || 0 : 0;
};

Client_Party.prototype.maxItems = function(item) {
    return 99;
};

Client_Party.prototype.hasMaxItems = function(item) {
    return this.numItems(item) >= this.maxItems(item);
};

Client_Party.prototype.hasItem = function(item, includeEquip) {
    if (includeEquip === undefined) {
        includeEquip = false;
    }
    if (this.numItems(item) > 0) {
        return true;
    } else if (includeEquip && this.isAnyMemberEquipped(item)) {
        return true;
    } else {
        return false;
    }
};

Client_Party.prototype.isAnyMemberEquipped = function(item) {
    return this.members().some(function(actor) {
        return actor.equips().contains(item);
    });
};

Client_Party.prototype.gainItem = function(item, amount, includeEquip) {
    var container = this.itemContainer(item);
    if (container) {
        var lastNumber = this.numItems(item);
        var newNumber = lastNumber + amount;
        container[item.id] = newNumber.clamp(0, this.maxItems(item));
        if (container[item.id] === 0) {
            delete container[item.id];
        }
        if (includeEquip && newNumber < 0) {
            this.discardMembersEquip(item, -newNumber);
        }
        $gameMap.requestRefresh();
    }
};

Client_Party.prototype.discardMembersEquip = function(item, amount) {
    var n = amount;
    this.members().forEach(function(actor) {
        while (n > 0 && actor.isEquipped(item)) {
            actor.discardEquip(item);
            n--;
        }
    });
};

Client_Party.prototype.loseItem = function(item, amount, includeEquip) {
    this.gainItem(item, -amount, includeEquip);
};

Client_Party.prototype.consumeItem = function(item) {
    if (DataManager.isItem(item) && item.consumable) {
        this.loseItem(item, 1);
    }
};

Client_Party.prototype.canUse = function(item) {
    return this.members().some(function(actor) {
        return actor.canUse(item);
    });
};

Client_Party.prototype.canInput = function() {
    return this.members().some(function(actor) {
        return actor.canInput();
    });
};

Client_Party.prototype.isAllDead = function() {
    if (Game_Unit.prototype.isAllDead.call(this)) {
        return this.inBattle() || !this.isEmpty();
    } else {
        return false;
    }
};

Client_Party.prototype.onPlayerWalk = function() {
    this.members().forEach(function(actor) {
        return actor.onPlayerWalk();
    });
};

Client_Party.prototype.menuActor = function() {
    var actor = $gameActors.actor(this._menuActorId);
    if (!this.members().contains(actor)) {
        actor = this.members()[0];
    }
    return actor;
};

Client_Party.prototype.setMenuActor = function(actor) {
    this._menuActorId = actor.actorId();
};

Client_Party.prototype.makeMenuActorNext = function() {
    var index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
        index = (index + 1) % this.members().length;
        this.setMenuActor(this.members()[index]);
    } else {
        this.setMenuActor(this.members()[0]);
    }
};

Client_Party.prototype.makeMenuActorPrevious = function() {
    var index = this.members().indexOf(this.menuActor());
    if (index >= 0) {
        index = (index + this.members().length - 1) % this.members().length;
        this.setMenuActor(this.members()[index]);
    } else {
        this.setMenuActor(this.members()[0]);
    }
};

Client_Party.prototype.targetActor = function() {
    var actor = $gameActors.actor(this._targetActorId);
    if (!this.members().contains(actor)) {
        actor = this.members()[0];
    }
    return actor;
};

Client_Party.prototype.setTargetActor = function(actor) {
    this._targetActorId = actor.actorId();
};

Client_Party.prototype.lastItem = function() {
    return this._lastItem.object();
};

Client_Party.prototype.setLastItem = function(item) {
    this._lastItem.setObject(item);
};

Client_Party.prototype.swapOrder = function(index1, index2) {
    var temp = this._actors[index1];
    this._actors[index1] = this._actors[index2];
    this._actors[index2] = temp;
    $gamePlayer.refresh();
};

Client_Party.prototype.charactersForSavefile = function() {
    return this.battleMembers().map(function(actor) {
        return [actor.characterName(), actor.characterIndex()];
    });
};

Client_Party.prototype.facesForSavefile = function() {
    return this.battleMembers().map(function(actor) {
        return [actor.faceName(), actor.faceIndex()];
    });
};

Client_Party.prototype.partyAbility = function(abilityId) {
    return this.battleMembers().some(function(actor) {
        return actor.partyAbility(abilityId);
    });
};

Client_Party.prototype.hasEncounterHalf = function() {
    return this.partyAbility(Client_Party.ABILITY_ENCOUNTER_HALF);
};

Client_Party.prototype.hasEncounterNone = function() {
    return this.partyAbility(Client_Party.ABILITY_ENCOUNTER_NONE);
};

Client_Party.prototype.hasCancelSurprise = function() {
    return this.partyAbility(Client_Party.ABILITY_CANCEL_SURPRISE);
};

Client_Party.prototype.hasRaisePreemptive = function() {
    return this.partyAbility(Client_Party.ABILITY_RAISE_PREEMPTIVE);
};

Client_Party.prototype.hasGoldDouble = function() {
    return this.partyAbility(Client_Party.ABILITY_GOLD_DOUBLE);
};

Client_Party.prototype.hasDropItemDouble = function() {
    return this.partyAbility(Client_Party.ABILITY_DROP_ITEM_DOUBLE);
};

Client_Party.prototype.ratePreemptive = function(troopAgi) {
    var rate = this.agility() >= troopAgi ? 0.05 : 0.03;
    if (this.hasRaisePreemptive()) {
        rate *= 4;
    }
    return rate;
};

Client_Party.prototype.rateSurprise = function(troopAgi) {
    var rate = this.agility() >= troopAgi ? 0.03 : 0.05;
    if (this.hasCancelSurprise()) {
        rate = 0;
    }
    return rate;
};

Client_Party.prototype.performVictory = function() {
    this.members().forEach(function(actor) {
        actor.performVictory();
    });
};

Client_Party.prototype.performEscape = function() {
    this.members().forEach(function(actor) {
        actor.performEscape();
    });
};

Client_Party.prototype.removeBattleStates = function() {
    this.members().forEach(function(actor) {
        actor.removeBattleStates();
    });
};

Client_Party.prototype.requestMotionRefresh = function() {
    this.members().forEach(function(actor) {
        actor.requestMotionRefresh();
    });
};

Client_Party.prototype.requestMotionRefresh = function() {
    this.members().forEach(function(actor) {
        actor.requestMotionRefresh();
    });
};

Client_Party.prototype.stringify = function() {
    return JSON.stringify(this)
};

Client_Party.prototype.parse = function(jsonData) {
    Object.assign(this,JSON.parse(jsonData));
};
