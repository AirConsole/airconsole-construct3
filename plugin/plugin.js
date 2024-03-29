const SDK = self.SDK
const PLUGIN_ID = 'ndream_AirConsole'
const PLUGIN_VERSION = '1.8.0.1'
const PLUGIN_CATEGORY = 'web'
const API_URL = 'https://www.airconsole.com/api/airconsole-1.8.0.js'

const PLUGIN_CLASS = SDK.Plugins.ndream_AirConsole = class ndream_AirConsole extends SDK.IPluginBase {
	constructor() {
		super(PLUGIN_ID)

		SDK.Lang.PushContext('plugins.' + PLUGIN_ID.toLowerCase())

		this._info.SetName(self.lang('.name'))
		this._info.SetDescription(self.lang('.description'))
		this._info.SetVersion(PLUGIN_VERSION)
		this._info.SetCategory(PLUGIN_CATEGORY)
		this._info.SetAuthor('Psychokiller1888')
		this._info.SetHelpUrl(self.lang('.help-url'))
		this._info.SetIsSingleGlobal(true)
		this._info.AddRemoteScriptDependency(API_URL)
		this._info.SetDOMSideScripts(['c3runtime/domSide.js'])

		SDK.Lang.PushContext('.properties')

		this._info.SetProperties([
			new SDK.PluginProperty('integer', 'max-players', 4),
			new SDK.PluginProperty('check', 'is-controller', false),
			new SDK.PluginProperty('check', 'use-translations', false),
			new SDK.PluginProperty('group', 'controller-only'),
			new SDK.PluginProperty('combo', 'orientation', {
				initialValue: 'landscape',
				items:        ['landscape', 'portrait']
			}),
			new SDK.PluginProperty('check', 'synchronize-time', false),
			new SDK.PluginProperty('integer', 'device-motion', 0)])

		SDK.Lang.PopContext()
	}
}

PLUGIN_CLASS.Register(PLUGIN_ID, PLUGIN_CLASS)

