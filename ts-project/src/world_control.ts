import { State } from "./Classes/State"
import MatchState = nkruntime.MatchState;

class WorldControl {
    public moduleName:string
    public tickRate:number
    public label:string
    state:MatchState

    /* WorldControl constructor.
        For now, parameters are not used
     */

    constructor(moduleName?:string, tickRate?:number, label?:string, state?:State) {
        this.moduleName = typeof moduleName == 'undefined' ? "world_control" : moduleName;
        this.tickRate = typeof tickRate == 'undefined' ? 5 : tickRate;
        this.label = typeof label == 'undefined' ? "Game world" : label;
        this.state = typeof state == 'undefined' ? {
            emptyTicks: 0,
            presences: {},
            joinsInProgress: 0,
            playing: false,
            deadlineRemainingTicks: 0,
            nextGameRemainingTicks: 0,
        } : state;
    }

    matchInit:nkruntime.MatchInitFunction =
        function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, params: {[key: string]: string}) {
            return {state, tickRate, label: JSON.stringify(label)}
    }

    matchJoinAttempt: nkruntime.MatchJoinAttemptFunction =
        function (ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presence: nkruntime.Presence, metadata: {[key: string]: any}) {
            var s: State = state as State;
            if (presence.userId in s.presences) {
                if (s.presences[presence.userId] === undefined) {
                    // User rejoining after a disconnect.
                    s.joinsInProgress++;
                    return {
                        state: s,
                        acceptUser: false,
                        accept: false,
                    }
                } else {
                    // User attempting to join from 2 different devices at the same time.
                    return {
                        state: s,
                        acceptUser: false,
                        accept: false,
                        rejectMessage: 'already joined',
                    }
                }
            }
            return {
                state: s,
                acceptUser: true,
                accept: true,
            }
    }

    matchJoin: nkruntime.MatchJoinFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) {
        var s: State = state as State
        for (const presence of presences) {
            s.presences[presence.userId] = presence;
        }
        return {state: s}
    }

    matchLeave: nkruntime.MatchLeaveFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, presences: nkruntime.Presence[]) {
        var s = state as State;
        for (let presence of presences) {
            logger.info("Player: %s left match: %s.", presence.userId, ctx.matchId);
            delete s.presences[presence.userId];
        }

        return {state: s}
    }

    matchLoop: nkruntime.MatchLoopFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, messages: nkruntime.MatchMessage[]) {
        var s = state as State;
        return {state: s}
    }

    matchTerminate: nkruntime.MatchTerminateFunction = function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, dispatcher: nkruntime.MatchDispatcher, tick: number, state: nkruntime.MatchState, graceSeconds: number) {
        var s = state as State;
        return {state: s}
    }
}

export = WorldControl