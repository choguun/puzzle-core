import Phaser from 'phaser';

export class PuzzlePiece extends Phaser.GameObjects.Sprite {
  public correctX: number;
  public correctY: number;
  private correct: boolean = false;
  private row: number;
  private col: number;
  private pieceSize: number;
  private gridSize: number;
  private stageNumber: number = 1;
  private outlineGraphics: Phaser.GameObjects.Graphics | null = null;
  private pieceNumberText: Phaser.GameObjects.Text | null = null;
  private imageCrop: Phaser.Geom.Rectangle | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    row: number,
    col: number,
    gridSize: number,
    pieceSize: number,
    correctX: number,
    correctY: number
  ) {
    super(scene, x, y, texture);
    
    this.row = row;
    this.col = col;
    this.pieceSize = pieceSize;
    this.gridSize = gridSize;
    this.correctX = correctX;
    this.correctY = correctY;

    // Extract stage number from texture name if available
    if (texture.includes('_')) {
      const parts = texture.split('_');
      const lastPart = parts[parts.length - 1];
      const stageNum = parseInt(lastPart);
      if (!isNaN(stageNum)) {
        this.stageNumber = stageNum;
      }
    }

    // Add to scene
    scene.add.existing(this);

    // Create the outline
    this.createOutline();
    
    // Get texture dimensions
    const textureWidth = this.texture.source[0].width;
    const textureHeight = this.texture.source[0].height;
    
    // Ensure the texture is loaded and valid
    if (textureWidth > 0 && textureHeight > 0) {
      // Calculate piece size in the original texture
      const texturePieceWidth = textureWidth / gridSize;
      const texturePieceHeight = textureHeight / gridSize;
      
      // Calculate frame crop for this piece
      this.imageCrop = new Phaser.Geom.Rectangle(
        col * texturePieceWidth,
        row * texturePieceHeight,
        texturePieceWidth,
        texturePieceHeight
      );
      
      // Apply the crop
      this.setCrop(
        this.imageCrop.x,
        this.imageCrop.y,
        this.imageCrop.width,
        this.imageCrop.height
      );
    } else {
      console.warn(`Texture ${texture} has invalid dimensions: ${textureWidth}x${textureHeight}`);
    }

    // Set display size to match the piece size
    this.setDisplaySize(pieceSize, pieceSize);
    
    // Set origin to center for proper positioning
    this.setOrigin(0.5);
    
    // Add piece number text for guidance
    this.addPieceNumber();
  }

  addPieceNumber() {
    // Add a small number in the corner for easier identification
    const pieceName = `R${this.row + 1}C${this.col + 1}`;
    
    // Add the text to the scene
    this.pieceNumberText = this.scene.add.text(
      this.x - this.pieceSize / 2 + 5,
      this.y - this.pieceSize / 2 + 5,
      pieceName,
      { 
        fontSize: '16px', 
        color: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 3, y: 3 }
      }
    );
    
    // Set origin to top-left
    this.pieceNumberText.setOrigin(0);
    this.pieceNumberText.setDepth(10); // Ensure text is on top
  }

  createOutline() {
    // Create a graphics object for the outline
    this.outlineGraphics = this.scene.add.graphics();
    this.outlineGraphics.setDepth(5); // Set depth to be above the piece but below text
    
    // Draw the outline
    this.updateOutline();
  }

  updateOutline() {
    if (!this.outlineGraphics) return;
    
    // Clear any existing graphics
    this.outlineGraphics.clear();
    
    // Set the line style (thicker for correct pieces)
    const thickness = this.correct ? 4 : 2;
    const color = this.correct ? 0x00ff00 : 0xffffff;
    const alpha = this.correct ? 0.8 : 0.5;
    
    this.outlineGraphics.lineStyle(thickness, color, alpha);
    
    // Draw a rectangle around the piece
    this.outlineGraphics.strokeRect(
      this.x - this.pieceSize / 2, 
      this.y - this.pieceSize / 2, 
      this.pieceSize, 
      this.pieceSize
    );
    
    // Add some visual indication that this piece is in the correct position
    if (this.correct) {
      this.outlineGraphics.fillStyle(0x00ff00, 0.2);
      this.outlineGraphics.fillRect(
        this.x - this.pieceSize / 2, 
        this.y - this.pieceSize / 2, 
        this.pieceSize, 
        this.pieceSize
      );
      
      // Add checkmark
      this.outlineGraphics.lineStyle(3, 0x00ff00, 1);
      this.outlineGraphics.beginPath();
      this.outlineGraphics.moveTo(this.x - this.pieceSize / 4, this.y);
      this.outlineGraphics.lineTo(this.x - this.pieceSize / 8, this.y + this.pieceSize / 6);
      this.outlineGraphics.lineTo(this.x + this.pieceSize / 4, this.y - this.pieceSize / 6);
      this.outlineGraphics.strokePath();
    }
  }

  setCorrect(value: boolean): void {
    this.correct = value;
    this.updateOutline();
    
    // Stop animation when in correct position
    if (value) {
      this.y = this.correctY; // Reset to exact position to stop any animation
    }
  }

  isCorrect(): boolean {
    return this.correct;
  }
  
  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    
    // Update the outline position
    this.updateOutline();
    
    // Update the text position
    if (this.pieceNumberText) {
      this.pieceNumberText.setPosition(
        this.x - this.pieceSize / 2 + 5,
        this.y - this.pieceSize / 2 + 5
      );
    }
    
    // Add subtle animation when piece is not in correct position
    if (!this.correct) {
      // Subtle hover effect
      this.y += Math.sin(time / 500) * 0.2;
    }
  }
  
  destroy(fromScene?: boolean) {
    if (this.outlineGraphics) {
      this.outlineGraphics.destroy();
      this.outlineGraphics = null;
    }
    
    if (this.pieceNumberText) {
      this.pieceNumberText.destroy();
      this.pieceNumberText = null;
    }
    
    super.destroy(fromScene);
  }
} 