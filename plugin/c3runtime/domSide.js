'use strict'

{
	const DOM_COMPONENT_ID = 'ndream_AirConsole'

	const HANDLER_CLASS = class ndream_AirConsoleDOMHandler extends self.DOMHandler {
		constructor(iRuntime) {
			super(iRuntime, DOM_COMPONENT_ID)

			this.AddRuntimeMessageHandlers([
				//['initAirConsole', data => this._OnInitAirconsole(data)],
				['loadProperties', data => this._LoadProperties(data)],
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
				['getProfilePicture', data => this._GetProfilePicture(data)],
				['getProfilePictureWithSize', data => this._GetProfilePictureWithSize(data)],
				['getNickname', data => this._GetNickname(data)],
				['getUID', data => this._GetUID(data)],
				['getMasterControllerDeviceId', _ => this._GetMasterControllerDeviceId()],
				['convertPlayerNumberToDeviceId', data => this._ConvertPlayerNumberToDeviceId(data)],
				['convertDeviceIdToPlayerNumber', data => this._ConvertDeviceIdToPlayerNumber(data)],
				['getActivePlayerDeviceIds', _ => this._GetActivePlayerDeviceIds()],
				['getLanguage', data => this._GetLanguage(data)],
				['getTranslation', data => this._GetTranslation(data)],
				['getDeviceId', _ => this._GetDeviceId()],
				['startAirConsole', _ => this._OnInitAirconsole()],
			])

			this.airConsole = null
			this.maxPlayers = null
			this.isController = null
			this.useTranslation = null
			this.orientation = null
			this.syncTime = null
			this.deviceMotion = null
			this.airconsoleStarted = false
		}

		_LoadProperties(properties) {
			// noinspection DuplicatedCode
			this.maxPlayers = properties[0]
			this.isController = properties[1]
			this.useTranslation = properties[2]
			this.orientation = properties[3]
			this.syncTime = properties[4]
			this.deviceMotion = properties[5]
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

		_GetProfilePicture(deviceId) {
			return this.airConsole.getProfilePicture(deviceId) || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?f=y'
		}

		_GetProfilePictureWithSize(data) {
			return this.airConsole.getProfilePicture(data['deviceId'], data['pictureSize']) || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?f=y'
		}

		_GetNickname(deviceId) {
			return this.airConsole.getNickname(deviceId) || 'Nickname not found'
		}

		_GetUID(deviceId) {
			return this.airConsole.getUID(deviceId) || 'Unknown UID'
		}

		_GetMasterControllerDeviceId() {
			const id = this.airConsole.getMasterControllerDeviceId()
			return (typeof id !== 'number' || isNaN(id)) ? -1 : id
		}

		_ConvertPlayerNumberToDeviceId(playerNumber) {
			const id = this.airConsole.convertPlayerNumberToDeviceId(playerNumber)
			return (typeof id !== 'number') ? -1 : id
		}

		_ConvertDeviceIdToPlayerNumber(deviceId) {
			const playerNumber = this.airConsole.convertDeviceIdToPlayerNumber(deviceId)
			return (typeof playerNumber !== 'number') ? -1 : playerNumber
		}

		_GetActivePlayerDeviceIds() {
			let arr = this.airConsole.getActivePlayerDeviceIds()

			let c3array = {}
			c3array['c3array'] = true
			c3array['size'] = [arr.length, 1, 1]
			let data = []
			for (let i in arr) {
				data.push([[arr[i]]])
			}
			c3array['data'] = data
			return JSON.stringify(c3array)
		}

		_GetLanguage(deviceId) {
			return this.airConsole.getLanguage(deviceId) || 'en-US'
		}

		_GetTranslation(data) {
			return this.airConsole.getTranslation(data['id'], data['values']) || ''
		}

		_GetDeviceId() {
			return this.airConsole.getDeviceId()
		}

		_OnInitAirconsole() {
			console.log('Initializing AirConsole')

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
				return -1
			}
			this.convertDeviceIdToPlayerNumber = function () {
				console.log('AirConsole mock-up: Converting device id to player number')
				return -1
			}
		}
	}
	self.RuntimeInterface.AddDOMHandlerClass(HANDLER_CLASS)
}
