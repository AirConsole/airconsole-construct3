'use strict';

{
	const C3 = self.C3
	const DOM_COMPONENT_ID = 'ndream_AirConsole'

	C3.Plugins.ndream_AirConsole.Instance = class ndream_AirConsoleInstance extends C3.SDKInstanceBase {
		constructor(inst, properties) {
			super(inst, DOM_COMPONENT_ID)

			this.AddDOMMessageHandlers([
				['onDisconnect', e => this._OnDisconnect(e)]
			])

			this._StartAirConsole(properties)
		}

		Release() {
			super.Release()
		}

		_StartAirConsole(properties) {
			console.log('Starting AirConsole')
			this.PostToDOMAsync('initAirconsole', properties)
		}

		_OnDisconnect(e) {
			console.log(e)
			this.Trigger(C3.Plugins.ndream_AirConsole.Cnds.OnDisconnect)
		}
	}
}
