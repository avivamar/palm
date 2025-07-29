# Palm AI 手相分析 Prompt（v3）

> **本 MD 用于直接粘贴进系统或 Notion。包含：系统提示词 / 主纹细分表格 / JSON 输出模板 / 输出规范**

---

## 0. 系统提示词


```markdown
你是一名融合中医手诊、反射区学与现代健康管理的 AI 分析师。

请遵循以下规则生成报告：
1. 用温和、专业口吻；避免“诊断”式断言，多使用“可能”“倾向”。
2. 输入为 JSON：含 abnormalZones、abnormalReflexPoints、majorLines、birthDate、birthTime、lang。
3. 输出结构：
   - **Overall Insight**（≤3 句总结）
   - **Major Lines**（生命/智慧/感情/事业）
   - **Details**（依异常区/反射点给出原因+建议）
   - **Lifestyle Tips**（≤60 字）
4. lang = en / ja 时使用对应语言，否则中文。
5. 若收到 birthDate / birthTime，请结合太阳星座或生辰八字微调性格、健康与情绪描述。
6. 在 Lifestyle Tips 末尾追加一句诱导付费钩子（见 hooks.ts），并与正文自然衔接。 lang = en / ja 时使用对应语言，否则中文。
```

---

## 1. 四大主纹细分表格（放在 Prompt 或 Docs，供 GPT 参考）

| 主纹      | 子维度     | 关键观察点               | JSON 字段                               |
| ------- | ------- | ------------------- | ------------------------------------- |
| **生命线** | 长度      | 长 / 中 / 短           | `lifeLine.length`                     |
|         | 深度      | 深 / 浅 / 断裂          | `lifeLine.depth`                      |
|         | 走向      | 贴拇指 / 外弧 / 偏直       | `lifeLine.direction`                  |
|         | 分叉 & 岛纹 | 起点/末端分叉；岛纹区段        | `lifeLine.branch`, `lifeLine.island`  |
| **智慧线** | 起点关系    | 与生命线同根 / 分离         | `headLine.rootStyle`                  |
|         | 走向      | 直 / 下弧 / 上弧         | `headLine.curve`                      |
|         | 长度 & 断点 | 全掌 / 中掌 / 短；断裂位置    | `headLine.length`, `headLine.break`   |
| **感情线** | 起点      | 食指根 / 两指间 / 中指根     | `heartLine.origin`                    |
|         | 末端      | 达食指 / 中指 / 无名指下     | `heartLine.end`                       |
|         | 弧度 & 分叉 | 平直 / 上扬 / 下弯；末端 Y 形 | `heartLine.curve`, `heartLine.branch` |
| **事业线** | 是否存在    | true / false        | `fateLine.exists`                     |
|         | 起点      | 掌根中 / 月丘 / 金星丘      | `fateLine.origin`                     |
|         | 终点      | 中指根 / 感情线处          | `fateLine.end`                        |
|         | 连贯性     | 通畅 / 断续 / 并行        | `fateLine.continuity`                 |

---

## 2. 八卦区 & 反射区字典路径

```
packages/palm-ai/data/
  ├── palm_bagua.json   # 八卦 8 区
  └── palm_reflex.json  # 反射 28 区
```

### palm\_bagua.json（含多语言字段）

````json
[
  {"area":"离区","english":"Heart Zone","japanese":"心ゾーン","organ":["心脏","小肠"],"commonMarks":["十字纹","米字纹"],"issues":["心悸","胸闷","情绪波动"]},
  {"area":"坎区","english":"Kidney Zone","japanese":"腎ゾーン","organ":["肾脏","膀胱"],"commonMarks":["米字纹","井字纹"],"issues":["水肿","腰膝乏力","夜尿多"]},
  {"area":"震区","english":"Liver/Gallbladder Zone","japanese":"肝胆ゾーン","organ":["肝","胆"],"commonMarks":["三角纹","星纹"],"issues":["情绪抑郁","脂肪代谢差"]},
  {"area":"兑区","english":"Lung/Colon Zone","japanese":"肺大腸ゾーン","organ":["肺","大肠"],"commonMarks":["圆点纹","叉纹"],"issues":["呼吸道敏感","便秘","易感冒"]},
  {"area":"乾区","english":"Large Intestine/Spleen Zone","japanese":"大腸脾ゾーン","organ":["大肠","脾"],"commonMarks":["十字纹","口字纹"],"issues":["脾胃虚弱","吸收不良"]},
  {"area":"坤区","english":"Reproductive/Urinary Zone","japanese":"生殖泌尿ゾーン","organ":["生殖系统","泌尿"],"commonMarks":["米字纹","叉纹"],"issues":["内分泌失衡","月经/前列腺问题"]},
  {"area":"巽区","english":"Spleen/Pancreas Zone","japanese":"脾膵ゾーン","organ":["脾","胰"],"commonMarks":["十字纹"],"issues":["血糖波动","脾虚乏力"]},
  {"area":"艮区","english":"Stomach/Nasopharynx Zone","japanese":"胃鼻咽ゾーン","organ":["脾胃","鼻咽"],"commonMarks":["口字纹","叉纹"],"issues":["过敏性鼻炎","消化功能弱"]}
]
```json
{
  "area": "离区",
  "english": "Heart Zone",
  "organ": ["心脏", "小肠"],
  "commonMarks": ["十字纹", "米字纹"],
  "issues": ["心悸", "胸闷", "情绪波动"]
}
````

### palm\_reflex.json（完整版 28 条）

```json
[
  {"point":"头区","english":"Head Zone","japanese":"頭ゾーン","location":"食指掌指关节下方","issues":["头痛","眩晕","注意力下降"]},
  {"point":"眼区","english":"Eye Zone","japanese":"目ゾーン","location":"中指掌指关节下方","issues":["视疲劳","干涩","视力波动"]},
  {"point":"咽喉区","english":"Throat Zone","japanese":"咽喉ゾーン","location":"无名指掌指关节下方","issues":["咽痛","扁桃体炎"]},
  {"point":"心脏区","english":"Heart Reflex","japanese":"心臓反射区","location":"中指掌根偏左","issues":["心悸","胸闷","心率不齐"]},
  {"point":"肺区","english":"Lung Reflex","japanese":"肺反射区","location":"食指掌根偏左","issues":["咳嗽","哮喘","易感冒"]},
  {"point":"胃底区","english":"Fundus Reflex","japanese":"胃底反射区","location":"大鱼际下缘","issues":["胃胀","反酸","消化慢"]},
  {"point":"幽门区","english":"Pylorus Reflex","japanese":"幽門反射区","location":"大鱼际中央","issues":["胃寒","食欲差"]},
  {"point":"肝区","english":"Liver Reflex","japanese":"肝反射区","location":"小鱼际掌根","issues":["油脂代谢差","情绪易怒"]},
  {"point":"胆囊区","english":"Gallbladder Reflex","japanese":"胆嚢反射区","location":"小鱼际中央","issues":["胆汁分泌差","胁肋胀痛"]},
  {"point":"胰腺区","english":"Pancreas Reflex","japanese":"膵臓反射区","location":"拇指下内侧","issues":["血糖波动","甜食偏好"]},
  {"point":"脾区","english":"Spleen Reflex","japanese":"脾反射区","location":"拇指掌根外侧","issues":["免疫力低","湿气重"]},
  {"point":"十二指肠区","english":"Duodenum Reflex","japanese":"十二指腸区","location":"掌心中下部靠大鱼际","issues":["腹胀","消化不良"]},
  {"point":"小肠区","english":"Small Intestine Reflex","japanese":"小腸区","location":"掌心中央偏右","issues":["吸收不良","腹泻"]},
  {"point":"大肠区","english":"Large Intestine Reflex","japanese":"大腸区","location":"掌心中央偏左","issues":["便秘","胀气"]},
  {"point":"盲肠区","english":"Cecum Reflex","japanese":"盲腸区","location":"掌心右下","issues":["阑尾炎风险","右下腹胀痛"]},
  {"point":"直肠区","english":"Rectum Reflex","japanese":"直腸区","location":"掌心左下","issues":["痔疮","排便困难"]},
  {"point":"肾区","english":"Kidney Reflex","japanese":"腎反射区","location":"掌根中央","issues":["腰酸","水肿","疲惫"]},
  {"point":"肾上腺区","english":"Adrenal Reflex","japanese":"副腎区","location":"肾区上方","issues":["易紧张","激素失衡"]},
  {"point":"膀胱区","english":"Bladder Reflex","japanese":"膀胱区","location":"掌根中央偏下","issues":["频尿","排尿不畅"]},
  {"point":"生殖区","english":"Reproductive Reflex","japanese":"生殖区","location":"掌根小鱼际下","issues":["内分泌失调","性功能低下"]},
  {"point":"腰椎区","english":"Lumbar Spine Reflex","japanese":"腰椎区","location":"掌缘小鱼际外侧","issues":["腰痛","坐骨神经痛"]},
  {"point":"胸椎区","english":"Thoracic Spine Reflex","japanese":"胸椎区","location":"掌缘中部","issues":["背痛","呼吸浅"]},
  {"point":"颈椎区","english":"Cervical Spine Reflex","japanese":"頸椎区","location":"掌缘拇指下","issues":["颈椎僵硬","头晕"]},
  {"point":"肩区","english":"Shoulder Reflex","japanese":"肩区","location":"无名指掌骨外侧","issues":["肩酸","活动受限"]},
  {"point":"膈肌区","english":"Diaphragm Reflex","japanese":"横隔膜区","location":"掌心横向中线","issues":["呼吸浅","紧张感"]},
  {"point":"甲状腺区","english":"Thyroid Reflex","japanese":"甲状腺区","location":"拇指掌节纹上方","issues":["怕冷","易胖","情绪波动"]},
  {"point":"脾门区","english":"Cardia Reflex","japanese":"噴門区","location":"大鱼际根部上方","issues":["胃食管反流","吞咽不适"]},
  {"point":"三焦区","english":"Triple Burner","japanese":"三焦区","location":"掌心正中垂线","issues":["循环差","代谢慢"]}
]
```

````



### TypeScript 类型声明
```ts
export interface BaguaZone {
  area: string;
  english: string;
  japanese: string;
  organ: string[];
  commonMarks: string[];
  issues: string[];
}

export interface ReflexPoint {
  point: string;
  english: string;
  japanese: string;
  location: string;
  issues: string[];
}

export interface MajorLineDetail {
  length?: string;
  depth?: string;
  direction?: string;
  branch?: string;
  island?: string;
  rootStyle?: string;
  curve?: string;
  end?: string;
  exists?: boolean;
  origin?: string;
  continuity?: string;
  interpretation?: string;
}

export interface PalmAnalysisInput {
  birthDate?: string;  // "1995-07-28"
  birthTime?: string;  // "14:30"
  abnormalZones?: { area: string; mark?: string }[];
  abnormalReflexPoints?: { point: string; feature?: string }[];
  majorLines?: {
    lifeLine?: MajorLineDetail;
    headLine?: MajorLineDetail;
    heartLine?: MajorLineDetail;
    fateLine?: MajorLineDetail;
  };
  lang?: "zh" | "en" | "ja";
}[];
  abnormalReflexPoints?: { point: string; feature?: string }[];
  majorLines?: {
    lifeLine?: MajorLineDetail;
    headLine?: MajorLineDetail;
    heartLine?: MajorLineDetail;
    fateLine?: MajorLineDetail;
  };
  lang?: "zh" | "en" | "ja";
}
````

## hooks.ts — 多语言钩子句随机库

```ts
export const hooks = {
  zh: [
    "完整版将详细解锁你未来 90 天的情感与事业关键节点。",
    "升级后可查看 3 个月内的幸运窗口与风险预警。",
    "完整版含专属能量建议，帮助你抓住下一次转机。"
  ],
  en: [
    "Upgrade now to reveal your next 3‑month breakthrough window.",
    "Full report unlocks your personal opportunity and risk calendar.",
    "See your 90‑day roadmap and tailored energy tips in the full version." 
  ],
  ja: [
    "完全版で、次の90日間の転機とチャンスを詳細に確認しましょう。",
    "アップグレードすると、3か月先までの運勢カレンダーが解放されます。",
    "完全版には、あなた専用のエネルギーアドバイスも含まれています。"
  ]
};

export function pickHook(lang: "zh" | "en" | "ja" = "zh") {
  const arr = hooks[lang] || hooks.zh;
  return arr[Math.floor(Math.random() * arr.length)];
}
```

> **用法**：在生成 Lifestyle Tips 后端代码中 `tips + " " + pickHook(lang)` 完成拼接。
