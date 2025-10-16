import BlockType from '../../extension-support/block-type';
// import Cast from '../../util/cast';
import translations from './translations.json';
import blockIcon from './block-icon.png';
import {embed, setModelAssetPath, modelAssetPath, cosineSimilarity} from './image-embedder.js';

/**
 * Formatter which is used for translation.
 * This will be replaced which is used in the runtime.
 * @param {object} messageData - format-message object
 * @returns {string} - message for the locale
 */
let formatMessage = messageData => messageData.default;

/**
 * Setup format-message for this extension.
 */
const setupTranslations = () => {
    const localeSetup = formatMessage.setup();
    if (localeSetup && localeSetup.translations[localeSetup.locale]) {
        Object.assign(
            localeSetup.translations[localeSetup.locale],
            translations[localeSetup.locale]
        );
    }
};

const EXTENSION_ID = 'mpImgEmbed';

/**
 * URL to get this extension as a module.
 * When it was loaded as a module, 'extensionURL' will be replaced a URL which is retrieved from.
 * @type {string}
 */
let extensionURL = 'https://yokobond.github.io/xcx-mp-imgembed/dist/mpImgEmbed.mjs';

/**
 * Scratch 3.0 blocks for example of Xcratch.
 */
class ExtensionBlocks {
    /**
     * A translation object which is used in this class.
     * @param {FormatObject} formatter - translation object
     */
    static set formatMessage (formatter) {
        formatMessage = formatter;
        if (formatMessage) setupTranslations();
    }

    /**
     * @return {string} - the name of this extension.
     */
    static get EXTENSION_NAME () {
        return formatMessage({
            id: 'mpImgEmbed.name',
            default: 'Image Embedding',
            description: 'name of the extension'
        });
    }

    /**
     * @return {string} - the ID of this extension.
     */
    static get EXTENSION_ID () {
        return EXTENSION_ID;
    }

    /**
     * URL to get this extension.
     * @type {string}
     */
    static get extensionURL () {
        return extensionURL;
    }

    /**
     * Set URL to get this extension.
     * The extensionURL will be changed to the URL of the loading server.
     * @param {string} url - URL
     */
    static set extensionURL (url) {
        extensionURL = url;
    }

    /**
     * Construct a set of blocks for Image Embedding.
     * @param {Runtime} runtime - the Scratch 3.0 runtime.
     */
    constructor (runtime) {
        /**
         * The Scratch 3.0 runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        if (runtime.formatMessage) {
            // Replace 'formatMessage' to a formatter which is used in the runtime.
            formatMessage = runtime.formatMessage;
        }
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo () {
        setupTranslations();
        return {
            id: ExtensionBlocks.EXTENSION_ID,
            name: ExtensionBlocks.EXTENSION_NAME,
            extensionURL: ExtensionBlocks.extensionURL,
            blockIconURI: blockIcon,
            showStatusButton: false,
            blocks: [
                {
                    opcode: 'embedImage',
                    text: formatMessage({
                        id: 'mpImgEmbed.embedImage',
                        default: 'embed [IMAGE]'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        IMAGE: {
                            type: 'string',
                            defaultValue: 'data:image/png;base64,AAA'
                        }
                    }
                },
                {
                    opcode: 'cosineSimilarity',
                    text: formatMessage({
                        id: 'mpImgEmbed.cosineSimilarity',
                        default: 'cosine similarity of [VECTOR1] and [VECTOR2]'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        VECTOR1: {
                            type: 'string',
                            defaultValue: '0.1, 0.2, 0.3'
                        },
                        VECTOR2: {
                            type: 'string',
                            defaultValue: '0.1, 0.2, 0.3'
                        }
                    }
                },
                '---',
                {
                    opcode: 'setModelPath',
                    text: formatMessage({
                        id: 'mpImgEmbed.setModelPath',
                        default: 'set model asset path to [PATH]'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PATH: {
                            type: 'string',
                            defaultValue: modelAssetPath
                        }
                    }
                },
                {
                    opcode: 'getModelPath',
                    text: formatMessage({
                        id: 'mpImgEmbed.getModelPath',
                        default: 'get model asset path'
                    }),
                    blockType: BlockType.REPORTER,
                    disableMonitor: true
                }
            ],
            menus: {
            }
        };
    }

    /**
     * Embed the given image and return the embedding vector.
     * @param {object} args - block arguments
     * @param {string | number} args.IMAGE - image data URL
     * @returns {Promise<Float32Array | string>} - embedding vector or empty string if error.
     */
    embedImage (args) {
        const imageDataURL = args.IMAGE;
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                const imageData = context.getImageData(0, 0, image.width, image.height);
                const embedding = embed(imageData);
                resolve(embedding);
            };
            image.onerror = err => {
                reject(err);
            };
            image.src = imageDataURL;
        })
            .then(embedding => JSON.stringify(embedding).slice(1, -1)) // remove '[' and ']'
            .catch(err => {
                console.error(err);
                return '';
            });
    }

    /**
     * Set the model asset path for hand detection.
     * @param {object} args - the block arguments
     * @param {string} args.PATH - the model asset path
     * @returns {Promise} - a promise that resolve when the model set
     */
    setModelPath (args) {
        const path = args.PATH.trim();
        if (!path) return;
        return setModelAssetPath(path)
            .then(() => 'Model asset path set successfully')
            .catch(e => {
                console.error(e);
                return e.message;
            });
    }

    /**
     * Get the model asset path.
     * @returns {string} - the model asset path
     */
    getModelPath () {
        return modelAssetPath;
    }

    /**
     * Compute cosine similarity between two vectors.
     * @param {object} args - block arguments
     * @param {string | number} args.VECTOR1 - first vector (comma-separated values)
     * @param {string | number} args.VECTOR2 - second vector (comma-separated values)
     * @returns {number} - cosine similarity
     */
    cosineSimilarity (args) {
        const vector1 = args.VECTOR1.split(',').map(v => parseFloat(v.trim()));
        const vector2 = args.VECTOR2.split(',').map(v => parseFloat(v.trim()));
        if (vector1.length === 0 || vector2.length === 0) return '';
        if (vector1.length !== vector2.length) return '';
        return cosineSimilarity(vector1, vector2);
    }
}

export {ExtensionBlocks as default, ExtensionBlocks as blockClass};
