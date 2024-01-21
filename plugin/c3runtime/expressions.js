
const C3 = self.C3;

C3.Plugins.AirConsole.Exps =
{
	DeviceId() {
		return this.deviceId;
	},
	Message() {
		if (typeof this.message === 'object') {
			if (Object.keys(this.message).length === 1) {
				return this.message[Object.keys(this.message)[0]] || '';
			}
			else {
				return JSON.stringify(this.message);
			}
		}
		else {
			return this.message;
		}
	},
	MessageAtProperty(property) {
		if (typeof this.message === 'object' && this.message.hasOwnProperty(property)) {
			return this.message[property] || '';
		}
		else {
			console.warn("MessageAtProperty - Tried to access a non existing property");
		}
	},
	IsMultipartMessage() {
		if (this.message !== null && typeof this.message === 'object' && Object.keys(this.message).length > 1) {
			return 1;
		}
		else {
			return 0;
		}
	},
	MessageHasProperty(property) {
		if (this.message !== null && typeof this.message === 'object' && this.message.hasOwnProperty(property)) {
			return 1;
		}
		else {
			return 0;
		}
	},
	MessageAsJSON() {
		var c2Dictionary = new Object();
		c2Dictionary['c2dictionary'] = true;
		c2Dictionary['data'] = getProperties(this.message);
		return JSON.stringify(c2Dictionary);
	},
	GetProfilePicture(deviceId) {
		var pic = this.airConsole.getProfilePicture(deviceId) || "https://www.gravatar.com/avatar/00000000000000000000000000000000?f=y";
		return pic;
	},
	GetNickname(deviceId) {
		var nickname = this.airConsole.getNickname(deviceId) || "Nickname not found";
		return nickname;
	},
	GetUID(deviceId) {
		var uid = this.airConsole.getUID(deviceId) || "Unknown UID";
		return uid
	},
	GetMessagePropertiesCount(ret) {
		if (this.message !== null && typeof this.message === 'object') {
			return Object.keys(this.message).length;
		}
		else {
      return 0;
		}
	},
	GetMasterControllerDeviceId() {
		var id = this.airConsole.getMasterControllerDeviceId();
		return (typeof id !== 'number' || isNaN(id)) ? -1 : id;
	},
	ConvertPlayerNumberToDeviceId(playerNumber) {
		var id = this.airConsole.convertPlayerNumberToDeviceId(playerNumber);
		return (typeof id !== 'number') ? -1 : id;
	},
	ConvertDeviceIdToPlayerNumber(deviceId) {
		var playerNumber = this.airConsole.convertDeviceIdToPlayerNumber(deviceId);
		return (typeof playerNumber !== 'number') ? -1 : playerNumber;
	},
	IsPremium(deviceId) {
		return (this.airConsole.isPremium(deviceId) !== false) ? 1 : 0;
	},
	GetControllerDeviceIDs() {
		var arr = this.airConsole.getControllerDeviceIds();

		var c2array = new Object();
		c2array['c2array'] = true;
		c2array['size'] = [arr.length, 1, 1];
		var data = [];
		for (var i in arr) {
			data.push([[arr[i]]]);
		}
		c2array['data'] = data;

		return JSON.stringify(c2array);
	},
	GetPersistentData() {
		if (this.persistentData !== null) {
			var c2Dictionary = new Object();
			c2Dictionary['c2dictionary'] = true;
			c2Dictionary['data'] = getProperties(this.persistentData);
			return JSON.stringify(c2Dictionary);
		}
		else {
			console.warn("Persistent data requested but they weren't loaded. Did you forget to use RequestPersistentData?");
			return '';
		}
	},
	GetHighscores() {
		if (this.highscores !== null) {
			var c2Dictionary = new Object();
			c2Dictionary['c2dictionary'] = true;
			c2Dictionary['data'] = getProperties(this.highscores);
			return JSON.stringify(c2Dictionary);
		}
		else {
			console.warn("Highscores data requested but they weren't loaded. Did you forget to use RequestHighscores?");
			return '';
		}
	},
	IsPluginOffline(ret) {
		return (this.runningOffline) ? 1 : 0;
	},
	GetActivePlayerDeviceIds(ret) {
		var arr = this.airConsole.getActivePlayerDeviceIds();

		var c2array = new Object();
		c2array['c2array'] = true;
		c2array['size'] = [arr.length, 1, 1];
		var data = [];
		for (var i in arr) {
			data.push([[arr[i]]]);
		}
		c2array['data'] = data;

		return JSON.stringify(c2array);
	},
	IsController() {
		return (this.isController) ? 1 : 0;
	},
	IsAddShowing() {
		return this.adShowing;
	},
	AdShown() {
		return this.adCompleted;
	},
	GetServerTime() {
		return (this.isController) ? this.airConsole.getServerTime() : 0;
	},
	GetThisDeviceId() {
		if (this.isController) {
			return this.airConsole.getDeviceId();
		}
		else {
      return 0;
		}
	},
	MotionData() {
		if (this.motionData !== null) {
			var c2Dictionary = new Object();
			c2Dictionary['c2dictionary'] = true;
			c2Dictionary['data'] = getProperties(this.motionData);
			return JSON.stringify(c2Dictionary);
		}
		else {
			return '';
		}
	},
};

function getProperties(object) {
  var data = new Object();
  $.each(object, function(property, value) {
    if (typeof value === 'object') {
      var c2Dictionary = new Object();
      c2Dictionary['c2dictionary'] = true;
      c2Dictionary['data'] = getProperties(value);
      data[property] = JSON.stringify(c2Dictionary);
    }
    else {
      if (typeof value === 'boolean') {
        value = (!value) ? 0 : 1;
      }
      data[property] = value;
    }
  });
  return data;
}