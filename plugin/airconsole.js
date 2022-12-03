/**
 * AirConsole.
 * @copyright 2022 by N-Dream AG, Switzerland. All rights reserved.
 * @version 1.8.0
 *
 * IMPORTANT:
 * @see http://developers.airconsole.com/ for API documentation
 *
 * This file is grouped into the following chapters:
 * - Constants: Constants you should use
 * - Connectivity: Device Ids, connects and disconnects
 * - Messaging: Sending messages between devices
 * - Device States: Setting data for a device that is readable for all devices
 * - Profile data: User profile data, including nicknames and profile pictures
 * - Active players: Setting a couple of devices as active players for a game
 * - Controller Inputs: Special device inputs like device motion
 * - Ads: Showing ads and handling their events
 * - Premium: Handling premium users
 * - Navigation: Changing games and opening external links
 * - User Interface: Changing orientation
 * - Persistent Data: Storing data across sessions
 * - High Scores: Storing and retrieving high scores
 * - Environment Events: Events triggered by the real world
 *
 * If your prefer an event driven api with .on() .off() and .dispatch()
 * interface instead of sending messages,
 * @see http://github.com/AirConsole/airconsole-events/
 *
 */

/**
 * Your gateway object to AirConsole.
 * There are getter and setter functions for all properties.
 * Do not access properties of this object directly.
 * @constructor
 * @param {AirConsole~Config} opts - Constructor config, see bellow.
 */
function AirConsole(opts) {
	this.init_(opts);
}
/**
 * The configuration for the AirConsole constructor.
 * @typedef {object} AirConsole~Config
 * @property {string} orientation - AirConsole.ORIENTATION_PORTRAIT or
 *           AirConsole.ORIENTATION_LANDSCAPE.
 * @property {boolean|undefined} synchronize_time - If set to true, you can
 *           call getServerTime() to get the time on the game server.
 *           Default is false.
 * @property {boolean|undefiend} setup_document - Sets up the document so
 *           nothing is selectable, zoom is fixed to 1 and scrolling is
 *           disabled (iOS 8 clients drop out of fullscreen when scrolling).
 *           Default: true
 * @property {number|undefined} device_motion - If set, onDeviceMotion gets
 *           called every "device_motion" milliseconds with data from the
 *           accelerometer and the gyroscope. Only for controllers.
 * @property {boolean} translation - If an AirConsole translation file should
 *           be loaded.
 */


/** ------------------------------------------------------------------------ *
 * @chapter                         CONSTANTS                                *
 * ------------------------------------------------------------------------- */

/**
 * The device ID of the game screen.
 * @constant {number}
 */
AirConsole.SCREEN = 0;

/**
 * The portrait orientation.
 * @constant {string}
 */
AirConsole.ORIENTATION_PORTRAIT = "portrait";

/**
 * The landscape orientation.
 * @constant {string}
 */
AirConsole.ORIENTATION_LANDSCAPE = "landscape";


/** ------------------------------------------------------------------------ *
 * @chapter                     CONNECTIVITY                                 *
 * @see         http://developers.airconsole.com/#!/guides/pong              *
 * ------------------------------------------------------------------------- */

/**
 * Gets called when the game console is ready.
 * This event also fires onConnect for all devices that already are
 * connected and have loaded your game.
 * This event also fires onCustomDeviceStateChange for all devices that are
 * connected, have loaded your game and have set a custom Device State.
 * @abstract
 * @param {string} code - The AirConsole join code.
 */
AirConsole.prototype.onReady = function(code) {};

/**
 * Gets called when a device has connected and loaded the game.
 * @abstract
 * @param {number} device_id - the device ID that loaded the game.
 */
AirConsole.prototype.onConnect = function(device_id) {};

/**
 * Gets called when a device has left the game.
 * @abstract
 * @param {number} device_id - the device ID that left the game.
 */
AirConsole.prototype.onDisconnect = function(device_id) {};

/**
 * Returns the device_id of this device.
 * Every device in an AirConsole session has a device_id.
 * The screen always has device_id 0. You can use the AirConsole.SCREEN
 * constant instead of 0.
 * All controllers also get a device_id. You can NOT assume that the device_ids
 * of controllers are consecutive or that they start at 1.
 *
 * DO NOT HARDCODE CONTROLLER DEVICE IDS!
 *
 * If you want to have a logic with "players numbers" (Player 0, Player 1,
 * Player 2, Player 3) use the setActivePlayers helper function! You can
 * hardcode player numbers, but not device_ids.
 *
 * Within an AirConsole session, devices keep the same device_id when they
 * disconnect and reconnect. Different controllers will never get the same
 * device_id in a session. Every device_id remains reserved for the device that
 * originally got it.
 *
 * @see http:// developers.airconsole.com/#/guides/device_ids_and_states
 *
 * @return {number}
 */
AirConsole.prototype.getDeviceId = function() {
	return this.device_id;
};

/**
 * Returns the device ID of the master controller.
 * Premium devices are prioritzed.
 * @return {number|undefined}
 */
AirConsole.prototype.getMasterControllerDeviceId = function() {
	var premium_device_ids = this.getPremiumDeviceIds();
	if (premium_device_ids.length) {
		return premium_device_ids[0];
	}
	return this.getControllerDeviceIds()[0];
};

/**
 * Returns all controller device ids that have loaded your game.
 * @return {Array}
 */
AirConsole.prototype.getControllerDeviceIds = function() {
	var result = [];
	var game_url = this.getGameUrl_(this.getLocationUrl_());
	for (var i = AirConsole.SCREEN + 1; i < this.devices.length; ++i) {
		if (this.devices[i] &&
			this.getGameUrl_(this.devices[i].location) == game_url) {
			result.push(i);
		}
	}
	return result;
};

/**
 * Returns the current time of the game server.
 * This allows you to have a synchronized clock: You can send the server
 * time in a message to know exactly at what point something happened on a
 * device. This function can only be called if the AirConsole was instantiated
 * with the "synchronize_time" opts set to true and after onReady was called.
 * @return {number} Timestamp in milliseconds.
 */
AirConsole.prototype.getServerTime = function() {
	if (this.server_time_offset === false) {
		throw "AirConsole constructor was not called with " +
		"{synchronize_time: true}";
	}
	return new Date().getTime() + this.server_time_offset;
};

/** ------------------------------------------------------------------------ *
 * @chapter                     MESSAGING                                    *
 * @see         http://developers.airconsole.com/#!/guides/pong              *
 * ------------------------------------------------------------------------- */

/**
 * Sends a message to another device.
 * @param device_id {number|undefined} - The device ID to send the message to.
 *                                       If "device_id" is undefined, the
 *                                       message is sent to all devices (except
 *                                       this one).
 * @param data
 */
AirConsole.prototype.message = function(device_id, data) {
	if (this.device_id !== undefined) {
		AirConsole.postMessage_({ action: "message", to: device_id, data: data });
	}
};

/**
 * Sends a message to all connected devices.
 * @param data
 */
AirConsole.prototype.broadcast = function(data) {
	this.message(undefined, data);
};

/**
 * Gets called when a message is received from another device
 * that called message() or broadcast().
 * If you dont want to parse messages yourself and prefer an event driven
 * approach, @see http://github.com/AirConsole/airconsole-events/
 * @abstract
 * @param {number} device_id - The device ID that sent the message.
 * @param {serializable} data - The data that was sent.
 */
AirConsole.prototype.onMessage = function(device_id, data) {};


/** ------------------------------------------------------------------------ *
 * @chapter                    DEVICE STATES                                 *
 * @see   http://developers.airconsole.com/#!/guides/device_ids_and_states   *
 * ------------------------------------------------------------------------- */

/**
 * Gets the custom DeviceState of a device.
 * @param {number|undefined} device_id - The device ID of which you want the
 *                                       custom state. Default is this device.
 * @return {Object|undefined} The custom data previously set by the device.
 */
AirConsole.prototype.getCustomDeviceState = function(device_id) {
	if (device_id === undefined) {
		device_id = this.device_id;
	}
	var device_data = this.devices[device_id];
	if (device_data && this.getGameUrl_(this.getLocationUrl_()) ==
		this.getGameUrl_(device_data.location)) {
		return device_data["custom"];
	}
};

/**
 * Sets the custom DeviceState of this device.
 * @param {Object} data - The custom data to set.
 */
AirConsole.prototype.setCustomDeviceState = function(data) {
	if (this.device_id !== undefined) {
		this.devices[this.device_id]["custom"] = data;
		this.set_("custom", data);
	}
};

/**
 * Sets a property in the custom DeviceState of this device.
 * @param {String} key - The property name.
 * @param {mixed} value - The property value.
 */
AirConsole.prototype.setCustomDeviceStateProperty = function(key, value) {
	if (this.device_id !== undefined) {
		var state = this.getCustomDeviceState();
		if (state === undefined) {
			state = {};
		} else if (typeof state !== "object") {
			throw "Custom DeviceState needs to be of type object";
		}
		state[key] = value;
		this.setCustomDeviceState(state);
	}
};

/**
 * Gets called when a device updates it's custom DeviceState
 * by calling setCustomDeviceState or setCustomDeviceStateProperty.
 * Make sure you understand the power of device states:
 * @see http://developers.airconsole.com/#/guides/device_ids_and_states
 * @abstract
 * @param {number} device_id - the device ID that changed its custom
 *                             DeviceState.
 * @param {Object} custom_data - The custom DeviceState data value
 */
AirConsole.prototype.onCustomDeviceStateChange = function(device_id,
														  custom_data) {};
/**
 * Gets called when a device joins/leaves a game session or updates its
 * DeviceState (custom DeviceState, profile pic, nickname, internal state).
 * This is function is also called every time onConnect, onDisconnect or
 * onCustomDeviceStateChange, onDeviceProfileChange is called.
 * It's like their root function.
 * @abstract
 * @param {number} device_id - the device_id that changed its DeviceState.
 * @param user_data {AirConsole~DeviceState} - the data of that device.
 *        If undefined, the device has left.
 */
AirConsole.prototype.onDeviceStateChange = function(device_id, device_data) {};


/** ------------------------------------------------------------------------ *
 * @chapter                       PROFILE                                    *
 * ------------------------------------------------------------------------- */

/**
 * Returns the globally unique id of a device.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       uid. Default is this device.
 * @return {string|undefined}
 */
AirConsole.prototype.getUID = function(device_id) {
	if (device_id === undefined) {
		device_id = this.device_id;
	}
	var device_data = this.devices[device_id];
	if (device_data) {
		return device_data.uid;
	}
};

/**
 * Returns the nickname of a user.
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       nickname. Default is this device.
 *                                       Screens don't have nicknames.
 * @return {string|undefined}
 */
AirConsole.prototype.getNickname = function(device_id) {
	if (device_id === undefined) {
		device_id = this.device_id;
	}
	var device_data = this.devices[device_id];
	if (device_data) {
		return device_data.nickname || ("Guest " + device_id);
	}
};

/**
 * Returns the url to a profile picture of the user.
 * @param {number|string|undefined} device_id_or_uid - The device id or uid for
 *                                                     which you want the
 *                                                     profile picture.
 *                                                     Default is the current
 *                                                     user.
 *                                                     Screens don't have
 *                                                     profile pictures.
 * @param {number|undefined} size - The size of in pixels of the picture.
 *                                  Default is 64.
 * @return {string|undefined}
 */
AirConsole.prototype.getProfilePicture = function(device_id_or_uid, size) {
	if (device_id_or_uid === undefined) {
		device_id_or_uid = this.device_id;
	} else if (typeof device_id_or_uid == "string") {
		return "https://www.airconsole.com/api/profile-picture?uid=" +
			device_id_or_uid + "&size=" + (size||64);
	}
	var device_data = this.devices[device_id_or_uid];
	if (device_data) {
		var url = "https://www.airconsole.com/api/profile-picture?uid=" +
			device_data.uid + "&size=" + (size||64);
		if (device_data.picture) {
			url += "&v=" + device_data.picture;
		}
		return url;
	}
};

/**
 * Gets called when a device updates it's profile pic, nickname or email.
 * @abstract
 * @param {number} device_id - The device_id that changed its profile.
 */
AirConsole.prototype.onDeviceProfileChange = function(device_id) {};

/**
 * Returns true if a user is logged in.
 * @param {number|undefined} device_id - The device_id of the user.
 *                                       Default is this device.
 * @returns {boolean}
 */
AirConsole.prototype.isUserLoggedIn = function(device_id) {
	if (device_id == undefined) {
		device_id = this.device_id;
	}
	var data = this.devices[device_id];
	if (data) {
		return data.auth;
	}
};

/**
 * Requests the email address of this device and calls onEmailAddress iff the
 * request was granted. For privacy reasons, you need to whitelist your
 * game in order to receive the email address of the user. To whitelist your
 * game, contact developers@airconsole.com. For development purposes, localhost
 * is always allowed.
 */
AirConsole.prototype.requestEmailAddress = function() {
	this.set_("email", true);
};

/**
 * Gets called if the request of requestEmailAddress() was granted.
 * For privacy reasons, you need to whitelist your game in order to receive
 * the email address of the user. To whitelist your game, contact
 * developers@airconsole.com. For development purposes, localhost is always
 * allowed.
 * @abstract
 * @param {string|undefined} email_address - The email address of the user if
 *        it was set.
 */
AirConsole.prototype.onEmailAddress = function(email_address) {};

/**
 * Lets the user change his nickname, profile picture and email address.
 * If you need a real nickname of the user, use this function.
 * onDeviceProfileChange will be called if the user logs in.
 */
AirConsole.prototype.editProfile = function() {
	this.set_("login", true);
};


/** ------------------------------------------------------------------------ *
 * @chapter                   ACTIVE PLAYERS                                 *
 * @see   http://developers.airconsole.com/#!/guides/device_ids_and_states   *
 * ------------------------------------------------------------------------- */

/**
 * Takes all currently connected controllers and assigns them a player number.
 * Can only be called by the screen. You don't have to use this helper
 * function, but this mechanism is very convenient if you want to know which
 * device is the first player, the second player, the third player ...
 * The assigned player numbers always start with 0 and are consecutive.
 * You can hardcode player numbers, but not device_ids.
 * Once the screen has called setActivePlayers you can get the device_id of
 * the first player by calling convertPlayerNumberToDeviceId(0), the device_id
 * of the second player by calling convertPlayerNumberToDeviceId(1), ...
 * You can also convert device_ids to player numbers by calling
 * convertDeviceIdToPlayerNumber(device_id). You can get all device_ids that
 * are active players by calling getActivePlayerDeviceIds().
 * The screen can call this function every time a game round starts.
 * @param {number} max_players - The maximum number of controllers that should
 *                               get a player number assigned.
 */
AirConsole.prototype.setActivePlayers = function(max_players) {
	if (this.getDeviceId() != AirConsole.SCREEN) {
		throw "Only the AirConsole.SCREEN can set the active players!";
	}
	this.device_id_to_player_cache = undefined;
	var players = this.getControllerDeviceIds();
	if (max_players !== undefined) {
		players = players.slice(0, Math.min(players.length, max_players));
	}
	this.devices[AirConsole.SCREEN]["players"] = players;
	this.set_("players", players);
};

/**
 * Gets called when the screen sets the active players by calling
 * setActivePlayers().
 * @abstract
 * @param {number|undefined} player_number - The player number of this device.
 *                                           Can be undefined if this device
 *                                           is not part of the active players.
 */
AirConsole.prototype.onActivePlayersChange = function(player_number) {};

/**
 * Returns an array of device_ids of the active players previously set by the
 * screen by calling setActivePlayers. The first device_id in the array is the
 * first player, the second device_id in the array is the second player, ...
 * @returns {Array}
 */
AirConsole.prototype.getActivePlayerDeviceIds = function() {
	return this.devices[AirConsole.SCREEN]["players"] || [];
};

/**
 * Returns the device_id of a player, if the player is part of the active
 * players previously set by the screen by calling setActivePlayers. If fewer
 * players are in the game than the passed in player_number or the active
 * players have not been set by the screen, this function returns undefined.
 * @param player_number
 * @returns {number|undefined}
 */
AirConsole.prototype.convertPlayerNumberToDeviceId = function(player_number) {
	return this.getActivePlayerDeviceIds()[player_number];
};

/**
 * Returns the player number for a device_id, if the device_id is part of the
 * active players previously set by the screen by calling setActivePlayers.
 * Player numbers are zero based and are consecutive. If the device_id is not
 * part of the active players, this function returns undefined.
 * @param device_id
 * @returns {number|undefined}
 */
AirConsole.prototype.convertDeviceIdToPlayerNumber = function(device_id) {
	if (!this.devices[AirConsole.SCREEN] ||
		!this.devices[AirConsole.SCREEN]["players"]) {
		return;
	}
	if (!this.device_id_to_player_cache) {
		this.device_id_to_player_cache = {};
		var players = this.devices[AirConsole.SCREEN]["players"];
		for (var i = 0; i < players.length; ++i) {
			this.device_id_to_player_cache[players[i]] = i;
		}
	}
	return this.device_id_to_player_cache[device_id];
};


/** ------------------------------------------------------------------------ *
 * @chapter                 CONTROLLER INPUTS                                *
 * ------------------------------------------------------------------------- */

/**
 * Gets called every X milliseconds with device motion data iff the
 * AirConsole was instantiated with the "device_motion" opts set to the
 * interval in milliseconds. Only works for controllers.
 * Note: Some browsers do not allow games to access accelerometer and gyroscope
 *       in an iframe (your game). So use this method if you need gyroscope
 *       or accelerometer data.
 * @abstract
 * @param {object} data - data.x, data.y, data.z for accelerometer
 *                        data.alpha, data.beta, data.gamma for gyroscope
 */
AirConsole.prototype.onDeviceMotion = function(data) {};

/**
 * Vibrates the device for a specific amount of time. Only works for controllers.
 * Note: iOS ignores the specified time and vibrates for a pre-set amount of time.
 * @param {Number} time - Milliseconds to vibrate the device
 */
AirConsole.prototype.vibrate = function(time) {
	this.set_("vibrate", time);
};

/** ------------------------------------------------------------------------ *
 * @chapter                          ADS                                     *
 * ------------------------------------------------------------------------- */

/**
 * Requests that AirConsole shows a multiscreen advertisment.
 * Can only be called by the AirConsole.SCREEN.
 * onAdShow is called on all connected devices if an advertisement
 * is shown (in this event please mute all sounds).
 * onAdComplete is called on all connected devices when the
 * advertisement is complete or no advertisement was shown.
 */
AirConsole.prototype.showAd = function() {
	if (this.device_id != AirConsole.SCREEN) {
		throw "Only the AirConsole.SCREEN can call showAd!";
	}
	this.set_("ad", true);
};

/**
 * Gets called if a fullscreen advertisement is shown on this screen.
 * In case this event gets called, please mute all sounds.
 * @abstract
 */
AirConsole.prototype.onAdShow = function() {};

/**
 * Gets called when an advertisement is finished or no advertisement was shown.
 * @abstract
 * @param {boolean} ad_was_shown - True iff an ad was shown and onAdShow was
 *                                 called.
 */
AirConsole.prototype.onAdComplete = function(ad_was_shown) {};


/** ------------------------------------------------------------------------ *
 * @chapter                       PREMIUM                                    *
 * ------------------------------------------------------------------------- */

/**
 * Returns true if the device is premium
 * @param {number} device_id - The device_id that should be checked.
 *                             Only controllers can be premium.
 *                             Default is this device.
 * @return {boolean|undefined} Returns true or false for a valid device_id and
 *                             undefined if the device_id is not valid.
 *
 */
AirConsole.prototype.isPremium = function(device_id) {
	if (device_id === undefined) {
		device_id = this.device_id;
	}
	var device_data = this.devices[device_id];
	if (device_data && device_id != AirConsole.SCREEN) {
		return !!device_data.premium;
	}
};

/**
 * Returns all device ids that are premium.
 * @return {Array<number>}
 */
AirConsole.prototype.getPremiumDeviceIds = function() {
	var premium = [];
	for (var i = 1; i < this.devices.length; ++i) {
		if (this.isPremium(i)) {
			premium.push(i);
		}
	}
	return premium;
};

/**
 * Offers the user to become a premium member.
 * Can only be called from controllers.
 * If you call getPremium in development mode, the device becomes premium
 * immediately.
 */
AirConsole.prototype.getPremium = function() {
	this.set_("premium", true);
};

/**
 * Gets called when a device becomes premium or when a premium device connects.
 * @abstract
 * @param {number} device_id - The device id of the premium device.
 */
AirConsole.prototype.onPremium = function(device_id) {};


/** ------------------------------------------------------------------------ *
 * @chapter                       NAVIGATION                                 *
 * ------------------------------------------------------------------------- */

/**
 * Request that all devices return to the AirConsole store.
 */
AirConsole.prototype.navigateHome = function() {
	this.set_("home", true);
};

/**
 * Request that all devices load a game by url or game id.
 * @param {string} url - The base url of the game to navigate to
 *                       (excluding screen.html or controller.html).
 *                       Instead of a url you may also pass a game id.
 *                       You can also navigate relatively to your current
 *                       game directory: To navigate to a subdirectory,
 *                       pass "./DIRECTORY_NAME". To navigate to a parent
 *                       directory pass "..".
 * @param {object} parameters - You can pass parameters to the game that gets
 *                              loaded. Any jsonizable object is fine.
 *                              The parameters will be appended to the url
 *                              using a url hash.
 */
AirConsole.prototype.navigateTo = function(url, parameters) {
	if (url.indexOf(".") == 0) {
		var current_location = this.getLocationUrl_();
		var full_path = current_location.split("#")[0].split("/");
		full_path.pop();
		var relative = url.split("/");
		for (var i = 0; i < relative.length; ++i) {
			if (relative[i] == "..") {
				full_path.pop();
			} else if (relative[i] != "." && relative[i] != "") {
				full_path.push(relative[i]);
			}
		}
		url = full_path.join("/") + "/";
	}
	if (parameters) {
		url += "#" + encodeURIComponent(JSON.stringify(parameters));
	}
	this.set_("home", url);
};

/**
 * Get the parameters in the loaded game that were passed to navigateTo.
 * @returns {*}
 */
AirConsole.prototype.getNavigateParameters = function() {
	if (this.navigate_parameters_cache_) {
		return this.navigate_parameters_cache_;
	}
	if (document.location.hash.length > 1) {
		var result = JSON.parse(decodeURIComponent(
			document.location.hash.substr(1)));
		this.navigate_parameters_cache_ = result;
		return result;
	}
};

/**
 * Opens url in external (default-system) browser. Call this method instead of
 * calling window.open. In-App it will open the system's default browser.
 * Because of Safari iOS you can only use it with the onclick handler:
 * <div onclick="airconsole.openExternalUrl('my-url.com');">Open browser</div>
 * OR in JS with assigning element.onclick.
 * @param {string} url - The url to open
 */
AirConsole.prototype.openExternalUrl = function(url) {
	var data = this.devices[this.device_id];
	if (data.client && data.client.pass_external_url === true) {
		this.set_("pass_external_url", url);
	} else {
		window.open(url);
	}
};


/** ------------------------------------------------------------------------ *
 * @chapter                     USER INTERFACE                               *
 * ------------------------------------------------------------------------- */

/**
 * Sets the device orientation.
 * @param {string} orientation - AirConsole.ORIENTATION_PORTRAIT or
 *                               AirConsole.ORIENTATION_LANDSCAPE.
 */
AirConsole.prototype.setOrientation = function(orientation) {
	this.set_("orientation", orientation);
};


/** ------------------------------------------------------------------------ *
 * @chapter                     PERSISTENT DATA                              *
 * ------------------------------------------------------------------------- */

/**
 * Requests persistent data from the servers.
 * @param {Array<String>|undefined} uids - The uids for which you would like
 *                                         to request the persistent data.
 *                                         Default is the uid of this device.
 */
AirConsole.prototype.requestPersistentData = function(uids) {
	if (!uids) {
		uids = [this.getUID()];
	}
	this.set_("persistentrequest", {"uids": uids})
};

/**
 * Gets called when persistent data was loaded from requestPersistentData().
 * @abstract
 * @param {Object} data - An object mapping uids to all key value pairs.
 */
AirConsole.prototype.onPersistentDataLoaded = function(data) {};

/**
 * Stores a key-value pair persistently on the AirConsole servers.
 * Storage is per game. Total storage can not exceed 1 MB per game and uid.
 * Storage is public, not secure and anyone can request and tamper with it.
 * Do not store sensitive data.
 * @param {String} key - The key of the data entry.
 * @param {mixed} value - The value of the data entry.
 * @param {String|undefiend} uid - The uid for which the data should be stored.
 *                                 Default is the uid of this device.
 */
AirConsole.prototype.storePersistentData = function(key, value, uid) {
	if (!uid) {
		uid = this.getUID();
	}
	this.set_("persistentstore", {"key": key, "value": value, "uid": uid});
};

/**
 * Gets called when persistent data was stored from storePersistentData().
 * @abstract
 * @param {String} uid - The uid for which the data was stored.
 */
AirConsole.prototype.onPersistentDataStored = function(uid) {};


/** ------------------------------------------------------------------------ *
 * @chapter                      HIGH SCORES                                 *
 * @see       http://developers.airconsole.com/#!/guides/highscore           *
 * ------------------------------------------------------------------------- */

/**
 * Stores a high score of the current user on the AirConsole servers.
 * High Scores are public, not secure and anyone can request and tamper with
 * them. Do not store sensitive data. Only updates the high score if it was a
 * higher or same score. Calls onHighScoreStored when the request is done.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {String} level_name - The name of the level the user was playing.
 *                              This should be a human readable string because
 *                              it appears in the high score sharing image.
 *                              You can also just pass an empty string.
 * @param {String} level_version - The version of the level the user was
 *                                 playing. This is for your internal use.
 * @param {number} score - The score the user has achieved
 * @param {String|Array<String>|undefined} uid - The UIDs of the users that
 *                                               achieved the high score.
 *                                               Can be a single uid or an
 *                                               array of uids. Default is the
 *                                               uid of this device.
 * @param {mixed|undefined} data - Custom high score data (e.g. can be used to
 *                                 implement Ghost modes or include data to
 *                                 verify that it is not a fake high score).
 * @param {String|undefined} score_string - A short human readable
 *                                          representation of the score.
 *                                          (e.g. "4 points in 3s").
 *                                          Defaults to "X points" where x is
 *                                          the score converted to an integer.
 */
AirConsole.prototype.storeHighScore = function(level_name, level_version,
											   score, uid, data,
											   score_string) {
	if (score == NaN || typeof score != "number") {
		throw "Score needs to be a number and not NaN!"
	}
	if (!uid) {
		uid = this.getUID();
	}
	if (uid.constructor == Array) {
		uid = uid.join("|");
	}
	this.set_("highscore",
		{
			"uid": uid,
			"level_name": level_name,
			"level_version": level_version,
			"score": score,
			"data": data,
			"score_string": score_string
		});
};

/**
 * Gets called when a high score was successfully stored.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {AirConsole~HighScore|null} high_score - The stored high score if
 *                                                 it is a new best for the
 *                                                 user or else null.
 *                                                 Ranks include "world",
 *                                                 "country", "region", "city"
 *                                                 if a high score is passed.
 */
AirConsole.prototype.onHighScoreStored = function(high_score) {};

/**
 * Requests high score data of players (including global high scores and
 * friends). Will call onHighScores when data was received.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {String} level_name - The name of the level
 * @param {String} level_version - The version of the level
 * @param {Array<String>|undefined} uids - An array of UIDs of the users that
 *                                         should be included in the result.
 *                                         Default is all connected controllers
 * @param {Array<String>|undefined} ranks - An array of high score rank types.
 *                                          High score rank types can include
 *                                          data from across the world, only a
 *                                          specific area or a users friends.
 *                                          Valid array entries are "world",
 *                                          "country",  "region", "city",
 *                                          "friends".
 *                                          Default is ["world"].
 * @param {number|undefined} total - Amount of high scores to return per rank
 *                                   type. Default is 8.
 * @param {number|undefined} top - Amount of top high scores to return per rank
 *                                 type. top is part of total. Default is 5.
 */
AirConsole.prototype.requestHighScores = function(level_name, level_version,
												  uids, ranks, total, top) {
	if (!ranks) {
		ranks = ["world"];
	}
	if (!uids) {
		uids = [];
		var device_ids = this.getControllerDeviceIds();
		for (var i = 0; i < device_ids.length; ++i) {
			uids.push(this.getUID(device_ids[i]));
		}
	}
	if (total == undefined) {
		total = 8;
	}
	if (top == undefined) {
		top = 5;
	}
	this.set_("highscores",
		{
			"level_name": level_name,
			"level_version": level_version,
			"uids": uids,
			"ranks": ranks,
			"total": total,
			"top": top
		});
};

/**
 * Gets called when high scores are returned after calling requestHighScores.
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @param {Array<AirConsole~HighScore>} high_scores - The high scores.
 */
AirConsole.prototype.onHighScores = function(high_scores) {};

/**
 * DeviceState contains information about a device in this session.
 * Use the helper methods getUID, getNickname, getProfilePicture and
 * getCustomDeviceState to access this data.
 * @typedef {object} AirConsole~DeviceState
 * @property {string} uid - The globally unique ID of the user.
 * @property {string|undefined} custom - Custom device data that this API can
 *                                       set.
 * @property {string|undefined} nickname - The nickname of the user.
 * @property {boolean|undefined} slow_connection - If the user has a high
 *                                                 server latency.
 */

/**
 * HighScore contains information about a users high score
 * We highly recommend to read the High Score guide (developers.airconsole.com)
 * @typedef {object} AirConsole~HighScore
 * @property {String} level_name - The name of the level the user was playing
 * @property {String} level_version - The version of the level the user was
 *                                    playing
 * @property {number} score - The score the user has achieved
 * @property {String} score_string - A human readable version of score.
 * @property {Object} ranks - A dictionary of rank type to actual rank.
 * @property {mixed} data - Custom High Score data. Can be used to implement
 *                          Ghost modes or to verify that it is not a fake
 *                          high score.
 * @property {String} uids - The unique ID of the users that achieved the
 *                           high score.
 * @property {number} timestamp - The timestamp of the high score
 * @property {String} nicknames - The nicknames of the users
 * @property {String} relationship - How the user relates to the current user
 *                                 - "requested" (a user which was requested)
 *                                 - "airconsole" (played AirConsole together)
 *                                 - "facebook" (a facebook friend)
 *                                 - "other" (about same skill level)
 * @property {String} location_country_code - The iso3166 country code
 * @property {String} location_country_name - The name of the country
 * @property {String} location_region_code - The iso3166 region code
 * @property {String} location_region_name - The name of the region
 * @property {String} location_city_name - The name of the city
 * @property {String} share_url - The URL that should be used to share this
 *                                high score.
 * @property {String} share_image - The URL to an image that displays this
 *                                  high score.
 */

/** ------------------------------------------------------------------------ *
 * @chapter                     TRANSLATIONS                                 *
 * @see       http://developers.airconsole.com/#!/guides/translations        *
 * ------------------------------------------------------------------------- */

/**
 * Gets a translation for the users current language
 * See http://developers.airconsole.com/#!/guides/translations
 * @param {String} id - The id of the translation string.
 * @param {Object|undefined} values - Values that should be used for
 *                                    replacement in the translated string.
 *                                    E.g. if a translated string is
 *                                    "Hi %name%" and values is {"name": "Tom"}
 *                                    then this will be replaced to "Hi Tom".
 */
AirConsole.prototype.getTranslation = function(id, values) {
	if (this.translations) {
		if (this.translations[id]) {
			var result = this.translations[id];
			if (values && result) {
				var parts = result.split("%");
				for (var i = 1; i < parts.length; i += 2) {
					if (parts[i].length) {
						parts[i] = values[parts[i]] || "";
					} else {
						parts[i] = "%";
					}
				}
				result = parts.join("");
			}
			return result;
		}
	}
};

/**
 * Returns the current IETF language tag of a device e.g. "en" or "en-US"
 * @param {number|undefined} device_id - The device id for which you want the
 *                                       language. Default is this device.
 * @return {String} IETF language
 */
AirConsole.prototype.getLanguage = function(device_id) {
	if (device_id === undefined) {
		device_id = this.device_id;
	}
	var device_data = this.devices[device_id];
	if (device_data) {
		return device_data.language;
	}
};

/** ------------------------------------------------------------------------ *
 * @chapter              ENVIRONMENT EVENTS                                  *
 * ------------------------------------------------------------------------- */

/**
 * Gets called on the Screen when the game should be paused.
 * @abstract
 */
AirConsole.prototype.onPause = function() {};

/**
 * Gets called on the Screen when the game should be resumed.
 * @abstract
 */
AirConsole.prototype.onResume = function() {};

/**
 * Gets called when the game should mute / unmute any sound.
 * @param {Boolean} mute - If true mute all sounds, if false resume all sounds
 * @abstract
 */
AirConsole.prototype.onMute = function(mute) {};

/** ------------------------------------------------------------------------ *
 *                   ONLY PRIVATE FUNCTIONS BELLOW                           *
 * ------------------------------------------------------------------------- */

/**
 * Initializes the AirConsole.
 * @param {AirConsole~Config} opts - The Config.
 * @private
 */
AirConsole.prototype.init_ = function(opts) {
	opts = opts || {};
	var me = this;
	me.version = "1.8.0";
	me.devices = [];
	me.server_time_offset = opts.synchronize_time ? 0 : false;
	window.addEventListener("message", function(event) {
		me.onPostMessage_(event);
	}, false);
	me.set_("orientation", opts.orientation);
	if (opts.setup_document !== false) {
		me.setupDocument_();
	}
	AirConsole.postMessage_({
		action: "ready",
		version: me.version,
		device_motion: opts.device_motion,
		synchronize_time: opts.synchronize_time,
		location: me.getLocationUrl_(),
		translation: opts.translation
	});
};

/**
 * Handling onMessage events
 * @private
 * @param {Event} event - Event object
 */
AirConsole.prototype.onPostMessage_ = function(event) {
	var me = this;
	var data = event.data;
	var game_url = me.getGameUrl_(me.getLocationUrl_());
	if (data.action == "device_motion") {
		me.onDeviceMotion(data.data);
	} else if (data.action == "message") {
		if (me.device_id !== undefined) {
			if (me.devices[data.from] &&
				game_url == me.getGameUrl_(me.devices[data.from].location)) {
				me.onMessage(data.from, data.data);
			}
		}
	} else if (data.action == "update") {
		if (me.device_id !== undefined) {
			var game_url_before = null;
			var game_url_after = null;
			var before = me.devices[data.device_id];
			if (before) {
				game_url_before = me.getGameUrl_(before.location);
			}
			if (data.device_data) {
				game_url_after = me.getGameUrl_(data.device_data.location);
			}
			me.devices[data.device_id] = data.device_data;
			me.onDeviceStateChange(data.device_id, data.device_data);
			var is_connect = (game_url_before != game_url &&
				game_url_after == game_url);
			if (is_connect) {
				me.onConnect(data.device_id);
			} else if (game_url_before == game_url &&
				game_url_after != game_url) {
				me.onDisconnect(data.device_id);
			}
			if (data.device_data) {
				if ((data.device_data._is_custom_update &&
						game_url_after == game_url) ||
					(is_connect && data.device_data.custom)) {
					me.onCustomDeviceStateChange(data.device_id,
						data.device_data.custom);
				}
				if ((data.device_data._is_players_update &&
						game_url_after == game_url) ||
					(data.device_id == AirConsole.SCREEN &&
						data.device_data.players && is_connect)) {
					me.device_id_to_player_cache = null;
					me.onActivePlayersChange(me.convertDeviceIdToPlayerNumber(
						me.getDeviceId()));
				}
				if (data.device_data.premium &&
					(data.device_data._is_premium_update || is_connect)) {
					me.onPremium(data.device_id);
				}
				if (data.device_data._is_profile_update) {
					me.onDeviceProfileChange(data.device_id);
				}
			}
		}
	} else if (data.action == "ready") {
		me.device_id = data.device_id;
		me.devices = data.devices;
		if (me.server_time_offset !== false) {
			me.server_time_offset = data.server_time_offset || 0;
		}
		if (data.translations) {
			me.translations = data.translations;
			var elements = document.querySelectorAll("[data-translation]");
			for (var i = 0; i < elements.length; ++i) {
				elements[i].innerHTML = me.getTranslation(elements[i].getAttribute(
					"data-translation"));
			}
		}
		var client = me.devices[data.device_id].client;
		me.bindTouchFix_(client);
		me.onReady(data.code);
		var game_url = me.getGameUrl_(me.getLocationUrl_());
		for (var i = 0; i < me.devices.length; ++i) {
			if (me.devices[i] &&
				me.getGameUrl_(me.devices[i].location) == game_url) {
				if (i != me.getDeviceId()) {
					me.onConnect(i);
					var custom_state = me.getCustomDeviceState(i);
					if (custom_state !== undefined) {
						me.onCustomDeviceStateChange(i, custom_state);
					}
					if (i == AirConsole.SCREEN && me.devices[i].players) {
						me.device_id_to_player_cache = null;
						me.onActivePlayersChange(me.convertDeviceIdToPlayerNumber(
							me.getDeviceId()));
					}
				}
				if (me.isPremium(i)) {
					me.onPremium(i);
				}
			}
		}
	} else if (data.action == "profile") {
		if (me.device_id) {
			var state = me.devices[me.device_id];
			state["auth"] = data.auth;
			state["nickname"] = data.nickname;
			state["picture"] = data.picture;
			me.onDeviceStateChange(me.device_id, state);
			me.onDeviceProfileChange(me.device_id);
		}
	} else if (data.action == "email") {
		me.onEmailAddress(data.email);
	} else if (data.action == "ad") {
		if (data.complete == undefined) {
			me.onAdShow();
		} else {
			me.onAdComplete(data.complete);
		}
	} else if (data.action == "highscores") {
		me.onHighScores(data.highscores);
	} else if (data.action == "highscore") {
		me.onHighScoreStored(data.highscore);
	} else if (data.action == "persistentstore") {
		me.onPersistentDataStored(data.uid);
	} else if (data.action == "persistentrequest") {
		me.onPersistentDataLoaded(data.data);
	} else if (data.action == "premium") {
		me.devices[data.device_id].premium = true;
		me.onPremium(data.device_id);
	} else if (data.action == "pause") {
		me.onPause();
	} else if (data.action == "resume") {
		me.onResume();
	} else if (data.action == "mute") {
		me.onMute(data.mute);
	} else if (data.action == "debug") {
		if (data.debug == "fps") {
			if (window.requestAnimationFrame) {
				var second_animation_frame = function(start) {
					window.requestAnimationFrame(function(end) {
						if (start != end) {
							var delta = end - start;
							AirConsole.postMessage_({
								"action": "debug",
								"fps": (1000 / delta)
							});
						} else {
							second_animation_frame(start);
						}
					});
				};
				window.requestAnimationFrame(second_animation_frame);
			}
		}
	}
};

/**
 * @private
 * @param {String} url - A url.
 * @return {String} Returns the root game url over http.
 */
AirConsole.prototype.getGameUrl_ = function(url) {
	if (!url) {
		return;
	}
	url = url.split("#")[0];
	url = url.split("?")[0];
	if (url.indexOf("screen.html", url.length - 11) !== -1) {
		url = url.substr(0, url.length - 11);
	}
	if (url.indexOf("controller.html", url.length - 15) !== -1) {
		url = url.substr(0, url.length - 15);
	}
	if (url.indexOf("https://") == 0)  {
		url = "http://" + url.substr(8);
	}
	return url;
};

/**
 * Posts a message to the parent window.
 * @private
 * @param {Object} data - the data to be sent to the parent window.
 */
AirConsole.postMessage_ = function(data) {
	try {
		window.parent.postMessage(data, document.referrer);
	} catch(e) {
		console.log("Posting message to parent failed: " + JSON.stringify(data));
	}
};

/**
 * Sets a variable in the external AirConsole framework.
 * @private
 * @param {string} key - The key to set.
 * @param {serializable} value - The value to set.
 */
AirConsole.prototype.set_ = function(key, value) {
	AirConsole.postMessage_({ action: "set", key: key, value: value });
};

/**
 * Adds default css rules to documents so nothing is selectable, zoom is
 * fixed to 1 and preventing scrolling down (iOS 8 clients drop out of
 * fullscreen when scrolling).
 * @private
 */
AirConsole.prototype.setupDocument_ = function() {
	var style = document.createElement("style");
	style.type = "text/css";
	var css_code =
		"html {\n" +
		"  -ms-touch-action: pan-x;\n" +
		"}\n" +
		"body {\n" +
		"  -webkit-touch-callout: none;\n" +
		"  -webkit-text-size-adjust: none;\n" +
		"  -ms-text-size-adjust: none;\n" +
		"  -webkit-user-select: none;\n" +
		"  -moz-user-select: none;\n" +
		"  -ms-user-select: none;\n" +
		"  user-select: none;\n" +
		"  -webkit-highlight: none;\n" +
		"  -webkit-tap-highlight-color: rgba(0,0,0,0);\n" +
		"  -webkit-tap-highlight-color: transparent;\n" +
		"  -ms-touch-action: pan-y;\n" +
		"  -ms-content-zooming: none;\n" +
		"}\n" +
		"\n" +
		"input, textarea  {\n" +
		"  -webkit-user-select: text;\n" +
		"  -moz-user-select: text;\n" +
		"  -ms-user-select: text;\n" +
		"  user-select: text;\n" +
		"}\n" +
		"-ms-@viewport {\n" +
		"    width: device-width;\n" +
		"    initial-scale: 1;\n" +
		"    zoom: 1;\n" +
		"    min-zoom: 1;\n" +
		"    max-zoom: 1;\n" +
		"    user-zoom: fixed;\n" +
		"}";
	if (style.styleSheet) {
		style.styleSheet.cssText = css_code;
	} else {
		style.appendChild(document.createTextNode(css_code));
	}
	var meta = document.createElement("meta");
	meta.setAttribute("name", "viewport");
	meta.setAttribute("content", "width=device-width, minimum-scale=1, " +
		"initial-scale=1, user-scalable=no");
	var head = document.getElementsByTagName("head")[0];
	head.appendChild(meta);
	head.appendChild(style);
	document.addEventListener('touchmove', function (e) {
		e.preventDefault();
	}, {passive: false });
	if (navigator.userAgent.indexOf("Windows Phone ") != -1 &&
		navigator.userAgent.indexOf("Edge/") != -1) {
		document.oncontextmenu = document.body.oncontextmenu = function () {
			return false;
		}
	}
};

/**
 * Returns the current location url
 * @return {string}
 * @private
 */
AirConsole.prototype.getLocationUrl_ = function() {
	return document.location.href;
};

/**
 * Fixes delay in touchstart in crosswalk by calling preventDefault.
 * @param {Object} client - The client object
 * @private
 */
AirConsole.prototype.bindTouchFix_ = function(client) {
	// This fix is only necessary for Android Crosswalk
	if (navigator.userAgent.match(/Android/) &&
		client && client.app === "intel-xdk" &&
		client.version <= 2.3) {
		document.addEventListener('touchstart', function(e) {
			var els = ['DIV', 'IMG', 'SPAN', 'BODY', 'TD', 'TH', 'CANVAS', 'P', 'B',
					   'CENTER', 'EM', 'FONT', 'H1', 'H2', 'H3', 'H4',
					   'H5', 'H6', 'HR', 'I', 'LI', 'PRE', 'SMALL', 'STRONG', 'U'];
			if (els.indexOf(e.target.nodeName) != -1) {
				// Check if one of the parent elements is a link
				var parent = e.target.parentNode;
				while (parent && parent.nodeName != "BODY") {
					if (parent.nodeName == "A") {
						return;
					}
					parent = parent.parentNode;
				}
				e.preventDefault();
				setTimeout(function() {
					e.target.click();
				}, 200);
			}
		});
	}
};

window.addEventListener('error', function(e) {
	var stack = undefined;
	if (e.error && e.error.stack) {
		stack = e.error.stack;
	}
	AirConsole.postMessage_({
		"action": "jserror",
		"url": document.location.href,
		"exception": {
			"message": e.message,
			"error": {
				"stack": stack
			},
			"filename": e.filename,
			"lineno": e.lineno,
			"colno": e.colno
		}
	});
});

window.addEventListener('unhandledrejection', function(e) {
	var stack = undefined;
	if (e.reason && e.reason.stack) {
		stack = e.reason.stack;
	}
	AirConsole.postMessage_({
		"action": "jserror",
		"url": document.location.href,
		"exception": {
			"message": "Unhandled promise rejection: " + e.reason,
			"error": {
				"stack": stack
			},
			"filename": "unhandledrejection:" + e.reason,
			"lineno": 0
		}
	});
});
;
// Dynamic appends:

window.xmlHttpRequestRetryRanger={CHUNK_SIZE:5242880,MATCH:function(a,b){var e=0==a.indexOf("Build/")&&a.endsWith(".unityweb");"Build/game.json"==a&&b.addEventListener("load",function(){window.setTimeout(function(){window.xmlHttpRequestRetryRanger.ACTIVE=function(){return!1}},50)});e&&window.setTimeout(function(){window.xmlHttpRequestRetryRanger.ACTIVE=function(){return!1}},50);return e||0==a.indexOf("Release/")&&(a.endsWith(".js")||a.endsWith(".jsgz")||a.endsWith(".mem")||a.endsWith(".memgz")||a.endsWith(".data")||
		a.endsWith(".datagz"))},ACTIVE:function(){if(!("function"!==typeof onGameReady||"undefined"!=typeof Unity||"game-delivery.airconsole.com"!=document.location.hostname&&"game.airconsole.com"!=document.location.hostname||!document.location.pathname.endsWith("screen.html")||window.app&&window.app.is_unity_ready)){var a=["Chrome","Firefox","Edge"];if(navigator.userAgent)for(var b=0;b<a.length;++b)if(-1!==navigator.userAgent.indexOf(a[b]+"/"))return!0}return!1},USE_PSEUDO_RANGE_HEADERS:!0,URL_REWRITE:function(a,
																																																																																																																																	 b,e,c){c=a.split("#");var d=c[0];a=void 0;void 0!=c[1]&&(c.shift(),a=c.join("#"));d=-1==d.indexOf("?")?d+"?":d+"&";b=d+("xmlhttprequest-ranger-start="+b+"&xmlhttprequest-ranger-end="+e);void 0!=a&&(b+="#"+a);return b},originalXMLHttpRequest:window.XMLHttpRequest};
;
/*
 Copyright by N-Dream AG, 2018
 @licence GNU General Public License v3.0
*/
(function(){if(window.Proxy){var u=function(a,b,c,e,f){a._xmlHttpRequestRetryRanger.pending=!0;a==b&&b.addEventListener("loadstart",function(d){h(a._xmlHttpRequestRetryRanger.listeners.loadstart,d)});b.addEventListener("readystatechange",function(d){if(n(a,b)&&4==b.readyState){a._xmlHttpRequestRetryRanger.pending=!1;if(a._xmlHttpRequestRetryRanger.config.USE_PSEUDO_RANGE_HEADERS?b.getResponseHeader("x-retry-ranger-content-range"):b.getResponseHeader("content-range"))if("arraybuffer"==b.responseType)a._xmlHttpRequestRetryRanger.response.set(new Uint8Array(b.response),
	c);else{if(""==b.responseType||"text"==b.responseType||"json"==b.responseType)a._xmlHttpRequestRetryRanger.response+=b.response}else throw"Response didn't include Content-Range header";r(a,d,!1);if(e<a._xmlHttpRequestRetryRanger.total-1){d=new m;d.responseType=b.responseType;var g=Math.min(e+a._xmlHttpRequestRetryRanger.config.CHUNK_SIZE,a._xmlHttpRequestRetryRanger.total-1);t(a,d,e+1,g);u(a,d,e+1,g);g==a._xmlHttpRequestRetryRanger.total-1&&w(a,d);d.send()}}});a._xmlHttpRequestRetryRanger.lastLoaded=
	0;b.addEventListener("progress",function(d){if(0!=b.status){var g=d.loaded-a._xmlHttpRequestRetryRanger.lastLoaded;a._xmlHttpRequestRetryRanger.lastLoaded+=g;a._xmlHttpRequestRetryRanger.loaded+=g;d=l("progress",d,a);a._xmlHttpRequestRetryRanger.progressComplete=d.loaded==d.total;h(a._xmlHttpRequestRetryRanger.listeners.progress,d)}});b.addEventListener("error",function(d){a._xmlHttpRequestRetryRanger.loaded-=a._xmlHttpRequestRetryRanger.lastLoaded;a._xmlHttpRequestRetryRanger.lastLoaded=0;var g=
	a._xmlHttpRequestRetryRanger.retries;g<a._xmlHttpRequestRetryRanger.config.RETRY?window.setTimeout(function(){var k=new m;f&&x(a,k,c,e);k.responseType=b.responseType;a._xmlHttpRequestRetryRanger.retries+=g+1;t(a,k,c,e);u(a,k,c,e,f);0!=c&&e==a._xmlHttpRequestRetryRanger.total-1&&w(a,k);k.send()},a._xmlHttpRequestRetryRanger.config.RETRY_BACKOFF):(a._xmlHttpRequestRetryRanger.readyState=4,a._xmlHttpRequestRetryRanger.status=0,h(a._xmlHttpRequestRetryRanger.listeners.readystatechange,A("readystatechange",
	d,a)),h(a._xmlHttpRequestRetryRanger.listeners.progress,l("progress",d,a)),h(a._xmlHttpRequestRetryRanger.listeners.error,l("error",d,a)),h(a._xmlHttpRequestRetryRanger.listeners.loadend,l("loadend",d,a)))});y(a,"timeout")},w=function(a,b){b.addEventListener("readystatechange",function(c){4==b.readyState&&0!=b.status&&r(a,c,!0)})},x=function(a,b,c,e){a._xmlHttpRequestRetryRanger.retries=0;b.addEventListener("readystatechange",function(f){if(2==b.readyState)if(a._xmlHttpRequestRetryRanger.status=b.status,
	a._xmlHttpRequestRetryRanger.statusText=b.statusText,n(a,b)){var d;if(d=a._xmlHttpRequestRetryRanger.config.USE_PSEUDO_RANGE_HEADERS?b.getResponseHeader("x-retry-ranger-content-range"):b.getResponseHeader("content-range")){d=d.split("/")[1];if("*"==d)throw"Response didn't include total Content-Range size";d=parseInt(d)}else throw"Response didn't include Content-Range header";a._xmlHttpRequestRetryRanger.total=d;a._xmlHttpRequestRetryRanger.firstRequest=b;if("arraybuffer"==b.responseType)a._xmlHttpRequestRetryRanger.response=
	new Uint8Array(d);else if(""==b.responseType||"text"==b.responseType||"json"==b.responseType)a._xmlHttpRequestRetryRanger.response="";else throw"responseType "+b.responseType+" not supported";}else a._xmlHttpRequestRetryRanger.total=0,a._xmlHttpRequestRetryRanger.response="",a._xmlHttpRequestRetryRanger.firstRequest=b;4==b.readyState?0!=b.status&&(e>=a._xmlHttpRequestRetryRanger.total-1||!n(a,b))&&(n(a,b)||(a._xmlHttpRequestRetryRanger.pending=!1),r(a,f,!0)):a._xmlHttpRequestRetryRanger.readyState<
	b.readyState&&(a._xmlHttpRequestRetryRanger.readyState=b.readyState,h(a._xmlHttpRequestRetryRanger.listeners.readystatechange,p(f,a)))})},t=function(a,b,c,e){for(var f=[],d=0;d<a._xmlHttpRequestRetryRanger.open_arguments.length;++d)1!=d?f.push(a._xmlHttpRequestRetryRanger.open_arguments[d]):f.push(a._xmlHttpRequestRetryRanger.config.URL_REWRITE(a._xmlHttpRequestRetryRanger.open_arguments[d],c,e,a._xmlHttpRequestRetryRanger.retries));f=b.open.apply(b,f);d="range";a._xmlHttpRequestRetryRanger.config.USE_PSEUDO_RANGE_HEADERS&&
(d="x-retry-ranger-range");b.setRequestHeader(d,"bytes="+c+"-"+e);return f},r=function(a,b,c){c&&(a._xmlHttpRequestRetryRanger.readyState=4);4!=a._xmlHttpRequestRetryRanger.readyState||a._xmlHttpRequestRetryRanger.pending||(a._xmlHttpRequestRetryRanger.progressComplete||h(a._xmlHttpRequestRetryRanger.listeners.progress,l("progress",b,a,!0)),h(a._xmlHttpRequestRetryRanger.listeners.readystatechange,p(b,a)),h(a._xmlHttpRequestRetryRanger.listeners.load,l("load",b,a,!0)),h(a._xmlHttpRequestRetryRanger.listeners.loadend,
	l("loadend",b,a,!0)))},y=function(a,b){a.addEventListener(b,B(a,b))},B=function(a,b){return function(c){h(a._xmlHttpRequestRetryRanger.listeners[b],c)}},h=function(a,b){if(a.on)a.on(b);for(var c=0;c<a.listeners.length;++c)a.listeners[c](b)},l=function(a,b,c,e){return new Proxy(p(b,c),{get:function(f,d){return"lengthComputable"==d?0<c._xmlHttpRequestRetryRanger.total:"total"==d?c._xmlHttpRequestRetryRanger.total:"loaded"==d?e?c._xmlHttpRequestRetryRanger.total:c._xmlHttpRequestRetryRanger.loaded:"type"==
	d?a:f[d]},set:function(f,d,g){f[d]=g;return!0}})},A=function(a,b,c){return new Proxy(p(b,c),{get:function(e,f){return"type"==f?a:e[f]},set:function(e,f,d){e[f]=d;return!0}})},p=function(a,b){return new Proxy(a,{get:function(c,e){return"target"==e||"currentTarget"==e?b._xmlHttpRequestRetryRanger.proxy:"function"==typeof c[e]?function(){return c[e].apply(c,arguments)}:c[e]},set:function(c,e,f){c[e]=f;return!0}})},n=function(a,b){return 206==b.status||a._xmlHttpRequestRetryRanger.config.USE_PSEUDO_RANGE_HEADERS&&
	200==b.status},v={CHUNK_SIZE:5242880,MATCH:function(a){return!0},ACTIVE:function(){var a=["Chrome","Safari","Firefox","Edge"];if(navigator.userAgent)for(var b=0;b<a.length;++b)if(-1!=navigator.userAgent.indexOf(a[b]+"/"))return!0;return!1},RETRY:3,RETRY_BACKOFF:1E3,URL_REWRITE:function(a,b,c,e){return a},USE_PSEUDO_RANGE_HEADERS:!1},q={loadstart:!0,progress:!0,load:!0,loadend:!0,error:!1,timeout:!1,readystatechange:!1},m=XMLHttpRequest,C={set:function(a,b,c){0==b.indexOf("on")&&void 0!==a._xmlHttpRequestRetryRanger.listeners[b.substr(2)]?
		(a=a._xmlHttpRequestRetryRanger.listeners[b.substr(2)],a.on&&delete a.on,c&&(a.on=c)):("responseType"==b&&(a._xmlHttpRequestRetryRanger.responseType=c,"json"==c&&(c="")),a[b]=c);return!0},get:function(a,b){var c=!!a._xmlHttpRequestRetryRanger.open_arguments;if("open"==b)return function(){var e=arguments[1];if("GET"==arguments[0].toUpperCase()&&!1!==arguments[2]&&a._xmlHttpRequestRetryRanger.config.MATCH(e,a)){a._xmlHttpRequestRetryRanger.open_arguments=arguments;e=a._xmlHttpRequestRetryRanger.config.CHUNK_SIZE-
		1;x(a,a,0,e);var f=t(a,a,0,e);u(a,a,0,e,!0);return f}a.responseType=a._xmlHttpRequestRetryRanger.responseType||"";for(f in q)y(a,f);return a[b].apply(a,arguments)};if("addEventListener"==b)return function(){if(void 0!==q[arguments[0]])a._xmlHttpRequestRetryRanger.listeners[arguments[0]].listeners.push(arguments[1]);else return a[b].apply(a,arguments)};if("removeEventListener"==b)return function(){if(void 0!==q[arguments[0]])for(var e=a._xmlHttpRequestRetryRanger.listeners[arguments[0]].listeners,
																																																																																																															f=0;f<e.length;++f)e[f]==arguments[1]&&e.splice(f);else return a[b].apply(a,arguments)};if("responseText"==b&&c){if("text"!=a._xmlHttpRequestRetryRanger.responseType&&a._xmlHttpRequestRetryRanger.responseType)throw"responseText not available with response type "+a._xmlHttpRequestRetryRanger.responseType;return 4==a._xmlHttpRequestRetryRanger.readyState?a._xmlHttpRequestRetryRanger.response||"":""}if("response"==b&&c){if(4==a._xmlHttpRequestRetryRanger.readyState)if("text"!=a._xmlHttpRequestRetryRanger.responseType&&
		a._xmlHttpRequestRetryRanger.responseType){if("json"==a._xmlHttpRequestRetryRanger.responseType)return JSON.parse(a._xmlHttpRequestRetryRanger.response);if("arraybuffer"==a._xmlHttpRequestRetryRanger.responseType)return a._xmlHttpRequestRetryRanger.response.buffer}else return a._xmlHttpRequestRetryRanger.response||"";return"json"==a._xmlHttpRequestRetryRanger.responseType?null:""}if("responseType"==b&&c)return a._xmlHttpRequestRetryRanger.responseType||"";if("readyState"==b&&c)return a._xmlHttpRequestRetryRanger.readyState||
		0;if("status"==b&&c)return 206==a._xmlHttpRequestRetryRanger.status?200:a._xmlHttpRequestRetryRanger.status||0;if("statusText"==b&&c)return"Partial Content"==a._xmlHttpRequestRetryRanger.statusText?"OK":a._xmlHttpRequestRetryRanger.statusText||"";if("responseURL"==b&&c)return(c=a._xmlHttpRequestRetryRanger.firstRequest)?c[b]:"";if("abort"==b||"overrideMimeType"==b)console.error(b+" is not implemented in xmlhttprequest-retry-ranger");else return"getResponseHeader"==b&&c?function(){var e=a._xmlHttpRequestRetryRanger.firstRequest;
		return e?arguments[0]&&"content-range"==arguments[0].toLowerCase()?null:arguments[0]&&"content-length"==arguments[0].toLowerCase()?void 0!==a._xmlHttpRequestRetryRanger.total?a._xmlHttpRequestRetryRanger.total:null:e[b].apply(e,arguments):null}:"getAllResponseHeaders"==b&&c?function(){var e="",f=a._xmlHttpRequestRetryRanger.firstRequest;if(f){f=f.getAllResponseHeaders().split("\r\n");for(var d=0;d<f.length;++d){var g=f[d].split(":");if(2<=g.length){g=g[0];var k=a._xmlHttpRequestRetryRanger.proxy.getResponseHeader(g);
		null!=k&&(e+=g+": "+k+"\r\n")}}}return e}:"function"==typeof a[b]?function(){return a[b].apply(a,arguments)}:a[b]}};window.XMLHttpRequest=function(a){a=new m(a);var b=window.xmlHttpRequestRetryRanger||v;if(window.xmlHttpRequestRetryRanger)for(var c in v){var e=window.xmlHttpRequestRetryRanger[c];b[c]=void 0!==e?e:v[c]}if(!b.ACTIVE())return a;c=new Proxy(a,C);b={listeners:{},config:b,readyState:0,proxy:c,lastLoaded:0,loaded:0,total:0};for(var f in q)b.listeners[f]={listeners:[]};a._xmlHttpRequestRetryRanger=
	b;return c};for(var z in m)window.XMLHttpRequest[z]=m[z]}})();
;
(function(){var p=(new Date).getTime();if(document.location.pathname.indexOf("screen.html")===document.location.pathname.length-11){var h=document.location.pathname.split("/");if(2<=h.length){var d=h[1].replace(".cdn.airconsole.com","");d===h[1]&&(d="com.airconsole.developers")}var c=function(f,g){var e={action:"set",key:f,value:g};try{window.parent.postMessage(e,document.referrer)}catch(k){console.log("Posting message to parent failed: "+JSON.stringify(e))}};c("ga",["send","event","GameStartToReady",
																																																																																																																						d,"start",0]);c("download_progress",{start:!0});window.addEventListener("load",function(){if(window.performance&&"function"===typeof window.performance.getEntriesByType){var f=function(a){for(var m=a.performance.getEntriesByType("resource"),l=0,b=0;b<m.length;++b)l+=m[b].encodedBodySize|0;a=a.document.getElementsByTagName("iframe");for(b=0;b<a.length;++b)try{l+=f(a[b].contentWindow)}catch(r){}return l},g;var e=window.setInterval(function(){var a=f(window);a!==g&&(c("download_progress",{downloaded:a}),
	g=a)},1E3)}var k=function(){e&&window.clearTimeout(e);c("download_progress",{complete:!0});var a=(new Date).getTime()-p;c("ga",["send","event","GameStartToReady",d,"ready",2]);c("ga",["send","timing","GameReady",d,a,document.location.hostname])};if("function"===typeof onGameReady&&"undefined"==typeof Unity){var q=window.onGameReady;window.onGameReady=function(){k();q.apply(this,arguments)}}else{var n=function(a){"ready"==a.data.action&&(k(),window.removeEventListener("message",n))};window.addEventListener("message",
	n)}})}})();
;
(function(){if(-1!==navigator.userAgent.indexOf("Chrome")){var a=/Mac OS X ([\._\d]+)/.exec(navigator.userAgent);if(a&&a[1]){var b=a[1].split("_");b&&b[0]&&(a=parseInt(b[0],10))}if(a&&11<=a){var g=navigator.userAgent,h=navigator.userAgent.replace(/Mac OS X ([\._\d]+)/,"Mac OS X 10_15_7");window.navigator.__defineGetter__("userAgent",function(){try{throw Error();}catch(k){var c=k.stack;if(c){for(var e=["UnityLoader.js","SystemInfo","GetClientInfo"],f=!1,d=0;d<e.length;d++)if(-1<c.indexOf(e[d])){f=
	!0;break}if(f)return h;window._unity_loader_stack=c}}return g})}}})();
;
