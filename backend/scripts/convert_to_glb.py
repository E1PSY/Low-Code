import bpy
import sys
import os

def main():
    try:
        # 获取传入的参数
        argv = sys.argv
        argv = argv[argv.index("--") + 1:]
        input_file = argv[0]
        output_file = argv[1]
    except ValueError:
        print("❌ 错误: 参数缺失，请检查 Node.js 传参。")
        sys.exit(1)

    print(f"正在加载 Blender 文件: {input_file}")
    
    # 1. 打开传入的 .blend 文件
    bpy.ops.wm.open_mainfile(filepath=input_file)

    # 2. 导出为 GLB (包含贴图、材质、动画、网格)
    # export_materials='EXPORT' 确保材质节点被解析并导出
    bpy.ops.export_scene.gltf(
        filepath=output_file,
        export_format='GLB',
        use_selection=False,       # 导出全部物体
        export_apply=True,         # 应用所有修改器
        export_materials='EXPORT', # 强制导出材质
        export_animations=True     # 导出动画
    )

    print(f"✅ Python 脚本执行成功，文件已保存至: {output_file}")

if __name__ == "__main__":
    main()