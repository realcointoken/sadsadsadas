import { Bip32Path, Bip39, Ed25519 } from '@iota/crypto.js';
import {
  Bech32Helper,
  Ed25519Address,
  Ed25519Seed,
  ED25519_ADDRESS_TYPE,
  generateBip44Address,
  IndexerPluginClient,
  SingleNodeClient,
  type IAddress,
  type IClient,
  type IKeyPair,
  type INodeInfo,
  type IOutputsResponse,
} from '@iota/iota.js';

export class IotaWallet {
  private faucetEndpointUrl: string;

  public client: IClient;
  public indexer: IndexerPluginClient;

  private keyPair: IKeyPair;
  public nodeInfo: INodeInfo;
  public address: IAddress;

  get publicKey(): Uint8Array {
    return this.keyPair.publicKey;
  }

  constructor(
    client: SingleNodeClient,
    indexer: IndexerPluginClient,
    faucetEndpointUrl: string,
  ) {
    this.faucetEndpointUrl = faucetEndpointUrl;
    this.client = client;
    this.indexer = indexer;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getKeyPairFromMnemonic(mnemonic: string): IKeyPair {
    const baseSeed = Ed25519Seed.fromMnemonic(mnemonic);

    const path = generateBip44Address({
      accountIndex: 0,
      addressIndex: 0,
      isInternal: false,
    });

    const addressSeed = baseSeed.generateSeedFromPath(new Bip32Path(path));
    const addressKeyPair = addressSeed.keyPair();

    return addressKeyPair;
  }

  private async sendFaucetRequest(addressBech32: string): Promise<void> {
    const requestObj = JSON.stringify({ address: addressBech32 });
    const response = await fetch(`${this.faucetEndpointUrl}/api/enqueue`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: requestObj,
    });

    if (response.status == 202) {
      return;
    }

    // Future error handling
    if (response.status === 429) {
      throw new Error('Too many requests. Please, try again later.');
    } else {
      const result = await response.json();
      throw new Error(result.error.message);
    }
  }

  private async getFaucetRequestOutputID(
    addressBech32: string,
  ): Promise<IOutputsResponse> {
    const maxRetries = 20;

    for (let i = 0; i < maxRetries; i++) {
      const output = await this.indexer.basicOutputs({
        addressBech32: addressBech32,
        hasExpiration: false,
        hasStorageDepositReturn: false,
        hasTimelock: false,
        hasNativeTokens: false,
      });

      if (output.items.length > 0) {
        return output;
      }

      await this.delay(2000);
    }

    throw new Error('Failed to find faucet output');
  }

  private async getBalance(outputId: string): Promise<bigint> {
    const output = await this.client.output(outputId);

    if (output != null) {
      return BigInt(output.output.amount);
    }

    throw new Error('Failed to fetch output');
  }

  public async requestFunds(): Promise<bigint> {
    const addressBech32 = Bech32Helper.toBech32(
      ED25519_ADDRESS_TYPE,
      this.address.toAddress(),
      this.nodeInfo.protocol.bech32Hrp,
    );

    await this.sendFaucetRequest(addressBech32);
    const output = await this.getFaucetRequestOutputID(addressBech32);
    const balance = await this.getBalance(output.items[0]);

    if (balance == BigInt(0)) {
      throw new Error('Requested balance is zero');
    }

    return balance;
  }

  public async initialize(): Promise<void> {
    const randomMnemonic = Bip39.randomMnemonic();
    await this.initializeFromMnemonic(randomMnemonic);
  }

  public async initializeFromMnemonic(mnemonic: string): Promise<void> {
    this.nodeInfo = await this.client.info();
    this.keyPair = this.getKeyPairFromMnemonic(mnemonic);
    this.address = new Ed25519Address(this.keyPair.publicKey);
  }

  public sign(buffer: Uint8Array) {
    return Ed25519.sign(this.keyPair.privateKey, buffer);
  }
}
