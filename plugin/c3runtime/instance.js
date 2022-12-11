const C3 = self.C3
const DOM_COMPONENT_ID = 'C3AirConsole'

C3.Plugins.AirConsole.Instance = class AirConsoleInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID)
		this.conditions = C3.Plugins.AirConsole.Cnds

		let me = this
		this.AddDOMMessageHandlers([
			['onDisconnect', e => this._OnDisconnect(me, e)]
		])

		this._StartAirConsole(properties)
	}

	_StartAirConsole(properties) {
		console.log('Starting AirConsole')
		this.PostToDOMAsync('initAirconsole', properties)
	}

	_OnDisconnect(inst, data) {
		console.log('messaged')
		inst.Trigger(inst.conditions.OnDisconnect)
	}
}
