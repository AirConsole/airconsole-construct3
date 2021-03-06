"use strict";

{
	////////////////////////////////////////////
	// The plugin ID is how Construct identifies different kinds of plugins.
	// *** NEVER CHANGE THE PLUGIN ID! ***
	// If you change the plugin ID after releasing the plugin, Construct will think it is an entirely different
	// plugin and assume it is incompatible with the old one, and YOU WILL BREAK ALL EXISTING PROJECTS USING THE PLUGIN.
	// Only the plugin name is displayed in the editor, so to rename your plugin change the name but NOT the ID.
	// If you want to completely replace a plugin, make it deprecated (it will be hidden but old projects keep working),
	// and create an entirely new plugin with a different plugin ID.
	const PLUGIN_ID = "AirConsole2";
	////////////////////////////////////////////
	
	const PLUGIN_VERSION = "1.7.0.1";
	const PLUGIN_CATEGORY = "web";
	
	let app = null;
	
	const PLUGIN_CLASS = SDK.Plugins.C3AirConsole = class C3AirConsole extends SDK.IPluginBase
	{
		constructor()
		{
			super(PLUGIN_ID);
			
			SDK.Lang.PushContext("plugins.airconsole2");
			
			this._info.SetName(lang(".name"));
			this._info.SetDescription(lang(".description"));
			this._info.SetVersion(PLUGIN_VERSION);
			this._info.SetCategory(PLUGIN_CATEGORY);
			this._info.SetAuthor("Psychokiller1888");
			this._info.SetHelpUrl(lang(".help-url"));
			this._info.SetIsSingleGlobal(true);
			
			SDK.Lang.PushContext(".properties");
			
			this._info.SetProperties([
				new SDK.PluginProperty("integer", "max-players", 4),
				new SDK.PluginProperty("check", "is-controller", false),
				new SDK.PluginProperty("group", "controller-only"),
				new SDK.PluginProperty("combo", "orientation", {initialValue: "landscape", items: ["landscape", "portrait"]}),
				new SDK.PluginProperty("check", "synchronize-time", false),
				new SDK.PluginProperty("integer", "device-motion", 0)
			]);
			
			SDK.Lang.PopContext();		// .properties
			
			SDK.Lang.PopContext();
		}
	};
	
	PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS);
}