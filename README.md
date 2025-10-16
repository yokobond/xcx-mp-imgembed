# Image Embedding
A MediaPipe-based image embedding extension for [Xcratch](https://xcratch.github.io/)

This extension provides blocks to create embeddings from images using MediaPipe's Image Embedder model and calculate cosine similarity between embedding vectors. These features enable image comparison and similarity detection in Scratch projects.


## ✨ What You Can Do With This Extension

Play [Example Project](https://xcratch.github.io/editor/#https://yokobond.github.io/xcx-mp-imgembed/projects/example.sb3) to look at what you can do with "Image Embedding" extension. 
<iframe src="https://xcratch.github.io/editor/player#https://yokobond.github.io/xcx-mp-imgembed/projects/example.sb3" width="540px" height="460px" allow="camera"></iframe>

### Example Project

The example project demonstrates how to calculate image similarity using the Image Embedding extension:

#### How to Use:

1. **Change Images**: 
   - Click on "Image1" or "Image2" sprites to change their costume
   - Each click cycles through different costume variations

2. **Calculate Similarity**: 
   - Click on the cat sprite on the right side of the stage
   - The similarity score will be displayed (ranges from -1 to 1, where 1 means identical)

3. **Camera Mode**:
   - Click on the camera icon at the bottom right to switch to camera mode
   - The live camera feed will capture images for comparison

#### Use Cases:

**Compare Scratch Costumes**: Calculate the similarity between two costume images of Scratch characters (e.g., Cat-a costume variations). Perfect for creating games that detect costume changes or match patterns.

**Compare Camera Images**: Capture live images from your camera and compare them with sample images to measure their similarity. This is useful for:
- Face recognition and verification
- Object matching and detection
- Visual similarity search
- Real-time image comparison
- Educational projects about AI and image recognition

The project shows the similarity score as a decimal value (e.g., 0.9226...), allowing you to set thresholds for image matching in your Scratch projects.

### Features

- **Embed Images**: Convert images into embedding vectors using MediaPipe's Image Embedder model
- **Compare Images**: Calculate cosine similarity between two embedding vectors to measure image similarity
- **Custom Model Path**: Configure the model asset path for the image embedder
- **Flexible Input**: Works with image data URLs

### Available Blocks

1. **embed [IMAGE]** - Returns an embedding vector (comma-separated values) for the given image data URL
2. **cosine similarity of [VECTOR1] and [VECTOR2]** - Computes the cosine similarity between two embedding vectors (returns a value between -1 and 1, where 1 means identical)
3. **set model asset path to [PATH]** - Sets a custom path for the MediaPipe model assets
4. **get model asset path** - Returns the current model asset path


## How to Use in Xcratch

This extension can be used with other extension in [Xcratch](https://xcratch.github.io/). 
1. Open [Xcratch Editor](https://xcratch.github.io/editor)
2. Click 'Add Extension' button
3. Select 'Extension Loader' extension
4. Type the module URL in the input field 
```
https://yokobond.github.io/xcx-mp-imgembed/dist/mpImgEmbed.mjs
```
5. Click 'OK' button
6. Now you can use the blocks of this extension


## Development

### Install Dependencies

```sh
npm install
```

### Setup Development Environment

Change ```vmSrcOrg``` to your local ```scratch-vm``` directory in ```./scripts/setup-dev.js``` then run setup-dev script to setup development environment.

```sh
npm run setup-dev
```

### Bundle into a Module

Run build script to bundle this extension into a module file which could be loaded on Xcratch.

```sh
npm run build
```

### Watch and Bundle

Run watch script to watch the changes of source files and bundle automatically.

```sh
npm run watch
```

### Test

Run test script to test this extension.

```sh
npm run test
```


## 🏠 Home Page

Open this page from [https://yokobond.github.io/xcx-mp-imgembed/](https://yokobond.github.io/xcx-mp-imgembed/)


## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/yokobond/xcx-mp-imgembed/issues). 
