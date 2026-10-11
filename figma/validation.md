# ORIN 前端验收

本文保留个人网站及后续迭代的历史验收记录，不代表当前产品规格。当前为 Discover → Exhibition → Book a Visit → My Tickets 公益展览原型；最新说明见 [README](../README.md) 和 [当前验收索引](../qa/validation.md)。后文中的作品集页面、4197 端口及拱门图案均属于历史版本；当前使用 4198 端口和拼接门票图案。

日期：2026-10-05（Asia/Shanghai）

## 来源

Figma `Untitled / Page 1 (0:1)`，6 个状态画板，参考尺寸 1440 × 900。完整采集对应 `source.json` 中的 6 个 capture，均为 `collected`，无未解决警告和缺失节点。原始采集保留 `visualReview: pending`，实际视觉结论记录在本文，不修改采集器的原始证据。

从 Figma CLI 导出并实际查看参考截图；首页图形、Contact 箭头及叠层/全屏两组作品图以 SVG 引用。字体本地打包。页面主体为语义化 HTML，未将整页截图当作实现。

## 构建与测试

在 `frontend/orin-portfolio` 执行：

| 命令 | 结果 |
| --- | --- |
| `npm install --no-audit --no-fund` | 成功 |
| `npm run build` | 成功，Vite 7.3.6，生产输出 `dist/` |
| `npm test` | 5 / 5 通过，20.5 秒 |
| `npm test -- --grep 'narrow screen'` | 最后修正手机作品图比例后，受影响测试 1 / 1 通过，5.2 秒 |

浏览器为真实 Playwright Chromium。测试包含：

1. 滚轮首次触发时 Work 位于视口上方，随后落到 y=0；宽 1296、高 900。Contact 宽 1152。持续惯性事件不连续翻页；反向逐层收回；起点不越界。
2. 从侧边标签展开全屏，继续通过三个标签导航；方向键、Home、End 和 Enter 可用；隐藏页面不可获得焦点；需要时焦点跟随当前标题。
3. 390 × 844 下 Work 原生滚动优先，滚到底后下一次手势进入 Contact；标签仍可点击；无横向内容溢出。
4. Chromium CDP 的触摸手势进入/退出 Work；`prefers-reduced-motion: reduce` 下没有运行的动画。
5. 动画过程中改变视口，随后在 820 × 720、360 × 640 下继续导航；Contact 返回按钮保持在视口中。

桌面主流程监控 `pageerror` 和 HTTP >=400 响应，均为空。测试包含真实 SVG、字体加载。无模拟 Figma API 测试替代浏览器验收的情况。

## 视觉检查

以下 PNG 已实际打开查看。截图等待本地字体和两个绘制帧，关闭截图时的过渡；状态已稳定。

| 视口 | 截图（相对项目根目录） | 观察 |
| --- | --- | --- |
| 1440 × 900 | `qa/desktop-home.png`、`qa/desktop-home-full.png` | 单屏首页、大标题、图形、页脚均可见，导航留白与源设计一致 |
| 1440 × 900 | `qa/desktop-work-stack.png`、`qa/desktop-work-full.png` | 三列作品；叠层 90% 与全屏各用对应 Figma SVG；卡片顶部已对齐约 y=354 |
| 1440 × 900 | `qa/desktop-contact-stack.png`、`qa/desktop-contact-full.png` | 80% Contact 与两条 10% 侧栏；全屏导航和邮箱占位无遮挡 |
| 390 × 844 | `qa/mobile-home.png`、`qa/mobile-home-full.png` | 标题、图形改为纵向构图，首屏和页脚完整 |
| 390 × 844 | `qa/mobile-work-top.png`、`qa/mobile-work-bottom.png` | 作品纵排自然滚动，SVG 保持固有比例，Home 标签条固定可见 |
| 390 × 844 | `qa/mobile-contact-stack.png`、`qa/mobile-contact-full.png` | 三页标签入口可用，文案与邮箱占位完整 |
| 820 × 720 | `qa/tablet-work-full.png` | 保留三列作品，可继续通过顶部标签导航 |
| 360 × 640 | `qa/small-contact-full.png` | 小尺寸下标题、导航、箭头和返回按钮不重叠 |

修改前的桌面 Home/Work 及手机 Work 截图保留在 `qa/before-refinement/`。修正了作品图垂直间距、使用对应叠层素材，以及手机 SVG 宽高比造成的侧边空隙；修改后已重新截图查看。

## 实现差异与限制

- Figma 是可点击状态演示；前端新增真实滚轮、触摸和键盘行为。铺页采用 700ms 位移，标签展开采用 550ms 裁切揭示，反向滚动收回。没有滚轮逐像素跟随或持续自动播放。
- 手机/短屏布局为实现补充：Work 可纵向滚动，侧边文字转为竖排；保持 90% / 80% 的叠层宽度关系。
- 浏览器 Inter 与 Figma 字体的字形、字重和基线有少量渲染差异，未宣称逐像素一致。
- 作品保留设计稿中的概念项目，可通过后续新增的预览弹层查看大图，未新增详情路由。邮箱未提供，显示原稿占位；设置 `src/content.js` 的 `profile.email` 后生成真实 mailto 链接。
- 无后端、表单投递或线上部署。已验收 Chromium；未进行真实 iOS Safari / Firefox 实机验收。
- 本次只增加独立前端和素材计划，没有修改 Figma 文档、Bridge、Plugin、CLI 运行时，因此未运行无关的根目录运行时测试。

本地预览：`http://127.0.0.1:4197`。运行说明见项目 `README.md`。

## 后续更新：作品图片预览

按用户要求，Work 叠层与全屏状态中的三个作品卡片均可打开原生 modal dialog。预览使用作品的完整 SVG，支持前后切换、左右方向键、关闭按钮、背景关闭及 Esc；关闭后恢复原卡片焦点和列表滚动位置。预览期间键盘和滚轮不会触发底层铺页。可在内容配置中提供 `previewAsset` 使用独立预览大图。

验收：`npm run build` 成功；原有 5 项导航/响应式测试通过。新增 2 项预览测试发现并修正了 Tab 从最后一个控件移出弹层的问题，随后 `npm test -- tests/preview.spec.js` 2 / 2 通过（4.6 秒）。覆盖全部作品图片成功解码、叠层/全屏入口、前后切换、底层导航隔离、Esc/关闭按钮/背景关闭、焦点返回及手机滚动位置保留。

实际查看 `qa/desktop-project-preview.png`（1440 × 900）和 `qa/mobile-project-preview.png`（390 × 844）：图片完整显示、比例正确，标题与关闭/切换按钮均无遮挡。本次前端交互更新未修改 Figma 画布。

## 后续更新：Work 后加入 About

四页顺序为 Home → Work → About → Contact。About 使用暖白底、黑色大字和蓝色 orin，包含图形头像占位、可拖动/键盘移动的贴纸、简介和 Currently 列表。个人信息未提供，使用明确的 coming soon / To be shared 占位，可通过 `src/content.js` 修改。

About 叠层占 80vw，Contact 调整为 70vw；每个底层页保留 10vw 标签。四页的导航、反向滚动、Home/End、浏览器主题色和页脚均已更新。手机 About 支持纵向滚动，拖动贴纸不会触发翻页。

`npm run build` 成功；9 项 Playwright 测试通过（`test-results/.last-run.json` status=passed，failedTests=[]）。覆盖完整四页前进/后退、About 标签展开、贴纸拖动及键盘位移、四项窄屏导航、手机 About 滚动，以及原有作品预览回归。

实际查看 `qa/desktop-about-stack.png`、`qa/desktop-about-full.png`、`qa/mobile-about-full.png`、`qa/desktop-contact-stack.png` 和 `qa/small-contact-full.png`：新增页面布局及三条露出侧栏正确，360px 视口下四项导航未与品牌重叠。新页直接在前端实现；未反向修改 Figma 原稿。

## English events redesign — 2026-10-10

Implemented directly from the agreed activity-registration brief, preserving original capture provenance. New pages: Discover, Details, Register, My Pass. Original portfolio checkout unchanged.

Production build passed. Three current Playwright scenarios passed using installed Microsoft Edge (`PW_CHANNEL=msedge`): desktop registration/persistence/calendar/cancellation, unselected empty states and full-screen counter-motion, and mobile registration/navigation overflow. After removing duplicate form IDs, the registration flow and build passed again.

Visually reviewed `qa/events-desktop-discover.png`, `qa/events-mobile-discover.png`, `qa/events-details.png`, `qa/events-register.png`, `qa/events-desktop-pass.png`, and `qa/events-mobile-pass.png`. Viewports: 1440x900 and 390x844. Corrected mobile poster column overflow. Detailed pages intentionally scroll before deck navigation.

Demo data only: fictional workshop, local browser reservation, no payment/email/backend/live capacity/admission verification. Calendar export is labeled as a demo event. Earlier portfolio tests retained as historical reference; current test suite is events.spec.js.

## Multiple-activity verification — 2026-10-10
Build passed and all 5 current Playwright scenarios passed using Microsoft Edge. Added checks for all four card/detail/registration bindings, opposing vertical transforms from stacked and expanded Discover, two independent saved reservations, refresh persistence and mobile width. Visually inspected qa/activity-collection.png and qa/activities-mobile.png. No original portfolio changes.

## Free exhibition redesign — 2026-10-10
Replaced workshop content with four free public-interest exhibition concepts and renamed all four navigation labels. Added offered-date selection with persisted ticket dates and matching ICS export. Original portfolio untouched. Build and six relevant test scenarios passed in Edge (five adapted existing cases plus one targeted date/export case). Visually reviewed desktop homepage, mobile ticket, qa/exhibition-details.png and qa/exhibition-booking.png. Demo-only limitations retained in UI.

## Generated exhibition covers — 2026-10-10
Created four original raster covers with built-in image_gen and copied each original PNG into public/assets/exhibitions. Prompts are recorded in public/assets/exhibitions/generation.md. Browser-canvas encoding produces 1536px and 768px WebP variants; original artwork is unmodified. Large WebPs are 240–445 KB each, mobile variants 75–141 KB. Hero loads eagerly; gallery images load lazily with responsive srcset. All card titles remain live HTML. Verified five displayed images decode, visually inspected desktop/mobile screenshots, production build passed, and the four-card counter-motion regression passed. Existing original portfolio unchanged.

## Assembling entrance rails
Three clipped SVG viewports form one entrance and continuous path as the rails slide in. The existing rail controls remain clickable. BOOKED and the filled end node are driven by the selected exhibition's saved booking, and disappear on cancellation. Build and all six current tests passed. qa/check-entrance.mjs verified the three stages, mobile layout and booking/cancellation status; screenshots inspected at 1440x900 and 390x844. Added lower clearance for the rotated stamp after visual inspection.
