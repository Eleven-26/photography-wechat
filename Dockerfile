# ============================================================
# wechat 站点（员工端 · SLOT 摄影师端）— 生产镜像
# 两阶段构建：node 编译 uni-app → nginx 托管静态站点
#
# 本文件里的「h5」字样与 photography-h5（客户端站点）无关，勿混淆：
#   ① `npm run build:h5` 与 `dist/build/h5` 中的 h5 是 uni-app 的**平台标识符**
#      （平台名：h5 / mp-weixin / app-plus …），属框架约定，不是站点命名；
#      CLI 固定输出到 dist/build/<platform>（不是 dist 根目录），改名会直接构建失败。
#   ② 本镜像只托管**员工端**的 H5 形态；微信小程序形态由微信开发者工具上传，不经容器。
#   ③ 客户端站点（SLOT 摄影预约）的镜像在 photography-h5 仓，与本镜像无关。
# ============================================================

# ---------- 构建阶段 ----------
FROM node:20-alpine AS builder

# uni-app / esbuild 等依赖在 alpine(musl) 下需要 glibc 兼容层
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 先单独拷贝清单安装依赖：源码变动不会让依赖层缓存失效
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build:h5

# ---------- 运行阶段 ----------
FROM nginx:1.27-alpine

# uni-app 的 H5 产物目录是 dist/build/h5（不是 dist）
COPY --from=builder /app/dist/build/h5 /usr/share/nginx/html
COPY build/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
