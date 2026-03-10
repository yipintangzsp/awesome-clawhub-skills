#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Codex Skill 生成器
功能：使用 Codex API 生成 OpenClaw Skill 代码，优化现有 Skill，自动测试和发布
"""

import argparse
import os
import json
import time
from pathlib import Path
from datetime import datetime
from typing import Optional, List

try:
    import requests
    import yaml
except ImportError as e:
    print(f"缺少依赖：{e}")
    print("请运行：pip install requests pyyaml")
    import sys
    sys.exit(1)


class CodexSkillGenerator:
    """Codex Skill 代码生成器"""
    
    def __init__(self, api_key: str = None, model: str = "gpt-4"):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.model = model
        self.api_url = "https://api.openai.com/v1/chat/completions"
        
        if not self.api_key:
            print("警告：未找到 OpenAI API Key")
            print("请设置环境变量 OPENAI_API_KEY 或使用 --api-key 参数")
        
        self.workspace = Path.home() / ".openclaw" / "workspace"
        self.skills_dir = self.workspace / "skills"
        
    def generate_skill_code(self, prompt: str, skill_name: str = None) -> dict:
        """使用 Codex 生成 Skill 代码"""
        
        system_prompt = """你是一名专业的 OpenClaw Skill 开发者。
根据用户需求生成完整的 Skill 代码，包括：
1. SKILL.md - Skill 描述和配置
2. 主脚本文件（Python 或 Shell）
3. README.md - 使用说明
4. requirements.txt - Python 依赖（如需要）

遵循 OpenClaw Skill 规范：
- SKILL.md 放在技能目录根路径
- 代码简洁、有注释
- 包含错误处理
- 支持命令行参数
"""
        
        user_prompt = f"""请为 OpenClaw 创建以下 Skill：

需求描述：
{prompt}

要求：
1. Skill 名称：{skill_name or 'auto-generated-skill'}
2. 功能完整，可直接使用
3. 包含必要的错误处理
4. 代码有清晰注释
5. 符合 OpenClaw 规范

请输出以下文件的完整内容（用文件分隔符标记）：
=== FILE: SKILL.md ===
[SKILL.md 内容]

=== FILE: main.py ===
[主脚本内容]

=== FILE: README.md ===
[使用说明]

=== FILE: requirements.txt ===
[依赖列表]
"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 4000
        }
        
        try:
            response = requests.post(self.api_url, headers=headers, json=payload, timeout=60)
            response.raise_for_status()
            
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            
            # 解析生成的文件
            files = self._parse_generated_files(content)
            
            return {
                "success": True,
                "files": files,
                "raw_content": content
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": str(e),
                "files": {}
            }
    
    def _parse_generated_files(self, content: str) -> dict:
        """解析生成的文件内容"""
        files = {}
        
        # 使用正则表达式提取文件
        import re
        
        pattern = r"=== FILE: ([^\s=]+) ===\n(.*?)(?=== FILE: |$)"
        matches = re.findall(pattern, content, re.DOTALL)
        
        for filename, file_content in matches:
            files[filename.strip()] = file_content.strip()
        
        # 如果没有找到分隔符，尝试其他格式
        if not files:
            # 简单处理：假设整个内容是单个文件
            files["main.py"] = content
        
        return files
    
    def save_skill(self, skill_name: str, files: dict, output_dir: str = None):
        """保存 Skill 到文件系统"""
        
        if output_dir:
            skill_dir = Path(output_dir)
        else:
            skill_dir = self.skills_dir / skill_name
        
        # 创建目录
        skill_dir.mkdir(parents=True, exist_ok=True)
        
        saved_files = []
        
        for filename, content in files.items():
            file_path = skill_dir / filename
            
            # 确保父目录存在
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            # 写入文件
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            saved_files.append(str(file_path))
            print(f"✓ 已保存：{file_path}")
        
        # 创建 SKILL.md 如果不存在
        skill_md_path = skill_dir / "SKILL.md"
        if not skill_md_path.exists():
            self._create_default_skill_md(skill_name, skill_md_path)
        
        return {
            "skill_dir": str(skill_dir),
            "files": saved_files
        }
    
    def _create_default_skill_md(self, skill_name: str, path: Path):
        """创建默认 SKILL.md"""
        content = f"""# {skill_name}

## 描述
自动生成的 OpenClaw Skill

## 使用方法
```bash
python3 main.py [参数]
```

## 功能
- 功能 1
- 功能 2

## 依赖
见 requirements.txt

## 作者
Codex Skill Generator

## 版本
1.0.0

## 创建时间
{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
"""
        
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    
    def optimize_existing_skill(self, skill_path: str) -> dict:
        """优化现有 Skill 代码"""
        
        skill_dir = Path(skill_path)
        
        if not skill_dir.exists():
            return {
                "success": False,
                "error": f"Skill 目录不存在：{skill_path}"
            }
        
        # 读取现有文件
        files_content = {}
        for file in skill_dir.glob("*.py"):
            with open(file, 'r', encoding='utf-8') as f:
                files_content[file.name] = f.read()
        
        if not files_content:
            return {
                "success": False,
                "error": "未找到 Python 文件"
            }
        
        # 请求优化
        prompt = "请优化以下 OpenClaw Skill 代码：\n\n"
        for filename, content in files_content.items():
            prompt += f"=== {filename} ===\n{content}\n\n"
        
        prompt += """优化要求：
1. 提高代码质量和可读性
2. 添加更好的错误处理
3. 优化性能
4. 添加必要的注释
5. 保持原有功能不变

请输出优化后的完整代码。"""
        
        # 调用 Codex
        result = self.generate_skill_code(prompt, skill_dir.name)
        
        if result["success"]:
            # 保存优化后的代码
            self.save_skill(skill_dir.name, result["files"], str(skill_dir))
            
            return {
                "success": True,
                "message": "Skill 优化完成",
                "optimized_files": list(result["files"].keys())
            }
        else:
            return result
    
    def test_skill(self, skill_path: str, test_command: str = None) -> dict:
        """测试 Skill"""
        
        import subprocess
        
        skill_dir = Path(skill_path)
        
        if not skill_dir.exists():
            return {
                "success": False,
                "error": f"Skill 目录不存在：{skill_path}"
            }
        
        # 查找主脚本
        main_script = None
        for script in ["main.py", "skill.py", "index.py"]:
            if (skill_dir / script).exists():
                main_script = skill_dir / script
                break
        
        if not main_script:
            main_script = list(skill_dir.glob("*.py"))[0] if list(skill_dir.glob("*.py")) else None
        
        if not main_script:
            return {
                "success": False,
                "error": "未找到可执行的 Python 脚本"
            }
        
        # 构建测试命令
        if test_command:
            cmd = test_command
        else:
            cmd = f"python3 {main_script} --help"
        
        print(f"执行测试命令：{cmd}")
        
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30,
                cwd=str(skill_dir)
            )
            
            return {
                "success": result.returncode == 0,
                "stdout": result.stdout,
                "stderr": result.stderr,
                "returncode": result.returncode
            }
            
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "测试超时（30 秒）"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def publish_skill(self, skill_path: str, version: str = "1.0.0") -> dict:
        """发布 Skill 到 ClawHub"""
        
        import subprocess
        
        skill_dir = Path(skill_path)
        
        if not skill_dir.exists():
            return {
                "success": False,
                "error": f"Skill 目录不存在：{skill_path}"
            }
        
        # 检查 clawhub CLI
        try:
            result = subprocess.run(
                "clawhub --version",
                shell=True,
                capture_output=True,
                text=True
            )
            
            if result.returncode != 0:
                return {
                    "success": False,
                    "error": "未安装 clawhub CLI，请先运行：npm install -g clawhub"
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": f"检查 clawhub 失败：{e}"
            }
        
        # 发布命令
        publish_cmd = f"clawhub publish {skill_dir} --version {version}"
        
        print(f"发布 Skill: {publish_cmd}")
        
        try:
            result = subprocess.run(
                publish_cmd,
                shell=True,
                capture_output=True,
                text=True,
                timeout=120
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": "Skill 发布成功",
                    "stdout": result.stdout
                }
            else:
                return {
                    "success": False,
                    "error": result.stderr or "发布失败"
                }
                
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "error": "发布超时（120 秒）"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def batch_generate(self, prompts_file: str, output_dir: str = None) -> dict:
        """批量生成 Skills"""
        
        # 读取 prompts 文件
        with open(prompts_file, 'r', encoding='utf-8') as f:
            if prompts_file.endswith('.json'):
                prompts = json.load(f)
            elif prompts_file.endswith('.yaml') or prompts_file.endswith('.yml'):
                prompts = yaml.safe_load(f)
            else:
                # 假设每行一个 prompt
                prompts = [line.strip() for line in f if line.strip()]
        
        results = []
        
        for i, prompt_item in enumerate(prompts):
            if isinstance(prompt_item, dict):
                prompt = prompt_item.get('prompt', '')
                skill_name = prompt_item.get('name', f'skill-{i+1}')
            else:
                prompt = prompt_item
                skill_name = f'skill-{i+1}'
            
            print(f"\n[{i+1}/{len(prompts)}] 生成：{skill_name}")
            
            # 生成代码
            result = self.generate_skill_code(prompt, skill_name)
            
            if result["success"]:
                # 保存
                save_result = self.save_skill(skill_name, result["files"], output_dir)
                result["save_result"] = save_result
            
            results.append({
                "name": skill_name,
                "success": result["success"],
                "error": result.get("error")
            })
            
            # 延迟避免 API 限制
            time.sleep(2)
        
        return {
            "total": len(prompts),
            "success": sum(1 for r in results if r["success"]),
            "failed": sum(1 for r in results if not r["success"]),
            "results": results
        }


def main():
    parser = argparse.ArgumentParser(
        description='Codex Skill 生成器',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 生成单个 Skill
  python3 codex-skill-generator.py --prompt "创建天气查询 Skill" --name weather-skill
  
  # 优化现有 Skill
  python3 codex-skill-generator.py --optimize ./skills/existing-skill
  
  # 测试 Skill
  python3 codex-skill-generator.py --test ./skills/new-skill
  
  # 发布 Skill
  python3 codex-skill-generator.py --publish ./skills/new-skill --version 1.0.0
  
  # 批量生成
  python3 codex-skill-generator.py --batch prompts.yaml --output ./skills/
        """
    )
    
    parser.add_argument('--prompt', type=str,
                        help='Skill 功能描述')
    parser.add_argument('--name', type=str, default='auto-skill',
                        help='Skill 名称')
    parser.add_argument('--api-key', type=str,
                        help='OpenAI API Key（或设置 OPENAI_API_KEY 环境变量）')
    parser.add_argument('--model', type=str, default='gpt-4',
                        help='使用的模型 (默认：gpt-4)')
    parser.add_argument('--output', type=str,
                        help='输出目录')
    parser.add_argument('--optimize', type=str,
                        help='优化现有 Skill')
    parser.add_argument('--test', type=str,
                        help='测试 Skill')
    parser.add_argument('--test-command', type=str,
                        help='测试命令')
    parser.add_argument('--publish', type=str,
                        help='发布 Skill')
    parser.add_argument('--version', type=str, default='1.0.0',
                        help='发布版本号')
    parser.add_argument('--batch', type=str,
                        help='批量生成（prompts 文件路径）')
    
    args = parser.parse_args()
    
    # 创建生成器
    generator = CodexSkillGenerator(
        api_key=args.api_key,
        model=args.model
    )
    
    # 执行操作
    if args.batch:
        result = generator.batch_generate(args.batch, args.output)
        print(f"\n批量生成完成：")
        print(f"  总数：{result['total']}")
        print(f"  成功：{result['success']}")
        print(f"  失败：{result['failed']}")
        
    elif args.optimize:
        result = generator.optimize_existing_skill(args.optimize)
        print(f"\n优化结果：{json.dumps(result, indent=2, ensure_ascii=False)}")
        
    elif args.test:
        result = generator.test_skill(args.test, args.test_command)
        print(f"\n测试结果：{json.dumps(result, indent=2, ensure_ascii=False)}")
        
    elif args.publish:
        result = generator.publish_skill(args.publish, args.version)
        print(f"\n发布结果：{json.dumps(result, indent=2, ensure_ascii=False)}")
        
    elif args.prompt:
        print(f"开始生成 Skill: {args.name}")
        print(f"提示：{args.prompt}")
        print("-" * 60)
        
        result = generator.generate_skill_code(args.prompt, args.name)
        
        if result["success"]:
            save_result = generator.save_skill(args.name, result["files"], args.output)
            print(f"\n✓ Skill 生成成功！")
            print(f"目录：{save_result['skill_dir']}")
            print(f"文件：{', '.join(save_result['files'])}")
        else:
            print(f"\n✗ 生成失败：{result.get('error')}")
    
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
