
const C3 = self.C3;

C3.Plugins.AirConsole.Cnds =
{
	OnConnect() {
		return true;
	},
	OnDisconnect() {
		return true;
	},
	OnDeviceDisconnect(deviceId) {
		return this.deviceId === deviceId;
	},
	OnTooManyPlayers() {
		return true;
	},
	OnPremium() {
		return true;
	},
	OnMessage() {
		return true;
	},
	OnMessageFrom(deviceId) {
		return this.deviceId === deviceId;
	},
	OnMessageIs(property, value) {
		if (typeof this.message === 'string') {
			return this.message === value;
		}
		else {
			return (this.message.hasOwnProperty(property) && this.message[property] == value);
		}
	},
	OnMessageFromIs(property, value, deviceId) {
		if (typeof this.message === 'string') {
			return (this.message === value && this.deviceId === deviceId);
		}
		else {
			return (this.message.hasOwnProperty(property) && this.message[property] == value && this.deviceId === deviceId);
		}
	},
	OnMessageHasProperty(property) {
		return (this.message.hasOwnProperty(property));
	},
	IsUserLoggedIn(deviceId) {
		return this.airConsole.isUserLoggedIn(deviceId);
	},
	OnAdComplete() {
		return true;
	},
	OnAdShow() {
		return true;
	},
	OnPersistentDataLoaded() {
		return true;
	},
	OnPersistentDataStored() {
		return true;
	},
	OnHighScores() {
		return true;
	},
	OnHighScoreStored() {
		return true;
	},
	OnEmailAddress() {
		return true;
	},
	OnDeviceProfileChange() {
		return true;
	},
	OnCustomDeviceStateChange() {
		return true;
	},
	IsPremium(deviceId) {
		return this.airConsole.isPremium(deviceId);
	},
	IsPluginOffline() {
		return this.runningOffline;
	},
	IsMultipartMessage() {
		return Object.keys(this.message).length > 1;
	},
	IsController() {
		return this.isController;
	},
	AdShown() {
		return this.adCompleted === 1;
	},
	IsAdShowing() {
		return this.adShowing === 1;
	},
	OnDeviceMotion() {
		return true;
	},
};