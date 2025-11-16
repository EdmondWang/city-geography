## 城市地理可视化（统一比例）

使用 React + Vite + D3 渲染城市行政区划，支持移动端、平板、PC 自适应。通过统一的“米/像素”比例显示不同城市，便于在视频（抖音/短视频）中直观比较城市大小。

### 运行

1) 安装依赖

```bash
npm install
```

2) 启动开发

```bash
npm run dev
```

3) 构建产物

```bash
npm run build && npm run preview
```

### 数据格式与扩展

- 城市列表：`public/data/cities.json`
- 行政区划：放置 GeoJSON（Polygon/MultiPolygon）到 `public/data/<cityId>/boundary.geojson`

`cities.json` 每项字段：

- `id`: 城市唯一 ID（文件夹名）
- `name`: 城市名称
- `country`: 国家/地区
- `centerLat`: 中心经度用于修正 Mercator 不同纬度的比例误差（可选）
- `geojsonPath`: GeoJSON 相对路径
- `preferredMpp`: 为该城市设置默认“米/像素”（可选）

示例：

```json
[
  {
    "id": "shanghai",
    "name": "上海",
    "country": "中国",
    "centerLat": 31.2,
    "geojsonPath": "/data/shanghai/boundary.geojson",
    "preferredMpp": 2500
  }
]
```

注意：仓库内提供的是“简化示例”多边形，便于验证渲染与比例逻辑。用于实际视频制作时，请将 `boundary.geojson` 替换为真实的城市行政区划数据（建议简化顶点以减小体积）。

### 统一比例说明（米/像素）

- 采用 Web Mercator 投影（d3-geo），按照给定 `metersPerPixel` 计算投影 `scale`：
  - 在纬度 φ 处，近似 `scale = (R * cos(φ)) / mpp`，其中 `R=6378137m`。
  - 同一 `mpp` 下，不同城市在各自容器中以同样的实际比例显示。
  - 若统一比例导致图形超出容器，会自动做「缩小」以完整显示，但不会放大超过统一比例（保证对比一致性）。

### 移动/平板/PC 自适应

- 布局使用 CSS Grid 与 ResizeObserver，自适应单列/双列/多列。
- 侧边栏选择 1-4 个城市进行对比。

### 提示

- 如果 GeoJSON 边界较复杂，建议使用 `mapshaper` 或 GIS 工具做简化。
- 若需要基于面积的更严格等面积投影，可将投影替换为等面积投影（如 `geoEqualEarth`）并相应调整比例计算。


