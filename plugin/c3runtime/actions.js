self.C3.Plugins.ndream_AirConsole.Acts =
	{
		GameReady() {
			this.gameReady = true
			this.PostToDOMAsync('getControllerDeviceIds').then(deviceIds => {
				for (let i = 0; i < deviceIds.length; i++) {
					this.PostToDOM('onConnect', deviceIds[i])
				}
			}).catch(r => {
				console.warn('Failed getting controller device ids:', r)
			})
		},
		StartAirconsole() {
			this.airconsoleStarted = true
			this.PostToDOMAsync('getControllerDeviceIds').then(deviceIds => {
				for (let i = 0; i < deviceIds.length; i++) {
					this.PostToDOM('onConnect', deviceIds[i])
				}
			}).catch(_ => {
				console.warn('Failed starting Airconsole')
			})
		},
		Message(deviceId, property, value) {
			if (property !== 'message') {
				console.warn('Property other than "message" isn\'t currently supported')
				return
			}

			let obj = this.parseJSON(value)
			if (obj !== false) {
				value = obj
			} else {
				if (obj instanceof String) {
					value = JSON.stringify({
						'message': value
					})
				}
			}
			this.PostToDOM('message', {'deviceId': deviceId, 'value': value})
		},
		Broadcast(property, message) {
			this.PostToDOM('broadcast', message)
		},
		SetCustomDeviceStateProperty(property, value) {
			this.PostToDOM('setCustomDeviceState', {'property': property, 'value': value})
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

			this.PostToDOM('requestHighScores', {
				'level_name': level_name,
				'level_version': level_version,
				'uidsArray': uidsArray,
				'ranksArray': ranksArray,
				'total': total,
				'top': top
			})
		},
		StoreHighScores(level_name, level_version, score, uid, data, score_string) {
			let uidArray = uid.split(',')
			this.PostToDOM('storeHighScores', {
				'level_name': level_name,
				'level_version': level_version,
				'score': score,
				'uidArray': uidArray,
				'data': data,
				'score_string': score_string
			})
		},
		SetActivePlayers(max_players) {
			this.PostToDOM('setActivePlayers', max_players)
		},
		ShowAd() {
			this.PostToDOM('showAd')
		},
		NavigateHome() {
			this.PostToDOM('navigateHome')
		},
		NavigateTo(url) {
			this.PostToDOM('navigateTo', url)
		},
		RequestPersistentData(uids) {
			this.persistentData = null
			let uidsArray = (uids.indexOf(',') > -1) ? uids.split(',') : [uids]
			this.PostToDOM('requestPersistentData', uidsArray)
		},
		StorePersistentData(key, value, uid) {
			this.PostToDOM('storePersistentData', {
				'key': key,
				'value': value,
				'uid': uid
			})
		},
		SendPresetMessage(deviceId) {
			if (this.runningOffline) return

			this.PostToDOM('message', {'deviceId': deviceId, 'value': this.presetMessage})
			this.presetMessage = {}
		},
		BroadcastPresetMessage() {
			this.PostToDOM('broadcast', this.presetMessage)
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
				this.PostToDOM('editProfile')
			} else {
				console.warn('You can\' use "Edit profile" on screen')
			}
		},
		SetOrientation(orientation) {
			if (this.isController) {
				this.PostToDOM('setOrientation', orientation)
			}
		},
		GetPremium() {
			this.PostToDOM('getPremium')
		},
		Vibrate(time) {
			if (this.properties[1] === 1 && time > 0) {
				this.PostToDOM('vibrate', time)
			}
		}
	}
