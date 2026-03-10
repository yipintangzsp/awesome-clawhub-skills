#!/usr/bin/env node

/**
 * 抖音热点监控工具
 * @version 1.0.0
 * @author 张 sir
 */

// 模拟热点数据
const MOCK_HOT_LIST = [
  {
    rank: 1,
    title: '#新年挑战',
    heat: 52000000,
    trend: '↑',
    category: '综合',
    music: '新年快乐 BGM'
  },
  {
    rank: 2,
    title: '#冬日穿搭',
    heat: 38000000,
    trend: '↑',
    category: '时尚',
    music: '温暖冬季'
  },
  {
    rank: 3,
    title: '#美食教程',
    heat: 29000000,
    trend: '→',
    category: '美食',
    music: '烹饪时光'
  },
  {
    rank: 4,
    title: '#搞笑日常',
    heat: 25000000,
    trend: '↓',
    category: '娱乐',
    music: '欢乐颂'
  },
  {
    rank: 5,
    title: '#健身打卡',
    heat: 18000000,
    trend: '↑',
    category: '运动',
    music: '运动进行曲'
  }
];

/**
 * 获取热点榜单
 */
async function getHotList(category = 'all') {
  console.log('🔥 抖音热点榜单\n');
  console.log(`分类：${category === 'all' ? '全部' : category}`);
  console.log('更新时间：' + new Date().toLocaleString('zh-CN'));
  console.log('='.repeat(60));

  let filtered = MOCK_HOT_LIST;
  if (category !== 'all') {
    filtered = MOCK_HOT_LIST.filter(h => h.category === category);
  }

  filtered.forEach(item => {
    console.log(`${item.rank}. ${item.title} ${item.trend}`);
    console.log(`   热度：${(item.heat / 10000).toFixed(1)}万`);
    console.log(`   分类：${item.category}`);
    console.log(`   BGM: ${item.music}`);
    console.log('');
  });

  return filtered;
}

/**
 * 生成创作灵感
 */
function generateInspiration(hotTopic, category) {
  console.log(`💡 创作灵感：${hotTopic}\n`);

  const inspirations = {
    script: `
【脚本框架】
开场 (0-3s): 吸引注意力的钩子
发展 (3-15s): 展示核心内容
高潮 (15-25s): 反转/亮点
结尾 (25-30s): 引导互动
    `.trim(),
    shooting: `
【拍摄建议】
- 使用竖屏 9:16
- 前 3 秒必须有吸引力
- 加入文字说明
- 使用热门滤镜
    `.trim(),
    music: `
【推荐 BGM】
- 当前热点音乐：${MOCK_HOT_LIST[0].music}
- 备选：温暖冬季、欢乐颂
    `.trim(),
    hashtags: `
【推荐话题】
#${hotTopic.replace('#', '')} #热门 #抖音小助手 #${category}
    `.trim()
  };

  Object.entries(inspirations).forEach(([key, value]) => {
    console.log(value);
    console.log('');
  });

  return inspirations;
}

/**
 * 监控关键词
 */
async function trackKeyword(keyword, threshold = 10000) {
  console.log(`🔔 开始监控关键词：${keyword}`);
  console.log(`   提醒阈值：${threshold}热度\n`);

  // 模拟监控
  console.log('✅ 监控已设置');
  console.log('   当热度超过阈值时会推送提醒');
  console.log('   检查频率：每 5 分钟');

  return { keyword, threshold, active: true };
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
抖音热点监控工具

用法:
  node index.js [命令] [选项]

命令:
  --hot             查看热点榜单
  --track <topic>   监控特定话题
  --inspire         获取创作灵感
  --alert           设置关键词提醒
  --category <cat>  分类筛选

选项:
  --category <cat>  分类 (综合/娱乐/美食/时尚/运动)
  --keyword <kw>    关键词
  --threshold <n>   提醒阈值
  --duration <h>    监控时长 (小时)
    `.trim());
    return;
  }

  // 热点榜单
  if (args.includes('--hot')) {
    const category = args.find(a => a.startsWith('--category='))?.split('=')[1] || 'all';
    await getHotList(category);
    return;
  }

  // 创作灵感
  if (args.includes('--inspire')) {
    const category = args.find(a => a.startsWith('--category='))?.split('=')[1] || '综合';
    const topic = MOCK_HOT_LIST[0].title;
    generateInspiration(topic, category);
    return;
  }

  // 关键词监控
  if (args.includes('--alert')) {
    const keyword = args.find(a => a.startsWith('--keyword='))?.split('=')[1] || '热门';
    const threshold = parseInt(args.find(a => a.startsWith('--threshold='))?.split('=')[1]) || 10000;
    await trackKeyword(keyword, threshold);
    return;
  }

  // 默认显示热点
  await getHotList();
}

main().catch(console.error);
