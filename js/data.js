/**
 * 爱好数据配置
 * 基础配置信息，详细内容从 Markdown 文件加载
 */

const hobbyData = {
    // 中心节点
    center: {
        id: 'center',
        name: '我的爱好',
        icon: '🌟',
        color: '#FFD93D',
        description: '探索我的多彩世界'
    },

    // 爱好分类（详细内容从 content/*.md 加载）
    hobbies: [
        {
            id: 'video',
            name: '视频制作',
            icon: '🎬',
            color: '#FF6B6B',
            gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            description: '用镜头记录生活，用剪辑讲述故事。从创意构思到后期制作，每一帧都是收获。'
        },
        {
            id: 'hosting',
            name: '主持',
            icon: '🎤',
            color: '#4ECDC4',
            gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            description: '站在舞台中央，用声音传递力量。控场、互动、感染力，这就是主持的魅力。'
        },
        {
            id: 'fitness',
            name: '健身',
            icon: '💪',
            color: '#95E1D3',
            gradient: 'linear-gradient(135deg, #95E1D3 0%, #4ECDC4 100%)',
            description: '强健体魄，挑战自我。科学训练，持续进步，感受每一次突破的喜悦。'
        }
    ]
};

/**
 * 将数据转换为 D3 力导向图格式
 */
function getGraphData() {
    const nodes = [];
    const links = [];

    // 添加中心节点
    nodes.push({
        id: hobbyData.center.id,
        name: hobbyData.center.name,
        icon: hobbyData.center.icon,
        color: hobbyData.center.color,
        description: hobbyData.center.description,
        type: 'center',
        radius: 60
    });

    // 添加爱好节点和连接
    hobbyData.hobbies.forEach((hobby, index) => {
        nodes.push({
            id: hobby.id,
            name: hobby.name,
            icon: hobby.icon,
            color: hobby.color,
            gradient: hobby.gradient,
            description: hobby.description,
            type: 'hobby',
            radius: 50
        });

        links.push({
            source: hobbyData.center.id,
            target: hobby.id
        });
    });

    return { nodes, links };
}

// 导出数据
window.hobbyData = hobbyData;
window.getGraphData = getGraphData;
