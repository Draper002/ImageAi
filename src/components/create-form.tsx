"use client";

import { useMemo, useState } from "react";
import { buildPrompt } from "@/lib/prompt-builder";
import {
  aspectRatios,
  imageTypes,
  scenes,
  styles,
  whitespaceOptions,
  type Locale
} from "@/lib/presets";
import { AspectRatioOption } from "./aspect-ratio-option";

export function CreateForm({ locale, credits }: { locale: Locale; credits: number }) {
  const [subject, setSubject] = useState("");
  const [imageType, setImageType] = useState("general");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [style, setStyle] = useState("");
  const [scene, setScene] = useState("");
  const [whitespace, setWhitespace] = useState("");
  const [additionalRequirements, setAdditionalRequirements] = useState("");
  const [hasReferenceImage, setHasReferenceImage] = useState(false);

  const preview = useMemo(() => {
    try {
      return buildPrompt({
        locale,
        subject: subject || "一只穿着宇航服的橘猫",
        imageType,
        aspectRatio,
        style: style || undefined,
        scene: scene || undefined,
        whitespace: whitespace || undefined,
        additionalRequirements: additionalRequirements || undefined,
        hasReferenceImage
      });
    } catch {
      return null;
    }
  }, [additionalRequirements, aspectRatio, hasReferenceImage, imageType, locale, scene, style, subject]);

  return (
    <form className="create-form" action="/api/generate" method="post" encType="multipart/form-data">
      <input type="hidden" name="locale" value={locale} />

      <section className="panel">
        <div className="section-title">
          <h2>1. 描述主体</h2>
          <span className="tag">必填</span>
        </div>
        <textarea
          name="subject"
          value={subject}
          onChange={(event) => setSubject(event.target.value)}
          aria-label="主体，例如：一只穿着宇航服的橘猫，站在月球咖啡馆门口"
          required
        />
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>2. 可选参数</h2>
          <span className="tag">可选</span>
        </div>

        <label className="field-label">图片类型</label>
        <div className="chips">
          {imageTypes.slice(0, 5).map((item) => (
            <label className={`chip ${imageType === item.value ? "is-selected" : ""}`} key={item.value}>
              <input
                type="radio"
                name="imageType"
                value={item.value}
                checked={imageType === item.value}
                onChange={() => setImageType(item.value)}
              />
              {item[locale]}
            </label>
          ))}
        </div>

        <label className="field-label">画面比例</label>
        <div className="ratio-grid">
          {aspectRatios.map((ratio) => (
            <AspectRatioOption
              key={ratio.value}
              {...ratio}
              selected={ratio.value === aspectRatio}
              onChange={setAspectRatio}
            />
          ))}
        </div>

        <label className="field-label">风格</label>
        <div className="chips">
          {styles.slice(0, 4).map((item) => (
            <label className={`chip ${style === item.value ? "is-selected" : ""}`} key={item.value}>
              <input
                type="radio"
                name="style"
                value={item.value}
                checked={style === item.value}
                onChange={() => setStyle(item.value)}
              />
              {item[locale]}
            </label>
          ))}
        </div>

        <label className="field-label">场景</label>
        <div className="chips">
          {scenes.slice(0, 4).map((item) => (
            <label className={`chip ${scene === item.value ? "is-selected" : ""}`} key={item.value}>
              <input
                type="radio"
                name="scene"
                value={item.value}
                checked={scene === item.value}
                onChange={() => setScene(item.value)}
              />
              {item[locale]}
            </label>
          ))}
        </div>

        <label className="field-label">留白 / 构图</label>
        <div className="chips">
          {whitespaceOptions.map((item) => (
            <label className={`chip ${whitespace === item.value ? "is-selected" : ""}`} key={item.value}>
              <input
                type="radio"
                name="whitespace"
                value={item.value}
                checked={whitespace === item.value}
                onChange={() => setWhitespace(item.value)}
              />
              {item[locale]}
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <h2>3. 参考图与补充要求</h2>
          <span className="tag">可选</span>
        </div>
        <input
          name="referenceImage"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(event) => setHasReferenceImage(Boolean(event.currentTarget.files?.[0]))}
        />
        <textarea
          name="additionalRequirements"
          value={additionalRequirements}
          onChange={(event) => setAdditionalRequirements(event.target.value)}
          aria-label="补充要求，例如：不要出现乱码文字、水印或低清细节。"
        />
      </section>

      <section className="panel prompt-preview">
        <h2>中文预览</h2>
        <pre>{preview?.promptPreviewZh}</pre>
        <h2>English reference</h2>
        <pre>{preview?.promptPreviewEn}</pre>
        <h2>实际提交内容</h2>
        <pre>{preview?.submittedPrompt}</pre>
      </section>

      {credits < 1 ? (
        <a className="button primary" href="/upgrade">积分不足，查看升级方案</a>
      ) : (
        <button className="button primary" type="submit">生成图片</button>
      )}
    </form>
  );
}
