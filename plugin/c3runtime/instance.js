const C3 = self.C3
const DOM_COMPONENT_ID = 'C3AirConsole'

C3.Plugins.AirConsole.Instance = class AirConsoleInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID)

		this.AddDOMMessageHandlers([
			['onDisconnect', this._OnDisconnect]
		])

		this._StartAirConsole(properties)
		this.Trigger(C3.Plugins.AirConsole.Cnds.OnDisconnect)
	}

	_StartAirConsole(properties) {
		console.log('Starting AirConsole')
		this.PostToDOMAsync('initAirconsole', properties)
	}

	_OnDisconnect(data) {
		this.Trigger(C3.Plugins.AirConsole.Cnds.OnDisconnect)
	}
}
