import { useWriteContract,useWaitForTransactionReceipt } from "wagmi";
import { bookingAbi, bookingAddress } from "@/constants";
import { toast } from "sonner";
import AddReviewModal from "./AddReviewModal";
import { useEffect } from "react";

interface RoomCardProps {
  room: any;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { data: hash, isPending, writeContractAsync,error, } = useWriteContract();

  const getImageByCategory = (category: string) => {
    switch (category) {
      case "Presidential":
        return "/2071.jpg";
      case "Deluxe":
        return "/2149.jpg";
      case "Suite":
        return "/7715.jpg";
      default:
        return "/7715.jpg";
    }
  };

  const getCategoryLabel = (category: number) => {
    switch (category) {
      case 0:
        return "Presidential";
      case 1:
        return "Deluxe";
      case 2:
        return "Suite";
      default:
        return "";
    }
  };

  const handleBookRoom = async () => {
    const checkIn = new Date(2024, 10, 1);
    const checkOut = new Date(2024, 10, 2);
    const checkInTimestamp = checkIn.getTime() / 1000;
    const checkOutTimestamp = checkOut.getTime() / 1000;
    try {
      const bookRoomTx = await writeContractAsync({
        abi: bookingAbi,
        address: bookingAddress,
        functionName: "bookRoomByCategory",
        args: [room.category, 1730390400, 1730390401],
      });
      
      console.log("room booking hash:", bookRoomTx);
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
    }
  };

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
  useWaitForTransactionReceipt({
    hash,
  });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Transaction Pending");
    }
    if (isConfirmed) {
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
  }, [isConfirming, isConfirmed, error, hash]);

  return (
    <div className="border p-4 m-4">
      <img
        src={getImageByCategory(getCategoryLabel(room.category))}
        alt="Room"
        className="w-full h-56 object-cover mb-4"
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold">
            {getCategoryLabel(room.category)}
          </h3>
          <p className="text-md">
            Price per Night: {room.pricePerNight?.toString()}
          </p>
          <p className="text-sm">
            Availability: {room.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-2">Reviews:</h4>
          {room.reviews?.length > 0 ? (
            room.reviews.map((review: any, index: any) => (
              <div className="text-sm" key={index}>
                <p className="">
                  {review.comment} - {review.rating} stars
                </p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}

          <div className="flex gap-3">
            {room.isAvailable && (
              <button
                onClick={handleBookRoom}
                disabled={isPending}
                className="bg-green-600 text-white p-2 mt-2"
              >
                {isPending ? "Loading" : "Book Room"}
              </button>
            )}

            <AddReviewModal>
              <button className="bg-gray-600 text-white p-2 mt-2">
                Add Review
              </button>
            </AddReviewModal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
