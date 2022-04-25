import { SignerWallet, SolanaProvider } from "@saberhq/solana-contrib";
import {
  Fraction,
  getATAAddress,
  getMintInfo,
  getTokenAccount,
  Token,
} from "@saberhq/token-utils";
import { Connection, Keypair } from "@solana/web3.js";
import * as fs from "fs/promises";
import invariant from "tiny-invariant";

export const fetchRebase = async (): Promise<void> => {
  const provider = SolanaProvider.load({
    connection: new Connection("https://sencha.rpcpool.com"),
    wallet: new SignerWallet(Keypair.generate()),
  });

  const solust = Token.fromMint(
    "JAa3gQySiTi8tH3dpkvgztJWHQC1vGXr5m6SQ9LEM55T",
    6
  );
  const yi = Token.fromMint("CGczF9uYdSVXmSr9swMafhF1ktHsi6ygcgTHWL71XNZ9", 6);
  const yiAuthority = (await getMintInfo(provider, yi.mintAccount))
    .mintAuthority;

  invariant(yiAuthority);

  const stakeATA = await getATAAddress({
    mint: solust.mintAccount,
    owner: yiAuthority,
  });
  const yiMintInfo = await getMintInfo(provider, yi.mintAccount);
  const tokenAccount = await getTokenAccount(provider, stakeATA);

  const rebaseIndex = new Fraction(tokenAccount.amount, yiMintInfo.supply);

  await fs.writeFile(
    "data/rebase.json",
    JSON.stringify(rebaseIndex.asNumber, null, 2)
  );

  console.log(`Rebase index is ${rebaseIndex.asNumber}`);
};

fetchRebase().catch((err) => console.error(err));
