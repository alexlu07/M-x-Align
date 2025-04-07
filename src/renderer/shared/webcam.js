import * as tf from '@tensorflow/tfjs';
import * as tmPose from '@teachablemachine/pose';

let setup = false;
let webcam = null;
let poseModel = null;

const contexts = Map();
let count = 0;

async function init() {
    poseModel = await tmPose.createTeachable();
    webcam = new tmPose.Webcam(320, 240, true);
    await webcam.setup();
    webcam.play();
    
    window.requestAnimationFrame(loop);
    setup = true;
}

async function loop() {
    webcam.update();

    for (const [id, context] of contexts) {
        const model = context.model || poseModel;

        const ctx = context.canvas;
        ctx.drawImage(webcam.canvas, 0, 0);

        const { pose, posenetOutput } = await model.estimatePose(webcam.canvas);
        const minPartConfidence = 0.5;
        tmPose.drawKeypoints(pose.keypoints, minPartConfidence, ctx);
        tmPose.drawSkeleton(pose.keypoints, minPartConfidence, ctx);

        if (context.hasModel) {
            const predictions = await model.predict(posenetOutput);
            
            context.labelBox.querySelector('.positive .percentage').innerText = Math.round(predictions[0].probability * 100) + '%';
            context.labelBox.querySelector('.negative .percentage').innerText = Math.round(predictions[1].probability * 100) + '%';
            context.labelBox.querySelector('.positive .inner').style.width = predictions[0].probability * 100 + '%';
            context.labelBox.querySelector('.negative .inner').style.width = predictions[1].probability * 100 + '%';
        }
    }

    window.requestAnimationFrame(loop);
}

async function addContext(element) {
    if (!setup) {
        await init();
    }

    const canvas = document.createElement('canvas');
    canvas.width = webcam.canvas.width;
    canvas.height = webcam.canvas.height;
    canvas.classList.add('canvas');
    const ctx = canvas.getContext('2d');

    contexts.set(count, {
        hasModel: false,
        canvas: ctx,
    })

    return count++;
}

async function addContextWithModel(element, path) {
    if (!setup) {
        await init();
    }

    // load model
    const modelFile = getFileFromPath(path + '/model.json');
    const weightsFile = getFileFromPath(path + '/weights.bin');
    const metadataFile = getFileFromPath(path + '/metadata.json');
    const model = await tmPose.loadFromFiles(modelFile, weightsFile, metadataFile);

    // create canvas
    const canvas = document.createElement('canvas');
    canvas.width = webcam.canvas.width;
    canvas.height = webcam.canvas.height;
    canvas.classList.add('canvas');

    // create prediction elements
    const labelBox = document.createElement('div');
    labelBox.classList.add('label-box');
    labelBox.classList.add('vertbox');

    labelBox.innerHTML = `
        <div class="positive">
            <div class="label">Positive</div>
            <div class="progress-bar">
                <div class="inner" style="width: 50%;">
                    <span class="percentage">50%</span>
                </div>
            </div>
        </div>
        <div class="negative">
            <div class="label">Negative</div>
            <div class="progress-bar">
                <div class="inner" style="width: 50%;">
                    <span class="percentage">50%</span>
                </div>
            </div>
        </div>
    `;    

    contexts.set(count, {
        hasModel: true,
        model: model,
        canvas: canvas.getContext('2d'),
        labelBox: labelBox,
    })

    return count++;
}

async function removeContext(id) {
    if (contexts.has(id)) {
        contexts.delete(id);
    }
}

async function getFileFromPath(path) {
    const { buffer, name, type } = await window.electronAPI.getFileData(path);
    const blob = new Blob([buffer], { type });
    const file = new File([blob], name, { type });
    return file;
}