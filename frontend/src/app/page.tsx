"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import { bookingAbi, bookingAddress, tokenAbi, tokenAddress, } from "@/constants";
import { useReadContract,useWaitForTransactionReceipt,useWriteContract,useAccount,useBalance  } from "wagmi";
import RoomCard from "@/components/RoomCard";
import AddRoomModal from "@/components/AddRoomModal";
import { toast } from "sonner";

export default function Home() {
  const [rooms, setRooms] = useState<any>([]);
  const { isConnected, address,chainId } = useAccount();

  const { data: roomData } = useReadContract({
    abi: bookingAbi,
    address: bookingAddress,
    functionName: "getAllRooms",
  });
  

  const { data: balanceData } = useBalance ({
    address: tokenAddress,
    chainId: chainId,
  });


  const { data: hash, isPending, writeContractAsync,error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } =useWaitForTransactionReceipt({hash,});

  useEffect(() => {
    let toastId;
    if (isConfirming) {
      toastId = toast.loading("Transaction Pending");
    }
    if (isConfirmed) {
      toast.dismiss(toastId);
      toast.success("Transaction Successful", {
        action: {
          label: "View on Etherscan",
          onClick: () => {
            window.open(`https://explorer-holesky.morphl2.io/tx/${hash}`);
          },
        },
      });
    }
    if (error) {
      toast.error("Transaction Failed");
    }
    if (roomData) {
      setRooms(roomData);
    }

  }, [roomData,isConfirming, isConfirmed, error, hash,balanceData]);

  const getToken = async () => {
    try {
      const getTokenTx = await writeContractAsync({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "mint",
        args: [100],
      });
      console.log("getToken hash:", getTokenTx);
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
      console.log("Transaction Failed: " + err.message);
    }
  };

  return (
    <main>
      <section className="py-12 flex  items-center justify-between ">
        <h1 className="text-lg font-bold">Owner actions</h1>
        <div className="flex items-center gap-2">
          <AddRoomModal>
            <Button>Add room</Button>
          </AddRoomModal>

          {/* <Button>Set availability</Button> */}
          <Button onClick={getToken}>Get Token</Button>
        </div>
      </section>
      <section className="py-4">
        {balanceData !== undefined && balanceData !== null && (
          <h2 className="text-lg font-semibold">Balance: {balanceData.value}</h2>
        )}
      </section>
      <div>
        {rooms.length > 0 ? (
          rooms?.map((room: any) => (
            <>
              {console.log(room)}
              <RoomCard key={room.id} room={room} />
            </>
          ))
        ) : (
          <div>
            <h1 className="text-2xl font-semibold">No rooms available</h1>
          </div>
        )}
      </div>
    </main>
  );
}
