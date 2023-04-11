import { selectedAccount, web3 } from 'svelte-web3';
import { get } from 'svelte/store';

import { indexerClient, nodeClient } from '$lib/evm-toolkit';

import { updateWithdrawStateStore, withdrawStateStore } from '../stores';

export async function pollBalance() {
  const $withdrawStateStore = get(withdrawStateStore);
  const availableBaseTokens = await $withdrawStateStore.iscMagic.getBaseTokens(
    get(web3).eth,
    get(selectedAccount),
  );
  updateWithdrawStateStore({ availableBaseTokens });
}

export async function pollNativeTokens() {
  const $withdrawStateStore = get(withdrawStateStore);
  const $selectedAccount = get(selectedAccount);

  if (!$selectedAccount) {
    return;
  }

  const availableNativeTokens =
    await $withdrawStateStore.iscMagic.getNativeTokens(
      get(nodeClient),
      get(indexerClient),
      $selectedAccount,
    );
  updateWithdrawStateStore({ availableNativeTokens });
}

export async function pollNFTs() {
  const $withdrawStateStore = get(withdrawStateStore);
  const $selectedAccount = get(selectedAccount);

  if (!$selectedAccount) {
    return;
  }

  const availableNFTs = await $withdrawStateStore.iscMagic.getNFTs(
    get(nodeClient),
    get(indexerClient),
    $selectedAccount,
  );
  updateWithdrawStateStore({ availableNFTs });
}

export async function pollAccount() {
  await Promise.all([pollBalance(), pollNativeTokens(), pollNFTs()]);
}
