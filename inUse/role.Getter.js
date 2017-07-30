/**
 * Created by Bob on 7/12/2017.
 */

let _ = require('lodash');
const profiler = require('screeps-profiler');

function role(creep) {
    if (creep.renewalCheck(6)) return creep.shibMove(creep.pos.findClosestByRange(FIND_MY_SPAWNS));
    //INITIAL CHECKS
    if (creep.borderCheck()) return null;
    if (creep.wrongRoom()) return null;
    let fillers = _.filter(Game.creeps, (c) => c.memory.role === 'filler' && c.memory.assignedRoom === creep.room.name);
    let mineralHauler = _.filter(Game.creeps, (c) => c.memory.role === 'mineralHauler' && c.memory.assignedRoom === creep.room.name);
    let mineralHarvester = _.filter(Game.creeps, (c) => c.memory.role === 'mineralHarvester' && c.memory.assignedRoom === creep.room.name);
    if (Game.getObjectById(creep.memory.storage) && Game.getObjectById(creep.memory.storage).store[RESOURCE_ENERGY] >= 25000 && fillers.length < 3) return creep.memory.role = 'filler';
    if (mineralHarvester.length > 0 && mineralHauler.length === 0) return creep.memory.role = 'mineralHauler';
    if (fillers.length === 0) {
        creep.memory.energyDestination = undefined;
        return creep.memory.role = 'filler';
    }
    if (creep.carry.energy === 0) {
        creep.memory.hauling = false;
    }
    if (creep.carry.energy > creep.carryCapacity / 2) {
        creep.memory.hauling = true;
    }
    if (creep.memory.hauling === false) {
        if (creep.memory.energyDestination) {
            creep.withdrawEnergy();
        } else if (!creep.getEnergy()) {
            creep.idleFor(10);
        }
    } else {
        if (creep.memory.storage) {
            if (!Game.getObjectById(creep.memory.storage)) creep.memory.role = 'basicHauler';
            if (creep.transfer(Game.getObjectById(creep.memory.storage), RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                creep.shibMove(Game.getObjectById(creep.memory.storage), {offRoad: true});
            }
        } else if (!creep.memory.storage) {
            let storage = _.pluck(_.filter(creep.room.memory.structureCache, 'type', 'storage'), 'id');
            if (storage.length > 0) {
                creep.memory.storage = storage[0];
            }
        }
    }
}
module.exports.role = profiler.registerFN(role, 'getterRole');
