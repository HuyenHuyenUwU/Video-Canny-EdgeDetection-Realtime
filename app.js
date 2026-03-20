const video = document.getElementById("video");
const canvasOutput = document.getElementById("outputCanvas");
const uploadInput = document.getElementById("videoUpload");
const ctxOutput = canvasOutput.getContext("2d");

// canvas tạm (không hiển thị), có tác dụng lưu trữ frame video để xử lý bằng OpenCV
const tempCanvas = document.createElement("canvas");
// lấy context của canvas tạm để vẽ frame video vào đó thay vì vẽ trực tiếp lên canvas hiển thị, tối ưu hiệu suất
const tempCtx = tempCanvas.getContext("2d");

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
        video.play();
    };
});
uploadInput.onChange = function () {
    alert("File đã được chọn: " + this.value);
}

// OpenCV load xong mới chạy, nếu ko thì lỗi "cv is not defined"
cv['onRuntimeInitialized'] = () => {
    console.log("OpenCV ready!");

    // bắt sự kiện play của video
    video.addEventListener("play", processVideo);
};

// Hàm xử lý video
function processVideo() {

    // set size canvas theo video
    canvasOutput.width = video.videoWidth;
    canvasOutput.height = video.videoHeight;

    tempCanvas.width = video.videoWidth;
    tempCanvas.height = video.videoHeight;

    const FPS = 30;

    // Hàm xử lý từng frame
    function computeFrame() {

        if (video.paused || video.ended) {
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
        requestAnimationFrame(computeFrame);
    }

    requestAnimationFrame(computeFrame);
}