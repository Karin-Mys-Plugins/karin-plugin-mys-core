# Changelog

## [1.1.2](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.1.1...v1.1.2) (2026-01-16)


### 🐛 错误修复

* node-karin 及其子路径的导入标记为外部依赖，不参与打包 ([114447b](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/114447b9d53cffb88036803e0e01114e69b1b48f))
* react ([b3b6179](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/b3b61793bf3cf0143b7288a02749d56089c6eca0))
* SQLite 不允许在表名和列名中使用连字符（-） ([210b1f4](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/210b1f4d81d658517509aed29b350d8270efd72e))
* 优化数据库 ([90bee40](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/90bee40a2d0374dc17d030f3c8a9db55c3dc7336))
* 打包 ([a9472db](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/a9472dbec26341d1b3a09cb919963a8ac9b2a362))
* 打包 ([43fbf05](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/43fbf05861cf6d02eca074df7b28f7235284f065))
* 插件包绝对路径错误 ([aed98cc](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/aed98cc3e09ea66a1809406b1ff1929a34cbd2eb))

## [1.1.1](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.1.0...v1.1.1) (2026-01-14)


### 🐛 错误修复

* 使用oxlint替代eslint ([006be9c](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/006be9c9dfed5a9cc97908fdd6b34fec04eb3ca4))
* 换回eslint ([8d29fe7](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/8d29fe736039a3cb48abd930ba89efa402e02315))


### ♻️ 代码重构

* 移除sequelize ([fe7cb75](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/fe7cb757f81843b6bd02b9e53b03ce73ad28eb9c))

## [1.1.0](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.27...v1.1.0) (2025-12-24)


### ✨ 新功能

* 迁移至tsdown、优化配置文件、数据库表定义 ([9270837](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/9270837f63dfe97e15761b2ec4c00fe8900b1897))


### 🐛 错误修复

* 优化类型推断 ([efcaa42](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/efcaa42b99bab4613278e18029cdb25b06e620f7))
* 修复类型错误 ([f22bb00](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/f22bb0086dbf4a925ab65e2ec38fb5c5785c2262))
* 删除不应该使用的类型 ([81ec2ba](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/81ec2ba82a6bf2e81a79153c8c84bbe8a7860208))
* 判断错误、主键缺失 ([12df774](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/12df774358ae6b768836d96e516e2eabbed830dd))
* 宽松判断 ([e9894bc](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/e9894bcb77782b33c80ff6327207453fbbedfbb6))
* 枚举类型 ([9b6bd8f](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/9b6bd8fdf11bf96137f3407f82e4bf91114ead49))

## [1.0.27](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.26...v1.0.27) (2025-12-21)


### Bug Fixes

* 完善数据库表定义 ([8df1cef](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/8df1cef1251a30f332e0aa4b6c3fae1dcb3c80e7))

## [1.0.26](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.25...v1.0.26) (2025-12-18)


### Bug Fixes

* 优化底部插件信息 ([0aa8a0d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/0aa8a0d0ac424e7d48ec7b7f2946d0bb028e51f0))
* 优化底部插件信息 ([b3619a8](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/b3619a86a66eb473e11f6b9cb97c6a0c193ed91c))
* 优化底部插件信息 ([b8c5c4f](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/b8c5c4f8d47f139ed0c619a5b3b94a17bc012494))
* 完善配置类型推导 ([144b9bb](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/144b9bbaa770aa1a1751b4dc3ebc0daa044a2d5b))

## [1.0.25](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.24...v1.0.25) (2025-12-17)


### Bug Fixes

* pr使用配置文件 ([070b809](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/070b8095a5c4788f67d1d1a4d9fcf13a313007c0))
* pr配置文件 ([f35411e](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/f35411e142e834c270fce69028becf0c12f0f518))
* 删除pr配置文件 ([1c2d2e5](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/1c2d2e57fdad6319cf06f4038325b23b909e9691))

## [1.0.24](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.23...v1.0.24) (2025-12-17)


### Bug Fixes

* 截图默认png ([1245a2f](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/1245a2f74a0b8ef99f5659d69a2c1ee21eda75f8))
* 更新评论 ([442c504](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/442c50401dc294edeee789524aaaa536343d34c8))
* 版本号 ([801d599](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/801d599235288a3843a93d13b701fb800013e10d))
* 表定义错误 ([9420a85](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/9420a853b52e359b5a9a5d8e937a9955808e2657))
* 预览 ([58f565d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/58f565d0eababf62b0934f47c65260a24b83e01b))

## [1.0.23](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.22...v1.0.23) (2025-12-16)


### Bug Fixes

* 优化表定义 ([aa10431](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/aa104317f85e0c29cd4c6d1d79d91c896b2785b5))
* 升级 release-please 到 v4 并添加配置文件 ([60370f7](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/60370f732f7050c3c1bbbf287458734808d96ba5))
* 更新工作流 ([c6237b0](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/c6237b05dccd06bfcb66c587c63cfbf8fe0440e5))
* 更新工作流 ([95c4bdc](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/95c4bdca79000c68c8ac3c5c758d2fad54c7ec54))
* 更新工作流 ([cfd364a](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/cfd364a4bc162083d9c1e08e3ad8e6229e5f8cd4))
* 更新工作流 ([e7c4023](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/e7c40234693d25ed3872344254637cbae0651e55))

## [1.0.22](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.21...v1.0.22) (2025-12-16)


### Bug Fixes

* 优化数据库表定义 ([2eaa315](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/2eaa315e03e627a372483412a34ba0ac24a32e26))
* 工作流 ([0e60b2d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/0e60b2d99d05f609238cf3d7e8cd60f50327bce1))
* 工作流 ([bfc9548](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/bfc95486295561a2a928b85285ca2fe2da8b7de0))
* 工作流 ([22ae286](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/22ae28683fe9e0b56c0ba98da3a30ce75894a9b0))
* 工作流 ([883bcd3](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/883bcd3ceb49b68d35c9d105f8765c3c963d7824))

## [1.0.21](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.20...v1.0.21) (2025-12-15)


### Bug Fixes

* 工作流 ([34d41db](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/34d41dbc399c6ec2c586458d49874f3f0c894c10))
* 工作流使用npx ([76d099e](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/76d099e9051bd219d4968536269cfe137fa9e235))
* 更新Layout ([575843a](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/575843a5ff9f5b119bbeaffd9b83fcc769380743))
* 更新工作流 ([5ccb9bf](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/5ccb9bffcbd9db66d33cc51768c97123f5e6f591))
* 更新工作流 ([378d56a](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/378d56a1e09b0197f8b256edbefdc51498fb2c99))
* 更新工作流 ([ee549b4](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/ee549b46c98e2fe1dc2fc1fcf05a1bb70885db7b))

## [1.0.20](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.19...v1.0.20) (2025-12-11)


### Bug Fixes

* Config使用enum作为键时类型错误 ([67ec31f](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/67ec31f9dfc40bdb74076806e121e57b9cf3e844))
* 删除不必要的export ([e3bc8ab](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/e3bc8ab3cd3a0c461eecddc6844b0556e1515ed5))

## [1.0.19](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.18...v1.0.19) (2025-12-11)


### Bug Fixes

* OIDC ([ec4b4af](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/ec4b4af76769dcd3131645afaf6be22857335ef8))

## [1.0.18](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.17...v1.0.18) (2025-12-11)


### Bug Fixes

* 更新工作流 ([fa80e6e](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/fa80e6eb70d132e2718d32a2f94def958e0e20a3))

## [1.0.17](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.16...v1.0.17) (2025-12-11)


### Bug Fixes

* config提供更完整的类型支持 ([58e1d71](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/58e1d712701ca509103bab9dc83193eef97b7520))

## [1.0.16](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.15...v1.0.16) (2025-12-10)


### Bug Fixes

* web配置 ([0f0f9ad](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/0f0f9ad68529b67bcacfb6d98781adb6a02f14fe))

## [1.0.15](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.14...v1.0.15) (2025-12-10)


### Bug Fixes

* 添加切换UID命令 ([ed97c86](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/ed97c863970eab20e38c41557afda2a39cbb9b28))

## [1.0.14](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.13...v1.0.14) (2025-12-09)


### Bug Fixes

* 添加export ([f8d6977](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/f8d697777c541e7b51d819d4b2f83004ead3c742))

## [1.0.13](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.12...v1.0.13) (2025-12-09)


### Bug Fixes

* 添加export ([b9b1e8f](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/b9b1e8f2e229cd60bca3052a4bb41c015bf3803c))

## [1.0.12](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.11...v1.0.12) (2025-12-09)


### Bug Fixes

* 图片使用webp格式 ([a7f9b04](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/a7f9b04e4f5c365960665fe0bd0735a432cf33eb))
* 添加配置、使用 absPath标准化文件路径、优化编译 ([a0f0054](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/a0f0054cce2f175dc259558da3b456bbd070f6ad))

## [1.0.11](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.10...v1.0.11) (2025-12-04)


### Bug Fixes

* 优化布局 ([278420d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/278420dfa026cd3ac82717d7876a60f9c14b072c))

## [1.0.10](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.9...v1.0.10) (2025-12-03)


### Bug Fixes

* css缺失 ([8da7208](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/8da72088ebba63cf0914c8e358a136fd00958936))

## [1.0.9](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.8...v1.0.9) (2025-12-03)


### Bug Fixes

* css缺失 ([e506937](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/e506937a4f22de56e4f88bcbefb6d65a1e17dfdf))

## [1.0.8](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.7...v1.0.8) (2025-12-03)


### Bug Fixes

* 优化Config ([0653b4d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/0653b4db7bbbc4a7036f7ff48ef8e14ce5f16ce8))
* 优化Table ([bff7fad](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/bff7fadf162bb4f55665ba70d8de30bf125cc632))
* 优化初始化配置、Database ([5d601b2](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/5d601b2acb556f0c2ed9bc7fde9f110afb3d0419))
* 数据库初始化值错误 ([8b8b3fd](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/8b8b3fd79abe096117100d39d3778f181cccd9b2))

## [1.0.7](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.6...v1.0.7) (2025-12-02)


### Bug Fixes

* 字体 ([c4b1f34](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/c4b1f34862444e7dac2b1117b31d9addebd69ce2))
* 导出DefaultLayout ([55a6d68](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/55a6d68c7985e5f62afea1437efafcef7651022d))

## [1.0.6](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.5...v1.0.6) (2025-12-02)


### Bug Fixes

* 排除apps中 .d.ts 文件 ([0dbb83d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/0dbb83d2d94fbc7518913843944b3547247f5888))

## [1.0.5](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.4...v1.0.5) (2025-12-02)


### Bug Fixes

* 使用ssr生成html ([6e5263d](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/6e5263db5c2a5aec917af210a1ffd7e7b5536d72))
* 账号列表头像名字显示错误、更新文档 ([d446dc0](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/d446dc0a76d485d94a0ee1c83637ab52360062d5))

## [1.0.4](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.3...v1.0.4) (2025-11-30)


### Bug Fixes

* 优化部分类型 ([6ba1773](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/6ba1773e86eba19fa263081ed20fa8b029bd7197))

## [1.0.3](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.2...v1.0.3) (2025-11-30)


### Bug Fixes

* 修改命名 ([8fba0ec](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/8fba0ec865129fa72a32e698dec4cc87f62a275c))

## [1.0.2](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.1...v1.0.2) (2025-11-30)


### Bug Fixes

* 完善web配置 ([be33b4a](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/be33b4a7679a0e11697a05a661fd2946f19e9d8b))

## [1.0.1](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/compare/v1.0.0...v1.0.1) (2025-07-01)


### Bug Fixes

* 绑定设备 ([e102123](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/e1021232d3acffdc8cf378d036fedef16917ff63))

## 1.0.0 (2025-06-28)


### Bug Fixes

* 删除资源目录 ([278dfa6](https://github.com/Karin-Mys-Plugins/karin-plugin-mys-core/commit/278dfa6ebc6f4108bd603108c321f5c9b3569af1))
