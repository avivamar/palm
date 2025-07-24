#!/usr/bin/env node

/**
 * Klaviyo Segment 自动创建脚本
 *
 * 使用方法:
 * 1. 设置环境变量 KLAVIYO_PRIVATE_API_KEY
 * 2. 运行: node scripts/create-klaviyo-segments.js
 *
 * 或者直接传入 API Key:
 * node scripts/create-klaviyo-segments.js --api-key=your-private-api-key
 */

const https = require('node:https');
const { URL } = require('node:url');

// 从命令行参数或环境变量获取 API Key
function getApiKey() {
  const args = process.argv.slice(2);
  const apiKeyArg = args.find(arg => arg.startsWith('--api-key='));

  if (apiKeyArg) {
    return apiKeyArg.split('=')[1];
  }

  return process.env.KLAVIYO_PRIVATE_API_KEY;
}

// Klaviyo API 请求函数
function makeKlaviyoRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const apiKey = getApiKey();

    if (!apiKey) {
      reject(new Error('Klaviyo API Key not found. Set KLAVIYO_PRIVATE_API_KEY environment variable or use --api-key argument.'));
      return;
    }

    const url = new URL(`https://a.klaviyo.com${path}`);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method,
      headers: {
        'Authorization': `Klaviyo-API-Key ${apiKey}`,
        'Content-Type': 'application/json',
        'revision': '2024-02-15',
      },
    };

    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject(new Error(`Klaviyo API Error (${res.statusCode}): ${JSON.stringify(parsedData)}`));
          }
        } catch (error) {
          reject(new Error(`Failed to parse response: ${responseData}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Segment 定义
const segments = [
  {
    name: 'Rolitt 预售客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt 预售客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Started',
                },
                {
                  field: 'datetime',
                  operator: 'in-the-last',
                  value: 90,
                  unit: 'days',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt 成功预售客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt 成功预售客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
                {
                  field: 'datetime',
                  operator: 'in-the-last',
                  value: 365,
                  unit: 'days',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt Khaki 偏好客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt Khaki 偏好客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
                {
                  field: 'properties.color',
                  operator: 'equals',
                  value: 'khaki',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt Black 偏好客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt Black 偏好客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
                {
                  field: 'properties.color',
                  operator: 'equals',
                  value: 'black',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt 香港客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt 香港客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
                {
                  field: 'properties.locale',
                  operator: 'equals',
                  value: 'zh-HK',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt 大陆客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt 大陆客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
                {
                  field: 'properties.locale',
                  operator: 'equals',
                  value: 'zh-CN',
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt 高价值客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt 高价值客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
                {
                  field: 'properties.amount',
                  operator: 'greater-than',
                  value: 150,
                },
              ],
            },
          ],
        },
      },
    },
  },
  {
    name: 'Rolitt 未完成预售客户',
    definition: {
      type: 'segment',
      attributes: {
        name: 'Rolitt 未完成预售客户',
        definition: {
          condition_groups: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Started',
                },
                {
                  field: 'datetime',
                  operator: 'in-the-last',
                  value: 7,
                  unit: 'days',
                },
              ],
            },
          ],
          exclusions: [
            {
              conditions: [
                {
                  field: 'event',
                  operator: 'equals',
                  value: 'Rolitt Preorder Success',
                },
              ],
            },
          ],
        },
      },
    },
  },
];

// 创建单个 Segment
async function createSegment(segmentData) {
  try {
    console.log(`Creating segment: ${segmentData.name}...`);

    const response = await makeKlaviyoRequest('POST', '/api/segments/', {
      data: segmentData.definition,
    });

    console.log(`✅ Successfully created segment: ${segmentData.name}`);
    console.log(`   Segment ID: ${response.data.id}`);

    return response;
  } catch (error) {
    console.error(`❌ Failed to create segment: ${segmentData.name}`);
    console.error(`   Error: ${error.message}`);
    return null;
  }
}

// 检查 Segment 是否已存在
async function checkExistingSegments() {
  try {
    console.log('Checking existing segments...');

    const response = await makeKlaviyoRequest('GET', '/api/segments/');
    const existingSegments = response.data.map(segment => segment.attributes.name);

    console.log(`Found ${existingSegments.length} existing segments`);
    return existingSegments;
  } catch (error) {
    console.error('Failed to fetch existing segments:', error.message);
    return [];
  }
}

// 主函数
async function main() {
  console.log('🚀 Starting Klaviyo Segment creation process...');
  console.log('');

  // 检查 API Key
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error('❌ Klaviyo API Key not found.');
    console.error('   Please set KLAVIYO_PRIVATE_API_KEY environment variable or use --api-key argument.');
    process.exit(1);
  }

  if (apiKey.startsWith('pk_')) {
    console.error('❌ Invalid API Key format.');
    console.error('   Please use a private API key (starts with "pk_test_" or "pk_live_"), not a public key.');
    process.exit(1);
  }

  console.log('✅ API Key found and validated');
  console.log('');

  // 检查现有 Segments
  const existingSegments = await checkExistingSegments();
  console.log('');

  // 创建 Segments
  const results = {
    created: 0,
    skipped: 0,
    failed: 0,
  };

  for (const segment of segments) {
    if (existingSegments.includes(segment.name)) {
      console.log(`⏭️  Skipping existing segment: ${segment.name}`);
      results.skipped++;
    } else {
      const result = await createSegment(segment);
      if (result) {
        results.created++;
      } else {
        results.failed++;
      }
    }

    // 添加延迟以避免 API 限制
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('');
  console.log('📊 Summary:');
  console.log(`   ✅ Created: ${results.created}`);
  console.log(`   ⏭️  Skipped: ${results.skipped}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log('');

  if (results.failed > 0) {
    console.log('⚠️  Some segments failed to create. Please check the errors above.');
    process.exit(1);
  } else {
    console.log('🎉 All segments processed successfully!');
  }
}

// 错误处理
process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

// 运行脚本
if (require.main === module) {
  main().catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  createSegment,
  checkExistingSegments,
  segments,
};
