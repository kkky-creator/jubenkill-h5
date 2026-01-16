// @ts-ignore
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { Script, Character } from '../types';

// 生成唯一ID
const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 生成模拟剧本数据
export const generateMockScript = (): Script => {
  // 创建角色，先保存角色ID以便后续引用
  const characters: Character[] = [
    {
      id: generateId(),
      name: '庄园主',
      description: '庄园的主人，富有的商人，被发现死于书房。',
      background: '白手起家的商人，性格孤僻，与家人关系紧张。',
      secrets: ['隐藏着一个巨大的财富秘密。'],
      relationships: {
        '管家': '雇佣关系',
        '庄园主妻子': '夫妻关系',
        '私人医生': '医患关系',
        '庄园主儿子': '父子关系'
      }
    },
    {
      id: generateId(),
      name: '管家',
      description: '在庄园工作多年的老管家，对庄园情况了如指掌。',
      background: '从小就开始在庄园工作，忠诚可靠。',
      secrets: ['知道庄园主的所有秘密。'],
      relationships: {
        '庄园主': '雇佣关系',
        '庄园主妻子': '主仆关系',
        '私人医生': '认识',
        '庄园主儿子': '主仆关系'
      }
    },
    {
      id: generateId(),
      name: '庄园主妻子',
      description: '庄园主的年轻妻子，美丽动人。',
      background: '出身贫寒，与庄园主结婚不久。',
      secrets: ['与庄园主的私人医生有染。'],
      relationships: {
        '庄园主': '夫妻关系',
        '管家': '主仆关系',
        '私人医生': '恋人关系',
        '庄园主儿子': '继母子关系'
      }
    },
    {
      id: generateId(),
      name: '私人医生',
      description: '庄园主的私人医生，经常出入庄园。',
      background: '年轻有为的医生，与庄园主妻子关系密切。',
      secrets: ['正在研发一种新药物。'],
      relationships: {
        '庄园主': '医患关系',
        '管家': '认识',
        '庄园主妻子': '恋人关系',
        '庄园主儿子': '认识'
      }
    },
    {
      id: generateId(),
      name: '庄园主儿子',
      description: '庄园主的儿子，对父亲的财产虎视眈眈。',
      background: '挥霍无度，欠了很多外债。',
      secrets: ['正在策划一个大计划。'],
      relationships: {
        '庄园主': '父子关系',
        '管家': '主仆关系',
        '庄园主妻子': '继母子关系',
        '私人医生': '认识'
      }
    }
  ];

  // 创建线索
  const clues = [
    {
      id: generateId(),
      name: '破碎的酒杯',
      description: '大厅角落有一个破碎的酒杯，上面有红色的液体。',
      location: '庄园大厅',
      relatedCharacter: characters[2].id, // 庄园主妻子
      isFound: false
    },
    {
      id: generateId(),
      name: '掉落的纽扣',
      description: '大厅地板上有一颗金色的纽扣。',
      location: '庄园大厅',
      relatedCharacter: characters[3].id, // 私人医生
      isFound: false
    },
    {
      id: generateId(),
      name: '血迹',
      description: '书房地毯上有大量血迹。',
      location: '书房',
      relatedCharacter: characters[0].id, // 庄园主
      isFound: false
    },
    {
      id: generateId(),
      name: '手枪',
      description: '书桌抽屉里有一把上膛的手枪。',
      location: '书房',
      relatedCharacter: characters[0].id, // 庄园主
      isFound: false
    },
    {
      id: generateId(),
      name: '遗嘱',
      description: '书桌上有一份刚修改过的遗嘱。',
      location: '书房',
      relatedCharacter: characters[0].id, // 庄园主
      isFound: false
    },
    {
      id: generateId(),
      name: '脚印',
      description: '花园泥土中有清晰的脚印。',
      location: '花园',
      relatedCharacter: characters[2].id, // 庄园主妻子
      isFound: false
    },
    {
      id: generateId(),
      name: '药瓶',
      description: '厨房垃圾桶里有一个空药瓶。',
      location: '厨房',
      relatedCharacter: characters[3].id, // 私人医生
      isFound: false
    }
  ];

  // 创建场景
  const scenes = [
    {
      id: generateId(),
      name: '庄园大厅',
      description: '豪华的庄园大厅，摆放着古老的家具和艺术品。',
      location: '庄园大厅',
      time: '晚上8点',
      clues: [clues[0].id, clues[1].id] // 破碎的酒杯，掉落的纽扣
    },
    {
      id: generateId(),
      name: '书房',
      description: '庄园主的私人书房，发生谋杀案的地点。',
      location: '书房',
      time: '晚上10点',
      clues: [clues[2].id, clues[3].id, clues[4].id] // 血迹，手枪，遗嘱
    },
    {
      id: generateId(),
      name: '花园',
      description: '美丽的花园，种植着各种名贵的花卉。',
      location: '花园',
      time: '晚上9点',
      clues: [clues[5].id] // 脚印
    },
    {
      id: generateId(),
      name: '厨房',
      description: '忙碌的厨房，准备着晚餐。',
      location: '厨房',
      time: '晚上7点',
      clues: [clues[6].id] // 药瓶
    }
  ];

  // 创建时间线
  const timeline = [
    {
      id: generateId(),
      time: '晚上7点',
      description: '晚餐开始',
      relatedCharacters: characters.map(c => c.id) // 所有角色
    },
    {
      id: generateId(),
      time: '晚上8点30分',
      description: '庄园主回书房工作',
      relatedCharacters: [characters[0].id] // 庄园主
    },
    {
      id: generateId(),
      time: '晚上9点',
      description: '妻子去花园散步',
      relatedCharacters: [characters[2].id] // 庄园主妻子
    },
    {
      id: generateId(),
      time: '晚上10点',
      description: '传来枪声',
      relatedCharacters: []
    },
    {
      id: generateId(),
      time: '晚上10点05分',
      description: '众人发现庄园主死亡',
      relatedCharacters: characters.map(c => c.id).filter(id => id !== characters[0].id) // 除了庄园主的所有角色
    }
  ];

  // 构建完整剧本
  const script: Script = {
    id: generateId(),
    title: '神秘庄园谋杀案',
    description: '这是一个发生在神秘庄园的谋杀案剧本，玩家需要找出真凶。',
    characters,
    scenes,
    clues,
    timeline
  };
  
  return script;
};

// 解析TXT格式剧本
export const parseTxtScript = (_content: string): Script => {
  // 返回模拟剧本数据
  return generateMockScript();
};

// 解析CSV格式剧本
export const parseCsvScript = (_content: string): Script => {
  Papa.parse(_content, { header: true });
  // 返回模拟剧本数据
  return generateMockScript();
};

// 解析Excel格式剧本
export const parseExcelScript = (file: File): Promise<Script> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        XLSX.read(data, { type: 'array' });
        
        // 返回模拟剧本数据
        resolve(generateMockScript());
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// 解析PDF格式剧本
export const parsePdfScript = (_file: File): Promise<Script> => {
  return new Promise((resolve) => {
    // 模拟PDF解析延迟
    setTimeout(() => {
      // 返回模拟剧本数据
      resolve(generateMockScript());
    }, 1000);
  });
};

// 根据文件类型解析剧本
export const parseScriptByFileType = (file: File): Promise<Script> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    reader.onload = async (e) => {
      try {
        let script: Script;
        const content = e.target?.result as string;
        
        switch (fileExtension) {
          case 'txt':
            script = parseTxtScript(content);
            resolve(script);
            break;
          
          case 'csv':
            script = parseCsvScript(content);
            resolve(script);
            break;
          
          case 'xlsx':
          case 'xls':
            script = await parseExcelScript(file);
            resolve(script);
            break;
          
          case 'pdf':
            script = await parsePdfScript(file);
            resolve(script);
            break;
          
          default:
            reject(new Error(`不支持的文件格式: ${fileExtension}`));
        }
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => {
    reject(error);
  };
  
  // 对于文本类型的文件，使用readAsText
  // 对于二进制文件，如Excel和PDF，直接调用相应的解析函数
  if (fileExtension === 'txt' || fileExtension === 'csv') {
    reader.readAsText(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    parseExcelScript(file).then(resolve).catch(reject);
  } else if (fileExtension === 'pdf') {
    parsePdfScript(file).then(resolve).catch(reject);
  } else {
    reject(new Error(`不支持的文件格式: ${fileExtension}`));
  }
  });
};