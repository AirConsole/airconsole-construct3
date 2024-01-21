
const C3 = self.C3;

C3.Plugins.AirConsole.Acts =
{
	GameReady() {
		// Because we cannot bundle the API and it has to be dynamically loaded, check if the load already happened by checking AirConsole
		// If it's undefined, try again later
		if (this.runningOffline || this.loadRetry > 20) {
			return;
		}

		if (typeof AirConsole !== 'undefined') {
			this.gameReady = true;
			var deviceIds = this.airConsole.getControllerDeviceIds();
			for (var i = 0; i < deviceIds.length; i++) {
				this.airConsole.onConnect(deviceIds[i]);
			}
		}
		else {
			this.loadRetry++;
			setInterval(this.GameReady, 100);
		}
	},
  Message(deviceId, property, value) {
		if (property !== 'message') {
			console.warn('Property other than "message" isn\'t currently supported');
		}

		var obj = parseJSON(value);
		if (obj !== false) {
			value = obj;
		}

		this.airConsole.message(deviceId, value);
	},
  Broadcast(property, message) {
		this.airConsole.broadcast(message);
	},
  SetCustomDeviceStateProperty(property, value) {
		this.airConsole.setCustomDeviceState(property, value);
	},
  RequestHighScores(level_name, level_version, uids, ranks, total, top) {
		this.highscores = null;
		var uidsArray;
		if (uids === 'all') {
			uidsArray = '';
		}
		else if (uids.indexOf(',') > -1) {
			uidsArray = uids.split(',');
		}
		else {
			uidsArray = [uids];
		}
		var ranksArray = (ranks === 'world') ? [ranks] : ranks.split(',');
		this.airConsole.requestHighScores(level_name, level_version, uidsArray, ranksArray, total, top);
	},
  StoreHighScores(level_name, level_version, score, uid, data, score_string) {
		var uidArray = uid.split(',');
		this.airConsole.storeHighScore(level_name, level_version, score, uidArray, data, score_string);
	},
  SetActivePlayers(max_players) {
		this.airConsole.setActivePlayers(max_players);
	},
  ShowAd() {
		this.airConsole.showAd();
	},
  NavigateHome() {
		this.airConsole.navigateHome();
	},
  NavigateTo(url) {
		this.airConsole.navigateTo(url);
	},
  RequestPersistentData(uids) {
		this.persistentData = null;
		var uidsArray = (uids.indexOf(',') > -1) ? uids.split(',') : [uids];
		this.airConsole.requestPersistentData(uidsArray);
	},
  StorePersistentData(key, value, uid) {
		this.airConsole.storePersistentData(key, value, uid);
	},
  EditProfile() {
		if (this.isController) {
			this.airConsole.editProfile();
		}
		else {
			console.warn('You can\' use "Edit profile" on screen');
		}
	},
  SetOrientation(orientation) {
		if (this.isController) {
			this.airConsole.setOrientation((orientation === 1) ? AirConsole.ORIENTATION_PORTRAIT : AirConsole.ORIENTATION_LANDSCAPE);
		}
	},
  SendPresetMessage(deviceId) {
		if (this.runningOffline) return;

		this.airConsole.message(deviceId, this.presetMessage);
		this.presetMessage = {};
	},
  BroadcastPresetMessage() {
		this.airConsole.broadcast(this.presetMessage);
		this.presetMessage = {};
	},
  SetPresetMessage(key, value) {
		this.presetMessage[key] = value;
	},
  ClearPresetMessage() {
		this.presetMessage = {};
	},
  GetPremium() {
		if (this.isController) {
			this.airConsole.getPremium();
		}
	}
};

	/**
	 * Check if a given string is JSON or not
	 * @param{string} data - string to parse JSON object from
	 * @return false or the parsed object
	 */
	function parseJSON(data) {
		try {
			var obj = JSON.parse(data);
		}
		catch (e) {
			return false;
		}
		return obj;
	}