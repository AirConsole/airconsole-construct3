const SDK = self.SDK

const PLUGIN_CLASS = SDK.Plugins.AirConsole

PLUGIN_CLASS.Type = class AirConsoleType extends SDK.ITypeBase {
	constructor(sdkPlugin, iObjectType) {
		super(sdkPlugin, iObjectType)
	}
}
