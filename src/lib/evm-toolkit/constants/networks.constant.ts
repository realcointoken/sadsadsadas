import type { INetwork } from '../interfaces';

export const NETWORKS: INetwork[] = [
  {
    "id": 0,
    "text": "BullChain Faucet",
    "apiEndpoint": "https://testnet.bullchainai.com/ext/bc/bullchainTestnet/rpc",
    "faucetEndpoint": "https://faucet.testnet.shimmer.network",
    "chainAddress": "tst1pz0kc4urqxf4vh6c556gnr6uwmkwz5ye98vucakgafyneed4gft322s3gf0",
    "chainID": 911,
    "blockExplorer": "https://testnet.bullchainai.com",
    "networkUrl": "https://testnet.bullchainai.com/ext/bc/bullchainTestnet/rpc"
  },
  {
    "id": 1,
    "text": "BullChainAI",
    "apiEndpoint": "http://localhost:14265",
    "faucetEndpoint": "http://localhost:8091",
    "chainAddress": "tst1pz0kc4urqxf4vh6c556gnr6uwmkwz5ye98vucakgafyneed4gft322s3gf0",
    "chainID": 1074,
    "blockExplorer": "",
    "networkUrl": ""
  }
]
