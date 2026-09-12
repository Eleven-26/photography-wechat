#!/bin/bash
# 批量量测 ME 组页面顶层块几何（.page-wrap 直接子元素，排除 status-bar/tabbar/safe）
BASE="http://localhost:5173/#/pages/me"
PAGES="index profile booking-home preview packages package-edit works works-upload works-edit order-settings pay-settings notify-settings account phone devices help feedback faq agreement"
OUT="D:/workbuddy/www/photography-wechat/.assets-raw/me-audit.txt"
> "$OUT"
i=200
for p in $PAGES; do
  i=$((i+1))
  agent-browser open "$BASE/$p?r=$i" > /dev/null 2>&1
  res=$(agent-browser eval "(() => {
    const wrap=document.querySelector('.page-wrap');
    if(!wrap) return 'NOWRAP';
    const out=[];
    for(const el of wrap.children){
      const cls=(el.className&&el.className.baseVal!==undefined)?el.className.baseVal:(el.className||'');
      if(/status-bar|tabbar|safe|u-/i.test(cls)) continue;
      const r=el.getBoundingClientRect();
      if(r.height===0&&r.width===0) continue;
      const short=cls.replace(/^page-[a-z0-9-]+__?/,'').replace(/page-[a-z0-9-]+/,'ROOT')||el.tagName;
      out.push(short+'|'+Math.round(r.y*10)/10+'|'+Math.round(r.height*10)/10);
    }
    return out.join(' ; ');
  })()" 2>/dev/null)
  echo "== $p => $res" >> "$OUT"
done
echo DONE
