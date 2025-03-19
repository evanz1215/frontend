import { useSuiClientQuery } from "@mysten/dapp-kit";
import { useNetworkVariable } from "../config/networkConfig";
import { SuiObjectData } from "@mysten/sui/client";
import { ProposalItem } from "../components/proposal/ProposalItem";
import { useVoteNfts } from "../hooks/useVoteNfts";

const ProposalView = () => {
  const dashboardId = useNetworkVariable("dashboardId");
  const { data: voteNfts } = useVoteNfts();

  const {
    data: dataResponse,
    isPending,
    error,
  } = useSuiClientQuery("getObject", {
    id: dashboardId,
    options: {
      showContent: true,
    },
  });

  console.log(voteNfts);

  if (isPending) {
    return <div className="text-center text-gray-500">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  if (!dataResponse.data) {
    return <div className="text-center text-red-500">Not Found...</div>;
  }

  return (
    <>
      <h1 className="mb-8 text-4xl font-bold">New Proposal</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {getDashboardFields(dataResponse.data)?.proposals_ids.map((id) => (
          <ProposalItem key={id} id={id} />
        ))}
      </div>
    </>
  );
};

function getDashboardFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") {
    return null;
  }

  return data.content.fields as {
    id: SuiID;
    proposals_ids: string[];
  };
}

export default ProposalView;
