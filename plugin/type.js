"use strict";

{
	const PLUGIN_CLASS = SDK.Plugins.C3AirConsole;
	
	PLUGIN_CLASS.Type = class C3AirConsole extends SDK.ITypeBase
	{
		constructor(sdkPlugin, iObjectType)
		{
			super(sdkPlugin, iObjectType);
		}
	};
}