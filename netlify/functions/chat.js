// netlify/functions/chat.js
const fetch = require('node-fetch');

// 模拟回复数据（当没有API密钥时使用）
const SIMULATED_RESPONSES = {
  zh: {
    kuhn: [
      "托马斯·库恩在《科学革命的结构》中指出，科学进步不是知识的线性积累，而是通过'范式转换'实现的革命性变革。范式是科学共同体共享的基本理论框架、研究方法和价值标准。",
      "库恩区分了'常规科学'和'科学革命'：常规科学是在现有范式内解决难题（puzzle-solving），而科学革命发生在异常积累到无法被现有范式解释时，导致新旧范式的转换。",
      "科学革命具有'不可通约性'特征：新旧范式的支持者可能使用相同的术语，但赋予完全不同的意义，他们'生活在不同的世界中'。",
      "从亚里士多德的自然哲学到牛顿力学，再到爱因斯坦相对论，每次范式革命都彻底改变了科学家看待世界的方式和科学研究的基本问题。"
    ],
    ai: [
      "AI正在引发第六次科学范式转变，其特征是：数据驱动取代理论先导、预测能力优先于因果解释、机器学习模型可以自动发现复杂模式而不需要预设理论框架。",
      "在AI范式中，传统的'假设-检验'科学方法受到挑战。深度神经网络可以处理高维非线性关系，但往往缺乏可解释性，这引发了新的认识论问题：什么是科学的解释？",
      "大数据和机器学习正在重塑科学方法论：1) 相关关系可能先于因果关系被发现；2) 预测准确性成为重要评价标准；3) 计算实验成为新的科学实践方式。",
      "AI范式的认识论挑战包括：黑箱模型的可解释性问题、数据偏差导致的科学偏差、算法决策的透明性和可重复性。这些挑战正在推动科学哲学的新发展。"
    ],
    revolution: [
      "科学革命的四个阶段：1) 常规科学时期（范式稳定）；2) 异常积累（发现无法解释的现象）；3) 危机时期（范式动摇）；4) 科学革命（新范式确立）。",
      "范式转换不是理性的线性过程，而是包含了社会学和心理学的因素。科学家对旧范式的忠诚、科学共同体的社会结构都影响革命的发生和接受。",
      "科学革命的成功不仅取决于新范式的解释力，还取决于它能否吸引年轻科学家、能否解决旧范式无法解决的'关键问题'、以及能否提供新的研究工具和方法。",
      "库恩指出，在科学革命中，没有中立的观察语言。观察总是'理论负载'的，科学家在不同的范式中会'看到'不同的东西。"
    ],
    general: [
      "科学范式是科学共同体共享的'世界观'，它决定了：什么问题是值得研究的、什么方法是合适的、什么样的证据是有说服力的、什么解释是可接受的。",
      "范式的功能包括：1) 界定研究领域和问题；2) 提供解决问题的标准方法；3) 设立成功的标准；4) 训练新一代科学家。没有范式，就没有常规科学。",
      "不同科学领域可能处于不同的发展阶段：前范式时期（多种竞争理论）→ 范式确立（常规科学）→ 异常积累 → 危机 → 新范式革命。",
      "当前的AI发展不仅是一场技术革命，更是一场科学认识论的革命。它正在重新定义'理解'、'解释'和'知识'在科学中的含义。"
    ]
  },
  en: {
    kuhn: [
      "Thomas Kuhn argued in 'The Structure of Scientific Revolutions' that scientific progress occurs through revolutionary 'paradigm shifts' rather than linear accumulation of knowledge. A paradigm is the framework of theories, methods, and standards shared by a scientific community.",
      "Kuhn distinguished between 'normal science' (puzzle-solving within an established paradigm) and 'scientific revolutions' (when anomalies accumulate and lead to a shift to a new paradigm).",
      "Scientific revolutions involve 'incommensurability': proponents of different paradigms may use the same terms but mean completely different things; they effectively 'live in different worlds.'",
      "From Aristotelian natural philosophy to Newtonian mechanics to Einsteinian relativity, each paradigm revolution fundamentally changed how scientists view the world and what questions they consider scientifically important."
    ],
    ai: [
      "AI is triggering the sixth major scientific paradigm shift, characterized by: data-driven approaches replacing theory-first methods, predictive power prioritized over causal explanation, and machine learning models discovering complex patterns without pre-specified theoretical frameworks.",
      "In the AI paradigm, the traditional 'hypothesis-testing' scientific method is being challenged. Deep neural networks can handle high-dimensional nonlinear relationships but often lack interpretability, raising new epistemological questions: What counts as a scientific explanation?",
      "Big data and machine learning are reshaping scientific methodology: 1) Correlations may be discovered before causal mechanisms; 2) Predictive accuracy becomes a key evaluation criterion; 3) Computational experiments become a new form of scientific practice.",
      "Epistemological challenges of the AI paradigm include: interpretability of black-box models, scientific bias arising from data bias, and transparency/reproducibility of algorithmic decisions. These challenges are driving new developments in philosophy of science."
    ],
    revolution: [
      "The four stages of scientific revolution: 1) Normal science (stable paradigm); 2) Accumulation of anomalies (unexplainable phenomena); 3) Crisis (paradigm动摇); 4) Scientific revolution (new paradigm established).",
      "Paradigm shifts are not purely rational, linear processes; they involve sociological and psychological factors. Scientists' loyalty to old paradigms and the social structure of scientific communities influence how revolutions occur and are accepted.",
      "The success of a scientific revolution depends not only on the explanatory power of the new paradigm, but also on its ability to attract young scientists, solve 'key problems' that the old paradigm couldn't, and provide new research tools and methods.",
      "Kuhn noted that in scientific revolutions, there is no neutral observation language. Observations are always 'theory-laden'—scientists working within different paradigms literally 'see' different things."
    ],
    general: [
      "A scientific paradigm is the 'worldview' shared by a scientific community. It determines: what problems are worth studying, what methods are appropriate, what evidence is convincing, and what explanations are acceptable.",
      "Functions of a paradigm include: 1) Defining the research domain and problems; 2) Providing standard methods for solving problems; 3) Setting criteria for success; 4) Training new generations of scientists. Without a paradigm, there is no normal science.",
      "Different scientific fields may be at different developmental stages: pre-paradigm (multiple competing theories) → paradigm established (normal science) → anomaly accumulation → crisis → new paradigm revolution.",
      "Current AI developments represent not just a technological revolution but a revolution in scientific epistemology. They are redefining what 'understanding', 'explanation', and 'knowledge' mean in science."
    ]
  }
};

exports.handler = async function(event, context) {
  // 记录请求信息
  console.log('=== AI Chat Function Called ===');
  console.log('Request method:', event.httpMethod);
  console.log('Request path:', event.path);
  console.log('Request headers:', JSON.stringify(event.headers, null, 2));
  
  // 处理预检请求 (CORS)
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS (preflight) request');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Max-Age': '86400'
      },
      body: ''
    };
  }
  
  // 只接受POST请求
  if (event.httpMethod !== 'POST') {
    console.log('Method not allowed. Received:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Method Not Allowed',
        message: 'Only POST requests are accepted',
        received: event.httpMethod,
        allowed: ['POST']
      })
    };
  }
  
  try {
    // 解析请求体
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
      console.log('Parsed request body:', JSON.stringify(requestBody, null, 2));
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError.message);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Invalid JSON',
          message: 'The request body contains invalid JSON',
          details: parseError.message
        })
      };
    }
    
    const { prompt, lang = 'zh', context } = requestBody;
    
    // 验证必填字段
    if (!prompt || typeof prompt !== 'string') {
      console.log('Missing or invalid prompt:', prompt);
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Missing Required Field',
          message: 'The "prompt" field is required and must be a string',
          field: 'prompt',
          received: prompt
        })
      };
    }
    
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
      console.log('Empty prompt received');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: 'Empty Prompt',
          message: 'The prompt cannot be empty',
          field: 'prompt'
        })
      };
    }
    
    // 验证语言
    const validLang = ['zh', 'en'].includes(lang) ? lang : 'zh';
    
    console.log('Processing request:', {
      prompt: trimmedPrompt.substring(0, 100) + (trimmedPrompt.length > 100 ? '...' : ''),
      lang: validLang,
      context: context || 'none',
      length: trimmedPrompt.length
    });
    
    // 获取API密钥
    const apiKey = process.env.DEEPSEEK_API_KEY;
    console.log('DeepSeek API Key available:', !!apiKey);
    
    let reply;
    let source;
    
    // 如果没有API密钥，使用模拟回复
    if (!apiKey) {
      console.log('Using simulated response (no API key configured)');
      reply = generateSimulatedResponse(trimmedPrompt, validLang);
      source = 'simulated';
    } else {
      // 使用真实的DeepSeek API
      console.log('Attempting to call DeepSeek API...');
      try {
        reply = await callDeepSeekAPI(apiKey, trimmedPrompt, validLang);
        source = 'deepseek';
        console.log('Successfully received response from DeepSeek API');
      } catch (apiError) {
        console.error('DeepSeek API call failed:', apiError.message);
        // API调用失败时，回退到模拟回复
        reply = generateSimulatedResponse(trimmedPrompt, validLang) + 
          (validLang === 'zh' 
            ? '\n\n（注：DeepSeek API暂时不可用，当前为模拟回复）'
            : '\n\n(Note: DeepSeek API is temporarily unavailable, showing simulated response)');
        source = 'simulated_fallback';
      }
    }
    
    // 构建成功响应
    const response = {
      reply: reply,
      metadata: {
        source: source,
        lang: validLang,
        prompt_length: trimmedPrompt.length,
        response_length: reply.length,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log('Sending response:', {
      source: source,
      response_length: reply.length,
      preview: reply.substring(0, 100) + (reply.length > 100 ? '...' : '')
    });
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      body: JSON.stringify(response, null, 2)
    };
    
  } catch (error) {
    // 处理未预期的错误
    console.error('Unhandled error in chat function:', error);
    console.error('Error stack:', error.stack);
    
    const errorMessage = validLang === 'zh' 
      ? '抱歉，服务器在处理您的请求时遇到了意外错误。这可能是暂时的技术问题。请您：\n1. 稍后重试\n2. 确保问题与科学范式、库恩理论或AI认识论相关\n3. 如果问题持续，请联系网站管理员\n\n错误参考：' + error.message.substring(0, 100)
      : 'Sorry, an unexpected error occurred while processing your request. This may be a temporary technical issue. Please:\n1. Try again later\n2. Ensure your question relates to scientific paradigms, Kuhn\'s theory, or AI epistemology\n3. If the problem persists, contact the site administrator\n\nError reference: ' + error.message.substring(0, 100);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        reply: errorMessage,
        error: 'internal_server_error',
        timestamp: new Date().toISOString()
      }, null, 2)
    };
  }
};

// 调用DeepSeek API的函数
async function callDeepSeekAPI(apiKey, prompt, lang) {
  // 基于主题的系统提示
  const systemPrompt = lang === 'zh' 
    ? `你是一位科学哲学和科学史专家，专门研究托马斯·库恩的科学范式理论。当前对话发生在"科学范式转变：从自然哲学到AI时代"的教育网站上。

网站内容涵盖：
1. 库恩的范式理论：科学革命的结构、常规科学vs科学革命、不可通约性
2. 六次重大范式转变：亚里士多德自然哲学 → 经典科学革命 → 化学与生命科学 → 现代物理学 → 计算科学 → AI与数据驱动科学
3. AI时代的认识论变革：预测优先于解释、数据驱动研究、机器学习改变科学方法

请基于以上背景知识，用专业但易懂的语言回答用户问题。如果问题与主题相关度不高，可以适当引导回科学范式的话题，但首先要直接回答问题。

请使用中文回复，保持学术严谨性，同时确保非专业人士也能理解。`
    : `You are an expert in philosophy of science and history of science, specializing in Thomas Kuhn's theory of scientific paradigms. The current conversation takes place on the educational website "Scientific Paradigm Shifts: From Natural Philosophy to the AI Era."

Website content covers:
1. Kuhn's paradigm theory: Structure of Scientific Revolutions, normal science vs. scientific revolutions, incommensurability
2. Six major paradigm shifts: Aristotelian natural philosophy → Classical scientific revolution → Chemistry & life sciences → Modern physics → Computational science → AI & data-driven science
3. Epistemological changes in the AI era: Prediction over explanation, data-driven research, machine learning transforming scientific methods

Based on this background knowledge, please answer user questions in professional but accessible language. If a question is not highly relevant to the topic, you can gently steer back to scientific paradigms, but first address the question directly.

Please respond in English, maintaining academic rigor while ensuring accessibility to non-specialists.`;

  const requestBody = {
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
    max_tokens: 2000,
    temperature: 0.7,
    top_p: 0.9,
    frequency_penalty: 0.1,
    presence_penalty: 0.1,
    stream: false
  };

  console.log('Making DeepSeek API request with:', {
    model: requestBody.model,
    prompt_length: prompt.length,
    max_tokens: requestBody.max_tokens
  });

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody),
    timeout: 30000 // 30秒超时
  });

  console.log('DeepSeek API response status:', response.status);
  
  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (e) {
      errorText = 'Could not read error response';
    }
    
    console.error('DeepSeek API error details:', {
      status: response.status,
      statusText: response.statusText,
      errorText: errorText.substring(0, 500)
    });
    
    throw new Error(`DeepSeek API returned ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  console.log('DeepSeek API response received successfully');
  
  if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
    console.error('Invalid DeepSeek API response structure:', JSON.stringify(data, null, 2));
    throw new Error('Invalid response structure from DeepSeek API');
  }

  const reply = data.choices[0].message.content.trim();
  
  // 记录一些元数据（不包含完整回复以保护隐私）
  console.log('DeepSeek API reply metadata:', {
    length: reply.length,
    finish_reason: data.choices[0].finish_reason,
    usage: data.usage || 'not provided'
  });

  return reply;
}

// 生成模拟回复的函数
function generateSimulatedResponse(prompt, lang) {
  const question = prompt.toLowerCase();
  const responses = SIMULATED_RESPONSES[lang] || SIMULATED_RESPONSES.zh;
  
  // 根据问题内容选择合适的回复类别
  let category = 'general';
  
  if (question.includes('kuhn') || question.includes('库恩') || question.includes('paradigm') || question.includes('范式')) {
    category = 'kuhn';
  } else if (question.includes('ai') || question.includes('人工智能') || question.includes('machine learning') || question.includes('数据')) {
    category = 'ai';
  } else if (question.includes('revolution') || question.includes('革命') || question.includes('shift') || question.includes('转变')) {
    category = 'revolution';
  }
  
  // 从选定的类别中随机选择回复
  const categoryResponses = responses[category] || responses.general;
  const randomIndex = Math.floor(Math.random() * categoryResponses.length);
  const baseReply = categoryResponses[randomIndex];
  
  // 添加适当的上下文
  if (lang === 'zh') {
    return baseReply + "\n\n（此为模拟回复。如需真实AI对话，请在Netlify环境变量中配置DeepSeek API密钥。）";
  } else {
    return baseReply + "\n\n(This is a simulated response. For real AI conversations, configure DeepSeek API key in Netlify environment variables.)";
  }
}