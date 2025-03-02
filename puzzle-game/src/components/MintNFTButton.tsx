import React from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { useMintNFT } from '../wallet/GameContract';

const StyledButton = styled.button<{ disabled: boolean }>`
  padding: 12px 20px;
  background-color: ${props => props.disabled ? '#cccccc' : '#e74c3c'};
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  margin-top: 15px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#cccccc' : '#c0392b'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 4px 8px rgba(0, 0, 0, 0.2)'};
  }
`;

const TransactionStatus = styled.div<{ success?: boolean; error?: boolean }>`
  margin-top: 10px;
  padding: 8px;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  background-color: ${props => 
    props.success ? 'rgba(46, 204, 113, 0.2)' : 
    props.error ? 'rgba(231, 76, 60, 0.2)' : 
    'rgba(52, 152, 219, 0.2)'};
  color: ${props => 
    props.success ? '#27ae60' : 
    props.error ? '#c0392b' : 
    '#2980b9'};
`;

interface MintNFTButtonProps {
  disabled?: boolean;
}

export function MintNFTButton({ disabled = false }: MintNFTButtonProps) {
  const { isConnected } = useAccount();
  const { mintNFT, isPending, isSuccess, error } = useMintNFT();

  const handleMint = () => {
    if (!disabled && isConnected) {
      mintNFT();
    }
  };

  return (
    <div>
      <StyledButton 
        onClick={handleMint} 
        disabled={disabled || !isConnected || isPending}
      >
        {isPending ? 'Minting...' : `Mint Completion NFT (0.01 ETH)`}
      </StyledButton>
      
      {isPending && (
        <TransactionStatus>
          Transaction in progress... Please wait and do not close this page.
        </TransactionStatus>
      )}
      
      {isSuccess && (
        <TransactionStatus success>
          NFT minted successfully! Check your wallet to view it.
        </TransactionStatus>
      )}
      
      {error && (
        <TransactionStatus error>
          Error: {error}
        </TransactionStatus>
      )}
      
      {!isConnected && (
        <TransactionStatus>
          Connect your wallet to mint an NFT
        </TransactionStatus>
      )}
    </div>
  );
} 