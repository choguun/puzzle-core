import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import './App.css'
import Game from './components/Game'
import { WalletProvider } from './wallet/WalletProvider'
import { WalletConnectButton } from './wallet/WalletConnectButton'
import { PlayerStats } from './components/PlayerStats'
import { MintNFTButton } from './components/MintNFTButton'

const AppContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #282c34;
  color: white;
  position: relative;
  overflow: hidden;
`

const Header = styled.header`
  margin-bottom: 20px;
  text-align: center;
  z-index: 2;
  
  h1 {
    font-size: 2.5rem;
    color: #61dafb;
    text-shadow: 0 0 10px rgba(97, 218, 251, 0.5);
    margin: 0;
  }
  
  p {
    font-size: 1.2rem;
    color: #ccc;
    margin: 10px 0 0;
  }
`

const GameContainer = styled.div<{ compactMode?: boolean }>`
  width: ${props => props.compactMode ? '95%' : '800px'};
  height: ${props => props.compactMode ? '0' : '600px'};
  padding-bottom: ${props => props.compactMode ? '71.25%' : '0'}; /* Maintain aspect ratio when compact */
  border: 2px solid #61dafb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  position: relative;
  z-index: 1;
`

const BackgroundPattern = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(97, 218, 251, 0.1) 0%, transparent 10%),
    radial-gradient(circle at 75% 75%, rgba(97, 218, 251, 0.1) 0%, transparent 10%),
    radial-gradient(circle at 50% 50%, rgba(97, 218, 251, 0.05) 0%, transparent 50%);
  background-size: 100px 100px, 150px 150px, 100% 100%;
  opacity: 0.8;
  z-index: 0;
`

const Credits = styled.div`
  position: absolute;
  bottom: 10px;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
  width: 100%;
  z-index: 1;
  
  a {
    color: #61dafb;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
`

const MintContainer = styled.div`
  position: fixed;
  bottom: 20px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  z-index: 100;
`

// This component renders Stage Complete messages using the latest completed stage
const StageMessage = ({ stageNumber }: { stageNumber: number | null }) => {
  if (stageNumber === null) return null;
  
  return (
    <div className="stage-complete-indicator">
      Stage {stageNumber} recorded to blockchain
    </div>
  );
}

function AppContent() {
  const [gameStarted, setGameStarted] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })
  const [showMintOption, setShowMintOption] = useState(false)
  const [stageCompleted, setStageCompleted] = useState<number | null>(null)

  // Determine if we should be in compact mode based on screen size
  const compactMode = windowSize.width < 850;

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleStageCompleted = (event: CustomEvent) => {
      setStageCompleted(event.detail.stageId)
      console.log('Stage completed event received:', event.detail)
    }

    const handleGameCompleted = (event: CustomEvent) => {
      setShowMintOption(event.detail.showMintOption)
      console.log('Game completed event received:', event.detail)
    }

    window.addEventListener('stageCompleted', handleStageCompleted as EventListener)
    window.addEventListener('puzzleGameCompleted', handleGameCompleted as EventListener)

    return () => {
      window.removeEventListener('stageCompleted', handleStageCompleted as EventListener)
      window.removeEventListener('puzzleGameCompleted', handleGameCompleted as EventListener)
    }
  }, [])

  return (
    <AppContainer>
      <BackgroundPattern />
      
      <Header>
        <h1>Puzzle Challenge</h1>
        {!gameStarted && <p>Complete all 10 stages to become a puzzle master!</p>}
      </Header>
      
      <GameContainer compactMode={compactMode}>
        {!gameStarted ? (
          <div className="start-screen">
            <h2>Welcome to the Puzzle Challenge!</h2>
            <p>Solve puzzles by arranging the pieces in the correct order. The faster you complete each stage, the higher your score will be!</p>
            <ul className="game-instructions">
              <li>10 challenging stages with increasing difficulty</li>
              <li>Time-based scoring system</li>
              <li>Beat the clock to maximize your score</li>
            </ul>
            <button onClick={() => setGameStarted(true)}>Start Challenge</button>
          </div>
        ) : (
          <Game />
        )}
      </GameContainer>
      
      <WalletConnectButton />
      <PlayerStats />
      <StageMessage stageNumber={stageCompleted} />
      
      {showMintOption && (
        <MintContainer>
          <MintNFTButton />
        </MintContainer>
      )}
      
      <Credits>
        Created with React and Phaser | <a href="https://github.com/yourusername/puzzle-game" target="_blank" rel="noopener noreferrer">GitHub</a>
      </Credits>
    </AppContainer>
  )
}

function App() {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  )
}

export default App
