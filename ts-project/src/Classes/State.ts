/*
    State interface
 */
interface State {
    // Ticks where no actions have occurred.
    emptyTicks: number
    // Currently connected users, or reserved spaces.
    presences: {[userId: string]: nkruntime.Presence}
    // Number of users currently in the process of connecting to the match.
    joinsInProgress: number
    // True if there's a game currently in progress.
    playing: boolean
    // Ticks until they must submit their move.
    deadlineRemainingTicks: number
    // Ticks until the next game starts, if applicable.
    nextGameRemainingTicks: number
}

export {State}