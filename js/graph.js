/**
 * 知识图谱核心逻辑
 * 使用 D3.js 实现力导向图
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
        this.selectedNode = null;

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
            .scaleExtent([0.5, 2])
            .on('zoom', (event) => {
                this.mainGroup.attr('transform', event.transform);
            });

        this.svg.call(zoom);

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
    }

    createSimulation() {
        this.simulation = d3.forceSimulation(this.nodes)
            .force('link', d3.forceLink(this.links)
                .id(d => d.id)
                .distance(180)
                .strength(0.5))
            .force('charge', d3.forceManyBody()
                .strength(-800))
            .force('center', d3.forceCenter(this.width / 2, this.height / 2))
            .force('collision', d3.forceCollide()
                .radius(d => d.radius + 30))
            .on('tick', () => this.tick());
    }

    render() {
        // 渲染连接线
        this.linkElements = this.linkGroup.selectAll('.link')
            .data(this.links)
            .enter()
            .append('line')
            .attr('class', 'link');

        // 渲染节点
        this.nodeElements = this.nodeGroup.selectAll('.node-group')
            .data(this.nodes)
            .enter()
            .append('g')
            .attr('class', d => `node-group ${d.type === 'center' ? 'center-node' : ''}`)
            .call(this.drag())
            .on('click', (event, d) => this.handleNodeClick(event, d))
            .on('mouseenter', (event, d) => this.handleNodeHover(event, d, true))
            .on('mouseleave', (event, d) => this.handleNodeHover(event, d, false));

        // 添加节点圆圈
        this.nodeElements.append('circle')
            .attr('class', 'node-circle')
            .attr('r', d => d.radius)
            .attr('fill', d => d.color)
            .attr('stroke', d => d3.color(d.color).darker(0.3));

        // 添加节点图标
        this.nodeElements.append('text')
            .attr('class', 'node-icon')
            .attr('dy', '-0.2em')
            .text(d => d.icon);

        // 添加节点标签
        this.nodeElements.append('text')
            .attr('class', 'node-label')
            .attr('dy', '1.8em')
            .text(d => d.name);
    }

    tick() {
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
                if (!event.active) this.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) this.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });
    }

    handleNodeClick(event, d) {
        event.stopPropagation();

        // 添加点击动画
        const nodeElement = event.currentTarget;
        nodeElement.classList.add('bounce');
        setTimeout(() => nodeElement.classList.remove('bounce'), 500);

        // 如果是爱好节点，显示详情面板
        if (d.type === 'hobby') {
            this.showDetailPanel(d);
            this.highlightNode(d);
        } else if (d.type === 'center') {
            // 点击中心节点，重置视图
            this.resetView();
        }
    }

    handleNodeHover(event, d, isEnter) {
        // 高亮相关连接线
        this.linkElements
            .classed('highlighted', link =>
                isEnter && (link.source.id === d.id || link.target.id === d.id)
            );
    }

    highlightNode(selectedNode) {
        this.selectedNode = selectedNode;

        // 降低其他节点透明度
        this.nodeElements.style('opacity', d =>
            d.id === selectedNode.id || d.id === 'center' ? 1 : 0.4
        );

        // 高亮相关连接线
        this.linkElements
            .style('opacity', link =>
                link.source.id === selectedNode.id || link.target.id === selectedNode.id ? 1 : 0.2
            );
    }

    resetView() {
        this.selectedNode = null;
        this.hideDetailPanel();

        this.nodeElements.style('opacity', 1);
        this.linkElements.style('opacity', 1);
    }

    showDetailPanel(hobby) {
        const panel = document.getElementById('detail-panel');
        const content = document.getElementById('panel-content');

        // 构建面板内容
        let achievementsHtml = '';
        hobby.achievements.forEach(achievement => {
            achievementsHtml += `
                <li class="achievement-item">
                    <h4>${achievement.title}</h4>
                    <p>${achievement.description}</p>
                    <span class="achievement-tag">${achievement.tag}</span>
                </li>
            `;
        });

        content.innerHTML = `
            <div class="panel-icon" style="font-size: 3rem; margin-bottom: 15px;">${hobby.icon}</div>
            <h2 class="panel-title">${hobby.name}</h2>
            <p class="panel-description">${hobby.description}</p>
            <h3 style="margin-bottom: 15px; color: var(--text-dark);">✨ 成果展示</h3>
            <ul class="achievement-list">
                ${achievementsHtml}
            </ul>
        `;

        // 显示面板
        panel.classList.remove('hidden');
        panel.classList.add('visible');
    }

    hideDetailPanel() {
        const panel = document.getElementById('detail-panel');
        panel.classList.remove('visible');
        panel.classList.add('hidden');
    }

    handleResize() {
        const container = document.getElementById(this.containerId);
        this.width = container.clientWidth;
        this.height = container.clientHeight;

        this.svg
            .attr('width', this.width)
            .attr('height', this.height);

        this.simulation.force('center', d3.forceCenter(this.width / 2, this.height / 2));
        this.simulation.alpha(0.3).restart();
    }
}

// 初始化图谱
let hobbyGraph;

document.addEventListener('DOMContentLoaded', () => {
    hobbyGraph = new HobbyGraph('graph-container');

    // 关闭面板按钮
    document.getElementById('close-panel').addEventListener('click', () => {
        hobbyGraph.resetView();
    });

    // 点击空白区域关闭面板
    document.getElementById('graph-svg').addEventListener('click', (event) => {
        if (event.target.tagName === 'svg') {
            hobbyGraph.resetView();
        }
    });

    // 隐藏提示吐司
    setTimeout(() => {
        const toast = document.getElementById('hint-toast');
        toast.style.animation = 'toastSlideIn 0.5s var(--transition-bounce) reverse forwards';
    }, 5000);
});
