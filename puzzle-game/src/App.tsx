import { useState, useEffect } from 'react'
import styled from 'styled-components'
import './App.css'
import Game from './components/Game'

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

const GameContainer = styled.div`
  width: 800px;
  height: 600px;
  border: 2px solid #61dafb;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(97, 218, 251, 0.3);
  position: relative;
  z-index: 1;
  
  @media (max-width: 850px) {
    width: 95%;
    height: 0;
    padding-bottom: 71.25%; /* Maintain aspect ratio */
  }
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

function App() {
  const [gameStarted, setGameStarted] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

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

  return (
    <AppContainer>
      <BackgroundPattern />
      
      <Header>
        <h1>Puzzle Challenge</h1>
        {!gameStarted && <p>Complete all 10 stages to become a puzzle master!</p>}
      </Header>
      
      <GameContainer>
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
      
      <Credits>
        Created with React and Phaser | <a href="https://github.com/yourusername/puzzle-game" target="_blank" rel="noopener noreferrer">GitHub</a>
      </Credits>
    </AppContainer>
  )
}

export default App
