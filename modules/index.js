var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define("Classes/State", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("world_control", ["require", "exports"], function (require, exports) {
    "use strict";
    var WorldControl = /** @class */ (function () {
        /* WorldControl constructor.
            For now, parameters are not used
         */
        function WorldControl(moduleName, tickRate, label, state) {
            this.matchInit = function (ctx, logger, nk, params) {
                return { state: state, tickRate: tickRate, label: JSON.stringify(label) };
            };
            this.matchJoinAttempt = function (ctx, logger, nk, dispatcher, tick, state, presence, metadata) {
                var s = state;
                if (presence.userId in s.presences) {
                    if (s.presences[presence.userId] === undefined) {
                        // User rejoining after a disconnect.
                        s.joinsInProgress++;
                        return {
                            state: s,
                            acceptUser: false,
                            accept: false,
                        };
                    }
                    else {
                        // User attempting to join from 2 different devices at the same time.
                        return {
                            state: s,
                            acceptUser: false,
                            accept: false,
                            rejectMessage: 'already joined',
                        };
                    }
                }
                return {
                    state: s,
                    acceptUser: true,
                    accept: true,
                };
            };
            this.matchJoin = function (ctx, logger, nk, dispatcher, tick, state, presences) {
                var s = state;
                for (var _i = 0, presences_1 = presences; _i < presences_1.length; _i++) {
                    var presence = presences_1[_i];
                    s.presences[presence.userId] = presence;
                }
                return { state: s };
            };
            this.matchLeave = function (ctx, logger, nk, dispatcher, tick, state, presences) {
                var s = state;
                for (var _i = 0, presences_2 = presences; _i < presences_2.length; _i++) {
                    var presence = presences_2[_i];
                    logger.info("Player: %s left match: %s.", presence.userId, ctx.matchId);
                    delete s.presences[presence.userId];
                }
                return { state: s };
            };
            this.matchLoop = function (ctx, logger, nk, dispatcher, tick, state, messages) {
                var s = state;
                return { state: s };
            };
            this.matchTerminate = function (ctx, logger, nk, dispatcher, tick, state, graceSeconds) {
                var s = state;
                return { state: s };
            };
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
        return WorldControl;
    }());
    return WorldControl;
});
define("main", ["require", "exports", "world_control"], function (require, exports, world_control_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    world_control_1 = __importDefault(world_control_1);
    function InitModule(ctx, logger, nk, initializer) {
        // Import WorldControl, which is the default match
        var wc = new world_control_1.default();
        logger.info('js modules initialized.');
        // Register the match handler
        initializer.registerRpc('get_world_id', get_world_id);
        // Register match: World
        initializer.registerMatch(wc.moduleName, {
            matchInit: wc.matchInit,
            matchJoin: wc.matchJoin,
            matchJoinAttempt: wc.matchJoinAttempt,
            matchLeave: wc.matchLeave,
            matchLoop: wc.matchLoop,
            matchTerminate: wc.matchTerminate
        });
    }
    // Get or create a match
    var get_world_id = function (ctx, logger, nk, payload) {
        logger.info('called get_world_id');
        var matches = nk.matchList(1);
        var current_match = matches[0];
        if (current_match == null) {
            logger.info('current match is null');
            var match = nk.matchCreate("world_control", { "payload": payload });
            logger.info(match);
            return match;
        }
        else {
            logger.info('current match id');
            logger.info(current_match.matchId);
            return current_match.matchId;
        }
    };
    !InitModule && InitModule.bind(null);
});
