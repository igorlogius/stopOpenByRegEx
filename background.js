
const extId = "stopOpenByRegEx";	
const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?

function log(level, msg) {
	level = level.trim().toLowerCase();
	if (['error','warn'].includes(level)
		|| ( temporary && ['debug','info','log'].includes(level))
	) {
		console[level](extId + '::' + level.toUpperCase() + '::' + msg);
	}
};


async function onUpdated(tabId, changeInfo, tabInfo) {

	if(typeof changeInfo.url !== 'string'){
		return;
	}
	if( ! /^https?:\/\//.test(changeInfo.url)) {
		return;
	}
	//log('debug','changeInfo.url := ' + changeInfo.url);

	const selectors = await ((async () => {
		try {
			const tmp = await browser.storage.local.get('selectors');
			if(typeof tmp['selectors'] !== 'undefined') {
				return tmp['selectors'];
			}
		}catch(e){
		}
		return [];
	})());

	for(const selector of selectors) {

		// check activ
		if(typeof selector.activ === 'boolean') { 
			if(selector.activ === true) { 

				// check url regex 
				if(typeof selector.url_regex === 'string') { 
					selector.url_regex = selector.url_regex.trim();
					if(selector.url_regex !== ''){ 

						if((new RegExp(selector.url_regex)).test(tabInfo.url) ){
							await browser.tabs.remove(tabId);
							browser.notifications.create(extId, {
								"type": "basic",
								"iconUrl": browser.runtime.getURL("icon.png"),
								"title": extId,
								"message":  'closed tab, RegularExpression: ' + selector.url_regex + '\n matched with target url: ' + tabInfo.url
							});
							return; 
						}
					}
				}
			}
		}
	}
}

const filter = {
	properties: ['status'] // TODO: after Fx 88 use 'url' instead of status 
}

browser.tabs.onUpdated.addListener(onUpdated /**/, filter/**/);
