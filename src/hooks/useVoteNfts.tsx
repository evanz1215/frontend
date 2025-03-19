import { useCurrentAccount, useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";

// "<packageId>::<module>::<typeName>"

export const useVoteNfts = () => {
  const account = useCurrentAccount();
  const packageId = useNetworkVariable("packageId");

  return useSuiClientQuery(
    "getOwnedObjects",
    {
      owner: account?.address as string,
      options: {
        showContent: true,
      },
      filter: {
        StructType: `${packageId}::proposal::VoteProofNFT`,
      },
    },
    {
      enabled: !!account,
    }
  );
};
