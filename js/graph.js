/**
 * 知识图谱核心逻辑
 * 使用 D3.js 实现力导向图 - 支持子节点展开
 */

class HobbyGraph {
    constructor(containerId) {
        this.containerId = containerId;
        this.svg = null;
        this.simulation = null;
        this.nodes = [];
        this.links = [];
        this.nodeElements = null;
        this.linkElements = null;
        this.width = 0;
        this.height = 0;
        this.expandedNodes = new Set(); // 记录已展开的节点

        this.init();
    }

    init() {
        // 获取容器尺寸
        const container = document.getElementById(this.containerId);
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        // 初始化 SVG
        this.svg = d3.select('#graph-svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // 创建缩放行为
        const zoom = d3.zoom()
            .scaleExtent([0.3, 2])
            .on('zoom', (event) => {
                this.mainGroup.attr('transform', event.transform);
            });

        this.svg.call(zoom);

        // 点击空白区域收起所有节点
        this.svg.on('click', (event) => {
            if (event.target.tagName === 'svg') {
                this.collapseAll();
            }
        });

        // 创建主组
        this.mainGroup = this.svg.append('g')
            .attr('class', 'main-group');

        // 创建连接线组和节点组
        this.linkGroup = this.mainGroup.append('g').attr('class', 'links');
        this.nodeGroup = this.mainGroup.append('g').attr('class', 'nodes');

        // 加载数据并渲染
        this.loadData();
        this.createSimulation();
        this.render();

        // 监听窗口大小变化
        window.addEventListener('resize', () => this.handleResize());
    }

    loadData() {
        const data = getGraphData();
        this.nodes = data.nodes;
        this.links = data.links;

        // 为每个节点设置初始固定位置，避免初始抖动
        const centerX = this.width / 2;
        // 将中心向下偏移，避免顶部节点被标题遮挡
        const centerY = this.height * 0.55; // 从 0.5 改为 0.55，向下移动
        const angleStep = (2 * Math.PI) / (this.nodes.length - 1);

        this.nodes.forEach((node, i) => {
            if (node.type === 'center') {
                node.x = centerX;
                node.y = centerY;
                node.fx = centerX;
                node.fy = centerY;
            } else if (node.type === 'hobby') {
                const angle = angleStep * (i - 1) - Math.PI / 2;
                const radius = 200;
                node.x = centerX + radius * Math.cos(angle);
                node.y = centerY + radius * Math.sin(angle);
            }
        });
    }

    createSimulation() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(d => {
                    // 子节点与父节点距离更近
                    if (d.source.type === 'hobby' || d.target.type === 'child') {
                        return 100;
                    }
                    return 200;
                })
                .strength(0.8))
            .force('charge', d3.forceManyBody()
                .strength(d => d.type === 'child' ? -200 : -500))
            .force('collision', d3.forceCollide()
                .radius(d => d.radius + 20)
                .strength(0.8))
            .velocityDecay(0.6) // 增加阻尼，减少抖动
            .alphaDecay(0.05) // 加快稳定速度
            .on('tick', () => this.tick());
    }

    render() {
        this.updateGraph();
    }

    updateGraph() {
        // 更新连接线
        this.linkElements = this.linkGroup.selectAll('.link')
            .data(this.links, d => `${d.source.id || d.source}-${d.target.id || d.target}`);

        this.linkElements.exit()
            .transition()
            .duration(300)
            .style('opacity', 0)
            .remove();

        const linkEnter = this.linkElements.enter()
            .append('line')
            .attr('class', d => `link ${d.isChild ? 'child-link' : ''}`)
            .style('opacity', 0);

        this.linkElements = linkEnter.merge(this.linkElements);

        this.linkElements.transition()
            .duration(300)
            .style('opacity', 1);

        // 更新节点
        this.nodeElements = this.nodeGroup.selectAll('.node-group')
            .data(this.nodes, d => d.id);

        this.nodeElements.exit()
            .transition()
            .duration(300)
            .style('opacity', 0)
            .attr('transform', d => {
                const parent = this.nodes.find(n => n.id === d.parentId);
                if (parent) {
                    return `translate(${parent.x}, ${parent.y}) scale(0)`;
                }
                return `translate(${d.x}, ${d.y}) scale(0)`;
            })
            .remove();

        const nodeEnter = this.nodeElements.enter()
            .append('g')
            .attr('class', d => `node-group ${d.type}-node`)
            .style('opacity', 0)
            .attr('transform', d => {
                if (d.type === 'child') {
                    const parent = this.nodes.find(n => n.id === d.parentId);
                    if (parent) {
                        return `translate(${parent.x}, ${parent.y}) scale(0)`;
                    }
                }
                return `translate(${d.x || this.width / 2}, ${d.y || this.height / 2}) scale(0)`;
            })
            .call(this.drag())
            .on('click', (event, d) => this.handleNodeClick(event, d))
            .on('mouseenter', (event, d) => this.handleNodeHover(event, d, true))
            .on('mouseleave', (event, d) => this.handleNodeHover(event, d, false));

        // 添加节点圆圈
        nodeEnter.append('circle')
            .attr('class', 'node-circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.color)
            .attr('stroke', d => d3.color(d.color).darker(0.2))
            .attr('stroke-width', 3);

        // 添加节点图标
        nodeEnter.append('text')
            .attr('class', 'node-icon')
            .attr('dy', d => d.type === 'child' ? '0.35em' : '-0.1em')
            .attr('font-size', d => d.type === 'child' ? '20px' : '28px')
            .text(d => d.icon);

        // 添加节点标签
        nodeEnter.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => d.type === 'child' ? '3em' : '2.2em')
            .attr('font-size', d => d.type === 'child' ? '12px' : '14px')
            .text(d => d.name);

        this.nodeElements = nodeEnter.merge(this.nodeElements);

        // 入场动画
        this.nodeElements.transition()
            .duration(500)
            .ease(d3.easeBackOut.overshoot(1.2))
            .style('opacity', 1)
            .attr('transform', d => `translate(${d.x}, ${d.y}) scale(1)`);

        // 重启模拟
        this.simulation.nodes(this.nodes);
        this.simulation.force('link').links(this.links);
        this.simulation.alpha(0.3).restart();
    }

    tick() {
        if (!this.linkElements || !this.nodeElements) return;

        // 更新连接线位置
        this.linkElements
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);

        // 更新节点位置
        this.nodeElements
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
    }

    drag() {
        return d3.drag()
            .on('start', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0.1).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                // 中心节点保持固定
                if (d.type !== 'center') {
                    d.fx = null;
                    d.fy = null;
                }
            });
    }

    handleNodeClick(event, d) {
        event.stopPropagation();

        if (d.type === 'hobby') {
            // 切换展开/收起状态
            if (this.expandedNodes.has(d.id)) {
                this.collapseNode(d);
            } else {
                this.expandNode(d);
            }
        } else if (d.type === 'center') {
            // 点击中心节点，收起所有
            this.collapseAll();
        } else if (d.type === 'child') {
            // 点击子节点，显示详情提示
            this.showChildTooltip(event, d);
        }
    }

    async expandNode(hobbyNode) {
        // 如果已经展开，先收起其他的
        // this.collapseAll();

        this.expandedNodes.add(hobbyNode.id);

        // 从 Markdown 文件加载内容
        let achievements = [];
        try {
            const content = await MarkdownLoader.loadContent(hobbyNode.id);
            achievements = content.achievements;
        } catch (error) {
            console.error(`Failed to load content for ${hobbyNode.id}:`, error);
            // 如果加载失败，回退到使用 data.js 中的数据
            const hobby = hobbyData.hobbies.find(h => h.id === hobbyNode.id);
            if (hobby && hobby.achievements) {
                achievements = hobby.achievements;
            }
        }

        if (!achievements || achievements.length === 0) {
            console.warn(`No achievements found for ${hobbyNode.id}`);
            return;
        }

        // 计算子节点位置（围绕父节点）
        const childCount = achievements.length;
        const angleStep = Math.PI / (childCount + 1);
        const startAngle = -Math.PI / 2;
        const radius = 120;

        // 确定展开方向（远离中心）
        const centerNode = this.nodes.find(n => n.type === 'center');
        const dx = hobbyNode.x - centerNode.x;
        const dy = hobbyNode.y - centerNode.y;
        const baseAngle = Math.atan2(dy, dx);

        achievements.forEach((achievement, i) => {
            const angle = baseAngle + startAngle + angleStep * (i + 1);
            const childId = `${hobbyNode.id}-child-${i}`;

            // 检查是否已存在
            if (this.nodes.find(n => n.id === childId)) return;

            const childNode = {
                id: childId,
                name: achievement.title,
                icon: this.getAchievementIcon(achievement.tag),
                color: this.lightenColor(hobbyNode.color, 20),
                description: achievement.description,
                image: achievement.image,  // 添加图片字段
                tag: achievement.tag,
                type: 'child',
                parentId: hobbyNode.id,
                radius: 35,
                x: hobbyNode.x,
                y: hobbyNode.y
            };

            // 设置目标位置
            childNode.targetX = hobbyNode.x + radius * Math.cos(angle);
            childNode.targetY = hobbyNode.y + radius * Math.sin(angle);

            this.nodes.push(childNode);
            this.links.push({
                source: hobbyNode.id,
                target: childId,
                isChild: true
            });
        });

        this.updateGraph();

        // 让子节点移动到目标位置
        setTimeout(() => {
            this.nodes.forEach(n => {
                if (n.parentId === hobbyNode.id && n.targetX) {
                    n.x = n.targetX;
                    n.y = n.targetY;
                }
            });
            this.simulation.alpha(0.3).restart();
        }, 100);
    }

    collapseNode(hobbyNode) {
        this.expandedNodes.delete(hobbyNode.id);

        // 移除子节点和连接
        this.nodes = this.nodes.filter(n => n.parentId !== hobbyNode.id);
        this.links = this.links.filter(l => {
            const targetId = l.target.id || l.target;
            return !targetId.startsWith(`${hobbyNode.id}-child`);
        });

        this.updateGraph();
    }

    collapseAll() {
        this.expandedNodes.clear();

        // 移除所有子节点
        this.nodes = this.nodes.filter(n => n.type !== 'child');
        this.links = this.links.filter(l => !l.isChild);

        this.updateGraph();
        this.hideTooltip();
    }

    showChildTooltip(event, d) {
        let tooltip = document.getElementById('node-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.id = 'node-tooltip';
            tooltip.className = 'node-tooltip';
            document.body.appendChild(tooltip);
        }

        // 构建图片 HTML（如果有）
        let imageHtml = '';
        if (d.image) {
            imageHtml = `<img src="${d.image}" alt="${d.name}" class="tooltip-image" style="max-width: 300px; width: 100%; border-radius: 8px; margin: 10px 0; display: block;">`;
        }

        tooltip.innerHTML = `
            <div class="tooltip-header">
                <span class="tooltip-icon">${d.icon}</span>
                <span class="tooltip-title">${d.name}</span>
            </div>
            <p class="tooltip-desc">${d.description}</p>
            ${imageHtml}
            <span class="tooltip-tag">${d.tag}</span>
        `;

        const rect = this.svg.node().getBoundingClientRect();
        tooltip.style.left = (rect.left + d.x + 50) + 'px';
        tooltip.style.top = (rect.top + d.y - 30) + 'px';
        tooltip.classList.add('visible');

        // 3秒后自动隐藏
        setTimeout(() => this.hideTooltip(), 3000);
    }

    hideTooltip() {
        const tooltip = document.getElementById('node-tooltip');
        if (tooltip) {
            tooltip.classList.remove('visible');
        }
    }

    handleNodeHover(event, d, isEnter) {
        // 高亮相关连接线
        this.linkElements
            .classed('highlighted', link =>
                isEnter && (link.source.id === d.id || link.target.id === d.id)
            );

        // 不再改变节点半径，避免触发力导向重新计算导致抖动
        // CSS 的 filter 和 stroke-width 已经提供了足够的悬停反馈
    }

    getAchievementIcon(tag) {
        const iconMap = {
            '内容创作': '📹',
            '技能': '🛠️',
            '进阶': '🚀',
            '专业': '🎯',
            '经验': '📋',
            '核心能力': '💡',
            '基础': '📚',
            '核心': '💪',
            '知识': '🧠',
            '规划': '📊'
        };
        return iconMap[tag] || '✨';
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return `#${(1 << 24 | R << 16 | G << 8 | B).toString(16).slice(1)}`;
    }

    handleResize() {
        const container = document.getElementById(this.containerId);
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        // 更新中心节点位置
        const centerNode = this.nodes.find(n => n.type === 'center');
        if (centerNode) {
            centerNode.fx = this.width / 2;
            centerNode.fy = this.height / 2;
        }

        this.simulation.alpha(0.3).restart();
    }
}

// 初始化图谱
let hobbyGraph;

document.addEventListener('DOMContentLoaded', () => {
    hobbyGraph = new HobbyGraph('graph-container');

    // 隐藏详情面板（不再需要）
    const panel = document.getElementById('detail-panel');
    if (panel) panel.style.display = 'none';

    // 隐藏提示吐司
    setTimeout(() => {
        const toast = document.getElementById('hint-toast');
        if (toast) {
            toast.style.animation = 'toastSlideIn 0.5s var(--transition-bounce) reverse forwards';
        }
    }, 5000);
});
