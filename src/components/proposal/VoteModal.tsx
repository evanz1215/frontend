import { FC, useRef } from "react";
import { Proposal } from "../../types";
import {
  ConnectButton,
  useCurrentWallet,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { useNetworkVariable } from "../../config/networkConfig";
import { Transaction } from "@mysten/sui/transactions";
import { toast } from "react-toastify";

type VoteModalProps = {
  proposal: Proposal;
  isOpen: boolean;
  onClose: () => void;
  onVote: (votedYes: boolean) => void;
};

export const VoteModal: FC<VoteModalProps> = ({
  proposal,
  isOpen,
  onClose,
  onVote,
}) => {
  const { connectionStatus } = useCurrentWallet();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const packageId = useNetworkVariable("packageId");
  const toastId = useRef<number | string>();

  if (!isOpen) return null;

  const showToast = (message: string) => (toastId.current = toast(message));
  const dismissToast = (message: string) => {
    toast.dismiss(toastId.current);
    toast(message, {
      autoClose: 2000,
    });
  };

  const vote = (voteYes: boolean) => {
    const tx = new Transaction();

    tx.moveCall({
      arguments: [
        tx.object(proposal.id.id),
        tx.pure.bool(voteYes),
        tx.object("0x6"),
      ],
      target: `${packageId}::proposal::vote`,
    });
    showToast("Processing Transaction...");
    signAndExecute(
      {
        transaction: tx,
      },
      {
        onError: () => {
          dismissToast("Transaction failed!");
        },
        onSuccess: async ({ digest }) => {
          await suiClient.waitForTransaction({
            digest,
            options: {
              showEffects: true,
            },
          });

          // const objectId = effects?.created?.[0]?.reference.objectId;

          dismissToast("Transaction successful!");
          onVote(voteYes);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg dark:bg-gray-800">
        <h2 className="mb-4 text-2xl font-bold">{proposal.title}</h2>
        <p className="mb-6 text-gray-700 dark:text-gray-300">
          {proposal.description}
        </p>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>👍Yes votes: {proposal.votedYesCount}</span>
            <span>👎No votes: {proposal.votedNoCount}</span>
          </div>
          <div className="flex justify-between gap-4">
            {connectionStatus == "connected" ? (
              <>
                <button
                  onClick={() => vote(true)}
                  className="flex-1 px-6 py-2 text-white transition-colors bg-green-500 rounded hover:bg-green-600"
                >
                  Vote Yes
                </button>
                <button
                  onClick={() => vote(false)}
                  className="flex-1 px-6 py-2 text-white transition-colors bg-red-500 rounded hover:bg-red-600"
                >
                  Vote No
                </button>
              </>
            ) : (
              <div>
                <ConnectButton />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 transition-colors border border-gray-300 rounded dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
