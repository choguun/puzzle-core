import Phaser from 'phaser';
import { PuzzlePiece } from '../objects/PuzzlePiece';

interface StageConfig {
  gridSize: number;
  timeLimit: number;
  backgroundColor: number;
  imageUrl?: string; // URL for AI-generated image
}

export class PuzzleScene extends Phaser.Scene {
  private pieces: PuzzlePiece[] = [];
  private selectedPiece: PuzzlePiece | null = null;
  private pieceSize = 150;
  private dragStart = { x: 0, y: 0 };
  private completed = false;
  private placeholderTexture: string = 'puzzle_placeholder';
  
  // Stage related variables
  private currentStage: number = 1;
  private totalStages: number = 10;
  private stageConfigs: StageConfig[] = [];
  
  // Scoring related variables
  private score: number = 0;
  private timeLeft: number = 0;
  private timeText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private stageText!: Phaser.GameObjects.Text;
  private timer!: Phaser.Time.TimerEvent;
  
  // UI related
  private nextStageButton!: Phaser.GameObjects.Text;
  private loadingText!: Phaser.GameObjects.Text;
  
  // Audio related
  private successSound: Phaser.Sound.WebAudioSound | null = null;

  // Background
  private background!: Phaser.GameObjects.Rectangle;
  private bgPattern!: Phaser.GameObjects.TileSprite;

  constructor() {
    super({ key: 'PuzzleScene' });
    this.initStageConfigs();
  }

  initStageConfigs() {
    // Define configurations for all 10 stages with AI-generated image URLs
    // These could be replaced with actual URLs from Midjourney/DALL-E
    const aiGeneratedImages = [
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg', // Blue mountains
      'https://images.pexels.com/photos/1761279/pexels-photo-1761279.jpeg', // Green forest
      'https://images.pexels.com/photos/1831234/pexels-photo-1831234.jpeg', // Red sunset
      'https://images.pexels.com/photos/1142941/pexels-photo-1142941.jpeg', // Orange beach
      'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg', // Purple flowers
      'https://images.pexels.com/photos/3732519/pexels-photo-3732519.jpeg', // Teal ocean
      'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',   // Dark mountains
      'https://images.pexels.com/photos/417070/pexels-photo-417070.jpeg',   // Amber sunset
      'https://images.pexels.com/photos/2449600/pexels-photo-2449600.jpeg', // Emerald lake
      'https://images.pexels.com/photos/3389536/pexels-photo-3389536.jpeg'  // Violet sky
    ];

    for (let i = 1; i <= this.totalStages; i++) {
      // Gradually increase difficulty
      const gridSize = Math.min(2 + Math.floor((i - 1) / 2), 5); // 2x2 up to 5x5
      const timeLimit = Math.max(120 - (i * 10), 30); // From 110s down to 30s
      
      // More vibrant colors for different stages
      const colors = [
        0x3498db, // Blue
        0x2ecc71, // Green
        0xe74c3c, // Red
        0xf39c12, // Orange
        0x9b59b6, // Purple
        0x1abc9c, // Teal
        0xd35400, // Dark Orange
        0xe67e22, // Amber
        0x27ae60, // Emerald
        0x8e44ad  // Violet
      ];
      
      this.stageConfigs.push({
        gridSize,
        timeLimit,
        backgroundColor: colors[i - 1],
        imageUrl: aiGeneratedImages[i - 1] // Each stage gets a different image
      });
    }
  }

  preload() {
    // Load a set of colorful background patterns
    this.load.image('bg_pattern', 'https://opengameart.org/sites/default/files/styles/medium/public/seamless_grass_texture_by_calthyechild-d6jpnhk.png');
    
    // Preload all AI-generated images for each stage
    for (let i = 1; i <= this.totalStages; i++) {
      const config = this.stageConfigs[i - 1];
      if (config.imageUrl) {
        this.load.image(`stage_image_${i}`, config.imageUrl);
      }
    }
    
    // Create placeholder textures for each stage as fallback
    for (let i = 1; i <= this.totalStages; i++) {
      this.createPlaceholderTexture(i);
    }
  }

  create() {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;

    // Create a more visually appealing background
    this.background = this.add.rectangle(centerX, centerY, 800, 600, 0x282c34);
    
    // Add pattern overlay to the background
    if (this.textures.exists('bg_pattern')) {
      this.bgPattern = this.add.tileSprite(centerX, centerY, 800, 600, 'bg_pattern');
      this.bgPattern.setAlpha(0.1);
    }
    
    // Create game area background
    this.add.rectangle(centerX, centerY, 600, 600, 0x21252b, 0.8)
      .setStrokeStyle(3, 0x61dafb);

    // Create loading text (initially hidden)
    this.loadingText = this.add.text(centerX, centerY, 'Loading Images...', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setDepth(1000);
    this.loadingText.visible = false;

    // Create success sound
    this.createSuccessSound();
      
    // Add UI elements
    this.createUI();
    
    // Start the first stage
    this.startStage(this.currentStage);
  }

  createSuccessSound() {
    try {
      // Create a basic beep sound for success feedback
      if (this.sound.locked) {
        // If audio is locked (needs user interaction first), we'll create the sound later
        this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
          this.createSuccessSound();
        });
        return;
      }

      // Use the built-in sound manager to add a base64 encoded sound
      // This is a simple beep sound encoded as base64
      const beepSound = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tAwAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADTgCenp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6enp6e//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAZtAAAAAAAAA04G5ePJAAAAAAD/+xDEAAAFlll9QMYA4KpILX80wAAgAANIAAAAQEBH///yEef//+AgQEBAQAAAdnZ2dn/Z2dndgIAAAAgQ/////4CAgP///wgACAAAGIP///8IGP////gYPAAAAAAA';
      this.cache.audio.add('success', beepSound);
      this.load.audio('success', beepSound);
      this.load.once('complete', () => {
        this.successSound = this.sound.add('success') as Phaser.Sound.WebAudioSound;
      });
      this.load.start();
    } catch (err) {
      console.warn('Could not create success sound:', err);
    }
  }

  // Create a function to generate images from AI services (you would implement API calls here)
  async generateImageFromAI(prompt: string, stage: number): Promise<string> {
    // This is a placeholder function - in a real implementation, you would:
    // 1. Call the Midjourney/DALL-E API with the prompt
    // 2. Wait for the response
    // 3. Return the URL of the generated image
    
    // Example implementation with DALL-E (pseudocode):
    /*
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: '1024x1024'
      })
    });
    
    const data = await response.json();
    return data.data[0].url;
    */
    
    // For now, return the predefined URLs
    return this.stageConfigs[stage - 1].imageUrl || '';
  }

  createPlaceholderTexture(stageNum: number) {
    const textureName = `puzzle_placeholder_${stageNum}`;
    
    // Check if we already have an AI-generated image for this stage
    const aiImageKey = `stage_image_${stageNum}`;
    if (this.textures.exists(aiImageKey)) {
      // If we have the image loaded, use it
      this.placeholderTexture = stageNum === 1 ? aiImageKey : this.placeholderTexture;
      return;
    }
    
    try {
      // Create a canvas for our placeholder texture
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error('Could not get 2D context for texture creation');
        return;
      }
      
      // Use different colors based on stage
      const config = this.stageConfigs[stageNum - 1];
      const colorHex = '#' + config.backgroundColor.toString(16).padStart(6, '0');
      
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, 400, 400);
      gradient.addColorStop(0, colorHex);
      gradient.addColorStop(0.5, '#ffffff');
      gradient.addColorStop(1, colorHex);
      
      // Fill the background with the gradient
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 400, 400);
      
      // Add a pattern to make it more interesting
      ctx.fillStyle = colorHex;
      for (let x = 0; x < 400; x += 40) {
        for (let y = 0; y < 400; y += 40) {
          if ((x / 40 + y / 40) % 2 === 0) {
            ctx.globalAlpha = 0.1;
            ctx.fillRect(x, y, 20, 20);
          }
        }
      }
      ctx.globalAlpha = 1.0;
      
      // Add a rounded rectangle for the stage number
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.beginPath();
      const rectSize = 100;
      const cornerRadius = 15;
      ctx.roundRect(150, 150, rectSize, rectSize, cornerRadius);
      ctx.fill();
      
      // Add text showing the stage number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 64px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(stageNum.toString(), 200, 200);
      
      // Add stage indicator text
      ctx.font = 'bold 20px Arial';
      ctx.fillText('Stage ' + stageNum, 200, 240);
      
      // Add the canvas to the game as a texture
      this.textures.addCanvas(textureName, canvas);
      
      // Store the texture name for the first stage
      if (stageNum === 1) {
        this.placeholderTexture = textureName;
      }
    } catch (error) {
      console.error('Error creating texture:', error);
      
      // Create a fallback texture using Phaser's graphics
      this.createFallbackTexture(stageNum);
    }
  }
  
  createFallbackTexture(stageNum: number) {
    const textureName = `puzzle_placeholder_${stageNum}`;
    
    // Create a canvas for our placeholder texture using Phaser's Graphics
    const graphics = this.make.graphics({ x: 0, y: 0 });
    
    // Use different colors based on stage
    const config = this.stageConfigs[stageNum - 1];
    const color = config.backgroundColor;
    
    // Fill with color
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 400, 400);
    
    // Add pattern
    graphics.fillStyle(0xffffff, 0.2);
    for (let x = 0; x < 400; x += 40) {
      for (let y = 0; y < 400; y += 40) {
        if ((x / 40 + y / 40) % 2 === 0) {
          graphics.fillRect(x, y, 20, 20);
        }
      }
    }
    
    // Add stage number background
    graphics.fillStyle(0x000000, 0.7);
    graphics.fillRoundedRect(150, 150, 100, 100, 16);
    
    // Generate texture from graphics
    graphics.generateTexture(textureName, 400, 400);
    graphics.destroy();
    
    // Add stage number with a separate text object
    // We'll add this directly to the pieces when they're created
    
    // Store the texture name for the first stage
    if (stageNum === 1) {
      this.placeholderTexture = textureName;
    }
  }

  // Function to generate a new AI image for the given stage
  async generateNewAIImage(stage: number) {
    this.loadingText.visible = true;
    this.loadingText.setText(`Generating image for Stage ${stage}...`);
    
    try {
      // Generate appropriate prompts for each stage theme
      const themes = [
        "serene blue mountain landscape",
        "lush green forest with sunlight",
        "dramatic red sunset over mountains",
        "orange autumn forest scene",
        "purple lavender fields",
        "teal ocean coastline",
        "dark mountain silhouettes at dusk",
        "amber golden hour landscape",
        "emerald green tropical rainforest",
        "violet night sky with stars"
      ];
      
      const prompt = themes[stage - 1];
      const imageUrl = await this.generateImageFromAI(prompt, stage);
      
      if (imageUrl) {
        // Load the new image
        this.load.image(`stage_image_${stage}`, imageUrl);
        this.load.once('complete', () => {
          // Update the stage config
          this.stageConfigs[stage - 1].imageUrl = imageUrl;
          // Restart the stage with the new image
          this.startStage(stage);
          this.loadingText.visible = false;
        });
        this.load.start();
      } else {
        throw new Error("Failed to generate image");
      }
    } catch (error) {
      console.error("Error generating AI image:", error);
      this.loadingText.setText("Error generating image. Using fallback...");
      setTimeout(() => {
        this.loadingText.visible = false;
        this.startStage(stage);
      }, 2000);
    }
  }

  // Add a button to request a new AI image for the current stage
  addNewImageButton() {
    const centerX = this.cameras.main.centerX;
    
    this.add.text(centerX, 510, 'Generate New Image', {
      fontSize: '18px',
      color: '#ffffff',
      backgroundColor: '#9b59b6',
      padding: { x: 15, y: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.generateNewAIImage(this.currentStage))
      .setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);
  }

  createUI() {
    const centerX = this.cameras.main.centerX;
    
    // Add instructions text with shadow for better visibility
    const instructionsText = this.add.text(centerX, 30, 'Drag and drop the puzzle pieces to solve the puzzle!', {
      fontSize: '18px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    instructionsText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);

    // Add stage text with improved styling
    this.stageText = this.add.text(150, 70, `Stage: ${this.currentStage}/${this.totalStages}`, {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.stageText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);

    // Add score text with improved styling
    this.scoreText = this.add.text(650, 70, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(1, 0.5);
    this.scoreText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);

    // Add time text with improved styling
    this.timeText = this.add.text(centerX, 70, `Time: ${this.timeLeft}s`, {
      fontSize: '24px',
      color: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0.5);
    this.timeText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);

    // Add reset button with improved styling
    this.add.text(centerX - 100, 550, 'Reset', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#61dafb',
      padding: { x: 15, y: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.resetPuzzle())
      .setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);
      
    // Add next stage button with improved styling
    this.nextStageButton = this.add.text(centerX + 100, 550, 'Next Stage', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#61dafb',
      padding: { x: 15, y: 8 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.goToNextStage())
      .setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);
    
    // Set initially dimmed
    this.nextStageButton.alpha = 0.5;
    this.nextStageButton.setName('nextStageButton');
    
    // Add button to generate new AI image
    this.addNewImageButton();
  }

  startStage(stageNum: number) {
    // Reset state
    this.completed = false;
    
    // Update stage text
    this.stageText.setText(`Stage: ${stageNum}/${this.totalStages}`);
    
    // Get config for this stage
    const config = this.stageConfigs[stageNum - 1];
    
    // Set time limit
    this.timeLeft = config.timeLimit;
    this.timeText.setText(`Time: ${this.timeLeft}s`);
    
    // Start timer
    if (this.timer) {
      this.timer.remove();
    }
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
    
    // Determine which texture to use - prefer AI-generated image if available
    let textureToUse = `puzzle_placeholder_${stageNum}`;
    if (this.textures.exists(`stage_image_${stageNum}`)) {
      textureToUse = `stage_image_${stageNum}`;
    }
    
    // Create puzzle with the appropriate grid size
    this.createPuzzle(config.gridSize, textureToUse);
    
    // Hide next stage button
    this.nextStageButton.alpha = 0.5;
  }

  updateTimer() {
    if (!this.completed && this.timeLeft > 0) {
      this.timeLeft--;
      this.timeText.setText(`Time: ${this.timeLeft}s`);
      
      // Game over if time runs out
      if (this.timeLeft <= 0) {
        this.timeText.setText('Time: 0s');
        this.showMessage('Time\'s up!', '#ff0000');
        this.resetPuzzle();
      }
    }
  }

  createPuzzle(gridSize: number, textureName: string) {
    // Clear any existing pieces
    this.pieces.forEach(piece => piece.destroy());
    this.pieces = [];
    
    const startX = this.cameras.main.centerX - ((gridSize * this.pieceSize) / 2) + (this.pieceSize / 2);
    const startY = this.cameras.main.centerY - ((gridSize * this.pieceSize) / 2) + (this.pieceSize / 2);
    
    // Create puzzle pieces
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const correctX = startX + (col * this.pieceSize);
        const correctY = startY + (row * this.pieceSize);
        
        // Generate random positions, but make sure they're not too far from the game area
        const randX = this.cameras.main.centerX + Phaser.Math.Between(-250, 250);
        const randY = this.cameras.main.centerY + Phaser.Math.Between(-200, 200);
        
        // Create piece
        const piece = new PuzzlePiece(
          this,
          randX,
          randY,
          textureName,
          row,
          col,
          gridSize,
          this.pieceSize,
          correctX,
          correctY
        );
        
        // Make pieces interactive
        piece.setInteractive();
        this.input.setDraggable(piece);
        
        this.pieces.push(piece);
      }
    }
    
    // Set up drag events
    this.input.on('dragstart', (pointer: Phaser.Input.Pointer, gameObject: PuzzlePiece) => {
      this.selectedPiece = gameObject;
      this.dragStart.x = pointer.x;
      this.dragStart.y = pointer.y;
      gameObject.setDepth(100);
      gameObject.setTint(0xdddddd);
    });
    
    this.input.on('drag', (pointer: Phaser.Input.Pointer, gameObject: PuzzlePiece, dragX: number, dragY: number) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
    });
    
    this.input.on('dragend', (pointer: Phaser.Input.Pointer, gameObject: PuzzlePiece) => {
      gameObject.clearTint();
      gameObject.setDepth(1);
      this.selectedPiece = null;
      
      // Snap to position if close enough to correct position
      if (Phaser.Math.Distance.Between(gameObject.x, gameObject.y, gameObject.correctX, gameObject.correctY) < 50) {
        gameObject.x = gameObject.correctX;
        gameObject.y = gameObject.correctY;
        gameObject.setCorrect(true);
        
        // Check if puzzle is complete
        this.checkCompletion();
      }
    });
  }
  
  checkCompletion() {
    const allCorrect = this.pieces.every(piece => piece.isCorrect());
    
    if (allCorrect && !this.completed) {
      this.completed = true;
      
      // Stop the timer
      if (this.timer) {
        this.timer.remove();
      }
      
      // Calculate score based on time left and stage
      const timeBonus = this.timeLeft * 10;
      const stageBonus = this.currentStage * 100;
      const stageScore = timeBonus + stageBonus;
      
      // Update total score
      this.score += stageScore;
      this.scoreText.setText(`Score: ${this.score}`);
      
      // Play success sound
      this.playSuccessSound();
      
      // Show completion message
      this.showMessage(`Stage ${this.currentStage} Completed!\n+${stageScore} points`, '#00aa00');
      
      // Enable next stage button if not at final stage
      if (this.currentStage < this.totalStages) {
        this.nextStageButton.alpha = 1;
      } else {
        // Show game completion message if at final stage
        this.time.delayedCall(2000, () => {
          this.showMessage(`Congratulations!\nYou completed all stages!\nFinal Score: ${this.score}`, '#ffd700', 0.8);
        });
      }
    }
  }
  
  playSuccessSound() {
    try {
      // Play a simple beep sound if we have the success sound
      if (this.successSound && this.sound.locked === false) {
        this.successSound.play();
      } else {
        // Fallback for browsers with restricted audio policy
        console.log('Success! Audio not available due to browser policies.');
      }
    } catch (e) {
      console.log('Could not play success sound', e);
    }
  }
  
  showMessage(text: string, color: string = '#ffffff', duration: number = 2) {
    const centerX = this.cameras.main.centerX;
    const centerY = this.cameras.main.centerY;
    
    // Create a background for the message
    const bg = this.add.rectangle(centerX, centerY, 400, 200, 0x000000, 0.8)
      .setStrokeStyle(3, 0x61dafb);
    bg.setDepth(199);
    
    const messageText = this.add.text(centerX, centerY, text, {
      fontSize: '32px',
      color: color,
      align: 'center',
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(200);
    messageText.setShadow(2, 2, 'rgba(0,0,0,0.5)', 3);
    
    // Group the message elements
    const messageGroup = [bg, messageText];
    
    // Add animation
    this.tweens.add({
      targets: messageGroup,
      scale: { from: 0.5, to: 1 },
      duration: 500,
      ease: 'Bounce.Out'
    });
    
    // Remove after delay if duration > 0
    if (duration > 0) {
      this.time.delayedCall(duration * 1000, () => {
        this.tweens.add({
          targets: messageGroup,
          alpha: 0,
          duration: 500,
          onComplete: () => {
            messageText.destroy();
            bg.destroy();
          }
        });
      });
    }
    
    return messageText;
  }
  
  goToNextStage() {
    if (this.completed && this.currentStage < this.totalStages) {
      this.currentStage++;
      this.startStage(this.currentStage);
    }
  }
  
  resetPuzzle() {
    // Only reset the current stage, not the entire game
    this.completed = false;
    const config = this.stageConfigs[this.currentStage - 1];
    
    // Determine which texture to use - prefer AI-generated image if available
    let textureToUse = `puzzle_placeholder_${this.currentStage}`;
    if (this.textures.exists(`stage_image_${this.currentStage}`)) {
      textureToUse = `stage_image_${this.currentStage}`;
    }
    
    this.createPuzzle(config.gridSize, textureToUse);
    
    // Reset timer for this stage
    this.timeLeft = config.timeLimit;
    this.timeText.setText(`Time: ${this.timeLeft}s`);
    
    // Restart timer
    if (this.timer) {
      this.timer.remove();
    }
    this.timer = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });
  }
} 