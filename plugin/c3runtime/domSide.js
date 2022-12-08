'use strict'

{
	const DOM_COMPONENT_ID = 'C3AirConsole'

	const HANDLER_CLASS = class AirConsoleDOMHandler extends self.DOMHandler {
		constructor(iRuntime) {
			super(iRuntime, DOM_COMPONENT_ID)

			this.AddRuntimeMessageHandlers([
				['initAirconsole', data => this._OnInitAirconsole(data)]
			])

			this.airConsole = null
			this.airConsoleMockup = null
			this.gameReaedy = false
			this.runningOffline = true

			this.maxPlayers = 0
			this.isController = false
			this.useTranslation = false
			this.orientation = 'portrait'
			this.syncTime = false
			this.deviceMotion = 0
			this.deviceId
			this.message
			this.adCompleted = 0
			this.adShowing = 0
			this.persistentData = null
			this.highscores = null
			this.emailAddress = null
			this.customData = null
			this.loadRetry = 0
			this.presetMessage = {}
			this.motionData = {}
		}

		_OnInitAirconsole(properties) {
			console.log('Initializing AirConsole')

			this.maxPlayers = properties[0]
			this.isController = properties[1]
			this.useTranslation = properties[2]
			this.orientation = properties[3]
			this.syncTime = properties[4]
			this.deviceMotion = properties[5]

			if (typeof AirConsole !== 'undefined') {
				this.runningOffline = false
				if (this.isController) {
					const config = {
						translation:      this.useTranslation,
						orientation:      this.orientation === 0 ? AirConsole.ORIENTATION_LANDSCAPE : AirConsole.ORIENTATION_PORTRAIT,
						synchronize_time: this.syncTime,
						setup_document:   true,
						device_motion:    this.deviceMotion
					}
					this.airConsole = new AirConsole(config)
				} else {
					this.airConsole = new AirConsole()
				}
			} else {
				this.runningOffline = true
				this.airConsole = new AIRCONSOLE_MOCKUP()
			}

			if (this.isController) {
				this.airConsole.onReady = function () {
					this.airConsole.message(AirConsole.SCREEN, {
						handshake: true
					})
				}
			}

			this.airConsole.onDisconnect = function (deviceId) {
				if (self.gameReady) {
					self.deviceId = deviceId
					self.runtime.trigger(pluginProto.cnds.OnDisconnect, self)
					self.runtime.trigger(pluginProto.cnds.OnDeviceDisconnect, self)
				}
			}

			this.airConsole.onMessage = function (deviceId, data) {
				if (self.gameReady && data) {
					self.deviceId = deviceId
					self.message = data
					self.runtime.trigger(pluginProto.cnds.OnMessage, self)
					self.runtime.trigger(pluginProto.cnds.OnMessageFrom, self)
					self.runtime.trigger(pluginProto.cnds.OnMessageIs, self)
					self.runtime.trigger(pluginProto.cnds.OnMessageFromIs, self)
					self.runtime.trigger(pluginProto.cnds.OnMessageHasProperty, self)
				}
			}

			this.airConsole.onDeviceStateChange = function (deviceId, data) {
			}

			this.airConsole.onCustomDeviceStateChange = function (deviceId, customData) {
				self.deviceId = deviceId
				self.customData = customData
				self.runtime.trigger(pluginProto.cnds.OnCustomDeviceStateChange, self)
			}

			this.airConsole.onHighscores = function (highscores) {
				if (highscores) {
					self.highscores = highscores
					self.runtime.trigger(pluginProto.cnds.OnHighScores, self)
				}
			}

			this.airConsole.onHighscoreStored = function (highscores) {
				if (highscores) {
					self.highscores = highscores
					self.runtime.trigger(pluginProto.cnds.OnHighScoreStored, self)
				}
			}

			this.airConsole.onAdComplete = function (adWasShown) {
				self.adCompleted = (adWasShown) ? 1 : 0
				self.adShowing = 0
				self.runtime.trigger(pluginProto.cnds.OnAdComplete, self)
			}

			this.airConsole.onAdShow = function () {
				self.adShowing = 1
				self.runtime.trigger(pluginProto.cnds.OnAdShow, self)
			}

			this.airConsole.onPremium = function (deviceId) {
				if (self.gameReady) {
					self.deviceId = deviceId
					self.runtime.trigger(pluginProto.cnds.OnPremium, self)
				}
			}

			this.airConsole.onPersistentDataLoaded = function (data) {
				if (data) {
					self.persistentData = data
					self.runtime.trigger(pluginProto.cnds.OnPersistentDataLoaded, self)
				}
			}

			this.airConsole.onPersistentDataStored = function (uid) {
				self.runtime.trigger(pluginProto.cnds.OnPersistentDataStored, self)
			}

			this.airConsole.onDeviceProfileChange = function (deviceId) {
				self.deviceId = deviceId
				self.runtime.trigger(pluginProto.cnds.OnDeviceProfileChange, self)
			}

			this.airConsole.onDeviceMotion = function (data) {
				self.motionData = data
				self.runtime.trigger(pluginProto.cnds.OnDeviceMotion, self)
			}

			console.log('AirConsole init success')
		}

		getProperties(object) {
			if (object === null || typeof object === 'object') {
				return
			}

			let data = {}
			for (let [property, value] of Object.entries(object)) {
				if (typeof value === 'object') {
					let c3Dictionary = {}
					c3Dictionary['c2dictionary'] = true
					c3Dictionary['data'] = this.getProperties(value)
					data[property] = JSON.stringify(c3Dictionary)
				} else {
					if (typeof value === 'boolean') {
						value = (!value) ? 0 : 1
					}
					data[property] = value
				}
			}
			return data
		}

		parseJSON(string) {
			let obj
			try {
				obj = JSON.parse(string)
			} catch (e) {
				obj = false
			}
			return obj
		}
	}

	const AIRCONSOLE_MOCKUP = class AirConsoleOffline {
		constructor() {
			console.warn('You are currently offline or AirConsole could not be loaded. Plugin fallback to AirConsole mock-up.')
			this.getNickname = function () {
				console.log('AirConsole mock-up: Getting nickname')
				return 'undefined when offline'
			}
			this.getProfilePicture = function () {
				console.log('AirConsole mock-up: Getting profile picture')
				return 'undefined when offline'
			}
			this.getUID = function () {
				console.log('AirConsole mock-up: Getting UID')
				return -9999
			}
			this.isPremium = function () {
				console.log('AirConsole mock-up: Checking if premium')
				return false
			}
			this.getControllerDeviceIds = function () {
				console.log('AirConsole mock-up: Getting controller device ids')
				return []
			}
			this.getCustomDeviceState = function () {
				console.log('AirConsole mock-up: Getting custom device state')
				return null
			}
			this.isUserLoggedIn = function () {
				console.log('AirConsole mock-up: Checking if user is logged in')
				return false
			}
			this.message = function () {
				console.log('AirConsole mock-up: Sending a message')
			}
			this.broadcast = function () {
				console.log('AirConsole mock-up: Broadcasting a message')
			}
			this.requestHighScores = function () {
				console.log('AirConsole mock-up: Requesting highscores')
			}
			this.storeHighScore = function () {
				console.log('AirConsole mock-up: Storing highscores')
			}
			this.setActivePlayers = function () {
				console.log('AirConsole mock-up: Setting active players')
			}
			this.showAd = function () {
				console.log('AirConsole mock-up: Showing ad')
			}
			this.navigateHome = function () {
				console.log('AirConsole mock-up: Navigating home')
			}
			this.navigateTo = function () {
				console.log('AirConsole mock-up: Navigating to given url')
			}
			this.requestPersistentData = function () {
				console.log('AirConsole mock-up: Requesting persistent data')
			}
			this.storePersistentData = function () {
				console.log('AirConsole mock-up: Storing persistent data')
			}
			this.getMasterControllerDeviceId = function () {
				console.log('AirConsole mock-up: Getting master controller device id')
				return -9999
			}
			this.getActivePlayerDeviceIds = function () {
				console.log('AirConsole mock-up: Getting active player device ids')
				return []
			}
			this.convertPlayerNumberToDeviceId = function () {
				console.log('AirConsole mock-up: Converting player number to device id')
			}
			this.convertDeviceIdToPlayerNumber = function () {
				console.log('AirConsole mock-up: Converting device id to player number')
			}
		}
	}
	self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS)
}
