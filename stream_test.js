const pkgcloud = require('pkgcloud');
const fs = require('fs');

const config = {
    provider            : 'openstack',
    useServiceCatalog   : true,
    useInternal         : false,
    keystoneAuthVersion : 'v3',
    authUrl             : '[REPLACE ME]',
    tenantId            : '[REPLACE ME]',    //projectId from credentials
    domainId            : '[REPLACE ME]',
    username            : '[REPLACE ME]',
    password            : '[REPLACE ME]',
    region              : 'dallas'   //dallas or london region
};

const storageClient = pkgcloud.storage.createClient(config);

storageClient.getContainers((err, containers) => {
	console.log('containers', containers.map(x => x.name));
});

const fileName = 'a-file.txt';

const readStream = fs.createReadStream(fileName);

const writeStream = storageClient.upload({
	container: 'tts',
	remote: fileName
});

writeStream.on('error', function(err) {
// handle your error case
});

writeStream.on('success', function(file) {
// success, file will be a File model
});

readStream.pipe(writeStream);

storageClient.download({
	container: 'tts',
	remote: fileName
}).pipe(fs.createWriteStream('a-file2.txt'));
