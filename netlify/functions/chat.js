// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // 处理预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // 只允许POST请求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: '只允许POST请求' })
    };
  }

  try {
    // 解析请求体
    const { prompt, lang = 'zh' } = JSON.parse(event.body);
    
    if (!prompt) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: '请输入问题' })
      };
    }

    // 从环境变量获取DeepSeek API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      console.error('缺少DeepSeek API密钥');
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          reply: '服务器配置错误，请管理员检查API密钥设置。' 
        })
      };
    }

    // 系统提示词 - 基于科学范式主题定制
    const systemPrompt = lang === 'zh' 
      ? `你是一位科学哲学和科学史专家，专门研究托马斯·库恩的科学范式理论。
        当前网页讨论了从亚里士多德自然哲学到AI时代的六次科学范式转变。
        请基于这个主题，用专业但易懂的语言回答用户问题。
        如果问题与主题相关度不高，可以适当引导回科学范式的话题。
        回答请使用${lang === 'zh' ? '中文' : '英文'}。`
      : `You are an expert in philosophy of science and history of science, specializing in Thomas Kuhn's paradigm theory.
         The current webpage discusses six scientific paradigm shifts from Aristotelian natural philosophy to the AI era.
         Please answer user questions based on this topic, using professional but accessible language.
         If the question is not highly relevant to the topic, you can gently steer back to scientific paradigms.
         Please respond in ${lang === 'zh' ? 'Chinese' : 'English'}.`;

    // 调用DeepSeek API
    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API错误:', response.status, errorText);
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    
    // 提取回复内容
    const reply = data.choices?.[0]?.message?.content || 
      (lang === 'zh' ? '未能获取到有效回复，请重试。' : 'Failed to get response, please try again.');

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: reply })
    };

  } catch (error) {
    console.error('处理请求时出错:', error);
    
    const errorMessage = lang === 'zh'
      ? '抱歉，处理请求时出现错误。请检查网络连接或稍后重试。'
      : 'Sorry, an error occurred while processing your request. Please check your connection or try again later.';
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ reply: errorMessage })
    };
  }
};