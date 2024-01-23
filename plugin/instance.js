const SDK = self.SDK
const PLUGIN_CLASS = SDK.Plugins.ndream_AirConsole

PLUGIN_CLASS.Instance = class ndream_AirConsoleInstance extends SDK.IInstanceBase {
	constructor(sdkType, inst) {
		super(sdkType, inst)
	}

	Release() {
	}

	OnCreate() {
	}

	OnPropertyChanged(id, value) {
	}

	LoadC2Property(name, valueString) {
		return false		// not handled
	}
}

