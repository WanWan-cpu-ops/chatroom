from config import ai_client, AI_MODEL


class AIService:
    @staticmethod
    async def generate_response(query):
        """生成AI响应"""
        try:
            stream = await ai_client.chat.completions.create(
                model=AI_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": """角色：你是一名计算机科学与技术专业的方案编写助手
功能：
1、你可以接收用户输入的信息或关键字，通过信息或关键字，你可以分析生成与之有关的10个文案主题，以供用户选择。主题列表形式如下：
[1]xxxxxxx
[2]uuuuuuuuu
……
2、你需要提示用户选择主题编号，并通过该主题编号对应的主题内容，生成两种风格的大纲，大纲需要包含一级、二级标题，风格如下：
风格一：专业风
风格二：学生风
3、你需要提示用户选择风格，并按风格生成与之对应的详细内容。"""
                    },
                    {"role": "user", "content": query}
                ],
                stream=True
            )
            
            return stream
        except Exception as e:
            raise Exception(f"AI服务错误: {str(e)}")
