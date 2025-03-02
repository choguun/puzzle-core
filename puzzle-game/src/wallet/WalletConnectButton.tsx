import React, { useState } from 'react';
import styled from 'styled-components';
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { injected } from 'wagmi/connectors';

const StyledButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  padding: 10px 15px;
  background-color: #9b59b6;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1000;
  
  &:hover {
    background-color: #8e44ad;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const AccountInfo = styled.div`
  position: absolute;
  top: 70px;
  right: 20px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 5px;
  font-size: 14px;
  z-index: 1000;
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function WalletConnectButton() {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
  });
  
  const [showAccount, setShowAccount] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      disconnect();
    } else {
      connect({ connector: injected() });
    }
  };

  const toggleAccountInfo = () => {
    if (isConnected) {
      setShowAccount(!showAccount);
    }
  };

  // Format the address for display
  const formatAddress = (address: string | undefined) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <>
      <StyledButton onClick={handleConnect} onMouseEnter={toggleAccountInfo} onMouseLeave={toggleAccountInfo}>
        {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
      </StyledButton>
      
      {showAccount && isConnected && (
        <AccountInfo>
          <p><strong>Address:</strong> {formatAddress(address)}</p>
          {balance && (
            <p><strong>Balance:</strong> {balance.formatted.substring(0, 6)} {balance.symbol}</p>
          )}
        </AccountInfo>
      )}
    </>
  );
} 