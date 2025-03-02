import React from 'react';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { usePlayerStats } from '../wallet/GameContract';

const StatsContainer = styled.div`
  position: absolute;
  top: 70px;
  left: 20px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 15px;
  border-radius: 8px;
  min-width: 200px;
  z-index: 1000;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  border: 1px solid #61dafb;
`;

const StatTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #61dafb;
  font-size: 18px;
  text-align: center;
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const StatLabel = styled.span`
  color: #cccccc;
`;

const StatValue = styled.span`
  color: #ffffff;
  font-weight: bold;
`;

const NotConnected = styled.p`
  color: #ff9800;
  text-align: center;
  font-style: italic;
  margin: 10px 0;
`;

const Loading = styled.div`
  text-align: center;
  color: #61dafb;
  margin: 10px 0;
`;

export function PlayerStats() {
  const { address, isConnected } = useAccount();
  const { stagesCompleted, totalScore, isLoading, isError } = usePlayerStats(address);

  if (!isConnected) {
    return (
      <StatsContainer>
        <StatTitle>Blockchain Stats</StatTitle>
        <NotConnected>Connect wallet to view stats</NotConnected>
      </StatsContainer>
    );
  }

  if (isLoading) {
    return (
      <StatsContainer>
        <StatTitle>Blockchain Stats</StatTitle>
        <Loading>Loading stats...</Loading>
      </StatsContainer>
    );
  }

  if (isError) {
    return (
      <StatsContainer>
        <StatTitle>Blockchain Stats</StatTitle>
        <NotConnected>Error loading stats</NotConnected>
      </StatsContainer>
    );
  }

  return (
    <StatsContainer>
      <StatTitle>Blockchain Stats</StatTitle>
      <StatRow>
        <StatLabel>Completed Stages:</StatLabel>
        <StatValue>{stagesCompleted}</StatValue>
      </StatRow>
      <StatRow>
        <StatLabel>Total Score:</StatLabel>
        <StatValue>{totalScore}</StatValue>
      </StatRow>
      <StatRow>
        <StatLabel>Player Rank:</StatLabel>
        <StatValue>
          {totalScore > 5000 ? 'Master' : 
           totalScore > 2000 ? 'Expert' : 
           totalScore > 1000 ? 'Skilled' : 'Beginner'}
        </StatValue>
      </StatRow>
    </StatsContainer>
  );
} 