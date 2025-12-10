/**
 * 动画控制器
 * 管理背景动画和交互效果
 */

class AnimationController {
    constructor() {
        this.floatingShapes = [];
        this.init();
    }

    init() {
        this.createFloatingShapes();
        this.initParticles();
    }

    /**
     * 创建浮动背景形状
     */
    createFloatingShapes() {
        const container = document.querySelector('.floating-shapes');

        const shapes = [
            { class: 'shape-1' },
            { class: 'shape-2' },
            { class: 'shape-3' },
            { class: 'shape-4' }
        ];

        shapes.forEach(shape => {
            const div = document.createElement('div');
            div.className = `floating-shape ${shape.class}`;
            container.appendChild(div);
            this.floatingShapes.push(div);
        });
    }

    /**
     * 初始化粒子效果
     */
    initParticles() {
        const container = document.querySelector('.floating-shapes');

        // 创建小光点
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 6 + 2}px;
                height: ${Math.random() * 6 + 2}px;
                background: rgba(255, 217, 61, ${Math.random() * 0.5 + 0.2});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 10 + 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            container.appendChild(particle);
        }

        // 添加粒子动画样式
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.3;
                    }
                    25% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.2);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(0.8);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translate(${Math.random() * 50 - 25}px, ${Math.random() * 50 - 25}px) scale(1.1);
                        opacity: 0.5;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * 创建点击波纹效果
     */
    createRipple(x, y, container) {
        const ripple = document.createElement('div');
        ripple.className = 'ripple-effect';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';

        container.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * 节点弹跳动画
     */
    bounceNode(element) {
        element.style.animation = 'none';
        element.offsetHeight; // 触发重排
        element.style.animation = 'nodeBounce 0.5s var(--transition-bounce)';
    }

    /**
     * 展开子节点动画
     */
    expandChildren(parentNode, children) {
        const angle = (2 * Math.PI) / children.length;
        const radius = 120;

        children.forEach((child, index) => {
            const x = parentNode.x + radius * Math.cos(angle * index - Math.PI / 2);
            const y = parentNode.y + radius * Math.sin(angle * index - Math.PI / 2);

            child.x = parentNode.x;
            child.y = parentNode.y;
            child.targetX = x;
            child.targetY = y;
        });
    }
}

// 初始化动画控制器
let animationController;

document.addEventListener('DOMContentLoaded', () => {
    animationController = new AnimationController();

    // 添加全局点击波纹效果
    document.addEventListener('click', (event) => {
        if (event.target.closest('.node-group')) {
            const svgRect = document.getElementById('graph-svg').getBoundingClientRect();
            animationController.createRipple(
                event.clientX - svgRect.left,
                event.clientY - svgRect.top,
                document.querySelector('.main-group')
            );
        }
    });
});

// 导出
window.AnimationController = AnimationController;
