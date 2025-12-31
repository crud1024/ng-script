// 加载文字位置的钓鱼动画函数
function createFishingAnimation(selector, loadingText = "Loading") {
  // 生成唯一ID
  const animationId = "fishing-animation-" + Date.now();

  // 检查是否已经添加了样式
  if (!document.getElementById("fishing-animation-styles")) {
    const style = document.createElement("style");
    style.id = "fishing-animation-styles";
    style.textContent = `
        /* 引入字体库 */
        @import url('https://fonts.googleapis.com/css?family=Montserrat:300,400,700');
        
        .fishing-animation-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: transparent;
            z-index: 998;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            overflow: hidden;
        }
        
        .fishing-animation-content {
            position: relative;
            width: 400px;
            height: 400px;
            transform: scale(0.8);
            margin-bottom: 5px; /* 为文字留出空间 */
        }
        
        .fishing-animation-bowl {
            width: 250px;
            height: 250px;
            border: 5px solid #fff;
            border-radius: 50%;
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(90, 201, 226, 0.3);
            overflow: hidden;
        }
        
        .fishing-animation-bowl:before {
            content: "";
            position: absolute;
            bottom: -25px;
            left: 50px;
            width: 150px;
            height: 50px;
            border-radius: 50%;
            background: rgba(0,0,0,0.15);
        }
        
        .fishing-animation-bowl:after {
            content: "";
            position: absolute;
            top: 10px;
            left: calc(25% - 3px);
            width: 50%;
            height: 40px;
            border: 3px solid #fff;
            border-radius: 50%;
        }
        
        .fishing-animation-water {
            position: absolute;
            bottom: 5%;
            left: 0;
            width: 100%;
            height: 50%;
            overflow: hidden;
            animation: fishing-top-inner 5s ease infinite;
        }
        
        @keyframes fishing-top-inner {
            from {
                transform: rotate(0deg);
                margin-left: 0px;
            }
            25% {
                transform: rotate(3deg);
                margin-left: -3px;
            }
            50% {
                transform: rotate(-6deg);
                margin-left: 6px;
            }
            75% {
                transform: rotate(5deg);
                margin-left: -5px;
            }
            to {
                transform: rotate(0deg);
                margin-left: 0px;
            }
        }
        
        .fishing-animation-water-inner {
            width: 225px;
            height: 225px;
            border-radius: 50%;
            background: #4e99ce;
            position: absolute;
            bottom: 0;
            left: 12.5px;
        }
        
        .fishing-animation-top-water {
            position: absolute;
            width: 225px;
            height: 60px;
            border-radius: 50%;
            background: #82bde6;
            bottom: 105px;
            left: 12.5px;
            animation: fishing-top 5s ease infinite;
        }
        
        @keyframes fishing-top {
            from {
                transform: rotate(0deg);
            }
            25% {
                transform: rotate(3deg);
            }
            50% {
                transform: rotate(-6deg);
            }
            75% {
                transform: rotate(5deg);
            }
            to {
                transform: rotate(0deg);
            }
        }
        
        .fishing-animation-center-box {
            height: 300px;
            width: 300px;
            position: absolute;
            top: calc(50% - 190px);
            left: calc(50% - 147px); /* 修改这里：从 -150px 改为 -147px，向右移动3px */
            animation: fishing-float 5s ease infinite;
            transform: scale(0.4);
        }
        
        @keyframes fishing-float {
            from {
                transform: translate(0, 0px) scale(0.4);
            }
            25% {
                transform: translate(0, 4px) scale(0.4);
            }
            50% {
                transform: translate(0, -7px) scale(0.4);
            }
            75% {
                transform: translate(0, 7px) scale(0.4);
            }
            to {
                transform: translate(0, -0px) scale(0.4);
            }
        }
        
        .fishing-animation-fisherman {
            width: 300px;
            height: 200px;
            position: relative;
        }
        
        .fishing-animation-fisherman .body {
            width: 60px;
            height: 120px;
            background: #d2bd24;
            position: absolute;
            bottom: 20px;
            right: 30px;
            -webkit-clip-path: ellipse(40% 50% at 0% 50%);
            clip-path: ellipse(40% 50% at 0% 50%);
            transform: rotate(-20deg);
        }
        
        .fishing-animation-fisherman .body:before {
            content: "";
            width: 60px;
            height: 160px;
            background: #d2bd24;
            position: absolute;
            bottom: -8px;
            right: 12px;
            -webkit-clip-path: ellipse(90% 50% at 0% 50%);
            clip-path: ellipse(90% 50% at 0% 50%);
            transform: rotate(10deg);
        }
        
        .fishing-animation-fisherman .right-arm {
            width: 15px;
            height: 90px;
            background: #d2bd24;
            border-radius: 15px;
            position: absolute;
            bottom: 40px;
            right: 120px;
            transform: rotate(40deg);
        }
        
        .fishing-animation-fisherman .right-arm:before {
            content: "";
            background: #ffd1b5;
            width: 20px;
            height: 20px;
            position: absolute;
            top: 65px;
            right: 40px;
            border-radius: 15px;
        }
        
        .fishing-animation-fisherman .right-arm:after {
            content: "";
            width: 15px;
            height: 40px;
            background: #d2bd24;
            border-radius: 15px;
            position: absolute;
            bottom: -12px;
            right: 15px;
            transform: rotate(-80deg);
            border-top-left-radius: 0px;
            border-top-right-radius: 0px;
        }
        
        .fishing-animation-fisherman .right-leg {
            width: 15px;
            height: 90px;
            background: #bf3526;
            border-radius: 15px;
            position: absolute;
            bottom: -15px;
            right: 120px;
            transform: rotate(-60deg);
        }
        
        .fishing-animation-fisherman .right-leg:before {
            content: "";
            width: 15px;
            height: 80px;
            background: #bf3526;
            border-radius: 15px;
            position: absolute;
            bottom: 35px;
            left: -30px;
            transform: rotate(80deg);
        }
        
        .fishing-animation-fisherman .right-leg:after {
            content: "";
            position: absolute;
            bottom: 30px;
            left: -60px;
            width: 25px;
            height: 80px;
            background: #338ca0;
            transform: rotate(80deg);
        }
        
        .fishing-animation-rod {
            position: absolute;
            width: 280px;
            height: 4px;
            bottom: 100px;
            left: -105px;
            background: #331604;
            transform: rotate(10deg);
        }
        
        .fishing-animation-rod .handle {
            width: 15px;
            height: 15px;
            border-radius: 15px;
            left: 230px;
            top: 2px;
            background: #efdddb;
        }
        
        .fishing-animation-rod .handle:before {
            content: "";
            position: absolute;
            width: 10px;
            height: 3px;
            left: 8px;
            top: 5px;
            background: #1a1a1a;
        }
        
        .fishing-animation-rod .rope {
            width: 2px;
            height: 190px;
            top: -14px;
            left: 17px;
            transform: rotate(-10deg);
            background: #fff;
        }
        
        .fishing-animation-fisherman .butt {
            position: absolute;
            width: 40px;
            height: 15px;
            border-radius: 15px;
            bottom: 5px;
            right: 70px;
            background: #bf3526;
        }
        
        .fishing-animation-fisherman .left-arm {
            position: absolute;
            width: 15px;
            height: 70px;
            bottom: 45px;
            right: 100px;
            border-radius: 15px;
            transform: rotate(30deg);
            background: #e8d93d;
        }
        
        .fishing-animation-fisherman .left-arm:before {
            content: "";
            position: absolute;
            width: 20px;
            height: 20px;
            top: 40px;
            right: 40px;
            border-radius: 15px;
            background: #ffd1b5;
        }
        
        .fishing-animation-fisherman .left-arm:after {
            content: "";
            position: absolute;
            width: 15px;
            height: 45px;
            bottom: -12px;
            right: 15px;
            border-radius: 15px;
            transform: rotate(-70deg);
            background: #e8d93d;
        }
        
        .fishing-animation-fisherman .left-leg {
            position: absolute;
            width: 15px;
            height: 80px;
            bottom: -10px;
            right: 90px;
            border-radius: 15px;
            transform: rotate(-50deg);
            background: #de4125;
        }
        
        .fishing-animation-fisherman .left-leg:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 80px;
            bottom: 15px;
            left: -28px;
            border-radius: 15px;
            transform: rotate(60deg);
            background: #de4125;
        }
        
        .fishing-animation-fisherman .left-leg:after {
            content: "";
            position: absolute;
            width: 25px;
            height: 80px;
            bottom: 2px;
            left: -55px;
            transform: rotate(60deg);
            background: #338ca0;
        }
        
        .fishing-animation-head {
            position: absolute;
            width: 45px;
            height: 60px;
            bottom: 100px;
            right: 85px;
            border-radius: 50%;
            transform: rotate(10deg);
        }
        
        .fishing-animation-head .face {
            position: absolute;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            overflow: hidden;
            background: #d76540;
        }
        
        .fishing-animation-head .face:before {
            content: "";
            position: absolute;
            width: 45px;
            height: 65px;
            top: -15px;
            left: -8px;
            border-radius: 50%;
            background: #ffd1b5;
            transform: rotate(-10deg);
        }
        
        .fishing-animation-head .eyebrows {
            position: absolute;
            width: 12px;
            height: 5px;
            top: 12px;
            left: -2px;
            transform: rotate(-10deg);
            background: #e67e5b;
        }
        
        .fishing-animation-head .eyebrows:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 5px;
            top: 0px;
            left: 17px;
            background: #e67e5b;
        }
        
        .fishing-animation-head .eyes {
            position: absolute;
            width: 4px;
            height: 6px;
            top: 20px;
            left: 5px;
            border-radius: 50%;
            transform: rotate(-10deg);
            background: #1a1a1a;
        }
        
        .fishing-animation-head .eyes:before {
            content: "";
            position: absolute;
            width: 4px;
            height: 6px;
            top: 0px;
            left: 15px;
            border-radius: 50%;
            background: #1a1a1a;
        }
        
        .fishing-animation-head .nose {
            position: absolute;
            width: 0;
            height: 0;
            border-top: 15px solid transparent;
            border-bottom: 6px solid transparent;
            border-right: 12px solid #fab58e;
            top: 20px;
            left: 5px;
            transform: rotate(-10deg);
        }
        
        .fishing-animation-head .beard {
            position: absolute;
            width: 30px;
            height: 20px;
            top: 30px;
            left: 1px;
            transform: rotate(-10deg);
            clip-path: ellipse(50% 50% at 50% 100%);
            background: #e67e5b;
        }
        
        .fishing-animation-head .hat {
            position: absolute;
            width: 60px;
            height: 6px;
            top: 6px;
            left: -10px;
            background: #3d402b;
        }
        
        .fishing-animation-head .hat:before {
            content: "";
            position: absolute;
            width: 45px;
            height: 30px;
            left: 8px;
            bottom: 6px;
            clip-path: ellipse(50% 50% at 50% 90%);
            background: #7b8445;
        }
        
        .fishing-animation-boat {
            width: 300px;
            height: 75px;
            margin-top: -10px;
        }
        
        .fishing-animation-boat .motor {
            width: 60px;
            height: 60px;
            border-radius: 15px;
            top: -40px;
            right: -280px;
            background: #ef4723;
        }
        
        .fishing-animation-boat .motor:before {
            content: "";
            position: absolute;
            width: 15px;
            height: 75px;
            clip-path: polygon(0 0, 100% 0, 60% 100%, 0% 100%);
            top: 40px;
            right: 15px;
            z-index: -1;
            background: #bf3526;
        }
        
        .fishing-animation-boat .motor:after {
            content: "";
            position: absolute;
            width: 60px;
            height: 15px;
            left: 0;
            top: 0;
            border-top-left-radius: 14px;
            border-top-right-radius: 14px;
            background: #fff;
        }
        
        .fishing-animation-boat .parts,
        .fishing-animation-boat .parts:before,
        .fishing-animation-boat .parts:after {
            position: absolute;
            width: 20px;
            height: 4px;
            right: 8px;
            top: 22px;
            border-radius: 15px;
            background: #bf3526;
        }
        
        .fishing-animation-boat .parts:before,
        .fishing-animation-boat .parts:after {
            content: "";
            right: 0px;
        }
        
        .fishing-animation-boat .parts:before {
            top: 8px;
        }
        
        .fishing-animation-boat .parts:after {
            top: 15px;
        }
        
        .fishing-animation-boat .button {
            position: absolute;
            width: 15px;
            height: 8px;
            left: -8px;
            top: 20px;
            border-radius: 15px;
            background: #bf3526;
        }
        
        .fishing-animation-boat .top {
            position: absolute;
            width: 290px;
            height: 4px;
            top: 0;
            right: 0;
            border-bottom: solid 4px #cdab33;
            background: #e8da43;
        }
        
        .fishing-animation-boat .boat-body {
            position: absolute;
            width: 280px;
            height: 70px;
            bottom: 0;
            right: 0;
            border-bottom-left-radius: 70px;
            border-bottom-right-radius: 15px;
            clip-path: polygon(0 0, 100% 0, 99% 100%, 0% 100%);
            background: #cdab33;
        }
        
        .fishing-animation-boat .boat-body:before {
            content: "";
            position: absolute;
            width: 280px;
            height: 55px;
            bottom: 15px;
            right: 0px;
            border-bottom-left-radius: 45px;
            background: #d2bd39;
        }
        
        .fishing-animation-boat .boat-body:after {
            content: "";
            position: absolute;
            width: 280px;
            height: 30px;
            bottom: 40px;
            right: 0px;
            border-bottom-left-radius: 45px;
            background: #e8da43;
        }
        
        .fishing-animation-waves {
            height: 100%;
            box-sizing: border-box;
            border: 5px solid #fff;
            border-radius: 50%;
            transform: translate(22px, -22px);
            z-index: -10;
            animation: fishing-waves 5s ease infinite;
        }
        
        @keyframes fishing-waves {
            from {
                margin-left: 0px;
                margin-right: 0px;
                border-color: #fff;
            }
            to {
                margin-left: -75px;
                margin-right: -75px;
                border-color: transparent;
            }
        }
        
        .fishing-animation-fish {
            position: absolute;
            width: 12px;
            height: 12px;
            margin-left: 6px;
            animation: fishing-jump 3s infinite;
            z-index: 10;
        }
        
        @keyframes fishing-jump {
            0% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 1;
            }
            16.7% {
                left: 52px;
                top: 45px;
                transform: rotate(-20deg);
                opacity: 1;
            }
            33.4% {
                left: 45px;
                top: 90px;
                transform: rotate(-90deg);
                opacity: 0;
            }
            50% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 0;
            }
            100% {
                left: 60px;
                top: 90px;
                transform: rotate(90deg);
                opacity: 0;
            }
        }
        
        .fishing-animation-text {
            position: absolute;
            width: 100%;
            text-align: center;
            font-size: 32px;
            color: rgba(0, 0, 0, 0.15);
            font-family: 'Montserrat', sans-serif;
            bottom: -5px; /* 将文字放在碗的下方 */
            z-index: 1;
        }
    `;
    document.head.appendChild(style);
  }

  // 获取目标元素
  const targetElement = document.querySelector(selector);
  if (!targetElement) {
    console.error(`元素 ${selector} 未找到`);
    return null;
  }

  // 创建动画容器
  const container = document.createElement("div");
  container.className = "fishing-animation-container";
  container.id = animationId;

  // 创建内容容器
  const content = document.createElement("div");
  content.className = "fishing-animation-content";

  // 创建钓鱼动画HTML结构
  content.innerHTML = `
    <div class="fishing-animation-bowl">
        <div class="fishing-animation-water">
            <div class="fishing-animation-water-inner"></div>
        </div>
        <div class="fishing-animation-top-water"></div>
        <div class="fishing-animation-center-box">
            <div class="fishing-animation-fisherman">
                <div class="body"></div>
                <div class="right-arm"></div>
                <div class="right-leg"></div>
                <div class="fishing-animation-rod">
                    <div class="handle"></div>
                    <div class="rope"></div>
                </div>
                <div class="butt"></div>
                <div class="left-arm"></div>
                <div class="left-leg"></div>
                <div class="fishing-animation-head">
                    <div class="face"></div>
                    <div class="eyebrows"></div>
                    <div class="eyes"></div>
                    <div class="nose"></div>
                    <div class="beard"></div>
                    <div class="hat"></div>
                </div>
            </div>
            <div class="fishing-animation-boat">
                <div class="motor">
                    <div class="parts"></div>
                    <div class="button"></div>
                </div>
                <div class="top"></div>
                <div class="boat-body"></div>
                <div class="fishing-animation-waves"></div>
            </div>
        </div>
        <div class="fishing-animation-fish">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                x="0px" y="0px" viewBox="0 0 483.7 361.9" style="enable-background:new 0 0 483.7 361.9;" xml:space="preserve">
                <style type="text/css">
                    .fishing-st0 { fill: #E0AC26; }
                    .fishing-st1 { fill: #E0AC26; stroke: #E0AC26; stroke-width: 1.061; stroke-miterlimit: 10; }
                    .fishing-st2 { fill: #FFFFFF; }
                </style>
                <g>
                    <g>
                        <path class="fishing-st0" d="M168.8,298.4c1.2,8.5,0.3,17.1,0.5,25.7c0.2,9.6,2,18.6,8.8,25.9c9.4,10,25.3,14.4,38.7,10.4
                                c17.7-5.3,21.7-23.3,19.9-39.9c-1.9-18.1-36.9-35.6-47.7-49.9" />
                        <g>
                            <path class="fishing-st0" d="M167.6,298.4c2.1,17-3.6,36.8,8.5,51.2c9.6,11.4,26.7,16.2,40.8,11.9c13.3-4,19.8-16,20.9-29.2
                                    c0.5-5.8,0.6-12.3-1.8-17.7c-2.4-5.5-6.6-10-10.9-14.1c-11.2-10.7-25.9-18.5-35.6-30.8c-0.9-1.1-2.5,0.5-1.6,1.6
                                    c6.8,8.7,16.6,15,25.1,21.8c8.2,6.6,19.6,14.9,22,25.8c2.6,11.8-0.2,27.8-9.9,35.7c-12.2,9.9-31.9,7-43.4-2.6
                                    c-16.4-13.6-9.8-35.4-12.1-53.7C169.7,297,167.5,297,167.6,298.4L167.6,298.4z" />
                        </g>
                    </g>
                    <path class="fishing-st1" d="M478.9,117c4.7-9.7,8.2-23.7-1.1-29.1c-14.2-8.2-57.5,45.2-56.5,46.4c-48.6-54.4-77.1-85.6-131.5-106.8
                            c-16.6-6.5-34.3-10.2-52.2-11.2c-6-0.8-12-1.4-18-1.7C156.4,11.3,100.7,51.6,80,64.7C59.3,77.8,2.5,154.2,0.4,158.5
                            c0,0-1.1,9.8,15.3,22.9s22.9,12,16.4,22.9c-6.5,10.9-30.6,17.5-31.7,26.2c-1.1,8.7,0,8.7,8.7,10.9c8.7,2.2,50.2,46.5,103.7,64.7
                            c53.5,18.2,111.7,18.2,146.4,12.8c2.7-0.4,5.5-1,8.2-1.6c12.3-1.9,24.7-4.5,33-8.2c15.7-5.9,28.9-12.5,34.2-15.3
                            c1.6,0.5,3.2,1.1,4.6,1.9c2.1,3.1,5.5,7.9,8.9,11.6c7.6,8.2,20.9,8.6,31.1,4c7.7-3.5,18.9-16.7,21.6-25.2c2.2-6.8,2.3-5.1-0.9-10.3
                            c-0.5-0.9-14.9-8.8-14.7-9c14.3-15.3,34.3-40,34.3-40c10.4,15.9,29.6,47.3,43.1,47.8c17.3,0.7,18.9-18.6,16-30.9
                            C466.5,195.2,456,164,478.9,117z" />
                    <!-- 其余SVG路径保持不变，只需添加fishing-前缀到类名 -->
                </g>
            </svg>
        </div>
    </div>
    <div class="fishing-animation-text">${loadingText}</div>
`;

  // 将内容添加到容器
  container.appendChild(content);

  // 添加到目标元素
  targetElement.appendChild(container);

  // 创建加载文本动画
  let dots = 0;
  const textElement = content.querySelector(".fishing-animation-text");
  let loadingInterval = setInterval(() => {
    let str = "";
    if (dots < 3) {
      dots++;
    } else {
      dots = 1;
    }
    for (let i = 0; i < dots; i++) {
      str += ".";
    }
    textElement.textContent = loadingText + str;
  }, 500);

  // 返回控制对象
  return {
    // 移除动画
    remove: function () {
      clearInterval(loadingInterval);
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    },

    // 更新文本
    updateText: function (newText) {
      loadingText = newText;
      textElement.textContent = newText;
    },

    // 暂停动画
    pause: function () {
      const animatedElements = container.querySelectorAll("*");
      animatedElements.forEach((el) => {
        if (el.style.animationPlayState !== undefined) {
          el.style.animationPlayState = "paused";
        }
      });
      clearInterval(loadingInterval);
    },

    // 恢复动画
    resume: function () {
      const animatedElements = container.querySelectorAll("*");
      animatedElements.forEach((el) => {
        if (el.style.animationPlayState !== undefined) {
          el.style.animationPlayState = "running";
        }
      });
      // 重新启动文本动画
      dots = 0;
      loadingInterval = setInterval(() => {
        let str = "";
        if (dots < 3) {
          dots++;
        } else {
          dots = 1;
        }
        for (let i = 0; i < dots; i++) {
          str += ".";
        }
        textElement.textContent = loadingText + str;
      }, 500);
    },
  };
}

// 移除所有钓鱼动画
function removeAllFishingAnimations() {
  const containers = document.querySelectorAll(".fishing-animation-container");
  containers.forEach((container) => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  });
}
export { createFishingAnimation, removeAllFishingAnimations };
//使用示例
// const fishingAnimation = createFishingAnimation("#app", "加载中");

// // 5秒后移除动画
// setTimeout(() => {
//   fishingAnimation.remove();
// }, 5000);
