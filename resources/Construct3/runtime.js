'use strict'
const C3 = self.C3
const C3Debugger = self.C3Debugger
const assert = self.assert
const DEFAULT_RUNTIME_OPTS = {'messagePort': null, 'runtimeBaseUrl': '', 'headless': false, 'hasDom': true, 'isInWorker': false, 'useAudio': true, 'projectData': '', 'exportType': ''}
let ife = true
C3.Runtime = class C3Runtime extends C3.DefendedBase {
	constructor(opts) {
		opts = Object.assign({}, DEFAULT_RUNTIME_OPTS, opts)
		super()
		this._messagePort = opts['messagePort']
		this._runtimeBaseUrl = opts['runtimeBaseUrl']
		this._previewUrl = opts['previewUrl']
		this._isHeadless = !!opts['headless']
		this._hasDom = !!opts['hasDom']
		this._isInWorker = !!opts['isInWorker']
		ife = opts['ife']
		this._useAudio = !!opts['useAudio']
		this._exportType = opts['exportType']
		this._isiOSCordova = !!opts['isiOSCordova']
		this._isiOSWebView = !!opts['isiOSWebView']
		this._isFBInstantAvailable = !!opts['isFBInstantAvailable']
		this._opusWasmScriptUrl = opts['opusWasmScriptUrl']
		this._opusWasmBinaryUrl = opts['opusWasmBinaryUrl']
		this._isDebug = !!(this._exportType === 'preview' && opts['isDebug'])
		this._breakpointsEnabled = this._isDebug
		this._isDebugging = this._isDebug
		this._debuggingDisabled = 0
		this._additionalLoadPromises = []
		this._additionalCreatePromises = []
		this._isUsingCreatePromises = false
		this._projectName = ''
		this._projectVersion = ''
		this._projectUniqueId = ''
		this._appId =
			''
		this._originalViewportWidth = 0
		this._originalViewportHeight = 0
		this._devicePixelRatio = self.devicePixelRatio
		this._parallaxXorigin = 0
		this._parallaxYorigin = 0
		this._viewportWidth = 0
		this._viewportHeight = 0
		this._loaderStyle = 0
		this._usesLoaderLayout = false
		this._isLoading = true
		this._usesAnyBackgroundBlending = false
		this._usesAnyCrossSampling = false
		this._usesAnyDepthSampling = false
		this._loadingLogoAsset = null
		this._assetManager = C3.New(C3.AssetManager, this, opts)
		this._layoutManager = C3.New(C3.LayoutManager,
			this)
		this._eventSheetManager = C3.New(C3.EventSheetManager, this)
		this._pluginManager = C3.New(C3.PluginManager, this)
		this._collisionEngine = C3.New(C3.CollisionEngine, this)
		this._timelineManager = C3.New(C3.TimelineManager, this)
		this._transitionManager = C3.New(C3.TransitionManager, this)
		this._templateManager = C3.New(C3.TemplateManager, this)
		this._allObjectClasses = []
		this._objectClassesByName = new Map
		this._objectClassesBySid = new Map
		this._familyCount = 0
		this._allContainers = []
		this._allEffectLists = []
		this._currentLayoutStack =
			[]
		this._instancesPendingCreate = []
		this._instancesPendingDestroy = new Map
		this._hasPendingInstances = false
		this._isFlushingPendingInstances = false
		this._objectCount = 0
		this._nextUid = 0
		this._instancesByUid = new Map
		this._instancesToReleaseAtEndOfTick = new Set
		this._instancesToReleaseAffectedObjectClasses = new Set
		this._objectReferenceTable = []
		this._jsPropNameTable = []
		this._canvasManager = null
		this._uses3dFeatures = false
		this._framerateMode = 'vsync'
		this._compositingMode = 'standard'
		this._sampling = 'trilinear'
		this._isPixelRoundingEnabled = false
		this._needRender = true
		this._pauseOnBlur = false
		this._isPausedOnBlur = false
		this._exportToVideo = null
		this._tickCallbacks = {
			normal:        timestamp => {
				this._rafId = -1
				this._ruafId = -1
				this.Tick(timestamp)
			}, tickOnly:   timestamp => {
				this._ruafId = -1
				this.Tick(timestamp, false, 'skip-render')
			}, renderOnly: () => {
				this._rafId = -1
				this.Render()
			}
		}
		this._rafId = -1
		this._ruafId = -1
		this._tickCount = 0
		this._tickCountNoSave = 0
		this._hasStarted = false
		this._isInTick = false
		this._hasStartedTicking = false
		this._isLayoutFirstTick =
			true
		this._suspendCount = 0
		this._scheduleTriggersThrottle = new C3.PromiseThrottle(1)
		this._randomNumberCallback = () => Math.random()
		this._startTime = 0
		this._lastTickTime = 0
		this._dt1 = 0
		this._dt = 0
		this._timeScale = 1
		this._minimumFramerate = 30
		this._gameTime = C3.New(C3.KahanSum)
		this._gameTimeRaw = C3.New(C3.KahanSum)
		this._wallTime = C3.New(C3.KahanSum)
		this._instanceTimes = new Map
		this._fpsFrameCount = -1
		this._fpsLastTime = 0
		this._fps = 0
		this._mainThreadTimeCounter = 0
		this._mainThreadTime = 0
		this._isLoadingState = false
		this._saveToSlotName = ''
		this._loadFromSlotName = ''
		this._loadFromJson = null
		this._lastSaveJson = ''
		this._projectStorage = null
		this._savegamesStorage = null
		this._dispatcher = C3.New(C3.Event.Dispatcher)
		this._domEventHandlers = new Map
		this._pendingResponsePromises = new Map
		this._nextDomResponseId = 0
		this._didRequestDeviceOrientationEvent = false
		this._didRequestDeviceMotionEvent = false
		this._isReadyToHandleEvents = false
		this._waitingToHandleEvents = []
		this._eventObjects = {
			'pretick': C3.New(C3.Event, 'pretick', false),
			'tick':    C3.New(C3.Event, 'tick', false), 'tick2': C3.New(C3.Event, 'tick2', false), 'instancedestroy': C3.New(C3.Event, 'instancedestroy', false), 'beforelayoutchange': C3.New(C3.Event, 'beforelayoutchange', false), 'layoutchange': C3.New(C3.Event, 'layoutchange', false)
		}
		this._eventObjects['instancedestroy'].instance = null
		this._userScriptDispatcher = C3.New(C3.Event.Dispatcher)
		this._userScriptEventObjects = null
		this._behInstsToTick = C3.New(C3.RedBlackSet, C3.BehaviorInstance.SortByTickSequence)
		this._behInstsToPostTick =
			C3.New(C3.RedBlackSet, C3.BehaviorInstance.SortByTickSequence)
		this._behInstsToTick2 = C3.New(C3.RedBlackSet, C3.BehaviorInstance.SortByTickSequence)
		this._jobScheduler = C3.New(C3.JobSchedulerRuntime, this, opts['jobScheduler'])
		if (opts['canvas']) this._canvasManager = C3.New(C3.CanvasManager, this)
		this._messagePort.onmessage = e => this['_OnMessageFromDOM'](e.data)
		this.AddDOMComponentMessageHandler('runtime', 'visibilitychange', e => this._OnVisibilityChange(e))
		this.AddDOMComponentMessageHandler('runtime', 'opus-decode',
			e => this._WasmDecodeWebMOpus(e['arrayBuffer']))
		this.AddDOMComponentMessageHandler('runtime', 'get-remote-preview-status-info', () => this._GetRemotePreviewStatusInfo())
		this.AddDOMComponentMessageHandler('runtime', 'js-invoke-function', e => this._InvokeFunctionFromJS(e))
		this.AddDOMComponentMessageHandler('runtime', 'go-to-last-error-script', self['goToLastErrorScript'])
		this.AddDOMComponentMessageHandler('runtime', 'offline-audio-render-completed', e => this._OnOfflineAudioRenderCompleted(e))
		this._dispatcher.addEventListener('window-blur',
			e => this._OnWindowBlur(e))
		this._dispatcher.addEventListener('window-focus', () => this._OnWindowFocus())
		this._timelineManager.AddRuntimeListeners()
		this._templateManager.AddRuntimeListeners()
		this._iRuntime = null
		this._interfaceMap = new WeakMap
		this._commonScriptInterfaces = {keyboard: null, mouse: null, touch: null}
	}

	static Create(opts) {
		return C3.New(C3.Runtime, opts)
	}

	Release() {
		C3.clearArray(this._allObjectClasses)
		this._objectClassesByName.clear()
		this._objectClassesBySid.clear()
		this._layoutManager.Release()
		this._layoutManager = null
		this._eventSheetManager.Release()
		this._eventSheetManager = null
		this._pluginManager.Release()
		this._pluginManager = null
		this._assetManager.Release()
		this._assetManager = null
		this._collisionEngine.Release()
		this._collisionEngine = null
		this._timelineManager.Release()
		this._timelineManager = null
		this._transitionManager.Release()
		this._transitionManager = null
		this._templateManager.Release()
		this._templateManager = null
		if (this._canvasManager) {
			this._canvasManager.Release()
			this._canvasManager =
				null
		}
		this._dispatcher.Release()
		this._dispatcher = null
		this._tickEvent = null
	}

	['_OnMessageFromDOM'](data) {
		const type = data['type']
		if (type === 'event') this._OnEventFromDOM(data) else if (type === 'result') this._OnResultFromDOM(data) else throw new Error(`unknown message '${type}'`)
	}

	_OnEventFromDOM(e) {
		if (!this._isReadyToHandleEvents) {
			this._waitingToHandleEvents.push(e)
			return
		}
		const component = e['component']
		const handler = e['handler']
		const data = e['data']
		const dispatchOpts = e['dispatchOpts']
		const dispatchRuntimeEvent =
			!!(dispatchOpts && dispatchOpts['dispatchRuntimeEvent'])
		const dispatchUserScriptEvent = !!(dispatchOpts && dispatchOpts['dispatchUserScriptEvent'])
		const responseId = e['responseId']
		if (component === 'runtime') {
			if (dispatchRuntimeEvent) {
				const event = new C3.Event(handler)
				event.data = data
				this._dispatcher.dispatchEventAndWaitAsyncSequential(event)
			}
			if (dispatchUserScriptEvent) {
				const event = new C3.Event(handler, true)
				for (const [key, value] of Object.entries(data)) event[key] = value
				this.DispatchUserScriptEvent(event)
			}
		}
		const handlerMap =
			this._domEventHandlers.get(component)
		if (!handlerMap) {
			if (!dispatchRuntimeEvent && !dispatchUserScriptEvent) console.warn(`[Runtime] No DOM event handlers for component '${component}'`)
			return
		}
		const func = handlerMap.get(handler)
		if (!func) {
			if (!dispatchRuntimeEvent && !dispatchUserScriptEvent) console.warn(`[Runtime] No DOM handler '${handler}' for component '${component}'`)
			return
		}
		let ret = null
		try {
			ret = func(data)
		} catch (err) {
			console.error(`Exception in '${component}' handler '${handler}':`, err)
			if (responseId !==
				null) this._PostResultToDOM(responseId, false, '' + err)
			return
		}
		if (responseId !== null) if (ret && ret.then) ret.then(result => this._PostResultToDOM(responseId, true, result)).catch(err => {
			console.error(`Rejection from '${component}' handler '${handler}':`, err)
			this._PostResultToDOM(responseId, false, '' + err)
		}) else this._PostResultToDOM(responseId, true, ret)
	}

	_PostResultToDOM(responseId, isOk, result) {
		this._messagePort.postMessage({'type': 'result', 'responseId': responseId, 'isOk': isOk, 'result': result})
	}

	_OnResultFromDOM(data) {
		const responseId =
			data['responseId']
		const isOk = data['isOk']
		const result = data['result']
		const pendingPromise = this._pendingResponsePromises.get(responseId)
		if (isOk) pendingPromise.resolve(result) else pendingPromise.reject(result)
		this._pendingResponsePromises.delete(responseId)
	}

	AddDOMComponentMessageHandler(component, handler, func) {
		let handlerMap = this._domEventHandlers.get(component)
		if (!handlerMap) {
			handlerMap = new Map
			this._domEventHandlers.set(component, handlerMap)
		}
		if (handlerMap.has(handler)) throw new Error(`[Runtime] Component '${component}' already has handler '${handler}'`)
		handlerMap.set(handler, func)
	}

	PostComponentMessageToDOM(component, handler, data, transfer) {
		this._messagePort.postMessage({'type': 'event', 'component': component, 'handler': handler, 'data': data, 'responseId': null}, transfer)
	}

	PostComponentMessageToDOMAsync(component, handler, data, transfer) {
		const responseId = this._nextDomResponseId++
		const ret = new Promise((resolve, reject) => {
			this._pendingResponsePromises.set(responseId, {resolve, reject})
		})
		this._messagePort.postMessage({
			'type': 'event', 'component': component, 'handler': handler,
			'data': data, 'responseId': responseId
		}, transfer)
		return ret
	}

	PostToDebugger(data) {
		if (!this.IsDebug()) throw new Error('not in debug mode')
		this.PostComponentMessageToDOM('runtime', 'post-to-debugger', data)
	}

	async Init(opts) {
		if (this.IsDebug()) await C3Debugger.Init(this) else if (self.C3Debugger) self.C3Debugger.InitPreview(this)
		const [o] = await Promise.all([this._assetManager.FetchJson('data.json'), this._MaybeLoadOpusDecoder(), this._jobScheduler.Init()])
		await this._LoadDataJson(o)
		await this._InitialiseCanvas(opts)
		if (!this.IsPreview()) console.info('Made with Construct, the game and app creator :: https://www.construct.net')
		if (this.GetWebGLRenderer()) {
			const webglRenderer = this.GetWebGLRenderer()
			console.info(`[C3 runtime] Hosted in ${this.IsInWorker() ? 'worker' : 'DOM'}, rendering with WebGL ${webglRenderer.GetWebGLVersionNumber()} [${webglRenderer.GetUnmaskedRenderer()}] (${webglRenderer.IsDesynchronized() ? 'desynchronized' : 'standard'} compositing)`)
		} else if (this.GetWebGPURenderer()) console.info(`[C3 runtime] Hosted in ${this.IsInWorker() ?
			'worker' : 'DOM'}, rendering with experimental WebGPU`)
		if (this.GetRenderer().HasMajorPerformanceCaveat()) console.warn('[C3 runtime] The renderer indicates a major performance caveat. Software rendering may be in use. This can result in significantly degraded performance.')
		this._isReadyToHandleEvents = true
		for (const e of this._waitingToHandleEvents) this._OnEventFromDOM(e)
		C3.clearArray(this._waitingToHandleEvents)
		if (this._canvasManager) this._canvasManager.StartLoadingScreen()
		for (const f of opts['runOnStartupFunctions']) this._additionalLoadPromises.push(this._RunOnStartupFunction(f))
		await Promise.all([this._assetManager.WaitForAllToLoad(), ...this._additionalLoadPromises])
		C3.clearArray(this._additionalLoadPromises)
		if (this._assetManager.HasHadErrorLoading()) {
			if (this._canvasManager) this._canvasManager.HideCordovaSplashScreen()
			return
		}
		if (this._canvasManager) await this._canvasManager.EndLoadingScreen()
		await this._dispatcher.dispatchEventAndWaitAsync(new C3.Event('beforeruntimestart'))
		await this.Start()
		this._messagePort.postMessage({'type': 'runtime-ready'})
		return this
	}

	async _RunOnStartupFunction(f) {
		try {
			await f(this._iRuntime)
		} catch (err) {
			console.error('[C3 runtime] Error in runOnStartup function: ',
				err)
		}
	}

	async _LoadDataJson(o) {
		const projectData = o['project']
		this._projectName = projectData[0]
		this._projectVersion = projectData[16]
		this._projectUniqueId = projectData[31]
		this._appId = projectData[38]
		const loadingLogoFilename = projectData[39] || 'loading-logo.png'
		this._isPixelRoundingEnabled = !!projectData[9]
		this._originalViewportWidth = this._viewportWidth = projectData[10]
		this._originalViewportHeight = this._viewportHeight = projectData[11]
		this._parallaxXorigin = this._originalViewportWidth / 2
		this._parallaxYorigin =
			this._originalViewportHeight / 2
		this._compositingMode = projectData[36]
		this._framerateMode = projectData[37]
		if (this._compositingMode === 'low-latency' && this.IsAndroidWebView() && C3.Platform.BrowserVersionNumber <= 77) {
			console.warn('[C3 runtime] Desynchronized (low-latency) compositing is enabled, but is disabled in the Android WebView <=77 due to crbug.com/1008842. Reverting to synchronized (standard) compositing.')
			this._compositingMode = 'standard'
		}
		this._uses3dFeatures = !!projectData[40]
		this._sampling = projectData[14]
		this._usesAnyBackgroundBlending = projectData[15]
		this._usesAnyCrossSampling = projectData[42]
		this._usesAnyDepthSampling = projectData[17]
		this._usesLoaderLayout = !!projectData[18]
		this._loaderStyle = projectData[19]
		this._nextUid = projectData[21]
		this._pauseOnBlur = projectData[22]
		const assetManager = this._assetManager
		assetManager._SetFileStructure(projectData[45])
		assetManager._SetAudioFiles(projectData[7], projectData[25])
		assetManager._SetMediaSubfolder(projectData[8])
		assetManager._SetFontsSubfolder(projectData[32])
		assetManager._SetIconsSubfolder(projectData[28])
		assetManager._SetWebFonts(projectData[29])
		if (this._loaderStyle === 0) {
			let url = ''
			if (this.IsPreview()) {
				if (assetManager._HasLocalUrlBlob(loadingLogoFilename)) url = assetManager.GetLocalUrlAsBlobUrl(loadingLogoFilename)
			} else if (assetManager.GetFileStructure() === 'flat') url = assetManager.GetIconsSubfolder() + loadingLogoFilename else url = loadingLogoFilename
			if (url) this._loadingLogoAsset = assetManager.LoadImage({url})
		}
		if (this._canvasManager) {
			this._canvasManager.SetFullscreenMode(C3.CanvasManager._FullscreenModeNumberToString(projectData[12]))
			this._canvasManager.SetFullscreenScalingQuality(projectData[23] ? 'high' : 'low')
			this._canvasManager.SetMipmapsEnabled(projectData[24] !== 0)
			this._canvasManager._SetGPUPowerPreference(projectData[34])
			this._canvasManager._SetTextureAnisotropy(projectData[41])
			this._canvasManager._SetWebGPUEnabled(projectData[13])
			this._canvasManager._SetZAxisScale(projectData[30])
			this._canvasManager._SetFieldOfView(projectData[26])
		}
		const exportToVideoOpts = projectData[43]
		if (exportToVideoOpts) await this._LoadExportToVideoData(exportToVideoOpts)
		this._pluginManager.CreateSystemPlugin()
		this._objectReferenceTable = self.C3_GetObjectRefTable()
		for (const pluginData of projectData[2]) this._pluginManager.CreatePlugin(pluginData)
		this._objectReferenceTable = self.C3_GetObjectRefTable()
		this._LoadJsPropNameTable()
		for (const objectClassData of projectData[3]) {
			const objectClass = C3.ObjectClass.Create(this, this._allObjectClasses.length, objectClassData)
			this._allObjectClasses.push(objectClass)
			this._objectClassesByName.set(objectClass.GetName().toLowerCase(),
				objectClass)
			this._objectClassesBySid.set(objectClass.GetSID(), objectClass)
		}
		for (const familyData of projectData[4]) {
			const familyType = this._allObjectClasses[familyData[0]]
			familyType._LoadFamily(familyData)
		}
		for (const containerData of projectData[27]) {
			const containerTypes = containerData.map(index => this._allObjectClasses[index])
			this._allContainers.push(C3.New(C3.Container, this, containerTypes))
		}
		for (const objectClass of this._allObjectClasses) objectClass._OnAfterCreate()
		for (const layoutData of projectData[5]) this._layoutManager.Create(layoutData)
		const firstLayoutName = projectData[1]
		if (firstLayoutName) {
			const firstLayout = this._layoutManager.GetLayoutByName(firstLayoutName)
			if (firstLayout) this._layoutManager.SetFirstLayout(firstLayout)
		}
		for (const timelineData of projectData[33]) this._timelineManager.Create(timelineData)
		for (const transitionData of projectData[35]) this._transitionManager.Create(transitionData)
		for (const templateInstanceData of projectData[44]) this._templateManager.Create(templateInstanceData)
		if (!this._templateManager.HasTemplates()) {
			this._templateManager.Release()
			this._templateManager = null
		}
		this._InitScriptInterfaces()
		for (const eventSheetData of projectData[6]) this._eventSheetManager.Create(eventSheetData)
		this._eventSheetManager._PostInit()
		this._InitGlobalVariableScriptInterface()
		C3.clearArray(this._objectReferenceTable)
		this.FlushPendingInstances()
		let targetOrientation = 'any'
		const orientations = projectData[20]
		if (orientations === 1) targetOrientation = 'portrait' else if (orientations === 2) targetOrientation = 'landscape'
		this.PostComponentMessageToDOM('runtime',
			'set-target-orientation', {'targetOrientation': targetOrientation})
	}

	async _LoadExportToVideoData(exportToVideoOpts) {
		const format = exportToVideoOpts['format']
		if (format === 'image-sequence') this._exportToVideo = new self.C3ExportToImageSequence(this, exportToVideoOpts) else if (format === 'image-sequence-gif') this._exportToVideo = new self.C3ExportToGIF(this, exportToVideoOpts) else if (format === 'webm') this._exportToVideo = new self.C3ExportToWebMVideo(this, exportToVideoOpts) else if (format === 'mp4') this._exportToVideo =
			new self.C3ExportToMP4Video(this, exportToVideoOpts) else
		this._framerateMode = 'unlimited-frame'
		this._canvasManager.SetFullscreenMode('off')
		this._devicePixelRatio = 1
		self.devicePixelRatio = 1
		await this.PostComponentMessageToDOMAsync('runtime', 'set-exporting-to-video', {'message': this._exportToVideo.GetExportingMessageForPercent(0), 'duration': this._exportToVideo.GetDuration()})
	}

	GetLoaderStyle() {
		return this._loaderStyle
	}

	IsExportToVideo() {
		return this._exportToVideo !== null
	}

	GetExportVideoDuration() {
		return this._exportToVideo.GetDuration()
	}

	GetExportVideoFramerate() {
		return this._exportToVideo.GetFramerate()
	}

	_InitExportToVideo() {
		return this._exportToVideo.Init({
			width:  this._canvasManager.GetDeviceWidth(),
			height: this._canvasManager.GetDeviceHeight()
		})
	}

	_ExportToVideoAddFrame() {
		const time = this._tickCount / this.GetExportVideoFramerate()
		return this._exportToVideo.AddFrame(this._canvasManager.GetCanvas(), time)
	}

	_ExportToVideoAddKeyframe() {
		if (this._exportToVideo) this._exportToVideo.AddKeyframe()
	}

	_OnOfflineAudioRenderCompleted(e) {
		this._exportToVideo.OnOfflineAudioRenderCompleted(e)
	}

	_ExportToVideoFinish() {
		return this._exportToVideo.Finish()
	}

	IsFBInstantAvailable() {
		return this._isFBInstantAvailable
	}

	IsLoading() {
		return this._isLoading
	}

	AddLoadPromise(promise) {
		this._additionalLoadPromises.push(promise)
	}

	SetUsingCreatePromises(e) {
		this._isUsingCreatePromises =
			!!e
	}

	AddCreatePromise(promise) {
		if (!this._isUsingCreatePromises) return
		this._additionalCreatePromises.push(promise)
	}

	GetCreatePromises() {
		return this._additionalCreatePromises
	}

	_GetNextFamilyIndex() {
		return this._familyCount++
	}

	GetFamilyCount() {
		return this._familyCount
	}

	_AddEffectList(el) {
		this._allEffectLists.push(el)
	}

	_GetAllEffectLists() {
		return this._allEffectLists
	}

	async _InitialiseCanvas(opts) {
		if (!this._canvasManager) return
		await this._canvasManager.CreateCanvas(opts)
		this._canvasManager.InitLoadingScreen(this._loaderStyle)
	}

	async _MaybeLoadOpusDecoder() {
		if (this._assetManager.IsAudioFormatSupported('audio/webm; codecs=opus')) return
		let wasmBlob = null
		let wasmBuffer = null
		try {
			if (this.IsiOSCordova() && this._assetManager.IsFileProtocol()) wasmBuffer = await this._assetManager.CordovaFetchLocalFileAsArrayBuffer(this._opusWasmBinaryUrl) else wasmBuffer = await this._assetManager.FetchArrayBuffer(this._opusWasmBinaryUrl)
		} catch (err) {
			console.info('Failed to fetch Opus decoder WASM; assuming project has no Opus audio.', err)
			return
		}
		if (wasmBuffer) this.AddJobWorkerBuffer(wasmBuffer, 'opus-decoder-wasm') else this.AddJobWorkerBlob(wasmBlob, 'opus-decoder-wasm')
		await this.AddJobWorkerScripts([this._opusWasmScriptUrl])
	}

	async _WasmDecodeWebMOpus(arrayBuffer) {
		const result = await this.AddJob('OpusDecode', {'arrayBuffer': arrayBuffer}, [arrayBuffer])
		return result
	}

	async Start() {
		this._hasStarted = true
		this._startTime = Date.now()
		if (this._usesLoaderLayout) {
			for (const objectClass of this._allObjectClasses) if (!objectClass.IsFamily() && !objectClass.IsOnLoaderLayout() && objectClass.IsWorldType()) objectClass.OnCreate()
			this._assetManager.WaitForAllToLoad().then(() => {
				this._isLoading =
					false
				this._OnLoadFinished()
			})
		} else this._isLoading = false
		this._assetManager.SetInitialLoadFinished()
		if (this.IsDebug()) C3Debugger.RuntimeInit(ife)
		for (const layout of this._layoutManager.GetAllLayouts()) layout._CreateGlobalNonWorlds()
		if (this.IsExportToVideo()) await this._InitExportToVideo()
		const firstLayout = this._layoutManager.GetFirstLayout()
		await firstLayout._Load(null, this.GetRenderer())
		await firstLayout._StartRunning(true)
		this._fpsLastTime = performance.now()
		if (!this._usesLoaderLayout) this._OnLoadFinished()
		const state = await this.PostComponentMessageToDOMAsync('runtime', 'before-start-ticking')
		if (state['isSuspended'] && !this.IsExportToVideo()) this._suspendCount++ else this.Tick()
	}

	_OnLoadFinished() {
		this.Trigger(C3.Plugins.System.Cnds.OnLoadFinished, null, null)
		this.PostComponentMessageToDOM('runtime', 'register-sw')
	}

	GetObjectReference(index) {
		index = Math.floor(index)
		const objRefTable = this._objectReferenceTable
		if (index < 0 || index >= objRefTable.length) throw new Error('invalid object reference')
		return objRefTable[index]
	}

	_LoadJsPropNameTable() {
		for (const entry of self.C3_JsPropNameTable) {
			const propName =
				C3.first(Object.keys(entry))
			this._jsPropNameTable.push(propName)
		}
	}

	GetJsPropName(index) {
		index = Math.floor(index)
		const jsPropNameTable = this._jsPropNameTable
		if (index < 0 || index >= jsPropNameTable.length) throw new Error('invalid prop reference')
		return jsPropNameTable[index]
	}

	HasDOM() {
		return this._hasDom
	}

	IsHeadless() {
		return this._isHeadless
	}

	IsInWorker() {
		return this._isInWorker
	}

	GetRuntimeBaseURL() {
		return this._runtimeBaseUrl
	}

	GetPreviewURL() {
		return this._previewUrl
	}

	GetEventSheetManager() {
		return this._eventSheetManager
	}

	GetEventStack() {
		return this._eventSheetManager.GetEventStack()
	}

	GetCurrentEventStackFrame() {
		return this._eventSheetManager.GetCurrentEventStackFrame()
	}

	GetCurrentEvent() {
		return this._eventSheetManager.GetCurrentEvent()
	}

	GetCurrentCondition() {
		return this._eventSheetManager.GetCurrentCondition()
	}

	IsCurrentConditionFirst() {
		return this.GetCurrentEventStackFrame().GetConditionIndex() ===
			0
	}

	GetCurrentAction() {
		return this._eventSheetManager.GetCurrentAction()
	}

	GetPluginManager() {
		return this._pluginManager
	}

	GetSystemPlugin() {
		return this._pluginManager.GetSystemPlugin()
	}

	GetObjectClassByIndex(i) {
		i = Math.floor(i)
		if (i < 0 || i >= this._allObjectClasses.length) throw new RangeError('invalid index')
		return this._allObjectClasses[i]
	}

	GetObjectClassByName(name) {
		return this._objectClassesByName.get(name.toLowerCase()) || null
	}

	GetObjectClassBySID(sid) {
		return this._objectClassesBySid.get(sid) || null
	}

	GetSingleGlobalObjectClassByCtor(ctor) {
		const plugin =
			this._pluginManager.GetPluginByConstructorFunction(ctor)
		if (!plugin) return null
		return plugin.GetSingleGlobalObjectClass()
	}

	GetAllObjectClasses() {
		return this._allObjectClasses
	}

	* allInstances() {
		for (const objectClass of this._allObjectClasses) {
			if (objectClass.IsFamily()) continue
			yield* objectClass.instances()
		}
	}

	Dispatcher() {
		return this._dispatcher
	}

	UserScriptDispatcher() {
		return this._userScriptDispatcher
	}

	DispatchUserScriptEvent(e) {
		e.runtime = this.GetIRuntime()
		const shouldTime = this.IsDebug() && !this._eventSheetManager.IsInEventEngine()
		if (shouldTime) C3Debugger.StartMeasuringScriptTime()
		this._userScriptDispatcher.dispatchEvent(e)
		if (shouldTime) C3Debugger.AddScriptTime()
	}

	DispatchUserScriptEventAsyncWait(e) {
		e.runtime = this.GetIRuntime()
		return this._userScriptDispatcher.dispatchEventAndWaitAsync(e)
	}

	GetOriginalViewportWidth() {
		return this._originalViewportWidth
	}

	GetOriginalViewportHeight() {
		return this._originalViewportHeight
	}

	SetOriginalViewportSize(w, h) {
		if (this._originalViewportWidth === w && this._originalViewportHeight === h) return
		this._originalViewportWidth =
			w
		this._originalViewportHeight = h
		const layoutManager = this.GetLayoutManager()
		layoutManager.SetAllLayerProjectionChanged()
		layoutManager.SetAllLayerMVChanged()
	}

	GetViewportWidth() {
		return this._viewportWidth
	}

	GetViewportHeight() {
		return this._viewportHeight
	}

	SetViewportSize(w, h) {
		if (this._viewportWidth === w && this._viewportHeight === h) return
		this._viewportWidth = w
		this._viewportHeight = h
		const layoutManager = this.GetLayoutManager()
		layoutManager.SetAllLayerProjectionChanged()
		layoutManager.SetAllLayerMVChanged()
	}

	_SetDevicePixelRatio(r) {
		if (this.IsExportToVideo()) return
		this._devicePixelRatio = r
	}

	GetDevicePixelRatio() {
		return this._devicePixelRatio
	}

	GetParallaxXOrigin() {
		return this._parallaxXorigin
	}

	GetParallaxYOrigin() {
		return this._parallaxYorigin
	}

	GetCanvasManager() {
		return this._canvasManager
	}

	GetDrawWidth() {
		if (!this._canvasManager) return this._viewportWidth
		return this._canvasManager.GetDrawWidth()
	}

	GetDrawHeight() {
		if (!this._canvasManager) return this._viewportHeight
		return this._canvasManager.GetDrawHeight()
	}

	GetRenderScale() {
		if (!this._canvasManager) return 1
		return this._canvasManager.GetRenderScale()
	}

	GetDisplayScale() {
		if (!this._canvasManager) return 1
		return this._canvasManager.GetDisplayScale()
	}

	GetEffectLayerScaleParam() {
		if (!this._canvasManager) return 1
		return this._canvasManager.GetEffectLayerScaleParam()
	}

	GetEffectDevicePixelRatioParam() {
		if (!this._canvasManager) return 1
		return this._canvasManager.GetEffectDevicePixelRatioParam()
	}

	GetCanvasClientX() {
		if (!this._canvasManager) return 0
		return this._canvasManager.GetCanvasClientX()
	}

	GetCanvasClientY() {
		if (!this._canvasManager) return 0
		return this._canvasManager.GetCanvasClientY()
	}

	GetCanvasCssWidth() {
		if (!this._canvasManager) return 0
		return this._canvasManager.GetCssWidth()
	}

	GetCanvasCssHeight() {
		if (!this._canvasManager) return 0
		return this._canvasManager.GetCssHeight()
	}

	GetFullscreenMode() {
		if (!this._canvasManager) return 'off'
		return this._canvasManager.GetFullscreenMode()
	}

	GetAdditionalRenderTarget(opts) {
		if (!this._canvasManager) return null
		return this._canvasManager.GetAdditionalRenderTarget(opts)
	}

	ReleaseAdditionalRenderTarget(renderTarget) {
		if (!this._canvasManager) return
		this._canvasManager.ReleaseAdditionalRenderTarget(renderTarget)
	}

	UsesAnyBackgroundBlending() {
		return this._usesAnyBackgroundBlending
	}

	UsesAnyCrossSampling() {
		return this._usesAnyCrossSampling
	}

	UsesAnyDepthSampling() {
		return this._usesAnyDepthSampling
	}

	GetGPUUtilisation() {
		if (!this._canvasManager) return NaN
		return this._canvasManager.GetGPUUtilisation()
	}

	IsLinearSampling() {
		return this.GetSampling() !== 'nearest'
	}

	GetFramerateMode() {
		return this._framerateMode
	}

	GetCompositingMode() {
		return this._compositingMode
	}

	GetSampling() {
		return this._sampling
	}

	UsesLoaderLayout() {
		return this._usesLoaderLayout
	}

	GetLoadingLogoAsset() {
		return this._loadingLogoAsset
	}

	ReleaseLoadingLogoAsset() {
		if (this._loadingLogoAsset) {
			this._loadingLogoAsset.Release()
			this._loadingLogoAsset = null
		}
	}

	GetLayoutManager() {
		return this._layoutManager
	}

	GetMainRunningLayout() {
		return this._layoutManager.GetMainRunningLayout()
	}

	GetTimelineManager() {
		return this._timelineManager
	}

	GetTransitionManager() {
		return this._transitionManager
	}

	GetTemplateManager() {
		return this._templateManager
	}

	GetAssetManager() {
		return this._assetManager
	}

	LoadImage(opts) {
		return this._assetManager.LoadImage(opts)
	}

	CreateInstance(objectClass,
								 layer, x, y, createHierarchy, templateName) {
		if (templateName && this._templateManager) {
			const templateData = this._templateManager.GetTemplateData(objectClass, templateName)
			if (templateData) {
				const inst = this.CreateInstanceFromData(templateData, layer, false, x, y, false, createHierarchy, undefined, createHierarchy)
				this._templateManager.MapInstanceToTemplateName(inst, templateName)
				return inst
			}
		}
		return this.CreateInstanceFromData(objectClass, layer, false, x, y, false, createHierarchy, undefined, createHierarchy)
	}

	CreateInstanceFromData(instData_or_objectClass,
												 layer, isStartupInstance, x, y, skipSiblings, createHierarchy, previousInstance, creatingHierarchy) {
		let instData = null
		let objectClass = null
		if (instData_or_objectClass instanceof C3.ObjectClass) {
			objectClass = instData_or_objectClass
			if (objectClass.IsFamily()) {
				const members = objectClass.GetFamilyMembers()
				const i = Math.floor(this.Random() * members.length)
				objectClass = members[i]
			}
			instData = objectClass.GetDefaultInstanceData()
		} else {
			instData = instData_or_objectClass
			objectClass = this.GetObjectClassByIndex(instData[1])
		}
		const isWorld =
			objectClass.GetPlugin().IsWorldType()
		if (this._isLoading && isWorld && !objectClass.IsOnLoaderLayout()) return null
		const originalLayer = layer
		if (!isWorld) layer = null
		let uid
		if (isStartupInstance && !skipSiblings && instData && !this._instancesByUid.has(instData[2])) uid = instData[2] else uid = this._nextUid++
		const worldData = instData ? instData[0] : null
		const inst = C3.New(C3.Instance, {runtime: this, objectType: objectClass, layer: layer, worldData, instVarData: instData ? instData[3] : null, uid: uid})
		this._instancesByUid.set(uid,
			inst)
		let wi = null
		if (isWorld) {
			wi = inst.GetWorldInfo()
			if (typeof x !== 'undefined' && typeof y !== 'undefined') {
				wi.SetX(x)
				wi.SetY(y)
			}
			objectClass._SetAnyCollisionCellChanged(true)
		}
		if (layer) {
			if (!creatingHierarchy) layer._AddInstance(inst, true)
			if (layer.GetParallaxX() !== 1 || layer.GetParallaxY() !== 1) objectClass._SetAnyInstanceParallaxed(true)
			layer.GetLayout().MaybeLoadTexturesFor(objectClass)
		}
		this._objectCount++
		let needsSiblingCreation = true
		if (previousInstance) {
			const previousObjectClass = previousInstance.GetObjectClass()
			if (previousObjectClass.IsInContainer() && objectClass.IsInContainer()) {
				const container = objectClass.GetContainer()
				const previousContainer = previousObjectClass.GetContainer()
				if (container === previousContainer) needsSiblingCreation = false
			}
		}
		if (objectClass.IsInContainer() && !isStartupInstance && !skipSiblings && needsSiblingCreation) {
			for (const containerType of objectClass.GetContainer().objectTypes()) {
				if (containerType === objectClass) continue
				const siblingInst = this.CreateInstanceFromData(containerType, originalLayer,
					false, wi ? wi.GetX() : x, wi ? wi.GetY() : y, true, false, undefined, creatingHierarchy)
				inst._AddSibling(siblingInst)
			}
			for (const s of inst.siblings()) {
				s._AddSibling(inst)
				for (const s2 of inst.siblings()) if (s !== s2) s._AddSibling(s2)
			}
		}
		if (isWorld && !isStartupInstance && !!createHierarchy) this._CreateChildInstancesFromData(inst, worldData, wi, layer, x, y, creatingHierarchy)
		if (objectClass.IsInContainer() && !isStartupInstance && !skipSiblings && !!createHierarchy) for (const sibling of inst.siblings()) {
			const swi = sibling.GetWorldInfo()
			if (!swi) continue
			const siblingPlugin = sibling.GetPlugin()
			const sWorldData = sibling.GetObjectClass().GetDefaultInstanceData()[0]
			if (siblingPlugin.IsWorldType()) this._CreateChildInstancesFromData(sibling, sWorldData, swi, layer, swi.GetX(), swi.GetY(), creatingHierarchy) else this._CreateChildInstancesFromData(sibling, sWorldData, swi, layer, undefined, undefined, creatingHierarchy)
		}
		if (!skipSiblings && !!createHierarchy) {
			if (typeof x === 'undefined') x = worldData[0]
			if (typeof y === 'undefined') y = worldData[1]
			const pwi = wi.GetTopParent()
			const newX = x - wi.GetX() + pwi.GetX()
			const newY = y - wi.GetY() + pwi.GetY()
			pwi.SetXY(newX, newY)
		}
		objectClass._SetIIDsStale()
		const instPropertyData = instData ? C3.cloneArray(instData[5]) : null
		const behPropertyData = instData ? instData[4].map(bp => C3.cloneArray(bp)) : null
		const hasTilemap = isWorld && worldData && worldData[13]
		if (hasTilemap) inst._SetHasTilemap()
		inst._CreateSdkInstance(instPropertyData, behPropertyData)
		if (hasTilemap) {
			const tilemapData = worldData[13]
			inst.GetSdkInstance().LoadTilemapData(tilemapData[2],
				tilemapData[0], tilemapData[1])
		}
		this._instancesPendingCreate.push(inst)
		this._hasPendingInstances = true
		if (this.IsDebug()) C3Debugger.InstanceCreated(inst)
		return inst
	}

	_CreateChildInstancesFromData(parentInstance, parentWorldData, parentWorldInfo, layer, x, y, creatingHierarchy) {
		const parentZIndex = parentWorldInfo.GetSceneGraphZIndexExportData()
		const childrenData = parentWorldInfo.GetSceneGraphChildrenExportData()
		parentInstance.GetWorldInfo().SetSceneGraphZIndex(parentZIndex)
		if (!childrenData) return
		if (typeof x ===
			'undefined') x = parentWorldData[0]
		if (typeof y === 'undefined') y = parentWorldData[1]
		const sceneGraphSiblings = new Set
		const parentX = parentWorldData[0]
		const parentY = parentWorldData[1]
		for (const childData of childrenData) {
			const childLayoutSID = childData[0]
			const childLayerIndex = childData[1]
			const childUID = childData[2]
			const childFlags = childData[3]
			const childIsInContainer = !!childData[4]
			const childZIndex = childData[5]
			const layout = this._layoutManager.GetLayoutBySID(childLayoutSID)
			const l = layout.GetLayer(childLayerIndex)
			const childInstData = l.GetInitialInstanceData(childUID)
			const childObjectClass = this.GetObjectClassByIndex(childInstData[1])
			const hasSibling = parentInstance.HasSibling(childObjectClass)
			const siblingProcessed = sceneGraphSiblings.has(childObjectClass)
			if (hasSibling && !siblingProcessed && childIsInContainer) {
				const childInst = parentInstance.GetSibling(childObjectClass)
				const childX = x + childInstData[0][0] - parentX
				const childY = y + childInstData[0][1] - parentY
				childInst.GetWorldInfo().SetXY(childX, childY)
				childInst.GetWorldInfo().SetSceneGraphZIndex(childZIndex)
				parentInstance.AddChild(childInst, {transformX: !!(childFlags >> 0 & 1), transformY: !!(childFlags >> 1 & 1), transformWidth: !!(childFlags >> 2 & 1), transformHeight: !!(childFlags >> 3 & 1), transformAngle: !!(childFlags >> 4 & 1), destroyWithParent: !!(childFlags >> 5 & 1), transformZElevation: !!(childFlags >> 6 & 1)})
				sceneGraphSiblings.add(childObjectClass)
			} else {
				const childX = x + childInstData[0][0] - parentX
				const childY = y + childInstData[0][1] - parentY
				const childInst = this.CreateInstanceFromData(childInstData, layer, false, childX, childY, false,
					true, parentInstance, creatingHierarchy)
				childInst.GetWorldInfo().SetSceneGraphZIndex(childZIndex)
				parentInstance.AddChild(childInst, {transformX: !!(childFlags >> 0 & 1), transformY: !!(childFlags >> 1 & 1), transformWidth: !!(childFlags >> 2 & 1), transformHeight: !!(childFlags >> 3 & 1), transformAngle: !!(childFlags >> 4 & 1), destroyWithParent: !!(childFlags >> 5 & 1), transformZElevation: !!(childFlags >> 6 & 1)})
			}
		}
	}

	DestroyInstance(inst) {
		if (this._instancesToReleaseAtEndOfTick.has(inst)) return
		const objectClass = inst.GetObjectClass()
		let s =
			this._instancesPendingDestroy.get(objectClass)
		if (s) {
			if (s.has(inst)) return
			s.add(inst)
		} else {
			s = new Set
			s.add(inst)
			this._instancesPendingDestroy.set(objectClass, s)
		}
		if (this.IsDebug()) C3Debugger.InstanceDestroyed(inst)
		inst._MarkDestroyed()
		this._hasPendingInstances = true
		if (inst.IsInContainer()) for (const s of inst.siblings()) this.DestroyInstance(s)
		for (const c of inst.children()) if (c.GetDestroyWithParent()) this.DestroyInstance(c)
		if (!this._layoutManager.IsEndingLayout() && !this._isLoadingState) {
			const eventSheetManager =
				this.GetEventSheetManager()
			eventSheetManager.BlockFlushingInstances(true)
			inst._TriggerOnDestroyed()
			eventSheetManager.BlockFlushingInstances(false)
		}
		inst._FireDestroyedScriptEvents(this._layoutManager.IsEndingLayout())
	}

	FlushPendingInstances() {
		if (!this._hasPendingInstances) return
		this._isFlushingPendingInstances = true
		this._FlushInstancesPendingCreate()
		this._FlushInstancesPendingDestroy()
		this._isFlushingPendingInstances = false
		this._hasPendingInstances = false
		this.UpdateRender()
	}

	_FlushInstancesPendingCreate() {
		for (const inst of this._instancesPendingCreate) {
			const objectType =
				inst.GetObjectClass()
			objectType._AddInstance(inst)
			for (const family of objectType.GetFamilies()) {
				family._AddInstance(inst)
				family._SetIIDsStale()
			}
		}
		C3.clearArray(this._instancesPendingCreate)
	}

	_FlushInstancesPendingDestroy() {
		this._dispatcher.SetDelayRemoveEventsEnabled(true)
		for (const [objectClass, s] of this._instancesPendingDestroy.entries()) {
			this._FlushInstancesPendingDestroyForObjectClass(objectClass, s)
			s.clear()
		}
		this._instancesPendingDestroy.clear()
		this._dispatcher.SetDelayRemoveEventsEnabled(false)
	}

	_FlushInstancesPendingDestroyForObjectClass(objectClass,
																							s) {
		for (const inst of s) {
			const instanceDestroyEvent = this._eventObjects['instancedestroy']
			instanceDestroyEvent.instance = inst
			this._dispatcher.dispatchEvent(instanceDestroyEvent)
			this._instancesByUid.delete(inst.GetUID())
			this._instanceTimes.delete(inst)
			const wi = inst.GetWorldInfo()
			if (wi) {
				wi._RemoveFromCollisionCells()
				wi._RemoveFromRenderCells()
				wi._MarkDestroyed()
			}
			this._instancesToReleaseAtEndOfTick.add(inst)
			this._objectCount--
		}
		C3.arrayRemoveAllInSet(objectClass.GetInstances(), s)
		objectClass._SetIIDsStale()
		this._instancesToReleaseAffectedObjectClasses.add(objectClass)
		if (objectClass.GetInstances().length === 0) objectClass._SetAnyInstanceParallaxed(false)
		for (const family of objectClass.GetFamilies()) {
			C3.arrayRemoveAllInSet(family.GetInstances(), s)
			family._SetIIDsStale()
			this._instancesToReleaseAffectedObjectClasses.add(family)
		}
		if (objectClass.GetPlugin().IsWorldType()) {
			const layers = new Set([...s].map(i => i.GetWorldInfo().GetLayer()))
			for (const layer of layers) layer._RemoveAllInstancesInSet(s)
		}
	}

	_GetInstancesPendingCreate() {
		return this._instancesPendingCreate
	}

	* instancesPendingCreateForObjectClass(objectClass) {
		for (const inst of this._GetInstancesPendingCreate()) if (objectClass.IsFamily()) {
			if (inst.GetObjectClass().BelongsToFamily(objectClass)) yield inst
		} else if (inst.GetObjectClass() ===
			objectClass) yield inst
	}

	_GetNewUID() {
		return this._nextUid++
	}

	_MapInstanceByUID(uid, inst) {
		this._instancesByUid.set(uid, inst)
	}

	_OnWebGLContextLost() {
		this._dispatcher.dispatchEvent(C3.New(C3.Event, 'webglcontextlost'))
		this.SetSuspended(true)
		for (const objectClass of this._allObjectClasses) if (!objectClass.IsFamily() && objectClass.HasLoadedTextures()) objectClass.ReleaseTextures()
		const runningLayout = this.GetMainRunningLayout()
		if (runningLayout) runningLayout._OnWebGLContextLost()
		C3.ImageInfo.OnWebGLContextLost()
		C3.ImageAsset.OnWebGLContextLost()
	}

	async _OnWebGLContextRestored() {
		await this.GetMainRunningLayout()._Load(null, this.GetWebGLRenderer())
		this._dispatcher.dispatchEvent(C3.New(C3.Event, 'webglcontextrestored'))
		this.SetSuspended(false)
		this.UpdateRender()
	}

	_OnVisibilityChange(e) {
		this.SetSuspended(e['hidden'])
	}

	_OnWindowBlur(e) {
		if (!this.IsPreview() || !this._pauseOnBlur || C3.Platform.IsMobile) return
		if (!e.data['parentHasFocus']) {
			this.SetSuspended(true)
			this._isPausedOnBlur = true
		}
	}

	_OnWindowFocus() {
		if (!this._isPausedOnBlur) return
		this.SetSuspended(false)
		this._isPausedOnBlur = false
	}

	_RequestAnimationFrame() {
		const tickCallbacks = this._tickCallbacks
		if (this._framerateMode === 'vsync') {
			if (this._rafId === -1) this._rafId = self.requestAnimationFrame(tickCallbacks.normal)
		} else if (this._framerateMode === 'unlimited-tick') {
			if (this._ruafId === -1) this._ruafId = C3.RequestUnlimitedAnimationFrame(tickCallbacks.tickOnly)
			if (this._rafId === -1) this._rafId = self.requestAnimationFrame(tickCallbacks.renderOnly)
		} else if (this._ruafId === -1) this._ruafId = C3.RequestUnlimitedAnimationFrame(tickCallbacks.normal)
	}

	_CancelAnimationFrame() {
		if (this._rafId !==
			-1) {
			self.cancelAnimationFrame(this._rafId)
			this._rafId = -1
		}
		if (this._ruafId !== -1) {
			C3.CancelUnlimitedAnimationFrame(this._ruafId)
			this._ruafId = -1
		}
	}

	IsSuspended() {
		return this._suspendCount > 0
	}

	SetSuspended(s) {
		if (this.IsExportToVideo()) return
		const wasSuspended = this.IsSuspended()
		this._suspendCount += s ? 1 : -1
		if (this._suspendCount < 0) this._suspendCount = 0
		const isSuspended = this.IsSuspended()
		if (!wasSuspended && isSuspended) {
			console.log('[Construct] Suspending')
			this._CancelAnimationFrame()
			this._dispatcher.dispatchEvent(C3.New(C3.Event,
				'suspend'))
			this.Trigger(C3.Plugins.System.Cnds.OnSuspend, null, null)
		} else if (wasSuspended && !isSuspended) {
			console.log('[Construct] Resuming')
			const now = performance.now()
			this._lastTickTime = now
			this._fpsLastTime = now
			this._fpsFrameCount = 0
			this._fps = 0
			this._mainThreadTime = 0
			this._mainThreadTimeCounter = 0
			this._dispatcher.dispatchEvent(C3.New(C3.Event, 'resume'))
			this.Trigger(C3.Plugins.System.Cnds.OnResume, null, null)
			if (!this.HitBreakpoint()) this.Tick(now)
		}
	}

	_AddBehInstToTick(behSdkInst) {
		this._behInstsToTick.Add(behSdkInst)
	}

	_AddBehInstToPostTick(behSdkInst) {
		this._behInstsToPostTick.Add(behSdkInst)
	}

	_AddBehInstToTick2(behSdkInst) {
		this._behInstsToTick2.Add(behSdkInst)
	}

	_RemoveBehInstToTick(behSdkInst) {
		this._behInstsToTick.Remove(behSdkInst)
	}

	_RemoveBehInstToPostTick(behSdkInst) {
		this._behInstsToPostTick.Remove(behSdkInst)
	}

	_RemoveBehInstToTick2(behSdkInst) {
		this._behInstsToTick2.Remove(behSdkInst)
	}

	_BehaviorTick() {
		this._behInstsToTick.SetQueueingEnabled(true)
		for (const bi of this._behInstsToTick) bi.Tick()
		this._behInstsToTick.SetQueueingEnabled(false)
	}

	_BehaviorPostTick() {
		this._behInstsToPostTick.SetQueueingEnabled(true)
		for (const bi of this._behInstsToPostTick) bi.PostTick()
		this._behInstsToPostTick.SetQueueingEnabled(false)
	}

	_BehaviorTick2() {
		this._behInstsToTick2.SetQueueingEnabled(true)
		for (const bi of this._behInstsToTick2) bi.Tick2()
		this._behInstsToTick2.SetQueueingEnabled(false)
	}

	* _DebugBehaviorTick() {
		this._behInstsToTick.SetQueueingEnabled(true)
		for (const bi of this._behInstsToTick) {
			const ret =
				bi.Tick()
			if (C3.IsIterator(ret)) yield* ret
		}
		this._behInstsToTick.SetQueueingEnabled(false)
	}

	* _DebugBehaviorPostTick() {
		this._behInstsToPostTick.SetQueueingEnabled(true)
		for (const bi of this._behInstsToPostTick) {
			const ret = bi.PostTick()
			if (C3.IsIterator(ret)) yield* ret
		}
		this._behInstsToPostTick.SetQueueingEnabled(false)
	}

	* _DebugBehaviorTick2() {
		this._behInstsToTick2.SetQueueingEnabled(true)
		for (const bi of this._behInstsToTick2) {
			const ret = bi.Tick2()
			if (C3.IsIterator(ret)) yield* ret
		}
		this._behInstsToTick2.SetQueueingEnabled(false)
	}

	async Tick(timestamp,
						 isDebugStep, mode) {
		this._hasStartedTicking = true
		const isBackgroundWake = mode === 'background-wake'
		const shouldRender = mode !== 'background-wake' && mode !== 'skip-render'
		if (!this._hasStarted || this.IsSuspended() && !isDebugStep && !isBackgroundWake) return
		const startTime = performance.now()
		this._isInTick = true
		this._MeasureDt(timestamp || 0)
		const beforePreTickRet = this.Step_BeforePreTick()
		if (this.IsDebugging()) await beforePreTickRet
		const pretickRet = this._dispatcher.dispatchEventAndWait_AsyncOptional(this._eventObjects['pretick'])
		if (pretickRet instanceof Promise) await pretickRet
		const afterPreTickRet = this.Step_AfterPreTick()
		if (this.IsDebugging()) await afterPreTickRet
		if (this._NeedsHandleSaveOrLoad()) await this._HandleSaveOrLoad()
		if (this.GetLayoutManager().IsPendingChangeMainLayout()) await this._MaybeChangeLayout()
		const runEventsRet = this.Step_RunEventsEtc()
		if (this.IsDebugging()) await runEventsRet
		if (shouldRender) this.Render()
		if (this.IsExportToVideo()) {
			await this._ExportToVideoAddFrame()
			if (this.GetGameTime() >= this.GetExportVideoDuration()) {
				this._ExportToVideoFinish()
				return
			}
		}
		if (!this.IsSuspended() && !isBackgroundWake) this._RequestAnimationFrame()
		this._tickCount++
		this._tickCountNoSave++
		this._isInTick = false
		this._mainThreadTimeCounter += performance.now() - startTime
	}

	async Step_BeforePreTick() {
		const eventSheetManager = this._eventSheetManager
		const isDebug = this.IsDebug()
		this.FlushPendingInstances()
		eventSheetManager.BlockFlushingInstances(true)
		this.PushCurrentLayout(this.GetMainRunningLayout())
		if (isDebug) C3Debugger.StartMeasuringTime()
		if (this.IsDebugging()) await eventSheetManager.DebugRunScheduledWaits()
		else eventSheetManager.RunScheduledWaits()
		if (isDebug) C3Debugger.AddEventsTime()
		this.PopCurrentLayout()
		eventSheetManager.BlockFlushingInstances(false)
		this.FlushPendingInstances()
		eventSheetManager.BlockFlushingInstances(true)
	}

	async Step_AfterPreTick() {
		const isDebug = this.IsDebug()
		const isDebugging = this.IsDebugging()
		const dispatcher = this._dispatcher
		const eventObjects = this._eventObjects
		const userScriptEventObjects = this._userScriptEventObjects
		if (isDebug) C3Debugger.StartMeasuringTime()
		if (isDebugging) await this.DebugIterateAndBreak(this._DebugBehaviorTick())
		else this._BehaviorTick()
		if (isDebugging) await this.DebugIterateAndBreak(this._DebugBehaviorPostTick()) else this._BehaviorPostTick()
		if (isDebug) C3Debugger.AddBehaviorTickTime()
		if (isDebug) C3Debugger.StartMeasuringTime()
		if (isDebugging) await this.DebugFireGeneratorEventAndBreak(eventObjects['tick']) else dispatcher.dispatchEvent(eventObjects['tick'])
		if (isDebug) C3Debugger.AddPluginTickTime()
		this._eventSheetManager.BlockFlushingInstances(false)
		this.DispatchUserScriptEvent(userScriptEventObjects['tick'])
	}

	async Step_RunEventsEtc() {
		const eventSheetManager =
			this._eventSheetManager
		const dispatcher = this._dispatcher
		const eventObjects = this._eventObjects
		const isDebug = this.IsDebug()
		const isDebugging = this.IsDebugging()
		if (isDebug) C3Debugger.StartMeasuringTime()
		if (isDebugging) await eventSheetManager.DebugRunEvents(this._layoutManager) else eventSheetManager.RunEvents(this._layoutManager)
		if (isDebug) C3Debugger.AddEventsTime()
		this._collisionEngine.ClearRegisteredCollisions()
		this._ReleaseInstancesAtEndOfTick()
		this._isLayoutFirstTick = false
		eventSheetManager.BlockFlushingInstances(true)
		if (isDebug) C3Debugger.StartMeasuringTime()
		if (isDebugging) await this.DebugIterateAndBreak(this._DebugBehaviorTick2()) else this._BehaviorTick2()
		if (isDebug) C3Debugger.AddBehaviorTickTime()
		if (isDebug) C3Debugger.StartMeasuringTime()
		if (isDebugging) await this.DebugFireGeneratorEventAndBreak(eventObjects['tick2']) else dispatcher.dispatchEvent(eventObjects['tick2'])
		if (isDebug) C3Debugger.AddPluginTickTime()
		eventSheetManager.BlockFlushingInstances(false)
		if (isDebugging) await eventSheetManager.RunQueuedDebugTriggersAsync()
	}

	_ReleaseInstancesAtEndOfTick() {
		if (this._instancesToReleaseAtEndOfTick.size ===
			0) return
		const dispatcher = this._dispatcher
		dispatcher.SetDelayRemoveEventsEnabled(true)
		for (const objectClass of this._instancesToReleaseAffectedObjectClasses) objectClass.GetSolStack().RemoveInstances(this._instancesToReleaseAtEndOfTick)
		this._instancesToReleaseAffectedObjectClasses.clear()
		this._eventSheetManager.RemoveInstancesFromScheduledWaits(this._instancesToReleaseAtEndOfTick)
		for (const inst of this._instancesToReleaseAtEndOfTick) inst.Release()
		this._instancesToReleaseAtEndOfTick.clear()
		dispatcher.SetDelayRemoveEventsEnabled(false)
	}

	async _MaybeChangeLayout() {
		const layoutManager =
			this.GetLayoutManager()
		let i = 0
		while (layoutManager.IsPendingChangeMainLayout() && i++ < 10) await this._DoChangeLayout(layoutManager.GetPendingChangeMainLayout())
	}

	_MeasureDt(timestamp) {
		let dtRaw = 0
		if (this.IsExportToVideo()) {
			dtRaw = 1 / this.GetExportVideoFramerate()
			this._dt1 = dtRaw
		} else if (this._lastTickTime !== 0) {
			const msDiff = Math.max(timestamp - this._lastTickTime, 0)
			dtRaw = msDiff / 1E3
			if (dtRaw > .5) dtRaw = 0
			const maxDt1 = 1 / this._minimumFramerate
			this._dt1 = Math.min(dtRaw, maxDt1)
		}
		this._lastTickTime = timestamp
		this._dt =
			this._dt1 * this._timeScale
		this._gameTime.Add(this._dt)
		this._gameTimeRaw.Add(dtRaw * this._timeScale)
		this._wallTime.Add(this._dt1)
		for (const [inst, instTime] of this._instanceTimes) instTime.Add(this._dt1 * inst.GetTimeScale())
		if (this._canvasManager) this._canvasManager._UpdateTick()
		if (timestamp - this._fpsLastTime >= 1E3) {
			this._fpsLastTime += 1E3
			if (timestamp - this._fpsLastTime >= 1E3) this._fpsLastTime = timestamp
			this._fps = this._fpsFrameCount
			this._fpsFrameCount = 0
			this._mainThreadTime = Math.min(this._mainThreadTimeCounter /
				1E3, 1)
			this._mainThreadTimeCounter = 0
			if (this._canvasManager) this._canvasManager._Update1sFrameRange()
			this._collisionEngine._Update1sStats()
			if (this.IsDebug()) C3Debugger.Update1sPerfStats()
		}
		this._fpsFrameCount++
	}

	_SetTrackingInstanceTime(inst, enable) {
		if (enable) {
			if (!this._instanceTimes.has(inst)) {
				const instTime = C3.New(C3.KahanSum)
				instTime.Copy(this._gameTime)
				this._instanceTimes.set(inst, instTime)
			}
		} else this._instanceTimes.delete(inst)
	}

	_GetInstanceGameTime(inst) {
		const instTime = this._instanceTimes.get(inst)
		return instTime ? instTime.Get() : this.GetGameTime()
	}

	async _DoChangeLayout(changeToLayout) {
		const dispatcher = this._dispatcher
		const layoutManager = this.GetLayoutManager()
		const prevLayout = layoutManager.GetMainRunningLayout()
		await prevLayout._StopRunning()
		prevLayout._Unload(changeToLayout, this.GetRenderer())
		if (prevLayout === changeToLayout) this._eventSheetManager.ClearAllScheduledWaits()
		this._collisionEngine.ClearRegisteredCollisions()
		this._ReleaseInstancesAtEndOfTick()
		dispatcher.dispatchEvent(this._eventObjects['beforelayoutchange'])
		C3.Asyncify.SetHighThroughputMode(true)
		await changeToLayout._Load(prevLayout, this.GetRenderer())
		C3.Asyncify.SetHighThroughputMode(false)
		await changeToLayout._StartRunning(false)
		dispatcher.dispatchEvent(this._eventObjects['layoutchange'])
		this.UpdateRender()
		this._isLayoutFirstTick = true
		this.FlushPendingInstances()
		this._ExportToVideoAddKeyframe()
	}

	UpdateRender() {
		this._needRender = true
	}

	GetWebGLRenderer() {
		if (!this._canvasManager) return null
		return this._canvasManager.GetWebGLRenderer()
	}

	GetWebGPURenderer() {
		if (!this._canvasManager) return null
		return this._canvasManager.GetWebGPURenderer()
	}

	GetRenderer() {
		if (!this._canvasManager) return null
		return this._canvasManager.GetRenderer()
	}

	Render() {
		const canvasManager = this._canvasManager
		if (!canvasManager || canvasManager.IsRendererContextLost()) return
		const renderer = this.GetRenderer()
		const supportsGPUProfiling = renderer.SupportsGPUProfiling()
		const isWebGLProfiling = supportsGPUProfiling && renderer.IsWebGL()
		const isWebGPUProfiling = supportsGPUProfiling && renderer.IsWebGPU()
		if (isWebGLProfiling) renderer.CheckForQueryResults()
		if (!this._needRender && !this.IsExportToVideo()) {
			renderer.IncrementFrameNumber()
			return
		}
		const layout = this._layoutManager.GetMainRunningLayout()
		renderer.Start()
		const isDebug = this.IsDebug()
		if (isDebug) C3Debugger.StartMeasuringTime()
		this._needRender = false
		let webglFrameQuery = null
		if (isWebGLProfiling) {
			webglFrameQuery = canvasManager.GetGPUFrameTimingsBuffer().AddTimeElapsedQuery()
			renderer.StartQuery(webglFrameQuery)
		}
		let webgpuFrameTimings = null
		if (isWebGPUProfiling) {
			webgpuFrameTimings = renderer.StartFrameTiming((1 +
				layout.GetLayerCount()) * 2)
			renderer.WriteTimestamp(0)
		}
		if (this.Uses3DFeatures() && canvasManager.GetCurrentFullscreenScalingQuality() === 'low') renderer.SetFixedSizeDepthBuffer(canvasManager.GetDrawWidth(), canvasManager.GetDrawHeight()) else renderer.SetAutoSizeDepthBuffer()
		this._Render(this.GetRenderer(), layout)
		if (webglFrameQuery) renderer.EndQuery(webglFrameQuery)
		if (isWebGPUProfiling) {
			renderer.WriteTimestamp(1)
			this._canvasManager._AddWebGPUFrameTiming(webgpuFrameTimings)
		}
		renderer.Finish()
		if (isDebug) {
			C3Debugger.AddDrawCallsTime()
			C3Debugger.UpdateInspectHighlight()
		}
		if (canvasManager) canvasManager._MaybeTakeSnapshot()
	}

	_Render(renderer, layout) {
		renderer.SetTextureFillMode()
		renderer.SetAlphaBlend()
		renderer.SetColorRgba(1, 1, 1, 1)
		renderer.SetRenderTarget(null)
		renderer.SetTexture(null)
		renderer.SetDepthEnabled(this.Uses3DFeatures())
		layout.Draw(renderer)
	}

	Trigger(method, inst, behaviorType) {
		if (!this._hasStarted) return false
		const isTopLevel = !this._isInTick && !this._eventSheetManager.IsInTrigger()
		let startTime = 0
		if (isTopLevel) startTime =
			performance.now()
		const isDebug = this.IsDebug()
		if (isDebug) this.SetDebuggingEnabled(false)
		const ret = this._eventSheetManager._Trigger(this._layoutManager, method, inst, behaviorType)
		if (isTopLevel) {
			const triggerTime = performance.now() - startTime
			this._mainThreadTimeCounter += triggerTime
			if (isDebug) C3Debugger.AddTriggersTime(triggerTime)
		}
		if (isDebug) this.SetDebuggingEnabled(true)
		return ret
	}

	DebugTrigger(method, inst, behaviorType) {
		if (!this.IsDebug()) return this.Trigger(method, inst, behaviorType)
		if (this.HitBreakpoint()) throw new Error('called DebugTrigger() while stopped on breakpoint')
		if (!this._isInTick && !this._eventSheetManager.IsInTrigger()) throw new Error('called DebugTrigger() outside of event code - use TriggerAsync() instead')
		return this._eventSheetManager._DebugTrigger(this._layoutManager, method, inst, behaviorType)
	}

	async TriggerAsync(method, inst, behaviorType) {
		if (!this.IsDebugging()) return this.Trigger(method, inst, behaviorType)
		if (!this._hasStarted) return false
		if (this.HitBreakpoint()) return this._eventSheetManager.QueueDebugTrigger(method, inst, behaviorType)
		if (!this.GetMainRunningLayout()) return this._eventSheetManager.QueueTrigger(method,
			inst, behaviorType)
		const startTime = performance.now()
		const iter = this._eventSheetManager._DebugTrigger(this._layoutManager, method, inst, behaviorType)
		let result = iter.next()
		while (!result.done) {
			await this.DebugBreak(result.value)
			result = iter.next()
		}
		if (!this.IsSuspended() && !this._eventSheetManager.IsInTrigger()) {
			await this._eventSheetManager.RunQueuedDebugTriggersAsync()
			if (this._hasStartedTicking && !this._isInTick) this._RequestAnimationFrame()
		}
		this._mainThreadTimeCounter += performance.now() - startTime
		return result.value
	}

	FastTrigger(method, inst, value) {
		const isDebug = this.IsDebug()
		if (isDebug) this.SetDebuggingEnabled(false)
		const ret = this._eventSheetManager._FastTrigger(this._layoutManager, method, inst, value)
		if (isDebug) this.SetDebuggingEnabled(true)
		return ret
	}

	DebugFastTrigger(method, inst, value) {
		return this._eventSheetManager._DebugFastTrigger(this._layoutManager, method, inst, value)
	}

	ScheduleTriggers(f) {
		return this._scheduleTriggersThrottle.Add(f)
	}

	PushCurrentLayout(layout) {
		this._currentLayoutStack.push(layout)
	}

	PopCurrentLayout() {
		if (!this._currentLayoutStack.length) throw new Error('layout stack empty')
		this._currentLayoutStack.pop()
	}

	GetCurrentLayout() {
		if (!this._currentLayoutStack.length) return this.GetMainRunningLayout()
		return this._currentLayoutStack.at(-1)
	}

	GetDt(inst) {
		if (!inst || inst.GetTimeScale() === -1) return this._dt
		return this._dt1 * inst.GetTimeScale()
	}

	_GetDtFast() {
		return this._dt
	}

	GetDt1() {
		return this._dt1
	}

	GetTimeScale() {
		return this._timeScale
	}

	SetTimeScale(ts) {
		if (isNaN(ts) || ts < 0) ts = 0
		this._timeScale = ts
	}

	SetMinimumFramerate(fps) {
		this._minimumFramerate = C3.clamp(fps, 1, 120)
	}

	GetMinimumFramerate() {
		return this._minimumFramerate
	}

	GetFPS() {
		return this._fps
	}

	GetMainThreadTime() {
		return this._mainThreadTime
	}

	GetStartTime() {
		return this._startTime
	}

	GetGameTime() {
		return this._gameTime.Get()
	}

	GetGameTimeRaw() {
		return this._gameTimeRaw.Get()
	}

	GetWallTime() {
		return this._wallTime.Get()
	}

	GetTickCount() {
		return this._tickCount
	}

	GetTickCountNoSave() {
		return this._tickCountNoSave
	}

	GetObjectCount() {
		return this._objectCount
	}

	GetProjectName() {
		return this._projectName
	}

	GetProjectVersion() {
		return this._projectVersion
	}

	GetProjectUniqueId() {
		return this._projectUniqueId
	}

	GetAppId() {
		return this._appId
	}

	GetInstanceByUID(uid) {
		if (this._isLoadingState) throw new Error('cannot call while loading state - wait until afterload event')
		return this._instancesByUid.get(uid) || null
	}

	_RefreshUidMap() {
		this._instancesByUid.clear()
		for (const objectClass of this._allObjectClasses) {
			if (objectClass.IsFamily()) continue
			for (const inst of objectClass.GetInstances()) this._instancesByUid.set(inst.GetUID(), inst)
		}
	}

	IsPreview() {
		return this._exportType === 'preview'
	}

	IsDebug() {
		return this._isDebug
	}

	GetExportType() {
		return this._exportType
	}

	IsCordova() {
		return this._exportType === 'cordova'
	}

	IsAndroidWebView() {
		return C3.Platform.OS === 'Android' && (this._exportType ===
			'cordova' || this._exportType === 'playable-ad' || this._exportType === 'instant-games')
	}

	IsiOSCordova() {
		return this._isiOSCordova
	}

	IsiOSWebView() {
		return this._isiOSWebView
	}

	GetCollisionEngine() {
		return this._collisionEngine
	}

	GetSolidBehavior() {
		return this._pluginManager.GetSolidBehavior()
	}

	GetJumpthruBehavior() {
		return this._pluginManager.GetJumpthruBehavior()
	}

	Uses3DFeatures() {
		return this._uses3dFeatures
	}

	GetZScaleFactor() {
		return this.GetRenderer().GetZAxisScaleFactor(this.GetViewportHeight())
	}

	GetDefaultCameraZ(viewH) {
		return this.GetRenderer().GetDefaultCameraZ(viewH ||
			this.GetViewportHeight())
	}

	IsLayoutFirstTick() {
		return this._isLayoutFirstTick
	}

	SetPixelRoundingEnabled(e) {
		e = !!e
		if (this._isPixelRoundingEnabled === e) return
		this._isPixelRoundingEnabled = e
		this.GetLayoutManager().SetAllLayerMVChanged()
		this.UpdateRender()
	}

	IsPixelRoundingEnabled() {
		return this._isPixelRoundingEnabled
	}

	SaveToSlot(slotName) {
		this._saveToSlotName = slotName
	}

	LoadFromSlot(slotName) {
		this._loadFromSlotName = slotName
	}

	LoadFromJsonString(str) {
		this._loadFromJson = str
	}

	GetLastSaveJsonString() {
		return this._lastSaveJson
	}

	_NeedsHandleSaveOrLoad() {
		return !!(this._saveToSlotName ||
			this._loadFromSlotName || this._loadFromJson !== null)
	}

	async _HandleSaveOrLoad() {
		if (this._saveToSlotName) {
			this.FlushPendingInstances()
			await this._DoSaveToSlot(this._saveToSlotName)
			this._ClearSaveOrLoad()
		}
		if (this._loadFromSlotName) {
			await this._DoLoadFromSlot(this._loadFromSlotName)
			this._ClearSaveOrLoad()
			if (this.IsDebug()) C3Debugger.StepIfPausedInDebugger()
		}
		if (this._loadFromJson !== null) {
			this.FlushPendingInstances()
			try {
				await this._DoLoadFromJsonString(this._loadFromJson)
				this._lastSaveJson = this._loadFromJson
				await this.TriggerAsync(C3.Plugins.System.Cnds.OnLoadComplete, null)
				this._lastSaveJson = ''
			} catch (err) {
				console.error('[Construct] Failed to load state from JSON string: ', err)
				await this.TriggerAsync(C3.Plugins.System.Cnds.OnLoadFailed, null)
			}
			this._ClearSaveOrLoad()
		}
	}

	_ClearSaveOrLoad() {
		this._saveToSlotName = ''
		this._loadFromSlotName = ''
		this._loadFromJson = null
	}

	_GetProjectStorage() {
		if (!this._projectStorage) this._projectStorage = localforage.createInstance({
			name:        'c3-localstorage-' + this.GetProjectUniqueId(),
			description: this.GetProjectName()
		})
		return this._projectStorage
	}

	_GetSavegamesStorage() {
		if (!this._savegamesStorage) this._savegamesStorage = localforage.createInstance({name: 'c3-savegames-' + this.GetProjectUniqueId(), description: this.GetProjectName()})
		return this._savegamesStorage
	}

	async _DoSaveToSlot(slotName) {
		const saveJson = await this._SaveToJsonString()
		try {
			await this._GetSavegamesStorage().setItem(slotName, saveJson)
			console.log('[Construct] Saved state to storage (' + saveJson.length + ' chars)')
			this._lastSaveJson =
				saveJson
			await this.TriggerAsync(C3.Plugins.System.Cnds.OnSaveComplete, null)
			this._lastSaveJson = ''
		} catch (err) {
			console.error('[Construct] Failed to save state to storage: ', err)
			await this.TriggerAsync(C3.Plugins.System.Cnds.OnSaveFailed, null)
		}
	}

	async _DoLoadFromSlot(slotName) {
		try {
			const loadJson = await this._GetSavegamesStorage().getItem(slotName)
			if (!loadJson) throw new Error('empty slot')
			console.log('[Construct] Loaded state from storage (' + loadJson.length + ' chars)')
			await this._DoLoadFromJsonString(loadJson)
			this._lastSaveJson = loadJson
			await this.TriggerAsync(C3.Plugins.System.Cnds.OnLoadComplete, null)
			this._lastSaveJson = ''
		} catch (err) {
			console.error('[Construct] Failed to load state from storage: ', err)
			await this.TriggerAsync(C3.Plugins.System.Cnds.OnLoadFailed, null)
		}
	}

	async _SaveToJsonString() {
		const o = {
			'c3save':   true, 'version': 1, 'rt': {
				'time':           this.GetGameTime(), 'timeRaw': this.GetGameTimeRaw(), 'walltime': this.GetWallTime(), 'timescale': this.GetTimeScale(), 'tickcount': this.GetTickCount(), 'next_uid': this._nextUid,
				'running_layout': this.GetMainRunningLayout().GetSID(), 'start_time_offset': Date.now() - this._startTime
			}, 'types': {}, 'layouts': {}, 'events': this._eventSheetManager._SaveToJson(), 'timelines': this._timelineManager._SaveToJson(), 'user_script_data': null
		}
		for (const objectClass of this._allObjectClasses) {
			if (objectClass.IsFamily() || objectClass.HasNoSaveBehavior()) continue
			o['types'][objectClass.GetSID().toString()] = objectClass._SaveToJson()
		}
		for (const layout of this._layoutManager.GetAllLayouts()) o['layouts'][layout.GetSID().toString()] =
			layout._SaveToJson()
		const saveEvent = this._CreateUserScriptEvent('save')
		saveEvent.saveData = null
		await this.DispatchUserScriptEventAsyncWait(saveEvent)
		o['user_script_data'] = saveEvent.saveData
		return JSON.stringify(o)
	}

	IsLoadingState() {
		return this._isLoadingState
	}

	async _DoLoadFromJsonString(jsonStr) {
		const layoutManager = this.GetLayoutManager()
		const o = JSON.parse(jsonStr)
		if (o['c2save']) throw new Error('C2 saves are incompatible with C3 runtime')
		if (!o['c3save']) throw new Error('not valid C3 save data')
		if (o['version'] > 1) throw new Error('C3 save data from future version')
		this._dispatcher.dispatchEvent(C3.New(C3.Event, 'beforeload'))
		for (const inst of this.allInstances()) {
			const objectClass = inst.GetObjectClass()
			if (objectClass.HasNoSaveBehavior()) continue
			inst._OnBeforeLoad()
		}
		const rt = o['rt']
		this._gameTime.Set(rt['time'])
		if (rt.hasOwnProperty('timeRaw')) this._gameTimeRaw.Set(rt['timeRaw'])
		this._wallTime.Set(rt['walltime'])
		this._timeScale = rt['timescale']
		this._tickCount = rt['tickcount']
		this._startTime =
			Date.now() - rt['start_time_offset']
		const layoutSid = rt['running_layout']
		this._isLoadingState = true
		let changedLayout = false
		if (layoutSid !== this.GetMainRunningLayout().GetSID()) {
			const changeToLayout = layoutManager.GetLayoutBySID(layoutSid)
			if (changeToLayout) {
				await this._DoChangeLayout(changeToLayout)
				changedLayout = true
			} else return
		}
		for (const [sidStr, data] of Object.entries(o['types'])) {
			const sid = parseInt(sidStr, 10)
			const objectClass = this.GetObjectClassBySID(sid)
			if (!objectClass || objectClass.IsFamily() ||
				objectClass.HasNoSaveBehavior()) continue
			objectClass._LoadFromJson(data)
		}
		this.FlushPendingInstances()
		this._RefreshUidMap()
		this._isLoadingState = false
		if (changedLayout) {
			for (const inst of this.allInstances()) inst.SetupInitialSceneGraphConnections()
			for (const [sidStr, data] of Object.entries(o['types'])) {
				const sid = parseInt(sidStr, 10)
				const objectClass = this.GetObjectClassBySID(sid)
				if (!objectClass || objectClass.IsFamily() || objectClass.HasNoSaveBehavior()) continue
				objectClass._SetupSceneGraphConnectionsOnChangeOfLayout(data)
			}
		}
		this._nextUid =
			rt['next_uid']
		for (const [sidStr, data] of Object.entries(o['layouts'])) {
			const sid = parseInt(sidStr, 10)
			const layout = layoutManager.GetLayoutBySID(sid)
			if (!layout) continue
			layout._LoadFromJson(data)
		}
		this._eventSheetManager._LoadFromJson(o['events'])
		for (const objectClass of this._allObjectClasses) {
			if (objectClass.IsFamily() || !objectClass.IsInContainer()) continue
			for (const inst of objectClass.GetInstances()) {
				const iid = inst.GetIID()
				for (const otherType of objectClass.GetContainer().objectTypes()) {
					if (otherType ===
						objectClass) continue
					const otherInstances = otherType.GetInstances()
					if (iid < 0 || iid >= otherInstances.length) throw new Error('missing sibling instance')
					inst._AddSibling(otherInstances[iid])
				}
			}
		}
		this._timelineManager._LoadFromJson(o['timelines'])
		layoutManager.SetAllLayerProjectionChanged()
		layoutManager.SetAllLayerMVChanged()
		this._dispatcher.dispatchEvent(C3.New(C3.Event, 'afterload'))
		const loadEvent = this._CreateUserScriptEvent('load')
		loadEvent.saveData = o['user_script_data']
		await this.DispatchUserScriptEventAsyncWait(loadEvent)
		this.UpdateRender()
	}

	async AddJobWorkerScripts(scripts) {
		const loadUrls = await Promise.all(scripts.map(async url => {
			const isCrossOrigin = C3.IsAbsoluteURL(url) && (new URL(url)).origin !== location.origin
			const isCordovaFileProtocol = this.IsCordova() && this._assetManager.IsFileProtocol()
			if (isCrossOrigin || isCordovaFileProtocol || this.IsPreview() || this.GetExportType() === 'playable-ad') {
				const blob = await this._assetManager.FetchBlob(url)
				return URL.createObjectURL(blob)
			} else if (C3.IsRelativeURL(url)) return (new URL(url,
				this._runtimeBaseUrl)).toString() else return url
		}))
		this._jobScheduler.ImportScriptsToJobWorkers(loadUrls)
	}

	AddJobWorkerBlob(blob, id) {
		this._jobScheduler.SendBlobToJobWorkers(blob, id)
	}

	AddJobWorkerBuffer(buffer, id) {
		this._jobScheduler.SendBufferToJobWorkers(buffer, id)
	}

	AddJob(type, params, transferables) {
		return this._jobScheduler.AddJob(type, params, transferables)
	}

	BroadcastJob(type, params, transferables) {
		return this._jobScheduler.BroadcastJob(type, params, transferables)
	}

	InvokeDownload(url, filename) {
		this.PostComponentMessageToDOM('runtime',
			'invoke-download', {'url': url, 'filename': filename})
	}

	async RasterSvgImage(blob, imageWidth, imageHeight, surfaceWidth, surfaceHeight, imageBitmapOpts) {
		surfaceWidth = surfaceWidth || imageWidth
		surfaceHeight = surfaceHeight || imageHeight
		if (this.IsInWorker()) {
			const result = await this.PostComponentMessageToDOMAsync('runtime', 'raster-svg-image', {'blob': blob, 'imageWidth': imageWidth, 'imageHeight': imageHeight, 'surfaceWidth': surfaceWidth, 'surfaceHeight': surfaceHeight, 'imageBitmapOpts': imageBitmapOpts})
			return result['imageBitmap']
		} else {
			const canvas =
				await self['C3_RasterSvgImageBlob'](blob, imageWidth, imageHeight, surfaceWidth, surfaceHeight)
			if (imageBitmapOpts) return await self.createImageBitmap(canvas, imageBitmapOpts) else return canvas
		}
	}

	async GetSvgImageSize(blob) {
		if (this.IsInWorker()) return await this.PostComponentMessageToDOMAsync('runtime', 'get-svg-image-size', {'blob': blob}) else return await self['C3_GetSvgImageSize'](blob)
	}

	RequestDeviceOrientationEvent() {
		if (this._didRequestDeviceOrientationEvent) return
		this._didRequestDeviceOrientationEvent =
			true
		this.PostComponentMessageToDOM('runtime', 'enable-device-orientation')
	}

	RequestDeviceMotionEvent() {
		if (this._didRequestDeviceMotionEvent) return
		this._didRequestDeviceMotionEvent = true
		this.PostComponentMessageToDOM('runtime', 'enable-device-motion')
	}

	Random() {
		return this._randomNumberCallback()
	}

	SetRandomNumberGeneratorCallback(f) {
		this._randomNumberCallback = f
	}

	_GetRemotePreviewStatusInfo() {
		const webglRenderer = this.GetWebGLRenderer()
		return {
			'fps':    this.GetFPS(), 'cpu': this.GetMainThreadTime(), 'gpu': this.GetGPUUtilisation(),
			'layout': this.GetMainRunningLayout() ? this.GetMainRunningLayout().GetName() : '', 'renderer': webglRenderer ? webglRenderer.GetUnmaskedRenderer() : '<unavailable>'
		}
	}

	HitBreakpoint() {
		if (!this.IsDebug()) return false
		return C3Debugger.HitBreakpoint()
	}

	DebugBreak(eventObject) {
		if (!this.IsDebugging()) return Promise.resolve()
		return C3Debugger.DebugBreak(eventObject)
	}

	DebugBreakNext() {
		if (!this.IsDebugging()) return false
		return C3Debugger.BreakNext()
	}

	SetDebugBreakpointsEnabled(e) {
		this._breakpointsEnabled = !!e
		this._UpdateDebuggingFlag()
	}

	AreDebugBreakpointsEnabled() {
		return this._breakpointsEnabled
	}

	IsDebugging() {
		return this._isDebugging
	}

	SetDebuggingEnabled(d) {
		if (d) this._debuggingDisabled--
		else this._debuggingDisabled++
		this._UpdateDebuggingFlag()
	}

	_UpdateDebuggingFlag() {
		this._isDebugging = this.IsDebug() && this._breakpointsEnabled && this._debuggingDisabled === 0
	}

	IsCPUProfiling() {
		return this.IsDebug() && C3Debugger.IsCPUProfiling()
	}

	IsGPUProfiling() {
		return this.IsDebug() && this.GetRenderer().SupportsGPUProfiling() && C3Debugger.IsGPUProfiling()
	}

	async DebugIterateAndBreak(iter) {
		if (!iter) return
		for (const breakEventObject of iter) await this.DebugBreak(breakEventObject)
	}

	DebugFireGeneratorEventAndBreak(event) {
		return this.DebugIterateAndBreak(this._dispatcher.dispatchGeneratorEvent(event))
	}

	_InvokeFunctionFromJS(e) {
		return this._eventSheetManager._InvokeFunctionFromJS(e['name'],
			e['params'])
	}

	GetIRuntime() {
		return this._iRuntime
	}

	_CreateUserScriptEvent(name) {
		const e = C3.New(C3.Event, name, false)
		e.runtime = this._iRuntime
		return e
	}

	_InitScriptInterfaces() {
		const objectDescriptors = {}
		for (const objectClass of this._allObjectClasses) objectDescriptors[objectClass.GetJsPropName()] = {value: objectClass.GetIObjectClass(), enumerable: true, writable: false}
		const objects = Object.create(Object.prototype, objectDescriptors)
		this._iRuntime = new self.IRuntime(this, objects)
		this._userScriptEventObjects =
			{'tick': this._CreateUserScriptEvent('tick')}
	}

	_InitGlobalVariableScriptInterface() {
		const globalVarDescriptors = {}
		for (const globalVar of this.GetEventSheetManager().GetAllGlobalVariables()) globalVarDescriptors[globalVar.GetJsPropName()] = globalVar._GetScriptInterfaceDescriptor()
		this._iRuntime._InitGlobalVars(globalVarDescriptors)
	}

	_GetCommonScriptInterfaces() {
		return this._commonScriptInterfaces
	}

	_MapScriptInterface(interface_, class_) {
		this._interfaceMap.set(interface_, class_)
	}

	_UnwrapScriptInterface(interface_) {
		return this._interfaceMap.get(interface_)
	}

	_UnwrapIObjectClass(iObjectClass) {
		if (!(iObjectClass instanceof
			self.IObjectClass)) throw new TypeError('expected IObjectClass')
		const objectClass = this._UnwrapScriptInterface(iObjectClass)
		if (!objectClass || !(objectClass instanceof C3.ObjectClass)) throw new Error('invalid IObjectClass')
		return objectClass
	}

	_UnwrapIWorldInstance(iinst) {
		if (!(iinst instanceof self.IWorldInstance)) throw new TypeError('expected IWorldInstance')
		const inst = this._UnwrapScriptInterface(iinst)
		if (!inst || !(inst instanceof C3.Instance)) throw new Error('invalid IInstance')
		return inst
	}
}
self['C3_CreateRuntime'] = C3.Runtime.Create
self['C3_InitRuntime'] = (runtime, opts) => runtime.Init(opts)
