/**
 * Markdown 内容加载器
 * 负责从 Markdown 文件中加载和解析爱好内容
 */

class MarkdownLoader {
    /**
     * 加载并解析指定爱好的 Markdown 内容
     * @param {string} hobbyId - 爱好 ID（video, hosting, fitness）
     * @returns {Promise<Object>} 解析后的内容对象
     */
    static async loadContent(hobbyId) {
        try {
            const response = await fetch(`content/${hobbyId}.md`);
            if (!response.ok) {
                throw new Error(`Failed to load ${hobbyId}.md: ${response.status}`);
            }
            const text = await response.text();
            return this.parseMarkdown(text);
        } catch (error) {
            console.error(`Error loading content for ${hobbyId}:`, error);
            // 返回空数据以防止应用崩溃
            return {
                metadata: {},
                achievements: []
            };
        }
    }

    /**
     * 解析 Markdown 文本
     * @param {string} text - Markdown 文本内容
     * @returns {Object} 包含 metadata 和 achievements 的对象
     */
    static parseMarkdown(text) {
        const lines = text.split('\n');
        let metadata = {};
        let achievements = [];

        // 解析 YAML frontmatter
        metadata = this.parseFrontmatter(lines);

        // 解析成就部分（以 ## 开头，用 --- 分隔）
        achievements = this.parseAchievements(lines);

        return {
            metadata,
            achievements
        };
    }

    /**
     * 解析 YAML frontmatter（--- 包围的部分）
     * @param {string[]} lines - 文本行数组
     * @returns {Object} metadata 对象
     */
    static parseFrontmatter(lines) {
        const metadata = {};
        let inFrontmatter = false;

        for (const line of lines) {
            const trimmed = line.trim();

            if (trimmed === '---') {
                if (!inFrontmatter) {
                    inFrontmatter = true;
                    continue;
                } else {
                    // 结束 frontmatter
                    break;
                }
            }

            if (inFrontmatter && trimmed) {
                const [key, ...valueParts] = trimmed.split(':');
                if (key && valueParts.length > 0) {
                    metadata[key.trim()] = valueParts.join(':').trim();
                }
            }
        }

        return metadata;
    }

    /**
     * 解析成就部分
     * @param {string[]} lines - 文本行数组
     * @returns {Array} achievements 数组
     */
    static parseAchievements(lines) {
        const achievements = [];
        let currentAchievement = null;
        let inFrontmatter = false;
        let frontmatterEnded = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // 跳过 frontmatter
            if (trimmed === '---') {
                if (!frontmatterEnded) {
                    inFrontmatter = !inFrontmatter;
                    if (!inFrontmatter) {
                        frontmatterEnded = true;
                    }
                    continue;
                } else {
                    // 这是成就之间的分隔符
                    if (currentAchievement) {
                        achievements.push(currentAchievement);
                        currentAchievement = null;
                    }
                    continue;
                }
            }

            if (inFrontmatter) continue;

            // 检测 ## 标题（新成就）
            if (trimmed.startsWith('## ')) {
                // 保存上一个成就
                if (currentAchievement) {
                    achievements.push(currentAchievement);
                }

                // 创建新成就
                currentAchievement = {
                    title: trimmed.substring(3).trim(),
                    description: '',
                    tag: '',
                    image: null
                };
                continue;
            }

            if (currentAchievement) {
                // 解析标签（**标签**: xxx）
                if (trimmed.startsWith('**标签**:')) {
                    currentAchievement.tag = trimmed.substring(9).trim();
                }
                // 解析图片（![...](...）)
                else if (trimmed.startsWith('![')) {
                    const match = trimmed.match(/!\[.*?\]\((.*?)\)/);
                    if (match) {
                        currentAchievement.image = match[1];
                    }
                }
                // 其他文本作为描述
                else if (trimmed && !trimmed.startsWith('#')) {
                    if (currentAchievement.description) {
                        currentAchievement.description += ' ' + trimmed;
                    } else {
                        currentAchievement.description = trimmed;
                    }
                }
            }
        }

        // 添加最后一个成就
        if (currentAchievement) {
            achievements.push(currentAchievement);
        }

        return achievements;
    }

    /**
     * 预加载所有爱好的内容
     * @param {Array<string>} hobbyIds - 爱好 ID 数组
     * @returns {Promise<Object>} 所有内容的映射
     */
    static async preloadAll(hobbyIds) {
        const contentMap = {};

        for (const hobbyId of hobbyIds) {
            contentMap[hobbyId] = await this.loadContent(hobbyId);
        }

        return contentMap;
    }
}

// 导出到全局
window.MarkdownLoader = MarkdownLoader;
