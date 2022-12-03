const C3 = self.C3

C3.Plugins.AirConsole.Instance = class AirConsoleInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst)

		this.airConsole = null
		this.gameReady = false
		this.maxPlayers = 0
		this.isController = false
		this.useTranslation = false
		this.orientation = 'portrait'
		this.syncTime = false
		this.deviceMotion = 0

		if (properties) {
			this.maxPlayers = properties[0]
			this.isController = properties[1]
			this.useTranslation = properties[2]
			this.orientation = properties[3]
			this.syncTime = properties[4]
			this.deviceMotion = properties[5]
		}
		this.InitAirConsole()
	}

	InitAirConsole() {
		if (typeof AirConsole !== 'undefined') {
			if (this.isController === 1) {
				let config = {
					orientation:      this.orientation === 0 ? AirConsole.ORIENTATION_LANDSCAPE : AirConsole.ORIENTATION_PORTRAIT,
					synchronize_time: this.syncTime,
					setup_document:   true,
					device_motion:    this.deviceMotion,
					translation:      this.useTranslation
				}
				this.airConsole = AirConsole(config)
			} else {
				this.airConsole = AirConsole()
			}
			this.gameReady = true
			console.log('AirConsole init')
		} else {
			console.log('AirConsole API not loaded')
		}
	}

	Release() {
		super.Release()
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

	SaveToJson() {
		return {}
	}

	LoadFromJson(o) {
	}
}
