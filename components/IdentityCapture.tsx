"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cameraError, captureSteps, motionCue, MAX_CLIP_BYTES, MOTION_DURATION_MS, type CardType, type CaptureStep } from "../lib/id-capture";
import "./identity-capture.css";

type Phase = "setup" | "camera" | "review" | "summary";
type Capture = { url: string; kind: "image" | "video" };
type Issue = "denied" | "missing" | "busy" | "failed" | "secure" | "unsupported" | "interrupted" | "recording";

export default function IdentityCapture() {
  const [ja, setJa] = useState(false);
  const t = (en: string, jp: string) => ja ? jp : en;
  const [phase, setPhase] = useState<Phase>("setup");
  const [card, setCard] = useState<CardType>("license");
  const [consent, setConsent] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [captures, setCaptures] = useState<Partial<Record<CaptureStep, Capture>>>({});
  const [ready, setReady] = useState(false);
  const [opening, setOpening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [issue, setIssue] = useState<Issue | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [light, setLight] = useState<"dark" | "bright" | "normal" | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const generation = useRef(0);
  const urls = useRef(new Set<string>());
  const heading = useRef<HTMLHeadingElement>(null);
  const steps = captureSteps(card);
  const step = steps[stepIndex];
  const current = captures[step];

  const names: Record<CaptureStep, string> = {
    front: t("Front", "表面"), edge: t("Edge / thickness", "厚み"),
    motion: t("Move up & down", "上下に動かす"), back: t("Back", "裏面"),
  };
  const instructions: Record<CaptureStep, string> = {
    front: t("Fit the front of the card inside the outline.", "カードの表面を枠に合わせてください。"),
    edge: t("Tilt the top edge away slightly so the card face and lower edge are visible together.", "上端を少し奥に傾け、表面と下側の厚みが同時に見えるようにしてください。"),
    motion: t("Keep the front facing the camera. Follow the cues to move the card gently up, then down.", "表面をカメラに向けたまま、指示に合わせてカードをゆっくり上、下に動かしてください。"),
    back: t("Turn the card over and fit all four corners inside the outline.", "カードを裏返し、四隅を枠の中に合わせてください。"),
  };
  const errors: Record<Issue, string> = {
    denied: t("Camera access was denied. Allow camera access in your browser settings, then retry.", "カメラが許可されていません。ブラウザの設定で許可し、再試行してください。"),
    missing: t("No usable camera was found. Try a device with a camera.", "利用できるカメラがありません。カメラ付き端末でお試しください。"),
    busy: t("The camera is in use or unavailable. Close other camera apps and retry.", "カメラが使用中か利用できません。他のカメラアプリを閉じて再試行してください。"),
    failed: t("The camera could not start. Please retry or use another browser.", "カメラを開始できませんでした。再試行するか別のブラウザをご利用ください。"),
    secure: t("Camera capture needs HTTPS or localhost. On a phone, open an HTTPS address.", "撮影にはHTTPSまたはlocalhostが必要です。スマートフォンではHTTPSのURLを開いてください。"),
    unsupported: t("This browser cannot record the movement clip. Try a current Safari or Chrome browser.", "このブラウザでは動画を記録できません。新しいSafariまたはChromeをご利用ください。"),
    interrupted: t("Capture paused because the camera stopped or you left the page. Retry this step.", "カメラ停止または画面移動により撮影を中断しました。この手順を再試行してください。"),
    recording: t("The capture could not be saved. Retake it; keep the recording under 25 MB.", "撮影を保存できませんでした。25 MB以下で撮り直してください。"),
  };

  // Invalidate pending permission requests and recorder callbacks before stopping tracks.
  function stopCamera() {
    generation.current += 1;
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    const activeRecorder = recorder.current;
    recorder.current = null;
    if (activeRecorder && activeRecorder.state !== "inactive") activeRecorder.stop();
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }

  function clearResources() {
    stopCamera();
    urls.current.forEach(url => URL.revokeObjectURL(url));
    urls.current.clear();
  }

  useEffect(() => {
    setJa(new URLSearchParams(window.location.search).get("lang") === "ja");
    function hide() {
      if (document.hidden) {
        stopCamera(); setReady(false); setBusy(false); setOpening(false); setRecording(false); setIssue("interrupted");
      }
    }
    function leave() { clearResources(); }
    function restore(event: PageTransitionEvent) { if (event.persisted) reset(); }
    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", leave);
    window.addEventListener("pageshow", restore);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", leave);
      window.removeEventListener("pageshow", restore);
      clearResources();
    };
  }, []);

  useEffect(() => { heading.current?.focus(); }, [phase, stepIndex]);

  // Advisory lighting sample only. It does not detect cards or prove document quality.
  useEffect(() => {
    if (!ready || phase !== "camera") return;
    const canvas = document.createElement("canvas");
    canvas.width = 32; canvas.height = 20;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    const id = window.setInterval(() => {
      const live = video.current;
      if (!ctx || !live?.videoWidth) return;
      ctx.drawImage(live, live.videoWidth * .2, live.videoHeight * .2, live.videoWidth * .6, live.videoHeight * .6, 0, 0, 32, 20);
      const pixels = ctx.getImageData(0, 0, 32, 20).data;
      let sum = 0;
      for (let i = 0; i < pixels.length; i += 4) sum += .2126 * pixels[i] + .7152 * pixels[i+1] + .0722 * pixels[i+2];
      const mean = sum / (pixels.length / 4);
      setLight(mean < 45 ? "dark" : mean > 235 ? "bright" : "normal");
    }, 700);
    return () => window.clearInterval(id);
  }, [ready, phase]);

  async function openCamera(nextFacing = facing) {
    stopCamera();
    const token = generation.current;
    setPhase("camera"); setIssue(null); setReady(false); setOpening(true); setBusy(false); setRecording(false); setLight(null);
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) { setIssue("secure"); setOpening(false); return; }
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: nextFacing }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
      if (generation.current !== token) { media.getTracks().forEach(track => track.stop()); return; }
      stream.current = media;
      media.getVideoTracks()[0].onended = () => {
        if (generation.current !== token) return;
        stopCamera(); setReady(false); setBusy(false); setRecording(false); setIssue("interrupted");
      };
      if (video.current) { video.current.srcObject = media; await video.current.play(); }
      if (generation.current === token) setOpening(false);
    } catch (error) {
      if (generation.current !== token) return;
      stopCamera(); setIssue(cameraError(error instanceof DOMException ? error.name : "")); setOpening(false);
    }
  }

  function saveCapture(blob: Blob, kind: Capture["kind"]) {
    const url = URL.createObjectURL(blob);
    urls.current.add(url);
    const previous = captures[step];
    if (previous) { URL.revokeObjectURL(previous.url); urls.current.delete(previous.url); }
    setCaptures(value => ({ ...value, [step]: { url, kind } }));
    stopCamera(); setReady(false); setBusy(false); setRecording(false); setConfirmed(false); setPhase("review");
  }

  async function takePhoto() {
    const live = video.current;
    if (!live?.videoWidth || !ready || busy) return;
    setBusy(true); setIssue(null);
    const token = generation.current;
    const canvas = document.createElement("canvas");
    // Keep the full unmirrored frame, including corners and edge evidence.
    canvas.width = live.videoWidth; canvas.height = live.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { setBusy(false); setIssue("recording"); return; }
    ctx.drawImage(live, 0, 0);
    canvas.toBlob(blob => {
      if (generation.current !== token) return;
      if (!blob?.size) { setBusy(false); setIssue("recording"); return; }
      saveCapture(blob, "image");
    }, "image/jpeg", .92);
  }

  function recordMotion() {
    if (!stream.current || !ready || busy) return;
    if (typeof MediaRecorder === "undefined") { setIssue("unsupported"); return; }
    const mime = ["video/webm;codecs=vp8", "video/mp4", "video/webm"].find(type => MediaRecorder.isTypeSupported(type));
    const token = generation.current;
    const chunks: Blob[] = [];
    let size = 0;
    let complete = false;
    try {
      const active = new MediaRecorder(stream.current, mime ? { mimeType: mime, videoBitsPerSecond: 3_000_000 } : undefined);
      recorder.current = active;
      active.ondataavailable = event => {
        if (generation.current !== token) return;
        size += event.data.size;
        if (size > MAX_CLIP_BYTES) {
          stopCamera(); setReady(false); setBusy(false); setRecording(false); setIssue("recording"); return;
        }
        if (event.data.size) chunks.push(event.data);
      };
      active.onerror = () => {
        if (generation.current !== token) return;
        stopCamera(); setReady(false); setBusy(false); setRecording(false); setIssue("recording");
      };
      active.onstop = () => {
        if (generation.current !== token || !complete) return;
        const blob = new Blob(chunks, { type: active.mimeType });
        if (!blob.size || blob.size > MAX_CLIP_BYTES) { stopCamera(); setReady(false); setBusy(false); setRecording(false); setIssue("recording"); return; }
        saveCapture(blob, "video");
      };
      setIssue(null); setBusy(true); setRecording(true); setElapsed(0);
      active.start(250);
      const start = performance.now();
      timer.current = setInterval(() => {
        const duration = performance.now() - start;
        setElapsed(Math.min(duration, MOTION_DURATION_MS));
        if (duration >= MOTION_DURATION_MS) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null; complete = true; active.stop();
        }
      }, 100);
    } catch { stopCamera(); setReady(false); setIssue("unsupported"); setBusy(false); setRecording(false); }
  }

  function reset() {
    clearResources(); setCaptures({}); setStepIndex(0); setPhase("setup"); setIssue(null);
    setReady(false); setBusy(false); setOpening(false); setRecording(false); setConsent(false); setConfirmed(false);
  }

  function retake() {
    // Recapture later views too, so an earlier retake cannot leave a mixed card set.
    const remaining = { ...captures };
    for (const item of steps.slice(stepIndex)) {
      const old = remaining[item];
      if (old) { URL.revokeObjectURL(old.url); urls.current.delete(old.url); }
      delete remaining[item];
    }
    setCaptures(remaining);
    setConfirmed(false);
    openCamera();
  }

  const cue = motionCue(elapsed);
  const cueText = cue === "hold" ? t("Hold the card steady", "カードを静止してください") : cue === "up" ? t("Move the card gently UP ↑", "カードをゆっくり上へ ↑") : t("Move the card gently DOWN ↓", "カードをゆっくり下へ ↓");

  return <main className="id-page" lang={ja ? "ja" : "en"}>
    <header className="id-header"><Link href="/" className="id-brand">GENECT <span>Buddy</span></Link><div><button onClick={() => setJa(!ja)} aria-label={t("Switch to Japanese", "英語に切り替え")}>{ja ? "English" : "日本語"}</button><Link href="/">{t("Back to Buddy", "Buddyに戻る")} ↗</Link></div></header>
    <div className="id-container">
      <p className="eyebrow">{t("IDENTITY · GUIDED CAPTURE", "本人確認 · ガイド付き撮影")}</p>
      <h1 ref={heading} tabIndex={-1}>{phase === "setup" ? t("Your card, clearly captured.", "カードを、はっきり撮影。") : phase === "summary" ? t("Capture review complete.", "撮影内容の確認が完了しました。") : `${stepIndex + 1}. ${names[step]}`}</h1>
      <p className="id-lead">{t("Front, visible edge, and a gentle movement. We will guide you through each view.", "表面、厚み、ゆっくりとした動き。各ステップをご案内します。")}</p>
      <div className="id-demo">{t("Sample cards only. Captures stay in this tab and are discarded when you leave. Nothing is uploaded.", "サンプルカード専用です。撮影内容はこのタブ内だけで保持し、画面を離れると破棄します。アップロードは行いません。")}</div>

      {phase === "setup" ? <section className="id-setup">
        <div className="id-paper"><h2>{t("Prepare your card", "カードを準備")}</h2><p>{t("Use a sample card on a dark, plain background in soft light. Remove the sleeve. Keep fingers away from text and corners.", "無地の暗い背景と柔らかい光で、サンプルカードをご用意ください。ケースを外し、文字や四隅を指で隠さないでください。")}</p>
          <fieldset><legend>{t("Card layout", "カードの種類")}</legend>{(["license", "residence", "my-number"] as CardType[]).map(type => <label className="id-option" key={type}><input type="radio" name="card" value={type} checked={card === type} onChange={() => setCard(type)}/><span>{type === "license" ? t("Driver's licence", "運転免許証") : type === "residence" ? t("Residence card", "在留カード") : t("My Number card — front only", "マイナンバーカード（表面のみ）")}</span></label>)}</fieldset>
          {card === "my-number" && <p className="id-warning">{t("Never show the reverse or your individual number. Keep the front facing the camera during the edge and movement steps.", "裏面や個人番号を映さないでください。厚み・動作の撮影でも、表面をカメラに向けたままにしてください。")}</p>}
          <label className="id-check"><input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>{t("I am using a sample card, and agree to capture photos and a silent 6-second clip in this tab.", "サンプルカードを使い、このタブで写真と6秒の無音動画を撮影することに同意します。")}</label>
          <button className="primary-button" disabled={!consent} onClick={() => openCamera()}>{t("Open camera", "カメラを開く")} →</button>
        </div>
        <aside className="id-paper id-explainer"><CardGuide edge/><h2>{t("Show the edge", "厚みが見える角度に")}</h2><p>{t("An angled view should show both the card face and its physical edge. Do not turn it fully over.", "斜めから表面とカードの端を同時に写します。完全に裏返さないでください。")}</p><p>{t("This capture tool supports visual review. It cannot measure thickness in millimetres, authenticate the card, or verify the holder.", "このツールは目視確認用の撮影を支援します。厚みの実測、真贋判定、所持者の本人確認は行いません。")}</p></aside>
      </section> : <>
        <ol className="id-steps" aria-label={t("Capture steps", "撮影手順")}>{steps.map((item, index) => <li key={item} aria-current={phase !== "summary" && index === stepIndex ? "step" : undefined}><span>{captures[item] ? "✓" : index + 1}</span>{names[item]}</li>)}</ol>
        {phase === "summary" ? <section className="id-paper">
          <h2>{t("Saved for this preview only", "このプレビュー内でのみ保持")}</h2><p>{t("No identity decision has been made. A verification provider or authorized reviewer must assess the card and its edge/movement evidence before real verification is possible.", "本人確認の判定は行っていません。本運用では、本人確認事業者または権限を持つ審査担当者による書類と厚み・動作の確認が必要です。")}</p>
          <div className="id-gallery">{steps.map(item => <article key={item}><h3>{names[item]}</h3>{captures[item]?.kind === "video" ? <video controls playsInline src={captures[item]?.url}/> : <img src={captures[item]?.url} alt={names[item]}/>}<button onClick={() => { setStepIndex(steps.indexOf(item)); setConfirmed(false); setPhase("review"); }}>{t("Review / retake", "確認・撮り直し")}</button></article>)}</div>
          <button className="secondary-button" onClick={reset}>{t("Discard captures & start again", "撮影内容を破棄してやり直す")}</button>
        </section> : <div className="id-workspace"><section className="id-paper id-capture-panel">
          <h2>{phase === "review" ? t("Check this capture", "撮影内容をご確認ください") : instructions[step]}</h2>
          {phase === "camera" ? <>
            <div className="id-camera-stage">
              <video ref={video} muted playsInline autoPlay onCanPlay={() => setReady(true)}/>
              {ready && <div className={`id-overlay ${step === "motion" && recording ? `id-${cue}` : ""}`}><CardGuide edge={step === "edge"}/></div>}
              {!ready && <div className="id-camera-placeholder"><CardGuide/ ><p>{opening ? t("Waiting for camera permission…", "カメラの許可を待っています…") : t("Camera is stopped", "カメラは停止しています")}</p></div>}
              {recording && <span className="id-recording">● {Math.ceil((MOTION_DURATION_MS - elapsed) / 1000)}s</span>}
            </div>
            <div className="id-live-status" role="status">{recording ? cueText : ready ? t("Camera ready. Check corners, focus, and reflections before capture.", "カメラ準備完了。四隅、ピント、反射をご確認ください。") : opening ? t("Allow camera access in the browser prompt.", "ブラウザの確認画面でカメラを許可してください。") : t("Open the camera to continue.", "カメラを開いて続けてください。")}</div>
            {ready && light && <p className="id-light">{light === "dark" ? t("Lighting hint: add more soft light.", "明るさのヒント：柔らかい光を追加してください。") : light === "bright" ? t("Lighting hint: reduce direct light or reflections.", "明るさのヒント：直射光や反射を減らしてください。") : t("Lighting sampled. Check text sharpness and glare yourself.", "明るさを確認しました。文字の鮮明さや反射はご自身で確認してください。")}</p>}
            <div className="id-actions">{ready ? <><button className="primary-button" disabled={busy} onClick={step === "motion" ? recordMotion : takePhoto}>{recording ? t("Recording…", "記録中…") : busy ? t("Processing…", "処理中…") : step === "motion" ? t("Record 6-second movement", "6秒の動作を記録") : t("Take photo", "撮影する")}</button><button disabled={busy} onClick={() => { const next = facing === "environment" ? "user" : "environment"; setFacing(next); openCamera(next); }}>{t("Switch camera", "カメラ切替")}</button></> : !opening && <button className="primary-button" onClick={() => openCamera()}>{t("Retry camera", "カメラを再試行")}</button>}</div>
          </> : <>
            <div className="id-review-media">{current?.kind === "video" ? <video src={current.url} controls playsInline/> : <img src={current?.url} alt={names[step]}/>}</div>
            <label className="id-check"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/>{step === "edge" ? t("I can see the card face and its physical edge clearly in this image.", "この画像で表面とカードの厚みがはっきり見えます。") : step === "motion" ? t("I played the clip: the card remains visible while moving up and down.", "動画を再生し、上下に動く間もカードが見えていることを確認しました。") : t("All four corners and the printed details are visible, without blur or glare.", "四隅と印字が見え、ぼけや反射がないことを確認しました。")}</label>
            <div className="id-actions"><button className="primary-button" disabled={!confirmed} onClick={() => { if (stepIndex === steps.length - 1) setPhase("summary"); else { setStepIndex(index => index + 1); setConfirmed(false); openCamera(); } }}>{t("Use this capture", "この撮影内容を使用")} →</button><button onClick={retake}>{t("Retake", "撮り直す")}</button></div>
          </>}
          {issue && <p className="id-error" role="alert">{errors[issue]}</p>}
        </section><aside className="id-paper id-tips"><h2>{t("A clear view, every time", "はっきり写すために")}</h2><ul><li>{t("Keep all four corners inside the guide.", "四隅をガイドの内側に合わせます。")}</li><li>{t("Hold the phone still; move only the card.", "スマートフォンを固定し、カードだけ動かします。")}</li><li>{t("Avoid flash, shadows, and reflective sleeves.", "フラッシュ、影、反射するケースを避けます。")}</li></ul>{step === "edge" && <><CardGuide edge/><p>{t("The angled outline is a positioning guide. Thickness is checked visually in your capture; it is not automatically measured.", "斜めの枠は位置合わせのガイドです。厚みは撮影画像で目視確認し、自動計測は行いません。")}</p></>}{step === "motion" && <><p>{t("6 seconds: hold → move up → move down. Keep the front visible throughout.", "6秒：静止 → 上へ → 下へ。常に表面が見えるようにしてください。")}</p><p>{t("Recording time is not proof of movement or authenticity. Replay the clip and retake if needed.", "記録時間は動作や真正性の証明ではありません。動画を再生し、必要に応じて撮り直してください。")}</p></>}{card === "my-number" && <p className="id-warning">{t("My Number: never turn the card over or show your number.", "マイナンバーカードは裏返さず、個人番号を映さないでください。")}</p>}<button className="id-discard" onClick={reset}>{t("Cancel & discard captures", "中止して撮影内容を破棄")}</button></aside></div>}
      </>}
    </div>
  </main>;
}

function CardGuide({ edge = false }: { edge?: boolean }) {
  return <svg className="id-card-guide" viewBox="0 0 360 240" aria-hidden="true">{edge ? <><path d="M58 62 302 62 332 157 28 157Z"/><path d="M28 157v12h304v-12M58 62v9M302 62v9"/><path className="id-edge-highlight" d="M28 163h304"/><path d="M80 88h51v39H80zM155 93h105M155 110h80"/></> : <><rect x="25" y="22" width="310" height="196" rx="14"/><path d="M25 55V36q0-14 14-14h20M301 22h20q14 0 14 14v19M335 185v19q0 14-14 14h-20M59 218H39q-14 0-14-14v-19"/></>}</svg>;
}
