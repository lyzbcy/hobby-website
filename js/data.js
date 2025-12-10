/**
 * 爱好数据配置
 * 包含视频制作、主持、健身三个主要爱好及其成果展示
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
    
    // 爱好分类
    hobbies: [
        {
            id: 'video',
            name: '视频制作',
            icon: '🎬',
            color: '#FF6B6B',
            gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
            description: '用镜头记录生活，用剪辑讲述故事。从创意构思到后期制作，每一帧都是艺术。',
            achievements: [
                {
                    title: '短视频创作',
                    description: '制作创意短视频，在各平台分享生活点滴',
                    tag: '内容创作'
                },
                {
                    title: '剪辑技术',
                    description: '熟练使用 Premiere Pro、DaVinci Resolve 等专业剪辑软件',
                    tag: '技能'
                },
                {
                    title: '特效制作',
                    description: '学习 After Effects，制作炫酷的视觉特效',
                    tag: '进阶'
                },
                {
                    title: '调色艺术',
                    description: '掌握电影级调色技巧，营造独特视觉风格',
                    tag: '专业'
                }
            ]
        },
        {
            id: 'hosting',
            name: '主持',
            icon: '🎤',
            color: '#4ECDC4',
            gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
            description: '站在舞台中央，用声音传递力量。控场、互动、感染力，这就是主持的魅力。',
            achievements: [
                {
                    title: '活动主持',
                    description: '主持各类校园活动、晚会和比赛',
                    tag: '经验'
                },
                {
                    title: '演讲能力',
                    description: '具备出色的公众演讲和即兴发挥能力',
                    tag: '核心能力'
                },
                {
                    title: '控场技巧',
                    description: '能够灵活应对各种突发状况，保持活动流畅进行',
                    tag: '专业'
                },
                {
                    title: '语言表达',
                    description: '普通话标准，表达清晰有感染力',
                    tag: '基础'
                }
            ]
        },
        {
            id: 'fitness',
            name: '健身',
            icon: '💪',
            color: '#95E1D3',
            gradient: 'linear-gradient(135deg, #95E1D3 0%, #4ECDC4 100%)',
            description: '强健体魄，挑战自我。科学训练，持续进步，感受每一次突破的喜悦。',
            achievements: [
                {
                    title: '力量训练',
                    description: '系统进行重量训练，不断突破个人极限',
                    tag: '核心'
                },
                {
                    title: '有氧运动',
                    description: '跑步、游泳、骑行，保持心肺健康',
                    tag: '基础'
                },
                {
                    title: '营养管理',
                    description: '科学饮食计划，合理搭配蛋白质与碳水',
                    tag: '知识'
                },
                {
                    title: '训练计划',
                    description: '制定个性化训练计划，追踪进度和成果',
                    tag: '规划'
                }
            ]
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
            achievements: hobby.achievements,
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
