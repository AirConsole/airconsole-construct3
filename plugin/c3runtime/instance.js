const C3 = self.C3
const DOM_COMPONENT_ID = 'C3AirConsole'

C3.Plugins.AirConsole.Instance = class AirConsoleInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID)

		this.AddDOMMessageHandler('onDisconnect', this._OnDisconnect)

		this.StartAirConsole(properties)
	}

	StartAirConsole(properties) {
		console.log('Starting AirConsole')
		let config = {
			max_players:			properties[0],
			is_controller: 		properties[1],
			translation:      properties[2],
			orientation:      properties[3] === 0 ? 'landscape' : 'portrait',
			synchronize_time: properties[4],
			setup_document:   true,
			device_motion:    properties[5]
		}
		//this.airConsole = this.CreateElement(config)
		this.PostToDOMAsync('initAirconsole', config)
	}

	_OnDisconnect(data) {
		this.Trigger(C3.Plugins.AirConsole.Cnds.OnDisconnect)
	}

	Release() {
		super.Release()
	}

	SaveToJson() {
		return {}
	}

	LoadFromJson(o) {
	}
}

// Script interface. Use a WeakMap to safely hide the internal implementation details from the
// caller using the script interface.
const map = new WeakMap()

self.IMyDOMMessagingInstance = class IMyDOMMessagingInstance extends self.IInstance {
	constructor() {
		super()

		// Map by SDK instance
		map.set(this, self.IInstance._GetInitInst().GetSdkInstance())
	}

	get testProperty() {
		return map.get(this)._GetTestProperty()
	}

	// Example setter/getter property on script interface
	set testProperty(n) {
		map.get(this)._SetTestProperty(n)
	}
}
