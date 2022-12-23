'use strict'

{
	const DOM_COMPONENT_ID = 'ndream_AirConsole'

	const HANDLER_CLASS = class ndream_AirConsoleDOMHandler extends self.DOMHandler {
		constructor(iRuntime) {
			super(iRuntime, DOM_COMPONENT_ID)

			this.AddRuntimeMessageHandlers([
				['initAirConsole', data => this._OnInitAirconsole(data)],
				['isPremium', deviceId => this._IsPremium(deviceId)],
				['isUserLoggedIn', deviceId => this._IsUserLoggedIn(deviceId)],
				['getControllerDeviceIds', _ => this._GetControllerDeviceIds()],
				['onConnect', deviceId => this._OnConnect(deviceId)],
				['message', data => this._Message(data)],
				['broadcast', message => this._Broadcast(message)],
				['setCustomDeviceState', data => this._SetCustomDeviceState(data)],
				['requestHighScores', data => this._RequestHighScores(data)],
				['storeHighScores', data => this._StoreHighScores(data)],
				['setActivePlayers', data => this._SetActivePlayers(data)],
				['showAd', _ => this._ShowAd()],
				['navigateHome', _ => this._NavigateHome()],
				['navigateTo', data => this._NavigateTo(data)],
				['requestPersistentData', data => this._RequestPersistentData(data)],
				['storePersistentData', data => this._StorePersistentData(data)],
				['editProfile', _ => this._EditProfile()],
				['setOrientation', data => this._SetOrientation(data)],
				['getPremium', _ => this._GetPremium()],
				['vibrate', data => this._Vibrate(data)],
			])

			this.airConsole = null
			this.maxPlayers = null
			this.isController = null
			this.useTranslation = null
			this.orientation = null
			this.syncTime = null
			this.deviceMotion = null
		}

		_IsPremium(deviceId) {
			return this.airConsole.isPremium(deviceId)
		}

		_IsUserLoggedIn(deviceId) {
			return this.airConsole.isUserLoggedIn(deviceId)
		}

		_GetControllerDeviceIds() {
			return this.airConsole.getControllerDeviceIds()
		}

		_OnConnect(deviceId) {
			return this.airConsole.onConnect(deviceId)
		}

		_Message(data) {
			this.airConsole.message(data['deviceId'], data['value'])
		}

		_Broadcast(message) {
			this.airConsole.broadcast(message)
		}

		_SetCustomDeviceState(data) {
			this.airConsole.setCustomDeviceState(data['property'], data['value'])
		}

		_RequestHighScores(data){
			this.airConsole.requestHighScores(
				data['level_name'],
				data['level_version'],
				data['uidsArray'],
				data['ranksArray'],
				data['total'],
				data['top']
			)
		}

		_StoreHighScores(data) {
			this.airConsole.storeHighScore(
				data['level_name'],
				data['level_version'],
				data['score'],
				data['uidArray'],
				data['data'],
				data['score_string']
			)
		}

		_SetActivePlayers(maxPlayers) {
			this.airConsole.setActivePlayers(maxPlayers)
		}

		_ShowAd() {
			this.airConsole.showAd()
		}

		_NavigateHome() {
			this.airConsole.navigateHome()
		}

		_NavigateTo(url) {
			this.airConsole.navigateTo(url)
		}

		_RequestPersistentData(uidsArray) {
			this.airConsole.requestPersistentData(uidsArray)
		}

		_StorePersistentData(data) {
			this.airConsole.storePersistentData(
				data['key'],
				data['value'],
				data['uid']
			)
		}

		_EditProfile() {
			this.airConsole.editProfile()
		}

		_SetOrientation(orientation) {
			this.airConsole.setOrientation((orientation === 1) ? this.airConsole.ORIENTATION_PORTRAIT : this.airConsole.ORIENTATION_LANDSCAPE)
		}

		_GetPremium() {
			this.airConsole.getPremium()
		}

		_Vibrate(time) {
			this.airConsole.vibrate(time)
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
			let runningOffline = true
			if (typeof AirConsole !== 'undefined' && window.location.href.indexOf('preview.construct.net') === -1) {
				runningOffline = false
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
				this.airConsole = new AIRCONSOLE_MOCKUP()
			}

			if (this.isController) {
				this.airConsole.onReady = function () {
					this.airConsole.message(AirConsole.SCREEN, {
						handshake: true
					})
				}
			}

			this.airConsole.onConnect = function (deviceId) {
				if (this.airConsole.getControllerDeviceIds().length > this.maxPlayers) {
					this.PostToRuntime('OnTooManyPlayers')
				} else {
					this.PostToRuntime('OnConnect', {'deviceId': deviceId})
				}
			}

			this.airConsole.onDisconnect = function (deviceId) {
				this.PostToRuntime('onDisconnect')
				this.PostToRuntime('onDeviceDisconnect', {'deviceId': deviceId})
			}

			this.airConsole.onMessage = function (deviceId, data) {
				if (data) {
					let payload = {'deviceId': deviceId, 'message': data}
					this.PostToRuntime('onMessage', payload)
					this.PostToRuntime('onMessageFrom', payload)
					this.PostToRuntime('onMessageIs', payload)
					this.PostToRuntime('onMessageFromIs', payload)
					this.PostToRuntime('onMessageHasProperty', payload)
				}
			}

			this.airConsole.onDeviceStateChange = function (deviceId, data) {
			}

			this.airConsole.onCustomDeviceStateChange = function (deviceId, customData) {
				this.PostToRuntime('onCustomDeviceStateChange', {'deviceId': deviceId, 'customData': customData})
			}

			this.airConsole.onHighscores = function (highscores) {
				if (highscores) {
					this.PostToRuntime('onHighscores', {'highscores': highscores})
				}
			}

			this.airConsole.onHighscoreStored = function (highscores) {
				if (highscores) {
					this.PostToRuntime('onHighscoreStored', {'highscores': highscores})
				}
			}

			this.airConsole.onAdComplete = function (adWasShown) {
				this.PostToRuntime('onAdComplete', {'adWasShown': adWasShown})
			}

			this.airConsole.onAdShow = function () {
				this.PostToRuntime('onAdShow')
			}

			this.airConsole.onPremium = function (deviceId) {
				this.PostToRuntime('onPremium', {'deviceId': deviceId})
			}

			this.airConsole.onPersistentDataLoaded = function (data) {
				if (data) {
					this.PostToRuntime('onPersistentDataLoaded', {'persistentData': data})
				}
			}

			this.airConsole.onPersistentDataStored = function (uid) {
				this.PostToRuntime('onPersistentDataStored')
			}

			this.airConsole.onDeviceProfileChange = function (deviceId) {
				this.PostToRuntime('onDeviceProfileChange', {'deviceId': deviceId})
			}

			this.airConsole.onDeviceMotion = function (data) {
				this.PostToRuntime('onDeviceMotion', {'motionData': data})
			}

			console.log('AirConsole initialization success')
			return {
				'runningOffline': runningOffline
			}
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
