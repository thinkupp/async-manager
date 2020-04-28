module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      0,
      "always",
      [
        "build",         // 打包编译代码
        "chore",         // 改变构建流程、或者增加依赖库、工具等
        "docs",          // 仅仅修改了文档，比如README, CHANGELOG, CONTRIBUTE等等
        "feat",          // 新增feature
        "fix",           // 修复bug
        "perf",          // 优化相关，比如提升性能、体验
        "refactor",      // 代码重构，没有加新功能或者修复bug
        "revert",        // 回滚到上一个版本
        "style",         // 仅仅修改了空格、格式缩进、逗号等等，不改变代码逻辑
        "test",          // 测试用例，包括单元测试、集成测试等
        "config"         // 更改了一些库/插件的配置文件
      ],
    ],
  },
};

/** https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/config-conventional/index.js */
