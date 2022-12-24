self.C3.Plugins.ndream_AirConsole.Exps =
	{
		DeviceId() {
			return this.deviceId
		},
		Message() {
			if (typeof this.message === 'object') {
				if (Object.keys(this.message).length === 1) {
					return this.message[Object.keys(this.message)[0]]
				} else {
					return JSON.stringify(this.message)
				}
			} else {
				return this.message
			}
		},
		MessageAtProperty(property) {
			if (typeof this.message === 'object' && this.message.hasOwnProperty(property)) {
				return this.message[property]
			} else {
				console.warn('MessageAtProperty - Tried to access a non existing property')
			}
		},
		IsMultipartMessage() {
			if (this.message !== null && typeof this.message === 'object' && Object.keys(this.message).length > 1) {
				return 1
			} else {
				return 0
			}
		},
		MessageHasProperty(property) {
			if (this.message !== null && typeof this.message === 'object' && this.message.hasOwnProperty(property)) {
				return 1
			} else {
				return 0
			}
		},
		MessageAsJSON() { //TODO c3 dict?
			let c3Dictionary = {}
			c3Dictionary['c3dictionary'] = true
			c3Dictionary['data'] = this.getProperties(this.message)
			return JSON.stringify(c3Dictionary)
		},
		GetProfilePicture(deviceId) {
			this.PostToDOMAsync('getProfilePicture', deviceId).then(data => {
				return data
			})
		},
		GetProfilePictureWithSize(deviceId, pictureSize) {
			this.PostToDOMAsync('getProfilePictureWithSize', {'deviceId': deviceId, 'pictureSize': pictureSize}).then(data => {
				return data
			})
		},
		GetNickname(deviceId) {
			this.PostToDOMAsync('getNickname', deviceId).then(data => {
				return data
			})
		},
		GetUID(deviceId) {
			this.PostToDOMAsync('getUID', deviceId).then(data => {
				return data
			})
		},
		GetMessagePropertiesCount() {
			if (this.message !== null && typeof this.message === 'object') {
				return Object.keys(this.message).length
			} else {
				return 0
			}
		},
		GetMasterControllerDeviceId() {
			this.PostToDOMAsync('getMasterControllerDeviceId').then(id => {
				return id
			})
		},
		ConvertPlayerNumberToDeviceId(playerNumber) {
			this.PostToDOMAsync('convertPlayerNumberToDeviceId', playerNumber).then(id => {
				return id
			})
		},
		ConvertDeviceIdToPlayerNumber(deviceId) {
			this.PostToDOMAsync('convertDeviceIdToPlayerNumber').then(playerNumber => {
				return playerNumber
			})
		},
		IsPremium(deviceId) {
			this.PostToDOMAsync('isPremium', deviceId).then(isPremium => {
				return isPremium !== false ? 1 : 0
			})
		},
		GetControllerDeviceIds() {
			this.PostToDOMAsync('getControllerDeviceIds').then(arr => {
				// noinspection DuplicatedCode
				let c3array = {}
				c3array['c3array'] = true
				c3array['size'] = [arr.length, 1, 1]
				let data = []
				for (let i in arr) {
					data.push([[arr[i]]])
				}
				c3array['data'] = data

				return JSON.stringify(c3array)
			})
		},
		GetPersistentData() {
			if (this.persistentData !== null) {
				let c3Dictionary = {}
				c3Dictionary['c3dictionary'] = true
				c3Dictionary['data'] = this.getProperties(this.persistentData)
				return JSON.stringify(c3Dictionary)
			} else {
				console.warn('Persistent data requested but they weren\'t loaded. Did you forget to use RequestPersistentData?')
				return ''
			}
		},
		GetHighscores() {
			if (this.highscores !== null) {
				let c3Dictionary = {}
				c3Dictionary['c3dictionary'] = true
				c3Dictionary['data'] = this.getProperties(this.highscores)
				return JSON.stringify(c3Dictionary)
			} else {
				console.warn('Highscores data requested but they weren\'t loaded. Did you forget to use RequestHighscores?')
				return ''
			}
		},
		IsPluginOffline() {
			if (this.runningOffline) {
				return 1
			} else {
				return 0
			}
		},
		GetActivePlayerDeviceIds() {
			this.PostToDOMAsync('getActivePlayerDeviceIds').then(data => {
				return data
			})
		},
		IsAddShowing() {
			return this.adShowing
		},
		AdShown() {
			return this.adCompleted
		},
		GetThisDeviceId() {
			if (this.isController) {
				this.PostToDOMAsync('getDeviceId').then(id => {
					return id
				})
			} else {
				return 0
			}
		},
		MotionData() {
			if (this.motionData !== null) {
				let c2Dictionary = {}
				c2Dictionary['c2dictionary'] = true
				c2Dictionary['data'] = this.getProperties(this.motionData)
				return JSON.stringify(c2Dictionary)
			} else {
				return ''
			}
		},
		GetLanguage(deviceId) {
			if (!this.useTranslation) {
				console.log('Translation support not enabled. Please turn it on in your Construct 3 project settings.')
				return ''
			} else {
				this.PostToDOMAsync('getLanguage', deviceId).then(lang => {
					return lang
				})
			}
		},
		GetTranslation(id, values) {
			if (!this.useTranslation) {
				console.warn('Translation support not enabled. Please turn it on in your Construct 3 project settings.')
				return ''
			}

			if (!id) {
				console.warn('Cannot fetch translation without a string id')
				return ''
			}

			if (values) {
				try {
					values = JSON.parse(values)
				} catch {
					console.warn('Couldn\'t parse passed values for AirConsole GetTranslation.')
					values = {}
				}
				if (values.hasOwnProperty('foo')) {
					console.warn('Removed "foo" from translation values')
					delete values['foo']
				}
			} else {
				values = {}
			}

			this.PostToDOMAsync('getTranslation', {'id' : id, 'values': values}).then(string => {
				return string
			})
		}
	}
