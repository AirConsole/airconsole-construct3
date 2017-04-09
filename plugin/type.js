"use strict";

{
	const PLUGIN_CLASS = SDK.Plugins.AirConsole;
	
	PLUGIN_CLASS.Type = class AirConsole extends SDK.ITypeBase
	{
		constructor(sdkPlugin, iObjectType)
		{
			super(sdkPlugin, iObjectType);
		}
	};
}