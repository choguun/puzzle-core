import { parseEther } from 'viem';
import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from 'wagmi';
import { useState } from 'react';

// ABI for our game contract (simplified example)
const gameAbi = [
  {
    inputs: [{ internalType: 'uint256', name: 'stageId', type: 'uint256' }],
    name: 'completeStage',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'player', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { internalType: 'uint256', name: 'stagesCompleted', type: 'uint256' },
      { internalType: 'uint256', name: 'totalScore', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'mintNFT',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
] as const;

// Replace with your actual contract address
const contractAddress = '0x1234567890123456789012345678901234567890';

// Hook to handle stage completion transaction
export function useCompleteStage() {
  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash: txHash });
  const [error, setError] = useState<string | null>(null);

  const completeStage = async (stageId: number) => {
    try {
      setError(null);
      writeContract({
        address: contractAddress,
        abi: gameAbi,
        functionName: 'completeStage',
        args: [BigInt(stageId)],
      });
    } catch (err) {
      console.error('Failed to complete stage:', err);
      setError('Failed to record stage completion on blockchain');
    }
  };

  return {
    completeStage,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error,
  };
}

// Hook to mint completion NFT
export function useMintNFT() {
  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = 
    useWaitForTransactionReceipt({ hash: txHash });
  const [error, setError] = useState<string | null>(null);

  const mintNFT = async () => {
    try {
      setError(null);
      writeContract({
        address: contractAddress,
        abi: gameAbi,
        functionName: 'mintNFT',
        value: parseEther('0.01'), // Cost to mint - 0.01 ETH
      });
    } catch (err) {
      console.error('Failed to mint NFT:', err);
      setError('Failed to mint completion NFT');
    }
  };

  return {
    mintNFT,
    isPending: isWritePending || isConfirming,
    isSuccess: isConfirmed,
    error,
  };
}

// Hook to get player stats from contract
export function usePlayerStats(playerAddress: `0x${string}` | undefined) {
  const { data, isLoading, isError } = useReadContract({
    address: contractAddress,
    abi: gameAbi,
    functionName: 'getPlayerStats',
    args: playerAddress ? [playerAddress] : undefined,
    query: {
      enabled: !!playerAddress,
    },
  });

  return {
    stagesCompleted: data?.[0] ? Number(data[0]) : 0,
    totalScore: data?.[1] ? Number(data[1]) : 0,
    isLoading,
    isError,
  };
} 