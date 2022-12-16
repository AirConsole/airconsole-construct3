'use strict'

{
	const DOM_COMPONENT_ID = 'ndream_AirConsole'

	const HANDLER_CLASS = class ndream_AirConsoleDOMHandler extends self.DOMHandler {
		constructor(iRuntime) {
			super(iRuntime, DOM_COMPONENT_ID)

			this.AddRuntimeMessageHandlers([
				['initAirconsole', data => this._OnInitAirconsole(data)]
			])

			this.airConsole = null
			this.gameReaedy = false
			this.runningOffline = true

			this.maxPlayers = 0
			this.isController = false
			this.useTranslation = false
			this.orientation = 'portrait'
			this.syncTime = false
			this.deviceMotion = 0
			this.deviceId = null
			this.message = null
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

			/* Ok, because this took me a week to remember...
			   AirConsole needs to run in the main window to be able to post messages. This is not an issue when running a compiled game
			   but becomes an issue when previewing your Construct 2/3 projects as the preview runs in a separate window. This is why, if we are in preview mode
			   we need to fall back to the offline mockup of AirConsole
			 */
			if (typeof AirConsole !== 'undefined' && window.location.href.indexOf('preview.construct.net') === -1) {
				this.runningOffline = false
				let config = {}
				if (this.isController) {
					config = {
						translation:      this.useTranslation,
						orientation:      this.orientation === 0 ? AirConsole.ORIENTATION_LANDSCAPE : AirConsole.ORIENTATION_PORTRAIT,
						synchronize_time: this.syncTime,
						setup_document:   true,
						device_motion:    this.deviceMotion
					}
				}
				this.airConsole = new AirConsole(config)
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

			this.PostToRuntime('onDisconnect', {'deviceId': 1})

			this.airConsole.onDisconnect = function (deviceId) {
				this.deviceId = deviceId
				this.PostToRuntime('onDisconnect', {'deviceId': deviceId})
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
			console.warn('You are currently offline or previewing your project or AirConsole could not be loaded. Plugin fallback to AirConsole mock-up.')
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
