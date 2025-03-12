// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'gameCanvas',
    backgroundColor: '#2d2d2d',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Initialize game
const game = new Phaser.Game(config);

// Game variables
let player;
let trees;
let rocks;
let keys;
let inventory = {
    axe: 1,
    pickaxe: 1,
    wood: 0,
    stone: 0
};

// Preload game assets
function preload() {
    
    // Create beautiful tree graphics
    let treeGraphics = this.add.graphics();
    
    // Enhanced trunk with texture
    treeGraphics.fillStyle(0x8B4513, 1); // Base brown
    treeGraphics.fillRect(-12, 0, 24, 40);
    // Trunk texture/detail
    treeGraphics.lineStyle(2, 0x654321, 0.5);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-8, 5);
    treeGraphics.lineTo(-6, 15);
    treeGraphics.moveTo(-4, 20);
    treeGraphics.lineTo(-2, 30);
    treeGraphics.moveTo(8, 8);
    treeGraphics.lineTo(6, 18);
    treeGraphics.moveTo(4, 25);
    treeGraphics.lineTo(2, 35);
    treeGraphics.strokePath();
    
    // Multiple layers of foliage for depth
    // Bottom layer (darkest)
    treeGraphics.fillStyle(0x1B512D, 1);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-28, 40);
    treeGraphics.quadraticCurveTo(-24, 20, -20, 15);
    treeGraphics.quadraticCurveTo(0, -35, 20, 15);
    treeGraphics.quadraticCurveTo(24, 20, 28, 40);
    treeGraphics.closePath();
    treeGraphics.fill();
    
    // Middle layer
    treeGraphics.fillStyle(0x228B22, 0.9);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-24, 35);
    treeGraphics.quadraticCurveTo(-20, 15, -16, 10);
    treeGraphics.quadraticCurveTo(0, -30, 16, 10);
    treeGraphics.quadraticCurveTo(20, 15, 24, 35);
    treeGraphics.closePath();
    treeGraphics.fill();
    
    // Top layer (lightest)
    treeGraphics.fillStyle(0x32CD32, 0.8);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-20, 30);
    treeGraphics.quadraticCurveTo(-16, 10, -12, 5);
    treeGraphics.quadraticCurveTo(0, -25, 12, 5);
    treeGraphics.quadraticCurveTo(16, 10, 20, 30);
    treeGraphics.closePath();
    treeGraphics.fill();
    
    // Add highlights for depth
    treeGraphics.fillStyle(0x90EE90, 0.4);
    treeGraphics.beginPath();
    treeGraphics.moveTo(-10, 15);
    treeGraphics.quadraticCurveTo(0, -15, 10, 15);
    treeGraphics.quadraticCurveTo(5, 20, 0, 18);
    treeGraphics.quadraticCurveTo(-5, 20, -10, 15);
    treeGraphics.closePath();
    treeGraphics.fill();
    
    treeGraphics.generateTexture('tree', 56, 80);
    treeGraphics.destroy();

    // Create improved rock graphics
    let rockGraphics = this.add.graphics();
    // Base rock shape
    rockGraphics.fillStyle(0x808080, 1); // Gray
    rockGraphics.beginPath();
    rockGraphics.moveTo(-16, 8);
    rockGraphics.lineTo(-8, -16);
    rockGraphics.lineTo(8, -16);
    rockGraphics.lineTo(16, 8);
    rockGraphics.lineTo(8, 16);
    rockGraphics.lineTo(-8, 16);
    rockGraphics.closePath();
    rockGraphics.fill();
    // Add highlights
    rockGraphics.fillStyle(0xA9A9A9, 0.5); // Lighter gray for depth
    rockGraphics.beginPath();
    rockGraphics.moveTo(-8, -8);
    rockGraphics.lineTo(0, -12);
    rockGraphics.lineTo(8, -8);
    rockGraphics.lineTo(0, -4);
    rockGraphics.closePath();
    rockGraphics.fill();
    rockGraphics.generateTexture('rock', 32, 32);
    rockGraphics.destroy();
}

// Create game objects
function create() {
    // Create player graphics
    const playerGraphics = this.add.graphics();
    
    // Move to center of texture
    playerGraphics.translateCanvas(16, 24);
    
    // Create a simple character shape
    // Body
    playerGraphics.fillStyle(0x4287f5); // Blue color
    playerGraphics.fillRect(-8, -16, 16, 24);
    
    // Head
    playerGraphics.fillStyle(0xffd700); // Gold color
    playerGraphics.fillCircle(0, -20, 6);

    // Direction indicator
    playerGraphics.fillStyle(0xff0000); // Red color
    playerGraphics.fillCircle(0, -24, 2);
    
    // Generate texture
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // Create player sprite
    player = this.physics.add.sprite(400, 300, 'player');
    player.setCollideWorldBounds(true);
    player.setOrigin(0.5, 0.75); // Set origin to bottom center for better rotation

    // Create tree group
    trees = this.physics.add.staticGroup();
    // Add trees with adjusted positions for better spacing
    [
        [120, 120],
        [680, 120],
        [120, 480],
        [680, 480],
        [400, 300] // Additional center tree
    ].forEach(([x, y]) => {
        const tree = trees.create(x, y, 'tree');
        tree.setDepth(y); // Make trees render in correct order based on y position
    });

    // Create rock group
    rocks = this.physics.add.staticGroup();
    // Add some rocks
    [
        [200, 200],
        [600, 200],
        [200, 400],
        [600, 400]
    ].forEach(([x, y]) => {
        rocks.create(x, y, 'rock');
    });

    // Setup keyboard input
    keys = this.input.keyboard.addKeys({
        up: 'W',
        down: 'S',
        left: 'A',
        right: 'D',
        interact: 'SPACE'
    });

    // Add colliders
    this.physics.add.collider(player, trees);
    this.physics.add.collider(player, rocks);

    // Initialize inventory display
    updateInventoryUI();
}

// Update game state
function update() {
    // Handle player movement
    const speed = 160; // Slightly slower for better control
    let velocityX = 0;
    let velocityY = 0;

    if (keys.up.isDown) velocityY -= speed;
    if (keys.down.isDown) velocityY += speed;
    if (keys.left.isDown) velocityX -= speed;
    if (keys.right.isDown) velocityX += speed;

    // Normalize diagonal movement
    if (velocityX !== 0 && velocityY !== 0) {
        velocityX *= Math.SQRT1_2;
        velocityY *= Math.SQRT1_2;
    }

    player.setVelocity(velocityX, velocityY);

    // Handle player direction
    if (velocityX !== 0 || velocityY !== 0) {
        // Calculate angle based on movement direction
        const angle = Math.atan2(velocityY, velocityX);
        // Smooth rotation
        const targetRotation = angle + Math.PI/2;
        const currentRotation = player.rotation;
        const rotationDiff = targetRotation - currentRotation;
        
        // Normalize the rotation difference
        let normalizedDiff = rotationDiff;
        while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
        while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
        
        // Apply smooth rotation
        player.setRotation(currentRotation + normalizedDiff * 0.15); // Smoother rotation
    }

    // Handle interactions
    if (Phaser.Input.Keyboard.JustDown(keys.interact)) {
        handleInteraction();
    }
}

// Handle player interactions with objects
function handleInteraction() {
    const interactionDistance = 50;

    // Check tree interactions
    trees.getChildren().forEach(tree => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            tree.x, tree.y
        );

        if (distance < interactionDistance && inventory.axe > 0) {
            tree.destroy();
            inventory.wood++;
            updateInventoryUI();
            playCollectAnimation('wood-count');
        }
    });

    // Check rock interactions
    rocks.getChildren().forEach(rock => {
        const distance = Phaser.Math.Distance.Between(
            player.x, player.y,
            rock.x, rock.y
        );

        if (distance < interactionDistance && inventory.pickaxe > 0) {
            rock.destroy();
            inventory.stone++;
            updateInventoryUI();
            playCollectAnimation('stone-count');
        }
    });
}

// Update inventory UI
function updateInventoryUI() {
    document.getElementById('axe-count').textContent = inventory.axe;
    document.getElementById('pickaxe-count').textContent = inventory.pickaxe;
    document.getElementById('wood-count').textContent = inventory.wood;
    document.getElementById('stone-count').textContent = inventory.stone;
}

// Play collection animation
function playCollectAnimation(elementId) {
    const element = document.getElementById(elementId);
    element.classList.remove('item-collected');
    void element.offsetWidth; // Trigger reflow
    element.classList.add('item-collected');
}
