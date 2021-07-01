import WorldControl from "./world_control"

function InitModule(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, initializer: nkruntime.Initializer) {
    // Import WorldControl, which is the default match
    let wc:WorldControl = new WorldControl()

    logger.info('js modules initialized.')

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
let get_world_id:nkruntime.RpcFunction =
    function(ctx: nkruntime.Context, logger: nkruntime.Logger, nk: nkruntime.Nakama, payload: string): string {
        logger.info('called get_world_id')
        let matches = nk.matchList(1)
        let current_match = matches[0]

        if (current_match == null) {
            logger.info('current match is null')
            let match = nk.matchCreate("world_control", {"payload": payload})
            logger.info(match)
            return match
        } else {
            logger.info('current match id')
            logger.info(current_match.matchId)
            return current_match.matchId
        }
    }

!InitModule && InitModule.bind(null);