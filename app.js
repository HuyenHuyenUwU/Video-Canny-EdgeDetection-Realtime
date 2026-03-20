const video = document.getElementById("video");
const canvasOutput = document.getElementById("outputCanvas");
const uploadInput = document.getElementById("videoUpload");
const ctxOutput = canvasOutput.getContext("2d");

let cvReady = false; // kiểm tra opencv load xong chưa
let isProcessing = false; // tránh gọi processVideo nhiều lần khi video đang xử lý
let frameRequestId = null; // lưu ID của requestAnimationFrame để có thể hủy khi cần

// canvas tạm (không hiển thị), có tác dụng lưu trữ frame video để xử lý bằng OpenCV
const tempCanvas = document.createElement("canvas");
// lấy context của canvas tạm để vẽ frame video vào đó thay vì vẽ trực tiếp lên canvas hiển thị, tối ưu hiệu suất
const tempCtx = tempCanvas.getContext("2d");

function syncCanvasSizeToVideo() {
    if (!video.videoWidth || !video.videoHeight) return;
    canvasOutput.width = video.videoWidth;
    canvasOutput.height = video.videoHeight;
    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;
}

// Upload video từ máy tính
uploadInput.addEventListener("change", function (event) {
    // ng dùng chọn file
    const file = event.target.files[0];

    if (!file) return;

    // tạo URL tạm cho video
    const videoURL = URL.createObjectURL(file);

    // đổi source video
    video.src = videoURL;
    console.log("Video source updated: " + videoURL);

    // load video mới
    video.load();
    video.onloadeddata = () => {
        syncCanvasSizeToVideo();
        video.play().catch(() => {
            // Một số trình duyệt chặn autoplay nếu chưa có tương tác.
        });
    };
});

video.addEventListener("loadedmetadata", syncCanvasSizeToVideo);

video.addEventListener("play", () => {
    if (!cvReady) return;
    processVideo();
});

video.addEventListener("pause", () => {
    isProcessing = false;
    if (frameRequestId !== null) {
        cancelAnimationFrame(frameRequestId);
        frameRequestId = null;
    }
});

video.addEventListener("ended", () => {
    isProcessing = false;
    if (frameRequestId !== null) {
        cancelAnimationFrame(frameRequestId);
        frameRequestId = null;
    }
});

function onOpenCvReady() {
    cvReady = true;
    console.log("OpenCV ready!");

    // Nếu video đã phát trước khi OpenCV sẵn sàng thì bắt đầu xử lý ngay   
    if (!video.paused && !video.ended) {
        processVideo();
    }
}

// OpenCV load async, cần chờ cv xuất hiện trước khi gán callback
function waitForOpenCv() {
    if (window.cv) {
        window.cv.onRuntimeInitialized = onOpenCvReady;
        return;
    }
    setTimeout(waitForOpenCv, 50);
}

waitForOpenCv();

// Hàm xử lý video
function processVideo() {

    if (!cvReady || isProcessing) return;
    isProcessing = true;

    // set size canvas theo video
    syncCanvasSizeToVideo();

    const FPS = 30;

    // Hàm xử lý từng frame
    function computeFrame() {

        if (video.paused || video.ended) {
            isProcessing = false;
            return;
        }

        // 1. Lấy frame video
        tempCtx.drawImage(video, 0, 0);

        let src = cv.imread(tempCanvas);
        let gray = new cv.Mat();
        let edges = new cv.Mat();

        // 2. Convert sang grayscale
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // 3. Canny Edge Detection
        cv.Canny(
            gray,
            edges,
            50,   // threshold thấp
            100    // threshold cao
        );

        // 4. Hiển thị ra canvas phải
        cv.imshow(canvasOutput, edges);

        // 5. Giải phóng RAM
        src.delete();
        gray.delete();
        edges.delete();

        // 6. Lặp frame tiếp theo
        // dùng RAF để đồng bộ với tốc độ làm mới của trình duyệt, hiệu suất hơn setTimeout
        frameRequestId = requestAnimationFrame(computeFrame);
    }

    frameRequestId = requestAnimationFrame(computeFrame);
}