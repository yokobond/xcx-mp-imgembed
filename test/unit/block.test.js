import { blockClass } from "../../src/vm/extensions/block/index.js";
import * as imageEmbedder from "../../src/vm/extensions/block/image-embedder.js";

// Mock the image-embedder module
jest.mock("../../src/vm/extensions/block/image-embedder.js", () => ({
    embed: jest.fn(),
    setModelAssetPath: jest.fn(),
    cosineSimilarity: jest.fn(),
    modelAssetPath: "https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_small/float32/1/mobilenet_v3_small.tflite"
}));

describe("ExtensionBlocks", () => {
    let runtime;
    let block;

    beforeEach(() => {
        runtime = {
            formatMessage: jest.fn(function (msg) {
                return msg.default;
            })
        };
        // Mock formatMessage.setup() for setupTranslations
        runtime.formatMessage.setup = jest.fn(() => ({
            locale: 'en',
            translations: {
                en: {}
            }
        }));
        block = new blockClass(runtime);
        jest.clearAllMocks();
    });

    describe("Static properties", () => {
        test("should have EXTENSION_NAME", () => {
            expect(blockClass.EXTENSION_NAME).toBe("Image Embedding");
        });

        test("should have EXTENSION_ID", () => {
            expect(blockClass.EXTENSION_ID).toBe("mpImgEmbed");
        });

        test("should have extensionURL", () => {
            expect(blockClass.extensionURL).toBe("https://yokobond.github.io/xcx-mp-imgembed/dist/mpImgEmbed.mjs");
        });

        test("should allow setting extensionURL", () => {
            const newURL = "https://example.com/extension.mjs";
            blockClass.extensionURL = newURL;
            expect(blockClass.extensionURL).toBe(newURL);
        });

        test("should allow setting formatMessage", () => {
            const customFormatter = jest.fn((msg) => msg.default);
            customFormatter.setup = jest.fn(() => ({
                locale: 'en',
                translations: { en: {} }
            }));
            blockClass.formatMessage = customFormatter;
            const customRuntime = {
                formatMessage: jest.fn((msg) => msg.default)
            };
            customRuntime.formatMessage.setup = jest.fn(() => ({
                locale: 'en',
                translations: { en: {} }
            }));
            const newBlock = new blockClass(customRuntime);
            expect(newBlock).toBeInstanceOf(blockClass);
        });
    });

    describe("Constructor", () => {
        test("should create an instance of blockClass", () => {
            expect(block).toBeInstanceOf(blockClass);
        });

        test("should store runtime", () => {
            expect(block.runtime).toBe(runtime);
        });

        test("should use runtime.formatMessage if available", () => {
            const customRuntime = {
                formatMessage: jest.fn((msg) => msg.default)
            };
            customRuntime.formatMessage.setup = jest.fn(() => ({
                locale: 'en',
                translations: { en: {} }
            }));
            const newBlock = new blockClass(customRuntime);
            expect(newBlock.runtime).toBe(customRuntime);
        });
    });

    describe("getInfo", () => {
        test("should return extension metadata", () => {
            const info = block.getInfo();
            expect(info).toHaveProperty("id");
            expect(info).toHaveProperty("name");
            expect(info).toHaveProperty("extensionURL");
            expect(info).toHaveProperty("blockIconURI");
            expect(info).toHaveProperty("blocks");
            expect(info).toHaveProperty("menus");
        });

        test("should have correct extension ID", () => {
            const info = block.getInfo();
            expect(info.id).toBe("mpImgEmbed");
        });

        test("should have correct extension name", () => {
            const info = block.getInfo();
            expect(info.name).toBe("Image Embedding");
        });

        test("should have showStatusButton set to false", () => {
            const info = block.getInfo();
            expect(info.showStatusButton).toBe(false);
        });

        test("should have correct blocks", () => {
            const info = block.getInfo();
            expect(Array.isArray(info.blocks)).toBe(true);
            expect(info.blocks.length).toBeGreaterThan(0);
            
            const opcodes = info.blocks
                .filter(b => typeof b === 'object')
                .map(b => b.opcode);
            expect(opcodes).toContain("embedImage");
            expect(opcodes).toContain("cosineSimilarity");
            expect(opcodes).toContain("setModelPath");
            expect(opcodes).toContain("getModelPath");
        });
    });

    describe("embedImage", () => {
        let mockImage;
        let mockCanvas;
        let mockContext;

        beforeEach(() => {
            mockImage = {
                onload: null,
                onerror: null,
                src: "",
                width: 100,
                height: 100
            };
            global.Image = jest.fn(() => mockImage);

            mockContext = {
                drawImage: jest.fn(),
                getImageData: jest.fn(() => ({
                    data: new Uint8ClampedArray(100 * 100 * 4),
                    width: 100,
                    height: 100
                }))
            };
            mockCanvas = {
                width: 0,
                height: 0,
                getContext: jest.fn(() => mockContext)
            };
            global.document.createElement = jest.fn(() => mockCanvas);

            imageEmbedder.embed.mockResolvedValue(new Float32Array([0.1, 0.2, 0.3]));
        });

        test("should embed an image and return vector as string", async () => {
            const args = { IMAGE: "data:image/png;base64,AAA" };
            const promise = block.embedImage(args);

            setTimeout(() => {
                mockImage.onload();
            }, 0);

            const result = await promise;
            // Float32Array is serialized as object with numeric keys by JSON.stringify
            expect(result).toContain("0.10000000149011612");
            expect(result).toContain("0.20000000298023224");
            expect(result).toContain("0.30000001192092896");
        });

        test("should handle image load error", async () => {
            const args = { IMAGE: "data:image/png;base64,AAA" };
            const promise = block.embedImage(args);

            setTimeout(() => {
                mockImage.onerror(new Error("Image load failed"));
            }, 0);

            const result = await promise;
            expect(result).toBe("");
        });

        test("should create canvas with correct dimensions", async () => {
            mockImage.width = 200;
            mockImage.height = 150;
            const args = { IMAGE: "data:image/png;base64,AAA" };
            const promise = block.embedImage(args);

            setTimeout(() => {
                mockImage.onload();
            }, 0);

            await promise;
            expect(mockCanvas.width).toBe(200);
            expect(mockCanvas.height).toBe(150);
        });
    });

    describe("setModelPath", () => {
        test("should set model path successfully", async () => {
            imageEmbedder.setModelAssetPath.mockResolvedValue();
            const args = { PATH: "https://example.com/model.tflite" };
            
            const result = await block.setModelPath(args);
            
            expect(imageEmbedder.setModelAssetPath).toHaveBeenCalledWith("https://example.com/model.tflite");
            expect(result).toBe("Model asset path set successfully");
        });

        test("should trim whitespace from path", async () => {
            imageEmbedder.setModelAssetPath.mockResolvedValue();
            const args = { PATH: "  https://example.com/model.tflite  " };
            
            await block.setModelPath(args);
            
            expect(imageEmbedder.setModelAssetPath).toHaveBeenCalledWith("https://example.com/model.tflite");
        });

        test("should return early if path is empty", async () => {
            const args = { PATH: "" };
            
            const result = await block.setModelPath(args);
            
            expect(imageEmbedder.setModelAssetPath).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        test("should return early if path is only whitespace", async () => {
            const args = { PATH: "   " };
            
            const result = await block.setModelPath(args);
            
            expect(imageEmbedder.setModelAssetPath).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });

        test("should handle error when setting model path", async () => {
            const error = new Error("Failed to load model");
            imageEmbedder.setModelAssetPath.mockRejectedValue(error);
            const args = { PATH: "https://example.com/invalid.tflite" };
            
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            const result = await block.setModelPath(args);
            
            expect(result).toBe("Failed to load model");
            consoleErrorSpy.mockRestore();
        });
    });

    describe("getModelPath", () => {
        test("should return current model path", () => {
            const result = block.getModelPath();
            expect(result).toBe("https://storage.googleapis.com/mediapipe-models/image_embedder/mobilenet_v3_small/float32/1/mobilenet_v3_small.tflite");
        });
    });

    describe("cosineSimilarity", () => {
        beforeEach(() => {
            imageEmbedder.cosineSimilarity.mockReturnValue(0.95);
        });

        test("should compute cosine similarity between two vectors", () => {
            const args = {
                VECTOR1: "0.1, 0.2, 0.3",
                VECTOR2: "0.15, 0.25, 0.35"
            };
            
            const result = block.cosineSimilarity(args);
            
            expect(imageEmbedder.cosineSimilarity).toHaveBeenCalledWith(
                [0.1, 0.2, 0.3],
                [0.15, 0.25, 0.35]
            );
            expect(result).toBe(0.95);
        });

        test("should handle vectors with extra whitespace", () => {
            const args = {
                VECTOR1: " 0.1 ,  0.2  , 0.3 ",
                VECTOR2: "0.15,0.25,0.35"
            };
            
            const result = block.cosineSimilarity(args);
            
            expect(imageEmbedder.cosineSimilarity).toHaveBeenCalledWith(
                [0.1, 0.2, 0.3],
                [0.15, 0.25, 0.35]
            );
            expect(result).toBe(0.95);
        });

        test("should return empty string if first vector is empty", () => {
            const args = {
                VECTOR1: "",
                VECTOR2: "0.15, 0.25, 0.35"
            };
            
            const result = block.cosineSimilarity(args);
            
            expect(result).toBe("");
            expect(imageEmbedder.cosineSimilarity).not.toHaveBeenCalled();
        });

        test("should return empty string if second vector is empty", () => {
            const args = {
                VECTOR1: "0.1, 0.2, 0.3",
                VECTOR2: ""
            };
            
            const result = block.cosineSimilarity(args);
            
            expect(result).toBe("");
            expect(imageEmbedder.cosineSimilarity).not.toHaveBeenCalled();
        });

        test("should return empty string if vectors have different lengths", () => {
            const args = {
                VECTOR1: "0.1, 0.2, 0.3",
                VECTOR2: "0.15, 0.25"
            };
            
            const result = block.cosineSimilarity(args);
            
            expect(result).toBe("");
            expect(imageEmbedder.cosineSimilarity).not.toHaveBeenCalled();
        });

        test("should handle negative numbers", () => {
            const args = {
                VECTOR1: "-0.1, 0.2, -0.3",
                VECTOR2: "0.15, -0.25, 0.35"
            };
            
            block.cosineSimilarity(args);
            
            expect(imageEmbedder.cosineSimilarity).toHaveBeenCalledWith(
                [-0.1, 0.2, -0.3],
                [0.15, -0.25, 0.35]
            );
        });
    });
});
