const request = require('request');
const crypto = require('crypto');
const utf8 = require('utf8');
const qs = require('querystring');

class KrakenFuturesApiV3 {
	constructor(baseUrl, apiKey, apiSecret, timeout) {
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.apiSecret = apiSecret;
		this.timeout = timeout;
	}

	getInstruments() {
		let requestOptions = {
			url: this.baseUrl + '/api/v3/instruments',
			method: 'GET',
			headers: {'Accept': 'application/json'},
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getInstruments(): ')
	};

	getTickers() {
		let requestOptions = {
			url: this.baseUrl + '/api/v3/tickers',
			method: 'GET',
			headers: {'Accept': 'application/json'},
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getTickers(): ')
	};

	getOrderbook(symbol) {
		let params = qs.stringify({'symbol': symbol});
		let requestOptions = {
			url: this.baseUrl + '/api/v3/orderbook?' + params,
			method: 'GET',
			headers: {'Accept': 'application/json'},
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getOrderbook(): ')
	};

	getHistory(symbol, lastTime = null) {
		let params = {'symbol': symbol};
		if (lastTime) {
			params[lastTime] = lastTime;
		}
		let requestOptions = {
			url: this.baseUrl + '/api/v3/history?' + qs.stringify(params),
			method: 'GET',
			headers: {'Accept': 'application/json'},
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getHistory(): ')
	};

	getAccounts() {
		let endpoint = '/api/v3/accounts';
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce);
		let headers = {'Accept': 'application/json', 'APIKey': this.apiKey, 'Nonce': nonce, 'Authent': authent};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getAccounts(): ')
	};

	sendOrder(orderType, symbol, side, size, limitPrice, stopPrice = null, clientOrderId = null) {
		let endpoint = '/api/v3/sendorder';
		let nonce = createNonce();
		let data = `orderType=${orderType}&symbol=${symbol}&side=${side}&size=${size}&limitPrice=${limitPrice}`;
		if (stopPrice) data.concat(`&stopPrice=${stopPrice}`);
		if (clientOrderId) data.concat(`&cliOrdId=${clientOrderId}`);
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'sendOrder(): ')
	};

	editOrder(edit) {
		let endpoint = '/api/v3/editorder';
		let nonce = createNonce();
		let data = qs.encode(edit);
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'editOrder(): ');
	};

	cancelOrder(orderId, cliOrdId) {
		let endpoint = '/api/v3/cancelorder';
		let data;
		if (orderId) data = `order_id=${orderId}`;
		else data = `cliOrdId=${cliOrdId}`;
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'cancelOrder(): ');
	};

	cancelAllOrders(symbol = null) {
		let endpoint = '/api/v3/cancelallorders';
		let data;
		if (symbol) data = `symbol=${symbol}`;
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'cancelAllOrders(): ');
	};

	withdraw(targetAddress, currency, amount) {
		let endpoint = '/api/v3/withdrawal';
		let data = `targetAddress=${targetAddress}&currency=${currency}&amount=${amount}`
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'withdraw(): ');
	};

	cancelAllOrdersAfter(timeout) {
		let endpoint = '/api/v3/cancelallordersafter';
		let data;
		if (timeout) data = `timeout=${timeout}`;
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'cancelAllOrdersAfter(): ');
	};

	batchOrder(elementJson) {
		let endpoint = '/api/v3/batchorder';
		let data = `json=${JSON.stringify(elementJson)}`;
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, data);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
			'Content-Type': 'application/x-www-form-urlencoded',
			'Content-Length': data.length
		};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'POST',
			headers: headers,
			body: data
		};
		return makeRequest(requestOptions, 'batchOrder(): ');
	};

	getOpenOrders() {
		let endpoint = '/api/v3/openorders';
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce);
		let headers = {'Accept': 'application/json', 'APIKey': this.apiKey, 'Nonce': nonce, 'Authent': authent};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getOpenOrders(): ');
	};

	getOpenPositions() {
		let endpoint = '/api/v3/openpositions';
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce);
		let headers = {'Accept': 'application/json', 'APIKey': this.apiKey, 'Nonce': nonce, 'Authent': authent};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getOpenPositions(): ');
	};

	getRecentOrders(symbol = null) {
		let endpoint = '/api/v3/recentorders';
		let params = symbol ? `symbol=${symbol}` : '';
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, params);
		let headers = {'Accept': 'application/json', 'APIKey': this.apiKey, 'Nonce': nonce, 'Authent': authent};
		let requestOptions = {
			url: `${this.baseUrl}${endpoint}?${encodeURI(params)}`,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getRecentOrders(): ');
	};

	getFills(lastFillTime = null) {
		let endpoint = '/api/v3/fills';
		let params = lastFillTime ? `lastFillTime=${lastFillTime}` : '';
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce, params);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
		};
		let requestOptions = {
			url: `${this.baseUrl}${endpoint}?${encodeURI(params)}`,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getFills(): ');
	};

	getTransfers(lastTransferTime = null) {
		let endpoint = '/api/v3/transfers';
		let nonce = createNonce();
		let params = lastTransferTime ? `lastTransferTime= ${lastTransferTime}` : '';
		let authent = this.signRequest(endpoint, nonce, params);
		let headers = {
			'Accept': 'application/json',
			'APIKey': this.apiKey,
			'Nonce': nonce,
			'Authent': authent,
		};
		let requestOptions = {
			url: `${this.baseUrl}${endpoint}?${encodeURI(params)}`,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getTransfers(): ');
	};

	getNotifications() {
		let endpoint = '/api/v3/notifications';
		let nonce = createNonce();
		let authent = this.signRequest(endpoint, nonce);
		let headers = {'Accept': 'application/json', 'APIKey': this.apiKey, 'Nonce': nonce, 'Authent': authent};
		let requestOptions = {
			url: this.baseUrl + endpoint,
			method: 'GET',
			headers: headers,
			timeout: this.timeout
		};
		return makeRequest(requestOptions, 'getNotifications(): ');
	};

	signRequest(endpoint, nonce, postData = '') {
		// step 1: concatenate postData, nonce + endpoint
		let message = postData + nonce + endpoint;
		// Step 2: hash the result of step 1 with SHA256
		let hash = crypto.createHash('sha256').update(utf8.encode(message)).digest();
		// step 3: base64 decode apiPrivateKey
		let secretDecoded = Buffer.from(this.apiSecret, 'base64');
		// step 4: use result of step 3 to hash the resultof step 2 with
		let hash2 = crypto.createHmac('sha512', secretDecoded).update(hash).digest();
		// step 5: base64 encode the result of step 4 and return
		return Buffer.from(hash2).toString('base64');
	};

};

function makeRequest(requestOptions, printName) {
	return new Promise((resolve, reject) => {
		request(requestOptions, function (error, response, body) {
			if (error) {
				reject(error);
			} else {
				resolve({'name': printName, 'body': body})
			};
		});
	});
};

// Generate nonce
let nonce = 0;
function createNonce() {
	if (nonce === 9999) nonce = 0;
	let timestamp = (new Date()).getTime();
	return timestamp + ('0000' + nonce++).slice(-5);
};

module.exports = { CfRestApiV3 };
