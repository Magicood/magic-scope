---
"@magic-scope/react": patch
---

用户实测暴露的三个组件 bug 修复:

- **Affix 容器内吸附后"跟着屏幕滚"**:吸附态是 position:fixed(视口坐标),旧实现只监听 getTarget 容器自身的 scroll,页面(window)一滚 fixed 坐标全部过期,内容钉在屏幕上跟着视口走。现改为在 window 捕获段统一监听 scroll(捕获段能收到 window 与任意嵌套容器的所有滚动),任何祖先滚动都会重测、fixed 坐标始终新鲜。
- **NavigationMenu 悬停持续闪烁**:panel 浮层(Viewport)此前经 CSS Anchor Positioning 锚定自己的祖先 <nav>——锚定位对祖先锚点不生效,浮层落回静态位置、盖住触发器下半段,与 hover 热区形成「开 → 盖住光标 → pointerleave → 延时关 → 光标落回触发器 → 再开」的持续振荡。移除锚定实验、回归「相对 nav 根 absolute 贴底」定位(所有浏览器一致);并给 Viewport 补上缺失的 hover 热区保护(指针移入 panel 取消关闭计时,离开才走宽限关闭)——修复悬停 panel 超过 closeDelay 被误关的隐藏缺陷。
- **Statistic count-up 动画小数尾巴乱跳**:插值帧是原始 float,未显式给 precision 时按自身位数全量渲染。现动画帧显示精度对齐终值自身的小数位数(整数终值逐帧取整、一位小数终值逐帧一位),收尾仍落真实终值。
