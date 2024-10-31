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

  const { data: balanceData } = useReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "balanceOf",
    args:[address]
  });

  const { data: allowData } = useReadContract({
    abi: tokenAbi,
    address: tokenAddress,
    functionName: "allowance",
    args:[address,bookingAddress]
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
      window.location.reload();
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

  const setAprove = async () => {
    try {
      const getTokenTx = await writeContractAsync({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [bookingAddress,100 * (10 ** 18)],
      });
      console.log("getToken hash:", getTokenTx);
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
      console.log("Transaction Failed: " + err.message);
    }
  };

  // 将字符串转换为数字的方法
  const parseStringToNumber = (value: string | undefined | null): number => {
    if (value === undefined || value === null) {
      return 0; // 处理空值，返回 0 或其他默认值
    }
    const parsedValue = parseFloat(value);
    return isNaN(parsedValue) ? 0 : parsedValue; // 如果解析失败，返回 0
  };

  return (
    <main>
      <section className="py-12 flex  items-center justify-between ">
        <h1 className="text-lg font-bold"> actions </h1>
        <div className="flex items-center gap-2">
          <AddRoomModal>
            <Button>Add room - only Owner </Button>
          </AddRoomModal>

          {/* <Button>Set availability</Button> */}
          <Button onClick={getToken}>Get Token 获取代币</Button>
          <Button onClick={setAprove}>Set Aprove 得到授权额度</Button>
        </div>
      </section>
      <section className="py-4">
        {balanceData !== undefined && balanceData !== null && (
          <h2 className="text-lg font-semibold">余额  Balance: {(parseStringToNumber(balanceData.toString())/10 **18)+""}</h2>
        )}
        {allowData !== undefined && allowData !== null && (
          <h2 className="text-lg font-semibold">授权额度  allowance: {(parseStringToNumber(allowData.toString())/10 **18)+""}</h2>
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
