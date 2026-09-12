# -*- coding: utf-8 -*-
"""Audit: board texts & bg vs page source. Reports missing texts and bg mismatches."""
import re, os, io, sys, glob

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
BASE = r"D:\workbuddy\www\photography-wechat\.assets-raw\board-summaries"
PAGES = r"D:\workbuddy\www\photography-wechat\src\pages"

MAP = {
    'ME01-我的_1_5731': 'me/index.vue',
    'ME02-个人资料_1_5866': 'me/profile.vue',
    'ME03-我的预约主页_1_5940': 'me/booking-home.vue',
    'ME03b-客户视角预览_11_623': 'me/preview.vue',
    'ME04-套餐管理_1_6079': 'me/packages.vue',
    'ME04b-新建套餐_11_1': 'me/package-edit.vue',
    'ME05-编辑套餐_1_6789': 'me/package-edit.vue',
    'ME06-作品集_1_6503': 'me/works.vue',
    'ME07-上传作品_1_6587': 'me/works-upload.vue',
    'ME08-编辑作品_1_6698': 'me/works-edit.vue',
    'ME09-接单设置_1_6176': 'me/order-settings.vue',
    'ME09-接单设置_1_6425': 'me/pay-settings.vue',
    'ME10-通知设置_1_6238': 'me/notify-settings.vue',
    'ME11-账号与安全_1_6298': 'me/account.vue',
    'ME11b-修改手机号_11_239': 'me/phone.vue',
    'ME11c-登录设备_11_468': 'me/devices.vue',
    'ME12-帮主与关于_1_6344': 'me/help.vue',
    'ME12b-意见反馈_11_313': 'me/feedback.vue',
    'ME12c-常见问题_11_387': 'me/faq.vue',
    'ME12d-用户协议与隐私政策_11_549': 'me/agreement.vue',
    'W01工作台_1_2874': 'work/index.vue',
    'W02通知_1_3020': 'notify/index.vue',
    'CU01-客户列表_1_5625': 'customer/list.vue',
    'CU02-客户档案_1_7027': 'customer/detail.vue',
    'L01线索_1_3110': 'lead/list.vue',
    'L02线索_1_3177': 'lead/detail.vue',
    'L03AI简报_1_7703': 'lead/ai-brief.vue',
    'L04一键追问_1_8041': 'lead/ask.vue',
    'L05-1报价_1_7813': 'quote/create.vue',
    'L05-2报价_1_7903': 'quote/create.vue',
    'SC01-日程_1_3960': 'schedule/index.vue',
    'SC02-日程本周_1_4047': 'schedule/index.vue',
    'SC03-日程可约档期_1_4152': 'schedule/index.vue',
    'SC04-档期管理_1_4297': 'schedule/manage.vue',
    'SC04-档期管理_1_5536': 'schedule/reschedule.vue',
    'A02注册_1_8204': 'auth/register.vue',
    'A03创作工作空间_1_8247': 'auth/workspace.vue',
    'A04选择工作模式_1_8287': 'auth/mode.vue',
}

def norm(s):
    return re.sub(r'\s+', '', s)

print('=' * 30, 'TEXT AUDIT', '=' * 30)
for key, page in MAP.items():
    # find deep file for this board
    cands = [f for f in os.listdir(BASE) if f.startswith('DEEP-' + key)]
    if not cands:
        print(f'-- {key}: NO DEEP SUMMARY'); continue
    path = os.path.join(BASE, cands[0])
    src = open(path, encoding='utf-8').read()
    texts = re.findall(r'TEXT="([^"]+)"', src)
    board_bg = None
    m = re.search(r'^\[F\].*?bg=(#[0-9A-Fa-f]{6})', src, re.M)
    if m:
        board_bg = m.group(1).upper()
    vue = norm(open(os.path.join(PAGES, page), encoding='utf-8').read())
    nv = norm(vue)
    missing = []
    for t in texts:
        tn = norm(t)
        if not tn or len(tn) < 2:
            continue
        if tn not in nv:
            missing.append(t)
    # bg check: look for board bg hex in page source (any case)
    bg_ok = None
    if board_bg:
        bg_ok = board_bg.replace('#', '') in vue.upper().replace('#', '')
    flag = 'BG-MISMATCH' if board_bg and not bg_ok else ''
    print(f'-- {key} -> {page} [{board_bg or "?"}] {flag}')
    for t in missing:
        print(f'   MISS: {t}')
