
(async () => {
	const manifest = browser.runtime.getManifest();
	const extId = manifest.name;

	browser.tabs.onUpdated.addListener(async function (tabId, changeInfo, tabInfo) {

		if(typeof changeInfo.url !== 'string' 
			|| !(new RegExp("^https?:\/\/")).test(changeInfo.url) ) {
			return;
		}

		const selectors = await ((async () => {
			try {
				const tmp = await browser.storage.local.get('selectors');
				if(typeof tmp['selectors'] !== 'undefined') {
					return tmp['selectors'];
				}
			}catch(e){
				console.error(e);
			}
			return [];
		})());

		for(const selector of selectors) {

			try {
				if(typeof selector.activ === 'boolean'
					&& selector.activ === true
					&& typeof selector.url_regex === 'string'
					&& selector.url_regex !== ''
					&& (new RegExp(selector.url_regex)).test(tabInfo.url) 
				){
					browser.tabs.remove(tabId);
					browser.notifications.create(extId + tabId, {
						"type": "basic",
						"iconUrl": browser.runtime.getURL("icon.png"),
						"title": extId,
						"message":  'closed tab, RegularExpression: ' + selector.url_regex + '\n matched with target url: ' + tabInfo.url
					});
					return; 
				}
			}catch(e){
				console.error(e);
			}
		}
	}, // filter 
		(await (async  () => {
		const info = await browser.runtime.getBrowserInfo();
		const major_version = info.version.split(".")[0];
		return { properties: [((major_version < 88)?'status':'url')] };
	})()));
})();
