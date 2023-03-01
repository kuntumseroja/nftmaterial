module.exports = {
  swcMinify: true,
  env: {
    ALCHEMY_API: process.env.ALCHEMY_API,
    INFURA_API: process.env.INFURA_API,
    INFURA_IPFS_ID: process.env.INFURA_IPFS_ID,
    INFURA_IPFS_SECRET: process.env.INFURA_IPFS_SECRET,
    INFURA_IPFS_DOMAIN: process.env.INFURA_IPFS_DOMAIN,
    PRIVATE_KEY: process.env.PRIVATE_KEY,
    MUMBAI_URL: process.env.MUMBAI_URL,
    MARKETPLACE_ADDRESS: '0x977685694c66df1ede6c2807cc0eefc22cad1de5',
  },
};
