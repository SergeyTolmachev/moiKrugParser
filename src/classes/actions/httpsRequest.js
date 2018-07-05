const https = require('https');

class HttpsRequest {

    getRequest(url) {
        return new Promise(function (resolve, reject) {
            const intervalTimer = Math.floor(Math.random() * 100) + 600;
            setTimeout(function () {
                https.get((url), resp => {
                    let data = '';
                    resp.on('data', (chunk) => {
                        data += chunk;
                    });
                    resp.on('end', () => {
                        resolve(data);
                    });
                }).on("error", (error) => {
                    reject(error);
                })

            }, intervalTimer);
        });
    }


}

const httpsRequest = new HttpsRequest();

module.exports = httpsRequest;
