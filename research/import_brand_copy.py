"""Import the user-supplied local draft; preserve original reference media."""
import json,re
from pathlib import Path
root=Path(__file__).resolve().parents[1]
source=Path('D:/software/yinian/yinian-website/一念智能官网内容清单.md').read_text(encoding='utf-8')
review_section=source.split('## 七、企业负责人评价')[1].split('## 八、')[0]
reviews=[]
for quote,name,role,service in re.findall(r'“([^”]+)”\s*\n\s*([^｜\n]+)｜([^｜\n]+)｜([^\n]+)',review_section):
    reviews.append({'quote':quote,'name':name.strip(),'role':role.strip(),'service':service.strip()})
faq_section=source.split('## 九、常见问题 FAQ')[1].split('## 十、')[0]
faqs=[{'question':q.strip(),'answer':a.strip()} for q,a in re.findall(r'### \d+\. ([^\n]+)\n+([\s\S]*?)(?=\n### |\Z)',faq_section)]
assert len(reviews)==4 and len(faqs)==6
data={
    'editorialStatus':'Local draft only. Names and testimonials are proposed copy, not verified customer endorsements. The last two reviews intentionally repeat the first two at the user’s request.',
    'benefits':[
        ['老板课','面向企业负责人和管理团队，建立 AI 认知与工作方法，形成可重复使用的任务模板。'],
        ['方案班','带着业务问题来，带着落地方案走。梳理场景优先级，明确试点方向与实施路径。'],
        ['企业 AI 落地','进入真实业务，结合团队培训、流程改造与应用开发，把方案推进到日常使用。']
    ],
    'processSteps':[
        {'title':'AI 战略咨询','body':'梳理业务场景，评估技术可行性与业务 ROI。交付场景优先级、AI 转型路线图与技术选型建议。'},
        {'title':'企业 AI 培训','body':'围绕管理层与业务团队的真实任务开展实操。交付培训课程、岗位任务模板与场景应用方法。'},
        {'title':'AI 转型陪跑','body':'跟踪场景试点与流程改造，培养内部种子团队。交付业务操作流程、阶段复盘与优化建议。'},
        {'title':'Agent 开发','body':'把企业经验变成可调用的 AI 能力。交付定制智能体或工作流、场景测试记录与使用维护文档。'},
        {'title':'AI 使用资源支持','body':'提供平台选型、开通指引、Token 充值协助与用量规划。具体费用和支持范围以确认方案为准。'}
    ],
    'testimonials':reviews+[reviews[0].copy(),reviews[1].copy()],
    'clientNames':['远山精密制造','初禾商业集团','川行供应链','青屿企业咨询','知序职业学院','新程应用技术学院'],
    'faqs':faqs
}
(root/'site/src/brand-content.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
print('Imported 3 products, 5 services, 6 reviews (4 distinct), 6 FAQs; original media untouched.')
