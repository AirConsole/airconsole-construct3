
const C3 = self.C3;

C3.Plugins.AirConsole.Instance = class SingleGlobalInstance extends C3.SDKInstanceBase
{
	constructor(inst, properties)
	{
		super(inst);
		
    var self = this;
		// Are we previewing the project? If so we initialize the mock airconsole version 
		if (window.location.href.indexOf('preview.construct.net') > -1) {
			self.initAirConsole(properties);
		}
		else {
			var script = document.createElement('script');
			script.src = 'https://www.airconsole.com/api/airconsole-1.8.0.js';
			script.onload = function() {
				self.initAirConsole(properties);
			};
			document.head.appendChild(script);
		}
    
	}
  
  
	initAirConsole (properties) {
    var self = this;
		if (typeof AirConsole !== 'undefined') {
			this.runningOffline = false;
			if (properties[1] === true) { // is-controller?
				self.gameReady = true;
				var config = {orientation: AirConsole.ORIENTATION_LANDSCAPE, synchronize_time: false, setup_document: true, device_motion: false};
				if (properties[2] === 1) {
					config.orientation = AirConsole.ORIENTATION_PORTRAIT;
				}
				if (properties[3] === true) {
					config.synchronize_time = true;
				}
				if (properties[4] > 0) {
					config.device_motion = properties[4];
				}

				this.airConsole = new AirConsole(config);
			}
			else {
				this.airConsole = new AirConsole();
			}
		}
		else {
			this.runningOffline = true;
			this.airConsole = new AirConsoleOffline();
		}

		this.maxPlayers = properties[0];
		this.isController = properties[1];

		if (this.isController) {
			this.airConsole.onReady = function () {
				self.airConsole.message(AirConsole.SCREEN, {
					handshake: true
				})
			}
		}

		this.airConsole.onConnect = function (deviceId) {
			if (self.gameReady) {
				self.deviceId = deviceId;
				if (self.airConsole.getControllerDeviceIds().length > self.maxPlayers) {
					self.Trigger(C3.Plugins.AirConsole.Cnds.OnTooManyPlayers, self);
				}
				else {
					self.Trigger(C3.Plugins.AirConsole.Cnds.OnConnect, self);
				}
			}
		};

		this.airConsole.onDisconnect = function (deviceId) {
			if (self.gameReady) {
				self.deviceId = deviceId;
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnDisconnect, self);
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnDeviceDisconnect, self);
			}
		};

		this.airConsole.onMessage = function (deviceId, data) {
			if (self.gameReady && data) {
				self.deviceId = deviceId;
				self.message = data;
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnMessage, self);
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnMessageFrom, self);
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnMessageIs, self);
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnMessageFromIs, self);
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnMessageHasProperty, self);
			}
		};

		this.airConsole.onDeviceStateChange = function (deviceId, data) {};

		this.airConsole.onCustomDeviceStateChange = function (deviceId, customData) {
			self.deviceId = deviceId;
			self.customData = customData;
			self.Trigger(C3.Plugins.AirConsole.Cnds.OnCustomDeviceStateChange, self);
		};

		this.airConsole.onHighscores = function (highscores) {
			if (highscores) {
				self.highscores = highscores;
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnHighScores, self);
			}
		};

		this.airConsole.onHighscoreStored = function (highscores) {
			if (highscores) {
				self.highscores = highscores;
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnHighScoreStored, self);
			}
		};

		this.airConsole.onAdComplete = function (adWasShown) {
			self.adCompleted = (adWasShown) ? 1 : 0;
			self.adShowing = 0;
			self.Trigger(C3.Plugins.AirConsole.Cnds.OnAdComplete, self);
		};

		this.airConsole.onAdShow = function () {
			self.adShowing = 1;
			self.Trigger(C3.Plugins.AirConsole.Cnds.OnAdShow, self);
		};

		this.airConsole.onPremium = function (deviceId) {
			if (self.gameReady) {
				self.deviceId = deviceId;
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnPremium, self);
			}
		};

		this.airConsole.onPersistentDataLoaded = function (data) {
			if (data) {
				self.persistentData = data;
				self.Trigger(C3.Plugins.AirConsole.Cnds.OnPersistentDataLoaded, self);
			}
		};

		this.airConsole.onPersistentDataStored = function (uid) {
			self.Trigger(C3.Plugins.AirConsole.Cnds.OnPersistentDataStored, self);
		};

		this.airConsole.onDeviceProfileChange = function (deviceId) {
			self.deviceId = deviceId;
			self.Trigger(C3.Plugins.AirConsole.Cnds.OnDeviceProfileChange, self);
		};

		this.airConsole.onDeviceMotion = function (data) {
			self.motionData = data;
			self.Trigger(C3.Plugins.AirConsole.Cnds.OnDeviceMotion, self);
		}
	};
  
	
	Release()
	{
		super.Release();
	}

	_SetTestProperty(n)
	{
		this._testProperty = n;
	}

	_GetTestProperty()
	{
		return this._testProperty;
	}
	
	SaveToJson()
	{
		return {
			// data to be saved for savegames
		};
	}
	
	LoadFromJson(o)
	{
		// load state for savegames
	}

	GetScriptInterfaceClass()
	{
		return self.IAirConsoleInstance;
	}
};

// Script interface. Use a WeakMap to safely hide the internal implementation details from the
// caller using the script interface.
const map = new WeakMap();

self.IAirConsoleInstance = class IAirConsoleInstance extends self.IInstance {
	constructor()
	{
		super();
		
		// Map by SDK instance
		map.set(this, self.IInstance._GetInitInst().GetSdkInstance());
	}

	// Example setter/getter property on script interface
	set testProperty(n)
	{
		map.get(this)._SetTestProperty(n);
	}

	get testProperty()
	{
		return map.get(this)._GetTestProperty();
	}
};



function AirConsoleOffline() {
	console.warn('You are currently offline or AirConsole could not be loaded. Plugin fallback to AirConsole mock-up.');
	AirConsoleOffline.prototype.getNickname = function() {
		console.log('AirConsole mock-up: Getting nickname');
		return 'undefined when offline';
	};
	AirConsoleOffline.prototype.getProfilePicture = function() {
		console.log('AirConsole mock-up: Getting profile picture');
		return 'undefined when offline';
	};
	AirConsoleOffline.prototype.getUID = function() {
		console.log('AirConsole mock-up: Getting UID');
		return -9999;
	};
	AirConsoleOffline.prototype.isPremium = function() {
		console.log('AirConsole mock-up: Checking if premium');
		return false;
	};
	AirConsoleOffline.prototype.getControllerDeviceIds = function() {
		console.log('AirConsole mock-up: Getting controller device ids');
		return [];
	};
	AirConsoleOffline.prototype.getCustomDeviceState = function() {
		console.log('AirConsole mock-up: Getting custom device state');
		return null;
	};
	AirConsoleOffline.prototype.isUserLoggedIn = function() {
		console.log('AirConsole mock-up: Checking if user is logged in');
		return false;
	};
	AirConsoleOffline.prototype.message = function() {console.log('AirConsole mock-up: Sending a message')};
	AirConsoleOffline.prototype.broadcast = function() {console.log('AirConsole mock-up: Broadcasting a message')};
	AirConsoleOffline.prototype.requestHighScores = function() {console.log('AirConsole mock-up: Requesting highscores')};
	AirConsoleOffline.prototype.storeHighScore = function() {console.log('AirConsole mock-up: Storing highscores')};
	AirConsoleOffline.prototype.setActivePlayers = function() {console.log('AirConsole mock-up: Setting active players')};
	AirConsoleOffline.prototype.showAd = function() {console.log('AirConsole mock-up: Showing ad')};
	AirConsoleOffline.prototype.navigateHome = function() {console.log('AirConsole mock-up: Navigating home')};
	AirConsoleOffline.prototype.navigateTo = function() {console.log('AirConsole mock-up: Navigating to given url')};
	AirConsoleOffline.prototype.requestPersistentData = function() {console.log('AirConsole mock-up: Requesting persistent data')};
	AirConsoleOffline.prototype.storePersistentData = function() {console.log('AirConsole mock-up: Storing persistent data')};
	AirConsoleOffline.prototype.getMasterControllerDeviceId = function() {
		console.log('AirConsole mock-up: Getting master controller device id');
		return -9999;
	};
	AirConsoleOffline.prototype.getActivePlayerDeviceIds = function() {
		console.log('AirConsole mock-up: Getting active player device ids');
		return [];
	};
	AirConsoleOffline.prototype.convertPlayerNumberToDeviceId = function() {console.log('AirConsole mock-up: Converting player number to device id')};
	AirConsoleOffline.prototype.convertDeviceIdToPlayerNumber = function() {console.log('AirConsole mock-up: Converting device id to player number')};
}