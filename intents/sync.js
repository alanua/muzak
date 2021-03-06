"use strict";
const Utils = require("../utils");
const Intent = require("./intent");

/**
 * Implementation of the SyncPlayers intent
 */

class Sync extends Intent {

    /**
     * Sync one player to another
     *
     * @param squeezeserver The handler to the SqueezeServer
     * @param players A list of players on the server
     * @param intent The target intent
     * @param session The current session
     * @param lastname The name of the last player used in previous intents
     * @param callback The callback to use to return the result
     */

    static sync(squeezeserver, players, intent, session, lastname, callback) {

        // Need to make sure that both players are turned on.

        console.log("In syncPlayers with intent %j", intent);

        var player1 = null;
        var player2 = null;
        try {

            // Try to find the target players. We need the squeezeserver player object for the first, but only the player info
            // object for the second.

            let playerName = ((typeof intent.slots.FirstPlayer.value !== "undefined") && (intent.slots.FirstPlayer.value !== null) ? intent.slots.FirstPlayer.value : session.attributes.player);
            player1 = Intent.findPlayerObject(squeezeserver, players, playerName, lastname);
            if (player1 === null) {

                // Couldn't find the player, return an error response

                console.log("Player not found: " + intent.slots.FirstPlayer.value);
                callback(session.attributes, Utils.buildSpeechResponse(intentName, "Player not found", null, session.new));
            }
            session.attributes = { player: player1.name.toLowerCase() };

            playerName = Intent.normalizePlayer(((typeof intent.slots.SecondPlayer.value !== "undefined") && (intent.slots.SecondPlayer.value !== null) ? intent.slots.SecondPlayer.value : session.attributes.player));
            for (let pl in players)
                if (players[pl].name.toLowerCase() === playerName)
                    player2 = players[pl];

            // If we found the target players, sync them

            if (player1 && player2) {

                console.log("Found players: player1 %j and player2 %j", player1, player2);
                player1.sync(player2.playerindex, function(reply) {
                    if (reply.ok) {
                        callback(session.attributes, Utils.buildSpeechResponse("Sync Players", "Synced " + player1.name + " to " + player2.name, null, session.new));
                    } else {
                        console.log("Failed to sync %j", reply);
                        callback(session.attributes, Utils.buildSpeechResponse("Sync Players", "Failed to sync players " + player1.name + " and " + player2.name, null, true));
                    }
                });

            } else {

                console.log("Player not found: ");
                callback(session.attributes, Utils.buildSpeechResponse("Sync Players", "Player not found", null, session.new));
            }

        } catch (ex) {
            console.log("Caught exception in syncPlayers %j for " + player1 + " and " + player2 + " " + ex);
            callback(session.attributes, Utils.buildSpeechResponse("Sync Players", "Caught Exception", null, true));
        }
    }
}

module.exports = Sync.sync;