const C3 = self.C3
const DOM_COMPONENT_ID = 'AirConsole'

C3.Plugins.AirConsole.Instance = class AirConsoleInstance extends C3.SDKDOMInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID)

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
		this.StartAirConsole()
	}

	StartAirConsole() {
		console.log('Starting AirConsole')
		let config = {
			orientation:      this.orientation === 0 ? 'landscape' : 'portrait',
			synchronize_time: this.syncTime,
			setup_document:   true,
			device_motion:    this.deviceMotion,
			translation:      this.useTranslation
		}
		this.airConsole = this.InitAirConsole(config)
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
