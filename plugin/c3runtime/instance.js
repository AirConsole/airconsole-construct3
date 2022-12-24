const C3 = self.C3
const DOM_COMPONENT_ID = 'ndream_AirConsole'

C3.Plugins.ndream_AirConsole.Instance = class ndream_AirConsoleInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID)

		this.AddDOMMessageHandlers([
			['onDisconnect', data => this._OnDisconnect()],
			['onDeviceDisconnect', data => this._OnDeviceDisconnect(data)],
			['OnTooManyPlayers', data => this._OnTooManyPlayers()],
			['onConnect', data => this._OnConnect(data)],
			['onMessage', data => this._OnMessage(data)],
			['onMessageFrom', data => this._OnMessageFrom(data)],
			['onMessageIs', data => this._OnMessageIs(data)],
			['onMessageFromIs', data => this._OnMessageFromIs(data)],
			['onMessageHasProperty', data => this._OnMessageHasProperty(data)],
			['onCustomDeviceStateChange', data => this._OnCustomDeviceStateChange(data)],
			['onHighscores', data => this._OnHighscores(data)],
			['onHighscoreStored', data => this._OnHighscoreStored(data)],
			['onAdComplete', data => this._OnAdComplete(data)],
			['onAdShow', data => this._OnAdShow()],
			['onPremium', data => this._OnPremium(data)],
			['onPersistentDataLoaded', data => this._OnPersistentDataLoaded(data)],
			['onPersistentDataStored', data => this._OnPersistentDataStored()],
			['onDeviceProfileChange', data => this._OnDeviceProfileChange(data)],
			['onDeviceMotion', data => this._OnDeviceMotion(data)]
		])

		this.properties = properties
		this.gameReady = false
		this.runningOffline = true

		// noinspection DuplicatedCode
		this.maxPlayers = properties[0]
		this.isController = properties[1]
		this.useTranslation = properties[2]
		this.orientation = properties[3]
		this.syncTime = properties[4]
		this.deviceMotion = properties[5]

		this.deviceId = null
		this.message = null
		this.adCompleted = false
		this.adShowing = false
		this.persistentData = null
		this.highscores = null
		this.emailAddress = null
		this.customData = null
		this.presetMessage = {}
		this.motionData = {}

		this._runtime.AddLoadPromise(
			this.PostToDOMAsync('initAirConsole', properties).then(data => {
				this.gameReady = true
				this.runningOffline = data['runningOffline']
			}).catch(r => {
				console.warn('Initializing AirConsole failed')
				this.gameReady = false
			})
		)
	}

	Release() {
		super.Release()
	}

	_OnDisconnect() {
		if (!this.gameReady) return
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnDisconnect)
	}

	_OnDeviceDisconnect(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnDeviceDisconnect)
	}

	_OnTooManyPlayers() {
		if (!this.gameReady) return
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnTooManyPlayers)
	}

	_OnConnect(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnConnect)
	}

	_OnMessage(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.message = data['message']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnMessage)
	}

	_OnMessageFrom(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.message = data['message']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnMessageFrom)
	}

	_OnMessageIs(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.message = data['message']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnMessageIs)
	}

	_OnMessageFromIs(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.message = data['message']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnMessageFromIs)
	}

	_OnMessageHasProperty(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.message = data['message']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnMessageHasProperty)
	}

	_OnCustomDeviceStateChange(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.customData = data['customData']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnCustomDeviceStateChange)
	}

	_OnHighscores(data) {
		if (!this.gameReady) return
		this.highscores = data['highscores']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnHighScores)
	}

	_OnHighscoreStored(data) {
		if (!this.gameReady) return
		this.highscores = data['highscores']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnHighScoreStored)
	}

	_OnAdComplete(data) {
		if (!this.gameReady) return
		this.adCompleted = (data['adWasShown']) ? 1 : 0
		this.adShowing = 0
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnAdComplete)
	}

	_OnAdShow() {
		if (!this.gameReady) return
		this.adShowing = 1
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnAdShow)
	}

	_OnPremium(data) {
		if (!this.gameReady) return
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnPremium)
	}

	_OnPersistentDataLoaded(data) {
		if (!this.gameReady) return
		this.persistentData = data['persistentData']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnPersistentDataLoaded)
	}

	_OnPersistentDataStored() {
		if (!this.gameReady) return
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnPersistentDataStored)
	}

	_OnDeviceProfileChange(data) {
		if (!this.gameReady) return
		this.deviceId = data['deviceId']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnDeviceProfileChange)
	}

	_OnDeviceMotion(data) {
		if (!this.gameReady) return
		this.motionData = data['motionData']
		this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnDeviceMotion)
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
