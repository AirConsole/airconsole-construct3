const C3 = self.C3
const DOM_COMPONENT_ID = 'C3AirConsole'
let me
let conditions

C3.Plugins.AirConsole.Instance = class AirConsoleInstance extends C3.SDKInstanceBase {
	constructor(inst, properties) {
		super(inst, DOM_COMPONENT_ID)
		me = this.GetRuntime()
		conditions = this.GetPlugin().constructor.Cnds
		this.AddDOMMessageHandlers([
			['onDisconnect', this._OnDisconnect]
		])
		this._StartAirConsole(properties)
		me.Trigger(conditions.OnDisconnect)
	}

	_StartAirConsole(properties) {
		console.log('Starting AirConsole')
		this.PostToDOMAsync('initAirconsole', properties)
	}

	_OnDisconnect(data) {
		console.log('messaged')
		me.Trigger(C3.Plugins.AirConsole.Cnds.OnDisconnect)
	}
}
