const THEMES = [
    { name: 'Classic Wood', light: '#f0d9b5', dark: '#b58863', pLight: '#ffffff', pDark: '#202020' },
    { name: 'Midnight Blue', light: '#a8bfe3', dark: '#4b7399', pLight: '#eef2f5', pDark: '#1a2639' },
    { name: 'Neon Cyber', light: '#e0fbfc', dark: '#293241', pLight: '#ee6c4d', pDark: '#222222' },
    { name: 'Forest Glade', light: '#e9edc9', dark: '#a3b18a', pLight: '#fefae0', pDark: '#344e41' },
    { name: 'Coral Reef', light: '#ffddd2', dark: '#e29578', pLight: '#ffffff', pDark: '#006d77' },
    { name: 'Monochrome', light: '#e0e0e0', dark: '#757575', pLight: '#ffffff', pDark: '#212121' },
    { name: 'Cherry Blossom', light: '#fed9b7', dark: '#f07167', pLight: '#ffffff', pDark: '#bd405e' },
    { name: 'Gold & Black', light: '#f3e5ab', dark: '#d4af37', pLight: '#ffffff', pDark: '#000000' },
    { name: 'Velvet', light: '#f8cdda', dark: '#c71585', pLight: '#ffffff', pDark: '#4a0e4e' },
    { name: 'Mint Chocolate', light: '#b2fba5', dark: '#4caf50', pLight: '#ffffff', pDark: '#3e2723' },
    { name: 'Royal Purple', light: '#d0bdf4', dark: '#8458b3', pLight: '#f5f5f5', pDark: '#2d1b4e' },
    { name: 'Desert Sand', light: '#f4ebd0', dark: '#b68d40', pLight: '#ffffff', pDark: '#5c4033' },
    { name: 'Volcano', light: '#ffb347', dark: '#ff7b25', pLight: '#ffeead', pDark: '#222222' },
    { name: 'Deep Ocean', light: '#caf0f8', dark: '#0077b6', pLight: '#f1faee', pDark: '#03045e' },
    { name: 'Sunset', light: '#ffbcaf', dark: '#c95f55', pLight: '#ffffff', pDark: '#392f5a' },
    { name: 'Autumn Leaves', light: '#fceba7', dark: '#d35400', pLight: '#f9e79f', pDark: '#641e16' },
    { name: 'Ice Cave', light: '#e0ffff', dark: '#add8e6', pLight: '#ffffff', pDark: '#191970' },
    { name: 'Toxic Waste', light: '#ccff00', dark: '#33cc00', pLight: '#ffffff', pDark: '#1a1a1a' },
    { name: 'Coffee', light: '#d5bdaf', dark: '#9a8c98', pLight: '#f5ebe0', pDark: '#4a3f35' },
    { name: 'Slate', light: '#b0bec5', dark: '#546e7a', pLight: '#eceff1', pDark: '#263238' },
    { name: 'Bubblegum', light: '#ffb6c1', dark: '#ff69b4', pLight: '#ffffff', pDark: '#c71585' },
    { name: 'Mustard', light: '#ffee93', dark: '#ffc09f', pLight: '#fcf5c7', pDark: '#a0522d' },
    { name: 'Amethyst', light: '#e1bee7', dark: '#8e24aa', pLight: '#ffffff', pDark: '#4a148c' },
    { name: 'Olive Garden', light: '#c5e1a5', dark: '#7cb342', pLight: '#f1f8e9', pDark: '#33691e' },
    { name: 'Ruby Dark', light: '#ffcdd2', dark: '#e53935', pLight: '#ffebee', pDark: '#b71c1c' },
    { name: 'Cyberpunk', light: '#f0f', dark: '#0ff', pLight: '#fff', pDark: '#000' }
];

const AppState = {
    chess: new Chess(),
    mode: 'pvp', // 'pvp' or 'pve'
    playerSide: 'w', // 'w' or 'b'
    botDifficulty: 3, // 1 to 4
    currentThemeIdx: 0,
    selectedSquare: null,
    validMoves: [],
    pieceMeshes: [], // Maps square to mesh
    boardMeshes: {}, // Maps square name 'e4' to mesh
    isAnimating: false,
    gameOver: false
};

const UI = {
    mainMenu: document.getElementById('main-menu'),
    btnVsPlayer: document.getElementById('btn-vs-player'),
    btnVsBotMenu: document.getElementById('btn-vs-bot-menu'),
    botSettings: document.getElementById('bot-settings'),
    btnStartBot: document.getElementById('btn-start-bot'),
    btnSettings: document.getElementById('btn-settings'),
    themesPanel: document.getElementById('themes-panel'),
    themeGrid: document.getElementById('theme-grid'),
    btnBackMenu: document.getElementById('btn-back-menu'),
    hud: document.getElementById('hud'),
    turnIndicator: document.getElementById('turn-indicator'),
    turnText: document.getElementById('turn-text'),
    gameStatus: document.getElementById('game-status'),
    btnUndo: document.getElementById('btn-undo'),
    btnResign: document.getElementById('btn-resign'),
    btnCamera: document.getElementById('btn-camera'),
    promotionDialog: document.getElementById('promotion-dialog'),
    gameOverModal: document.getElementById('game-over-modal'),
    gameOverTitle: document.getElementById('game-over-title'),
    gameOverMessage: document.getElementById('game-over-message'),
    btnPlayAgain: document.getElementById('btn-play-again'),
    sideBtns: document.querySelectorAll('.side-btn'),
    botDifficultySelect: document.getElementById('bot-difficulty')
};

const scene = new THREE.Scene();
scene.background = new THREE.Color(THEMES[AppState.currentThemeIdx].dark);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
const initialCameraPos = { w: [0, 6, 9], b: [0, 6, -9] }; // White looks from +z, Black from -z
camera.position.set(...initialCameraPos.w);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;
document.getElementById('game-container').appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't allow going below board

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(5, 10, 5);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 2048;
dirLight.shadow.mapSize.height = 2048;
dirLight.shadow.camera.left = -6;
dirLight.shadow.camera.right = 6;
dirLight.shadow.camera.top = 6;
dirLight.shadow.camera.bottom = -6;
scene.add(dirLight);

const matLightSquare = new THREE.MeshStandardMaterial({ color: THEMES[0].light, roughness: 0.2, metalness: 0.1 });
const matDarkSquare = new THREE.MeshStandardMaterial({ color: THEMES[0].dark, roughness: 0.2, metalness: 0.1 });
const matWhitePiece = new THREE.MeshPhysicalMaterial({ color: THEMES[0].pLight, roughness: 0.15, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.15 });
const matBlackPiece = new THREE.MeshPhysicalMaterial({ color: THEMES[0].pDark, roughness: 0.15, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.15 });
const matHighlight = new THREE.MeshBasicMaterial({ color: 0x6b46c1, transparent: true, opacity: 0.5 });
const matSelected = new THREE.MeshBasicMaterial({ color: 0x38a169, transparent: true, opacity: 0.6 });

const boardGroup = new THREE.Group();
const pieceGroup = new THREE.Group();
const highlightGroup = new THREE.Group();
scene.add(boardGroup);
scene.add(pieceGroup);
scene.add(highlightGroup);

// Utility: coordinate conversions
// Chess: file a-h (x: -3.5 to 3.5), rank 1-8 (z: 3.5 to -3.5)
const SQUARE_SIZE = 1;
function getPosFromSquare(sq) {
    const file = sq.charCodeAt(0) - 97; // a=0, h=7
    const rank = parseInt(sq[1]) - 1; // 1=0, 8=7
    const x = (file - 3.5) * SQUARE_SIZE;
    const z = (3.5 - rank) * SQUARE_SIZE; // White is at z+, so rank 1 is +3.5
    return { x, z };
}
function getSquareFromPos(x, z) {
    const file = Math.round(x / SQUARE_SIZE + 3.5);
    const rank = Math.round(3.5 - z / SQUARE_SIZE);
    if (file >= 0 && file <= 7 && rank >= 0 && rank <= 7) {
        return String.fromCharCode(97 + file) + (rank + 1);
    }
    return null;
}

function createBoard() {
    const geoSquare = new THREE.BoxGeometry(SQUARE_SIZE, 0.2, SQUARE_SIZE);
    for (let file = 0; file < 8; file++) {
        for (let rank = 0; rank < 8; rank++) {
            const isLight = (file + rank) % 2 !== 0;
            const mat = isLight ? matLightSquare : matDarkSquare;
            const squareMesh = new THREE.Mesh(geoSquare, mat);
            const x = (file - 3.5) * SQUARE_SIZE;
            const z = (3.5 - rank) * SQUARE_SIZE;
            squareMesh.position.set(x, -0.1, z);
            squareMesh.receiveShadow = true;
            squareMesh.userData = {
                square: String.fromCharCode(97 + file) + (rank + 1),
                isLight: isLight,
                defaultMat: mat
            };
            boardGroup.add(squareMesh);
            AppState.boardMeshes[squareMesh.userData.square] = squareMesh;
        }
    }

    const borderGeo = new THREE.BoxGeometry(8.4, 0.4, 8.4);
    const borderMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5 });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.y = -0.25;
    border.receiveShadow = true;
    boardGroup.add(border);
}
createBoard();

// // Procedural Geometry Generation
function createPieceMesh(type, colorCode) {
    const isWhite = colorCode === 'w';
    const mat = isWhite ? matWhitePiece : matBlackPiece;
    const group = new THREE.Group();

    function generateLathe(pointsInfo, segments = 64) {
        const points = pointsInfo.map(p => new THREE.Vector2(p[0], p[1]));
        return new THREE.LatheGeometry(points, segments);
    }

    let parts = [];

    // Real Staunton proportions
    if (type === 'p') {
        const pawnPts = [
            [0.00, 0.00], [0.38, 0.00], [0.38, 0.05], [0.34, 0.07],
            [0.34, 0.10], [0.30, 0.15],
            [0.26, 0.25], [0.22, 0.45], [0.18, 0.65], [0.18, 0.75], // stem
            [0.25, 0.78], [0.25, 0.83], [0.15, 0.86], [0.0, 0.86] // collar
        ];
        const bodyGeo = generateLathe(pawnPts);
        const headGeo = new THREE.SphereGeometry(0.22, 32, 32);
        const headMesh = new THREE.Mesh(headGeo, mat);
        headMesh.position.y = 1.04;
        parts.push(new THREE.Mesh(bodyGeo, mat), headMesh);
    } else if (type === 'r') {
        const rookPts = [
            [0.00, 0.00], [0.42, 0.00], [0.42, 0.06], [0.38, 0.08], [0.38, 0.12], [0.35, 0.16], // base
            [0.32, 0.30], [0.29, 0.60], [0.29, 0.90], // stem
            [0.36, 0.95], [0.36, 1.00], [0.40, 1.05], [0.40, 1.15], // top rim
            [0.32, 1.15], [0.32, 1.05], [0.00, 1.05] // inner cup
        ];
        parts.push(new THREE.Mesh(generateLathe(rookPts), mat));
        // Add 6 crenellations
        for (let i = 0; i < 6; i++) {
            const cren = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.12), mat);
            cren.position.set(0.34 * Math.cos(i * Math.PI / 3), 1.22, 0.34 * Math.sin(i * Math.PI / 3));
            parts.push(cren);
        }
    } else if (type === 'n') {
        const knightBasePts = [
            [0.00, 0.00], [0.40, 0.00], [0.40, 0.05], [0.36, 0.07], [0.36, 0.10], [0.32, 0.15], // base
            [0.28, 0.25], [0.25, 0.35], [0.23, 0.45], [0.00, 0.45]
        ];
        const bodyGeo = generateLathe(knightBasePts);
        // Realistic horse head extrude
        const shape = new THREE.Shape();
        shape.moveTo(0.15, 0.45); // back bottom
        shape.lineTo(0.20, 0.60); // back neck
        shape.quadraticCurveTo(0.25, 0.90, 0.15, 1.15); // back of head
        shape.lineTo(0.12, 1.35); // ears top
        shape.lineTo(0.00, 1.25); // between ears
        shape.lineTo(-0.15, 1.25); // forehead
        shape.quadraticCurveTo(-0.35, 1.15, -0.40, 0.90); // snout
        shape.lineTo(-0.40, 0.75); // nose
        shape.lineTo(-0.25, 0.70); // jaw
        shape.quadraticCurveTo(-0.15, 0.65, -0.15, 0.45); // front neck
        shape.lineTo(0.15, 0.45); // close
        const extrudeSettings = { depth: 0.16, bevelEnabled: true, bevelSegments: 3, steps: 2, bevelSize: 0.05, bevelThickness: 0.05 };
        const headGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        const headMesh = new THREE.Mesh(headGeo, mat);
        headMesh.position.set(0, 0.0, -0.08); // center depth
        if (isWhite) {
            headMesh.rotation.y = Math.PI / 2;
        } else {
            headMesh.rotation.y = -Math.PI / 2;
        }
        parts.push(new THREE.Mesh(bodyGeo, mat), headMesh);
    } else if (type === 'b') {
        const bishopPts = [
            [0.00, 0.00], [0.38, 0.00], [0.38, 0.05], [0.34, 0.07], [0.34, 0.10], [0.30, 0.15], // base
            [0.26, 0.25], [0.21, 0.50], [0.15, 0.85], [0.15, 0.95], // stem
            [0.24, 0.98], [0.24, 1.03], [0.14, 1.06], // collar
            [0.22, 1.15], [0.23, 1.25], [0.18, 1.38], [0.10, 1.48], [0.00, 1.52] // mitre (head)
        ];
        const beadGeo = new THREE.SphereGeometry(0.06, 16, 16);
        const beadMesh = new THREE.Mesh(beadGeo, mat);
        beadMesh.position.y = 1.55;
        // Slit for mitre
        const slitGeo = new THREE.BoxGeometry(0.03, 0.25, 0.4);
        const slitMat = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.8 });
        const slitMesh = new THREE.Mesh(slitGeo, slitMat);
        slitMesh.position.set(0, 1.30, 0.12);
        slitMesh.rotation.x = -Math.PI / 6;
        parts.push(new THREE.Mesh(generateLathe(bishopPts), mat), beadMesh, slitMesh);
    } else if (type === 'q') {
        const queenPts = [
            [0.00, 0.00], [0.42, 0.00], [0.42, 0.05], [0.38, 0.07], [0.38, 0.10], [0.34, 0.15], // base
            [0.28, 0.30], [0.22, 0.60], [0.16, 1.00], [0.16, 1.15], // stem
            [0.28, 1.20], [0.28, 1.25], [0.16, 1.28], // collar
            [0.25, 1.35], [0.38, 1.55], [0.33, 1.55], [0.20, 1.40], [0.00, 1.40] // crown cup
        ];
        parts.push(new THREE.Mesh(generateLathe(queenPts), mat));
        for (let i = 0; i < 10; i++) {
            const pearl = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 16), mat);
            pearl.position.set(0.355 * Math.cos(i * Math.PI / 5), 1.57, 0.355 * Math.sin(i * Math.PI / 5));
            parts.push(pearl);
        }
    } else if (type === 'k') {
        const kingPts = [
            [0.00, 0.00], [0.44, 0.00], [0.44, 0.05], [0.40, 0.07], [0.40, 0.10], [0.36, 0.15], // base
            [0.30, 0.30], [0.24, 0.60], [0.18, 1.00], [0.18, 1.20], // stem
            [0.30, 1.25], [0.30, 1.30], [0.18, 1.33], // collar
            [0.28, 1.45], [0.32, 1.55], [0.25, 1.65], [0.10, 1.70], [0.00, 1.70] // crown dome
        ];
        const crossVertGeo = new THREE.BoxGeometry(0.06, 0.25, 0.06);
        const crossHorGeo = new THREE.BoxGeometry(0.20, 0.06, 0.06);
        const crossV = new THREE.Mesh(crossVertGeo, mat);
        const crossH = new THREE.Mesh(crossHorGeo, mat);
        crossV.position.y = 1.82;
        crossH.position.y = 1.85;
        parts.push(new THREE.Mesh(generateLathe(kingPts), mat), crossV, crossH);
    }

    parts.forEach(p => {
        p.castShadow = true;
        p.receiveShadow = true;
        p.userData = { type, color: colorCode }; // Interactivity helper
        group.add(p);
    });

    group.scale.set(0.85, 0.85, 0.85); // Fit nicely in square
    group.userData = { type, color: colorCode }; // Interactivity helper

    return group;
}

function syncBoard() {
    // Clear existing
    while (pieceGroup.children.length > 0) {
        pieceGroup.remove(pieceGroup.children[0]);
    }
    AppState.pieceMeshes = [];

    const board = AppState.chess.board(); // 8x8 array
    for (let r = 0; r < 8; r++) {
        for (let f = 0; f < 8; f++) {
            const piece = board[r][f];
            if (piece) {
                const mesh = createPieceMesh(piece.type, piece.color);
                const fileStr = String.fromCharCode(97 + f);
                const rankStr = 8 - r;
                const sqStr = fileStr + rankStr;
                const { x, z } = getPosFromSquare(sqStr);
                mesh.position.set(x, 0, z);
                mesh.userData.square = sqStr;
                pieceGroup.add(mesh);
                AppState.pieceMeshes.push(mesh);
            }
        }
    }
}

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const highlightMat = new THREE.MeshBasicMaterial({ color: 0x38a169, transparent: true, opacity: 0.6 });
const moveMat = new THREE.MeshBasicMaterial({ color: 0x6b46c1, transparent: true, opacity: 0.5 });

function getIntersects(e, objects) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    return raycaster.intersectObjects(objects, true);
}

function clearHighlights() {
    Object.values(AppState.boardMeshes).forEach(mesh => {
        if (mesh.userData.defaultMat) mesh.material = mesh.userData.defaultMat;
    });
}

function highlightSquare(sq, mat) {
    const mesh = AppState.boardMeshes[sq];
    if (mesh) mesh.material = mat;
}

document.getElementById('game-container').addEventListener('click', e => {
    if (AppState.isAnimating || AppState.gameOver) return;

    const turn = AppState.chess.turn();
    if (AppState.mode === 'pve' && turn !== AppState.playerSide) return;

    let intersects = getIntersects(e, pieceGroup.children);
    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj.parent && obj.parent !== pieceGroup) obj = obj.parent;

        if (obj.userData.color === turn) {
            clearHighlights();
            AppState.selectedSquare = obj.userData.square;
            highlightSquare(obj.userData.square, highlightMat);

            AppState.validMoves = AppState.chess.moves({ square: obj.userData.square, verbose: true });
            AppState.validMoves.forEach(mv => highlightSquare(mv.to, moveMat));
            return;
        }
    }

    if (AppState.selectedSquare) {
        intersects = getIntersects(e, boardGroup.children);
        if (intersects.length > 0) {
            const sqObj = intersects.find(i => i.object.userData.square);
            if (sqObj) {
                const targetSq = sqObj.object.userData.square;
                const moveObj = AppState.validMoves.find(mv => mv.to === targetSq);
                if (moveObj) {
                    clearHighlights();
                    executeMove(moveObj);
                    AppState.selectedSquare = null;
                    return;
                }
            }
        }
        clearHighlights();
        AppState.selectedSquare = null;
    }
});

function basicTween(obj, targetProps, duration, onComplete) {
    const startProps = {};
    for (let key in targetProps) startProps[key] = obj[key];
    const startTime = performance.now();
    function step(time) {
        let p = (time - startTime) / duration;
        if (p > 1) p = 1;
        const ease = 1 - (1 - p) * (1 - p);
        for (let key in targetProps) obj[key] = startProps[key] + (targetProps[key] - startProps[key]) * ease;
        if (p < 1) requestAnimationFrame(step);
        else if (onComplete) onComplete();
    }
    requestAnimationFrame(step);
}

function animatePieceJump(mesh, destPos, duration, onComplete) {
    const startX = mesh.position.x;
    const startZ = mesh.position.z;
    const startY = mesh.position.y;
    const startTime = performance.now();
    function step(time) {
        let p = (time - startTime) / duration;
        if (p > 1) p = 1;
        const ease = 1 - (1 - p) * (1 - p);
        mesh.position.x = startX + (destPos.x - startX) * ease;
        mesh.position.z = startZ + (destPos.z - startZ) * ease;
        mesh.position.y = startY + Math.sin(p * Math.PI) * 1.0;
        if (p < 1) requestAnimationFrame(step);
        else {
            mesh.position.y = startY;
            if (onComplete) onComplete();
        }
    }
    requestAnimationFrame(step);
}

function executeMove(moveObj, isEngineMove = false) {
    AppState.isAnimating = true;
    clearHighlights();

    // Find the mesh for the moving piece
    const pieceMesh = AppState.pieceMeshes.find(m => m.userData.square === moveObj.from);
    if (!pieceMesh) { AppState.isAnimating = false; return; }

    const destPos = getPosFromSquare(moveObj.to);

    // Identify captured mesh if any
    let capturedMesh = null;
    if (moveObj.captured) {
        // Normal capture
        capturedMesh = AppState.pieceMeshes.find(m => m.userData.square === moveObj.to);
    } else if (moveObj.flags.includes('e')) {
        // En passant capture
        const epSq = moveObj.to[0] + moveObj.from[1];
        capturedMesh = AppState.pieceMeshes.find(m => m.userData.square === epSq);
    }

    // Remove captured immediately from group for visuals, wait for tween
    if (capturedMesh) {
        pieceGroup.remove(capturedMesh);
        AppState.pieceMeshes = AppState.pieceMeshes.filter(m => m !== capturedMesh);
    }

    // Perform smooth native movement arc
    animatePieceJump(pieceMesh, destPos, 450, () => {
        AppState.chess.move({ from: moveObj.from, to: moveObj.to, promotion: 'q' });
        pieceMesh.userData.square = moveObj.to;

        if (moveObj.flags.includes('k') || moveObj.flags.includes('q')) {
            syncBoard(); // castling sync
        } else if (moveObj.promotion) {
            syncBoard(); // promotion sync
        }

        AppState.isAnimating = false;
        updateGameStatus();

        if (!AppState.gameOver && AppState.mode === 'pve' && !isEngineMove) {
            setTimeout(makeBotMove, 500);
        }
    });
}

const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
function evaluateBoard(chessIns) {
    let totalEvaluation = 0;
    const board = chessIns.board();
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const piece = board[i][j];
            if (piece) {
                let val = pieceValues[piece.type];
                // Simple positional bonus (center preference)
                if (piece.type !== 'r' && piece.type !== 'k') {
                    const centerDist = Math.abs(3.5 - i) + Math.abs(3.5 - j);
                    val += (10 - centerDist); // Bonus for center
                }
                totalEvaluation += piece.color === 'w' ? val : -val;
            }
        }
    }
    return totalEvaluation;
}

function minimax(chessIns, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || chessIns.game_over()) {
        return evaluateBoard(chessIns);
    }
    const moves = chessIns.moves();

    if (isMaximizingPlayer) {
        let bestVal = -Infinity;
        for (let i = 0; i < moves.length; i++) {
            chessIns.move(moves[i]);
            bestVal = Math.max(bestVal, minimax(chessIns, depth - 1, alpha, beta, !isMaximizingPlayer));
            chessIns.undo();
            alpha = Math.max(alpha, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    } else {
        let bestVal = Infinity;
        for (let i = 0; i < moves.length; i++) {
            chessIns.move(moves[i]);
            bestVal = Math.min(bestVal, minimax(chessIns, depth - 1, alpha, beta, !isMaximizingPlayer));
            chessIns.undo();
            beta = Math.min(beta, bestVal);
            if (beta <= alpha) break;
        }
        return bestVal;
    }
}

function makeBotMove() {
    if (AppState.chess.game_over()) return;

    // Visual processing indication
    UI.turnText.innerText = 'AI is thinking...';

    // Async so UI doesn't completely lock for small depths (though JS is single-threaded)
    setTimeout(() => {
        const moves = AppState.chess.moves({ verbose: true });
        let bestMove = null;
        let bestValue = AppState.chess.turn() === 'w' ? -Infinity : Infinity;
        const depth = AppState.botDifficulty;

        for (let i = 0; i < moves.length; i++) {
            AppState.chess.move(moves[i]);
            const boardValue = minimax(AppState.chess, depth - 1, -Infinity, Infinity, AppState.chess.turn() === 'w');
            AppState.chess.undo();

            if (AppState.chess.turn() === 'w') {
                if (boardValue > bestValue) {
                    bestValue = boardValue;
                    bestMove = moves[i];
                }
            } else {
                if (boardValue < bestValue) {
                    bestValue = boardValue;
                    bestMove = moves[i];
                }
            }
        }

        // Fallback or random selection among equals
        if (!bestMove) bestMove = moves[Math.floor(Math.random() * moves.length)];

        executeMove(bestMove, true);
    }, 50);
}

function updateGameStatus() {
    const turn = AppState.chess.turn();
    UI.turnIndicator.className = turn === 'w' ? 'turn-dot white-turn' : 'turn-dot black-turn';

    let status = '';
    let moveColor = turn === 'w' ? 'White' : 'Black';

    if (AppState.chess.in_checkmate()) {
        status = `Checkmate! ${moveColor === 'White' ? 'Black' : 'White'} wins!`;
        AppState.gameOver = true;
        showGameOver(status);
    } else if (AppState.chess.in_draw() || AppState.chess.in_stalemate() || AppState.chess.in_threefold_repetition()) {
        status = `Game Over - Draw`;
        AppState.gameOver = true;
        showGameOver(status);
    } else {
        status = AppState.chess.in_check() ? 'Check!' : '';
        UI.turnText.innerText = `${moveColor} to Move`;
    }
    UI.gameStatus.innerText = status;
}

function showGameOver(msg) {
    UI.gameOverTitle.innerText = AppState.chess.in_checkmate() ? 'CHECKMATE' : 'DRAW';
    UI.gameOverMessage.innerText = msg;
    UI.gameOverModal.classList.remove('hidden');
}

function startNewGame(mode) {
    AppState.chess.reset();
    AppState.mode = mode;
    AppState.gameOver = false;
    AppState.selectedSquare = null;
    clearHighlights();
    syncBoard();
    updateGameStatus();

    UI.mainMenu.classList.remove('active');
    setTimeout(() => UI.mainMenu.classList.add('hidden'), 400);
    UI.hud.classList.remove('hidden');
    UI.gameOverModal.classList.add('hidden');

    // Position camera
    const cPos = initialCameraPos[AppState.playerSide];
    const targetPos = { x: cPos[0], y: cPos[1], z: AppState.mode === 'pve' ? cPos[2] : initialCameraPos.w[2] };
    basicTween(camera.position, targetPos, 1000);

    if (mode === 'pve' && AppState.playerSide === 'b') {
        // Bot plays white, bot goes first
        setTimeout(makeBotMove, 1000);
    }
}

UI.btnVsPlayer.addEventListener('click', () => {
    startNewGame('pvp');
});

UI.btnVsBotMenu.addEventListener('click', () => {
    UI.botSettings.classList.toggle('hidden');
});

UI.sideBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        UI.sideBtns.forEach(b => { b.classList.remove('active'); b.classList.add('outline'); });
        e.target.classList.add('active');
        e.target.classList.remove('outline');
        AppState.playerSide = e.target.dataset.side;
    });
});

UI.btnStartBot.addEventListener('click', () => {
    AppState.botDifficulty = parseInt(UI.botDifficultySelect.value);
    startNewGame('pve');
});

UI.btnUndo.addEventListener('click', () => {
    if (AppState.isAnimating || AppState.gameOver) return;
    AppState.chess.undo();
    if (AppState.mode === 'pve') AppState.chess.undo(); // Undo bot move as well
    syncBoard();
    updateGameStatus();
});

UI.btnResign.addEventListener('click', () => {
    if (AppState.gameOver) return;
    AppState.gameOver = true;
    const turnColor = AppState.chess.turn() === 'w' ? 'White' : 'Black';
    showGameOver(`${turnColor} resigned.`);
});

UI.btnCamera.addEventListener('click', () => {
    const target = AppState.mode === 'pve' ? initialCameraPos[AppState.playerSide] : initialCameraPos.w;
    basicTween(camera.position, { x: target[0], y: target[1], z: target[2] }, 500);
    controls.target.set(0, 0, 0);
});

UI.btnPlayAgain.addEventListener('click', () => {
    UI.gameOverModal.classList.add('hidden');
    UI.hud.classList.add('hidden');
    UI.mainMenu.classList.remove('hidden');
    UI.mainMenu.classList.add('active');
});


function applyTheme(idx) {
    AppState.currentThemeIdx = idx;
    const t = THEMES[idx];

    // Update Scene bg
    scene.background.set(t.dark);

    // Update Materials
    matLightSquare.color.set(t.light);
    matDarkSquare.color.set(t.dark);
    matWhitePiece.color.set(t.pLight);
    matBlackPiece.color.set(t.pDark);
}

function initThemesUI() {
    THEMES.forEach((t, i) => {
        const card = document.createElement('div');
        card.className = `theme-card ${i === AppState.currentThemeIdx ? 'active' : ''}`;
        card.innerHTML = `
            <div class="theme-preview">
                <div class="theme-color-1" style="background:${t.light}"></div>
                <div class="theme-color-2" style="background:${t.dark}"></div>
            </div>
            <div class="theme-name">${t.name}</div>
        `;
        card.addEventListener('click', () => {
            document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            applyTheme(i);
        });
        UI.themeGrid.appendChild(card);
    });
}
initThemesUI();

UI.btnSettings.addEventListener('click', () => {
    UI.mainMenu.classList.remove('active');
    setTimeout(() => {
        UI.mainMenu.classList.add('hidden');
        UI.themesPanel.classList.remove('hidden');
        UI.themesPanel.classList.add('active');
    }, 300);
});

UI.btnBackMenu.addEventListener('click', () => {
    UI.themesPanel.classList.remove('active');
    setTimeout(() => {
        UI.themesPanel.classList.add('hidden');
        UI.mainMenu.classList.remove('hidden');
        UI.mainMenu.classList.add('active');
    }, 300);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate(time) {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
syncBoard();
animate();
