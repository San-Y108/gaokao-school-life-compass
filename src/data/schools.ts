import { School } from '@/types/school';

export const schools: School[] = [
  {
    id: 'pku',
    name: '北京大学',
    city: '北京',
    tierTag: '985',
    rankingBand: '前3',
    hasMorningStudy: false,
    hasEveningStudy: false,
    selfStudyHours: '无强制要求',
    studyPressureLevel: 'medium',
    adminStrictnessLevel: 'low',
    freedomLevel: 'very-high',
    dormCheckLevel: 'low',
    attendanceStrictnessLevel: 'low',
    peRequirementLevel: 'medium',
    transferMajorDifficulty: 'hard',
    recommendationRateText: '保研率约50-60%',
    studentSentimentTags: ['自由开放', '学术氛围浓厚', '多元包容', '自主学习'],
    summary: '北大以自由开放的学术氛围著称，学生自主性强，管理制度相对宽松。学校注重培养学生的独立思考能力，学习压力适中但学术要求严格。',
    pros: [
      '学术自由度高，课程选择丰富',
      '学生社团活动活跃，文化氛围浓厚',
      '管理制度人性化，尊重学生个性',
      '国际交流机会多，视野开阔'
    ],
    cons: [
      '转专业难度较大，竞争激烈',
      '部分专业课程压力较大',
      '校园面积相对较小',
      '生活成本较高'
    ],
    suitableFor: [
      '自律性强、自主学习能力突出的学生',
      '追求学术自由和多元发展的学生',
      '希望参与丰富社团活动的学生',
      '能够适应高强度学术要求的学生'
    ],
    notSuitableFor: [
      '需要严格管理才能保持学习状态的学生',
      '希望轻松获得学位的学生',
      '偏好稳定、规律生活的学生',
      '对专业选择不确定的学生'
    ],
    quotes: [
      {
        text: '在北大最大的感受就是自由，你可以选择任何你感兴趣的方向去探索。',
        source: '2022级本科生'
      },
      {
        text: '这里没有强制自习，但大家都在图书馆学到很晚，氛围很好。',
        source: '2021级研究生'
      }
    ],
    disclaimer: '以上信息基于公开资料和学生反馈整理，具体政策可能因年份和专业而异。'
  },
  {
    id: 'tsinghua',
    name: '清华大学',
    city: '北京',
    tierTag: '985',
    rankingBand: '前3',
    hasMorningStudy: true,
    hasEveningStudy: true,
    selfStudyHours: '建议6-8小时',
    studyPressureLevel: 'very-high',
    adminStrictnessLevel: 'medium',
    freedomLevel: 'medium',
    dormCheckLevel: 'medium',
    attendanceStrictnessLevel: 'medium',
    peRequirementLevel: 'high',
    transferMajorDifficulty: 'very-hard',
    recommendationRateText: '保研率约50-60%',
    studentSentimentTags: ['严谨务实', '工科强校', '学习压力大', '体育传统'],
    summary: '清华以严谨务实的学风著称，学习压力大，管理制度相对规范。学校重视体育传统，对学生的学术要求严格，整体氛围偏向工科思维。',
    pros: [
      '工科实力全国顶尖，就业前景好',
      '学习氛围浓厚，同学都很努力',
      '体育设施完善，重视体育锻炼',
      '校友资源丰富，人脉网络强大'
    ],
    cons: [
      '学习压力极大，竞争激烈',
      '转专业非常困难',
      '管理制度相对严格',
      '工科思维主导，文科相对弱势'
    ],
    suitableFor: [
      '抗压能力强、能承受高强度的学习压力',
      '对工科或理科有强烈兴趣的学生',
      '自律性强、目标明确的学生',
      '重视体育锻炼和身体素质的学生'
    ],
    notSuitableFor: [
      '希望轻松度过大学生活的学生',
      '对专业选择不确定的学生',
      '无法适应高压竞争环境的学生',
      '偏好文科或艺术类专业的学生'
    ],
    quotes: [
      {
        text: '在清华，不努力真的会被淘汰，但成长也很快。',
        source: '2020级本科生'
      },
      {
        text: '无体育，不清华。这里的体育要求比想象中严格。',
        source: '2021级本科生'
      }
    ],
    disclaimer: '以上信息基于公开资料和学生反馈整理，具体政策可能因年份和专业而异。'
  },
  {
    id: 'fudan',
    name: '复旦大学',
    city: '上海',
    tierTag: '985',
    rankingBand: '前10',
    hasMorningStudy: false,
    hasEveningStudy: false,
    selfStudyHours: '无强制要求',
    studyPressureLevel: 'medium',
    adminStrictnessLevel: 'low',
    freedomLevel: 'high',
    dormCheckLevel: 'low',
    attendanceStrictnessLevel: 'low',
    peRequirementLevel: 'medium',
    transferMajorDifficulty: 'medium',
    recommendationRateText: '保研率约40-50%',
    studentSentimentTags: ['海派文化', '国际化', '学术自由', '都市生活'],
    summary: '复旦融合了海派文化和国际化视野，学术氛围自由开放。学校位于上海市中心，学生可以充分体验都市生活，管理制度相对宽松。',
    pros: [
      '地理位置优越，实习和就业机会多',
      '国际化程度高，海外交流项目丰富',
      '学术氛围自由，跨学科交流活跃',
      '转专业相对容易，选择灵活'
    ],
    cons: [
      '校园面积较小，生活空间有限',
      '上海生活成本较高',
      '部分专业竞争激烈',
      '学术要求严格，不能松懈'
    ],
    suitableFor: [
      '希望在大城市学习生活的学生',
      '追求国际化视野和多元文化体验的学生',
      '对专业选择相对灵活的学生',
      '能够平衡学习和生活的学生'
    ],
    notSuitableFor: [
      '希望安静校园环境的学生',
      '预算有限的学生',
      '需要严格管理才能保持学习状态的学生',
      '偏好传统理工科环境的学生'
    ],
    quotes: [
      {
        text: '复旦的自由度很高，你可以在这里找到属于自己的节奏。',
        source: '2022级本科生'
      },
      {
        text: '在上海读书，实习机会真的很多，很早就开始接触职场。',
        source: '2021级研究生'
      }
    ],
    disclaimer: '以上信息基于公开资料和学生反馈整理，具体政策可能因年份和专业而异。'
  },
  {
    id: 'zju',
    name: '浙江大学',
    city: '杭州',
    tierTag: '985',
    rankingBand: '前10',
    hasMorningStudy: false,
    hasEveningStudy: false,
    selfStudyHours: '建议4-6小时',
    studyPressureLevel: 'medium',
    adminStrictnessLevel: 'medium',
    freedomLevel: 'medium',
    dormCheckLevel: 'medium',
    attendanceStrictnessLevel: 'medium',
    peRequirementLevel: 'medium',
    transferMajorDifficulty: 'medium',
    recommendationRateText: '保研率约30-40%',
    studentSentimentTags: ['综合实力强', '创新创业', '务实', '生活便利'],
    summary: '浙大综合实力强劲，注重创新创业教育。学校管理制度相对平衡，既不过于严格也不过于宽松，整体氛围务实，学生生活便利。',
    pros: [
      '综合实力强，学科门类齐全',
      '创新创业氛围浓厚，实践机会多',
      '校园环境优美，生活设施完善',
      '管理制度平衡，适合大多数学生'
    ],
    cons: [
      '校区分散，通勤时间较长',
      '部分专业竞争激烈',
      '保研率相对较低',
      '杭州气候潮湿，部分学生不适应'
    ],
    suitableFor: [
      '希望全面发展的学生',
      '对创新创业感兴趣的学生',
      '适应平衡管理风格的学生',
      '喜欢江南生活环境的学生'
    ],
    notSuitableFor: [
      '偏好集中校园生活的学生',
      '对保研率要求极高的学生',
      '不适应潮湿气候的学生',
      '希望完全自由或完全严格管理的学生'
    ],
    quotes: [
      {
        text: '浙大的创业氛围很浓，很多同学在校期间就开始创业。',
        source: '2021级本科生'
      },
      {
        text: '这里的管理比较人性化，不会太严也不会太松。',
        source: '2022级研究生'
      }
    ],
    disclaimer: '以上信息基于公开资料和学生反馈整理，具体政策可能因年份和专业而异。'
  },
  {
    id: 'ustc',
    name: '中国科学技术大学',
    city: '合肥',
    tierTag: '985',
    rankingBand: '前15',
    hasMorningStudy: true,
    hasEveningStudy: true,
    selfStudyHours: '6-8小时',
    studyPressureLevel: 'high',
    adminStrictnessLevel: 'high',
    freedomLevel: 'low',
    dormCheckLevel: 'high',
    attendanceStrictnessLevel: 'high',
    peRequirementLevel: 'medium',
    transferMajorDifficulty: 'hard',
    recommendationRateText: '保研率约40-50%',
    studentSentimentTags: ['理科强校', '学风严谨', '管理严格', '学术至上'],
    summary: '中科大以严谨的学风和严格的管理著称，学术氛围浓厚。学校专注于理科教育，管理制度相对严格，学习压力较大，适合专注学术的学生。',
    pros: [
      '理科实力全国顶尖，学术水平高',
      '学风严谨，学术氛围浓厚',
      '保研率高，深造机会多',
      '同学素质高，学习氛围好'
    ],
    cons: [
      '管理严格，自由度较低',
      '学习压力大，竞争激烈',
      '文科和社科相对薄弱',
      '地理位置相对偏僻，实习机会少'
    ],
    suitableFor: [
      '对理科有强烈兴趣和天赋的学生',
      '能够适应严格管理和高压环境的学生',
      '立志从事学术研究的学生',
      '自律性强、专注学习的学霸型学生'
    ],
    notSuitableFor: [
      '希望自由发展多元兴趣的学生',
      '对文科或社科感兴趣的学生',
      '无法适应严格管理的学生',
      '希望在大城市实习就业的学生'
    ],
    quotes: [
      {
        text: '中科大的学风真的很严谨，每个人都在认真学习。',
        source: '2021级本科生'
      },
      {
        text: '管理比较严格，但这也让我们更专注于学习。',
        source: '2022级研究生'
      }
    ],
    disclaimer: '以上信息基于公开资料和学生反馈整理，具体政策可能因年份和专业而异。'
  }
];