self.C3.Plugins.ndream_AirConsole.Acts =
	{
		GameReady() {
			/*			this.gameReady = true
						let deviceIds = this.airConsole.getControllerDeviceIds()
						for (let i = 0; i < deviceIds.length; i++) {
							this.airConsole.onConnect(deviceIds[i])
						}*/
			console.log('This is the \'Log to console\' action. Test property = ' + this.maxPlayers())
		},
		Message(deviceId, property, value) {
			if (property !== 'message') {
				console.warn('Property other than "message" isn\'t currently supported')
			}

			let obj = this.parseJSON(value)
			if (obj !== false) {
				value = obj
			}

			this.airConsole.message(deviceId, value)
		},
		Broadcast(property, message) {
			this.airConsole.broadcast(message)
		},
		SetCustomDeviceStateProperty(property, value) {
			this.airConsole.setCustomDeviceState(property, value)
		},
		RequestHighScores(level_name, level_version, uids, ranks, total, top) {
			this.highscores = null
			let uidsArray
			if (uids === 'all') {
				uidsArray = ''
			} else if (uids.indexOf(',') > -1) {
				uidsArray = uids.split(',')
			} else {
				uidsArray = [uids]
			}
			let ranksArray = (ranks === 'world') ? [ranks] : ranks.split(',')
			this.airConsole.requestHighScores(level_name, level_version, uidsArray, ranksArray, total, top)
		},
		StoreHighScores(level_name, level_version, score, uid, data, score_string) {
			let uidArray = uid.split(',')
			this.airConsole.storeHighScore(level_name, level_version, score, uidArray, data, score_string)
		},
		SetActivePlayers(max_players) {
			this.airConsole.setActivePlayers(max_players)
		},
		ShowAd() {
			this.airConsole.showAd()
		},
		NavigateHome() {
			this.airConsole.navigateHome()
		},
		NavigateTo(url) {
			this.airConsole.navigateTo(url)
		},
		RequestPersistentData(uids) {
			this.persistentData = null
			let uidsArray = (uids.indexOf(',') > -1) ? uids.split(',') : [uids]
			this.airConsole.requestPersistentData(uidsArray)
		},
		StorePersistentData(key, value, uid) {
			this.airConsole.storePersistentData(key, value, uid)
		},
		SendPresetMessage(deviceId) {
			if (this.runningOffline) return

			this.airConsole.message(deviceId, this.presetMessage)
			this.presetMessage = {}
		},
		BroadcastPresetMessage() {
			this.airConsole.broadcast(this.presetMessage)
			this.presetMessage = {}
		},
		SetPresetMessage(key, value) {
			this.presetMessage[key] = value
		},
		ClearPresetMessage() {
			this.presetMessage = {}
		},
		EditProfile() {
			if (this.isController) {
				this.airConsole.editProfile()
			} else {
				console.warn('You can\' use "Edit profile" on screen')
			}
		},
		SetOrientation(orientation) {
			if (this.isController) {
				this.airConsole.setOrientation((orientation === 1) ? AirConsole.ORIENTATION_PORTRAIT : AirConsole.ORIENTATION_LANDSCAPE)
			}
		},
		GetPremium() {
			this.airConsole.getPremium()
		},
		Vibrate(time) {
			if (this.properties[1] === 1 && time > 0) {
				this.airConsole.vibrate(time)
			}
		}
	}
