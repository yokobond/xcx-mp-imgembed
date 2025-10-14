import {ImageEmbedder, FilesetResolver} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest';

const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
);

let modelAssetPath = 'https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_small/float32/1/mobilenet_v3_small.tflite';

let runningMode = 'IMAGE'; // or 'VIDEO' or 'LIVE_STREAM'

/**
 * Create an ImageEmbedder instance
 * @returns {Promise<ImageEmbedder>} - a Promise that resolves with an ImageEmbedder instance
 */
const createImageEmbedder = async () => {
    const embedder = await ImageEmbedder.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: modelAssetPath
        },
        runningMode: 'IMAGE'
    });
    return embedder;
};

// Initialize the ImageEmbedder instance
// This may take a few seconds.
let imageEmbedder = await createImageEmbedder();

/**
 * Embed an image and return the embedding vector
 * @param {HTMLImageElement | HTMLVideoElement | HTMLCanvasElement} image - input image
 * @returns {Float32Array} - embedding vector
 */
const embed = async function (image) {
    if (!imageEmbedder) {
        throw new Error('ImageEmbedder is not initialized');
    }
    if (runningMode !== 'IMAGE') {
        runningMode = 'IMAGE';
        await imageEmbedder.setOptions({runningMode: runningMode});
    }
    const embeddingResult = imageEmbedder.embed(image);
    return embeddingResult.embeddings[0].floatEmbedding;
};

const embedForVideo = async function (video) {
    if (!imageEmbedder) {
        throw new Error('ImageEmbedder is not initialized');
    }
    if (runningMode === 'IMAGE') {
        runningMode = 'VIDEO';
        await imageEmbedder.setOptions({runningMode: runningMode});
    }
    const startTime = performance.now();
    const embeddingResult = await imageEmbedder.embedForVideo(
        video,
        startTime
    );
    return embeddingResult.embeddings[0].floatEmbedding;
};

/**
 * Compute cosine similarity between two vectors
 * @param {Array<number> | Float32Array | string} vector1 - first vector
 * @param {Array<number> | Float32Array | string} vector2 - second vector
 * @returns {number} - cosine similarity
 */
const cosineSimilarity = function (vector1, vector2) {
    return ImageEmbedder.cosineSimilarity(
        {floatEmbedding: vector1},
        {floatEmbedding: vector2});
};

/**
 * Set model asset path
 * @param {string} path - model asset path
 */
const setModelAssetPath = async function (path) {
    modelAssetPath = path;
    imageEmbedder = await createImageEmbedder();
};

export {embed, embedForVideo, setModelAssetPath, cosineSimilarity, modelAssetPath};
