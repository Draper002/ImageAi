export type Locale = "zh" | "en";

type Preset = {
  readonly value: string;
  readonly zh: string;
  readonly en: string;
};

export const imageTypes = [
  { value: "general", zh: "通用图片", en: "General image" },
  { value: "poster", zh: "海报", en: "Poster" },
  { value: "social_cover", zh: "社媒封面", en: "Social cover" },
  { value: "product", zh: "商品图", en: "Product image" },
  { value: "illustration", zh: "插画", en: "Illustration" },
  { value: "avatar", zh: "头像", en: "Avatar" },
  { value: "banner", zh: "横幅", en: "Banner" }
] as const satisfies readonly Preset[];

export type ImageTypeValue = (typeof imageTypes)[number]["value"];

export const styles = [
  { value: "realistic", zh: "真实摄影", en: "Realistic" },
  { value: "minimal", zh: "极简", en: "Minimal" },
  { value: "three_d", zh: "3D", en: "3D" },
  { value: "cinematic", zh: "电影感", en: "Cinematic" },
  { value: "watercolor", zh: "水彩", en: "Watercolor" },
  { value: "cyberpunk", zh: "赛博朋克", en: "Cyberpunk" }
] as const satisfies readonly Preset[];

export type StyleValue = (typeof styles)[number]["value"];

export const scenes = [
  { value: "indoor", zh: "室内", en: "Indoor" },
  { value: "outdoor", zh: "户外", en: "Outdoor" },
  { value: "studio", zh: "工作室", en: "Studio" },
  { value: "nature", zh: "自然", en: "Nature" },
  { value: "city", zh: "城市", en: "City" },
  { value: "festival", zh: "节日", en: "Festival" }
] as const satisfies readonly Preset[];

export type SceneValue = (typeof scenes)[number]["value"];

export const whitespaceOptions = [
  { value: "none", zh: "无特殊要求", en: "No special requirement" },
  { value: "top", zh: "顶部留白", en: "Top whitespace" },
  { value: "bottom", zh: "底部留白", en: "Bottom whitespace" },
  { value: "left", zh: "左侧留白", en: "Left whitespace" },
  { value: "right", zh: "右侧留白", en: "Right whitespace" },
  { value: "center", zh: "主体居中", en: "Centered subject" }
] as const satisfies readonly Preset[];

export type WhitespaceValue = (typeof whitespaceOptions)[number]["value"];

export const aspectRatios = [
  { value: "1:1", label: "1:1", shape: "square" },
  { value: "4:5", label: "4:5", shape: "portrait" },
  { value: "16:9", label: "16:9", shape: "wide" },
  { value: "9:16", label: "9:16", shape: "tall" },
  { value: "3:2", label: "3:2", shape: "landscape" }
] as const;

export type AspectRatioValue = (typeof aspectRatios)[number]["value"];

const groups = {
  imageTypes,
  styles,
  scenes,
  whitespaceOptions
};

export type PresetGroup = keyof typeof groups;

export function getPresetLabel(group: PresetGroup, value: string | undefined, locale: Locale): string | undefined {
  if (!value) return undefined;
  return groups[group].find((preset) => preset.value === value)?.[locale];
}
