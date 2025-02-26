import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PuzzleScene } from '../game/scenes/PuzzleScene';
import styled from 'styled-components';

const GameWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(40, 44, 52, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 10;
`;

const Spinner = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top: 4px solid #61dafb;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: rgba(220, 53, 69, 0.9);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  max-width: 80%;
  z-index: 20;

  button {
    background-color: white;
    color: #dc3545;
    border: none;
    padding: 8px 16px;
    margin-top: 15px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
  }
`;

const Game = () => {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    initGame();
  };

  const initGame = () => {
    if (gameRef.current && !gameInstance.current) {
      try {
        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: 800,
          height: 600,
          parent: gameRef.current,
          backgroundColor: '#333333',
          scene: [PuzzleScene],
          physics: {
            default: 'arcade',
            arcade: {
              gravity: { x: 0, y: 0 },
              debug: false
            }
          },
          callbacks: {
            postBoot: () => {
              setLoading(false);
            }
          }
        };

        // Create the game instance
        gameInstance.current = new Phaser.Game(config);
        
        // Set a timeout to ensure loading state is updated even if postBoot doesn't fire
        setTimeout(() => {
          setLoading(false);
        }, 2000);
      } catch (err) {
        console.error('Error initializing Phaser game:', err);
        setError('Could not initialize the game. Please try again.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // Initialize game
    initGame();

    // Cleanup function to destroy the game when component unmounts
    return () => {
      if (gameInstance.current) {
        try {
          gameInstance.current.destroy(true);
        } catch (err) {
          console.error('Error during game cleanup:', err);
        }
        gameInstance.current = null;
      }
    };
  }, []);

  return (
    <GameWrapper>
      <div ref={gameRef} style={{ width: '100%', height: '100%' }} />
      
      {loading && (
        <LoadingOverlay>
          <Spinner />
          <p>Loading puzzle game...</p>
        </LoadingOverlay>
      )}
      
      {error && (
        <ErrorMessage>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <button onClick={handleRetry}>Try Again</button>
        </ErrorMessage>
      )}
    </GameWrapper>
  );
};

export default Game; 