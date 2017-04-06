const pkgcloud = require('pkgcloud');

const config = {
    provider            : 'openstack',
    useServiceCatalog   : true,
    useInternal         : false,
    keystoneAuthVersion : 'v3',
    authUrl             : 'https://identity.open.softlayer.com',
    tenantId            : '[REPLACE ME]',    //projectId from credentials
    domainId            : '[REPLACE ME]',
    username            : '[REPLACE ME]',
    password            : '[REPLACE ME]',
    region              : '[REPLACE ME]'   //dallas or london region
};

module.exports = pkgcloud.storage.createClient(config);

