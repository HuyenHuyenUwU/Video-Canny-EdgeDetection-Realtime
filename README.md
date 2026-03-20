# Web Demo Video & Edge-detected Frame tương ứng bằng JS
___

Bài này thực chất là video processing realtime trên browser bằng HTML5 Video + Canvas + JavaScript + OpenCV.js (Canny Edge Detection)

Trang web có 2 canvas: 
- canvas bên trái là video gốc
- canvas bên phải là khung hình tương ứng đã được Phát hiện biên cạnh (có dạng trắng đen, đường nét màu trắng là biên cạnh, phần màu đen thì không phải biên cạnh) 

## Pipeline
___
```
Video → lấy frame → xử lý Canny → vẽ sang canvas khác (real-time)
```

## Cấu trúc project
___
```
web_js_video_edgeDetection/
├── README.md
├── index.html
├── style.css
├── script.js
└── video/
    └── sample.mp4
```

## Cách chạy
___
- Chạy file `index.html` trên local host
- Hoặc vào link web đã đc host bằng vercel: // cái link sẽ có sau

